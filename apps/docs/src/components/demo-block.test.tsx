import { render, waitFor } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { DemoBlock, MarkdownTable } from './demo-block'

const ButtonDemo = () => <button type="button">Click</button>

describe('DemoBlock', () => {
  it('renders preview component, code, and Tailwind structural classes without a title', async () => {
    const result = render(() => <DemoBlock code="<Button>Click</Button>" component={ButtonDemo} />)

    const block = result.container.querySelector('section')
    const button = result.getByRole('button', { name: 'Click' })

    expect(result.queryByRole('heading')).not.toBeInTheDocument()
    expect(block).toHaveClass('my-4')
    expect(block).toHaveClass('overflow-hidden')
    expect(block).not.toHaveAttribute('aria-label')
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
    const result = render(() => <DemoBlock code="<Button>Click</Button>" component={ButtonDemo} />)

    const section = result.container.querySelector('section')
    const toggle = result.getByRole('button', { name: 'Show code' })
    const codeBody = section?.querySelector('[data-demo-block-code-body]')

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
      <DemoBlock code={'<Button type="primary">Click</Button>'} component={ButtonDemo} />
    ))

    const section = result.container.querySelector('section')

    await waitFor(() => {
      const pre = section?.querySelector('pre')

      expect(pre).toHaveClass('shiki')
      expect(pre).toHaveAttribute('data-language', 'tsx')
      expect(pre?.textContent).toBe('<Button type="primary">Click</Button>')
      expect(pre?.querySelector('span')).not.toBeNull()
    })
  })

  it('uses the requested language for highlighting', async () => {
    const result = render(() => (
      <DemoBlock language="bash" code="pnpm build" component={() => <p>Build command</p>} />
    ))

    const section = result.container.querySelector('section')

    await waitFor(() => {
      const pre = section?.querySelector('pre')

      expect(pre).toHaveAttribute('data-language', 'bash')
      expect(pre).toHaveClass('shiki')
      expect(pre?.textContent).toBe('pnpm build')
    })
  })

  it('falls back to plain escaped code when Shiki cannot load the language', async () => {
    const result = render(() => (
      <DemoBlock
        language="not-a-real-language"
        code={'<x dangerously="true">'}
        component={() => <p>Unknown language</p>}
      />
    ))

    const section = result.container.querySelector('section')

    await waitFor(() => {
      const pre = section?.querySelector('pre')
      const code = pre?.querySelector('code')

      expect(pre).toHaveAttribute('data-language', 'not-a-real-language')
      expect(pre).not.toHaveClass('shiki')
      expect(code?.innerHTML).toBe('&lt;x dangerously="true"&gt;')
    })
  })
})

describe('MarkdownTable', () => {
  it('wraps MDX tables in a scroll container while keeping native table layout', () => {
    const result = render(() => (
      <MarkdownTable>
        <thead>
          <tr>
            <th>Property</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>title</td>
            <td>JSX.Element</td>
          </tr>
        </tbody>
      </MarkdownTable>
    ))

    const table = result.getByRole('table')
    const wrapper = table.parentElement

    expect(wrapper).toHaveClass('docs-table-scroll')
    expect(wrapper).toHaveAttribute('data-mdx-table-scroll')
    expect(table).toHaveClass('docs-markdown-table')
  })
})
