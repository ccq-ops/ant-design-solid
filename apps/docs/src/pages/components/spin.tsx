import { Button, Space, Spin } from '@ant-design-solid/core'
import { createEffect, createSignal, onCleanup } from 'solid-js'
import { DemoBlock } from '../../components/demo-block'

export default function SpinPage() {
  const [fullscreen, setFullscreen] = createSignal(false)

  createEffect(() => {
    if (!fullscreen()) {
      return
    }

    const timer = window.setTimeout(() => setFullscreen(false), 1200)
    onCleanup(() => window.clearTimeout(timer))
  })

  return (
    <>
      <h1>Spin</h1>
      <p>Spin displays a loading indicator for pages, sections, or inline content.</p>

      <DemoBlock title="Basic" code={`<Spin />`}>
        <Spin />
      </DemoBlock>

      <DemoBlock
        title="Size"
        code={`<Space><Spin size="small" /><Spin /><Spin size="large" /></Space>`}
      >
        <Space align="center">
          <Spin size="small" />
          <Spin />
          <Spin size="large" />
        </Space>
      </DemoBlock>

      <DemoBlock title="Tip" code={`<Spin tip="Loading data" />`}>
        <Spin tip="Loading data" />
      </DemoBlock>

      <DemoBlock
        title="Nested"
        code={`<Spin spinning tip="Loading content"><div class="demo-card">Content</div></Spin>`}
      >
        <Spin spinning tip="Loading content">
          <div
            style={{
              padding: '24px',
              border: '1px solid #f0f0f0',
              'border-radius': '8px',
              background: '#fff',
            }}
          >
            Content remains mounted while the spinner overlays it.
          </div>
        </Spin>
      </DemoBlock>

      <DemoBlock
        title="Delay"
        code={`<Spin spinning delay={500}><div>Shows after delay</div></Spin>`}
      >
        <Spin spinning delay={500} tip="Loading after delay">
          <div
            style={{
              padding: '24px',
              border: '1px solid #f0f0f0',
              'border-radius': '8px',
              background: '#fff',
            }}
          >
            The indicator appears only if loading lasts at least 500ms.
          </div>
        </Spin>
      </DemoBlock>

      <DemoBlock title="Fullscreen" code={`<Spin fullscreen />`}>
        <Button onClick={() => setFullscreen(true)}>Show fullscreen spinner</Button>
        <Spin fullscreen spinning={fullscreen()} tip="Loading fullscreen" />
      </DemoBlock>

      <DemoBlock title="Custom indicator" code={`<Spin indicator={<span>Loading custom</span>} />`}>
        <Spin indicator={<span style={{ color: '#1677ff' }}>Loading custom</span>} />
      </DemoBlock>
    </>
  )
}
