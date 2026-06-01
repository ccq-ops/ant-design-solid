import { Button, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../site/DemoBlock'
export function SpacePage() {
  return (
    <>
      <h1>Space</h1>
      <DemoBlock title="Basic" code={`<Space><Button /> <Button /></Space>`}>
        <Space size="large" wrap>
          <Button>One</Button>
          <Button>Two</Button>
          <Button>Three</Button>
        </Space>
      </DemoBlock>
    </>
  )
}
