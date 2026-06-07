import { Layout, Menu } from '@ant-design-solid/core'
import { createSignal } from 'solid-js'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'
import type { MenuItem } from '@ant-design-solid/core'

const layoutRows: ApiTableRow[] = [
  {
    property: 'hasSider',
    description: 'Applies sider-aware layout styling.',
    type: 'boolean',
    defaultValue: 'false',
  },
  { property: 'children', description: 'Layout regions and content.', type: 'JSX.Element' },
]

const layoutPartRows: ApiTableRow[] = [
  { property: 'children', description: 'Region content.', type: 'JSX.Element' },
]

const layoutSiderRows: ApiTableRow[] = [
  {
    property: 'width',
    description: 'Expanded sider width.',
    type: 'number | string',
    defaultValue: '200',
  },
  {
    property: 'collapsedWidth',
    description: 'Collapsed sider width.',
    type: 'number | string',
    defaultValue: '80',
  },
  {
    property: 'collapsed',
    description: 'Whether the sider uses collapsed width and styling.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'theme',
    description: 'Sider color theme.',
    type: "'light' | 'dark'",
    defaultValue: "'dark'",
  },
  { property: 'children', description: 'Sider content, often navigation.', type: 'JSX.Element' },
]

const navItems: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'settings', label: 'Settings' },
  { key: 'profile', label: 'Profile' },
]

const panelStyle = {
  padding: '24px',
  background: 'var(--docs-surface-solid)',
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

      <h2>API</h2>
      <h3>Layout</h3>
      <ApiTable rows={layoutRows} aria-label="Layout API" />
      <h3>Layout.Header / Layout.Content / Layout.Footer</h3>
      <ApiTable rows={layoutPartRows} aria-label="Layout region API" />
      <h3>Layout.Sider</h3>
      <ApiTable rows={layoutSiderRows} aria-label="Layout Sider API" />
    </>
  )
}
