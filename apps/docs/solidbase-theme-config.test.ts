import { describe, expect, it } from 'vitest'
import { componentDocs, docsThemeConfig } from './solidbase-theme-config'
import { frontmatter as buttonFrontmatter } from './src/routes/components/button.mdx'
import { frontmatter as alertFrontmatter } from './src/routes/components/alert.mdx'
import { frontmatter as configProviderFrontmatter } from './src/routes/components/config-provider.mdx'

describe('docs theme config', () => {
  it('groups component sidebar entries with the Ant Design v6 component groups', () => {
    const componentSidebar = docsThemeConfig.sidebar?.['/components']

    expect(componentSidebar?.map((group) => group.title)).toEqual([
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
  })

  it('keeps component page frontmatter aligned with sidebar metadata', () => {
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
})
