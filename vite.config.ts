import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  // Base path for GitHub Pages
  // 使用自定义域名 https://ai.yyccube.xin/，base 应设置为 '/'
  // 本地开发和生产环境都使用 '/'
  const base = '/'

  return {
    base,
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'pwa/icon-*.png'],
        manifest: {
          name: 'YYC3 AI-Family',
          short_name: 'YYC3',
          description: 'Family AI - 人机协同 · 智爱同行。YYC3 AI-Family 是一个以赛博朋克美学为核心的 DevOps 智能平台。',
          theme_color: '#0EA5E9',
          background_color: '#0F172A',
          display: 'standalone',
          orientation: 'portrait-primary',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: 'pwa/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          shortcuts: [
            {
              name: 'AI 对话',
              short_name: '对话',
              description: '快速打开 AI 对话界面',
              url: '/',
              icons: [{ src: 'pwa/icon-192x192.png', sizes: '192x192' }]
            },
            {
              name: '系统设置',
              short_name: '设置',
              description: '快速打开系统设置',
              url: '/?tab=settings',
              icons: [{ src: 'pwa/icon-192x192.png', sizes: '192x192' }]
            },
            {
              name: '集群监控',
              short_name: '监控',
              description: '快速打开集群监控',
              url: '/?tab=cluster',
              icons: [{ src: 'pwa/icon-192x192.png', sizes: '192x192' }]
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        // Alias @ to be src directory
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: parseInt(env.VITE_APP_PORT || '3113', 10),
      host: true,
      strictPort: true,
    },
    preview: {
      port: parseInt(env.VITE_APP_PORT || '3115', 10),
      host: true,
      strictPort: true,
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
