import { describe, expect, it } from 'vitest'
import { frontmatter } from './index.mdx'

describe('Home route', () => {
  it('uses MDX frontmatter for the SolidBase default home layout', () => {
    expect(frontmatter).toMatchObject({
      title: 'Ant Design Solid',
      layout: 'home',
      hero: {
        text: 'Ant Design for the Solid era',
        tagline:
          'Build polished product interfaces with Ant Design-inspired semantics, Solid-native performance, and token-driven theming.',
        image: {
          src: '/hero-banner.png',
          alt: 'Ant Design Solid home page hero artwork',
        },
        actions: [
          { theme: 'brand', text: 'Get Started', link: '/docs/getting-started' },
          { theme: 'alt', text: 'View Components', link: '/components' },
        ],
      },
      features: [
        expect.objectContaining({ title: 'Component-rich' }),
        expect.objectContaining({ title: 'Token-driven theming' }),
        expect.objectContaining({ title: 'Solid-native runtime' }),
        expect.objectContaining({ title: 'Vite-first docs' }),
      ],
    })
    expect(frontmatter.features).toHaveLength(4)
  })
})
