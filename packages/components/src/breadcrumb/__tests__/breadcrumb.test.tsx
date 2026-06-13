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

  it('generates accumulated hrefs from path and params', () => {
    const result = render(() => (
      <Breadcrumb
        params={{ id: '42' }}
        items={[
          { title: 'Home', path: '/' },
          { title: 'Users', path: 'users' },
          { title: 'User :id', path: ':id' },
        ]}
      />
    ))

    expect(result.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '#/')
    expect(result.getByRole('link', { name: 'Users' })).toHaveAttribute('href', '#/users')
    expect(result.getByText('User 42')).toHaveAttribute('href', '#/users/42')
  })

  it('calls itemRender with route params routes and paths', () => {
    const itemRender = vi.fn((route, params, routes, paths) => (
      <span data-testid={`custom-${paths.join('-') || 'root'}`}>
        {route.title}:{params.id}:{routes.length}
      </span>
    ))
    const items = [
      { title: 'Home', path: '/' },
      { title: 'Profile', path: ':id' },
    ]

    const result = render(() => (
      <Breadcrumb items={items} params={{ id: '7' }} itemRender={itemRender} />
    ))

    expect(result.getByTestId('custom-root')).toHaveTextContent('Home:7:2')
    expect(result.getByTestId('custom--7')).toHaveTextContent('Profile:7:2')
    expect(itemRender).toHaveBeenLastCalledWith(items[1], { id: '7' }, items, ['', '7'])
  })

  it('renders separator items and manual separator composition', () => {
    const result = render(() => (
      <div>
        <Breadcrumb
          items={[
            { title: 'Location', href: '/location' },
            { type: 'separator', separator: ':' },
            { title: 'Application Center' },
          ]}
        />
        <Breadcrumb>
          <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
          <Breadcrumb.Separator>\</Breadcrumb.Separator>
          <Breadcrumb.Item>Manual</Breadcrumb.Item>
        </Breadcrumb>
      </div>
    ))

    expect(result.container.querySelectorAll('.ads-breadcrumb-separator')).toHaveLength(3)
    expect(result.getByText(':')).toHaveClass('ads-breadcrumb-separator')
    expect(result.getByText('\\')).toHaveClass('ads-breadcrumb-separator')
  })

  it('applies semantic classNames and styles', () => {
    const result = render(() => (
      <Breadcrumb
        classNames={{ root: 'root-slot', item: 'item-slot', separator: 'separator-slot' }}
        styles={{
          root: { color: 'rgb(1, 2, 3)' },
          item: { background: 'rgb(4, 5, 6)' },
          separator: { color: 'rgb(7, 8, 9)' },
        }}
        items={[{ title: 'Home', href: '/' }, { title: 'Current' }]}
      />
    ))

    const nav = result.getByRole('navigation', { name: 'breadcrumb' })
    const item = result.getAllByRole('listitem')[0]
    const separator = result.container.querySelector<HTMLElement>('.ads-breadcrumb-separator')!

    expect(nav).toHaveClass('root-slot')
    expect(nav.style.color).toBe('rgb(1, 2, 3)')
    expect(item).toHaveClass('item-slot')
    expect(item.style.background).toBe('rgb(4, 5, 6)')
    expect(separator).toHaveClass('separator-slot')
    expect(separator.style.color).toBe('rgb(7, 8, 9)')
  })

  it('renders item menus with dropdown props and dropdown icon', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <Breadcrumb
        dropdownIcon={<span data-testid="dropdown-icon">v</span>}
        items={[
          {
            title: 'Menu',
            href: '/menu/',
            menu: {
              items: [
                { key: 'one', title: 'One', path: 'one' },
                { key: 'two', label: 'Two' },
              ],
            },
            dropdownProps: { trigger: 'click', open: true, onOpenChange },
          },
          { title: 'Current' },
        ]}
      />
    ))

    expect(result.getByTestId('dropdown-icon')).toBeInTheDocument()
    expect(document.body.querySelector('.ads-dropdown')).toHaveTextContent('One')
    expect(document.body.querySelector('.ads-dropdown')).toHaveTextContent('Two')
    expect(document.body.querySelector('a[href="/menu/one"]')).toHaveTextContent('One')
  })

  it('renders the default dropdown icon as an aligned text-sized icon', () => {
    const result = render(() => (
      <Breadcrumb
        items={[
          {
            title: 'Menu',
            href: '/menu/',
            menu: { items: [{ key: 'one', title: 'One' }] },
          },
          { title: 'Current' },
        ]}
      />
    ))

    const icon = result.container.querySelector('.ads-breadcrumb-dropdown-icon svg')
    const styles = Array.from(document.head.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n')

    expect(icon).toBeTruthy()
    expect(styles).toMatch(/\.ads-breadcrumb-overlay-link\{[^}]*align-items:center/)
    expect(styles).toMatch(/\.ads-breadcrumb-dropdown-icon\{[^}]*font-size:14px/)
  })

  it('supports legacy routes and breadcrumbName', () => {
    const result = render(() => (
      <Breadcrumb
        routes={[
          { breadcrumbName: 'Home', path: '/' },
          { breadcrumbName: 'User :id', path: 'users/:id' },
        ]}
        params={{ id: '9' }}
      />
    ))

    expect(result.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '#/')
    expect(result.getByText('User 9')).toHaveAttribute('href', '#/users/9')
  })

  it('supports legacy children menu data on item records', () => {
    render(() => (
      <Breadcrumb
        items={[
          {
            title: 'Legacy menu',
            href: '/legacy/',
            children: [{ key: 'child', title: 'Child', path: 'child' }],
            dropdownProps: { open: true },
          },
          { title: 'Current' },
        ]}
      />
    ))

    const legacyLink = document.body.querySelector('a[href="/legacy/child"]')
    expect(legacyLink).toHaveTextContent('Child')
  })

  it('keeps icon and text content aligned inside breadcrumb links', () => {
    render(() => (
      <Breadcrumb
        items={[
          {
            title: (
              <>
                <span data-testid="icon">icon</span>
                <span>Application List</span>
              </>
            ),
          },
        ]}
      />
    ))

    const styles = Array.from(document.head.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n')

    expect(styles).toMatch(/\.ads-breadcrumb-link\{[^}]*display:inline-flex/)
    expect(styles).toMatch(/\.ads-breadcrumb-link\{[^}]*align-items:center/)
  })

  it('keeps current item color distinct from non-current href items', () => {
    render(() => (
      <Breadcrumb
        items={[
          { title: 'Home', href: '/' },
          { title: 'Components', href: '/components' },
          { title: 'Current' },
        ]}
      />
    ))

    const styles = Array.from(document.head.querySelectorAll('style'))
      .map((style) => style.textContent ?? '')
      .join('\n')

    expect(styles).toMatch(/\.ads-breadcrumb-item:last-child \.ads-breadcrumb-link\{/)
    expect(styles).toMatch(
      /\.ads-breadcrumb-link\[href\]:hover, \.ads-breadcrumb-link-clickable:hover\{/,
    )
    expect(styles).not.toMatch(
      /\.ads-breadcrumb-link\[href\], \.ads-breadcrumb-link-clickable:hover\{[^}]*color:/,
    )
  })
})
