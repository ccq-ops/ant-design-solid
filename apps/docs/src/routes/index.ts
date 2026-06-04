import { lazy } from 'solid-js'
import type { Component } from 'solid-js'
import type { RouteDefinition } from '@solidjs/router'

type RouteModule = { default: Component }
type RouteImporter = () => Promise<RouteModule>

export type NavItem = {
  path: string
  label: string
}

export type TopNavItem = NavItem & {
  group: string
}

export type SideNavGroups = Record<string, NavItem[]>

export type SiteRoutes = {
  routes: RouteDefinition[]
  topNavItems: TopNavItem[]
  sideNavGroups: SideNavGroups
}

function isPageRouteFile(filePath: string) {
  return !/(^|\/)__tests__\//.test(filePath) && !/\.(?:test|spec)\.tsx$/.test(filePath)
}

export function routePathFromFilePath(filePath: string) {
  const withoutPrefix = filePath
    .replace(/^\/src\/pages\//, '')
    .replace(/^\.\.\/pages\//, '')
    .replace(/^\.\/pages\//, '')
  const withoutExtension = withoutPrefix.replace(/\.tsx$/, '')
  const segments = withoutExtension.split('/')

  if (segments.at(-1) === 'index') {
    segments.pop()
  }

  const routePath = segments.join('/')
  return routePath ? `/${routePath}` : '/'
}

function labelFromSegment(segment: string) {
  return segment
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function labelFromRoutePath(path: string) {
  if (path === '/') {
    return 'Home'
  }

  const segment = path.split('/').at(-1) ?? ''

  return labelFromSegment(segment)
}

function groupFromRoutePath(path: string) {
  if (path === '/') {
    return undefined
  }

  return path.split('/').filter(Boolean).at(0)
}

export function createSiteRoutesFromModules(modules: Record<string, RouteImporter>): SiteRoutes {
  const pageEntries = Object.entries(modules)
    .filter(([filePath]) => isPageRouteFile(filePath))
    .sort(([a], [b]) => routePathFromFilePath(a).localeCompare(routePathFromFilePath(b)))

  const siteRoutes = pageEntries.reduce<SiteRoutes>(
    (routesConfig, [filePath, importer]) => {
      const path = routePathFromFilePath(filePath)
      const group = groupFromRoutePath(path)

      routesConfig.routes.push({
        path,
        component: lazy(importer),
      })

      if (group) {
        routesConfig.sideNavGroups[group] ??= []
        routesConfig.sideNavGroups[group].push({
          path,
          label: labelFromRoutePath(path),
        })
      }

      return routesConfig
    },
    { routes: [], topNavItems: [], sideNavGroups: {} },
  )

  siteRoutes.topNavItems = Object.entries(siteRoutes.sideNavGroups).map(([group, items]) => ({
    group,
    path: items[0]?.path ?? `/${group}`,
    label: labelFromSegment(group),
  }))

  return siteRoutes
}

const routeModules = import.meta.glob<RouteModule>([
  '/src/pages/**/*.tsx',
  '!/src/pages/**/*.test.tsx',
  '!/src/pages/**/*.spec.tsx',
  '!/src/pages/**/__tests__/**/*.tsx',
])
const siteRoutes = createSiteRoutesFromModules(routeModules)

export const routes = siteRoutes.routes
export const topNavItems = siteRoutes.topNavItems
export const sideNavGroups = siteRoutes.sideNavGroups
