import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

const virtualModuleId = 'virtual:components-changelog'
const resolvedVirtualModuleId = `\0${virtualModuleId}`

function defaultChangelogPath() {
  return fileURLToPath(new URL('../../packages/components/CHANGELOG.md', import.meta.url))
}

export function componentsChangelogPlugin(changelogPath = defaultChangelogPath()): Plugin {
  return {
    name: 'docs-components-changelog',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) return

      return `export const componentsChangelog = ${JSON.stringify(fs.readFileSync(changelogPath, 'utf8').trim())}`
    },
  }
}
