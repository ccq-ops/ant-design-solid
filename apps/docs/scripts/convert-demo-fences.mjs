#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const tsxFencePattern = /```tsx([^\n]*)\n([\s\S]*?)\n```/g
const identifierPattern = /^[A-Za-z_$][\w$]*$/

function routeBaseName(filePath) {
  const baseName = path.basename(filePath, path.extname(filePath))

  return baseName
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join('')
}

function previewComponentName(filePath, demoIndex) {
  const routeName = routeBaseName(filePath) || 'Route'

  return `${routeName}Demo${String(demoIndex).padStart(3, '0')}`
}

function normalizeCode(code) {
  return code.replace(/\r\n/g, '\n')
}

function collectImportBindings(sourceFile, node) {
  const moduleSpecifier = node.moduleSpecifier.text

  if (!node.importClause) {
    return [
      {
        kind: 'side-effect',
        localName: undefined,
        importedName: undefined,
        moduleSpecifier,
      },
    ]
  }

  const bindings = []
  const { name, namedBindings } = node.importClause

  if (name) {
    bindings.push({
      kind: 'default',
      localName: name.text,
      importedName: 'default',
      moduleSpecifier,
    })
  }

  if (!namedBindings) {
    return bindings
  }

  if (ts.isNamespaceImport(namedBindings)) {
    bindings.push({
      kind: 'namespace',
      localName: namedBindings.name.text,
      importedName: '*',
      moduleSpecifier,
    })
    return bindings
  }

  for (const element of namedBindings.elements) {
    bindings.push({
      kind: 'named',
      localName: element.name.text,
      importedName: element.propertyName?.text ?? element.name.text,
      moduleSpecifier,
    })
  }

  return bindings
}

function analyzeDemo(code, filePath) {
  const sourceFile = ts.createSourceFile(
    `${path.basename(filePath)}.tsx`,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

  const imports = []
  const importBindings = []
  const rangesToRemove = []
  const defaultExports = []

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      const bindings = collectImportBindings(sourceFile, statement)

      imports.push(...bindings)
      importBindings.push(...bindings)
      rangesToRemove.push({ start: statement.getFullStart(), end: statement.end })
      continue
    }

    if (
      ts.isExportAssignment(statement) &&
      !statement.isExportEquals &&
      ts.isIdentifier(statement.expression)
    ) {
      defaultExports.push(statement.expression.text)
      rangesToRemove.push({ start: statement.getFullStart(), end: statement.end })
    }
  }

  if (defaultExports.length !== 1) {
    return undefined
  }

  const [defaultName] = defaultExports

  if (!identifierPattern.test(defaultName)) {
    return undefined
  }

  return { defaultName, imports, importBindings, rangesToRemove }
}

