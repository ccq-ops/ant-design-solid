import { fileURLToPath, URL } from 'node:url'
import { createSolidBase } from '@kobalte/solidbase/config'
import defaultTheme from '@kobalte/solidbase/default-theme'
import { solidStart } from '@solidjs/start/config'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import { solidbaseDefaultThemeJsx } from './solidbase-default-theme-jsx'
import { solidbaseDefaultThemePreview } from './solidbase-default-theme-preview'
import { docsThemeConfig } from './solidbase-theme-config'

const solidBase = createSolidBase(defaultTheme)

export default defineConfig(({ command }) => ({
  oxc: { jsx: 'preserve' },
  plugins: [
    solidBase.plugin({
      title: 'Ant Design Solid',
      description: 'SolidJS implementation of Ant Design components.',
      lang: 'en',
      lastUpdated: { dateStyle: 'short', timeStyle: 'short' },
      markdown: {
        expressiveCode: {
          languageSwitcher: false,
        },
      },
      themeConfig: docsThemeConfig,
    }),
    solidbaseDefaultThemeJsx(),
    solidbaseDefaultThemePreview(),
    solidStart(solidBase.startConfig({ ssr: true })),
    command === 'build' && nitro({ prerender: { crawlLinks: true } }),
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
      'solid-motionone': fileURLToPath(
        new URL(
          '../../packages/components/node_modules/solid-motionone/dist/index.js',
          import.meta.url,
        ),
      ),
    },
  },
}))
