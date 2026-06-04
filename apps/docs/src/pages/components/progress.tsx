import { Progress, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

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
    </>
  )
}
