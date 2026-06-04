import { describe, expect, it } from 'vitest'
import { createSiteRoutesFromModules, routePathFromFilePath } from './routes'

function Page() {
  return null
}

describe('routePathFromFilePath', () => {
  it('maps index files to their parent route path', () => {
    expect(routePathFromFilePath('./routes/index.tsx')).toBe('/')
    expect(routePathFromFilePath('./routes/docs/index.tsx')).toBe('/docs')
  })

  it('maps nested route files to kebab-case URL paths', () => {
    expect(routePathFromFilePath('./routes/docs/getting-started.tsx')).toBe('/docs/getting-started')
    expect(routePathFromFilePath('./routes/components/config-provider.tsx')).toBe(
      '/components/config-provider',
    )
  })
})

describe('createSiteRoutesFromModules', () => {
  it('creates sorted lazy route definitions and navigation items from route modules', () => {
    const siteRoutes = createSiteRoutesFromModules({
      './routes/components/button.tsx': () => Promise.resolve({ default: Page }),
      './routes/index.tsx': () => Promise.resolve({ default: Page }),
      './routes/docs/getting-started.tsx': () => Promise.resolve({ default: Page }),
    })

    expect(siteRoutes.routes.map((route) => route.path)).toEqual([
      '/',
      '/components/button',
      '/docs/getting-started',
    ])
    expect(siteRoutes.routes.every((route) => typeof route.component === 'function')).toBe(true)
    expect(siteRoutes.navItems).toEqual([
      { path: '/', label: 'Home' },
      { path: '/components/button', label: 'Button' },
      { path: '/docs/getting-started', label: 'Getting Started' },
    ])
  })

  it('ignores test files when creating docs pages', () => {
    const siteRoutes = createSiteRoutesFromModules({
      './routes/__tests__/index.tsx': () => Promise.resolve({ default: Page }),
      './routes/components/__tests__/button.tsx': () => Promise.resolve({ default: Page }),
      './routes/components/button.spec.tsx': () => Promise.resolve({ default: Page }),
      './routes/components/button.test.tsx': () => Promise.resolve({ default: Page }),
      './routes/components/button.tsx': () => Promise.resolve({ default: Page }),
      './routes/index.spec.tsx': () => Promise.resolve({ default: Page }),
      './routes/index.test.tsx': () => Promise.resolve({ default: Page }),
      './routes/index.tsx': () => Promise.resolve({ default: Page }),
    })

    expect(siteRoutes.routes.map((route) => route.path)).toEqual(['/', '/components/button'])
    expect(siteRoutes.navItems).toEqual([
      { path: '/', label: 'Home' },
      { path: '/components/button', label: 'Button' },
    ])
  })
})
