import { Button, Space, message } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const messageArgsRows: ApiTableRow[] = [
  { property: 'key', description: 'Stable key used to update or destroy a message.', type: 'string' },
  { property: 'type', description: 'Message visual type.', type: "'info' | 'success' | 'error' | 'warning' | 'loading'", defaultValue: "'info'" },
  { property: 'content', description: 'Message content.', type: 'JSX.Element' },
  { property: 'duration', description: 'Auto-close delay in seconds. Loading messages default to 0.', type: 'number', defaultValue: '3' },
  { property: 'onClose', description: 'Called after an auto-close timer removes the message.', type: '() => void' },
]

const handleRows: ApiTableRow[] = [
  { property: 'close', description: 'Closes the message created by the returned handle.', type: '() => void' },
]

const instanceRows: ApiTableRow[] = [
  { property: 'message.open', description: 'Opens a message with a full configuration object.', type: '(args: MessageArgs) => MessageHandle' },
  { property: 'message.info', description: 'Opens an info message.', type: '(content, duration?) => MessageHandle' },
  { property: 'message.success', description: 'Opens a success message.', type: '(content, duration?) => MessageHandle' },
  { property: 'message.error', description: 'Opens an error message.', type: '(content, duration?) => MessageHandle' },
  { property: 'message.warning', description: 'Opens a warning message.', type: '(content, duration?) => MessageHandle' },
  { property: 'message.loading', description: 'Opens a loading message. It remains until closed when duration is omitted.', type: '(content, duration?) => MessageHandle' },
  { property: 'message.destroy', description: 'Destroys one keyed message or all messages.', type: '(key?: string) => void' },
]

export default function MessagePage() {
  return (
    <>
      <h1>Message</h1>
      <p>Message provides lightweight global feedback for user actions.</p>

      <DemoBlock title="Basic" code={`message.info('Hello message')`}>
        <Button onClick={() => message.info('Hello message')}>Show message</Button>
      </DemoBlock>

      <DemoBlock title="Types" code={`message.success('Saved')
message.error('Failed')
message.warning('Check input')`}>
        <Space wrap>
          <Button onClick={() => message.success('Saved')}>Success</Button>
          <Button onClick={() => message.error('Failed')}>Error</Button>
          <Button onClick={() => message.warning('Check input')}>Warning</Button>
          <Button onClick={() => message.info('Info')}>Info</Button>
        </Space>
      </DemoBlock>

      <DemoBlock title="Duration" code={`message.open({ content: 'Closes after 1 second', duration: 1 })`}>
        <Button onClick={() => message.open({ content: 'Closes after 1 second', duration: 1 })}>
          Short message
        </Button>
      </DemoBlock>

      <DemoBlock title="Loading" code={`const handle = message.loading('Loading')
setTimeout(() => handle.close(), 1200)`}>
        <Button
          onClick={() => {
            const handle = message.loading('Loading')
            window.setTimeout(() => handle.close(), 1200)
          }}
        >
          Show loading
        </Button>
      </DemoBlock>

      <DemoBlock title="Keyed update" code={`message.open({ key: 'upload', type: 'loading', content: 'Uploading', duration: 0 })
setTimeout(() => message.open({ key: 'upload', type: 'success', content: 'Uploaded' }), 1000)`}>
        <Button
          onClick={() => {
            message.open({ key: 'upload', type: 'loading', content: 'Uploading', duration: 0 })
            window.setTimeout(() => {
              message.open({ key: 'upload', type: 'success', content: 'Uploaded' })
            }, 1000)
          }}
        >
          Update keyed message
        </Button>
      </DemoBlock>

      <h2>API</h2>
      <h3>MessageArgs</h3>
      <ApiTable rows={messageArgsRows} aria-label="Message Args API" />
      <h3>MessageHandle</h3>
      <ApiTable rows={handleRows} aria-label="Message Handle API" />
      <h3>MessageInstance</h3>
      <ApiTable rows={instanceRows} aria-label="Message Instance API" />
    </>
  )
}
