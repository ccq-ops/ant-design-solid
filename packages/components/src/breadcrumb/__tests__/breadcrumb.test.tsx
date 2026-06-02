import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Breadcrumb } from '../index'

describe('Breadcrumb', () => {
  it('renders items and marks the last item as current', () => {
    const result = render(() => (
      <Breadcrumb
        items={[
          { title: 'Home', href: '/' },
          { title: 'Components', href: '/components' },
          { title: 'Breadcrumb' },
        ]}
      />
    ))

    expect(result.getByRole('navigation', { name: 'breadcrumb' })).toBeInTheDocument()
    expect(result.getAllByRole('listitem')).toHaveLength(3)
    expect(result.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(result.getByText('Breadcrumb')).toHaveAttribute('aria-current', 'page')
  })

  it('calls item onClick handlers', () => {
    const onClick = vi.fn()
    const result = render(() => <Breadcrumb items={[{ title: 'Clickable', onClick }]} />)

    fireEvent.click(result.getByText('Clickable'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('supports manual item composition', () => {
    const result = render(() => (
      <Breadcrumb>
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item>Current</Breadcrumb.Item>
      </Breadcrumb>
    ))

    expect(result.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(result.getByText('Current')).toHaveAttribute('aria-current', 'page')
  })

  it('uses per-item separator overrides', () => {
    const result = render(() => (
      <Breadcrumb
        separator=">"
        items={[
          { title: 'Home', separator: '→' },
          { title: 'Components' },
          { title: 'Breadcrumb' },
        ]}
      />
    ))

    const separators = result.container.querySelectorAll('.ads-breadcrumb-separator')

    expect(separators).toHaveLength(2)
    expect(separators[0]).toHaveTextContent('→')
    expect(separators[1]).toHaveTextContent('>')
  })

  it('activates click-only items with Enter and Space', () => {
    const onClick = vi.fn()
    const result = render(() => <Breadcrumb items={[{ title: 'Keyboard', onClick }]} />)
    const item = result.getByText('Keyboard')

    fireEvent.keyDown(item, { key: 'Enter' })
    fireEvent.keyDown(item, { key: ' ' })

    expect(onClick).toHaveBeenCalledTimes(2)
  })
})
