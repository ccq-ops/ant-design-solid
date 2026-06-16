import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, parse } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { DefaultThemeConfig } from '@kobalte/solidbase/default-theme'

const docsBasePath = process.env.GITHUB_PAGES === 'true' ? '/ant-design-solid' : ''

export const componentGroups = [
  'General',
  'Layout',
  'Navigation',
  'Data Entry',
  'Data Display',
  'Feedback',
  'Other',
] as const

export type ComponentGroup = (typeof componentGroups)[number]

export interface ComponentDocMeta {
  title: string
  link: `/${string}`
  group: ComponentGroup
}

function isComponentGroup(value: unknown): value is ComponentGroup {
  return typeof value === 'string' && componentGroups.includes(value as ComponentGroup)
}

function titleFromSlug(slug: string) {
  if (slug === 'qrcode') {
    return 'QRCode'
  }

  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function linkFromSlug(slug: string): `/${string}` {
  return `/${slug}`
}

function withDocsBasePath(path: `/${string}`): `/${string}` {
  if (!docsBasePath) {
    return path
  }

  if (path === '/') {
    return `${docsBasePath}/`
  }

  return `${docsBasePath}${path}`
}

function readFrontmatter(filePath: string) {
  const source = readFileSync(filePath, 'utf8')
  const match = source.match(/^---\n(?<frontmatter>[\s\S]*?)\n---\n/)
  const frontmatter = match?.groups?.frontmatter ?? ''
  const data: Record<string, string> = {}

  for (const line of frontmatter.split('\n')) {
    const separatorIndex = line.indexOf(':')

    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()

    if (key) {
      data[key] = value
    }
  }

  return data
}

function readComponentDocs(): ComponentDocMeta[] {
  const componentsDir = join(dirname(fileURLToPath(import.meta.url)), 'src/routes/components')

  return readdirSync(componentsDir)
    .filter((fileName) => fileName.endsWith('.mdx') && fileName !== 'index.mdx')
    .map((fileName) => {
      const slug = parse(fileName).name
      const filePath = join(componentsDir, fileName)
      const frontmatter = readFrontmatter(filePath)

      if (!isComponentGroup(frontmatter.group)) {
        throw new Error(`${filePath} has invalid or missing component group`)
      }

      return {
        title: frontmatter.title || titleFromSlug(slug),
        link: linkFromSlug(slug),
        group: frontmatter.group,
      }
    })
    .sort((a, b) => {
      const groupOrder = componentGroups.indexOf(a.group) - componentGroups.indexOf(b.group)

      if (groupOrder !== 0) {
        return groupOrder
      }

      return a.title.localeCompare(b.title)
    })
}

export const componentDocs = readComponentDocs()

const componentSidebar = [
  { title: 'Overview', items: [{ title: 'Overview', link: '/' }] },
  ...componentGroups.map((group) => ({
    title: group,
    items: componentDocs
      .filter((component) => component.group === group)
      .map(({ title, link }) => ({ title, link })),
  })),
]

export const docsThemeConfig = {
  nav: [
    { text: 'Components', link: withDocsBasePath('/components') },
    { text: 'Docs', link: withDocsBasePath('/docs/getting-started') },
  ],
  sidebar: {
    [withDocsBasePath('/components')]: componentSidebar,
    [withDocsBasePath('/docs')]: [
      { title: 'Getting Started', link: '/getting-started' },
      { title: 'Theming', link: '/theming' },
    ],
  },
} satisfies DefaultThemeConfig
