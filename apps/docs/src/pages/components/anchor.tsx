import { Anchor, Card, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

const items = [
  { href: '#anchor-basic', title: 'Basic' },
  {
    href: '#anchor-examples',
    title: 'Examples',
    children: [{ href: '#anchor-api', title: 'API' }],
  },
]

export default function AnchorPage() {
  return (
    <>
      <h1>Anchor</h1>
      <p>
        Anchor renders page-section navigation and highlights the current section while scrolling.
      </p>

      <DemoBlock title="Basic" code={`<Anchor items={[{ href: '#basic', title: 'Basic' }]} />`}>
        <Space align="start" style={{ width: '100%' }}>
          <Anchor affix={false} items={items} />
          <div style={{ flex: 1 }}>
            <Card id="anchor-basic" title="Basic">
              Basic section content.
            </Card>
            <div style={{ height: '24px' }} />
            <Card id="anchor-examples" title="Examples">
              Example section content.
            </Card>
            <div style={{ height: '24px' }} />
            <Card id="anchor-api" title="API">
              API section content.
            </Card>
          </div>
        </Space>
      </DemoBlock>

      <DemoBlock title="Affixed" code={`<Anchor offsetTop={80} items={items} />`}>
        <Anchor offsetTop={80} items={items} />
      </DemoBlock>
    </>
  )
}
