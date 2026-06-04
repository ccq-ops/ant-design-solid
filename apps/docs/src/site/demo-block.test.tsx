import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { DemoBlock } from './demo-block'

describe('DemoBlock', () => {
  it('renders title, preview, code, and Tailwind structural classes', () => {
    const result = render(() => (
      <DemoBlock title="Basic" code="<Button>Click</Button>">
        <button type="button">Click</button>
      </DemoBlock>
    ))

    const heading = result.getByRole('heading', { name: 'Basic', level: 3 })
    const block = heading.closest('section')
    const button = result.getByRole('button', { name: 'Click' })
    const code = result.getByText('<Button>Click</Button>')

    expect(block).toHaveClass('my-6')
    expect(block).toHaveClass('overflow-hidden')
    expect(heading).toHaveClass('border-b')
    expect(button.parentElement).toHaveClass('p-6')
    expect(code.parentElement).toHaveClass('overflow-auto')
  })
})
