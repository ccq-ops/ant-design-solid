import { Affix, Button, Card, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

export default function AffixPage() {
  return (
    <>
      <h1>Affix</h1>
      <p>Affix pins content to the viewport after the page scrolls past an offset.</p>

      <DemoBlock
        title="Offset top"
        code={`<Affix offsetTop={16}><Button>Affixed top</Button></Affix>`}
      >
        <Affix offsetTop={16}>
          <Button type="primary">Affixed top</Button>
        </Affix>
      </DemoBlock>

      <DemoBlock
        title="Offset bottom"
        code={`<Affix offsetBottom={24}><Button>Affixed bottom</Button></Affix>`}
      >
        <Affix offsetBottom={24}>
          <Button>Affixed bottom</Button>
        </Affix>
      </DemoBlock>

      <DemoBlock
        title="In content"
        code={`<Affix offsetTop={80}><Card>Sticky tools</Card></Affix>`}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Affix offsetTop={80}>
            <Card size="small">Sticky tools stay visible while scrolling.</Card>
          </Affix>
          <p>Scroll the page to see the affix state change.</p>
        </Space>
      </DemoBlock>
    </>
  )
}
