import { createSignal } from 'solid-js'
import { Space, Steps } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

export default function StepsPage() {
  const [current, setCurrent] = createSignal(0)

  return (
    <>
      <h1>Steps</h1>
      <DemoBlock
        title="Basic"
        code={`<Steps current={1} items={[{ title: 'Finished' }, { title: 'In Progress' }, { title: 'Waiting' }]} />`}
      >
        <Steps
          current={1}
          items={[{ title: 'Finished' }, { title: 'In Progress' }, { title: 'Waiting' }]}
        />
      </DemoBlock>
      <DemoBlock
        title="Small"
        code={`<Steps size="small" current={1} items={[{ title: 'Login' }, { title: 'Verification' }, { title: 'Pay' }, { title: 'Done' }]} />`}
      >
        <Steps
          size="small"
          current={1}
          items={[
            { title: 'Login' },
            { title: 'Verification' },
            { title: 'Pay' },
            { title: 'Done' },
          ]}
        />
      </DemoBlock>
      <DemoBlock
        title="Vertical"
        code={`<Steps direction="vertical" current={1} items={[{ title: 'Create project', description: 'Configure the basics.' }, { title: 'Invite teammates', description: 'Add collaborators.' }, { title: 'Launch', description: 'Publish when ready.' }]} />`}
      >
        <Steps
          direction="vertical"
          current={1}
          items={[
            { title: 'Create project', description: 'Configure the basics.' },
            { title: 'Invite teammates', description: 'Add collaborators.' },
            { title: 'Launch', description: 'Publish when ready.' },
          ]}
        />
      </DemoBlock>
      <DemoBlock
        title="Error status"
        code={`<Steps current={1} status="error" items={[{ title: 'Finished' }, { title: 'Failed' }, { title: 'Waiting' }]} />`}
      >
        <Steps
          current={1}
          status="error"
          items={[{ title: 'Finished' }, { title: 'Failed' }, { title: 'Waiting' }]}
        />
      </DemoBlock>
      <DemoBlock
        title="Navigation"
        code={`const [current, setCurrent] = createSignal(0)\n<Steps type="navigation" current={current()} onChange={setCurrent} items={[{ title: 'Start' }, { title: 'Review' }, { title: 'Disabled', disabled: true }, { title: 'Done' }]} />`}
      >
        <Space direction="vertical">
          <Steps
            type="navigation"
            current={current()}
            onChange={setCurrent}
            items={[
              { title: 'Start' },
              { title: 'Review' },
              { title: 'Disabled', disabled: true },
              { title: 'Done' },
            ]}
          />
          <span>Current step: {current() + 1}</span>
        </Space>
      </DemoBlock>
      <DemoBlock
        title="Custom icon"
        code={`<Steps current={1} items={[{ title: 'Upload', icon: '↑' }, { title: 'Process', icon: '⚙' }, { title: 'Complete', icon: '✓' }]} />`}
      >
        <Steps
          current={1}
          items={[
            { title: 'Upload', icon: '↑' },
            { title: 'Process', icon: '⚙' },
            { title: 'Complete', icon: '✓' },
          ]}
        />
      </DemoBlock>
    </>
  )
}
