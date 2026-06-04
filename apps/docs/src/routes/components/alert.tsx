import { Alert, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

export default function AlertPage() {
  return (
    <>
      <h1>Alert</h1>
      <DemoBlock title="Basic" code={`<Alert message="Success" type="success" showIcon />`}>
        <Space direction="vertical" class="w-full">
          <Alert message="Success" type="success" showIcon />
          <Alert message="Info" type="info" showIcon />
          <Alert message="Warning" type="warning" showIcon />
          <Alert message="Error" type="error" showIcon />
        </Space>
      </DemoBlock>
      <DemoBlock
        title="Closable"
        code={`<Alert closable message="Closable" description="More detail" />`}
      >
        <Alert closable message="Closable" description="More detail" />
      </DemoBlock>
    </>
  )
}
