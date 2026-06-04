import { Tabs } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

const items = [
  { key: 'overview', label: 'Overview', children: <p>Overview content</p> },
  { key: 'usage', label: 'Usage', children: <p>Usage content</p> },
  { key: 'disabled', label: 'Disabled', disabled: true, children: <p>Disabled content</p> },
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
    </>
  )
}
