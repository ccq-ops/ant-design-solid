import { Collapse, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const collapseRows: ApiTableRow[] = [
  { property: 'items', description: 'Collapse panel items.', type: 'CollapseItem[]' },
  {
    property: 'activeKey',
    description: 'Controlled active panel key or keys.',
    type: 'string | string[]',
  },
  {
    property: 'defaultActiveKey',
    description: 'Initial active panel key or keys.',
    type: 'string | string[]',
  },
  {
    property: 'accordion',
    description: 'Allows only one panel to be open at a time.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'bordered',
    description: 'Whether to render borders.',
    type: 'boolean',
    defaultValue: 'true',
  },
  { property: 'ghost', description: 'Uses ghost styling.', type: 'boolean', defaultValue: 'false' },
  {
    property: 'collapsible',
    description: 'Controls which part of panels toggles expansion.',
    type: "'header' | 'icon' | 'disabled'",
  },
  {
    property: 'expandIconPosition',
    description: 'Expand icon placement.',
    type: "'start' | 'end'",
    defaultValue: "'start'",
  },
  {
    property: 'onChange',
    description: 'Called with active key or keys after expansion changes.',
    type: '(activeKey: CollapseActiveKey | undefined) => void',
  },
]

const collapseItemRows: ApiTableRow[] = [
  { property: 'key', description: 'Unique panel key.', type: 'string' },
  { property: 'label', description: 'Panel header content.', type: 'JSX.Element' },
  { property: 'children', description: 'Panel body content.', type: 'JSX.Element' },
  { property: 'extra', description: 'Extra header content.', type: 'JSX.Element' },
  {
    property: 'disabled',
    description: 'Disables the panel.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'collapsible',
    description: 'Panel-level collapsible behavior.',
    type: "'header' | 'icon' | 'disabled'",
  },
  { property: 'class', description: 'Additional panel class.', type: 'string' },
  { property: 'style', description: 'Panel inline style.', type: 'JSX.CSSProperties' },
]

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

      <h2>API</h2>
      <h3>Collapse</h3>
      <ApiTable rows={collapseRows} aria-label="Collapse API" />
      <h3>CollapseItem</h3>
      <ApiTable rows={collapseItemRows} aria-label="Collapse Item API" />
    </>
  )
}
