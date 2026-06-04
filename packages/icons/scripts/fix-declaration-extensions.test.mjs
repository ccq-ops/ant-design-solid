import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { fixDeclarationExtensions } from './fix-declaration-extensions.mjs'

describe('fixDeclarationExtensions', () => {
  it('adds .js to extensionless declaration import and export specifiers that NodeNext requires', async () => {
    const distDir = await mkdtemp(join(tmpdir(), 'icons-dts-'))

    try {
      const declarationPath = join(distDir, 'index.d.ts')
      await writeFile(
        declarationPath,
        [
          "import { type IconProps } from '../components/icon';",
          "export { Icon } from './components/icon';",
          "export type { IconProps } from './components/icon';",
          "export { SearchOutlined } from './icons/search-outlined';",
          "export { AlreadyFixed } from './icons/already-fixed.js';",
          "export { PackageThing } from 'solid-js';",
          "export type { IconDefinition } from '@ant-design/icons-svg/lib/types';",
          "export { Styles } from './styles.css';",
          "export { JsonData } from './data.json';",
          "export { Parent } from '..';",
          "export { Current } from '.';",
          '',
        ].join('\n'),
      )

      const changedCount = await fixDeclarationExtensions(distDir)

      await expect(readFile(declarationPath, 'utf8')).resolves.toBe(
        [
          "import { type IconProps } from '../components/icon.js';",
          "export { Icon } from './components/icon.js';",
          "export type { IconProps } from './components/icon.js';",
          "export { SearchOutlined } from './icons/search-outlined.js';",
          "export { AlreadyFixed } from './icons/already-fixed.js';",
          "export { PackageThing } from 'solid-js';",
          "export type { IconDefinition } from '@ant-design/icons-svg/lib/types.js';",
          "export { Styles } from './styles.css';",
          "export { JsonData } from './data.json';",
          "export { Parent } from '../index.js';",
          "export { Current } from './index.js';",
          '',
        ].join('\n'),
      )
      expect(changedCount).toBe(1)
    } finally {
      await rm(distDir, { force: true, recursive: true })
    }
  })
})
