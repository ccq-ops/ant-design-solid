import { Card, Skeleton, Space } from '@ant-design-solid/core'
import { createSignal } from 'solid-js'
import { DemoBlock } from '../../site/demo-block'

export default function SkeletonPage() {
  const [loaded, setLoaded] = createSignal(false)

  return (
    <>
      <h1>Skeleton</h1>
      <p>Skeleton displays placeholder blocks while content is loading.</p>

      <DemoBlock title="Basic" code={`<Skeleton />`}>
        <Skeleton />
      </DemoBlock>

      <DemoBlock title="Active" code={`<Skeleton active />`}>
        <Skeleton active />
      </DemoBlock>

      <DemoBlock title="Avatar" code={`<Skeleton avatar={{ size: 40, shape: 'square' }} active />`}>
        <Skeleton avatar={{ size: 40, shape: 'square' }} active />
      </DemoBlock>

      <DemoBlock
        title="Custom rows"
        code={`<Skeleton title={{ width: '50%' }} paragraph={{ rows: 4, width: ['100%', '90%', '70%', '40%'] }} />`}
      >
        <Skeleton
          title={{ width: '50%' }}
          paragraph={{ rows: 4, width: ['100%', '90%', '70%', '40%'] }}
        />
      </DemoBlock>

      <DemoBlock
        title="Loaded content"
        code={`<Skeleton loading={loaded()} active><Card title="Loaded">Content is ready.</Card></Skeleton>`}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <button type="button" onClick={() => setLoaded((value) => !value)}>
            Toggle loaded
          </button>
          <Skeleton loading={!loaded()} active>
            <Card title="Loaded">Content is ready.</Card>
          </Skeleton>
        </Space>
      </DemoBlock>

      <DemoBlock title="Round" code={`<Skeleton round avatar paragraph={{ rows: 3 }} />`}>
        <Skeleton round avatar paragraph={{ rows: 3 }} />
      </DemoBlock>
    </>
  )
}
