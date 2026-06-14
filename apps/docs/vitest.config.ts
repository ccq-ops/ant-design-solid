import { fileURLToPath, URL } from 'node:url'
import { createSolidBase } from '@kobalte/solidbase/config'
import defaultTheme from '@kobalte/solidbase/default-theme'
import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'
import { solidbaseDefaultThemeJsx } from './solidbase-default-theme-jsx'
import { docsThemeConfig } from './solidbase-theme-config'

const solidBase = createSolidBase(defaultTheme)

export default defineConfig({
  oxc: { jsx: 'preserve' },
  plugins: [
    solidBase.plugin({
      title: 'Ant Design Solid',
      description: 'SolidJS implementation of Ant Design components.',
      lang: 'en',
      lastUpdated: false,
      markdown: {
        expressiveCode: {
          languageSwitcher: false,
        },
      },
      themeConfig: docsThemeConfig,
    }),
    solidbaseDefaultThemeJsx(),
    solid({ extensions: ['.md', '.mdx'] }),
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
