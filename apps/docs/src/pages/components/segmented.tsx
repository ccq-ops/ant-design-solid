import { Segmented, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

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
    </>
  )
}
