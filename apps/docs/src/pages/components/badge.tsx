import { Badge, Button, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

export default function BadgePage() {
  return (
    <>
      <h1>Badge</h1>
      <DemoBlock title="Count" code={`<Badge count={5}><Button>Inbox</Button></Badge>`}>
        <Space wrap>
          <Badge count={5}>
            <Button>Inbox</Button>
          </Badge>
          <Badge count={120} overflowCount={99}>
            <Button>Alerts</Button>
          </Badge>
          <Badge count={0} showZero>
            <Button>Zero</Button>
          </Badge>
        </Space>
      </DemoBlock>
      <DemoBlock title="Dot" code={`<Badge dot><Button>Updates</Button></Badge>`}>
        <Badge dot>
          <Button>Updates</Button>
        </Badge>
      </DemoBlock>
      <DemoBlock title="Status" code={`<Badge status="success" text="Active" />`}>
        <Space direction="vertical">
          <Badge status="success" text="Active" />
          <Badge status="processing" text="Processing" />
          <Badge status="warning" text="Warning" />
          <Badge status="error" text="Error" />
          <Badge status="default" text="Default" />
        </Space>
      </DemoBlock>
    </>
  )
}
