import { Progress, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const progressRows: ApiTableRow[] = [
  { property: 'type', description: 'Progress display type.', type: "'line' | 'circle'", defaultValue: "'line'" },
  { property: 'percent', description: 'Completion percentage.', type: 'number', defaultValue: '0' },
  { property: 'status', description: 'Progress semantic status.', type: "'normal' | 'success' | 'exception' | 'active'", defaultValue: "'normal'" },
  { property: 'showInfo', description: 'Shows percentage or custom formatted text.', type: 'boolean', defaultValue: 'true' },
  { property: 'strokeWidth', description: 'Progress stroke width.', type: 'number' },
  { property: 'strokeColor', description: 'Progress stroke color.', type: 'string' },
  { property: 'trailColor', description: 'Remaining track color.', type: 'string' },
  { property: 'format', description: 'Custom info formatter.', type: '(percent: number) => JSX.Element' },
]

export default function ProgressPage() {
  return (
    <>
      <h1>Progress</h1>
      <p>Progress displays the current completion percentage of an operation.</p>

      <DemoBlock title="Basic line" code={`<Progress percent={30} />`}>
        <Progress percent={30} />
      </DemoBlock>

      <DemoBlock title="Circle" code={`<Progress type="circle" percent={75} />`}>
        <Progress type="circle" percent={75} />
      </DemoBlock>

      <DemoBlock
        title="Status"
        code={`<Space direction="vertical"><Progress percent={100} /><Progress percent={70} status="exception" /><Progress percent={50} status="active" /></Space>`}
      >
        <Space direction="vertical" class="w-full">
          <Progress percent={100} />
          <Progress percent={70} status="exception" />
          <Progress percent={50} status="active" />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Custom format"
        code={`<Progress percent={80} format={(percent) => \`\${percent} done\`} />`}
      >
        <Progress percent={80} format={(percent) => `${percent} done`} />
      </DemoBlock>

      <DemoBlock
        title="Stroke color"
        code={`<Progress percent={60} strokeColor="#722ed1" trailColor="#f9f0ff" />`}
      >
        <Progress percent={60} strokeColor="#722ed1" trailColor="#f9f0ff" />
      </DemoBlock>

      <DemoBlock title="Hidden info" code={`<Progress percent={45} showInfo={false} />`}>
        <Progress percent={45} showInfo={false} />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable rows={progressRows} aria-label="Progress API" />
    </>
  )
}
