import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss()
  ],
  server: {
    host: true,
    port: 6900,
    watch: {
      usePolling: true
    }
  },
  build: {
    watch: {
      chokidar: {
        usePolling: true
      },
      emptyOutDir: true
    },
    sourcemap: true,
    minify: false
  },
  esbuild: {
    sourcemap: true
  }
})
