import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { frontmatter as buttonFrontmatter } from './src/routes/components/button.mdx'
import { frontmatter as alertFrontmatter } from './src/routes/components/alert.mdx'
import { frontmatter as configProviderFrontmatter } from './src/routes/components/config-provider.mdx'

async function importThemeConfig(cacheKey: string) {
  switch (cacheKey) {
    case 'component-groups-test':
      return import('./solidbase-theme-config.ts?component-groups-test')
    case 'frontmatter-test':
      return import('./solidbase-theme-config.ts?frontmatter-test')
    case 'auto-discovery-test':
      return import('./solidbase-theme-config.ts?auto-discovery-test')
    case 'github-pages-test':
      return import('./solidbase-theme-config.ts?github-pages-test')
    default:
      throw new Error(`Unknown solidbase theme config import cache key: ${cacheKey}`)
  }
}

describe('docs theme config', () => {
  it('groups component sidebar entries with the Ant Design v6 component groups', async () => {
    const previousGithubPages = process.env.GITHUB_PAGES

    delete process.env.GITHUB_PAGES
    const { docsThemeConfig } = await importThemeConfig('component-groups-test')
    const componentSidebar = docsThemeConfig.sidebar?.['/components']

    try {
      expect(docsThemeConfig.nav).toEqual(
        expect.arrayContaining([{ text: 'Components', link: '/components' }]),
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
    const { componentDocs } = await importThemeConfig('frontmatter-test')

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

      const freshConfig = await importThemeConfig('auto-discovery-test')

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

  it('keeps theme navigation and sidebar routes router-relative for GitHub Pages builds', async () => {
    const previousGithubPages = process.env.GITHUB_PAGES

    process.env.GITHUB_PAGES = 'true'

    try {
      const freshConfig = await importThemeConfig('github-pages-test')

      expect(freshConfig.docsThemeConfig.nav).toEqual(
        expect.arrayContaining([
          { text: 'Components', link: '/components' },
          { text: 'Docs', link: '/docs/getting-started' },
        ]),
      )
      expect(freshConfig.docsThemeConfig.sidebar).toHaveProperty('/components')
      expect(freshConfig.docsThemeConfig.sidebar).toHaveProperty('/docs')
      expect(freshConfig.docsThemeConfig.sidebar?.['/components']).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            title: 'General',
            items: expect.arrayContaining([{ title: 'Button', link: '/button' }]),
          }),
        ]),
      )
      expect(freshConfig.docsThemeConfig.sidebar?.['/docs']).toEqual(
        expect.arrayContaining([{ title: 'Getting Started', link: '/getting-started' }]),
      )
    } finally {
      if (previousGithubPages === undefined) {
        delete process.env.GITHUB_PAGES
      } else {
        process.env.GITHUB_PAGES = previousGithubPages
      }
    }
  })
})
