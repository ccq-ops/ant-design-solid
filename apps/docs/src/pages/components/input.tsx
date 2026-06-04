import { Input, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

export default function InputPage() {
  return (
    <>
      <h1>Input</h1>
      <DemoBlock title="Basic" code={`<Input placeholder="请输入" allowClear />`}>
        <Space direction="vertical" class="w-80">
          <Input placeholder="请输入" allowClear />
          <Input status="error" prefix="￥" suffix="RMB" defaultValue="100" allowClear />
        </Space>
      </DemoBlock>
      <DemoBlock
        title="TextArea"
        code={`<Input.TextArea rows={4} showCount maxLength={100} defaultValue="Solid form components" />`}
      >
        <Input.TextArea rows={4} showCount maxLength={100} defaultValue="Solid form components" />
      </DemoBlock>
    </>
  )
}
