import { Menu, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'
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
          style={{ width: '240px' }}
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
          style={{ width: '280px' }}
        />
      </DemoBlock>

      <DemoBlock title="Horizontal" code={`<Menu mode="horizontal" items={items} />`}>
        <Menu mode="horizontal" defaultSelectedKeys={['mail']} items={items.slice(0, 2)} />
      </DemoBlock>

      <DemoBlock
        title="Groups and dividers"
        code={`<Menu items={[{ type: 'group', label: 'Workspace', children: [{ key: 'team', label: 'Team' }] }]} />`}
      >
        <Menu items={items} defaultSelectedKeys={['team']} style={{ width: '280px' }} />
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
          style={{ width: '280px' }}
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
            style={{ width: '220px' }}
          />
        </Space>
      </DemoBlock>
    </>
  )
}
