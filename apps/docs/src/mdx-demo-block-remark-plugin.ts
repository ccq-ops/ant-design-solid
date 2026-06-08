type Parent = { children?: Node[] }
type Node = {
  type: string
  lang?: string
  meta?: string | null
  value?: string
  children?: Node[]
  depth?: number
  name?: string
  attributes?: unknown[]
  data?: Record<string, unknown>
}

type Plugin = () => (tree: Node) => void

const demoExportPattern = /(?:^|\n)\s*export\s+default\s+([A-Za-z_$][\w$]*)\s*;?\s*$/

function isPureTsxFence(node: Node) {
  return node.type === 'code' && node.lang === 'tsx' && node.meta?.trim() === 'pure'
}

function isDemoTsxFence(node: Node) {
  return node.type === 'code' && node.lang === 'tsx' && node.meta?.trim() !== 'pure'
}

function extractDemoComponentName(code: string) {
  const match = code.match(demoExportPattern)

  if (!match) {
    return undefined
  }

  return match[1]
}

function runtimeSourceFromDemoCode(code: string) {
  return code.replace(demoExportPattern, '').trim()
}

function inferTitle(children: Node[], index: number) {
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const node = children[cursor]

    if (node?.type === 'heading') {
      return (
        node.children
          ?.map((child) => child.value ?? '')
          .join('')
          .trim() || 'Example'
      )
    }

    if (node?.type !== 'text' && node?.type !== 'mdxjsEsm') {
      break
    }
  }

  return 'Example'
}

function createDemoBlockNode(title: string, componentName: string, code: string): Node {
  return {
    type: 'mdxJsxFlowElement',
    name: 'DemoBlock',
    attributes: [
      { type: 'mdxJsxAttribute', name: 'title', value: title },
      {
        type: 'mdxJsxAttribute',
        name: 'code',
        value: {
          type: 'mdxJsxAttributeValueExpression',
          value: JSON.stringify(code),
          data: {
            estree: {
              type: 'Program',
              sourceType: 'module',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: { type: 'Literal', value: code, raw: JSON.stringify(code) },
                },
              ],
            },
          },
        },
      },
      {
        type: 'mdxJsxAttribute',
        name: 'component',
        value: {
          type: 'mdxJsxAttributeValueExpression',
          value: componentName,
          data: {
            estree: {
              type: 'Program',
              sourceType: 'module',
              body: [
                {
                  type: 'ExpressionStatement',
                  expression: { type: 'Identifier', name: componentName },
                },
              ],
            },
          },
        },
      },
    ],
    children: [],
  }
}

function visitParents(node: Node, visitor: (node: Node, index: number, parent: Parent) => void) {
  const children = node.children

  if (!children) {
    return
  }

  for (let index = 0; index < children.length; index += 1) {
    const child = children[index]
    visitor(child, index, node)
    visitParents(child, visitor)
  }
}

export const demoBlockRemarkPlugin: Plugin = function demoBlockRemarkPlugin() {
  return (tree: Node) => {
    visitParents(tree, (node, index, parent) => {
      if (isPureTsxFence(node)) {
        node.meta = null
        return
      }

      if (!isDemoTsxFence(node) || !parent.children) {
        return
      }

      const code = node.value ?? ''
      const componentName = extractDemoComponentName(code)

      if (!componentName) {
        return
      }

      parent.children.splice(
        index,
        1,
        {
          type: 'mdxjsEsm',
          value: runtimeSourceFromDemoCode(code),
          data: { estree: undefined },
        },
        createDemoBlockNode(inferTitle(parent.children, index), componentName, code),
      )
    })
  }
}
