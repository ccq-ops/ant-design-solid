import { describe, expect, it } from 'vitest'
import { createRoutesFromModules, routePathFromFilePath } from './routes'
import { navItems } from './nav'

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

describe('createRoutesFromModules', () => {
  it('creates sorted lazy route definitions from route modules', () => {
    const routes = createRoutesFromModules({
      './routes/components/button.tsx': () => Promise.resolve({ default: Page }),
      './routes/index.tsx': () => Promise.resolve({ default: Page }),
      './routes/docs/getting-started.tsx': () => Promise.resolve({ default: Page }),
    })

    expect(routes.map((route) => route.path)).toEqual([
      '/',
      '/components/button',
      '/docs/getting-started',
    ])
    expect(routes.every((route) => typeof route.component === 'function')).toBe(true)
  })
})

describe('component navigation', () => {
  it('includes example pages for recently added components', () => {
    expect(navItems).toEqual(
      expect.arrayContaining([
        { path: '/components/mentions', label: 'Mentions' },
        { path: '/components/popover', label: 'Popover' },
        { path: '/components/splitter', label: 'Splitter' },
        { path: '/components/tour', label: 'Tour' },
      ]),
    )
  })
})
