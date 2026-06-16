import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { compilePlaygroundSource } from './playground-runtime'

describe('compilePlaygroundSource', () => {
  it('compiles a docs TSX demo into a renderable Solid component', () => {
    const result = compilePlaygroundSource(`
import { Button } from '@solid-ant-design/core'

const Demo = function () {
  return <Button>Run me</Button>
}

export default Demo
`)

    if (!result.ok) {
      throw new Error(result.error)
    }

    const rendered = render(() => <result.component />)

    expect(rendered.getByRole('button', { name: 'Run me' })).toBeInTheDocument()
  })

  it('supports aliased named imports and Solid utilities', () => {
    const result = compilePlaygroundSource(`
import { createSignal } from 'solid-js'
import { Button as AntButton } from '@solid-ant-design/core'

const Demo = function () {
  const [count] = createSignal(2)

  return <AntButton>Count {count()}</AntButton>
}

export default Demo
`)

    if (!result.ok) {
      throw new Error(result.error)
    }

    const rendered = render(() => <result.component />)

    expect(rendered.getByRole('button', { name: 'Count 2' })).toBeInTheDocument()
  })

  it('supports fragments and ignores type-only imports', () => {
    const result = compilePlaygroundSource(`
import { Button, type ButtonProps } from '@solid-ant-design/core'

const buttonType: ButtonProps['type'] = 'primary'

const Demo = function () {
  return (
    <>
      <Button type={buttonType}>First</Button>
      <Button>Second</Button>
    </>
  )
}

export default Demo
`)

    if (!result.ok) {
      throw new Error(result.error)
    }

    const rendered = render(() => <result.component />)

    expect(rendered.getByRole('button', { name: 'First' })).toBeInTheDocument()
    expect(rendered.getByRole('button', { name: 'Second' })).toBeInTheDocument()
  })

  it('returns a readable error when the source has no default export', () => {
    const result = compilePlaygroundSource('const value = true')

    expect(result).toEqual({
      ok: false,
      error: 'The playground source must include a default export.',
    })
  })

  it('wraps a JSX snippet into a renderable component', () => {
    const result = compilePlaygroundSource(`
import { Button } from '@solid-ant-design/core'

<Button>Snippet</Button>
`)

    if (!result.ok) {
      throw new Error(result.error)
    }

    const rendered = render(() => <result.component />)

    expect(rendered.getByRole('button', { name: 'Snippet' })).toBeInTheDocument()
  })

  it('uses a Demo declaration when the source omits a default export', () => {
    const result = compilePlaygroundSource(`
import { Button } from '@solid-ant-design/core'

const Demo = function () {
  return <Button>Implicit demo</Button>
}
`)

    if (!result.ok) {
      throw new Error(result.error)
    }

    const rendered = render(() => <result.component />)

    expect(rendered.getByRole('button', { name: 'Implicit demo' })).toBeInTheDocument()
  })

  it('uses a numbered Demo declaration when the source omits a default export', () => {
    const result = compilePlaygroundSource(`
import { Button } from '@solid-ant-design/core'

const Demo1 = function () {
  return <Button>Numbered demo</Button>
}
`)

    if (!result.ok) {
      throw new Error(result.error)
    }

    const rendered = render(() => <result.component />)

    expect(rendered.getByRole('button', { name: 'Numbered demo' })).toBeInTheDocument()
  })
})
