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
      const actualExportTypes = packageJson.exports?.['.']?.types
      const packageName = path.basename(packageDir)

      return [
        actualTypes === expectedTypes
          ? undefined
          : `${packageName}: types is ${actualTypes}, declaration output is ${expectedTypes}`,
        actualExportTypes === expectedTypes
          ? undefined
          : `${packageName}: exports["."].types is ${actualExportTypes}, declaration output is ${expectedTypes}`,
      ].filter(Boolean)
    })

    expect(mismatches).toEqual([])
  })
})
