import { Divider, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

export default function DividerPage() {
  return (
    <>
      <h1>Divider</h1>
      <DemoBlock title="Basic" code={`Text\n<Divider />\nText`}>
        <div>
          Text
          <Divider />
          Text
        </div>
      </DemoBlock>
      <DemoBlock title="With text" code={`<Divider orientation="left">Left</Divider>`}>
        <div>
          <Divider orientation="left">Left</Divider>
          <Divider>Center</Divider>
          <Divider orientation="right">Right</Divider>
        </div>
      </DemoBlock>
      <DemoBlock title="Variants" code={`<Divider dashed />\n<Divider plain>Plain</Divider>`}>
        <div>
          <Divider dashed />
          <Divider plain>Plain Text</Divider>
        </div>
      </DemoBlock>
      <DemoBlock title="Vertical" code={`A <Divider type="vertical" /> B`}>
        <Space>
          <span>A</span>
          <Divider type="vertical" />
          <span>B</span>
          <Divider type="vertical" dashed />
          <span>C</span>
        </Space>
      </DemoBlock>
    </>
  )
}
