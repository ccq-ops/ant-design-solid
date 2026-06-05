import { Button, Empty, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const emptyRows: ApiTableRow[] = [
  { property: 'image', description: 'Custom empty image content or image URL.', type: 'JSX.Element | string' },
  { property: 'imageStyle', description: 'Inline style for the image wrapper.', type: 'JSX.CSSProperties' },
  {
    property: 'description',
    description: 'Description text or content displayed below the image.',
    type: 'JSX.Element',
    defaultValue: "'No Data'",
  },
  { property: 'children', description: 'Footer content, usually actions.', type: 'JSX.Element' },
]

function CustomEmptyImage() {
  return (
    <svg width="96" height="72" viewBox="0 0 96 72" role="img" aria-label="Custom empty image">
      <rect x="16" y="18" width="64" height="40" rx="8" fill="#e6f4ff" />
      <path d="M28 30h40M28 42h24" stroke="#1677ff" stroke-width="4" stroke-linecap="round" />
      <circle cx="72" cy="18" r="10" fill="#52c41a" />
    </svg>
  )
}

export default function EmptyPage() {
  return (
    <>
      <h1>Empty</h1>
      <DemoBlock title="Basic" code={`<Empty />`}>
        <Empty />
      </DemoBlock>
      <DemoBlock
        title="Custom image"
        code={`<Empty image={<CustomEmptyImage />} description="No projects yet" />`}
      >
        <Empty image={<CustomEmptyImage />} description="No projects yet" />
      </DemoBlock>
      <DemoBlock
        title="Image URL"
        code={`<Empty image="data:image/svg+xml,..." imageStyle={{ height: '72px' }} description="No files" />`}
      >
        <Empty
          image="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='72' viewBox='0 0 96 72'%3E%3Crect x='20' y='16' width='56' height='40' rx='8' fill='%23f0f5ff'/%3E%3Cpath d='M32 30h32M32 42h20' stroke='%232f54eb' stroke-width='4' stroke-linecap='round'/%3E%3C/svg%3E"
          imageStyle={{ height: '72px' }}
          description="No files"
        />
      </DemoBlock>
      <DemoBlock
        title="With action"
        code={`<Empty description="No results found"><Button type="primary">Create now</Button></Empty>`}
      >
        <Empty description="No results found">
          <Space>
            <Button type="primary">Create now</Button>
            <Button>Refresh</Button>
          </Space>
        </Empty>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable rows={emptyRows} aria-label="Empty API" />
    </>
  )
}
