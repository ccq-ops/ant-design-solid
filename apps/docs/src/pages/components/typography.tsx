import { Typography } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const baseRows: ApiTableRow[] = [
  {
    property: 'type',
    description: 'Semantic text color style.',
    type: "'secondary' | 'success' | 'warning' | 'danger'",
  },
  {
    property: 'ellipsis',
    description: 'Applies single-line truncation styling.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'children',
    description: 'Typography content.',
    type: 'JSX.Element',
  },
]

const titleRows: ApiTableRow[] = [
  {
    property: 'level',
    description: 'Heading level rendered as h1 through h5.',
    type: '1 | 2 | 3 | 4 | 5',
    defaultValue: '1',
  },
  ...baseRows,
]

export default function TypographyPage() {
  return (
    <>
      <h1>Typography</h1>
      <p>Typography provides title, text, and paragraph primitives for readable content.</p>

      <DemoBlock
        title="Title"
        code={`<Typography.Title level={2}>Title</Typography.Title>
<Typography.Title level={4}>Subtitle</Typography.Title>`}
      >
        <Typography.Title level={2}>Title level 2</Typography.Title>
        <Typography.Title level={4}>Title level 4</Typography.Title>
      </DemoBlock>

      <DemoBlock
        title="Text types"
        code={`<Typography.Text type="secondary">Secondary</Typography.Text>
<Typography.Text type="success">Success</Typography.Text>`}
      >
        <div class="flex flex-wrap gap-4">
          <Typography.Text>Default text</Typography.Text>
          <Typography.Text type="secondary">Secondary</Typography.Text>
          <Typography.Text type="success">Success</Typography.Text>
          <Typography.Text type="warning">Warning</Typography.Text>
          <Typography.Text type="danger">Danger</Typography.Text>
        </div>
      </DemoBlock>

      <DemoBlock
        title="Paragraph"
        code={`<Typography.Paragraph>
  Ant Design Solid helps teams build product interfaces with SolidJS.
</Typography.Paragraph>`}
      >
        <Typography.Paragraph>
          Ant Design Solid helps teams build product interfaces with SolidJS, design tokens, and
          familiar component semantics.
        </Typography.Paragraph>
        <Typography.Paragraph type="secondary">
          Use paragraphs for prose and supporting copy inside dense application pages.
        </Typography.Paragraph>
      </DemoBlock>

      <DemoBlock
        title="Ellipsis"
        code={`<Typography.Text ellipsis class="block w-64">Long text...</Typography.Text>`}
      >
        <Typography.Text ellipsis class="block w-64">
          This is a very long line of text that will be truncated when it exceeds the available
          width.
        </Typography.Text>
        <Typography.Paragraph ellipsis class="w-80">
          Paragraph ellipsis uses the same single-line truncation class for compact previews in
          lists and cards.
        </Typography.Paragraph>
      </DemoBlock>

      <h2>API</h2>
      <h3>Typography.Title</h3>
      <ApiTable rows={titleRows} aria-label="Typography Title API" />
      <h3>Typography.Text</h3>
      <ApiTable rows={baseRows} aria-label="Typography Text API" />
      <h3>Typography.Paragraph</h3>
      <ApiTable rows={baseRows} aria-label="Typography Paragraph API" />
    </>
  )
}
