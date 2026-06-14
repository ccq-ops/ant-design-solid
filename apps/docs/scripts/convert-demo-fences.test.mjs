import { describe, expect, it } from 'vitest'
import { convertMdxDemoFences } from './convert-demo-fences.mjs'

describe('convertMdxDemoFences', () => {
  it('converts a TSX default export fence to a SolidBase preview', () => {
    const input = `# Button

\`\`\`tsx
import { Button } from '@ant-design-solid/core'

const Demo = function () {
  return <Button>Click</Button>
}

export default Demo
\`\`\`
`

    const result = convertMdxDemoFences(input, 'apps/docs/src/routes/components/button.mdx')

    expect(result.convertedCount).toBe(1)
    expect(result.output).toContain("import { Button } from '@ant-design-solid/core'\n\n# Button")
    expect(result.output).toContain(':::preview')
    expect(result.output).toContain('<ButtonDemo001 />')
    expect(result.output).toContain('---\n\n```tsx')
    expect(result.output).toContain('export const ButtonDemo001 = (() => {')
    expect(result.output).toContain('const Demo = function () {')
    expect(result.output).toContain('return Demo')
    expect(result.output).not.toContain('export default Demo\n\n::')
    expect(result.output).toContain('export default Demo\n```')
  })

  it('leaves pure TSX and TSX without a default export unchanged', () => {
    const input = `# Setup

\`\`\`tsx pure
import { render } from 'solid-js/web'
render(() => <App />, document.body)
\`\`\`

\`\`\`tsx
const helper = <span>Only source</span>
\`\`\`
`

    const result = convertMdxDemoFences(input, 'apps/docs/src/routes/docs/getting-started.mdx')

    expect(result.convertedCount).toBe(0)
    expect(result.output).toBe(input)
  })

  it('dedupes repeated imports and scopes duplicate helper names in separate IIFEs', () => {
    const input = `# Avatar

\`\`\`tsx
import { Avatar } from '@ant-design-solid/core'

const helper = 'A'
const Demo = function () {
  return <Avatar>{helper}</Avatar>
}

export default Demo
\`\`\`

\`\`\`tsx
import { Avatar } from '@ant-design-solid/core'

const helper = 'B'
const Demo = function () {
  return <Avatar>{helper}</Avatar>
}

export default Demo
\`\`\`
`

    const result = convertMdxDemoFences(input, 'apps/docs/src/routes/components/avatar.mdx')

    expect(result.convertedCount).toBe(2)
    const modulePreamble = result.output.slice(0, result.output.indexOf('# Avatar'))
    expect(
      modulePreamble.match(/import \{ Avatar \} from '@ant-design-solid\/core'/g),
    ).toHaveLength(1)
    expect(result.output).toContain('export const AvatarDemo001 = (() => {')
    expect(result.output).toContain('export const AvatarDemo002 = (() => {')
    expect(result.output).toContain('<AvatarDemo001 />')
    expect(result.output).toContain('<AvatarDemo002 />')
  })

  it('throws when imports from the same module bind a local name to different imports', () => {
    const input = `# Conflict

\`\`\`tsx
import { Button as Control } from '@ant-design-solid/core'

const Demo = function () {
  return <Control />
}

export default Demo
\`\`\`

\`\`\`tsx
import { Input as Control } from '@ant-design-solid/core'

const Demo = function () {
  return <Control />
}

export default Demo
\`\`\`
`

    expect(() =>
      convertMdxDemoFences(input, 'apps/docs/src/routes/components/conflict.mdx'),
    ).toThrow(/Import binding conflict for "Control"/)
  })

  it('wraps adjacent JSX return roots in a fragment for executable MDX', () => {
    const input = `# Modal

\`\`\`tsx
import { Button } from '@ant-design-solid/core'

const Demo = function () {
  return (
    <Button>Open</Button>
    <Button>Close</Button>
  )
}

export default Demo
\`\`\`
`

    const result = convertMdxDemoFences(input, 'apps/docs/src/routes/components/modal.mdx')

    expect(result.convertedCount).toBe(1)
    expect(result.output).toContain('return (<>')
    expect(result.output).toContain('<Button>Open</Button>')
    expect(result.output).toContain('<Button>Close</Button>')
    expect(result.output).toContain('</>)')
    expect(result.output).toContain(`return (
    <Button>Open</Button>
    <Button>Close</Button>
  )`)
  })

  it('preserves an already converted preview block when rerun', () => {
    const input = `import { Button } from '@ant-design-solid/core'

# Button

:::preview

<ButtonDemo001 />

export const ButtonDemo001 = (() => {
  const Demo = function () {
      return <Button>Click</Button>;
  };

  return Demo
})()

---

\`\`\`tsx
import { Button } from '@ant-design-solid/core'

const Demo = function () {
  return <Button>Click</Button>
}

export default Demo
\`\`\`

:::
`

    const result = convertMdxDemoFences(input, 'apps/docs/src/routes/components/button.mdx')

    expect(result.convertedCount).toBe(0)
    expect(result.output).toBe(input)
  })

  it('does not hoist imports that are erased from the executable copy as types', () => {
    const input = `# Flex

\`\`\`tsx
import { createSignal, JSX } from 'solid-js'
import { Flex, type FlexProps } from '@ant-design-solid/core'

const Demo = function () {
  const [gap] = createSignal<FlexProps['gap']>('small')
  const node: JSX.Element = <Flex gap={gap()}>Item</Flex>

  return node
}

export default Demo
\`\`\`
`

    const result = convertMdxDemoFences(input, 'apps/docs/src/routes/components/flex.mdx')
    const modulePreamble = result.output.slice(0, result.output.indexOf('# Flex'))

    expect(result.convertedCount).toBe(1)
    expect(modulePreamble).toContain("import { createSignal } from 'solid-js'")
    expect(modulePreamble).toContain("import { Flex } from '@ant-design-solid/core'")
    expect(modulePreamble).not.toContain('JSX')
    expect(modulePreamble).not.toContain('FlexProps')
    expect(result.output).toContain("import { createSignal, JSX } from 'solid-js'")
    expect(result.output).toContain("import { Flex, type FlexProps } from '@ant-design-solid/core'")
  })
})
