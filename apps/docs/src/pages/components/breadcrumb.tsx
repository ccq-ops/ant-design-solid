import { Breadcrumb, Space, message } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

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
    </>
  )
}
