import { createSignal } from 'solid-js'
import { Rate, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

export default function RatePage() {
  const [value, setValue] = createSignal(3)

  return (
    <>
      <h1>Rate</h1>
      <DemoBlock title="Basic" code={`<Rate defaultValue={3} />`}>
        <Rate defaultValue={3} />
      </DemoBlock>
      <DemoBlock title="Half star" code={`<Rate allowHalf defaultValue={2.5} />`}>
        <Rate allowHalf defaultValue={2.5} />
      </DemoBlock>
      <DemoBlock title="Disable clear" code={`<Rate defaultValue={3} allowClear={false} />`}>
        <Rate defaultValue={3} allowClear={false} />
      </DemoBlock>
      <DemoBlock
        title="Controlled"
        code={`const [value, setValue] = createSignal(3)\n<Rate value={value()} onChange={setValue} />`}
      >
        <Space direction="vertical">
          <Rate value={value()} onChange={setValue} />
          <span>Current value: {value()}</span>
        </Space>
      </DemoBlock>
      <DemoBlock title="Custom character" code={`<Rate character="♡" defaultValue={4} />`}>
        <Space direction="vertical">
          <Rate character="♡" defaultValue={4} />
          <Rate character={(index) => index + 1} defaultValue={3} />
        </Space>
      </DemoBlock>
      <DemoBlock title="Disabled" code={`<Rate disabled defaultValue={3} />`}>
        <Rate disabled defaultValue={3} />
      </DemoBlock>
    </>
  )
}
