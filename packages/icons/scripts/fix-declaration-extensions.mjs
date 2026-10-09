import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { fixDeclarations } from '../../../scripts/fix-declarations.mjs'

export async function fixDeclarationExtensions(distDir) {
  const result = await fixDeclarations(distDir)
  return result.changedCount
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]

if (isCli) {
  const distDir = process.argv[2] ?? join(import.meta.dirname, '..', 'dist')
  const result = await fixDeclarations(distDir)

  console.log(
    `Prepared ${result.declarationCount} declaration file${
      result.declarationCount === 1 ? '' : 's'
    }; fixed ${result.changedCount} ESM declaration file${
      result.changedCount === 1 ? '' : 's'
    } and generated matching CommonJS declarations.`,
  )
}
