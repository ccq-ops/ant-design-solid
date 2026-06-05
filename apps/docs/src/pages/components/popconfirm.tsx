import { createSignal } from 'solid-js'
import { Button, Popconfirm, Space, message } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const popconfirmRows: ApiTableRow[] = [
  { property: 'title', description: 'Main confirmation title.', type: 'JSX.Element' },
  { property: 'description', description: 'Additional explanatory content.', type: 'JSX.Element' },
  { property: 'open', description: 'Controlled popup open state.', type: 'boolean' },
  {
    property: 'defaultOpen',
    description: 'Initial popup open state.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'disabled',
    description: 'Disables opening the popup.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'placement',
    description: 'Popup placement relative to the trigger.',
    type: "'top' | 'bottom' | 'left' | 'right'",
    defaultValue: "'top'",
  },
  { property: 'okText', description: 'OK button text.', type: 'JSX.Element', defaultValue: "'OK'" },
  {
    property: 'cancelText',
    description: 'Cancel button text.',
    type: 'JSX.Element',
    defaultValue: "'Cancel'",
  },
  {
    property: 'onConfirm',
    description: 'Called when OK is clicked. Rejected promises keep the popup open.',
    type: '() => void | Promise<void>',
  },
  { property: 'onCancel', description: 'Called when Cancel is clicked.', type: '() => void' },
  {
    property: 'onOpenChange',
    description: 'Called whenever the popup requests an open-state change.',
    type: '(open: boolean) => void',
  },
  { property: 'zIndex', description: 'Overrides popup z-index.', type: 'number' },
  {
    property: 'getPopupContainer',
    description: 'Returns the element used to mount the popup portal.',
    type: '(triggerNode?: HTMLElement) => HTMLElement',
  },
  { property: 'children', description: 'Trigger element.', type: 'JSX.Element' },
]

export default function PopconfirmPage() {
  const [open, setOpen] = createSignal(false)

  return (
    <>
      <h1>Popconfirm</h1>
      <p>Popconfirm asks users to confirm a potentially risky action.</p>

      <DemoBlock
        title="Basic"
        code={`<Popconfirm title="Delete?" onConfirm={remove}><Button danger>Delete</Button></Popconfirm>`}
      >
        <Popconfirm
          title="Delete?"
          description="This action cannot be undone."
          onConfirm={() => {
            message.success('Deleted')
          }}
        >
          <Button danger>Delete</Button>
        </Popconfirm>
      </DemoBlock>

      <DemoBlock
        title="Placement"
        code={`<Popconfirm placement="right" title="Confirm?"><Button>Right</Button></Popconfirm>`}
      >
        <Space wrap>
          <Popconfirm placement="top" title="Top placement">
            <Button>Top</Button>
          </Popconfirm>
          <Popconfirm placement="bottom" title="Bottom placement">
            <Button>Bottom</Button>
          </Popconfirm>
          <Popconfirm placement="left" title="Left placement">
            <Button>Left</Button>
          </Popconfirm>
          <Popconfirm placement="right" title="Right placement">
            <Button>Right</Button>
          </Popconfirm>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Custom text"
        code={`<Popconfirm okText="Yes" cancelText="No" title="Publish?" />`}
      >
        <Popconfirm
          title="Publish changes?"
          description="Visitors will see the new version."
          okText="Publish"
          cancelText="Keep draft"
          onConfirm={() => {
            message.success('Published')
          }}
        >
          <Button type="primary">Publish</Button>
        </Popconfirm>
      </DemoBlock>

      <DemoBlock
        title="Controlled"
        code={`<Popconfirm open={open()} onOpenChange={setOpen} title="Controlled?" />`}
      >
        <Space>
          <Popconfirm
            open={open()}
            onOpenChange={setOpen}
            title="Controlled popup"
            onConfirm={() => {
              setOpen(false)
            }}
            onCancel={() => setOpen(false)}
          >
            <Button>Controlled</Button>
          </Popconfirm>
          <Button onClick={() => setOpen(true)}>Open from outside</Button>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Async confirm"
        code={`<Popconfirm onConfirm={() => saveAsync()} title="Save?" />`}
      >
        <Popconfirm
          title="Save changes?"
          description="The popup closes after the promise resolves."
          onConfirm={() =>
            new Promise<void>((resolve) => {
              window.setTimeout(() => {
                message.success('Saved')
                resolve()
              }, 600)
            })
          }
        >
          <Button>Async save</Button>
        </Popconfirm>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable rows={popconfirmRows} aria-label="Popconfirm API" />
    </>
  )
}
