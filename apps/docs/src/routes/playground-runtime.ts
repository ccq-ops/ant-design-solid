import ts from 'typescript'
import h from 'solid-js/h'
import * as solidJs from 'solid-js'
import * as core from '@ant-design-solid/core'
import * as icons from '@ant-design-solid/solid-icons'
import type { Component } from 'solid-js'

type CompileResult = { ok: true; component: Component } | { ok: false; error: string }

type ImportBinding = {
  importedName: string
  localName: string
  moduleSpecifier: string
}

const moduleScopes: Record<string, Record<string, unknown>> = {
  '@ant-design-solid/core': core,
  '@ant-design-solid/solid-icons': icons,
  'solid-js': solidJs,
}

function collectImportBindings(sourceFile: ts.SourceFile) {
  const bindings: ImportBinding[] = []

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue

    const moduleSpecifier = statement.moduleSpecifier
    if (!ts.isStringLiteral(moduleSpecifier)) continue

    const scope = moduleScopes[moduleSpecifier.text]
    if (!scope) {
      throw new Error(`Unsupported import: ${moduleSpecifier.text}`)
    }

    const importClause = statement.importClause
    if (!importClause) continue

    if (importClause.isTypeOnly) continue

    if (importClause.name) {
      throw new Error(`Default imports are not supported from ${moduleSpecifier.text}`)
    }

    const namedBindings = importClause.namedBindings
    if (!namedBindings) continue

    if (ts.isNamespaceImport(namedBindings)) {
      bindings.push({
        importedName: '*',
        localName: namedBindings.name.text,
        moduleSpecifier: moduleSpecifier.text,
      })
      continue
    }

    for (const element of namedBindings.elements) {
      if (element.isTypeOnly) continue

      bindings.push({
        importedName: element.propertyName?.text ?? element.name.text,
        localName: element.name.text,
        moduleSpecifier: moduleSpecifier.text,
      })
    }
  }

  return bindings
}

function removeTopLevelImports(source: string, sourceFile: ts.SourceFile) {
  return sourceFile.statements
    .filter(ts.isImportDeclaration)
    .sort((left, right) => right.getFullStart() - left.getFullStart())
    .reduce((nextSource, statement) => {
      return `${nextSource.slice(0, statement.getFullStart())}${nextSource.slice(statement.end)}`
    }, source)
}

function getImplicitDemoName(sourceFile: ts.SourceFile) {
  const demoNames: string[] = []

  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement)) {
      const name = statement.name?.text

      if (name && /^Demo\d*$/.test(name)) {
        demoNames.push(name)
      }

      continue
    }

    if (!ts.isVariableStatement(statement)) continue

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name)) continue

      const name = declaration.name.text

      if (/^Demo\d*$/.test(name)) {
        demoNames.push(name)
      }
    }
  }

  return demoNames.at(-1)
}

function isJsxSnippet(sourceFile: ts.SourceFile) {
  const statements = sourceFile.statements.filter((statement) => !ts.isImportDeclaration(statement))

  if (statements.length !== 1) return false

  const statement = statements[0]

  return (
    ts.isExpressionStatement(statement) &&
    (ts.isJsxElement(statement.expression) ||
      ts.isJsxSelfClosingElement(statement.expression) ||
      ts.isJsxFragment(statement.expression))
  )
}

function createExecutableSource(source: string, sourceFile: ts.SourceFile) {
  const sourceWithoutImports = removeTopLevelImports(source, sourceFile)
  const rewrittenSource = sourceWithoutImports.replace(
    /\bexport\s+default\s+/,
    'const __playground_default__ = ',
  )

  if (rewrittenSource !== sourceWithoutImports) {
    return rewrittenSource
  }

  const implicitDemoName = getImplicitDemoName(sourceFile)

  if (implicitDemoName) {
    return `${sourceWithoutImports}\nconst __playground_default__ = ${implicitDemoName}`
  }

  if (isJsxSnippet(sourceFile)) {
    return `const __playground_default__ = function PlaygroundSnippet() {\n  return (${sourceWithoutImports.trim()})\n}`
  }

  return undefined
}

function resolveBinding(sourceFile: ts.SourceFile, binding: ImportBinding) {
  const scope = moduleScopes[binding.moduleSpecifier]

  if (!scope) {
    throw new Error(`Unsupported import: ${binding.moduleSpecifier}`)
  }

  if (binding.importedName === '*') {
    return scope
  }

  if (!(binding.importedName in scope)) {
    throw new Error(`Unsupported import binding: ${binding.importedName}`)
  }

  return scope[binding.importedName]
}

function createRuntimeFunction(source: string, bindings: ImportBinding[]) {
  const bindingNames = bindings.map((binding) => binding.localName)
  const factory = new Function('h', ...bindingNames, `${source}\nreturn __playground_default__`)

  return (...values: unknown[]) => factory(h, ...values)
}

export function compilePlaygroundSource(source: string): CompileResult {
  try {
    const sourceFile = ts.createSourceFile(
      'playground.tsx',
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )
    const bindings = collectImportBindings(sourceFile)
    const executableSource = createExecutableSource(source, sourceFile)

    if (!executableSource) {
      return { ok: false, error: 'The playground source must include a default export.' }
    }

    const transpiled = ts.transpileModule(executableSource, {
      fileName: 'playground.tsx',
      compilerOptions: {
        jsx: ts.JsxEmit.React,
        jsxFactory: 'h',
        jsxFragmentFactory: 'h.Fragment',
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
      },
      reportDiagnostics: true,
    })

    const diagnostics =
      transpiled.diagnostics?.filter(
        (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
      ) ?? []

    if (diagnostics.length > 0) {
      return {
        ok: false,
        error: diagnostics
          .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
          .join('\n'),
      }
    }

    const values = bindings.map((binding) => resolveBinding(sourceFile, binding))
    const component = createRuntimeFunction(transpiled.outputText, bindings)(...values)

    if (typeof component !== 'function') {
      return { ok: false, error: 'The playground source must export a component as default.' }
    }

    return { ok: true, component: component as Component }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
