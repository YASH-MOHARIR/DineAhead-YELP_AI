import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/yelp': {
        target: 'https://api.yelp.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/yelp/, ''),
        secure: true,
      }
    }
  }
})