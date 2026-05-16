import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      port: 5175,
      proxy: {
        // API proxy — injects auth key server-side so it never reaches the client bundle
        '/liquipedia-api': {
          target: 'https://api.liquipedia.net/api/v3',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/liquipedia-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Apikey ${env.VITE_LIQUIPEDIA_API_KEY}`)
              proxyReq.setHeader('User-Agent', 'EsporMax/1.0 (emiruzel01@gmail.com)')
            })
          },
        },
        // Images are loaded directly by the browser with referrerpolicy="no-referrer"
        // No image proxy needed — avoids sharing the API rate-limit IP
        '/pandascore': {
          target: 'https://api.pandascore.co',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/pandascore/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('Authorization', `Bearer ${env.VITE_PANDASCORE_API_KEY}`)
            })
          },
        },
        // LoL Esports — general gateway (teams, standings, schedule)
        '/lolesports-api': {
          target: 'https://esports-api.lolesports.com/persisted/gw',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/lolesports-api/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('x-api-key', '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z')
            })
          },
        },
        // LoL Esports — Global Power Rankings (different base path than gw)
        '/lolesports-gpr': {
          target: 'https://esports-api.lolesports.com/persisted/gpr',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/lolesports-gpr/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              proxyReq.setHeader('x-api-key', '0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z')
            })
          },
        },
      },
    },
  }
})
