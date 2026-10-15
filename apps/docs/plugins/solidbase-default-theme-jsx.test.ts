import { describe, expect, it } from 'vitest'
import {
  normalizeDefaultThemeLayoutSidebarPrefix,
  ownDefaultThemeGlobalMount,
} from './solidbase-default-theme-jsx'

describe('solidbase default theme JSX transforms', () => {
  it('normalizes sidebar prefixes before default theme navigation renders links', () => {
    const source = ['function Layout() {', '  return <Navigation sidebar={sidebar()}/>;', '}'].join(
      '\n',
    )

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

  it('owns the default theme global onMount computation', () => {
    const source = [
      'const [_mobileLayout, setMobileLayout] = createSignal(false);',
      'onMount(() => {',
      '    const query = createMediaQuery("(max-width: 1100px)");',
      '    setTimeout(() => setMobileLayout(query()));',
      '});',
      'export const mobileLayout = _mobileLayout;',
    ].join('\n')

    const result = ownDefaultThemeGlobalMount(
      source,
      '/node_modules/@kobalte/solidbase/dist/default-theme/globals.js?v=123',
    )

    expect(result).toContain(
      [
        'createRoot(() => {',
        '  onMount(() => {',
        '      const query = createMediaQuery("(max-width: 1100px)");',
        '      setTimeout(() => setMobileLayout(query()));',
        '  });',
        '});',
      ].join('\n'),
    )
    expect(result).toContain('export const mobileLayout = _mobileLayout;')
  })

  it('leaves unrelated global modules unchanged', () => {
    const source = 'onMount(() => {});'

    expect(
      ownDefaultThemeGlobalMount(
        source,
        '/node_modules/@kobalte/solidbase/dist/default-theme/context.jsx',
      ),
    ).toBe(source)
  })
})
