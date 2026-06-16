import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { componentsChangelogPlugin } from './components-changelog-plugin'

const tempDirectories: string[] = []

function makeTempDirectory() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ads-changelog-plugin-'))
  tempDirectories.push(directory)
  return directory
}

afterEach(() => {
  for (const directory of tempDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})

describe('componentsChangelogPlugin', () => {
  it('loads the components changelog as a browser-safe virtual module', () => {
    const directory = makeTempDirectory()
    const changelogPath = path.join(directory, 'CHANGELOG.md')
    const plugin = componentsChangelogPlugin(changelogPath)

    fs.writeFileSync(changelogPath, '# @solid-ant-design/core\n\n## 0.2.0\n\n- Release v0.2.0\n')

    expect(plugin.resolveId?.('virtual:components-changelog')).toBe(
      '\0virtual:components-changelog',
    )
    expect(plugin.load?.('\0virtual:components-changelog')).toBe(
      'export const componentsChangelog = "# @solid-ant-design/core\\n\\n## 0.2.0\\n\\n- Release v0.2.0"',
    )
  })
})
