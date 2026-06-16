import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

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

async function importThemePluginModule(cacheKey: string) {
  switch (cacheKey) {
    case 'component-groups-test':
      return import('./solidbase-theme-plugin.ts?component-groups-test')
    case 'frontmatter-test':
      return import('./solidbase-theme-plugin.ts?frontmatter-test')
    case 'auto-discovery-test':
      return import('./solidbase-theme-plugin.ts?auto-discovery-test')
    case 'github-pages-test':
      return import('./solidbase-theme-plugin.ts?github-pages-test')
    default:
      throw new Error(`Unknown solidbase theme config import cache key: ${cacheKey}`)
  }
}

describe('docs theme config', () => {
  it('groups component sidebar entries with the Ant Design v6 component groups', async () => {
    const previousGithubPages = process.env.GITHUB_PAGES

    delete process.env.GITHUB_PAGES
    const { docsThemeConfig } = await importThemePluginModule('component-groups-test')
    const componentSidebar = docsThemeConfig.sidebar?.['/components']

    try {
      expect(docsThemeConfig.nav).toEqual(
        expect.arrayContaining([
          { text: 'Components', link: '/components' },
          { text: 'GitHub', link: '//github.com/ccq-ops/ant-design-solid' },
        ]),
      )
      expect(componentSidebar?.[0]).toEqual({
        title: 'Overview',
        items: [{ title: 'Overview', link: '/' }],
      })
      expect(componentSidebar?.slice(1).map((group) => group.title)).toEqual([
        'General',
        'Layout',
        'Navigation',
        'Data Entry',
        'Data Display',
        'Feedback',
        'Other',
      ])
      expect(componentSidebar).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'General',
            items: expect.arrayContaining([{ title: 'Button', link: '/button' }]),
          }),
          expect.objectContaining({
            title: 'Layout',
            items: expect.arrayContaining([{ title: 'Divider', link: '/divider' }]),
          }),
          expect.objectContaining({
            title: 'Navigation',
            items: expect.arrayContaining([{ title: 'Anchor', link: '/anchor' }]),
          }),
          expect.objectContaining({
            title: 'Data Entry',
            items: expect.arrayContaining([{ title: 'Auto Complete', link: '/auto-complete' }]),
          }),
          expect.objectContaining({
            title: 'Data Display',
            items: expect.arrayContaining([{ title: 'Avatar', link: '/avatar' }]),
          }),
          expect.objectContaining({
            title: 'Feedback',
            items: expect.arrayContaining([{ title: 'Alert', link: '/alert' }]),
          }),
          expect.objectContaining({
            title: 'Other',
            items: expect.arrayContaining([{ title: 'Affix', link: '/affix' }]),
          }),
        ]),
      )
    } finally {
      if (previousGithubPages === undefined) {
        delete process.env.GITHUB_PAGES
      } else {
        process.env.GITHUB_PAGES = previousGithubPages
      }
    }
  })

  it('keeps component page frontmatter aligned with sidebar metadata', async () => {
    const { componentDocs } = await importThemePluginModule('frontmatter-test')
    const buttonFrontmatter = readFrontmatter(
      join(process.cwd(), 'src/routes/components/button.mdx'),
    )
    const alertFrontmatter = readFrontmatter(join(process.cwd(), 'src/routes/components/alert.mdx'))
    const configProviderFrontmatter = readFrontmatter(
      join(process.cwd(), 'src/routes/components/config-provider.mdx'),
    )

    expect(buttonFrontmatter).toMatchObject({ title: 'Button', group: 'General' })
    expect(alertFrontmatter).toMatchObject({ title: 'Alert', group: 'Feedback' })
    expect(configProviderFrontmatter).toMatchObject({ title: 'Config Provider', group: 'Other' })

    expect(componentDocs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ title: buttonFrontmatter.title, group: buttonFrontmatter.group }),
        expect.objectContaining({ title: alertFrontmatter.title, group: alertFrontmatter.group }),
        expect.objectContaining({
          title: configProviderFrontmatter.title,
          group: configProviderFrontmatter.group,
        }),
      ]),
    )
  })

  it('discovers component docs from MDX frontmatter and file paths', async () => {
    const temporaryPage = join(process.cwd(), 'src/routes/components/auto-discovered-test.mdx')

    try {
      mkdirSync(dirname(temporaryPage), { recursive: true })
      writeFileSync(
        temporaryPage,
        [
          '---',
          'title: Auto Discovered Test',
          'group: Other',
          '---',
          '',
          '# Auto Discovered Test',
          '',
        ].join('\n'),
      )

      const freshConfig = await importThemePluginModule('auto-discovery-test')

      expect(freshConfig.componentDocs).toEqual(
        expect.arrayContaining([
          {
            title: 'Auto Discovered Test',
            link: '/auto-discovered-test',
            group: 'Other',
          },
        ]),
      )
    } finally {
      rmSync(temporaryPage, { force: true })
    }
  })

  it('prefixes theme navigation and sidebar route matches for GitHub Pages builds', async () => {
    const previousGithubPages = process.env.GITHUB_PAGES

    process.env.GITHUB_PAGES = 'true'

    try {
      const freshConfig = await importThemePluginModule('github-pages-test')

      expect(freshConfig.docsThemeConfig.nav).toEqual(
        expect.arrayContaining([
          { text: 'Components', link: '/ant-design-solid/components' },
          { text: 'Docs', link: '/ant-design-solid/docs/getting-started' },
        ]),
      )
      expect(freshConfig.docsThemeConfig.sidebar).toHaveProperty('/ant-design-solid/components')
      expect(freshConfig.docsThemeConfig.sidebar).toHaveProperty('/ant-design-solid/docs')
      expect(freshConfig.docsThemeConfig.sidebar?.['/ant-design-solid/components']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'General',
            items: expect.arrayContaining([{ title: 'Button', link: '/button' }]),
          }),
        ]),
      )
      expect(freshConfig.docsThemeConfig.sidebar?.['/ant-design-solid/docs']).toEqual([
        { title: 'Getting Started', link: '/getting-started' },
        { title: 'Changelog', link: '/changelog' },
        { title: 'Theming', link: '/theming' },
        { title: 'Contributing', link: '/contributing' },
      ])
    } finally {
      if (previousGithubPages === undefined) {
        delete process.env.GITHUB_PAGES
      } else {
        process.env.GITHUB_PAGES = previousGithubPages
      }
    }
  })
})
