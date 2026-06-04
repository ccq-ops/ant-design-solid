import { fireEvent, render } from '@solidjs/testing-library'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { JSX } from 'solid-js'
import { Layout } from './layout'

const resetPath = vi.hoisted(() => vi.fn())

vi.mock('@solidjs/router', async () => {
  const { createSignal } = await vi.importActual<typeof import('solid-js')>('solid-js')
  const [currentPath, setCurrentPath] = createSignal('/')
  resetPath.mockImplementation(() => setCurrentPath('/'))

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

  return { A }
})

beforeEach(() => {
  resetPath()
})

function renderLayout() {
  return render(() => (
    <Layout>
      <div>Page</div>
    </Layout>
  ))
}

describe('Layout', () => {
  it('marks the clicked sidebar menu item as selected with Tailwind utilities', async () => {
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
