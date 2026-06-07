import { createSignal } from 'solid-js'
import { Pagination, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const paginationRows: ApiTableRow[] = [
  { property: 'current', description: 'Controlled current page.', type: 'number' },
  {
    property: 'defaultCurrent',
    description: 'Initial current page for uncontrolled usage.',
    type: 'number',
    defaultValue: '1',
  },
  { property: 'pageSize', description: 'Controlled items per page.', type: 'number' },
  {
    property: 'itemRender',
    description: 'Customizes page, previous, and next item content.',
    type: "(page: number, type: 'page' | 'prev' | 'next', originalElement: JSX.Element) => JSX.Element",
  },
  {
    property: 'defaultPageSize',
    description: 'Initial items per page for uncontrolled usage.',
    type: 'number',
    defaultValue: '10',
  },
  { property: 'total', description: 'Total number of items.', type: 'number', defaultValue: '0' },
  {
    property: 'totalBoundaryShowSizeChanger',
    description: 'Shows the size changer automatically when total is larger than this value.',
    type: 'number',
    defaultValue: '50',
  },
  {
    property: 'disabled',
    description: 'Disables pagination controls.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'align',
    description: 'Aligns pagination items.',
    type: "'start' | 'center' | 'end'",
  },
  {
    property: 'classNames',
    description: 'Semantic class names for internal slots.',
    type: 'PaginationSemanticClassNames',
  },
  {
    property: 'simple',
    description: 'Uses the compact simple layout, optionally with a read-only input.',
    type: 'boolean | { readOnly?: boolean }',
    defaultValue: 'false',
  },
  {
    property: 'showSizeChanger',
    description: 'Shows page size selection. Object form is passed to the internal select.',
    type: 'boolean | SelectHTMLAttributes<HTMLSelectElement>',
  },
  {
    property: 'pageSizeOptions',
    description: 'Options for page size selection.',
    type: '(string | number)[]',
  },
  {
    property: 'responsive',
    description: 'Adds responsive pagination class for responsive styling.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'showLessItems',
    description: 'Shows fewer page items around the current page.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'showQuickJumper',
    description: 'Shows quick jump input. Object form supports a custom goButton.',
    type: 'boolean | { goButton?: JSX.Element }',
    defaultValue: 'false',
  },
  {
    property: 'showTitle',
    description: 'Shows title attributes on page controls.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'size',
    description: 'Controls pagination size.',
    type: "'large' | 'medium' | 'small'",
    defaultValue: "'medium'",
  },
  {
    property: 'styles',
    description: 'Semantic inline styles for internal slots.',
    type: 'PaginationSemanticStyles',
  },
  {
    property: 'hideOnSinglePage',
    description: 'Hides pagination when total fits on one page.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'showTotal',
    description: 'Renders custom total text.',
    type: '(total: number, range: [number, number]) => JSX.Element',
  },
  {
    property: 'onChange',
    description: 'Called when page or page size changes.',
    type: '(page: number, pageSize: number) => void',
  },
  {
    property: 'onShowSizeChange',
    description: 'Called when page size changes.',
    type: '(current: number, size: number) => void',
  },
]

export default function PaginationPage() {
  const [current, setCurrent] = createSignal(2)

  return (
    <>
      <h1>Pagination</h1>
      <DemoBlock title="Basic" code={`<Pagination total={50} />`}>
        <Pagination total={50} />
      </DemoBlock>
      <DemoBlock title="More pages" code={`<Pagination total={500} defaultCurrent={6} />`}>
        <Pagination total={500} defaultCurrent={6} />
      </DemoBlock>
      <DemoBlock title="Simple" code={`<Pagination simple total={50} />`}>
        <Pagination simple total={50} />
      </DemoBlock>
      <DemoBlock
        title="Size changer and quick jumper"
        code={`<Pagination total={200} showSizeChanger showQuickJumper showTotal={(total, range) => \`${'${range[0]}-${range[1]} of ${total} items'}\`} />`}
      >
        <Pagination
          total={200}
          showSizeChanger
          showQuickJumper
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
        />
      </DemoBlock>
      <DemoBlock
        title="Controlled"
        code={`const [current, setCurrent] = createSignal(2)\n<Pagination current={current()} total={80} onChange={setCurrent} />`}
      >
        <Space direction="vertical">
          <Pagination current={current()} total={80} onChange={setCurrent} />
          <span>Current page: {current()}</span>
        </Space>
      </DemoBlock>
      <DemoBlock title="Disabled" code={`<Pagination disabled total={80} defaultCurrent={3} />`}>
        <Pagination disabled total={80} defaultCurrent={3} />
      </DemoBlock>
      <DemoBlock
        title="Customized"
        code={`<Pagination align="center" size="small" total={120} itemRender={(page, type, originalElement) => type === 'page' ? <strong>{page}</strong> : originalElement} showQuickJumper={{ goButton: <button type="button">Go</button> }} />`}
      >
        <Pagination
          align="center"
          size="small"
          total={120}
          itemRender={(page, type, originalElement) =>
            type === 'page' ? <strong>{page}</strong> : originalElement
          }
          showQuickJumper={{ goButton: <button type="button">Go</button> }}
        />
      </DemoBlock>

      <h2>API</h2>
      <ApiTable rows={paginationRows} aria-label="Pagination API" />
    </>
  )
}
