import { BorderBeam, Card, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

const panelStyle = {
  position: 'relative',
  width: '300px',
  padding: '24px',
  border: '1px solid #d9d9d9',
  'border-radius': '12px',
  background: '#fff',
  'box-shadow': '0 6px 16px rgba(0, 0, 0, 0.08)',
} as const

export default function BorderBeamPage() {
  return (
    <>
      <h1>BorderBeam</h1>
      <p>Add an animated beam around the border of a single HTML element.</p>

      <DemoBlock
        title="Basic"
        code={`<BorderBeam>
  <div style={{ position: 'relative', border: '1px solid #d9d9d9', 'border-radius': '12px' }}>
    Content
  </div>
</BorderBeam>`}
      >
        <BorderBeam>
          <div style={panelStyle}>
            <h3>AI Assistant</h3>
            <p>BorderBeam decorates the host element without adding a visible wrapper.</p>
          </div>
        </BorderBeam>
      </DemoBlock>

      <DemoBlock
        title="Custom color"
        code={`<BorderBeam color="#36cfc9">
  <div>Custom color beam</div>
</BorderBeam>`}
      >
        <BorderBeam color="#36cfc9">
          <div style={panelStyle}>
            <h3>Custom color</h3>
            <p>The beam color can be a single CSS color value.</p>
          </div>
        </BorderBeam>
      </DemoBlock>

      <DemoBlock
        title="Gradient and outset"
        code={`<BorderBeam
  outset={4}
  color={[
    { color: '#1677ff', percent: 0 },
    { color: '#36cfc9', percent: 55 },
    { color: '#95de64', percent: 100 },
  ]}
>
  <div>Gradient beam</div>
</BorderBeam>`}
      >
        <BorderBeam
          outset={4}
          color={[
            { color: '#1677ff', percent: 0 },
            { color: '#36cfc9', percent: 55 },
            { color: '#95de64', percent: 100 },
          ]}
        >
          <div style={panelStyle}>
            <h3>Gradient beam</h3>
            <p>Use gradient stops and an outset to draw the beam outside the element border.</p>
          </div>
        </BorderBeam>
      </DemoBlock>

      <DemoBlock
        title="With Card"
        code={`<BorderBeam>
  <Card title="Insight">Card content</Card>
</BorderBeam>`}
      >
        <Space wrap>
          <BorderBeam color="#722ed1" outset="2px">
            <Card title="Insight" style={{ width: '300px', position: 'relative' }}>
              BorderBeam can decorate existing components when the child resolves to an HTML
              element.
            </Card>
          </BorderBeam>
        </Space>
      </DemoBlock>

      <h2>API</h2>
      <ul>
        <li>
          <code>color</code> accepts a CSS color string or gradient stop array.
        </li>
        <li>
          <code>outset</code> controls how far the beam extends outside the host element.
        </li>
        <li>
          The child must resolve to a single <code>HTMLElement</code>; text and SVG children are
          rendered without the beam.
        </li>
      </ul>
    </>
  )
}
