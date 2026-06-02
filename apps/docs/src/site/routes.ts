import { lazy } from 'solid-js'
import type { Component } from 'solid-js'
import type { RouteDefinition } from '@solidjs/router'

type RouteModule = { default: Component }
type RouteImporter = () => Promise<RouteModule>

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

export function createRoutesFromModules(modules: Record<string, RouteImporter>): RouteDefinition[] {
  return Object.entries(modules)
    .map(([filePath, importer]) => ({
      path: routePathFromFilePath(filePath),
      component: lazy(importer),
    }))
    .sort((a, b) => String(a.path).localeCompare(String(b.path)))
}

export const routes = createRoutesFromModules(import.meta.glob<RouteModule>('../routes/**/*.tsx'))
