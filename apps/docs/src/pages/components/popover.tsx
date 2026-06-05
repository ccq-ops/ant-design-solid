import { createSignal } from 'solid-js'
import { Button, Popover, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const popoverRows: ApiTableRow[] = [
  { property: 'title', description: 'Popover title content.', type: 'JSX.Element' },
  { property: 'content', description: 'Popover body content.', type: 'JSX.Element' },
  {
    property: 'placement',
    description: 'Overlay placement relative to the trigger.',
    type: 'PopoverPlacement',
  },
  {
    property: 'trigger',
    description: 'Interaction that opens the overlay.',
    type: "'hover' | 'click' | 'focus'",
    defaultValue: "'hover'",
  },
  { property: 'open', description: 'Controlled overlay open state.', type: 'boolean' },
  {
    property: 'defaultOpen',
    description: 'Initial overlay open state for uncontrolled usage.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'onOpenChange',
    description: 'Called when overlay open state changes.',
    type: '(open: boolean) => void',
  },
  { property: 'mouseEnterDelay', description: 'Delay before opening on hover.', type: 'number' },
  {
    property: 'mouseLeaveDelay',
    description: 'Delay before closing after hover leaves.',
    type: 'number',
  },
  { property: 'overlayClass', description: 'Additional class for the overlay.', type: 'string' },
  {
    property: 'overlayStyle',
    description: 'Inline style for the overlay.',
    type: 'JSX.CSSProperties',
  },
  { property: 'zIndex', description: 'Overrides overlay z-index.', type: 'number' },
  {
    property: 'getPopupContainer',
    description: 'Returns the element used to mount the overlay portal.',
    type: '(triggerNode?: HTMLElement) => HTMLElement',
  },
]

export default function PopoverPage() {
  const [open, setOpen] = createSignal(false)

  return (
    <>
      <h1>Popover</h1>
      <p>Popover displays rich floating content around a trigger element.</p>

      <DemoBlock
        title="Basic"
        code={`<Popover title="Title" content="Helpful content"><Button>Hover me</Button></Popover>`}
      >
        <Popover title="Title" content="Helpful content">
          <Button>Hover me</Button>
        </Popover>
      </DemoBlock>

      <DemoBlock
        title="Trigger"
        code={`<Popover trigger="click" content="Clicked content"><Button>Click</Button></Popover>`}
      >
        <Space wrap>
          <Popover trigger="click" title="Click" content="Clicked content">
            <Button>Click</Button>
          </Popover>
          <Popover trigger="focus" title="Focus" content="Focused content">
            <Button>Focus</Button>
          </Popover>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Placement"
        code={`<Popover placement="right" title="Right" content="Placement demo"><Button>Right</Button></Popover>`}
      >
        <Space wrap>
          <Popover placement="top" content="Top content">
            <Button>Top</Button>
          </Popover>
          <Popover placement="bottom" content="Bottom content">
            <Button>Bottom</Button>
          </Popover>
          <Popover placement="left" content="Left content">
            <Button>Left</Button>
          </Popover>
          <Popover placement="right" content="Right content">
            <Button>Right</Button>
          </Popover>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Controlled"
        code={`<Popover open={open()} onOpenChange={setOpen} content="Controlled content"><Button>Controlled</Button></Popover>`}
      >
        <Space>
          <Popover open={open()} onOpenChange={setOpen} content="Controlled content">
            <Button>Controlled</Button>
          </Popover>
          <Button onClick={() => setOpen((next) => !next)}>{open() ? 'Close' : 'Open'}</Button>
        </Space>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable rows={popoverRows} aria-label="Popover API" />
    </>
  )
}
