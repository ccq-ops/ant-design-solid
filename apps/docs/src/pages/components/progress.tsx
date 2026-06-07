import { Progress, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const progressRows: ApiTableRow[] = [
  {
    property: 'type',
    description: 'Progress display type.',
    type: "'line' | 'circle' | 'dashboard'",
    defaultValue: "'line'",
  },
  {
    property: 'percent',
    description: 'Completion percentage. Values are clamped to the 0-100 range.',
    type: 'number',
    defaultValue: '0',
  },
  {
    property: 'status',
    description: 'Progress semantic status. The active status is intended for line progress.',
    type: "'normal' | 'success' | 'exception' | 'active'",
    defaultValue: "'success' when percent is 100, otherwise 'normal'",
  },
  {
    property: 'showInfo',
    description: 'Shows the progress value, custom formatted content, or status icon.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'format',
    description: 'Custom info formatter. Receives the main percent and optional success percent.',
    type: '(percent: number, successPercent?: number) => JSX.Element',
    defaultValue: '(percent) => `${percent}%`',
  },
  {
    property: 'strokeWidth',
    description:
      'Progress stroke width. Line values are pixels; circle/dashboard values are SVG stroke width.',
    type: 'number',
    defaultValue: '8 for line, 6 for circle/dashboard',
  },
  {
    property: 'strokeColor',
    description:
      'Progress stroke color. Line progress supports CSS gradients; step progress supports color arrays.',
    type: 'string | string[] | ProgressGradient',
    defaultValue: 'theme primary color',
  },
  {
    property: 'railColor',
    description: 'Color of the unfilled rail. Takes precedence over trailColor.',
    type: 'string',
    defaultValue: 'theme secondary border color',
  },
  {
    property: 'trailColor',
    description: 'Deprecated alias for railColor. Prefer railColor in new code.',
    type: 'string',
    defaultValue: '-',
  },
  {
    property: 'success',
    description: 'Configuration for the successful progress segment.',
    type: '{ percent?: number; strokeColor?: string }',
    defaultValue: '-',
  },
  {
    property: 'strokeLinecap',
    description: 'Progress stroke line cap style.',
    type: "'round' | 'butt' | 'square'",
    defaultValue: "'round'",
  },
  {
    property: 'size',
    description:
      'Progress size. Line arrays map to [width, height]; circle/dashboard use numeric width.',
    type: "number | [number | string, number] | 'small' | 'medium' | 'default' | { width?: number; height?: number }",
    defaultValue: "'medium'",
  },
  {
    property: 'steps',
    description:
      'Renders progress in separated steps. Object form can configure circular step gap.',
    type: 'number | { count: number; gap: number }',
    defaultValue: '-',
  },
  {
    property: 'percentPosition',
    description: 'Line progress value position. Inner text is rendered inside the rail.',
    type: "{ align?: 'start' | 'center' | 'end'; type?: 'inner' | 'outer' }",
    defaultValue: "{ align: 'end', type: 'outer' }",
  },
  {
    property: 'gapDegree',
    description: 'Dashboard gap degree. Values are clamped to the 0-295 range.',
    type: 'number',
    defaultValue: '75',
  },
  {
    property: 'gapPlacement',
    description: 'Dashboard gap placement.',
    type: "'top' | 'bottom' | 'start' | 'end'",
    defaultValue: "'bottom'",
  },
  {
    property: 'gapPosition',
    description: 'Deprecated dashboard gap placement alias. Prefer gapPlacement.',
    type: "'top' | 'bottom' | 'left' | 'right'",
    defaultValue: '-',
  },
  {
    property: 'width',
    description: 'Deprecated circle/dashboard size alias. Prefer size.',
    type: 'number',
    defaultValue: '-',
  },
]

const gradientTypeRows: ApiTableRow[] = [
  {
    property: 'ProgressGradient',
    description:
      'Line gradient object with optional direction or circle/dashboard percentage color stops.',
    type: '{ from: string; to: string; direction?: string } | { [percent: string]: string; direction?: string }',
  },
  {
    property: 'ProgressSuccessProps',
    description: 'Successful segment configuration shared by all progress types.',
    type: '{ percent?: number; strokeColor?: string }',
  },
]

export default function ProgressPage() {
  return (
    <>
      <h1>Progress</h1>
      <p>Progress displays the current completion percentage of an operation.</p>

      <DemoBlock
        title="Basic line"
        code={`<Space direction="vertical" class="w-full">
  <Progress percent={30} />
  <Progress percent={50} showInfo={false} />
  <Progress percent={100} />
</Space>`}
      >
        <Space direction="vertical" class="w-full">
          <Progress percent={30} />
          <Progress percent={50} showInfo={false} />
          <Progress percent={100} />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Circle and dashboard"
        code={`<Space align="center" wrap>
  <Progress type="circle" percent={75} />
  <Progress type="dashboard" percent={75} />
  <Progress type="dashboard" percent={60} gapDegree={120} gapPlacement="top" />
</Space>`}
      >
        <Space align="center" wrap>
          <Progress type="circle" percent={75} />
          <Progress type="dashboard" percent={75} />
          <Progress type="dashboard" percent={60} gapDegree={120} gapPlacement="top" />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Status"
        code={`<Space direction="vertical" class="w-full">
  <Progress percent={100} />
  <Progress percent={70} status="exception" />
  <Progress percent={50} status="active" />
  <Progress type="circle" percent={70} status="exception" />
</Space>`}
      >
        <Space direction="vertical" class="w-full">
          <Progress percent={100} />
          <Progress percent={70} status="exception" />
          <Progress percent={50} status="active" />
          <Progress type="circle" percent={70} status="exception" />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Custom text format"
        code={[
          '<Space direction="vertical" class="w-full">',
          '  <Progress percent={80} format={(percent) => `${percent} done`} />',
          '  <Progress percent={80} success={{ percent: 30 }} format={(percent, successPercent) => `${percent}% / ${successPercent}%`} />',
          '</Space>',
        ].join('\n')}
      >
        <Space direction="vertical" class="w-full">
          <Progress percent={80} format={(percent) => `${percent} done`} />
          <Progress
            percent={80}
            success={{ percent: 30 }}
            format={(percent, successPercent) => `${percent}% / ${successPercent}%`}
          />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Success segment"
        code={`<Space direction="vertical" class="w-full">
  <Progress percent={80} success={{ percent: 30 }} />
  <Progress type="circle" percent={80} success={{ percent: 30, strokeColor: '#52c41a' }} />
  <Progress type="dashboard" percent={80} success={{ percent: 30, strokeColor: '#52c41a' }} />
</Space>`}
      >
        <Space direction="vertical" class="w-full">
          <Progress percent={80} success={{ percent: 30 }} />
          <Progress type="circle" percent={80} success={{ percent: 30, strokeColor: '#52c41a' }} />
          <Progress
            type="dashboard"
            percent={80}
            success={{ percent: 30, strokeColor: '#52c41a' }}
          />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Steps"
        code={`<Space direction="vertical" class="w-full">
  <Progress percent={60} steps={5} />
  <Progress percent={60} steps={5} strokeColor={['#1677ff', '#52c41a', '#faad14']} />
  <Progress type="circle" percent={60} steps={{ count: 8, gap: 4 }} />
</Space>`}
      >
        <Space direction="vertical" class="w-full">
          <Progress percent={60} steps={5} />
          <Progress percent={60} steps={5} strokeColor={['#1677ff', '#52c41a', '#faad14']} />
          <Progress type="circle" percent={60} steps={{ count: 8, gap: 4 }} />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Progress value position"
        code={`<Space direction="vertical" class="w-full">
  <Progress percent={40} percentPosition={{ align: 'start', type: 'outer' }} />
  <Progress percent={50} percentPosition={{ align: 'center', type: 'inner' }} />
  <Progress percent={60} percentPosition={{ align: 'end', type: 'inner' }} />
</Space>`}
      >
        <Space direction="vertical" class="w-full">
          <Progress percent={40} percentPosition={{ align: 'start', type: 'outer' }} />
          <Progress percent={50} percentPosition={{ align: 'center', type: 'inner' }} />
          <Progress percent={60} percentPosition={{ align: 'end', type: 'inner' }} />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Stroke color and rail color"
        code={`<Space direction="vertical" class="w-full">
  <Progress percent={60} strokeColor="#722ed1" railColor="#f9f0ff" />
  <Progress percent={70} strokeColor={{ from: '#108ee9', to: '#87d068', direction: 'to right' }} />
  <Progress type="circle" percent={75} strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} railColor="#f0f0f0" />
</Space>`}
      >
        <Space direction="vertical" class="w-full">
          <Progress percent={60} strokeColor="#722ed1" railColor="#f9f0ff" />
          <Progress
            percent={70}
            strokeColor={{ from: '#108ee9', to: '#87d068', direction: 'to right' }}
          />
          <Progress
            type="circle"
            percent={75}
            strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
            railColor="#f0f0f0"
          />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Stroke linecap"
        code={`<Space direction="vertical" class="w-full">
  <Progress percent={70} strokeLinecap="round" />
  <Progress percent={70} strokeLinecap="butt" />
  <Progress percent={70} strokeLinecap="square" />
</Space>`}
      >
        <Space direction="vertical" class="w-full">
          <Progress percent={70} strokeLinecap="round" />
          <Progress percent={70} strokeLinecap="butt" />
          <Progress percent={70} strokeLinecap="square" />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Size"
        code={`<Space direction="vertical" class="w-full">
  <Progress percent={30} size="small" />
  <Progress percent={50} size={[240, 12]} />
  <Progress type="circle" percent={70} size={80} />
  <Progress type="dashboard" percent={70} size={{ width: 96 }} />
</Space>`}
      >
        <Space direction="vertical" class="w-full">
          <Progress percent={30} size="small" />
          <Progress percent={50} size={[240, 12]} />
          <Progress type="circle" percent={70} size={80} />
          <Progress type="dashboard" percent={70} size={{ width: 96 }} />
        </Space>
      </DemoBlock>

      <DemoBlock title="Hidden info" code={`<Progress percent={45} showInfo={false} />`}>
        <Progress percent={45} showInfo={false} />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable rows={progressRows} aria-label="Progress API" />

      <h3>Related types</h3>
      <ApiTable rows={gradientTypeRows} aria-label="Progress related types" />
    </>
  )
}
