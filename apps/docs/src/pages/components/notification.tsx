import { Button, Space, notification } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

export default function NotificationPage() {
  return (
    <>
      <h1>Notification</h1>
      <DemoBlock
        title="Basic"
        code={`notification.success({ message: 'Done', description: 'Task finished' })`}
      >
        <Space>
          <Button
            onClick={() => notification.success({ message: 'Done', description: 'Task finished' })}
          >
            Success
          </Button>
          <Button
            onClick={() => notification.open({ message: 'Bottom left', placement: 'bottomLeft' })}
          >
            Bottom left
          </Button>
        </Space>
      </DemoBlock>
    </>
  )
}
