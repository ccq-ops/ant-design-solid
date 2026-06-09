import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import { createDocsVitePlugins } from './plugins'

export default defineConfig({
  oxc: { jsx: 'preserve' },
  plugins: createDocsVitePlugins(),
  resolve: {
    alias: {
      '@ant-design-solid/core': fileURLToPath(
        new URL('../../packages/components/src', import.meta.url),
      ),
      '@ant-design-solid/cssinjs': fileURLToPath(
        new URL('../../packages/cssinjs/src', import.meta.url),
      ),
      '@ant-design-solid/theme': fileURLToPath(
        new URL('../../packages/theme/src', import.meta.url),
      ),
      '@ant-design-solid/icons': fileURLToPath(
        new URL('../../packages/icons/src', import.meta.url),
      ),
    },
  },
  server: { port: 5173 },
})
