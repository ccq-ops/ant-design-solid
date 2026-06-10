import { createHash } from 'node:crypto'
import ts from 'typescript'
import type { Plugin } from 'vite'

const virtualDemoPrefix = 'virtual:demo-block/'
const resolvedVirtualDemoPrefix = `/@virtual-demo-block/`
const demoExportPattern = /(?:^|\n)\s*export\s+default\s+[A-Za-z_$][\w$]*\s*;?\s*$/
const tsxFencePattern = /```tsx([^\n]*)\n([\s\S]*?)\n```/g

function hasDefaultExport(code: string) {
  return demoExportPattern.test(code)
}

function hashDemoId(fileId: string, demoIndex: number, code: string) {
  return createHash('sha1').update(fileId).update(String(demoIndex)).update(code).digest('hex')
}

function isJsxFragmentText(value: string) {
  return /^\(\s*<>/.test(value) || value.startsWith('<>')
}

function needsJsxFragmentWrap(sourceFile: ts.SourceFile) {
  const parseDiagnostics = (sourceFile as ts.SourceFile & { parseDiagnostics?: ts.Diagnostic[] })
    .parseDiagnostics

  return (
    parseDiagnostics?.some((diagnostic) => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')

      return message.includes('JSX expressions must have one parent element')
    }) ?? false
  )
}

function wrapReturnExpressionsInFragments(code: string) {
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

  const replacements: Array<{ start: number; end: number; text: string }> = []

  function visit(node: ts.Node) {
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

  if (replacements.length === 0) {
    return code
  }

  return replacements
    .sort((a, b) => b.start - a.start)
    .reduce((nextCode, replacement) => {
      return `${nextCode.slice(0, replacement.start)}${replacement.text}${nextCode.slice(
        replacement.end,
      )}`
    }, code)
}

export function demoBlockMdxPlugin(): Plugin {
  const demoModules = new Map<string, string>()

  return {
    name: 'ant-design-solid-demo-block-mdx',
    enforce: 'pre',
    resolveId(id) {
      if (id.startsWith(virtualDemoPrefix)) {
        return `${resolvedVirtualDemoPrefix}${id.slice(virtualDemoPrefix.length)}`
      }

      return undefined
    },
    load(id) {
      if (id.startsWith(resolvedVirtualDemoPrefix)) {
        return demoModules.get(id)
      }

      return undefined
    },
    transform(source, id) {
      if (!id.endsWith('.mdx')) {
        return undefined
      }

      let demoIndex = 0
      const imports: string[] = []
      const transformed = source.replace(
        tsxFencePattern,
        (fullMatch, meta: string, code: string) => {
          if (meta.trim() === 'pure' || !hasDefaultExport(code)) {
            return meta.trim() === 'pure' ? `\`\`\`tsx\n${code}\n\`\`\`` : fullMatch
          }

          const componentName = `__DemoBlockDemo${demoIndex}`
          const moduleId = `${hashDemoId(id, demoIndex, code)}.tsx`
          const importSource = `${virtualDemoPrefix}${moduleId}`

          demoModules.set(
            `${resolvedVirtualDemoPrefix}${moduleId}`,
            wrapReturnExpressionsInFragments(code),
          )
          imports.push(`import ${componentName} from ${JSON.stringify(importSource)}`)
          demoIndex += 1

          return `<DemoBlock code={${JSON.stringify(code)}} component={${componentName}} />`
        },
      )

      if (imports.length === 0) {
        return transformed
      }

      return `${imports.join('\n')}\n\n${transformed}`
    },
  }
}
