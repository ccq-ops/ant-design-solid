import { fileURLToPath, URL } from 'node:url'
import { solidStart } from '@solidjs/start/config'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'
import { componentsChangelogPlugin } from './plugins/components-changelog-plugin'
import { playgroundRegistryPlugin } from './plugins/playground-registry-plugin'
import { solidbaseDefaultThemeJsx } from './plugins/solidbase-default-theme-jsx'
import { solidbaseDefaultThemePreview } from './plugins/solidbase-default-theme-preview'
import { solidBase, solidbaseThemePlugin } from './plugins/solidbase-theme-plugin'

const docsBase = process.env.GITHUB_PAGES === 'true' ? '/ant-design-solid/' : '/'
const docsSsr = process.env.GITHUB_PAGES === 'true' ? false : true

export default defineConfig(({ command }) => {
  return {
    base: docsBase,
    oxc: { jsx: 'preserve' },
    plugins: [
      solidbaseThemePlugin,
      solidbaseDefaultThemeJsx(),
      solidbaseDefaultThemePreview(),
      componentsChangelogPlugin(),
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
        '@kobalte/solidbase/mdx': fileURLToPath(
          new URL('./node_modules/@kobalte/solidbase/dist/mdx.js', import.meta.url),
        ),
        'solid-motionone': fileURLToPath(
          new URL(
            '../../packages/components/node_modules/solid-motionone/dist/index.js',
            import.meta.url,
          ),
        ),
      },
    },
  }
})
