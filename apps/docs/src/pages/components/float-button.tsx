import { FloatButton, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const floatButtonRows: ApiTableRow[] = [
  {
    property: 'type',
    description: 'Float button visual type.',
    type: "'default' | 'primary'",
    defaultValue: "'default'",
  },
  {
    property: 'shape',
    description: 'Float button shape.',
    type: "'circle' | 'square'",
    defaultValue: "'circle'",
  },
  {
    property: 'icon',
    description: 'Icon content rendered inside the button.',
    type: 'JSX.Element',
  },
  {
    property: 'description',
    description: 'Description content rendered below or beside the icon.',
    type: 'JSX.Element',
  },
  {
    property: 'tooltip',
    description: 'Native title text for the floating action.',
    type: 'string',
  },
  {
    property: 'href',
    description: 'Renders the float button as a link when provided.',
    type: 'string',
  },
  { property: 'target', description: 'Anchor target when href is provided.', type: 'string' },
]

const floatButtonGroupRows: ApiTableRow[] = [
  {
    property: 'shape',
    description: 'Shared shape applied to buttons in the group.',
    type: "'circle' | 'square'",
  },
  {
    property: 'children',
    description: 'FloatButton items rendered in the group.',
    type: 'JSX.Element',
  },
]

const floatButtonBackTopRows: ApiTableRow[] = [
  {
    property: 'visibilityHeight',
    description: 'Scroll threshold before the back-to-top button appears.',
    type: 'number',
    defaultValue: '400',
  },
  {
    property: 'target',
    description: 'Function returning the scroll container.',
    type: '() => Window | HTMLElement | undefined | null',
    defaultValue: 'window',
  },
  { property: 'duration', description: 'Reserved scroll duration configuration.', type: 'number' },
  { property: 'children', description: 'Custom back-to-top icon content.', type: 'JSX.Element' },
]

export default function FloatButtonPage() {
  return (
    <>
      <h1>FloatButton</h1>
      <p>FloatButton renders floating quick actions and a back-to-top affordance.</p>

      <DemoBlock title="Basic" code={`<FloatButton icon="?" description="Help" />`}>
        <Space>
          <FloatButton icon="?" description="Help" />
          <span>The button is fixed at the lower right of the viewport.</span>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Link"
        code={`<FloatButton href="https://example.com" target="_blank" icon="↗" description="Open" />`}
      >
        <FloatButton href="https://example.com" target="_blank" icon="↗" description="Open" />
      </DemoBlock>

      <DemoBlock
        title="Group"
        code={`<FloatButton.Group><FloatButton /><FloatButton /></FloatButton.Group>`}
      >
        <FloatButton.Group shape="square">
          <FloatButton type="primary" icon="+" description="New" />
          <FloatButton icon="?" description="Help" />
        </FloatButton.Group>
      </DemoBlock>

      <DemoBlock title="BackTop" code={`<FloatButton.BackTop visibilityHeight={200} />`}>
        <p>Scroll down and the back-to-top button appears after the configured threshold.</p>
        <FloatButton.BackTop visibilityHeight={200} />
      </DemoBlock>

      <h2>API</h2>
      <h3>FloatButton</h3>
      <ApiTable rows={floatButtonRows} aria-label="FloatButton API" />
      <h3>FloatButton.Group</h3>
      <ApiTable rows={floatButtonGroupRows} aria-label="FloatButton Group API" />
      <h3>FloatButton.BackTop</h3>
      <ApiTable rows={floatButtonBackTopRows} aria-label="FloatButton BackTop API" />
    </>
  )
}
