import { Watermark } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const watermarkRows: ApiTableRow[] = [
  { property: 'width', description: 'Watermark tile width.', type: 'number', defaultValue: '120' },
  { property: 'height', description: 'Watermark tile height.', type: 'number', defaultValue: '64' },
  {
    property: 'rotate',
    description: 'Rotation angle in degrees.',
    type: 'number',
    defaultValue: '-22',
  },
  {
    property: 'zIndex',
    description: 'Watermark overlay z-index.',
    type: 'number',
    defaultValue: '9',
  },
  { property: 'image', description: 'Image URL used instead of text content.', type: 'string' },
  {
    property: 'content',
    description: 'Watermark text content or multiple text lines.',
    type: 'string | string[]',
  },
  {
    property: 'font',
    description: 'Text font configuration.',
    type: '{ color?: string; fontSize?: number; fontWeight?: number | string; fontFamily?: string; fontStyle?: string }',
  },
  {
    property: 'gap',
    description: 'Horizontal and vertical gap between repeated tiles.',
    type: '[number, number]',
    defaultValue: '[100, 100]',
  },
  {
    property: 'offset',
    description: 'Background position offset.',
    type: '[number, number]',
    defaultValue: '[0, 0]',
  },
  { property: 'prefixCls', description: 'Custom CSS class prefix.', type: 'string' },
  { property: 'className', description: 'Additional root class alias.', type: 'string' },
  { property: 'children', description: 'Content covered by the watermark.', type: 'JSX.Element' },
]

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

      <h2>API</h2>
      <ApiTable rows={watermarkRows} aria-label="Watermark API" />
    </>
  )
}
