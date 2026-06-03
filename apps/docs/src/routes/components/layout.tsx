import { Layout, Menu } from '@ant-design-solid/core'
import { createSignal } from 'solid-js'
import { DemoBlock } from '../../site/demo-block'
import type { MenuItem } from '@ant-design-solid/core'

const navItems: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'settings', label: 'Settings' },
  { key: 'profile', label: 'Profile' },
]

const panelStyle = {
  padding: '24px',
  background: '#fff',
  'min-height': '120px',
}

export default function LayoutPage() {
  const [collapsed, setCollapsed] = createSignal(false)

  return (
    <>
      <h1>Layout</h1>
      <p>Layout provides the outer structure for pages with header, content, footer, and sider.</p>

      <DemoBlock
        title="Basic"
        code={`<Layout><Layout.Header>Header</Layout.Header><Layout.Content>Content</Layout.Content><Layout.Footer>Footer</Layout.Footer></Layout>`}
      >
        <Layout>
          <Layout.Header>Header</Layout.Header>
          <Layout.Content style={panelStyle}>Content</Layout.Content>
          <Layout.Footer>Footer</Layout.Footer>
        </Layout>
      </DemoBlock>

      <DemoBlock
        title="With sider"
        code={`<Layout hasSider><Layout.Sider><Menu items={items} /></Layout.Sider><Layout><Layout.Header>Header</Layout.Header><Layout.Content>Content</Layout.Content></Layout></Layout>`}
      >
        <Layout hasSider style={{ 'min-height': '240px' }}>
          <Layout.Sider>
            <Menu mode="inline" defaultSelectedKeys={['dashboard']} items={navItems} />
          </Layout.Sider>
          <Layout>
            <Layout.Header>Header</Layout.Header>
            <Layout.Content style={panelStyle}>Content</Layout.Content>
            <Layout.Footer>Footer</Layout.Footer>
          </Layout>
        </Layout>
      </DemoBlock>

      <DemoBlock
        title="Collapsed sider"
        code={`<Layout.Sider collapsed={collapsed()} collapsedWidth={64} width={220}>...</Layout.Sider>`}
      >
        <button type="button" onClick={() => setCollapsed((value) => !value)}>
          Toggle collapsed
        </button>
        <Layout hasSider style={{ 'min-height': '220px', 'margin-top': '12px' }}>
          <Layout.Sider collapsed={collapsed()} collapsedWidth={64} width={220} theme="light">
            <Menu
              mode="inline"
              inlineCollapsed={collapsed()}
              defaultSelectedKeys={['dashboard']}
              items={[
                { key: 'dashboard', label: 'Dashboard', icon: '🏠' },
                { key: 'settings', label: 'Settings', icon: '⚙️' },
                { key: 'profile', label: 'Profile', icon: '👤' },
              ]}
            />
          </Layout.Sider>
          <Layout.Content style={panelStyle}>Content</Layout.Content>
        </Layout>
      </DemoBlock>
    </>
  )
}
