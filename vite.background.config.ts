import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/background/service-worker.ts'),
      output: {
        entryFileNames: 'service-worker.js',
        format: 'es',
      },
    },
  },
})
