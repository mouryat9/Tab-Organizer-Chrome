import { cpSync, rmSync, existsSync } from 'fs'

cpSync('public/manifest.json', 'dist/manifest.json')
cpSync('public/icons', 'dist/icons', { recursive: true })

// Clean up stray files from Vite
if (existsSync('dist/vite.svg')) rmSync('dist/vite.svg')

console.log('Copied manifest.json and icons to dist/')
