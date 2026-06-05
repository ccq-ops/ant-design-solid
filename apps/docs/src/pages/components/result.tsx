import { Button, Result, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const resultRows: ApiTableRow[] = [
  {
    property: 'status',
    description: 'Preset result status and built-in icon style.',
    type: "'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500'",
    defaultValue: "'info'",
  },
  { property: 'title', description: 'Main result title.', type: 'JSX.Element' },
  { property: 'subTitle', description: 'Secondary result description.', type: 'JSX.Element' },
  { property: 'icon', description: 'Custom icon content.', type: 'JSX.Element' },
  {
    property: 'extra',
    description: 'Action area rendered below the subtitle.',
    type: 'JSX.Element',
  },
  {
    property: 'children',
    description: 'Additional content rendered in the result body.',
    type: 'JSX.Element',
  },
  { property: 'prefixCls', description: 'Custom CSS class prefix.', type: 'string' },
]

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

      <h2>API</h2>
      <ApiTable rows={resultRows} aria-label="Result API" />
    </>
  )
}
