import { Button, Space, Tour } from '@ant-design-solid/core'
import { createSignal } from 'solid-js'
import { DemoBlock } from '../../site/demo-block'

export default function TourPage() {
  const [basicOpen, setBasicOpen] = createSignal(false)
  const [targetOpen, setTargetOpen] = createSignal(false)
  let targetButton: HTMLButtonElement | undefined

  return (
    <>
      <h1>Tour</h1>
      <p>Tour guides users through features step by step.</p>

      <DemoBlock
        title="Basic"
        code={`<Tour open={open()} steps={[{ title: 'Welcome', description: 'Start here' }]} />`}
      >
        <Button type="primary" onClick={() => setBasicOpen(true)}>
          Start tour
        </Button>
        <Tour
          open={basicOpen()}
          onClose={() => setBasicOpen(false)}
          onFinish={() => setBasicOpen(false)}
          steps={[
            { title: 'Welcome', description: 'This tour is centered on the page.' },
            { title: 'Finish', description: 'Use steps to explain important workflows.' },
          ]}
        />
      </DemoBlock>

      <DemoBlock
        title="Target"
        code={`<Tour open={open()} steps={[{ title: 'Targeted', target: () => target }]} />`}
      >
        <Space>
          <Button
            ref={(element) => {
              targetButton = element
            }}
          >
            Target button
          </Button>
          <Button onClick={() => setTargetOpen(true)}>Show target tour</Button>
        </Space>
        <Tour
          open={targetOpen()}
          placement="bottom"
          onClose={() => setTargetOpen(false)}
          onFinish={() => setTargetOpen(false)}
          steps={[
            {
              title: 'Targeted step',
              description: 'This step points to the target button.',
              target: () => targetButton,
            },
          ]}
        />
      </DemoBlock>
    </>
  )
}
