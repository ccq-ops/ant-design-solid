import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

export const componentsChangelogModuleId = 'virtual:components-changelog.mdx'

const changelogPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../packages/components/CHANGELOG.md',
)
const resolvedComponentsChangelogModuleId = `${changelogPath}?components-changelog.mdx`

export function readComponentsChangelog() {
  return readFileSync(changelogPath, 'utf8')
    .replace(/^# @solid-ant-design\/core\s*/, '')
    .trimStart()
}

export function componentsChangelogPlugin(): Plugin {
  return {
    name: 'components-changelog',
    resolveId(id) {
      if (id === componentsChangelogModuleId) {
        return resolvedComponentsChangelogModuleId
      }
    },
    load(id) {
      if (id === resolvedComponentsChangelogModuleId) {
        this.addWatchFile(changelogPath)

        return readComponentsChangelog()
      }
    },
  }
}
