import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  build: {
    target: 'esnext'
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/assistant': { target: 'http://localhost:8080', changeOrigin: true },
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // ⬇️ BỎ QUA PROXY cho file tĩnh JSON (để Vite serve từ /public)
        bypass(req) {
          if (
              req.method === 'GET' &&
              (req.url?.startsWith('/api/resume.json') ||
                  req.url?.startsWith('/api/post.json'))
          ) {
            return req.url // Vite sẽ phục vụ từ thư mục public/
          }
          return false // các route khác vẫn proxy sang 8080
        }
      }
    }
  }
})
