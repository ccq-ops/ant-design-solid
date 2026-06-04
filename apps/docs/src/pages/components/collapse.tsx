import { Collapse, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

const text = `A dog is a type of domesticated animal. Known for its loyalty and faithfulness, it can be found as a welcome guest in many households across the world.`

const basicItems = [
  { key: '1', label: 'This is panel header 1', children: <p>{text}</p> },
  { key: '2', label: 'This is panel header 2', children: <p>{text}</p> },
  { key: '3', label: 'This is panel header 3', children: <p>{text}</p> },
]

export default function CollapsePage() {
  return (
    <>
      <h1>Collapse</h1>
      <p>Collapse displays content areas that can be expanded or collapsed.</p>

      <DemoBlock
        title="Basic"
        code={`<Collapse items={[{ key: '1', label: 'This is panel header 1', children: <p>Content</p> }]} />`}
      >
        <Collapse items={basicItems} />
      </DemoBlock>

      <DemoBlock title="Default active" code={`<Collapse defaultActiveKey="1" items={items} />`}>
        <Collapse defaultActiveKey="1" items={basicItems} />
      </DemoBlock>

      <DemoBlock title="Accordion" code={`<Collapse accordion items={items} />`}>
        <Collapse accordion items={basicItems} />
      </DemoBlock>

      <DemoBlock
        title="Ghost and borderless"
        code={`<Collapse ghost items={items} />\n<Collapse bordered={false} items={items} />`}
      >
        <Space direction="vertical" class="w-full">
          <Collapse ghost defaultActiveKey="1" items={basicItems.slice(0, 2)} />
          <Collapse bordered={false} defaultActiveKey="2" items={basicItems.slice(0, 2)} />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Collapsible area"
        code={`<Collapse items={[{ key: '1', label: 'Icon only', collapsible: 'icon', children: 'Content' }]} />`}
      >
        <Collapse
          items={[
            { key: '1', label: 'Icon only', collapsible: 'icon', children: <p>{text}</p> },
            { key: '2', label: 'Header only', collapsible: 'header', children: <p>{text}</p> },
            { key: '3', label: 'Disabled', disabled: true, children: <p>{text}</p> },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="Expand icon position"
        code={`<Collapse expandIconPosition="end" items={items} />`}
      >
        <Collapse expandIconPosition="end" defaultActiveKey="1" items={basicItems} />
      </DemoBlock>
    </>
  )
}
