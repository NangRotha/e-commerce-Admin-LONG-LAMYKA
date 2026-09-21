import { defineConfig, loadEnv } from 'vite'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Backend (FastAPI) ពិតប្រាកដនៅលើ Render — ប្រើជា Default សម្រាប់ Dev Server Proxy
// អាចប្តូរបានតាម VITE_API_URL ក្នុង .env (ឧ. http://localhost:8000)
const DEFAULT_API_BASE = 'https://e-commerce-backend-long-lamyka.onrender.com'

// ថតឫសនៃ Project (vite.config.js ស្ថិតនៅ root) — ដើម្បីអានឯកសារ .env
const PROJECT_ROOT = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, PROJECT_ROOT, '')

  // ប្រភពតែមួយ (single source of truth) សម្រាប់ Backend URL ទាំង Dev និង Production
  const apiTarget = (env.VITE_API_URL || DEFAULT_API_BASE).replace(/\/$/, '')
  const wsTarget = (env.VITE_WS_URL || apiTarget.replace(/^http/i, 'ws')).replace(/\/$/, '')

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5174,
      // ដាក់ Proxy ទៅ Backend ដើម្បីចៀសវាង CORS និងបម្រើរូបភាពក្នុងពេល Dev
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          // បើ Backend ភ្ជាប់មិនបាន -> ផ្ញើ JSON error ច្បាស់លាស់មក Frontend
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              if (res && res.writeHead && res.end) {
                res.writeHead(502, { 'Content-Type': 'application/json' })
                res.end(
                  JSON.stringify({
                    detail: `Backend is unreachable at ${apiTarget}. Check your internet connection or start the backend locally (cd backend-e-online && .venv/bin/uvicorn app.main:app --reload).`,
                  })
                )
              }
            })
          },
        },
        // បម្រើរូបភាពដែល Upload ពី backend
        '/uploads': {
          target: apiTarget,
          changeOrigin: true,
        },
        // WebSocket — real-time (orders_changed / products_changed / alerts_changed ...)
        '/ws': {
          target: wsTarget,
          ws: true,
          changeOrigin: true,
        },
      },
    },
  }
})

