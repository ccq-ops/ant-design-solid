import { Breadcrumb, Space, message } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const breadcrumbRows: ApiTableRow[] = [
  {
    property: 'items',
    description: 'Breadcrumb items rendered from data.',
    type: 'BreadcrumbItemType[]',
  },
  {
    property: 'separator',
    description: 'Default separator between items.',
    type: 'JSX.Element',
    defaultValue: "'/'",
  },
  { property: 'children', description: 'Manual breadcrumb item composition.', type: 'JSX.Element' },
]

const breadcrumbItemRows: ApiTableRow[] = [
  {
    property: 'title',
    description: 'Item label for data-driven breadcrumbs.',
    type: 'JSX.Element',
  },
  { property: 'href', description: 'Renders the item as a link when provided.', type: 'string' },
  {
    property: 'onClick',
    description: 'Click handler for interactive breadcrumb items.',
    type: 'JSX.EventHandlerUnion<HTMLElement, MouseEvent>',
  },
  { property: 'separator', description: 'Custom separator after this item.', type: 'JSX.Element' },
]

const breadcrumbItemPropRows: ApiTableRow[] = [
  { property: 'href', description: 'Renders this manual item as a link.', type: 'string' },
  {
    property: 'onClick',
    description: 'Click handler for this manual item.',
    type: 'JSX.EventHandlerUnion<HTMLElement, MouseEvent>',
  },
  { property: 'children', description: 'Item label content.', type: 'JSX.Element' },
]

export default function BreadcrumbPage() {
  return (
    <>
      <h1>Breadcrumb</h1>
      <DemoBlock
        title="Basic"
        code={`<Breadcrumb items={[{ title: 'Home', href: '/' }, { title: 'Components', href: '/components' }, { title: 'Breadcrumb' }]} />`}
      >
        <Breadcrumb
          items={[
            { title: 'Home', href: '/' },
            { title: 'Components', href: '/components' },
            { title: 'Breadcrumb' },
          ]}
        />
      </DemoBlock>
      <DemoBlock
        title="Custom separator"
        code={`<Breadcrumb separator=">" items={[{ title: 'Home' }, { title: 'Library', separator: '→' }, { title: 'Breadcrumb' }]} />`}
      >
        <Breadcrumb
          separator=">"
          items={[
            { title: 'Home', href: '/' },
            { title: 'Library', separator: '→' },
            { title: 'Breadcrumb' },
          ]}
        />
      </DemoBlock>
      <DemoBlock
        title="Clickable item"
        code={`<Breadcrumb items={[{ title: 'Home', href: '/' }, { title: 'Reload', onClick: () => message.success('Reloaded') }, { title: 'Current' }]} />`}
      >
        <Breadcrumb
          items={[
            { title: 'Home', href: '/' },
            {
              title: 'Reload',
              onClick: () => message.success('Reloaded'),
            },
            { title: 'Current' },
          ]}
        />
      </DemoBlock>
      <DemoBlock
        title="Manual composition"
        code={`<Breadcrumb><Breadcrumb.Item href="/">Home</Breadcrumb.Item><Breadcrumb.Item>Current</Breadcrumb.Item></Breadcrumb>`}
      >
        <Space direction="vertical">
          <Breadcrumb>
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Item href="/components">Components</Breadcrumb.Item>
            <Breadcrumb.Item>Breadcrumb</Breadcrumb.Item>
          </Breadcrumb>
        </Space>
      </DemoBlock>

      <h2>API</h2>
      <h3>Breadcrumb</h3>
      <ApiTable rows={breadcrumbRows} aria-label="Breadcrumb API" />
      <h3>Breadcrumb item data</h3>
      <ApiTable rows={breadcrumbItemRows} aria-label="Breadcrumb Item Data API" />
      <h3>Breadcrumb.Item</h3>
      <ApiTable rows={breadcrumbItemPropRows} aria-label="Breadcrumb Item API" />
    </>
  )
}
