import { Tabs } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const items = [
  { key: 'overview', label: 'Overview', children: <p>Overview content</p> },
  { key: 'usage', label: 'Usage', children: <p>Usage content</p> },
  { key: 'disabled', label: 'Disabled', disabled: true, children: <p>Disabled content</p> },
]

const tabsRows: ApiTableRow[] = [
  { property: 'items', description: 'Tab items rendered as tabs and panes.', type: 'TabsItem[]' },
  { property: 'activeKey', description: 'Controlled active tab key.', type: 'string' },
  { property: 'defaultActiveKey', description: 'Initial active tab key for uncontrolled usage.', type: 'string' },
  { property: 'onChange', description: 'Called when the active tab changes.', type: '(activeKey: string) => void' },
  { property: 'type', description: 'Tab visual style.', type: "'line' | 'card'", defaultValue: "'line'" },
  { property: 'size', description: 'Tab size from the theme component size scale.', type: 'ComponentSize' },
  { property: 'tabPosition', description: 'Tab bar position.', type: "'top' | 'bottom'", defaultValue: "'top'" },
  { property: 'destroyInactiveTabPane', description: 'Unmounts inactive tab pane content.', type: 'boolean', defaultValue: 'false' },
]

const tabsItemRows: ApiTableRow[] = [
  { property: 'key', description: 'Stable tab key.', type: 'string' },
  { property: 'label', description: 'Tab label content.', type: 'JSX.Element' },
  { property: 'children', description: 'Tab pane content.', type: 'JSX.Element' },
  { property: 'disabled', description: 'Disables this tab.', type: 'boolean' },
]

export default function TabsPage() {
  return (
    <>
      <h1>Tabs</h1>
      <DemoBlock title="Basic" code={`<Tabs items={items} />`}>
        <Tabs items={items} />
      </DemoBlock>
      <DemoBlock title="Card" code={`<Tabs type="card" items={items} />`}>
        <Tabs type="card" items={items} />
      </DemoBlock>
      <DemoBlock title="Bottom" code={`<Tabs tabPosition="bottom" items={items} />`}>
        <Tabs tabPosition="bottom" items={items} />
      </DemoBlock>
      <DemoBlock
        title="Destroy inactive pane"
        code={`<Tabs destroyInactiveTabPane items={items} />`}
      >
        <Tabs destroyInactiveTabPane items={items} />
      </DemoBlock>

      <h2>API</h2>
      <h3>Tabs</h3>
      <ApiTable rows={tabsRows} aria-label="Tabs API" />
      <h3>TabsItem</h3>
      <ApiTable rows={tabsItemRows} aria-label="Tabs Item API" />
    </>
  )
}
