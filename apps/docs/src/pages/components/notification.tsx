import { Button, Space, notification } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const notificationRows: ApiTableRow[] = [
  {
    property: 'key',
    description: 'Stable key used to update or destroy a notification.',
    type: 'string',
  },
  {
    property: 'type',
    description: 'Notification semantic type.',
    type: "'success' | 'info' | 'warning' | 'error'",
  },
  { property: 'message', description: 'Notification title content.', type: 'JSX.Element' },
  { property: 'description', description: 'Notification body content.', type: 'JSX.Element' },
  { property: 'duration', description: 'Auto-close delay in seconds.', type: 'number' },
  {
    property: 'placement',
    description: 'Screen corner placement.',
    type: "'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'",
    defaultValue: "'topRight'",
  },
  {
    property: 'onClose',
    description: 'Called when the notification closes by timer or handle.',
    type: '() => void',
  },
]

const notificationHandleRows: ApiTableRow[] = [
  {
    property: 'close',
    description: 'Closes the notification created by the returned handle.',
    type: '() => void',
  },
]

const notificationInstanceRows: ApiTableRow[] = [
  {
    property: 'notification.open',
    description: 'Opens a notification with a full configuration object.',
    type: '(args: NotificationArgs) => NotificationHandle',
  },
  {
    property: 'notification.success',
    description: 'Opens a success notification.',
    type: '(args: NotificationArgs) => NotificationHandle',
  },
  {
    property: 'notification.info',
    description: 'Opens an info notification.',
    type: '(args: NotificationArgs) => NotificationHandle',
  },
  {
    property: 'notification.warning',
    description: 'Opens a warning notification.',
    type: '(args: NotificationArgs) => NotificationHandle',
  },
  {
    property: 'notification.error',
    description: 'Opens an error notification.',
    type: '(args: NotificationArgs) => NotificationHandle',
  },
  {
    property: 'notification.destroy',
    description: 'Destroys one keyed notification or all notifications.',
    type: '(key?: string) => void',
  },
]

export default function NotificationPage() {
  return (
    <>
      <h1>Notification</h1>
      <p>Notification displays global feedback messages in a corner of the viewport.</p>

      <DemoBlock
        title="Basic"
        code={`notification.success({ message: 'Done', description: 'Task finished' })`}
      >
        <Button
          onClick={() => notification.success({ message: 'Done', description: 'Task finished' })}
        >
          Success
        </Button>
      </DemoBlock>

      <DemoBlock
        title="Types"
        code={`notification.info({ message: 'Info' })
notification.error({ message: 'Error' })`}
      >
        <Space wrap>
          <Button
            onClick={() => notification.info({ message: 'Info', description: 'Information' })}
          >
            Info
          </Button>
          <Button
            onClick={() => notification.warning({ message: 'Warning', description: 'Check this' })}
          >
            Warning
          </Button>
          <Button
            onClick={() =>
              notification.error({ message: 'Error', description: 'Something failed' })
            }
          >
            Error
          </Button>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Placement"
        code={`notification.open({ message: 'Bottom left', placement: 'bottomLeft' })`}
      >
        <Space wrap>
          <Button onClick={() => notification.open({ message: 'Top left', placement: 'topLeft' })}>
            Top left
          </Button>
          <Button
            onClick={() => notification.open({ message: 'Bottom left', placement: 'bottomLeft' })}
          >
            Bottom left
          </Button>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Keyed update"
        code={`notification.open({ key: 'sync', message: 'Syncing', duration: 0 })`}
      >
        <Button
          onClick={() => {
            notification.open({
              key: 'sync',
              message: 'Syncing',
              description: 'Please wait',
              duration: 0,
            })
            window.setTimeout(() => {
              notification.success({
                key: 'sync',
                message: 'Synced',
                description: 'All changes saved',
              })
            }, 900)
          }}
        >
          Update notification
        </Button>
      </DemoBlock>

      <h2>API</h2>
      <h3>NotificationArgs</h3>
      <ApiTable rows={notificationRows} aria-label="Notification Args API" />
      <h3>NotificationHandle</h3>
      <ApiTable rows={notificationHandleRows} aria-label="Notification Handle API" />
      <h3>NotificationInstance</h3>
      <ApiTable rows={notificationInstanceRows} aria-label="Notification Instance API" />
    </>
  )
}
