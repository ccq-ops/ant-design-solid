import { describe, expect, it } from 'vitest'
import { renderDocsPage } from '../../test-utils/render-docs-page'
import ChangelogPage from './changelog.mdx'

describe('Changelog route', () => {
  it('renders package changelog markdown through the docs MDX components', () => {
    const result = renderDocsPage(() => <ChangelogPage />)

    expect(result.getByRole('heading', { name: 'Changelog', level: 1 })).toBeInTheDocument()
    expect(
      result.queryByRole('heading', { name: '@solid-ant-design/core', level: 1 }),
    ).not.toBeInTheDocument()
    expect(result.getByRole('heading', { name: '0.2.0', level: 2 })).toBeInTheDocument()
    expect(result.getByText(/release v0\.2\.0/)).toBeInTheDocument()
    expect(result.container.querySelector('pre')).toBeNull()
  })
})
