import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      '@ant-design-solid/theme': fileURLToPath(new URL('./packages/theme/src', import.meta.url)),
      '@ant-design-solid/cssinjs': fileURLToPath(
        new URL('./packages/cssinjs/src', import.meta.url),
      ),
      '@ant-design-solid/icons': fileURLToPath(new URL('./packages/icons/src', import.meta.url)),
      '@ant-design-solid/core': fileURLToPath(
        new URL('./packages/components/src', import.meta.url),
      ),
      'solid-motionone': fileURLToPath(
        new URL(
          './packages/components/node_modules/solid-motionone/dist/index.js',
          import.meta.url,
        ),
      ),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    css: false,
    coverage: {
      reporter: ['text', 'html'],
    },
  },
})
