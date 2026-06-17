import { describe, expect, it } from 'vitest'
import { normalizeDefaultThemeLayoutSidebarPrefix } from './solidbase-default-theme-jsx'

describe('solidbase default theme JSX transforms', () => {
  it('normalizes sidebar prefixes before default theme navigation renders links', () => {
    const source = [
      'function Layout() {',
      '  return <Navigation sidebar={sidebar()}/>;',
      '}',
    ].join('\n')

    const result = normalizeDefaultThemeLayoutSidebarPrefix(
      source,
      '/node_modules/@kobalte/solidbase/dist/default-theme/Layout.jsx',
    )

    expect(result).toContain('function normalizeSidebarPrefix(sidebar) {')
    expect(result).toContain('<Navigation sidebar={normalizeSidebarPrefix(sidebar())}/>;')
  })

  it('leaves unrelated modules unchanged', () => {
    const source = 'export const value = <Navigation sidebar={sidebar()}/>;'

    expect(
      normalizeDefaultThemeLayoutSidebarPrefix(
        source,
        '/node_modules/@kobalte/solidbase/dist/default-theme/Header.jsx',
      ),
    ).toBe(source)
  })
})
