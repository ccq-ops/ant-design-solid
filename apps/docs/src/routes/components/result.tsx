import { Button, Result, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

export default function ResultPage() {
  return (
    <>
      <h1>Result</h1>
      <p>Show operation results and follow-up actions.</p>

      <DemoBlock
        title="Success"
        code={`<Result status="success" title="Successfully submitted" subTitle="Your request has been saved." />`}
      >
        <Result
          status="success"
          title="Successfully submitted"
          subTitle="Your request has been saved."
        />
      </DemoBlock>

      <DemoBlock
        title="Error"
        code={`<Result status="error" title="Submission failed" subTitle="Please check and try again." />`}
      >
        <Result status="error" title="Submission failed" subTitle="Please check and try again." />
      </DemoBlock>

      <DemoBlock title="404" code={`<Result status="404" title="404" subTitle="Page not found" />`}>
        <Result status="404" title="404" subTitle="Page not found" />
      </DemoBlock>

      <DemoBlock
        title="Extra actions"
        code={`<Result status="info" title="Ready" extra={<Button type="primary">Continue</Button>} />`}
      >
        <Result
          status="info"
          title="Ready"
          extra={
            <Space>
              <Button type="primary">Continue</Button>
              <Button>Back</Button>
            </Space>
          }
        />
      </DemoBlock>

      <DemoBlock title="Custom icon" code={`<Result icon="🚀" title="Launched" />`}>
        <Result icon="🚀" title="Launched" />
      </DemoBlock>
    </>
  )
}
