import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const moduleSpecifierPattern =
  /(\b(?:from|import|require)\s*(?:\(\s*)?)(['"])(\.{1,2}(?:\/[^'"]*)?|@ant-design\/icons-svg\/(?:es|lib)\/[^'"]+)(\2)/g
const explicitExtensionPattern = /\.(?:cjs|css|cts|d\.ts|js|json|jsx|mjs|mts|ts|tsx)$/
const sourceMapCommentPattern = /\n?\/\/# sourceMappingURL=.*?\.d\.ts\.map\s*$/u

function hasExplicitExtension(specifier) {
  return explicitExtensionPattern.test(specifier)
}

function toPosixPath(path) {
  return path.replaceAll('\\', '/')
}

async function pathKind(path) {
  try {
    const entries = await readdir(path, { withFileTypes: true })
    return entries ? 'directory' : undefined
  } catch {
    try {
      await readFile(path)
      return 'file'
    } catch {
      return undefined
    }
  }
}

async function resolveDeclarationSpecifier(declarationFile, specifier) {
  if (!specifier.startsWith('.')) {
    return hasExplicitExtension(specifier) ? specifier : `${specifier}.js`
  }

  if (hasExplicitExtension(specifier)) {
    return specifier
  }

  const hasTrailingSlash = specifier.length > 2 && specifier.endsWith('/')
  const normalizedSpecifier = hasTrailingSlash ? specifier.replace(/\/+$/u, '') : specifier
  const sourcePath = resolve(dirname(declarationFile), normalizedSpecifier)
  const directDeclaration = `${sourcePath}.d.ts`
  const indexDeclaration = join(sourcePath, 'index.d.ts')

  if (!hasTrailingSlash && (await pathKind(directDeclaration)) === 'file') {
    return `${normalizedSpecifier}.js`
  }

  if ((await pathKind(indexDeclaration)) === 'file') {
    return `${normalizedSpecifier}/index.js`
  }

  // Keep declaration output deterministic even when a dependency is generated
  // after this file. TypeScript's emitted specifier normally refers to a file.
  return normalizedSpecifier === '.' || normalizedSpecifier === '..'
    ? `${normalizedSpecifier}/index.js`
    : `${normalizedSpecifier}.js`
}

async function fixDeclarationContent(content, declarationFile) {
  const matches = [...content.matchAll(moduleSpecifierPattern)]

  if (matches.length === 0) {
    return content
  }

  const replacements = await Promise.all(
    matches.map(async (match) => {
      const [, prefix, quote, specifier, closingQuote] = match
      const fixedSpecifier = await resolveDeclarationSpecifier(declarationFile, specifier)

      return {
        end: match.index + match[0].length,
        start: match.index,
        value: `${prefix}${quote}${fixedSpecifier}${closingQuote}`,
      }
    }),
  )

  return replacements
    .sort((left, right) => right.start - left.start)
    .reduce(
      (result, replacement) =>
        `${result.slice(0, replacement.start)}${replacement.value}${result.slice(replacement.end)}`,
      content,
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

function createCommonJsDeclaration(content) {
  return content
    .replace(
      /(\b(?:from|import|require)\s*(?:\(\s*)?)(['"])(\.{1,2}\/[^'"]+)\.js(\2)/g,
      '$1$2$3.cjs$4',
    )
    .replace(sourceMapCommentPattern, '')
}

export async function fixDeclarations(distDir) {
  const declarationFiles = await findDeclarationFiles(distDir)
  let changedCount = 0

  await Promise.all(
    declarationFiles.map(async (declarationFile) => {
      const content = await readFile(declarationFile, 'utf8')
      const fixedContent = await fixDeclarationContent(content, declarationFile)

      if (fixedContent !== content) {
        await writeFile(declarationFile, fixedContent)
        changedCount += 1
      }

      const commonJsDeclaration = declarationFile.replace(/\.d\.ts$/u, '.d.cts')
      await writeFile(commonJsDeclaration, createCommonJsDeclaration(fixedContent))
    }),
  )

  return {
    changedCount,
    declarationCount: declarationFiles.length,
  }
}

const isCli = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]

if (isCli) {
  const distDir = resolve(process.argv[2] ?? 'dist')
  const result = await fixDeclarations(distDir)
  const displayPath = toPosixPath(relative(process.cwd(), distDir) || '.')

  console.log(
    `Prepared ${result.declarationCount} declaration file${
      result.declarationCount === 1 ? '' : 's'
    } in ${displayPath}; fixed ${result.changedCount} ESM declaration file${
      result.changedCount === 1 ? '' : 's'
    } and generated matching CommonJS declarations.`,
  )
}
