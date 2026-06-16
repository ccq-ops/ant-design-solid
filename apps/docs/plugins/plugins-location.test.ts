import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const pluginFileNames = [
  'components-changelog-plugin.ts',
  'playground-registry-plugin.ts',
  'solidbase-default-theme-jsx.ts',
  'solidbase-default-theme-preview.ts',
  'solidbase-theme-plugin.ts',
]

describe('docs plugins location', () => {
  it('keeps local Vite plugins in the plugins directory', () => {
    const root = process.cwd()

    for (const fileName of pluginFileNames) {
      expect(fs.existsSync(path.join(root, 'plugins', fileName))).toBe(true)
      expect(fs.existsSync(path.join(root, fileName))).toBe(false)
    }
  })
})
