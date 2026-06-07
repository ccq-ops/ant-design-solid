import { render, waitFor } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { DemoBlock } from './demo-block'

describe('DemoBlock', () => {
  it('renders title, preview, code, and Tailwind structural classes', async () => {
    const result = render(() => (
      <DemoBlock title="Basic" code="<Button>Click</Button>">
        <button type="button">Click</button>
      </DemoBlock>
    ))

    const heading = result.getByRole('heading', { name: 'Basic', level: 3 })
    const block = heading.closest('section')
    const button = result.getByRole('button', { name: 'Click' })

    expect(block).toHaveClass('my-4')
    expect(block).toHaveClass('overflow-hidden')
    expect(heading).toHaveClass('px-4')
    expect(heading).toHaveClass('py-2.5')
    expect(result.getByText('Example')).toHaveClass('uppercase')
    expect(result.getByText('Code').parentElement).toHaveClass('uppercase')
    expect(button.closest('[data-demo-block-preview]')).toHaveClass('docs-demo-preview')
    expect(button.closest('[data-demo-block-preview]')).toHaveClass('px-4')

    await waitFor(() => {
      const codeSection = block?.querySelector('[data-demo-block-code]')
      const pre = codeSection?.querySelector('pre')

      expect(codeSection).toHaveClass('border-t')
      expect(codeSection).toHaveClass('docs-surface-subtle')
      expect(pre).toHaveClass('overflow-auto')
      expect(pre).toHaveClass('text-xs')
      expect(pre?.textContent).toBe('<Button>Click</Button>')
    })
  })

  it('collapses code by default and expands it when clicked', async () => {
    const result = render(() => (
      <DemoBlock title="Expandable" code="<Button>Click</Button>">
        <button type="button">Click</button>
      </DemoBlock>
    ))

    const section = result.getByLabelText('Expandable')
    const toggle = result.getByRole('button', { name: 'Show code' })
    const codeBody = section.querySelector('[data-demo-block-code-body]')

    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(codeBody).toHaveClass('hidden')

    toggle.click()

    await waitFor(() => {
      expect(result.getByRole('button', { name: 'Hide code' })).toHaveAttribute(
        'aria-expanded',
        'true',
      )
      expect(codeBody).not.toHaveClass('hidden')
      expect(codeBody?.querySelector('pre')?.textContent).toBe('<Button>Click</Button>')
    })
  })

  it('highlights TSX code by default with Shiki markup', async () => {
    const result = render(() => (
      <DemoBlock title="Default language" code={'<Button type="primary">Click</Button>'}>
        <button type="button">Click</button>
      </DemoBlock>
    ))

    const section = result.getByLabelText('Default language')

    await waitFor(() => {
      const pre = section.querySelector('pre')

      expect(pre).toHaveClass('shiki')
      expect(pre).toHaveAttribute('data-language', 'tsx')
      expect(pre?.textContent).toBe('<Button type="primary">Click</Button>')
      expect(pre?.querySelector('span')).not.toBeNull()
    })
  })

  it('uses the requested language for highlighting', async () => {
    const result = render(() => (
      <DemoBlock title="Shell" language="bash" code="pnpm build">
        <p>Build command</p>
      </DemoBlock>
    ))

    const section = result.getByLabelText('Shell')

    await waitFor(() => {
      const pre = section.querySelector('pre')

      expect(pre).toHaveAttribute('data-language', 'bash')
      expect(pre).toHaveClass('shiki')
      expect(pre?.textContent).toBe('pnpm build')
    })
  })

  it('falls back to plain escaped code when Shiki cannot load the language', async () => {
    const result = render(() => (
      <DemoBlock title="Unknown" language="not-a-real-language" code={'<x dangerously="true">'}>
        <p>Unknown language</p>
      </DemoBlock>
    ))

    const section = result.getByLabelText('Unknown')

    await waitFor(() => {
      const pre = section.querySelector('pre')
      const code = pre?.querySelector('code')

      expect(pre).toHaveAttribute('data-language', 'not-a-real-language')
      expect(pre).not.toHaveClass('shiki')
      expect(code?.innerHTML).toBe('&lt;x dangerously="true"&gt;')
    })
  })
})
