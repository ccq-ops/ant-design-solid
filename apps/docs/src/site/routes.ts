import { lazy } from 'solid-js'
import type { Component } from 'solid-js'
import type { RouteDefinition } from '@solidjs/router'

type RouteModule = { default: Component }
type RouteImporter = () => Promise<RouteModule>

export type NavItem = {
  path: string
  label: string
}

export type SiteRoutes = {
  routes: RouteDefinition[]
  navItems: NavItem[]
}

export function routePathFromFilePath(filePath: string) {
  const withoutPrefix = filePath.replace(/^\.\.\/routes\//, '').replace(/^\.\/routes\//, '')
  const withoutExtension = withoutPrefix.replace(/\.tsx$/, '')
  const segments = withoutExtension.split('/')

  if (segments.at(-1) === 'index') {
    segments.pop()
  }

  const routePath = segments.join('/')
  return routePath ? `/${routePath}` : '/'
}

function labelFromRoutePath(path: string) {
  if (path === '/') {
    return 'Home'
  }

  const segment = path.split('/').at(-1) ?? ''

  return segment
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function createSiteRoutesFromModules(modules: Record<string, RouteImporter>): SiteRoutes {
  return Object.entries(modules)
    .sort(([a], [b]) => routePathFromFilePath(a).localeCompare(routePathFromFilePath(b)))
    .reduce<SiteRoutes>(
      (siteRoutes, [filePath, importer]) => {
        const path = routePathFromFilePath(filePath)

        siteRoutes.routes.push({
          path,
          component: lazy(importer),
        })
        siteRoutes.navItems.push({
          path,
          label: labelFromRoutePath(path),
        })

        return siteRoutes
      },
      { routes: [], navItems: [] },
    )
}

const routeModules = import.meta.glob<RouteModule>('../routes/**/*.tsx')
const siteRoutes = createSiteRoutesFromModules(routeModules)

export const routes = siteRoutes.routes
export const navItems = siteRoutes.navItems
