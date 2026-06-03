import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
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

describe('Menu', () => {
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

  it('toggles submenu open state and calls onOpenChange', () => {
    const onOpenChange = vi.fn()
    const result = render(() => <Menu items={items} onOpenChange={onOpenChange} />)
    const submenu = result.getByRole('menuitem', { name: 'Settings' })

    fireEvent.click(submenu)
    expect(onOpenChange).toHaveBeenCalledWith(['settings'])
    expect(submenu).toHaveAttribute('aria-expanded', 'true')
    expect(submenu.closest('.ads-menu-submenu')).toHaveClass('ads-menu-submenu-open')

    fireEvent.click(submenu)
    expect(onOpenChange).toHaveBeenLastCalledWith([])
    expect(submenu).toHaveAttribute('aria-expanded', 'false')
  })

  it('controlled openKeys calls onOpenChange without changing open state by itself', () => {
    const onOpenChange = vi.fn()
    const result = render(() => <Menu items={items} openKeys={[]} onOpenChange={onOpenChange} />)
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
})
