import { Watermark } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

export default function WatermarkPage() {
  return (
    <>
      <h1>Watermark</h1>
      <DemoBlock title="Basic" code={`<Watermark content="Ant Design Solid">...</Watermark>`}>
        <Watermark content="Ant Design Solid">
          <div class="h-[180px] bg-white p-6">
            A lightweight watermark overlay for protected content.
          </div>
        </Watermark>
      </DemoBlock>
      <DemoBlock
        title="Multiple lines"
        code={`<Watermark content={['Ant Design Solid', 'Confidential']}>...</Watermark>`}
      >
        <Watermark content={['Ant Design Solid', 'Confidential']}>
          <div class="h-[180px] bg-white p-6">
            Multiple text lines are rendered into the repeated watermark tile.
          </div>
        </Watermark>
      </DemoBlock>
      <DemoBlock
        title="Custom style"
        code={`<Watermark content="Draft" rotate={-12} gap={[64, 64]} font={{ color: 'rgba(22, 119, 255, 0.18)', fontSize: 20 }}>...</Watermark>`}
      >
        <Watermark
          content="Draft"
          rotate={-12}
          gap={[64, 64]}
          font={{ color: 'rgba(22, 119, 255, 0.18)', fontSize: 20 }}
        >
          <div class="h-[180px] bg-white p-6">Customize rotation, gap and text style.</div>
        </Watermark>
      </DemoBlock>
    </>
  )
}
