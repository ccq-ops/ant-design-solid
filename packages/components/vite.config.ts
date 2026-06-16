import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid()],
  resolve: {
    alias: {
      '@solid-ant-design/theme': fileURLToPath(new URL('../theme/src', import.meta.url)),
      '@solid-ant-design/cssinjs': fileURLToPath(new URL('../cssinjs/src', import.meta.url)),
      '@solid-ant-design/icons': fileURLToPath(new URL('../icons/src', import.meta.url)),
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
        '@solid-ant-design/theme',
        '@solid-ant-design/cssinjs',
        '@solid-ant-design/icons',
      ],
    },
  },
})
