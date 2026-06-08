import { fileURLToPath, URL } from 'node:url'
import mdx from '@mdx-js/rollup'
import { demoBlockRemarkPlugin } from './src/mdx-demo-block-remark-plugin'
import remarkGfm from 'remark-gfm'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    mdx({
      jsxImportSource: 'solid-js/h',
      providerImportSource: '/src/mdx-components',
      remarkPlugins: [remarkGfm, demoBlockRemarkPlugin],
    }),
    solid(),
    tailwindcss(),
  ],
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
