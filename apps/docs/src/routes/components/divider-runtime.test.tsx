import { describe, expect, it } from 'vitest'
import { renderDocsPage } from '../../test-utils/render-docs-page'
import { compilePlaygroundSource } from '../playground-runtime'
import DividerPage from './divider.mdx'

function renderDividerPage() {
  return renderDocsPage(() => <DividerPage />)
}

describe('Divider docs page', () => {
  it('renders all demos without undefined runtime references', () => {
    const result = renderDividerPage()

    expect(result.getByRole('heading', { name: 'Divider', level: 1 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Basic', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'With text', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Plain', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Vertical', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Variant', level: 3 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Size', level: 3 })).toBeInTheDocument()
    expect(result.container.querySelectorAll('[data-preview-root]')).toHaveLength(6)
    expect(result.container.querySelectorAll('[data-preview-stage]')).toHaveLength(6)
    expect(result.container.querySelectorAll('[data-preview-panel]')).toHaveLength(6)
  })

  it('collapses demo source and links real MDX source to the playground', () => {
    const result = renderDividerPage()
    const panel = result.container.querySelector('[data-preview-panel]') as HTMLElement
    const link = result.getAllByRole('link', { name: 'Open in playground' })[0]
    const params = new URLSearchParams(link.getAttribute('href')?.split('?')[1] ?? '')

    expect(panel).toHaveAttribute('data-collapsed', 'true')
    expect(result.getAllByRole('button', { name: 'Show code' })[0]).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(params.get('code')).toContain("import { Divider } from '@ant-design-solid/core'")
    expect(params.get('code')).toContain('export default Demo')
    expect(params.get('code')).not.toContain('.expressive-code')
  })

  it('links playground code that can be compiled by the runtime', () => {
    const result = renderDividerPage()
    const link = result.getAllByRole('link', { name: 'Open in playground' })[0]
    const params = new URLSearchParams(link.getAttribute('href')?.split('?')[1] ?? '')
    const code = params.get('code')

    expect(code).toBeTruthy()

    const compiled = compilePlaygroundSource(code ?? '')

    expect(compiled.ok).toBe(true)
  })
})
