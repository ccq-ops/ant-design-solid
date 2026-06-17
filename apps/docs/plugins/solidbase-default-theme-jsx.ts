import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { Plugin } from 'vite'

const layoutSidebarPrefixHelper = `
function normalizeSidebarPrefix(sidebar) {
  const basePath = import.meta.env.BASE_URL.replace(/\\/$/, '')

  if (!basePath || sidebar.prefix === '/' || !sidebar.prefix.startsWith(basePath + '/')) {
    return sidebar
  }

  const prefix = sidebar.prefix.slice(basePath.length) || '/'

  return { ...sidebar, prefix }
}
`

export function normalizeDefaultThemeLayoutSidebarPrefix(code: string, id: string): string {
  const filePath = id.split('?')[0]

  if (!filePath.endsWith('/@kobalte/solidbase/dist/default-theme/Layout.jsx')) {
    return code
  }

  return `${layoutSidebarPrefixHelper}\n${code.replaceAll(
    '<Navigation sidebar={sidebar()}/>',
    '<Navigation sidebar={normalizeSidebarPrefix(sidebar())}/>',
  )}`
}

export function solidbaseDefaultThemeJsx(): Plugin {
  return {
    name: 'solidbase-default-theme-jsx',
    enforce: 'pre',
    resolveId(source, importer) {
      const importerPath = importer?.split('?')[0]

      if (!importerPath?.includes('/@kobalte/solidbase/dist/default-theme/')) {
        return
      }

      if (!source.endsWith('.js') || !(source.startsWith('./') || source.startsWith('../'))) {
        return
      }

      const jsPath = resolve(dirname(importerPath), source)
      const jsxPath = jsPath.replace(/\.js$/, '.jsx')

      // SolidBase 0.6.3 default-theme emits a few relative .js imports for .jsx files.
      if (!existsSync(jsPath) && existsSync(jsxPath)) {
        return jsxPath
      }
    },
    transform(code, id) {
      const result = normalizeDefaultThemeLayoutSidebarPrefix(code, id)

      if (result !== code) {
        return result
      }
    },
  }
}
