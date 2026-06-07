import { Button, Space, notification } from '@ant-design-solid/core'
import { CheckCircleFilled, SmileOutlined } from '@ant-design-solid/icons'
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
  {
    property: 'title',
    description: 'Notification title content. Preferred over message.',
    type: 'JSX.Element',
  },
  {
    property: 'message',
    description: 'Deprecated-compatible notification title content.',
    type: 'JSX.Element',
  },
  { property: 'description', description: 'Notification body content.', type: 'JSX.Element' },
  {
    property: 'duration',
    description: 'Auto-close delay in seconds. Set 0 or false to keep open.',
    type: 'number | false',
    defaultValue: '4.5',
  },
  {
    property: 'placement',
    description: 'Screen placement.',
    type: "'top' | 'topLeft' | 'topRight' | 'bottom' | 'bottomLeft' | 'bottomRight'",
    defaultValue: "'topRight'",
  },
  { property: 'icon', description: 'Custom notification icon.', type: 'JSX.Element' },
  { property: 'actions', description: 'Custom action area.', type: 'JSX.Element' },
  {
    property: 'btn',
    description: 'Deprecated-compatible custom action area.',
    type: 'JSX.Element',
  },
  {
    property: 'closable',
    description: 'Whether to show close button, or close button config.',
    type: 'boolean | { closeIcon?: JSX.Element; onClose?: () => void }',
    defaultValue: 'true',
  },
  {
    property: 'closeIcon',
    description: 'Custom close icon. Set false or null to hide close button.',
    type: 'JSX.Element | boolean | null',
  },
  { property: 'className', description: 'Custom class for the notice element.', type: 'string' },
  {
    property: 'classNames',
    description: 'Custom classes for semantic DOM parts.',
    type: 'Partial<Record<NotificationSemanticKey, string>>',
  },
  {
    property: 'style',
    description: 'Inline style for the notice element.',
    type: 'JSX.CSSProperties',
  },
  {
    property: 'styles',
    description: 'Inline styles for semantic DOM parts.',
    type: 'Partial<Record<NotificationSemanticKey, JSX.CSSProperties>>',
  },
  {
    property: 'props',
    description: 'Additional attributes for the notice element.',
    type: 'JSX.HTMLAttributes<HTMLDivElement> & data-* attributes',
  },
  {
    property: 'role',
    description: 'Screen reader role for notification content.',
    type: "'alert' | 'status'",
    defaultValue: "'alert'",
  },
  { property: 'showProgress', description: 'Show auto-close progress bar.', type: 'boolean' },
  {
    property: 'pauseOnHover',
    description: 'Pause auto-close timer while hovered.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'onClick',
    description: 'Called when the notification is clicked.',
    type: 'JSX.EventHandler<HTMLDivElement, MouseEvent>',
  },
  { property: 'onClose', description: 'Called when the notification closes.', type: '() => void' },
]

const notificationConfigRows: ApiTableRow[] = [
  {
    property: 'placement',
    description: 'Default placement for new notifications.',
    type: 'NotificationPlacement',
    defaultValue: "'topRight'",
  },
  {
    property: 'duration',
    description: 'Default auto-close delay in seconds.',
    type: 'number | false',
    defaultValue: '4.5',
  },
  {
    property: 'top',
    description: 'Distance from top edge in pixels for top placements.',
    type: 'number',
    defaultValue: '24',
  },
  {
    property: 'bottom',
    description: 'Distance from bottom edge in pixels for bottom placements.',
    type: 'number',
    defaultValue: '24',
  },
  {
    property: 'getContainer',
    description: 'Returns the container used to mount notifications.',
    type: '() => HTMLElement',
    defaultValue: 'document.body',
  },
  {
    property: 'maxCount',
    description: 'Maximum visible notifications; oldest are dropped when exceeded.',
    type: 'number',
  },
  {
    property: 'closeIcon',
    description: 'Default close icon config.',
    type: 'JSX.Element | boolean | null',
  },
  { property: 'showProgress', description: 'Default progress bar visibility.', type: 'boolean' },
  {
    property: 'pauseOnHover',
    description: 'Default hover pause behavior.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'rtl',
    description: 'Enable RTL notification container class.',
    type: 'boolean',
    defaultValue: 'false',
  },
]

