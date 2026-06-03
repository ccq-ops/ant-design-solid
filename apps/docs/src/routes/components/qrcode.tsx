import { QRCode, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

export default function QRCodePage() {
  return (
    <>
      <h1>QRCode</h1>
      <DemoBlock title="Basic" code={`<QRCode value="https://solidjs.com" />`}>
        <QRCode value="https://solidjs.com" />
      </DemoBlock>
      <DemoBlock
        title="Custom colors"
        code={`<QRCode value="ant-design-solid" color="#1677ff" bgColor="#f0f5ff" />`}
      >
        <QRCode value="ant-design-solid" color="#1677ff" bgColor="#f0f5ff" />
      </DemoBlock>
      <DemoBlock title="Icon" code={`<QRCode value="solid" icon="/vite.svg" />`}>
        <QRCode value="solid" icon="/vite.svg" />
      </DemoBlock>
      <DemoBlock title="Status" code={`<QRCode value="solid" status="expired" />`}>
        <Space>
          <QRCode value="loading" status="loading" size={128} />
          <QRCode value="expired" status="expired" size={128} />
        </Space>
      </DemoBlock>
      <DemoBlock title="Borderless" code={`<QRCode value="borderless" bordered={false} />`}>
        <QRCode value="borderless" bordered={false} />
      </DemoBlock>
    </>
  )
}
