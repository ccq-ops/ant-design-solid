import { Card, Skeleton, Space } from '@ant-design-solid/core'
import { createSignal } from 'solid-js'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const skeletonRows: ApiTableRow[] = [
  {
    property: 'active',
    description: 'Shows animated loading effect.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'loading',
    description: 'Controls whether skeleton or children are rendered.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'avatar',
    description: 'Shows avatar placeholder or configures it.',
    type: 'boolean | SkeletonAvatarProps',
  },
  {
    property: 'title',
    description: 'Shows title placeholder or configures it.',
    type: 'boolean | SkeletonTitleProps',
  },
  {
    property: 'paragraph',
    description: 'Shows paragraph placeholders or configures them.',
    type: 'boolean | SkeletonParagraphProps',
  },
  {
    property: 'round',
    description: 'Uses rounded placeholder corners.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'children',
    description: 'Content rendered when loading is false.',
    type: 'JSX.Element',
  },
]

const skeletonAvatarRows: ApiTableRow[] = [
  {
    property: 'size',
    description: 'Avatar placeholder size.',
    type: "'small' | 'default' | 'large' | number",
  },
  {
    property: 'shape',
    description: 'Avatar placeholder shape.',
    type: "'circle' | 'square'",
    defaultValue: "'circle'",
  },
]

const skeletonTitleRows: ApiTableRow[] = [
  { property: 'width', description: 'Title placeholder width.', type: 'number | string' },
]

const skeletonParagraphRows: ApiTableRow[] = [
  { property: 'rows', description: 'Number of paragraph rows.', type: 'number' },
  {
    property: 'width',
    description: 'Paragraph row width or widths.',
    type: 'SkeletonWidth | SkeletonWidth[]',
  },
]

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
        <Space direction="vertical" class="w-full">
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

      <h2>API</h2>
      <h3>Skeleton</h3>
      <ApiTable rows={skeletonRows} aria-label="Skeleton API" />
      <h3>Skeleton avatar</h3>
      <ApiTable rows={skeletonAvatarRows} aria-label="Skeleton Avatar API" />
      <h3>Skeleton title</h3>
      <ApiTable rows={skeletonTitleRows} aria-label="Skeleton Title API" />
      <h3>Skeleton paragraph</h3>
      <ApiTable rows={skeletonParagraphRows} aria-label="Skeleton Paragraph API" />
    </>
  )
}
