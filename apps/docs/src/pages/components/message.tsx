import { Button, Space, message } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

export default function MessagePage() {
  return (
    <>
      <h1>Message</h1>
      <DemoBlock title="Basic" code={`message.success('Saved')`}>
        <Space>
          <Button onClick={() => message.success('Saved')}>Success</Button>
          <Button onClick={() => message.error('Failed')}>Error</Button>
          <Button onClick={() => message.loading('Loading', 2)}>Loading</Button>
        </Space>
      </DemoBlock>
    </>
  )
}