const notificationSemanticRows: ApiTableRow[] = [
  { property: 'root', description: 'Placement container element.', type: 'string' },
  { property: 'notice', description: 'Notification notice wrapper.', type: 'string' },
  { property: 'icon', description: 'Icon wrapper.', type: 'string' },
  { property: 'message', description: 'Title/message content wrapper.', type: 'string' },
  { property: 'description', description: 'Description content wrapper.', type: 'string' },
  { property: 'actions', description: 'Actions or legacy btn wrapper.', type: 'string' },
  { property: 'close', description: 'Close button element.', type: 'string' },
  { property: 'progress', description: 'Auto-close progress bar element.', type: 'string' },
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
  {
    property: 'notification.config',
    description: 'Configures defaults for subsequent notifications.',
    type: '(options: NotificationConfig) => void',
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
        code={`notification.open({ title: 'Top center', placement: 'top' })
notification.open({ title: 'Bottom left', placement: 'bottomLeft' })`}
      >
        <Space wrap>
          <Button onClick={() => notification.open({ title: 'Top center', placement: 'top' })}>
            Top
          </Button>
          <Button onClick={() => notification.open({ title: 'Top left', placement: 'topLeft' })}>
            Top left
          </Button>
          <Button
            onClick={() => notification.open({ title: 'Bottom center', placement: 'bottom' })}
          >
            Bottom
          </Button>
          <Button
            onClick={() => notification.open({ title: 'Bottom left', placement: 'bottomLeft' })}
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

      <DemoBlock
        title="Custom icon and actions"
        code={`notification.open({
  title: 'Custom notification',
  description: 'Use icon and actions to compose richer feedback.',
  icon: <SmileOutlined />,
  actions: <Button size="small" type="primary">Confirm</Button>,
})`}
      >
        <Button
          onClick={() =>
            notification.open({
              title: 'Custom notification',
              description: 'Use icon and actions to compose richer feedback.',
              icon: <SmileOutlined />,
              actions: (
                <Space>
                  <Button size="small">Later</Button>
                  <Button size="small" type="primary">
                    Confirm
                  </Button>
                </Space>
              ),
            })
          }
        >
          Custom content
        </Button>
      </DemoBlock>

      <DemoBlock
        title="Progress and hover pause"
        code={`notification.open({
  title: 'Uploading',
  description: 'Hover to pause auto close.',
  duration: 5,
  showProgress: true,
})`}
      >
        <Button
          onClick={() =>
            notification.open({
              title: 'Uploading',
              description: 'Hover to pause auto close.',
              duration: 5,
              showProgress: true,
            })
          }
        >
          Show progress
        </Button>
      </DemoBlock>

      <DemoBlock
        title="Custom close behavior"
        code={`notification.open({
  title: 'No close button',
  duration: false,
  closable: false,
})`}
      >
        <Space wrap>
          <Button
            onClick={() =>
              notification.open({
                title: 'No close button',
                description: 'This notification stays until destroyed.',
                duration: false,
                closable: false,
              })
            }
          >
            Hide close
          </Button>
          <Button
            onClick={() =>
              notification.open({
                title: 'Custom close icon',
                description: 'The close icon can be replaced.',
                closeIcon: <CheckCircleFilled />,
              })
            }
          >
            Custom close icon
          </Button>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Style and semantic DOM"
        code={`notification.open({
  title: 'Styled',
  className: 'my-notice',
  style: { border: '1px solid #1677ff' },
  classNames: { message: 'my-message' },
  styles: { description: { color: '#1677ff' } },
})`}
      >
        <Button
          onClick={() =>
            notification.open({
              title: 'Styled notification',
              description: 'className, style, classNames and styles are supported.',
              className: 'custom-docs-notification',
              style: { border: '1px solid #1677ff' },
              classNames: { message: 'custom-docs-notification-message' },
              styles: { description: { color: '#1677ff' } },
            })
          }
        >
          Styled
        </Button>
      </DemoBlock>

      <DemoBlock
        title="Global config"
        code={`notification.config({
  placement: 'bottomRight',
  duration: 3,
  bottom: 48,
  maxCount: 3,
  showProgress: true,
})`}
      >
        <Button
          onClick={() => {
            notification.config({
              placement: 'bottomRight',
              duration: 3,
              bottom: 48,
              maxCount: 3,
              showProgress: true,
            })
            notification.success({
              title: 'Config applied',
              description: 'Defaults affect later notifications.',
            })
          }}
        >
          Apply config
        </Button>
      </DemoBlock>
      <h2>API</h2>
      <h3>NotificationArgs</h3>
      <ApiTable rows={notificationRows} aria-label="Notification Args API" />
      <h3>NotificationConfig</h3>
      <ApiTable rows={notificationConfigRows} aria-label="Notification Config API" />
      <h3>NotificationSemanticKey</h3>
      <ApiTable rows={notificationSemanticRows} aria-label="Notification Semantic Key API" />
      <h3>NotificationHandle</h3>
      <ApiTable rows={notificationHandleRows} aria-label="Notification Handle API" />
      <h3>NotificationInstance</h3>
      <ApiTable rows={notificationInstanceRows} aria-label="Notification Instance API" />
    </>
  )
}
