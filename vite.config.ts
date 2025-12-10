import { defineConfig, Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import svgr from 'vite-plugin-svgr'
import { readFileSync } from 'fs'

// Plugin to import .md files as raw strings (similar to raw-loader in webpack)
const rawLoader = (): Plugin => ({
  name: 'raw-loader',
  transform(_code, id) {
    if (id.endsWith('.md')) {
      const content = readFileSync(id, 'utf-8')
      return {
        code: `export default ${JSON.stringify(content)}`,
        map: null,
      }
    }
    return null
  },
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    rawLoader(),
    svgr({
      // svgr options: https://react-svgr.com/docs/options/
      svgrOptions: {
        exportType: 'default',
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg',
    }),
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: false,
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  define: {
    global: 'globalThis',
  },
})
