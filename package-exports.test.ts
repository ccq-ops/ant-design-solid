import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))
const packageDirs = fs
  .readdirSync(path.join(packageRoot, 'packages'))
  .map((name) => path.join(packageRoot, 'packages', name))
  .filter((dir) => fs.existsSync(path.join(dir, 'package.json')))

function readJson(filePath: string) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function declarationTsconfigPath(packageDir: string, buildScript: string) {
  const match = buildScript.match(/tsc -p (\S+)/)

  return path.join(packageDir, match?.[1] ?? 'tsconfig.json')
}

function mergedCompilerOptions(tsconfigPath: string): Record<string, unknown> {
  const tsconfig = readJson(tsconfigPath)
  const extendedOptions =
    typeof tsconfig.extends === 'string'
      ? mergedCompilerOptions(path.resolve(path.dirname(tsconfigPath), tsconfig.extends))
      : undefined

  return Object.assign({}, extendedOptions, tsconfig.compilerOptions ?? {})
}

function declarationOutputPath(packageDir: string, buildScript: string) {
  const tsconfigPath = declarationTsconfigPath(packageDir, buildScript)
  const compilerOptions = mergedCompilerOptions(tsconfigPath)
  const outDir = compilerOptions.outDir ?? '.'
  const rootDir = compilerOptions.rootDir ?? '.'
  const indexSource = fs.existsSync(path.join(packageDir, 'src/index.tsx'))
    ? 'src/index.tsx'
    : 'src/index.ts'
  const relativeDeclaration = path
    .relative(
      path.resolve(path.dirname(tsconfigPath), String(rootDir)),
      path.resolve(packageDir, indexSource),
    )
    .replace(/\.[cm]?tsx?$/, '.d.ts')

  return `./${path.posix.join(String(outDir), relativeDeclaration.split(path.sep).join(path.posix.sep))}`
}

describe('package export configuration', () => {
  it('points package entry types at the emitted declaration entry', () => {
    const mismatches = packageDirs.flatMap((packageDir) => {
      const packageJson = readJson(path.join(packageDir, 'package.json'))
      const expectedTypes = declarationOutputPath(packageDir, packageJson.scripts?.build ?? '')
      const actualTypes = packageJson.types
      const actualImportTypes = packageJson.exports?.['.']?.import?.types
      const actualRequireTypes = packageJson.exports?.['.']?.require?.types
      const expectedRequireTypes = expectedTypes.replace(/\.d\.ts$/, '.d.cts')
      const packageName = path.basename(packageDir)

      return [
        actualTypes === expectedTypes
          ? undefined
          : `${packageName}: types is ${actualTypes}, declaration output is ${expectedTypes}`,
        actualImportTypes === expectedTypes
          ? undefined
          : `${packageName}: exports["."].import.types is ${actualImportTypes}, declaration output is ${expectedTypes}`,
        actualRequireTypes === expectedRequireTypes
          ? undefined
          : `${packageName}: exports["."].require.types is ${actualRequireTypes}, CommonJS declaration output is ${expectedRequireTypes}`,
      ].filter(Boolean)
    })

    expect(mismatches).toEqual([])
  })

  it('exposes component-level core imports with matching module formats', () => {
    const packageJson = readJson(path.join(packageRoot, 'packages/components/package.json'))

    expect(packageJson.sideEffects).toBe(false)
    expect(packageJson.exports?.['./*']).toEqual({
      browser: {
        types: './dist/*/index.d.ts',
        default: './dist/*/index.js',
      },
      node: {
        import: {
          types: './dist/*/index.d.ts',
          default: './dist/ssr/*/index.js',
        },
        require: {
          types: './dist/*/index.d.cts',
          default: './dist/ssr/*/index.cjs',
        },
      },
      import: {
        types: './dist/*/index.d.ts',
        default: './dist/*/index.js',
      },
      require: {
        types: './dist/*/index.d.cts',
        default: './dist/*/index.cjs',
      },
    })
  })

  it('routes core and icons to SSR-compiled JavaScript under the node condition', () => {
    const core = readJson(path.join(packageRoot, 'packages/components/package.json'))
    const icons = readJson(path.join(packageRoot, 'packages/icons/package.json'))

    expect(core.exports['.'].node.import.default).toBe('./dist/ssr/index.js')
    expect(core.exports['.'].node.require.default).toBe('./dist/ssr/index.cjs')
    expect(core.exports['./*'].node.import.default).toBe('./dist/ssr/*/index.js')
    expect(icons.exports['.'].node.import.default).toBe('./dist/ssr/index.js')
    expect(icons.exports['./icons/*'].node.import.default).toBe('./dist/ssr/icons/*.js')
  })

  it('emits every configured core and icons SSR entrypoint', () => {
    const core = readJson(path.join(packageRoot, 'packages/components/package.json'))
    const icons = readJson(path.join(packageRoot, 'packages/icons/package.json'))
    const expectedFiles: Array<[string, string]> = [
      ['components', core.exports['.'].node.import.default],
      ['components', core.exports['.'].node.require.default],
      ['components', core.exports['./*'].node.import.default.replace('*', 'button')],
      ['components', core.exports['./*'].node.require.default.replace('*', 'button')],
      ['icons', icons.exports['.'].node.import.default],
      ['icons', icons.exports['.'].node.require.default],
      ['icons', icons.exports['./icons/*'].node.import.default.replace('*', 'search-outlined')],
      ['icons', icons.exports['./icons/*'].node.require.default.replace('*', 'search-outlined')],
    ]

    for (const [packageName, relativeFile] of expectedFiles) {
      expect(
        fs.existsSync(path.join(packageRoot, 'packages', packageName, relativeFile)),
        `${packageName}: missing ${relativeFile}`,
      ).toBe(true)
    }
  })

  it('declares package runtime support and tree-shaking metadata', () => {
    const mismatches = packageDirs.flatMap((packageDir) => {
      const packageJson = readJson(path.join(packageDir, 'package.json'))
      const packageName = path.basename(packageDir)

      return [
        packageJson.engines?.node === '>=20'
          ? undefined
          : `${packageName}: engines.node must be >=20`,
        packageJson.sideEffects === false ? undefined : `${packageName}: sideEffects must be false`,
      ].filter(Boolean)
    })

    expect(mismatches).toEqual([])
  })
})
