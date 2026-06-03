import { Timeline } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

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
    </>
  )
}
