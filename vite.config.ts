import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Development only; deployed requests run through Vercel's /api function.
      '/api': 'http://localhost:3001',
    },
  },
})
