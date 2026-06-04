import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const declarationSpecifierPattern =
  /\b(from\s+)(['"])(\.{1,2}(?:\/[^'"]*)?|@ant-design\/icons-svg\/(?:es|lib)\/[^'"]+)(\2)/g
const explicitExtensionPattern = /\.(?:cjs|css|cts|d\.ts|js|json|jsx|mjs|mts|ts|tsx)$/

function hasExplicitExtension(specifier) {
  return explicitExtensionPattern.test(specifier)
}

function addJsExtension(specifier) {
  if (hasExplicitExtension(specifier)) {
    return specifier
  }

  if (specifier === '.' || specifier === '..') {
    return `${specifier}/index.js`
  }

  return `${specifier}.js`
}

export function fixDeclarationContent(content) {
  return content.replace(
    declarationSpecifierPattern,
    (_match, fromKeyword, quote, specifier, closingQuote) =>
      `${fromKeyword}${quote}${addJsExtension(specifier)}${closingQuote}`,
  )
}

async function findDeclarationFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)

      if (entry.isDirectory()) {
        return findDeclarationFiles(path)
      }

      return entry.isFile() && path.endsWith('.d.ts') ? [path] : []
    }),
  )

  return files.flat()
}

export async function fixDeclarationExtensions(distDir) {
  const declarationFiles = await findDeclarationFiles(distDir)
  let changedCount = 0

  await Promise.all(
    declarationFiles.map(async (declarationFile) => {
      const content = await readFile(declarationFile, 'utf8')
      const fixedContent = fixDeclarationContent(content)

      if (fixedContent !== content) {
        await writeFile(declarationFile, fixedContent)
        changedCount += 1
      }
    }),
  )

  return changedCount
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]

if (isCli) {
  const distDir = process.argv[2] ?? join(import.meta.dirname, '..', 'dist')
  const changedCount = await fixDeclarationExtensions(distDir)

  console.log(
    `Fixed declaration extensions in ${changedCount} file${changedCount === 1 ? '' : 's'}.`,
  )
}
