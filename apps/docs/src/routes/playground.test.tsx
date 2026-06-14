import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fireEvent, render } from '@solidjs/testing-library'
import { MemoryRouter, Route, createMemoryHistory } from '@solidjs/router'
import { beforeEach, describe, expect, it } from 'vitest'
import PlaygroundPage from './playground'

describe('Playground page', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/playground')
  })

  it('keeps a route css import for SolidStart route preload requests', () => {
    const routeSource = readFileSync(join(process.cwd(), 'src/routes/playground.tsx'), 'utf8')

    expect(routeSource).toContain("import './playground.css'")
  })

  it('keeps the preview stage wrapper visually minimal', () => {
    const routeSource = readFileSync(join(process.cwd(), 'src/routes/playground.tsx'), 'utf8')
    const stageClass = routeSource.match(/const playgroundStageClass = '([^']+)'/)?.[1]

    expect(stageClass).toBe('mt-2 min-h-96 py-2')
    expect(stageClass).not.toContain('overflow')
    expect(stageClass).not.toContain(' p-')
    expect(stageClass).not.toContain('px-')
    expect(stageClass).not.toContain('items-center')
    expect(stageClass).not.toContain('justify-center')
    expect(stageClass).not.toContain('rounded-md')
    expect(stageClass).not.toContain('border')
    expect(stageClass).not.toContain('bg-')
  })

  it('loads a registered demo id into an editable playground', () => {
    const history = createMemoryHistory()

    history.set({
      value: '/?demo=components/divider/basic',
      replace: true,
    })

    const result = render(() => (
      <MemoryRouter history={history}>
        <Route path="/" component={PlaygroundPage} />
      </MemoryRouter>
    ))
    const editor = result.getByLabelText('Playground source') as HTMLTextAreaElement

    expect(editor.value).toContain("import { Divider } from '@ant-design-solid/core'")
    expect(editor.value).toContain('export default Demo1')
    expect(result.queryByRole('alert')).toBeNull()
  })

  it('loads the code query param into an editable playground', () => {
    const source = `
import { Button } from '@ant-design-solid/core'

const Demo = function () {
  return <Button>Loaded from source</Button>
}

export default Demo
`.trim()

    const history = createMemoryHistory()

    history.set({
      value: `/?code=${encodeURIComponent(source)}`,
      replace: true,
    })

    const result = render(() => (
      <MemoryRouter history={history}>
        <Route path="/" component={PlaygroundPage} />
      </MemoryRouter>
    ))
    const editor = result.getByLabelText('Playground source') as HTMLTextAreaElement

    expect(result.getByRole('heading', { name: 'Playground', level: 1 })).toBeInTheDocument()
    expect(editor.value).toBe(source)
    expect(result.getByRole('button', { name: 'Loaded from source' })).toBeInTheDocument()

    fireEvent.input(editor, {
      target: {
        value: `
import { Button } from '@ant-design-solid/core'

const Demo = function () {
  return <Button>Edited source</Button>
}

export default Demo
`.trim(),
      },
    })

    expect(result.getByRole('button', { name: 'Edited source' })).toBeInTheDocument()
  })

  it('updates source when a client navigation changes the code query param', async () => {
    const history = createMemoryHistory()
    const source = `
import { Button } from '@ant-design-solid/core'

const Demo1 = function () {
  return <Button>Loaded after navigation</Button>
}
`.trim()

    const result = render(() => (
      <MemoryRouter history={history}>
        <Route path="/" component={PlaygroundPage} />
      </MemoryRouter>
    ))
    const editor = result.getByLabelText('Playground source') as HTMLTextAreaElement

    expect(editor.value).toBe('')
    expect(result.getByRole('alert')).toHaveTextContent(
      'The playground source must include a default export.',
    )

    history.set({
      value: `/?code=${encodeURIComponent(source)}`,
    })

    expect(
      await result.findByRole('button', { name: 'Loaded after navigation' }),
    ).toBeInTheDocument()
    expect(editor.value).toBe(source)
  })

  it('shows a readable error when a demo id cannot be found', () => {
    const history = createMemoryHistory()

    history.set({
      value: '/?demo=missing/demo',
      replace: true,
    })

    const result = render(() => (
      <MemoryRouter history={history}>
        <Route path="/" component={PlaygroundPage} />
      </MemoryRouter>
    ))

    expect(result.getByRole('alert')).toHaveTextContent('Playground demo not found: missing/demo')
  })
})
