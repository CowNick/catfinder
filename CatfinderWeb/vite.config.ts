import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 808,
    proxy: {
      "/api": {
        target: "http://localhost:5064",
        changeOrigin: true
      }
    }
  },
  plugins: [
    vue(),
    vueDevTools(),
  ],
  envPrefix:"APP_",
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
