import { fileURLToPath, URL } from 'node:url'
import { createSolidBase } from '@kobalte/solidbase/config'
import { solidStart } from '@solidjs/start/config'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import { docsTheme } from './src/docs-theme/theme'
import { playgroundRegistryPlugin } from './playground-registry-plugin'
import { solidbaseDefaultThemeJsx } from './solidbase-default-theme-jsx'
import { solidbaseDefaultThemePreview } from './solidbase-default-theme-preview'
import { docsThemeConfig } from './solidbase-theme-config'

const solidBase = createSolidBase(docsTheme)
const docsBase = process.env.GITHUB_PAGES === 'true' ? '/ant-design-solid/' : '/'
const docsSsr = process.env.GITHUB_PAGES === 'true' ? false : true

export default defineConfig(({ command }) => ({
  base: docsBase,
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
    playgroundRegistryPlugin(),
    solidStart(solidBase.startConfig({ ssr: docsSsr })),
    command === 'build' && nitro({ prerender: { crawlLinks: true } }),
    tailwindcss(),
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
}))
