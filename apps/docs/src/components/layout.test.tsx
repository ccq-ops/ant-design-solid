import { fireEvent, render } from '@solidjs/testing-library'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { JSX } from 'solid-js'
import { Layout } from './layout'

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
    noScroll?: boolean
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
        noScroll={props.noScroll}
        onClick={(event) => {
          event.preventDefault()
          if (!props.noScroll) window.scrollTo(0, 0)
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

vi.mock('../routes', () => ({
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

const mode = vi.hoisted(() => vi.fn(() => 'light'))
const toggleTheme = vi.hoisted(() => vi.fn())

vi.mock('./theme-context', () => ({
  useDocsTheme: () => ({ mode, toggleTheme }),
}))

beforeEach(() => {
  resetPath()
  mode.mockReturnValue('light')
  toggleTheme.mockClear()
})

function renderLayout() {
  return render(() => (
    <Layout>
      <div>Page</div>
    </Layout>
  ))
}

describe('Layout', () => {
  it('renders a theme toggle in the top navigation', () => {
    const result = renderLayout()
    const toggle = result.getByRole('button', { name: 'Switch to dark theme' })

    expect(toggle).toHaveTextContent('Dark mode')

    fireEvent.click(toggle)

    expect(toggleTheme).toHaveBeenCalledTimes(1)
  })

  it('updates the theme toggle label in dark mode', () => {
    mode.mockReturnValue('dark')
    const result = renderLayout()
    const toggle = result.getByRole('button', { name: 'Switch to light theme' })

    expect(toggle).toHaveTextContent('Light mode')
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

  it('does not render the sidebar on the home page', () => {
    const result = renderLayout()

    expect(result.container.querySelector('aside')).toBeNull()
    expect(result.getByRole('main')).toHaveClass('max-w-[1100px]')
  })

  it('keeps the sidebar fixed below the header with its own scroll area', () => {
    setPath('/components/alert')
    const result = renderLayout()
    const sidebar = result.container.querySelector('aside')

    expect(sidebar).toHaveClass('sticky')
    expect(sidebar).toHaveClass('top-16')
    expect(sidebar).toHaveClass('h-[calc(100vh-4rem)]')
    expect(sidebar).toHaveClass('overflow-y-auto')
  })

  it('shows only the sidebar menu for the current top navigation group', () => {
    setPath('/components/alert')
    const result = renderLayout()

    expect(result.getByRole('link', { name: 'Alert' })).toHaveAttribute('href', '/components/alert')
    expect(result.getByRole('link', { name: 'Menu' })).toHaveAttribute('href', '/components/menu')
    expect(result.queryByRole('link', { name: 'Getting Started' })).toBeNull()
    expect(result.queryByRole('link', { name: 'Theming' })).toBeNull()
  })

  it('keeps the current scroll position when clicking sidebar menu links', async () => {
    setPath('/components/alert')
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
    const result = renderLayout()
    const menuLink = result.getByRole('link', { name: 'Menu' })

    fireEvent.click(menuLink)
    await Promise.resolve()

    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('marks the clicked sidebar menu item as selected with Tailwind utilities', async () => {
    setPath('/components/alert')
    const result = renderLayout()
    const menuLink = result.getByRole('link', { name: 'Menu' })

    fireEvent.click(menuLink)
    await Promise.resolve()

    expect(menuLink).toHaveAttribute('aria-current', 'page')
    expect(menuLink).toHaveClass('bg-blue-50')
    expect(menuLink).toHaveClass('text-blue-600')
    expect(menuLink).toHaveClass('font-medium')
    expect(menuLink).not.toHaveClass('site-sidebar-link-selected')
  })
})
