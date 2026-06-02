import { Tag, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

export default function TagPage() {
  return (
    <>
      <h1>Tag</h1>
      <DemoBlock title="Basic" code={`<Tag>Default</Tag>`}>
        <Space wrap>
          <Tag>Default</Tag>
          <Tag color="success">Success</Tag>
          <Tag color="warning">Warning</Tag>
          <Tag color="error">Error</Tag>
          <Tag color="#722ed1">Custom</Tag>
        </Space>
      </DemoBlock>
      <DemoBlock
        title="Closable"
        code={`<Tag closable onClose={() => console.log('closed')}>Closable</Tag>`}
      >
        <Tag closable onClose={() => console.log('closed')}>
          Closable
        </Tag>
      </DemoBlock>
      <DemoBlock title="Borderless" code={`<Tag bordered={false}>Borderless</Tag>`}>
        <Tag bordered={false}>Borderless</Tag>
      </DemoBlock>
    </>
  )
}
