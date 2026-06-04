import { Menu, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'
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
    </>
  )
}
