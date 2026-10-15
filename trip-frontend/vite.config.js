import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'scrappier-anthony-adnate.ngrok-free.dev'
    ],
    // TAMBAHIN PROXY INI PREN
    proxy: {
      '/api': {
        target: 'http://192.168.56.1:5000', // Ini nembak ke Backend lu
        changeOrigin: true
      }
    }
  }
})