function removeRanges(code, ranges) {
  return ranges
    .slice()
    .sort((a, b) => b.start - a.start)
    .reduce((nextCode, range) => {
      return `${nextCode.slice(0, range.start)}${nextCode.slice(range.end)}`
    }, code)
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function isJsxFragmentText(value) {
  return /^\(\s*<>/.test(value) || value.startsWith('<>')
}

function needsJsxFragmentWrap(sourceFile) {
  return (
    sourceFile.parseDiagnostics?.some((diagnostic) => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')

      return message.includes('JSX expressions must have one parent element')
    }) ?? false
  )
}

function wrapReturnExpressionsInFragments(code) {
  const sourceFile = ts.createSourceFile(
    'demo.tsx',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

  if (!needsJsxFragmentWrap(sourceFile)) {
    return code
  }

  const replacements = []

  function visit(node) {
    if (ts.isReturnStatement(node) && node.expression) {
      const expressionText = node.expression.getText(sourceFile)

      if (ts.isParenthesizedExpression(node.expression) && !isJsxFragmentText(expressionText)) {
        const innerStart = node.expression.getStart(sourceFile) + 1
        const innerEnd = node.expression.getEnd() - 1
        const innerText = code.slice(innerStart, innerEnd)

        replacements.push({
          start: node.expression.getStart(sourceFile),
          end: node.expression.getEnd(),
          text: `(<>${innerText}</>)`,
        })
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return replacements
    .sort((a, b) => b.start - a.start)
    .reduce((nextCode, replacement) => {
      return `${nextCode.slice(0, replacement.start)}${replacement.text}${nextCode.slice(
        replacement.end,
      )}`
    }, code)
}

function transpileExecutable(code, filePath) {
  const wrappedCode = wrapReturnExpressionsInFragments(code)
  const result = ts.transpileModule(wrappedCode, {
    fileName: `${path.basename(filePath)}.tsx`,
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
      preserveValueImports: false,
      removeComments: false,
    },
    reportDiagnostics: true,
  })

  const diagnostics =
    result.diagnostics?.filter(
      (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
    ) ?? []

  if (diagnostics.length > 0) {
    const message = diagnostics
      .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
      .join('\n')

    throw new Error(`Failed to transpile executable demo in ${filePath}:\n${message}`)
  }

  return result.outputText
    .trim()
    .replace(/^"use strict";\n?/, '')
    .trim()
}

function hasPureMeta(meta) {
  return meta.split(/\s+/).filter(Boolean).includes('pure')
}

function registerImportBinding(importBindings, binding, filePath) {
  if (binding.kind === 'side-effect') {
    return
  }

  const previous = importBindings.get(binding.localName)
  const signature = `${binding.moduleSpecifier}:${binding.importedName}`

  if (previous && previous !== signature) {
    throw new Error(
      `Import binding conflict for "${binding.localName}" in ${filePath}: ${previous} conflicts with ${signature}`,
    )
  }

  importBindings.set(binding.localName, signature)
}

function registerHoistedImport(hoistedImports, binding) {
  const moduleImports = hoistedImports.get(binding.moduleSpecifier) ?? {
    sideEffect: false,
    defaultImport: undefined,
    namespaceImport: undefined,
    namedImports: new Map(),
  }

  if (binding.kind === 'side-effect') {
    moduleImports.sideEffect = true
  } else if (binding.kind === 'default') {
    moduleImports.defaultImport = binding.localName
  } else if (binding.kind === 'namespace') {
    moduleImports.namespaceImport = binding.localName
  } else if (binding.kind === 'named') {
    moduleImports.namedImports.set(binding.localName, binding.importedName)
  }

  hoistedImports.set(binding.moduleSpecifier, moduleImports)
}

function identifierIsUsed(code, name) {
  return new RegExp(`\\b${name.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')}\\b`).test(code)
}

function printHoistedImports(hoistedImports) {
  const lines = []

  for (const [moduleSpecifier, moduleImports] of hoistedImports) {
    if (moduleImports.sideEffect) {
      lines.push(`import ${JSON.stringify(moduleSpecifier)}`)
      continue
    }

    const clauses = []

    if (moduleImports.defaultImport) {
      clauses.push(moduleImports.defaultImport)
    }

    if (moduleImports.namespaceImport) {
      clauses.push(`* as ${moduleImports.namespaceImport}`)
    }

    if (moduleImports.namedImports.size > 0) {
      const named = [...moduleImports.namedImports]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([localName, importedName]) =>
          localName === importedName ? localName : `${importedName} as ${localName}`,
        )
        .join(', ')

      clauses.push(`{ ${named} }`)
    }

    lines.push(`import ${clauses.join(', ')} from ${JSON.stringify(moduleSpecifier)}`)
  }

  return lines.map((line) => line.replaceAll('"', "'"))
}

function previewDirectiveRanges(source) {
  const ranges = []
  const pattern = /^:::preview\b[\s\S]*?^:::\s*$/gm
  let match

  while ((match = pattern.exec(source))) {
    ranges.push({ start: match.index, end: match.index + match[0].length })
  }

  return ranges
}

function isInRange(index, ranges) {
  return ranges.some((range) => index >= range.start && index < range.end)
}

function splitModulePreamble(source) {
  const matches = [...source.matchAll(tsxFencePattern)]
  const firstFence = matches[0]

  if (!firstFence) {
    return { preamble: '', body: source }
  }

  const beforeFirstFence = source.slice(0, firstFence.index)
  const lines = beforeFirstFence.split('\n')
  let preambleEndLine = 0
  let preambleEndOffset = 0

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]

    if (
      /^\s*$/.test(line) ||
      /^\s*import\s/.test(line) ||
      /^\s*export\s+(?!default\b)/.test(line)
    ) {
      preambleEndLine = index + 1
      preambleEndOffset += line.length + 1
      continue
    }

    break
  }

  if (preambleEndLine === 0) {
    return { preamble: '', body: source }
  }

  const preamble = lines.slice(0, preambleEndLine).join('\n').replace(/\s+$/, '')
  const body = source.slice(preambleEndOffset)

  return { preamble, body }
}

function joinModulePreamble(preamble, hoistedImports, body) {
  const moduleLines = []

  if (preamble.trim()) {
    moduleLines.push(preamble.trim())
  }

  if (hoistedImports.length > 0) {
    moduleLines.push(hoistedImports.join('\n'))
  }

  if (moduleLines.length === 0) {
    return body
  }

  return `${moduleLines.join('\n')}\n\n${body.replace(/^\n+/, '')}`
}

function createPreviewBlock(componentName, executable, originalCode, defaultName) {
  return `:::preview

<${componentName} />

export const ${componentName} = (() => {
${executable
  .split('\n')
  .map((line) => `  ${line}`.replace(/\s+$/, ''))
  .join('\n')}

  return ${defaultName}
})()

---

\`\`\`tsx
${originalCode}
\`\`\`

:::`
}

export function convertMdxDemoFences(source, filePath) {
  const { preamble, body } = splitModulePreamble(source)
  const previewRanges = previewDirectiveRanges(body)
  const hoistedImports = new Map()
  const importBindings = new Map()
  let convertedCount = 0
  let skippedPureCount = 0
  let skippedNoDefaultCount = 0

  const convertedBody = body.replace(tsxFencePattern, (fullMatch, meta, rawCode, offset) => {
    if (isInRange(offset, previewRanges)) {
      return fullMatch
    }

    if (hasPureMeta(meta)) {
      skippedPureCount += 1
      return fullMatch
    }

    const originalCode = normalizeCode(rawCode)
    const analysis = analyzeDemo(originalCode, filePath)

    if (!analysis) {
      skippedNoDefaultCount += 1
      return fullMatch
    }

    for (const binding of analysis.importBindings) {
      registerImportBinding(importBindings, binding, filePath)
    }

    convertedCount += 1
    const componentName = previewComponentName(filePath, convertedCount)
    const executableSource = removeRanges(originalCode, analysis.rangesToRemove).replace(
      new RegExp(`\\b${analysis.defaultName}\\b(?=\\s*$)`),
      analysis.defaultName,
    )
    const executable = transpileExecutable(executableSource, filePath)

    for (const binding of analysis.imports) {
      if (binding.kind === 'side-effect' || identifierIsUsed(executable, binding.localName)) {
        registerHoistedImport(hoistedImports, binding)
      }
    }

    return createPreviewBlock(componentName, executable, originalCode, analysis.defaultName)
  })

  return {
    output: joinModulePreamble(preamble, printHoistedImports(hoistedImports), convertedBody),
    convertedCount,
    skippedPureCount,
    skippedNoDefaultCount,
  }
}

function listMdxFiles(entryPath) {
  const stats = statSync(entryPath)

  if (stats.isFile()) {
    return entryPath.endsWith('.mdx') ? [entryPath] : []
  }

  const files = []

  for (const entry of readdirSync(entryPath)) {
    files.push(...listMdxFiles(path.join(entryPath, entry)))
  }

  return files.sort()
}

function runCli() {
  const args = process.argv.slice(2)
  const write = !args.includes('--check')
  const targets = args.filter((arg) => arg !== '--check')
  const root = process.cwd()
  const routeRoot = path.join(root, 'apps/docs/src/routes')
  const paths = targets.length > 0 ? targets : [routeRoot]
  const files = paths.flatMap((target) => listMdxFiles(path.resolve(root, target)))
  const summary = {
    files: files.length,
    changedFiles: 0,
    converted: 0,
    skippedPure: 0,
    skippedNoDefault: 0,
  }

  for (const file of files) {
    const input = readFileSync(file, 'utf8')
    const result = convertMdxDemoFences(input, path.relative(root, file))

    summary.converted += result.convertedCount
    summary.skippedPure += result.skippedPureCount
    summary.skippedNoDefault += result.skippedNoDefaultCount

    if (result.output !== input) {
      summary.changedFiles += 1

      if (write) {
        writeFileSync(file, result.output)
      }
    }
  }

  console.log(
    [
      `files=${summary.files}`,
      `changed=${summary.changedFiles}`,
      `converted=${summary.converted}`,
      `skippedPure=${summary.skippedPure}`,
      `skippedNoDefault=${summary.skippedNoDefault}`,
      `mode=${write ? 'write' : 'check'}`,
    ].join(' '),
  )
}

const currentFile = fileURLToPath(import.meta.url)

if (existsSync(currentFile) && process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  runCli()
}
