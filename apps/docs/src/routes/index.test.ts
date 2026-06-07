import { describe, expect, it } from 'vitest'
import { createSiteRoutesFromModules, routePathFromFilePath, routes, topNavItems } from './index'

function Page() {
  return null
}

describe('routePathFromFilePath', () => {
  it('maps index files to their parent page route path', () => {
    expect(routePathFromFilePath('./pages/index.tsx')).toBe('/')
    expect(routePathFromFilePath('./pages/docs/index.tsx')).toBe('/docs')
  })

  it('maps nested TSX and MDX page files to kebab-case URL paths', () => {
    expect(routePathFromFilePath('./pages/docs/getting-started.tsx')).toBe('/docs/getting-started')
    expect(routePathFromFilePath('./pages/docs/getting-started.mdx')).toBe('/docs/getting-started')
    expect(routePathFromFilePath('./pages/components/config-provider.tsx')).toBe(
      '/components/config-provider',
    )
    expect(routePathFromFilePath('./pages/components/config-provider.mdx')).toBe(
      '/components/config-provider',
    )
  })
})

describe('createSiteRoutesFromModules', () => {
  it('creates sorted lazy route definitions and navigation groups from MDX page modules', () => {
    const siteRoutes = createSiteRoutesFromModules({
      './pages/components/button.mdx': () => Promise.resolve({ default: Page }),
      './pages/components/alert.mdx': () => Promise.resolve({ default: Page }),
      './pages/index.mdx': () => Promise.resolve({ default: Page }),
      './pages/docs/theming.mdx': () => Promise.resolve({ default: Page }),
      './pages/docs/getting-started.mdx': () => Promise.resolve({ default: Page }),
      './pages/design-guides/overview.mdx': () => Promise.resolve({ default: Page }),
    })

    expect(siteRoutes.routes.map((route) => route.path)).toEqual([
      '/',
      '/components/alert',
      '/components/button',
      '/design-guides/overview',
      '/docs/getting-started',
      '/docs/theming',
    ])
    expect(siteRoutes.routes.every((route) => typeof route.component === 'function')).toBe(true)
    expect(siteRoutes.topNavItems).toEqual([
      { group: 'components', path: '/components/alert', label: 'Components' },
      { group: 'design-guides', path: '/design-guides/overview', label: 'Design Guides' },
      { group: 'docs', path: '/docs/getting-started', label: 'Docs' },
    ])
    expect(siteRoutes.sideNavGroups).toEqual({
      components: [
        { path: '/components/alert', label: 'Alert' },
        { path: '/components/button', label: 'Button' },
      ],
      'design-guides': [{ path: '/design-guides/overview', label: 'Overview' }],
      docs: [
        { path: '/docs/getting-started', label: 'Getting Started' },
        { path: '/docs/theming', label: 'Theming' },
      ],
    })
  })

  it('ignores test files when creating docs pages', () => {
    const siteRoutes = createSiteRoutesFromModules({
      './pages/__tests__/index.tsx': () => Promise.resolve({ default: Page }),
      './pages/components/__tests__/button.tsx': () => Promise.resolve({ default: Page }),
      './pages/components/button.spec.mdx': () => Promise.resolve({ default: Page }),
      './pages/components/button.spec.tsx': () => Promise.resolve({ default: Page }),
      './pages/components/button.test.mdx': () => Promise.resolve({ default: Page }),
      './pages/components/button.test.tsx': () => Promise.resolve({ default: Page }),
      './pages/components/button.mdx': () => Promise.resolve({ default: Page }),
      './pages/index.spec.mdx': () => Promise.resolve({ default: Page }),
      './pages/index.spec.tsx': () => Promise.resolve({ default: Page }),
      './pages/index.test.mdx': () => Promise.resolve({ default: Page }),
      './pages/index.test.tsx': () => Promise.resolve({ default: Page }),
      './pages/index.mdx': () => Promise.resolve({ default: Page }),
    })

    expect(siteRoutes.routes.map((route) => route.path)).toEqual(['/', '/components/button'])
    expect(siteRoutes.topNavItems).toEqual([
      { group: 'components', path: '/components/button', label: 'Components' },
    ])
    expect(siteRoutes.sideNavGroups).toEqual({
      components: [{ path: '/components/button', label: 'Button' }],
    })
  })
})

describe('docs route module discovery', () => {
  it('discovers page modules from the nested routes directory', () => {
    expect(routes.length).toBeGreaterThan(0)
    expect(routes.map((route) => route.path)).toContain('/')
    expect(routes.map((route) => route.path)).toContain('/components/button')
    expect(topNavItems.map((item) => item.group)).toContain('components')
  })

  it('discovers the migrated docs site from MDX page files without legacy TSX pages', () => {
    expect(routes.map((route) => route.path)).toContain('/')
    expect(routes.map((route) => route.path)).toContain('/components/button')
    expect(routes.map((route) => route.path)).toContain('/docs/getting-started')
  })
})
