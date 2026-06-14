import { demoSources as registeredDemoSources } from 'virtual:docs-playground-registry'

type DemoSource = {
  id: string
  source: string
}

type DemoSourceResult =
  | { sourceType: 'demo'; source: string; demoId: string }
  | { sourceType: 'code'; source: string }
  | { sourceType: 'missing-demo'; source: ''; error: string }

let demoSources: DemoSource[] | undefined
let demoSourceById: Map<string, DemoSource> | undefined
let demoIdBySource: Map<string, string> | undefined

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

export function parseDemoSources(routeId: string, mdxSource: string): DemoSource[] {
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

function getDemoSources() {
  if (demoSources) return demoSources

  demoSources = registeredDemoSources

  return demoSources
}

function getDemoSourceByIdMap() {
  if (demoSourceById) return demoSourceById

  demoSourceById = new Map(getDemoSources().map((demo) => [demo.id, demo]))

  return demoSourceById
}

function getDemoIdBySourceMap() {
  if (demoIdBySource) return demoIdBySource

  demoIdBySource = new Map(getDemoSources().map((demo) => [normalizeSource(demo.source), demo.id]))

  return demoIdBySource
}

export function getDemoSourceById(id: string) {
  return getDemoSourceByIdMap().get(id)
}

export function getRegisteredDemoIds() {
  return getDemoSources().map((demo) => demo.id)
}

export function demoIdFromSource(source: string) {
  return getDemoIdBySourceMap().get(normalizeSource(source))
}

export function getDemoSource(search: string): DemoSourceResult {
  const params = new URLSearchParams(search)
  const demoId = params.get('demo')

  if (demoId) {
    const demo = getDemoSourceById(demoId)

    if (!demo) {
      return {
        sourceType: 'missing-demo',
        source: '',
        error: `Playground demo not found: ${demoId}`,
      }
    }

    return {
      sourceType: 'demo',
      source: demo.source,
      demoId,
    }
  }

  return {
    sourceType: 'code',
    source: params.get('code') ?? '',
  }
}
