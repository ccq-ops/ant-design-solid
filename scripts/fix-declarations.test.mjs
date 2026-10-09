import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { fixDeclarations } from './fix-declarations.mjs'

describe('fixDeclarations', () => {
  it('resolves declaration files and directories and emits CommonJS declarations', async () => {
    const distDir = await mkdtemp(join(tmpdir(), 'solid-ant-design-dts-'))

    try {
      await mkdir(join(distDir, 'button'))
      await writeFile(join(distDir, 'button.d.ts'), 'export declare const Button: unknown;\n')
      await writeFile(join(distDir, 'button/index.d.ts'), 'export declare const Group: unknown;\n')
      await writeFile(
        join(distDir, 'index.d.ts'),
        [
          "export { Button } from './button';",
          "export { Group } from './button/';",
          'export type Alias = import("./button").Button;',
          "export { External } from 'solid-js';",
          "export type { IconDefinition } from '@ant-design/icons-svg/lib/types';",
          '//# sourceMappingURL=index.d.ts.map',
        ].join('\n'),
      )

      const result = await fixDeclarations(distDir)

      expect(result).toEqual({
        changedCount: 1,
        declarationCount: 3,
      })
      await expect(readFile(join(distDir, 'index.d.ts'), 'utf8')).resolves.toBe(
        [
          "export { Button } from './button.js';",
          "export { Group } from './button/index.js';",
          'export type Alias = import("./button.js").Button;',
          "export { External } from 'solid-js';",
          "export type { IconDefinition } from '@ant-design/icons-svg/lib/types.js';",
          '//# sourceMappingURL=index.d.ts.map',
        ].join('\n'),
      )
      await expect(readFile(join(distDir, 'index.d.cts'), 'utf8')).resolves.toBe(
        [
          "export { Button } from './button.cjs';",
          "export { Group } from './button/index.cjs';",
          'export type Alias = import("./button.cjs").Button;',
          "export { External } from 'solid-js';",
          "export type { IconDefinition } from '@ant-design/icons-svg/lib/types.js';",
        ].join('\n'),
      )
      await expect(readFile(join(distDir, 'button.d.cts'), 'utf8')).resolves.toBe(
        'export declare const Button: unknown;\n',
      )
    } finally {
      await rm(distDir, { force: true, recursive: true })
    }
  })
})
