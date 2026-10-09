import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

const sourceRoot = fileURLToPath(new URL('./src', import.meta.url))
const componentEntries = Object.fromEntries(
  readdirSync(sourceRoot, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && existsSync(path.join(sourceRoot, entry.name, 'index.ts')),
    )
    .map((entry) => [`${entry.name}/index`, path.join(sourceRoot, entry.name, 'index.ts')]),
)

const externalPackages = [
  'solid-js',
  '@solid-ant-design/theme',
  '@solid-ant-design/cssinjs',
  '@solid-ant-design/icons',
  '@tanstack/solid-virtual',
  'dayjs',
  'qrcode-generator',
]

const external = (id: string) =>
  externalPackages.some((packageName) => id === packageName || id.startsWith(`${packageName}/`))

function addDayjsPluginExtension(code: string) {
  return code.replace(/(dayjs\/plugin\/[^'"]+)(?=['"])/g, (specifier) =>
    specifier.endsWith('.js') ? specifier : `${specifier}.js`,
  )
}

export default defineConfig({
  plugins: [
    solid(),
    {
      name: 'add-dayjs-plugin-extension',
      renderChunk: addDayjsPluginExtension,
    },
  ],
  resolve: {
    alias: {
      '@solid-ant-design/theme': fileURLToPath(new URL('../theme/src', import.meta.url)),
      '@solid-ant-design/cssinjs': fileURLToPath(new URL('../cssinjs/src', import.meta.url)),
      '@solid-ant-design/icons': fileURLToPath(new URL('../icons/src', import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: {
        index: path.join(sourceRoot, 'index.ts'),
        ...componentEntries,
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external,
      output: {
        exports: 'named',
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    },
  },
})
