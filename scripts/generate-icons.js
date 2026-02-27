import { writeFileSync, mkdirSync } from 'fs'
import { deflateSync } from 'zlib'

function createPNG(size) {
  const width = size
  const height = size

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  function crc32(data) {
    let crc = 0xFFFFFFFF
    for (let i = 0; i < data.length; i++) {
      crc ^= data[i]
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
      }
    }
    return (crc ^ 0xFFFFFFFF) >>> 0
  }

  function createChunk(type, data) {
    const length = Buffer.alloc(4)
    length.writeUInt32BE(data.length)
    const typeBuffer = Buffer.from(type)
    const crcData = Buffer.concat([typeBuffer, data])
    const crcBuffer = Buffer.alloc(4)
    crcBuffer.writeUInt32BE(crc32(crcData))
    return Buffer.concat([length, typeBuffer, data, crcBuffer])
  }

  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = 8
  ihdrData[9] = 2
  ihdrData[10] = 0
  ihdrData[11] = 0
  ihdrData[12] = 0

  const ihdr = createChunk('IHDR', ihdrData)

  const rowSize = 1 + width * 3
  const rawData = Buffer.alloc(rowSize * height)
  for (let y = 0; y < height; y++) {
    rawData[y * rowSize] = 0
    for (let x = 0; x < width; x++) {
      const offset = y * rowSize + 1 + x * 3
      const t = (width + height > 2) ? (x + y) / (width + height - 2) : 0
      rawData[offset] = Math.round(233 * (1 - t) + 15 * t)
      rawData[offset + 1] = Math.round(69 * (1 - t) + 52 * t)
      rawData[offset + 2] = Math.round(96 * (1 - t) + 96 * t)
    }
  }

  const compressed = deflateSync(rawData)
  const idat = createChunk('IDAT', compressed)
  const iend = createChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdr, idat, iend])
}

mkdirSync('public/icons', { recursive: true })

for (const size of [16, 32, 48, 128]) {
  writeFileSync(`public/icons/icon${size}.png`, createPNG(size))
}

console.log('PNG icons generated!')
