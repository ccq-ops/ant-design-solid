import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

const virtualModuleId = 'virtual:docs-playground-registry'
const resolvedVirtualModuleId = `\0${virtualModuleId}`

type DemoSource = {
  id: string
  source: string
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeSource(source: string) {
  return source.trim().replace(/\r\n?/g, '\n')
}

function ensureUniqueId(id: string, usedIds: Set<string>) {
  if (!usedIds.has(id)) {
    usedIds.add(id)
    return id
  }

  let index = 2
  let nextId = `${id}-${index}`

  while (usedIds.has(nextId)) {
    index += 1
    nextId = `${id}-${index}`
  }

  usedIds.add(nextId)

  return nextId
}

function parseDemoSources(routeId: string, mdxSource: string): DemoSource[] {
  const demos: DemoSource[] = []
  const usedIds = new Set<string>()
  const previewPattern =
    /###\s+(.+?)\n[\s\S]*?:::preview[\s\S]*?```(?:tsx|jsx|ts|js)(?:[^\n]*)\n([\s\S]*?)```[\s\S]*?:::/g

  for (const match of mdxSource.matchAll(previewPattern)) {
    const title = match[1] ?? ''
    const source = match[2] ?? ''
    const titleSlug = slugify(title)

    if (!titleSlug || !source.trim()) continue

    demos.push({
      id: ensureUniqueId(`${routeId}/${titleSlug}`, usedIds),
      source: normalizeSource(source),
    })
  }

  return demos
}

function readDemoSources(directory: string): DemoSource[] {
  const demos: DemoSource[] = []

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      demos.push(...readDemoSources(entryPath))
      continue
    }

    if (!entry.isFile() || !entry.name.endsWith('.mdx')) continue

    const routeId = path
      .relative(path.join(process.cwd(), 'src/routes'), entryPath)
      .replace(/\\/g, '/')
      .replace(/\.mdx$/, '')

    demos.push(...parseDemoSources(routeId, fs.readFileSync(entryPath, 'utf8')))
  }

  return demos
}

export function playgroundRegistryPlugin(): Plugin {
  return {
    name: 'docs-playground-registry',
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id !== resolvedVirtualModuleId) return

      const routesDirectory = path.join(process.cwd(), 'src/routes')

      return `export const demoSources = ${JSON.stringify(readDemoSources(routesDirectory))}`
    },
  }
}
