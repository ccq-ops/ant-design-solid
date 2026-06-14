import { fireEvent, render } from '@solidjs/testing-library'
import { MemoryRouter, Route, createMemoryHistory } from '@solidjs/router'
import { beforeEach, describe, expect, it } from 'vitest'
import PlaygroundPage from './playground'

describe('Playground page', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/playground')
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
})
