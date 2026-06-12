import { cleanup, fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Menu } from '../index'
import type { MenuItem } from '../interface'

const items: MenuItem[] = [
  { key: 'mail', label: 'Mail' },
  {
    key: 'settings',
    label: 'Settings',
    children: [
      { key: 'profile', label: 'Profile' },
      { key: 'security', label: 'Security', disabled: true },
    ],
  },
  { type: 'divider' },
  {
    type: 'group',
    label: 'Workspace',
    children: [
      { key: 'team', label: 'Team' },
      { key: 'projects', label: 'Projects' },
    ],
  },
]

function menuStyleText(): string {
  return Array.from(document.head.querySelectorAll('style[data-ant-design-solid]'))
    .map((style) => style.textContent ?? '')
    .join('\n')
}

describe('Menu', () => {
  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('renders items, submenu, divider, and group with menu semantics', () => {
    const result = render(() => <Menu items={items} />)

    expect(result.getByRole('menu')).toHaveClass('ads-menu')
    expect(result.getByRole('menuitem', { name: 'Mail' })).toBeInTheDocument()
    expect(result.getByRole('menuitem', { name: 'Settings' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
    expect(result.getByRole('separator')).toHaveClass('ads-menu-item-divider')
    expect(result.getByText('Workspace')).toHaveClass('ads-menu-item-group-title')
    expect(result.getByRole('menuitem', { name: 'Team' })).toBeInTheDocument()
  })

  it('renders compound Menu children through the same item model', () => {
    const result = render(() => (
      <Menu mode="inline" defaultOpenKeys={['workspace']}>
        <Menu.Item key="home" icon={<span data-testid="home-icon" />}>
          Home
        </Menu.Item>
        <Menu.SubMenu key="workspace" title="Workspace">
          <Menu.Item key="projects">Projects</Menu.Item>
          <Menu.ItemGroup title="Team">
            <Menu.Item key="members">Members</Menu.Item>
          </Menu.ItemGroup>
          <Menu.Divider dashed />
        </Menu.SubMenu>
      </Menu>
    ))

    expect(result.getByText('Home')).toBeInTheDocument()
    expect(result.getByTestId('home-icon')).toBeInTheDocument()
    expect(result.getByText('Workspace')).toBeInTheDocument()
    expect(result.getByText('Projects')).toBeInTheDocument()
    expect(result.getByText('Team')).toBeInTheDocument()
    expect(result.getByRole('separator')).toHaveClass('ads-menu-item-divider')
  })

  it('uncontrolled selection calls onClick and onSelect', () => {
    const onClick = vi.fn()
    const onSelect = vi.fn()
    const result = render(() => <Menu items={items} onClick={onClick} onSelect={onSelect} />)

    fireEvent.click(result.getByRole('menuitem', { name: 'Mail' }))

    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ key: 'mail' }))
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'mail', selectedKeys: ['mail'] }),
    )
    expect(result.getByRole('menuitem', { name: 'Mail' })).toHaveAttribute('aria-selected', 'true')
    expect(result.getByRole('menuitem', { name: 'Mail' })).toHaveClass('ads-menu-item-selected')
  })

  it('controlled selectedKeys calls callbacks without changing selection by itself', () => {
    const onSelect = vi.fn()
    const result = render(() => <Menu items={items} selectedKeys={['mail']} onSelect={onSelect} />)

    fireEvent.click(result.getByRole('menuitem', { name: 'Team' }))

    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'team', selectedKeys: ['team'] }),
    )
    expect(result.getByRole('menuitem', { name: 'Mail' })).toHaveAttribute('aria-selected', 'true')
    expect(result.getByRole('menuitem', { name: 'Team' })).toHaveAttribute('aria-selected', 'false')
  })

  it('controlled selectedKeys updates from signals', () => {
    const [selectedKeys, setSelectedKeys] = createSignal(['mail'])
    const result = render(() => <Menu items={items} selectedKeys={selectedKeys()} />)

    setSelectedKeys(['team'])

    expect(result.getByRole('menuitem', { name: 'Mail' })).toHaveAttribute('aria-selected', 'false')
    expect(result.getByRole('menuitem', { name: 'Team' })).toHaveAttribute('aria-selected', 'true')
  })

  it('uses defaultSelectedKeys for initial uncontrolled selection', () => {
    const result = render(() => <Menu items={items} defaultSelectedKeys={['team']} />)

    expect(result.getByRole('menuitem', { name: 'Team' })).toHaveClass('ads-menu-item-selected')
  })

  it('does not select items when selectable is false but still fires onClick', () => {
    const onClick = vi.fn()
    const onSelect = vi.fn()
    const result = render(() => (
      <Menu
        selectable={false}
        items={[{ key: 'mail', label: 'Mail' }]}
        onClick={onClick}
        onSelect={onSelect}
      />
    ))

    fireEvent.click(result.getByText('Mail'))

    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ key: 'mail' }))
    expect(onSelect).not.toHaveBeenCalled()
    expect(result.getByRole('menuitem')).not.toHaveClass('ads-menu-item-selected')
  })

  it('supports multiple selection and deselection', () => {
    const onSelect = vi.fn()
    const onDeselect = vi.fn()
    const result = render(() => (
      <Menu
        multiple
        defaultSelectedKeys={['mail']}
        items={[
          { key: 'mail', label: 'Mail' },
          { key: 'team', label: 'Team' },
        ]}
        onSelect={onSelect}
        onDeselect={onDeselect}
      />
    ))

    fireEvent.click(result.getByText('Team'))
    expect(onSelect).toHaveBeenLastCalledWith(
      expect.objectContaining({
        key: 'team',
        selectedKeys: ['mail', 'team'],
      }),
    )

    fireEvent.click(result.getByText('Mail'))
    expect(onDeselect).toHaveBeenLastCalledWith(
      expect.objectContaining({
        key: 'mail',
        selectedKeys: ['team'],
      }),
    )
  })

  it('toggles submenu open state and calls onOpenChange', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <Menu triggerSubMenuAction="click" items={items} onOpenChange={onOpenChange} />
    ))
    const submenu = result.getByRole('menuitem', { name: 'Settings' })

    fireEvent.click(submenu)
    expect(onOpenChange).toHaveBeenCalledWith(['settings'])
    expect(submenu).toHaveAttribute('aria-expanded', 'true')
    expect(submenu.closest('.ads-menu-submenu')).toHaveClass('ads-menu-submenu-open')

    fireEvent.click(submenu)
    expect(onOpenChange).toHaveBeenLastCalledWith([])
    expect(submenu).toHaveAttribute('aria-expanded', 'false')
  })

  it('uses click trigger when triggerSubMenuAction is click', () => {
    const onOpenChange = vi.fn()
    const onTitleClick = vi.fn()
    const result = render(() => (
      <Menu
        triggerSubMenuAction="click"
        items={[
          {
            key: 'settings',
            label: 'Settings',
            onTitleClick,
            children: [{ key: 'profile', label: 'Profile' }],
          },
        ]}
        onOpenChange={onOpenChange}
      />
    ))

    fireEvent.click(result.getByText('Settings'))

    expect(onTitleClick).toHaveBeenCalledWith(expect.objectContaining({ key: 'settings' }))
    expect(onOpenChange).toHaveBeenLastCalledWith(['settings'])
  })

  it('opens and closes submenu on hover with configured delays', () => {
    vi.useFakeTimers()
    const result = render(() => (
      <Menu
        subMenuOpenDelay={0.2}
        subMenuCloseDelay={0.3}
        items={[
          {
            key: 'settings',
            label: 'Settings',
            children: [{ key: 'profile', label: 'Profile' }],
          },
        ]}
      />
    ))
    const submenu = result.getByText('Settings').closest('.ads-menu-submenu')!

    fireEvent.mouseEnter(submenu)
    vi.advanceTimersByTime(199)
    expect(document.body.querySelector('.ads-menu-submenu-popup')).toBeFalsy()
    vi.advanceTimersByTime(1)
    expect(document.body.querySelector('.ads-menu-submenu-popup')).toHaveTextContent('Profile')

    fireEvent.mouseLeave(submenu)
    vi.advanceTimersByTime(299)
    expect(document.body.querySelector('.ads-menu-submenu-popup')).toHaveTextContent('Profile')
    vi.advanceTimersByTime(1)
    expect(document.body.querySelector('.ads-menu-submenu-popup')).toBeFalsy()
    vi.useRealTimers()
  })

  it('closes horizontal submenu popup on outside pointer down', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <Menu
        mode="horizontal"
        triggerSubMenuAction="click"
        items={items}
        onOpenChange={onOpenChange}
      />
    ))
    const submenu = result.getByRole('menuitem', { name: 'Settings' })

    fireEvent.click(submenu)
    expect(document.body.querySelector('.ads-menu-submenu-popup')).toBeTruthy()

    fireEvent.pointerDown(document.body)

    expect(document.body.querySelector('.ads-menu-submenu-popup')).toBeFalsy()
    expect(submenu).toHaveAttribute('aria-expanded', 'false')
    expect(onOpenChange).toHaveBeenLastCalledWith([])
  })

  it('controlled openKeys calls onOpenChange without changing open state by itself', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <Menu triggerSubMenuAction="click" items={items} openKeys={[]} onOpenChange={onOpenChange} />
    ))
    const submenu = result.getByRole('menuitem', { name: 'Settings' })

    fireEvent.click(submenu)

    expect(onOpenChange).toHaveBeenCalledWith(['settings'])
    expect(submenu).toHaveAttribute('aria-expanded', 'false')
  })

  it('disabled item and disabled submenu do not fire callbacks', () => {
    const onClick = vi.fn()
    const onSelect = vi.fn()
    const onOpenChange = vi.fn()
    const disabledItems: MenuItem[] = [
      { key: 'disabled-item', label: 'Disabled item', disabled: true },
      {
        key: 'disabled-submenu',
        label: 'Disabled submenu',
        disabled: true,
        children: [{ key: 'child', label: 'Child' }],
      },
    ]
    const result = render(() => (
      <Menu
        items={disabledItems}
        onClick={onClick}
        onSelect={onSelect}
        onOpenChange={onOpenChange}
      />
    ))

    fireEvent.click(result.getByRole('menuitem', { name: 'Disabled item' }))
    fireEvent.click(result.getByRole('menuitem', { name: 'Disabled submenu' }))

    expect(onClick).not.toHaveBeenCalled()
    expect(onSelect).not.toHaveBeenCalled()
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(result.getByRole('menuitem', { name: 'Disabled item' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
  })

  it('supports Enter and Space keyboard activation', () => {
    const onSelect = vi.fn()
    const result = render(() => <Menu items={items} onSelect={onSelect} />)
    const mail = result.getByRole('menuitem', { name: 'Mail' })
    const submenu = result.getByRole('menuitem', { name: 'Settings' })

    fireEvent.keyDown(mail, { key: 'Enter' })
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ key: 'mail' }))

    fireEvent.keyDown(submenu, { key: ' ' })
    expect(submenu).toHaveAttribute('aria-expanded', 'true')
  })

  it('applies modes, inlineCollapsed, custom prefix, and extra class', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Menu items={items} mode="horizontal" inlineCollapsed class="extra-menu" />
      </ConfigProvider>
    ))
    const root = result.getByRole('menu')

    expect(root.className).toContain('custom-menu')
    expect(root.className).toContain('custom-menu-horizontal')
    expect(root.className).toContain('custom-menu-inline-collapsed')
    expect(root.className).toContain('extra-menu')
  })

  it('renders horizontal submenu popup in a portal with fixed positioning and explicit zIndex', () => {
    const result = render(() => (
      <Menu mode="horizontal" triggerSubMenuAction="click" zIndex={1412} items={items} />
    ))
    const submenu = result.getByRole('menuitem', { name: 'Settings' }) as HTMLElement
    expect(submenu).toHaveClass('settings')
    const rectSpy = vi.spyOn(submenu, 'getBoundingClientRect').mockReturnValue({
      top: 10,
      bottom: 42,
      left: 20,
      right: 120,
      width: 100,
      height: 32,
      x: 20,
      y: 10,
      toJSON: () => ({}),
    } as DOMRect)

    fireEvent.click(submenu)

    const popup = document.body.querySelector<HTMLElement>('.ads-menu-submenu-popup')!
    expect(popup).toBeTruthy()
    expect(result.container.querySelector('.ads-menu-submenu-popup')).toBeFalsy()
    expect(popup.style.position).toBe('fixed')
    expect(popup.style.top).toBe('46px')
    expect(popup.style.left).toBe('20px')
    expect(popup.style.zIndex).toBe('1412')
    expect(popup).toHaveTextContent('Profile')
    rectSpy.mockRestore()
  })

  it('renders danger, extra, title, dashed divider, custom expand icon, and indentation', () => {
    const result = render(() => (
      <Menu
        mode="inline"
        inlineCollapsed
        inlineIndent={32}
        defaultOpenKeys={['settings']}
        expandIcon={(props) => (
          <span data-testid={`expand-${props.key}`}>{props.open ? '-' : '+'}</span>
        )}
        items={[
          {
            key: 'settings',
            label: 'Settings',
            children: [
              {
                key: 'delete',
                label: 'Delete',
                danger: true,
                extra: <kbd>D</kbd>,
                title: 'Delete item',
              },
              { type: 'divider', dashed: true },
            ],
          },
        ]}
      />
    ))

    expect(result.getByTestId('expand-settings')).toHaveTextContent('-')
    expect(result.getByText('Delete').closest('li')).toHaveAttribute('title', 'Delete item')
    expect(result.getByText('Delete').closest('li')).toHaveClass('ads-menu-item-danger')
    expect(result.getByText('D').closest('.ads-menu-item-extra')).toBeInTheDocument()
    expect(result.container.querySelector('.ads-menu-item-divider-dashed')).toBeInTheDocument()
    expect(result.getByText('Delete').closest('li')).toHaveStyle({ 'padding-left': '32px' })
  })

  it('supports forceSubMenuRender, popupOffset, popupClass, and popupRender', () => {
    const result = render(() => (
      <Menu
        forceSubMenuRender
        triggerSubMenuAction="click"
        popupRender={(node) => <div data-testid="popup-wrapper">{node}</div>}
        items={[
          {
            key: 'settings',
            label: 'Settings',
            popupClass: 'custom-popup',
            popupOffset: [10, 20],
            children: [{ key: 'profile', label: 'Profile' }],
          },
        ]}
      />
    ))

    expect(document.body.querySelector('.custom-popup')).toBeInTheDocument()
    fireEvent.click(result.getByText('Settings'))
    expect(document.body.querySelector('.custom-popup')).toBeInTheDocument()
    expect(document.body.querySelector<HTMLElement>('.custom-popup')!.style.top).toBe('24px')
    expect(document.body.querySelector<HTMLElement>('.custom-popup')!.style.left).toBe('10px')
    expect(document.body.querySelector('[data-testid="popup-wrapper"]')).toBeInTheDocument()
  })

  it('applies semantic classNames and styles to menu structures', () => {
    const result = render(() => (
      <Menu
        mode="inline"
        defaultOpenKeys={['settings']}
        classNames={{
          root: 'root-semantic',
          item: 'item-semantic',
          submenuTitle: 'title-semantic',
          submenuList: 'list-semantic',
          divider: 'divider-semantic',
        }}
        styles={{
          item: { color: 'rgb(255, 0, 0)' },
        }}
        items={[
          {
            key: 'settings',
            label: 'Settings',
            children: [{ key: 'profile', label: 'Profile' }, { type: 'divider' }],
          },
        ]}
      />
    ))

    expect(result.container.firstElementChild).toHaveClass('root-semantic')
    expect(result.getByText('Settings').closest('.ads-menu-submenu-title')).toHaveClass(
      'title-semantic',
    )
    expect(result.getByText('Profile').closest('li')).toHaveClass('item-semantic')
    expect(result.getByText('Profile').closest('li')).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(result.container.querySelector('.ads-menu-submenu-list')).toHaveClass('list-semantic')
    expect(result.container.querySelector('.ads-menu-item-divider')).toHaveClass('divider-semantic')
  })

  it('applies menu and submenu themes and renders horizontal overflow indicator hook', () => {
    const result = render(() => (
      <Menu
        mode="horizontal"
        theme="dark"
        overflowedIndicator={<span data-testid="overflow">more</span>}
        items={[
          {
            key: 'settings',
            label: 'Settings',
            theme: 'light',
            children: [{ key: 'profile', label: 'Profile' }],
          },
        ]}
      />
    ))

    expect(result.container.firstElementChild).toHaveClass('ads-menu-dark')
    expect(result.container.querySelector('.ads-menu-submenu-light')).toBeInTheDocument()
    expect(
      result.getByTestId('overflow').closest('.ads-menu-overflowed-indicator'),
    ).toBeInTheDocument()

    const styles = menuStyleText()
    expect(styles).toContain('.ads-menu-dark{background:#001529;color:rgba(255,255,255,0.65);')
    expect(styles).toContain(
      '.ads-menu-dark .ads-menu-submenu-popup{background:#001529;color:rgba(255,255,255,0.65);',
    )
  })

  it('registers antd-like menu layout styles', () => {
    render(() => <Menu mode="horizontal" inlineCollapsed items={items} />)

    const styles = menuStyleText()
    expect(styles).toContain('.ads-menu-inline-collapsed{width:80px;')
    expect(styles).toContain('.ads-menu-horizontal{')
    expect(styles).toContain('line-height:46px;')
    expect(styles).toContain('.ads-menu-horizontal > .ads-menu-item::after')
    expect(styles).toContain('border-bottom:2px solid transparent;')
    expect(styles).toContain('.ads-menu-inline .ads-menu-item-selected::after')
    expect(styles).toContain('border-inline-end:3px solid #1677ff;')
    expect(styles).toContain('.ads-menu-submenu-popup{')
    expect(styles).toContain('min-width:160px;')
    expect(styles).toContain('box-shadow:')
  })
})
