import { Button, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'
export default function ButtonPage() {
  return (
    <>
      <h1>Button</h1>
      <DemoBlock title="Types" code={`<Button type="primary">Primary</Button>`}>
        <Space wrap>
          <Button type="primary">Primary</Button>
          <Button>Default</Button>
          <Button type="dashed">Dashed</Button>
          <Button type="text">Text</Button>
          <Button type="link">Link</Button>
          <Button danger>Danger</Button>
          <Button loading>Loading</Button>
        </Space>
      </DemoBlock>
    </>
  )
}
