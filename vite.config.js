import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    // ដាក់ Proxy ទៅ Backend (FastAPI) ដើម្បីចៀសវាង CORS ក្នុងពេល Dev
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // បើ Backend មិនទាន់បើក -> ផ្ញើ JSON error ច្បាស់លាស់មក Frontend
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            if (res && res.writeHead && res.end) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  detail:
                    'Backend is not running. Start the backend on port 8000 first.',
                })
              );
            }
          });
        },
      },
      // បម្រើរូបភាពដែល Upload ពី backend
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})

