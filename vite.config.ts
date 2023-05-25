import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~react-dates': 'react-dates',
    },
  },
  server: {
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/login': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
})
