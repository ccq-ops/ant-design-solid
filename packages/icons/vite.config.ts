import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

const external = (id: string) =>
  id === 'solid-js' || id === 'solid-js/web' || id.startsWith('@ant-design/icons-svg/')

function addIconsSvgExtension(code: string) {
  return code.replace(/(@ant-design\/icons-svg\/es\/asn\/[^'"]+)(?=['"])/g, (specifier) =>
    specifier.endsWith('.js') ? specifier : `${specifier}.js`,
  )
}

export default defineConfig({
  plugins: [
    solid(),
    {
      name: 'add-icons-svg-extension',
      renderChunk: addIconsSvgExtension,
    },
  ],
  build: {
    lib: {
      entry: 'src/index.tsx',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external,
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
  },
})
