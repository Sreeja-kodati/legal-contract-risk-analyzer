import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/upload': 'http://localhost:4000',
      '/ingest': 'http://localhost:4000',
      '/ask': 'http://localhost:4000',
      '/compare': 'http://localhost:4000',
      '/history': 'http://localhost:4000',
    },
  },
})
