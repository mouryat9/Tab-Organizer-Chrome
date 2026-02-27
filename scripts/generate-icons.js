import { writeFileSync, mkdirSync } from 'fs'
import { deflateSync } from 'zlib'

function createIcon(size) {
  const width = size
  const height = size
  const pixels = Buffer.alloc(width * height * 4, 0)

  function setPixel(x, y, r, g, b, a) {
    if (x < 0 || x >= width || y < 0 || y >= height) return
    const idx = (y * width + x) * 4
    const srcA = a / 255
    const dstA = pixels[idx + 3] / 255
    const outA = srcA + dstA * (1 - srcA)
    if (outA === 0) return
    pixels[idx] = Math.round((r * srcA + pixels[idx] * dstA * (1 - srcA)) / outA)
    pixels[idx + 1] = Math.round((g * srcA + pixels[idx + 1] * dstA * (1 - srcA)) / outA)
    pixels[idx + 2] = Math.round((b * srcA + pixels[idx + 2] * dstA * (1 - srcA)) / outA)
    pixels[idx + 3] = Math.round(outA * 255)
  }

  function fillRoundedRect(rx, ry, rw, rh, radius, r, g, b, a = 255) {
    for (let py = Math.floor(ry); py < Math.ceil(ry + rh); py++) {
      for (let px = Math.floor(rx); px < Math.ceil(rx + rw); px++) {
        const cx = px + 0.5 - rx
        const cy = py + 0.5 - ry
        let dist = -1

        if (cx < radius && cy < radius) {
          dist = Math.sqrt((radius - cx) ** 2 + (radius - cy) ** 2) - radius
        } else if (cx > rw - radius && cy < radius) {
          dist = Math.sqrt((cx - (rw - radius)) ** 2 + (radius - cy) ** 2) - radius
        } else if (cx < radius && cy > rh - radius) {
          dist = Math.sqrt((radius - cx) ** 2 + (cy - (rh - radius)) ** 2) - radius
        } else if (cx > rw - radius && cy > rh - radius) {
          dist = Math.sqrt((cx - (rw - radius)) ** 2 + (cy - (rh - radius)) ** 2) - radius
        }

        if (dist < -0.5) {
          setPixel(px, py, r, g, b, a)
        } else if (dist < 0.5) {
          const coverage = Math.max(0, Math.min(1, 0.5 - dist))
          setPixel(px, py, r, g, b, Math.round(a * coverage))
        }
      }
    }
  }

  const s = size / 128

  // Background: dark rounded square
  fillRoundedRect(0, 0, size, size, Math.round(24 * s), 22, 27, 51) // #161b33

  // Inner padding
  const pad = Math.round(16 * s)
  const innerSize = size - pad * 2

  // Subtle inner panel
  fillRoundedRect(pad, pad, innerSize, innerSize, Math.round(14 * s), 26, 33, 62, 180) // #1a213e semi-transparent

  // 4 colored tab-group tiles in a 2x2 grid
  const gridPad = Math.round(24 * s)
  const gap = Math.max(Math.round(6 * s), size <= 16 ? 2 : 3)
  const cellW = Math.round((size - gridPad * 2 - gap) / 2)
  const cellH = Math.round((size - gridPad * 2 - gap) / 2)
  const cellR = Math.max(Math.round(6 * s), 2)

  // Top-left: accent pink/red (#e94560)
  fillRoundedRect(gridPad, gridPad, cellW, cellH, cellR, 233, 69, 96)
  // Top-right: blue (#4285f4)
  fillRoundedRect(gridPad + cellW + gap, gridPad, cellW, cellH, cellR, 66, 133, 244)
  // Bottom-left: green (#34a853)
  fillRoundedRect(gridPad, gridPad + cellH + gap, cellW, cellH, cellR, 52, 168, 83)
  // Bottom-right: amber/yellow (#fbbc04)
  fillRoundedRect(gridPad + cellW + gap, gridPad + cellH + gap, cellW, cellH, cellR, 251, 188, 4)

  // Small white horizontal lines inside each cell (tab indicators) — only for larger sizes
  if (size >= 48) {
    const lineH = Math.max(Math.round(2 * s), 1)
    const lineMarginX = Math.round(6 * s)
    const lineMarginY = Math.round(8 * s)
    const lineGap = Math.round(5 * s)
    const lineAlpha = 200

    const cells = [
      [gridPad, gridPad],
      [gridPad + cellW + gap, gridPad],
      [gridPad, gridPad + cellH + gap],
      [gridPad + cellW + gap, gridPad + cellH + gap],
    ]

    for (const [cx, cy] of cells) {
      for (let i = 0; i < 3; i++) {
        const lx = cx + lineMarginX
        const ly = cy + lineMarginY + i * lineGap
        const lw = cellW - lineMarginX * 2 - (i === 2 ? Math.round(8 * s) : 0) // shorter last line
        if (ly + lineH < cy + cellH - 2) {
          fillRoundedRect(lx, ly, lw, lineH, Math.round(1 * s), 255, 255, 255, lineAlpha)
        }
      }
    }
  } else if (size >= 32) {
    // Simpler: just 2 lines per cell
    const lineH = Math.max(Math.round(1.5 * s), 1)
    const lineMarginX = Math.round(4 * s)
    const lineMarginY = Math.round(6 * s)
    const lineGap = Math.round(5 * s)

    const cells = [
      [gridPad, gridPad],
      [gridPad + cellW + gap, gridPad],
      [gridPad, gridPad + cellH + gap],
      [gridPad + cellW + gap, gridPad + cellH + gap],
    ]

    for (const [cx, cy] of cells) {
      for (let i = 0; i < 2; i++) {
        const lx = cx + lineMarginX
        const ly = cy + lineMarginY + i * lineGap
        const lw = cellW - lineMarginX * 2
        if (ly + lineH < cy + cellH - 1) {
          fillRoundedRect(lx, ly, lw, lineH, 1, 255, 255, 255, 180)
        }
      }
    }
  }

  // Encode as PNG (RGBA, color type 6)
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
  ihdrData[8] = 8   // bit depth
  ihdrData[9] = 6   // color type: RGBA
  ihdrData[10] = 0   // compression
  ihdrData[11] = 0   // filter
  ihdrData[12] = 0   // interlace

  const ihdr = createChunk('IHDR', ihdrData)

  // Build raw image data with filter bytes
  const rowSize = 1 + width * 4  // filter byte + RGBA
  const rawData = Buffer.alloc(rowSize * height)
  for (let y = 0; y < height; y++) {
    rawData[y * rowSize] = 0  // no filter
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4
      const dstIdx = y * rowSize + 1 + x * 4
      rawData[dstIdx] = pixels[srcIdx]
      rawData[dstIdx + 1] = pixels[srcIdx + 1]
      rawData[dstIdx + 2] = pixels[srcIdx + 2]
      rawData[dstIdx + 3] = pixels[srcIdx + 3]
    }
  }

  const compressed = deflateSync(rawData)
  const idat = createChunk('IDAT', compressed)
  const iend = createChunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdr, idat, iend])
}

mkdirSync('public/icons', { recursive: true })

for (const size of [16, 32, 48, 128]) {
  writeFileSync(`public/icons/icon${size}.png`, createIcon(size))
}

console.log('Tab Organizer icons generated!')
