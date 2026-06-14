import { fireEvent, render } from '@solidjs/testing-library'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { JSX } from 'solid-js'
import Layout from './layout'

const resetPath = vi.hoisted(() => vi.fn())
const setPath = vi.hoisted(() => vi.fn<(path: string) => void>())

vi.mock('@solidjs/router', async () => {
  const { createSignal } = await vi.importActual<typeof import('solid-js')>('solid-js')
  const [currentPath, setCurrentPath] = createSignal('/')

  resetPath.mockImplementation(() => setCurrentPath('/'))
  setPath.mockImplementation((path: string) => setCurrentPath(path))

  function A(props: {
    activeClass?: string
    children?: JSX.Element
    class?: string
    end?: boolean
    href: string
  }) {
    const isActive = () =>
      props.end ? currentPath() === props.href : currentPath().startsWith(props.href)
    const className = () =>
      [props.class, isActive() ? props.activeClass : undefined].filter(Boolean).join(' ')

    return (
      <a
        aria-current={isActive() ? 'page' : undefined}
        class={className()}
        href={props.href}
        onClick={(event) => {
          event.preventDefault()
          setCurrentPath(props.href)
        }}
      >
        {props.children}
      </a>
    )
  }

  function useLocation() {
    return {
      get pathname() {
        return currentPath()
      },
    }
  }

  return { A, useLocation }
})

vi.mock('./route-data', () => ({
  topNavItems: [
    { group: 'components', path: '/components/alert', label: 'Components' },
    { group: 'docs', path: '/docs/getting-started', label: 'Docs' },
  ],
  sideNavGroups: {
    components: [
      { path: '/components/alert', label: 'Alert' },
      { path: '/components/menu', label: 'Menu' },
    ],
    docs: [
      { path: '/docs/getting-started', label: 'Getting Started' },
      { path: '/docs/theming', label: 'Theming' },
    ],
  },
}))

beforeEach(() => {
  resetPath()
  localStorage.clear()
  document.documentElement.removeAttribute('data-theme')
})

afterEach(() => {
  vi.restoreAllMocks()
})

function renderLayout() {
  return render(() => (
    <Layout>
      <div>Page</div>
    </Layout>
  ))
}

describe('SolidBase Layout', () => {
  it('renders a theme toggle in the top navigation', () => {
    const result = renderLayout()
    const toggle = result.getByRole('button', { name: 'Switch to dark theme' })

    expect(toggle).not.toHaveTextContent('Dark mode')
    expect(toggle.querySelector('svg')).toBeInTheDocument()

    fireEvent.click(toggle)

    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
  })

  it('centers the theme toggle icon within its circular button', () => {
    const result = renderLayout()
    const toggle = result.getByRole('button', { name: 'Switch to dark theme' })

    expect(toggle).toHaveClass('leading-none')
    expect(toggle.querySelector('svg')).toHaveClass('block')
  })

  it('renders top navigation from convention-derived page groups', () => {
    const result = renderLayout()

    expect(result.getByRole('link', { name: 'Docs' })).toHaveAttribute(
      'href',
      '/docs/getting-started',
    )
    expect(result.getByRole('link', { name: 'Components' })).toHaveAttribute(
      'href',
      '/components/alert',
    )
  })

  it('centers the home page content when the sidebar is hidden', () => {
    const result = renderLayout()
    const main = result.getByRole('main')

    expect(result.container.querySelector('aside')).toBeNull()
    expect(main).toHaveClass('max-w-[1100px]')
    expect(main).toHaveClass('mx-auto')
    expect(main).toHaveClass('w-full')
  })

  it('keeps the sidebar fixed below the header with its own scroll area', () => {
    setPath('/components/alert')
    const result = renderLayout()
    const sidebar = result.container.querySelector('aside')

    expect(sidebar).toHaveClass('lg:sticky')
    expect(sidebar).toHaveClass('lg:top-16')
    expect(sidebar).toHaveClass('lg:h-[calc(100vh-4rem)]')
    expect(sidebar).toHaveClass('overflow-x-auto')
    expect(sidebar).toHaveClass('lg:overflow-y-auto')
  })

  it('uses a single-column component layout until large screens', () => {
    setPath('/components/alert')
    const result = renderLayout()
    const pageLayout = result.getByRole('main').parentElement

    expect(pageLayout).toHaveClass('min-h-[calc(100vh-4rem)]')
    expect(pageLayout).toHaveClass('lg:grid')
    expect(pageLayout).toHaveClass('lg:grid-cols-[260px_minmax(0,1fr)]')
    expect(pageLayout).not.toHaveClass('grid-cols-[260px_minmax(0,1fr)]')
  })

  it('uses narrow page gutters on mobile and wider gutters on desktop', () => {
    setPath('/components/alert')
    const result = renderLayout()
    const main = result.getByRole('main')

    expect(main).toHaveClass('px-4')
    expect(main).toHaveClass('sm:px-8')
    expect(main).toHaveClass('lg:px-14')
    expect(main).not.toHaveClass('px-14')
  })

  it('centers sidebar document labels horizontally', () => {
    setPath('/docs/getting-started')
    const result = renderLayout()
    const gettingStartedLink = result.getByRole('link', { name: 'Getting Started' })

    expect(gettingStartedLink).toHaveClass('flex')
    expect(gettingStartedLink).toHaveClass('justify-center')
    expect(gettingStartedLink).toHaveClass('text-center')
  })

  it('shows only the sidebar menu for the current top navigation group', () => {
    setPath('/components/alert')
    const result = renderLayout()

    expect(result.getByRole('link', { name: 'Alert' })).toHaveAttribute('href', '/components/alert')
    expect(result.getByRole('link', { name: 'Menu' })).toHaveAttribute('href', '/components/menu')
    expect(result.queryByRole('link', { name: 'Getting Started' })).toBeNull()
    expect(result.queryByRole('link', { name: 'Theming' })).toBeNull()
  })

  it('marks the clicked sidebar menu item as selected with Tailwind utilities', () => {
    setPath('/components/alert')
    const result = renderLayout()
    const menuLink = result.getByRole('link', { name: 'Menu' })

    fireEvent.click(menuLink)

    expect(menuLink).toHaveAttribute('aria-current', 'page')
    expect(menuLink).toHaveClass('bg-blue-50')
    expect(menuLink).toHaveClass('text-blue-600')
    expect(menuLink).toHaveClass('font-medium')
    expect(menuLink).not.toHaveClass('site-sidebar-link-selected')
  })
})
