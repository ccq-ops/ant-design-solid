import { Card, Space, Statistic } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const statisticRows: ApiTableRow[] = [
  { property: 'title', description: 'Statistic title.', type: 'JSX.Element' },
  {
    property: 'value',
    description: 'Value content. Numeric values can be formatted with precision.',
    type: 'string | number | null',
  },
  { property: 'precision', description: 'Decimal precision for numeric values.', type: 'number' },
  { property: 'prefix', description: 'Content rendered before the value.', type: 'JSX.Element' },
  { property: 'suffix', description: 'Content rendered after the value.', type: 'JSX.Element' },
  {
    property: 'loading',
    description: 'Shows a loading placeholder instead of the value.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'valueStyle',
    description: 'Inline style applied to the value element.',
    type: 'JSX.CSSProperties | string',
  },
]

export default function StatisticPage() {
  return (
    <>
      <h1>Statistic</h1>
      <p>Statistic displays a formatted numerical value with optional title and adornments.</p>

      <DemoBlock title="Basic" code={`<Statistic title="Active Users" value={112893} />`}>
        <Statistic title="Active Users" value={112893} />
      </DemoBlock>

      <DemoBlock
        title="Prefix, suffix and precision"
        code={`<Statistic title="Account Balance" value={1128.693} precision={2} prefix="$" suffix="USD" />`}
      >
        <Statistic title="Account Balance" value={1128.693} precision={2} prefix="$" suffix="USD" />
      </DemoBlock>

      <DemoBlock title="Loading" code={`<Statistic title="Revenue" value={5680} loading />`}>
        <Statistic title="Revenue" value={5680} loading />
      </DemoBlock>

      <DemoBlock
        title="In card"
        code={`<Card><Statistic title="Feedback" value={93} suffix="%" valueStyle={{ color: '#3f8600' }} /></Card>`}
      >
        <Space wrap align="start">
          <Card class="w-60">
            <Statistic title="Feedback" value={93} suffix="%" valueStyle={{ color: '#3f8600' }} />
          </Card>
          <Card class="w-60">
            <Statistic title="Views" value={8846} prefix="👁" />
          </Card>
        </Space>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable rows={statisticRows} aria-label="Statistic API" />
    </>
  )
}
