import { describe, expect, it } from 'vitest'
import { createSiteRoutesFromModules, routePathFromFilePath } from './index'

function Page() {
  return null
}

describe('routePathFromFilePath', () => {
  it('maps index files to their parent page route path', () => {
    expect(routePathFromFilePath('./pages/index.tsx')).toBe('/')
    expect(routePathFromFilePath('./pages/docs/index.tsx')).toBe('/docs')
  })

  it('maps nested page files to kebab-case URL paths', () => {
    expect(routePathFromFilePath('./pages/docs/getting-started.tsx')).toBe('/docs/getting-started')
    expect(routePathFromFilePath('./pages/components/config-provider.tsx')).toBe(
      '/components/config-provider',
    )
  })
})

describe('createSiteRoutesFromModules', () => {
  it('creates sorted lazy route definitions and navigation groups from page modules', () => {
    const siteRoutes = createSiteRoutesFromModules({
      './pages/components/button.tsx': () => Promise.resolve({ default: Page }),
      './pages/components/alert.tsx': () => Promise.resolve({ default: Page }),
      './pages/index.tsx': () => Promise.resolve({ default: Page }),
      './pages/docs/theming.tsx': () => Promise.resolve({ default: Page }),
      './pages/docs/getting-started.tsx': () => Promise.resolve({ default: Page }),
      './pages/design-guides/overview.tsx': () => Promise.resolve({ default: Page }),
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
      './pages/components/button.spec.tsx': () => Promise.resolve({ default: Page }),
      './pages/components/button.test.tsx': () => Promise.resolve({ default: Page }),
      './pages/components/button.tsx': () => Promise.resolve({ default: Page }),
      './pages/index.spec.tsx': () => Promise.resolve({ default: Page }),
      './pages/index.test.tsx': () => Promise.resolve({ default: Page }),
      './pages/index.tsx': () => Promise.resolve({ default: Page }),
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
