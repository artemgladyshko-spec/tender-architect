import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/run-analysis": "http://localhost:3001",
      "/upload-tor": "http://localhost:3001",
      "/download-proposal": "http://localhost:3001",
    }
  },
  plugins: [react()],
})
