import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { renderDocsPage } from '../../test-utils/render-docs-page'
import { ComponentOverview } from './components-overview'
import ComponentsPage from './index.mdx'

describe('ComponentOverview', () => {
  it('keeps static page copy in MDX while the component renders the searchable catalogue', () => {
    const result = renderDocsPage(() => <ComponentsPage />)

    expect(result.getByRole('heading', { name: 'Components', level: 1 })).toBeInTheDocument()
    expect(result.getByText(/Browse components by category/)).toBeInTheDocument()
    expect(result.getByRole('searchbox', { name: 'Search components' })).toBeInTheDocument()
    expect(result.getByRole('link', { name: 'Button' })).toHaveAttribute(
      'href',
      '/components/button',
    )
  })

  it('renders grouped component links from MDX frontmatter', () => {
    const result = render(() => <ComponentOverview />)

    expect(result.getByLabelText('Component catalogue')).toHaveClass('space-y-12')
    expect(result.getByLabelText('Component search')).toHaveClass('rounded-lg')
    expect(result.getByRole('searchbox', { name: 'Search components' })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'General', level: 2 })).toBeInTheDocument()
    expect(result.getByRole('heading', { name: 'Data Entry', level: 2 })).toBeInTheDocument()
    expect(result.getByRole('link', { name: 'Button' })).toHaveAttribute(
      'href',
      '/components/button',
    )
    expect(result.getByRole('link', { name: 'Input' })).toHaveAttribute('href', '/components/input')
  })

  it('filters component cards by name and shows an empty state', () => {
    const result = render(() => <ComponentOverview />)
    const search = result.getByRole('searchbox', { name: 'Search components' })

    fireEvent.input(search, { target: { value: 'input' } })

    expect(result.getByRole('link', { name: 'Input' })).toBeInTheDocument()
    expect(result.getByRole('link', { name: 'Input Number' })).toBeInTheDocument()
    expect(result.queryByRole('link', { name: 'Button' })).toBeNull()

    fireEvent.input(search, { target: { value: 'not-a-component' } })

    expect(result.getByText('No components found.')).toBeInTheDocument()
  })
})
