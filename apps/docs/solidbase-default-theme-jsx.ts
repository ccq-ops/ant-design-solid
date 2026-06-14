import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import type { Plugin } from 'vite'

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
  }
}
