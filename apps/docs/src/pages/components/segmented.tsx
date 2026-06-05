import { Segmented, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const segmentedRows: ApiTableRow[] = [
  {
    property: 'options',
    description: 'Options rendered by the segmented control.',
    type: 'SegmentedOption[]',
  },
  { property: 'value', description: 'Controlled selected value.', type: 'string | number' },
  {
    property: 'defaultValue',
    description: 'Initial selected value for uncontrolled usage.',
    type: 'string | number',
  },
  {
    property: 'disabled',
    description: 'Disables the whole control.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'block',
    description: 'Makes the segmented control fill its container width.',
    type: 'boolean',
    defaultValue: 'false',
  },
  { property: 'size', description: 'Control size.', type: "'small' | 'middle' | 'large'" },
  { property: 'prefixCls', description: 'Custom CSS class prefix.', type: 'string' },
  {
    property: 'onChange',
    description: 'Called with the selected value after user interaction.',
    type: '(value: SegmentedValue) => void',
  },
]

const segmentedOptionRows: ApiTableRow[] = [
  {
    property: 'string | number',
    description: 'Primitive option used as both label and value.',
    type: 'SegmentedOption',
  },
  {
    property: 'label',
    description: 'Option label content for object options.',
    type: 'JSX.Element',
  },
  { property: 'value', description: 'Option value.', type: 'string | number' },
  { property: 'disabled', description: 'Disables this option.', type: 'boolean' },
  { property: 'icon', description: 'Icon rendered before the label.', type: 'JSX.Element' },
  { property: 'class', description: 'Additional class for this option.', type: 'string' },
]

export default function SegmentedPage() {
  return (
    <>
      <h1>Segmented</h1>
      <DemoBlock title="Basic" code={`<Segmented options={['Daily', 'Weekly', 'Monthly']} />`}>
        <Segmented options={['Daily', 'Weekly', 'Monthly']} />
      </DemoBlock>
      <DemoBlock
        title="Object options"
        code={`<Segmented options={[{ label: 'List', value: 'list', icon: '☰' }, { label: 'Grid', value: 'grid', icon: '▦' }]} />`}
      >
        <Segmented
          options={[
            { label: 'List', value: 'list', icon: '☰' },
            { label: 'Grid', value: 'grid', icon: '▦' },
            { label: 'Disabled', value: 'disabled', disabled: true },
          ]}
          defaultValue="grid"
        />
      </DemoBlock>
      <DemoBlock title="Sizes" code={`<Segmented size="large" options={['A', 'B']} />`}>
        <Space direction="vertical">
          <Segmented size="small" options={['Small', 'Middle']} />
          <Segmented options={['Middle', 'Large']} />
          <Segmented size="large" options={['Large', 'Huge']} />
        </Space>
      </DemoBlock>
      <DemoBlock
        title="Block and disabled"
        code={`<Segmented block disabled options={['A', 'B']} />`}
      >
        <Segmented block disabled options={['A', 'B', 'C']} />
      </DemoBlock>

      <h2>API</h2>
      <h3>Segmented</h3>
      <ApiTable rows={segmentedRows} aria-label="Segmented API" />
      <h3>SegmentedOption</h3>
      <ApiTable rows={segmentedOptionRows} aria-label="Segmented Option API" />
    </>
  )
}
