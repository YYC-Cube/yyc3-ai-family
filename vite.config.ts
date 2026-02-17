import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  // Base path for GitHub Pages (使用仓库名作为路径)
  // 本地开发时使用 '/', GitHub Pages 部署时使用 '/yyc3-ai-family/'
  const base = mode === 'production' ? '/yyc3-ai-family/' : '/'

  return {
    base,
    plugins: [
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
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
