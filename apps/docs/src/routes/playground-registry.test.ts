import { describe, expect, it } from 'vitest'
import {
  demoIdFromSource,
  getDemoSource,
  getDemoSourceById,
  getRegisteredDemoIds,
  parseDemoSources,
} from './playground-registry'

const dividerSource = `
---
title: Divider
group: Layout
---

# Divider

### Basic

:::preview

<DividerDemo001 />

---

\`\`\`tsx
import { Divider } from '@ant-design-solid/core'

const Demo1 = function () {
  return <Divider />
}

export default Demo1
\`\`\`

:::

### With text

:::preview

<DividerDemo002 />

---

\`\`\`tsx
import { Divider } from '@ant-design-solid/core'

const Demo2 = function () {
  return <Divider>Text</Divider>
}

export default Demo2
\`\`\`

:::
`

describe('playground registry', () => {
  it('extracts stable demo ids from an MDX page', () => {
    expect(parseDemoSources('components/divider', dividerSource)).toEqual([
      {
        id: 'components/divider/basic',
        source:
          "import { Divider } from '@ant-design-solid/core'\n\nconst Demo1 = function () {\n  return <Divider />\n}\n\nexport default Demo1",
      },
      {
        id: 'components/divider/with-text',
        source:
          "import { Divider } from '@ant-design-solid/core'\n\nconst Demo2 = function () {\n  return <Divider>Text</Divider>\n}\n\nexport default Demo2",
      },
    ])
  })

  it('finds a registered demo id by source code', () => {
    expect(getRegisteredDemoIds()).toContain('components/divider/basic')

    const demo = getDemoSourceById('components/divider/basic')

    expect(demo?.source).toContain("import { Divider } from '@ant-design-solid/core'")
    expect(demoIdFromSource(demo?.source ?? '')).toBe('components/divider/basic')
  })

  it('falls back to the code query param when no demo id is provided', () => {
    const source = 'const Demo = () => null'

    expect(getDemoSource(`?code=${encodeURIComponent(source)}`)).toEqual({
      source,
      sourceType: 'code',
    })
  })

  it('returns a readable error for an unknown demo id', () => {
    expect(getDemoSource('?demo=missing/demo')).toEqual({
      source: '',
      sourceType: 'missing-demo',
      error: 'Playground demo not found: missing/demo',
    })
  })
})
