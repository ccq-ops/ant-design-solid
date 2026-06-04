import { Card, Space, Statistic } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

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
    </>
  )
}
