import { FloatButton, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

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
    </>
  )
}
