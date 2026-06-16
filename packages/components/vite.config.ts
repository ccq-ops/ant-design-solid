import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      '@ant-design-solid/theme': fileURLToPath(new URL('../theme/src', import.meta.url)),
      '@ant-design-solid/cssinjs': fileURLToPath(new URL('../cssinjs/src', import.meta.url)),
      '@ant-design-solid/solid-icons': fileURLToPath(new URL('../icons/src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      external: [
        'solid-js',
        'solid-js/web',
        '@ant-design-solid/theme',
        '@ant-design-solid/cssinjs',
        '@ant-design-solid/solid-icons',
      ],
    },
  },
})
