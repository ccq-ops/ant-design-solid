import { Timeline } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const timelineRows: ApiTableRow[] = [
  { property: 'items', description: 'Timeline item data.', type: 'TimelineItem[]' },
  {
    property: 'mode',
    description: 'Timeline item placement mode.',
    type: "'left' | 'right' | 'alternate'",
    defaultValue: "'left'",
  },
  {
    property: 'pending',
    description: 'Adds a pending item at the end. Boolean true renders Loading text.',
    type: 'JSX.Element | boolean',
    defaultValue: 'false',
  },
  { property: 'pendingDot', description: 'Custom dot for the pending item.', type: 'JSX.Element' },
  {
    property: 'reverse',
    description: 'Reverses the item order before rendering pending.',
    type: 'boolean',
    defaultValue: 'false',
  },
  { property: 'prefixCls', description: 'Custom CSS class prefix.', type: 'string' },
]

const timelineItemRows: ApiTableRow[] = [
  {
    property: 'label',
    description: 'Label content rendered beside the timeline item.',
    type: 'JSX.Element',
  },
  { property: 'children', description: 'Main timeline item content.', type: 'JSX.Element' },
  {
    property: 'color',
    description: 'Preset semantic color or custom CSS color for the dot.',
    type: "'blue' | 'red' | 'green' | 'gray' | string",
    defaultValue: "'blue'",
  },
  { property: 'dot', description: 'Custom dot content.', type: 'JSX.Element' },
  {
    property: 'position',
    description: 'Overrides item position for this item.',
    type: "'left' | 'right'",
  },
]

const items = [
  { label: '2026-06-01', children: 'Create project', color: 'green' },
  { label: '2026-06-02', children: 'Add core components' },
  { label: '2026-06-03', children: 'Polish documentation', color: 'red' },
]

export default function TimelinePage() {
  return (
    <>
      <h1>Timeline</h1>
      <p>Display chronological events with labels, pending state, and custom dots.</p>

      <DemoBlock title="Basic" code={`<Timeline items={items} />`}>
        <Timeline items={items} />
      </DemoBlock>

      <DemoBlock title="Alternate" code={`<Timeline mode="alternate" items={items} />`}>
        <Timeline mode="alternate" items={items} />
      </DemoBlock>

      <DemoBlock title="Pending" code={`<Timeline pending="Waiting for review" items={items} />`}>
        <Timeline pending="Waiting for review" items={items} />
      </DemoBlock>

      <DemoBlock
        title="Custom dot and color"
        code={`<Timeline items={[{ children: 'Custom', dot: '★' }, { children: 'Purple', color: '#722ed1' }]} />`}
      >
        <Timeline
          items={[
            { children: 'Custom', dot: '★' },
            { children: 'Purple', color: '#722ed1' },
          ]}
        />
      </DemoBlock>

      <DemoBlock title="Reverse" code={`<Timeline reverse items={items} />`}>
        <Timeline reverse items={items} />
      </DemoBlock>

      <h2>API</h2>
      <h3>Timeline</h3>
      <ApiTable rows={timelineRows} aria-label="Timeline API" />
      <h3>TimelineItem</h3>
      <ApiTable rows={timelineItemRows} aria-label="Timeline Item API" />
    </>
  )
}
