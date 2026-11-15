import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Permintaan ke /api dan /storage diteruskan ke Laravel, jadi tidak perlu mengatur CORS saat development.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/storage': 'http://127.0.0.1:8000',
    },
  },
})