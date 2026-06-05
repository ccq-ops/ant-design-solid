import { Menu, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'
import type { MenuItem } from '@ant-design-solid/core'

const items: MenuItem[] = [
  { key: 'mail', label: 'Mail' },
  {
    key: 'settings',
    label: 'Settings',
    children: [
      { key: 'profile', label: 'Profile' },
      { key: 'security', label: 'Security' },
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

const menuRows: ApiTableRow[] = [
  { property: 'items', description: 'Menu items, submenus, groups, and dividers.', type: 'MenuItem[]' },
  { property: 'mode', description: 'Menu layout mode.', type: "'vertical' | 'horizontal' | 'inline'", defaultValue: "'vertical'" },
  { property: 'selectedKeys', description: 'Controlled selected item keys.', type: 'string[]' },
  { property: 'defaultSelectedKeys', description: 'Initial selected item keys for uncontrolled usage.', type: 'string[]' },
  { property: 'openKeys', description: 'Controlled open submenu keys.', type: 'string[]' },
  { property: 'defaultOpenKeys', description: 'Initial open submenu keys for uncontrolled usage.', type: 'string[]' },
  { property: 'inlineCollapsed', description: 'Collapses inline menus.', type: 'boolean', defaultValue: 'false' },
  { property: 'zIndex', description: 'Overrides popup submenu z-index.', type: 'number' },
  { property: 'getPopupContainer', description: 'Returns popup submenu portal container.', type: '(triggerNode?: HTMLElement) => HTMLElement' },
  { property: 'onClick', description: 'Called when an enabled menu item is clicked.', type: '(info: MenuClickInfo) => void' },
  { property: 'onSelect', description: 'Called when selected keys change.', type: '(info: MenuSelectInfo) => void' },
  { property: 'onOpenChange', description: 'Called when open submenu keys change.', type: '(openKeys: string[]) => void' },
]

const menuItemRows: ApiTableRow[] = [
  { property: 'key', description: 'Stable menu key for item and submenu entries.', type: 'string' },
  { property: 'label', description: 'Menu label content.', type: 'JSX.Element' },
  { property: 'icon', description: 'Optional leading icon.', type: 'JSX.Element' },
  { property: 'disabled', description: 'Disables item interaction.', type: 'boolean' },
  { property: 'type', description: 'Entry type: item, submenu, group, or divider.', type: "'item' | 'submenu' | 'group' | 'divider'" },
  { property: 'children', description: 'Nested entries for submenus and groups.', type: 'MenuItem[]' },
]

export default function MenuPage() {
  return (
    <>
      <h1>Menu</h1>
      <p>Menu displays a list of navigation actions with optional groups and submenus.</p>

      <DemoBlock
        title="Basic"
        code={`<Menu items={[{ key: 'mail', label: 'Mail' }, { key: 'team', label: 'Team' }]} />`}
      >
        <Menu
          items={[
            { key: 'mail', label: 'Mail' },
            { key: 'team', label: 'Team' },
            { key: 'projects', label: 'Projects' },
          ]}
          defaultSelectedKeys={['mail']}
          class="w-60"
        />
      </DemoBlock>

      <DemoBlock
        title="Inline submenu"
        code={`<Menu mode="inline" defaultOpenKeys={['settings']} items={items} />`}
      >
        <Menu
          mode="inline"
          defaultSelectedKeys={['profile']}
          defaultOpenKeys={['settings']}
          items={items}
          class="w-70"
        />
      </DemoBlock>

      <DemoBlock title="Horizontal" code={`<Menu mode="horizontal" items={items} />`}>
        <Menu mode="horizontal" defaultSelectedKeys={['mail']} items={items.slice(0, 2)} />
      </DemoBlock>

      <DemoBlock
        title="Groups and dividers"
        code={`<Menu items={[{ type: 'group', label: 'Workspace', children: [{ key: 'team', label: 'Team' }] }]} />`}
      >
        <Menu items={items} defaultSelectedKeys={['team']} class="w-70" />
      </DemoBlock>

      <DemoBlock
        title="Disabled"
        code={`<Menu items={[{ key: 'disabled', label: 'Disabled', disabled: true }]} />`}
      >
        <Menu
          items={[
            { key: 'enabled', label: 'Enabled' },
            { key: 'disabled', label: 'Disabled item', disabled: true },
            {
              key: 'disabled-submenu',
              label: 'Disabled submenu',
              disabled: true,
              children: [{ key: 'child', label: 'Child' }],
            },
          ]}
          class="w-70"
        />
      </DemoBlock>

      <DemoBlock title="Collapsed" code={`<Menu inlineCollapsed items={items} />`}>
        <Space align="start">
          <Menu
            inlineCollapsed
            defaultSelectedKeys={['mail']}
            defaultOpenKeys={['settings']}
            items={[
              { key: 'mail', label: 'Mail', icon: '✉️' },
              {
                key: 'settings',
                label: 'Settings',
                icon: '⚙️',
                children: [{ key: 'profile', label: 'Profile' }],
              },
            ]}
          />
          <Menu
            defaultSelectedKeys={['mail']}
            defaultOpenKeys={['settings']}
            items={[
              { key: 'mail', label: 'Mail', icon: '✉️' },
              {
                key: 'settings',
                label: 'Settings',
                icon: '⚙️',
                children: [{ key: 'profile', label: 'Profile' }],
              },
            ]}
            class="w-55"
          />
        </Space>
      </DemoBlock>

      <h2>API</h2>
      <h3>Menu</h3>
      <ApiTable rows={menuRows} aria-label="Menu API" />
      <h3>MenuItem</h3>
      <ApiTable rows={menuItemRows} aria-label="Menu Item API" />
    </>
  )
}
