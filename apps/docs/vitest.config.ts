import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'
import { componentsChangelogPlugin } from './plugins/components-changelog-plugin'
import { playgroundRegistryPlugin } from './plugins/playground-registry-plugin'
import { solidbaseDefaultThemeJsx } from './plugins/solidbase-default-theme-jsx'
import { solidbaseDefaultThemePreview } from './plugins/solidbase-default-theme-preview'
import { solidbaseThemePlugin } from './plugins/solidbase-theme-plugin'

export default defineConfig({
  oxc: { jsx: 'preserve' },
  plugins: [
    solidbaseThemePlugin,
    solidbaseDefaultThemeJsx(),
    solidbaseDefaultThemePreview(),
    componentsChangelogPlugin(),
    playgroundRegistryPlugin(),
    solid({ extensions: ['.md', '.mdx'] }),
  ],
  resolve: {
    alias: {
      '@solid-ant-design/core': fileURLToPath(
        new URL('../../packages/components/src', import.meta.url),
      ),
      '@solid-ant-design/cssinjs': fileURLToPath(
        new URL('../../packages/cssinjs/src', import.meta.url),
      ),
      '@solid-ant-design/theme': fileURLToPath(
        new URL('../../packages/theme/src', import.meta.url),
      ),
      '@solid-ant-design/icons': fileURLToPath(
        new URL('../../packages/icons/src', import.meta.url),
      ),
      'solid-motionone': fileURLToPath(
        new URL(
          '../../packages/components/node_modules/solid-motionone/dist/index.js',
          import.meta.url,
        ),
      ),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    css: false,
    setupFiles: ['./src/test-utils/setup-dom.ts'],
    server: {
      deps: {
        inline: ['@ant-design/colors', '@bprogress/core'],
      },
    },
    coverage: {
      reporter: ['text', 'html'],
    },
  },
})
