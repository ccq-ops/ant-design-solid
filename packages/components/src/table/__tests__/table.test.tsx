import { createSignal } from 'solid-js'
import { fireEvent, render, screen, within } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Table } from '../index'

interface UserRecord {
  key: string
  name: string
  age: number
  status: string
  profile?: {
    email: string
  }
}

const data: UserRecord[] = [
  { key: 'a', name: 'Ada', age: 32, status: 'active', profile: { email: 'ada@example.com' } },
  { key: 'b', name: 'Grace', age: 36, status: 'idle', profile: { email: 'grace@example.com' } },
  { key: 'c', name: 'Linus', age: 28, status: 'active', profile: { email: 'linus@example.com' } },
]

const columns = [
  { title: 'Name', dataIndex: 'name' },
  { title: 'Age', dataIndex: 'age', align: 'right' as const },
]

describe('Table', () => {
  it('renders headers and rows from dataIndex', () => {
    const result = render(() => <Table columns={columns} dataSource={data} />)
    expect(result.getByText('Name')).toBeInTheDocument()
    expect(result.getByText('Ada')).toBeInTheDocument()
    expect(result.getByText('Grace')).toBeInTheDocument()
  })

  it('uses render for custom cells', () => {
    const result = render(() => (
      <Table
        columns={[
          {
            title: 'Status',
            dataIndex: 'status',
            render: (value) => <strong>{String(value)}</strong>,
          },
        ]}
        dataSource={data}
      />
    ))
    expect(result.container.querySelector('strong')).toHaveTextContent('active')
  })

  it('supports dataIndex path arrays', () => {
    const result = render(() => (
      <Table columns={[{ title: 'Email', dataIndex: ['profile', 'email'] }]} dataSource={data} />
    ))
    expect(result.getByText('ada@example.com')).toBeInTheDocument()
  })

  it('supports rowKey string and function', () => {
    const byString = render(() => <Table columns={columns} dataSource={data} rowKey="name" />)
    expect(byString.container.querySelector('tbody tr')?.getAttribute('data-row-key')).toBe('Ada')
    byString.unmount()

    const byFunction = render(() => (
      <Table columns={columns} dataSource={data} rowKey={(record) => record.status} />
    ))
    expect(byFunction.container.querySelector('tbody tr')?.getAttribute('data-row-key')).toBe(
      'active',
    )
  })

  it('supports showHeader false', () => {
    const result = render(() => <Table columns={columns} dataSource={data} showHeader={false} />)
    expect(result.container.querySelector('thead')).toBeNull()
  })

  it('renders empty text when no data', () => {
    const result = render(() => <Table columns={columns} dataSource={[]} emptyText="No rows" />)
    expect(result.getByText('No rows')).toBeInTheDocument()
  })

  it('prefers locale emptyText over the fallback empty text', () => {
    const result = render(() => (
      <Table columns={columns} dataSource={[]} locale={{ emptyText: 'Nothing here' }} />
    ))
    expect(result.getByText('Nothing here')).toBeInTheDocument()
  })

  it('applies prefix, className, bordered, size, and loading classes', () => {
    const result = render(() => (
      <Table
        columns={columns}
        dataSource={data}
        bordered
        size="small"
        loading
        className="custom-table"
      />
    ))
    const root = result.container.firstElementChild as HTMLElement
    expect(root.className).toContain('ads-table-wrapper')
    expect(root.className).toContain('custom-table')
    expect(root.className).toContain('ads-table-bordered')
    expect(root.className).toContain('ads-table-small')
    expect(root.className).toContain('ads-table-loading')
  })

  it('treats object loading as active loading state', () => {
    const result = render(() => (
      <Table columns={columns} dataSource={data} loading={{ spinning: true, tip: 'Fetching' }} />
    ))
    expect(result.getByText('Fetching')).toBeInTheDocument()
  })

  it('invokes row event handlers from onRow', () => {
    const onClick = vi.fn()
    const result = render(() => (
      <Table columns={columns} dataSource={data} onRow={() => ({ onClick })} />
    ))
    fireEvent.click(result.getByText('Ada').closest('tr')!)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies row, header cell, and body cell props', () => {
    const result = render(() => (
      <Table
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
            className: 'name-column',
            onHeaderCell: () => ({ id: 'name-header' }),
            onCell: (record) => ({ id: `${record.key}-name-cell` }),
          },
        ]}
        dataSource={data}
        rowClassName={(record) => `row-${record.key}`}
        onHeaderRow={() => ({ id: 'header-row' })}
      />
    ))
    expect(result.container.querySelector('#header-row')).toBeInTheDocument()
    expect(result.container.querySelector('#name-header')).toHaveClass('name-column')
    expect(result.container.querySelector('#a-name-cell')).toHaveClass('name-column')
    expect(result.getByText('Ada').closest('tr')).toHaveClass('row-a')
  })

  it('paginates data and emits change details', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ defaultPageSize: 2 }}
        onChange={onChange}
      />
    ))
    expect(result.getByText('Ada')).toBeInTheDocument()
    expect(result.queryByText('Linus')).toBeNull()

    fireEvent.click(result.getByRole('button', { name: 'Page 2' }))

    expect(result.getByText('Linus')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ current: 2, pageSize: 2, total: 3 }),
      {},
      {},
      expect.objectContaining({ action: 'paginate', currentDataSource: data }),
    )
    expect(result.container.querySelector('.ads-table-pagination')).toBeInTheDocument()
  })

  it('updates rows and page size selector when changing page size', () => {
    const tableData = Array.from({ length: 12 }, (_, index) => ({
      key: String(index + 1),
      name: `User ${index + 1}`,
      age: index,
      status: 'active',
    }))
    const result = render(() => (
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={{
          defaultPageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: [5, 10],
        }}
      />
    ))
    const pageSizeSelect = result.getByRole('combobox', { name: 'Page Size' })

    expect(pageSizeSelect).toHaveTextContent('5 / page')
    expect(result.queryByText('User 10')).toBeNull()

    fireEvent.click(pageSizeSelect)
    fireEvent.click(screen.getByRole('option', { name: '10 / page' }))

    expect(pageSizeSelect).toHaveTextContent('10 / page')
    expect(result.getByText('User 10')).toBeInTheDocument()
  })

  it('can disable pagination', () => {
    const result = render(() => <Table columns={columns} dataSource={data} pagination={false} />)
    expect(result.queryByRole('button', { name: 'Page 1' })).toBeNull()
    expect(result.getByText('Linus')).toBeInTheDocument()
  })

  it('selects rows with checkboxes and select all', () => {
    const onChange = vi.fn()
    const onSelect = vi.fn()
    const result = render(() => (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowSelection={{ onChange, onSelect }}
      />
    ))
    const checkboxes = result.getAllByRole('checkbox')

    fireEvent.click(checkboxes[1])

    expect(onSelect).toHaveBeenCalledWith(data[0], true, [data[0]], expect.any(Event))
    expect(onChange).toHaveBeenLastCalledWith(['a'], [data[0]], { type: 'single' })
    expect(checkboxes[1]).toBeChecked()

    fireEvent.click(checkboxes[0])

    expect(onChange).toHaveBeenLastCalledWith(['a', 'b', 'c'], data, { type: 'all' })
    expect(checkboxes[0]).toBeChecked()
  })

  it('respects disabled checkbox props for row selection', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowSelection={{
          getCheckboxProps: (record) => ({ disabled: record.key === 'b' }),
          onChange,
        }}
      />
    ))
    const checkboxes = result.getAllByRole('checkbox')

    expect(checkboxes[2]).toBeDisabled()
    fireEvent.click(checkboxes[0])

    expect(onChange).toHaveBeenLastCalledWith(['a', 'c'], [data[0], data[2]], { type: 'all' })
  })

  it('renders custom selection column title', () => {
    const result = render(() => (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowSelection={{ columnTitle: 'Pick' }}
      />
    ))

    expect(result.getByText('Pick')).toBeInTheDocument()
    expect(result.queryByRole('checkbox', { name: 'Select all rows' })).toBeNull()
  })

  it('hides select all controls and applies header checkbox props', () => {
    const hidden = render(() => (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowSelection={{ hideSelectAll: true }}
      />
    ))
    expect(hidden.queryByRole('checkbox', { name: 'Select all rows' })).toBeNull()
    hidden.unmount()

    const result = render(() => (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowSelection={{
          getTitleCheckboxProps: () => ({ disabled: true, 'aria-label': 'Select available rows' }),
        }}
      />
    ))

    expect(result.getByRole('checkbox', { name: 'Select available rows' })).toBeDisabled()
  })

  it('renders custom selection cells around the original control', () => {
    const result = render(() => (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowSelection={{
          renderCell: (checked, record, _index, originNode) => (
            <span data-selected={checked ? 'yes' : 'no'}>
              {originNode}
              {record.name}
            </span>
          ),
        }}
      />
    ))

    const adaSelection = result.container.querySelector('[data-selected]')!
    expect(adaSelection).toHaveAttribute('data-selected', 'no')

    fireEvent.click(result.getByRole('checkbox', { name: 'Select row a' }))

    expect(result.container.querySelector('[data-selected]')).toHaveAttribute(
      'data-selected',
      'yes',
    )
  })

  it('supports selection actions for all, invert, none, and custom entries', () => {
    const onChange = vi.fn()
    const onSelectAll = vi.fn()
    const onSelectInvert = vi.fn()
    const onSelectNone = vi.fn()
    const custom = vi.fn()
    const result = render(() => (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowSelection={{
          onChange,
          onSelectAll,
          onSelectInvert,
          onSelectNone,
          selections: [
            { key: 'custom', text: 'Pick first two', onSelect: custom },
            'all',
            'invert',
            'none',
          ],
        }}
      />
    ))

    fireEvent.click(result.getByRole('button', { name: 'Selection actions' }))
    fireEvent.click(result.getByRole('button', { name: 'Select all' }))
    expect(onSelectAll).toHaveBeenLastCalledWith(true, data, data)
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b', 'c'], data, { type: 'all' })

    fireEvent.click(result.getByRole('button', { name: 'Selection actions' }))
    fireEvent.click(result.getByRole('button', { name: 'Invert selection' }))
    expect(onSelectInvert).toHaveBeenLastCalledWith([])
    expect(onChange).toHaveBeenLastCalledWith([], [], { type: 'invert' })

    fireEvent.click(result.getByRole('button', { name: 'Selection actions' }))
    fireEvent.click(result.getByRole('button', { name: 'Select none' }))
    expect(onSelectNone).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenLastCalledWith([], [], { type: 'none' })

    fireEvent.click(result.getByRole('button', { name: 'Selection actions' }))
    fireEvent.click(result.getByRole('button', { name: 'Pick first two' }))
    expect(custom).toHaveBeenLastCalledWith(['a', 'b', 'c'])
  })

  it('drops removed uncontrolled selected keys unless preserveSelectedRowKeys is set', () => {
    const WithoutPreserve = () => {
      const [records, setRecords] = createSignal(data)
      return (
        <>
          <button type="button" onClick={() => setRecords([data[1], data[2]])}>
            Remove Ada
          </button>
          <Table
            columns={columns}
            dataSource={records()}
            pagination={false}
            rowSelection={{ defaultSelectedRowKeys: ['a'] }}
          />
        </>
      )
    }
    const withoutPreserve = render(() => <WithoutPreserve />)
    expect(withoutPreserve.getByRole('checkbox', { name: 'Select row a' })).toBeChecked()
    fireEvent.click(withoutPreserve.getByRole('button', { name: 'Remove Ada' }))
    expect(withoutPreserve.getByRole('checkbox', { name: 'Select row b' })).not.toBeChecked()
    withoutPreserve.unmount()

    const WithPreserve = () => {
      const [records, setRecords] = createSignal(data)
      return (
        <>
          <button type="button" onClick={() => setRecords([data[1], data[2]])}>
            Remove Ada
          </button>
          <button type="button" onClick={() => setRecords(data)}>
            Restore Ada
          </button>
          <Table
            columns={columns}
            dataSource={records()}
            pagination={false}
            rowSelection={{ defaultSelectedRowKeys: ['a'], preserveSelectedRowKeys: true }}
          />
        </>
      )
    }
    const withPreserve = render(() => <WithPreserve />)
    fireEvent.click(withPreserve.getByRole('button', { name: 'Remove Ada' }))
    fireEvent.click(withPreserve.getByRole('button', { name: 'Restore Ada' }))
    expect(withPreserve.getByRole('checkbox', { name: 'Select row a' })).toBeChecked()
  })

  it('keeps page row indexes when selecting all with disabled rows', () => {
    const records = [{ name: 'Ada' }, { name: 'Grace' }, { name: 'Linus' }]
    const onChange = vi.fn()
    const result = render(() => (
      <Table
        columns={[{ title: 'Name', dataIndex: 'name' }]}
        dataSource={records}
        pagination={false}
        rowSelection={{
          getCheckboxProps: (record) => ({ disabled: record.name === 'Grace' }),
          onChange,
        }}
      />
    ))

    fireEvent.click(result.getByRole('checkbox', { name: 'Select all rows' }))

    expect(onChange).toHaveBeenLastCalledWith(['0', '2'], [records[0], records[2]], {
      type: 'all',
    })
  })

  it('supports radio row selection', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowSelection={{ type: 'radio', onChange }}
      />
    ))
    const radios = result.getAllByRole('radio')

    fireEvent.click(radios[1])
    fireEvent.click(radios[2])

    expect(radios[1]).not.toBeChecked()
    expect(radios[2]).toBeChecked()
    expect(onChange).toHaveBeenLastCalledWith(['c'], [data[2]], { type: 'single' })
  })

  it('renders default expanded rows and toggles with expand button', () => {
    const onExpand = vi.fn()
    const onExpandedRowsChange = vi.fn()
    const result = render(() => (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        expandable={{
          defaultExpandedRowKeys: ['a'],
          expandedRowRender: (record) => <span>{record.name} details</span>,
          onExpand,
          onExpandedRowsChange,
        }}
      />
    ))

    expect(result.getByText('Ada details')).toBeInTheDocument()

    fireEvent.click(result.getByRole('button', { name: 'Expand row b' }))

    expect(result.getByText('Grace details')).toBeInTheDocument()
    expect(onExpand).toHaveBeenCalledWith(true, data[1])
    expect(onExpandedRowsChange).toHaveBeenLastCalledWith(['a', 'b'])
  })

  it('supports expanding rows by clicking the row', () => {
    const result = render(() => (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        expandable={{
          expandRowByClick: true,
          expandedRowRender: (record) => <span>{record.status} panel</span>,
        }}
      />
    ))

    fireEvent.click(result.getByText('Ada').closest('tr')!)

    expect(result.getByText('active panel')).toBeInTheDocument()
  })

  it('respects controlled expanded row keys', () => {
    const onExpandedRowsChange = vi.fn()
    const result = render(() => (
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        expandable={{
          expandedRowKeys: ['b'],
          expandedRowRender: (record) => <span>{record.name} info</span>,
          onExpandedRowsChange,
        }}
      />
    ))

    expect(result.queryByText('Ada info')).toBeNull()
    expect(result.getByText('Grace info')).toBeInTheDocument()

    fireEvent.click(result.getByRole('button', { name: 'Expand row a' }))

    expect(result.queryByText('Ada info')).toBeNull()
    expect(onExpandedRowsChange).toHaveBeenLastCalledWith(['b', 'a'])
  })

  it('renders summary with current page data', () => {
    const result = render(() => (
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ defaultPageSize: 2 }}
        summary={(currentData) => (
          <tr>
            <td>Total</td>
            <td>{currentData.reduce((sum, record) => sum + record.age, 0)}</td>
          </tr>
        )}
      />
    ))

    expect(result.container.querySelector('tfoot')).toBeInTheDocument()
    expect(result.getByText('Total')).toBeInTheDocument()
    expect(result.getByText('68')).toBeInTheDocument()
  })

  it('applies horizontal and vertical scroll styles', () => {
    const result = render(() => (
      <Table columns={columns} dataSource={data} pagination={false} scroll={{ x: 800, y: 240 }} />
    ))
    const container = result.container.querySelector('.ads-table-container') as HTMLElement
    const table = result.container.querySelector('table') as HTMLElement

    expect(container).toHaveStyle({ 'overflow-x': 'auto', 'max-height': '240px' })
    expect(table).toHaveStyle({ 'min-width': '800px' })
  })

  it('renders title and footer with current page data', () => {
    const result = render(() => (
      <Table
        columns={columns}
        dataSource={data}
        pagination={{ defaultPageSize: 2 }}
        title={(currentData) => `Showing ${currentData.length} users`}
        footer={(currentData) => `Footer ${currentData.map((record) => record.name).join(', ')}`}
      />
    ))

    expect(result.getByText('Showing 2 users')).toBeInTheDocument()
    expect(result.getByText('Footer Ada, Grace')).toBeInTheDocument()
  })

  it('applies explicit and ellipsis-derived table layout', () => {
    const fixed = render(() => (
      <Table columns={[{ title: 'Name', dataIndex: 'name', ellipsis: true }]} dataSource={data} />
    ))
    expect(fixed.container.querySelector('table')).toHaveStyle({ 'table-layout': 'fixed' })
    fixed.unmount()

    const explicit = render(() => (
      <Table
        columns={[{ title: 'Name', dataIndex: 'name', ellipsis: true }]}
        dataSource={data}
        tableLayout="auto"
      />
    ))
    expect(explicit.container.querySelector('table')).toHaveStyle({ 'table-layout': 'auto' })
  })

  it('filters hidden and responsive columns', () => {
    const result = render(() => (
      <Table
        columns={[
          { title: 'Name', dataIndex: 'name' },
          { title: 'Hidden Age', dataIndex: 'age', hidden: true },
          { title: 'XS Status', dataIndex: 'status', responsive: ['xs'] },
          { title: 'MD Email', dataIndex: ['profile', 'email'], responsive: ['md'] },
        ]}
        dataSource={data}
        pagination={false}
      />
    ))

    expect(result.getByText('Name')).toBeInTheDocument()
    expect(result.getByText('XS Status')).toBeInTheDocument()
    expect(result.queryByText('Hidden Age')).toBeNull()
    expect(result.queryByText('MD Email')).toBeNull()
    expect(result.queryByText('ada@example.com')).toBeNull()
  })

  it('applies ellipsis cell metadata and row scope', () => {
    const result = render(() => (
      <Table
        columns={[
          { title: 'Name', dataIndex: 'name', ellipsis: true, rowScope: 'row' },
          { title: 'Status', dataIndex: 'status', ellipsis: { showTitle: false } },
        ]}
        dataSource={data}
        pagination={false}
      />
    ))
    const nameHeader = result.getByText('Name').closest('th')!
    const adaCell = result.getByText('Ada').closest('td')!
    const statusCell = within(result.getByText('Ada').closest('tr') as HTMLElement)
      .getByText('active')
      .closest('td')!

    expect(nameHeader).toHaveClass('ads-table-cell-ellipsis')
    expect(adaCell).toHaveClass('ads-table-cell-ellipsis')
    expect(adaCell).toHaveAttribute('scope', 'row')
    expect(adaCell).toHaveAttribute('title', 'Ada')
    expect(statusCell).toHaveClass('ads-table-cell-ellipsis')
    expect(statusCell).not.toHaveAttribute('title')
  })

  it('supports render return props and merged cells', () => {
    const result = render(() => (
      <Table
        columns={[
          {
            title: 'Name',
            dataIndex: 'name',
            render: (value, _record, index) =>
              index === 0
                ? { children: `Lead ${value}`, props: { colSpan: 2, class: 'merged-name' } }
                : String(value),
          },
          {
            title: 'Age',
            dataIndex: 'age',
            render: (value, _record, index) =>
              index === 0 ? { children: String(value), props: { colSpan: 0 } } : String(value),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (value, _record, index) =>
              index === 1
                ? { children: String(value), props: { rowSpan: 2, class: 'status-span' } }
                : index === 2
                  ? { children: String(value), props: { rowSpan: 0 } }
                  : String(value),
          },
        ]}
        dataSource={data}
        pagination={false}
      />
    ))
    const rows = result.container.querySelectorAll('tbody tr')

    expect(result.getByText('Lead Ada').closest('td')).toHaveAttribute('colspan', '2')
    expect(result.getByText('Lead Ada').closest('td')).toHaveClass('merged-name')
    expect(within(rows[0] as HTMLElement).queryByText('32')).toBeNull()
    expect(result.getByText('idle').closest('td')).toHaveAttribute('rowspan', '2')
    expect(result.getByText('idle').closest('td')).toHaveClass('status-span')
    expect(within(rows[2] as HTMLElement).queryByText('active')).toBeNull()
  })

  it('renders grouped column headers with spans and leaf body cells', () => {
    const result = render(() => (
      <Table
        columns={[
          {
            title: 'User',
            children: [
              { title: 'Name', dataIndex: 'name' },
              { title: 'Age', dataIndex: 'age' },
            ],
          },
          { title: 'Status', dataIndex: 'status' },
        ]}
        dataSource={data}
        pagination={false}
      />
    ))
    const headerRows = result.container.querySelectorAll('thead tr')
    const userHeader = result.getByText('User').closest('th')!
    const statusHeader = result.getByText('Status').closest('th')!
    const firstBodyRow = result.container.querySelector('tbody tr')!

    expect(headerRows).toHaveLength(2)
    expect(userHeader).toHaveAttribute('colspan', '2')
    expect(statusHeader).toHaveAttribute('rowspan', '2')
    expect(within(headerRows[1] as HTMLElement).getByText('Name')).toBeInTheDocument()
    expect(firstBodyRow.querySelectorAll('td')).toHaveLength(3)
    expect(within(firstBodyRow as HTMLElement).getByText('Ada')).toBeInTheDocument()
    expect(within(firstBodyRow as HTMLElement).getByText('32')).toBeInTheDocument()
    expect(within(firstBodyRow as HTMLElement).getByText('active')).toBeInTheDocument()
  })

  it('omits hidden children from grouped column spans', () => {
    const result = render(() => (
      <Table
        columns={[
          {
            title: 'User',
            children: [
              { title: 'Name', dataIndex: 'name' },
              { title: 'Hidden Age', dataIndex: 'age', hidden: true },
            ],
          },
          { title: 'Status', dataIndex: 'status' },
        ]}
        dataSource={data}
        pagination={false}
      />
    ))
    const userHeader = result.getByText('User').closest('th')!
    const firstBodyRow = result.container.querySelector('tbody tr')!

    expect(userHeader).toHaveAttribute('colspan', '1')
    expect(result.queryByText('Hidden Age')).toBeNull()
    expect(firstBodyRow.querySelectorAll('td')).toHaveLength(2)
    expect(within(firstBodyRow as HTMLElement).queryByText('32')).toBeNull()
  })

  it('spans selection and expand headers across grouped header rows', () => {
    const result = render(() => (
      <Table
        columns={[
          {
            title: 'User',
            children: [
              { title: 'Name', dataIndex: 'name' },
              { title: 'Age', dataIndex: 'age' },
            ],
          },
        ]}
        dataSource={data}
        pagination={false}
        rowSelection={{}}
        expandable={{ expandedRowRender: (record) => <span>{record.name} details</span> }}
      />
    ))
    const expandHeader = result.container.querySelector('thead .ads-table-expand-column')!
    const selectionHeader = result.container.querySelector('thead .ads-table-selection-column')!
    const firstBodyRow = result.container.querySelector('tbody tr')!

    expect(result.container.querySelectorAll('thead tr')).toHaveLength(2)
    expect(expandHeader).toHaveAttribute('rowspan', '2')
    expect(selectionHeader).toHaveAttribute('rowspan', '2')
    expect(firstBodyRow.querySelectorAll('td')).toHaveLength(4)
  })

  it('sorts leaf columns inside grouped columns', () => {
    const result = render(() => (
      <Table
        columns={[
          {
            title: 'User',
            children: [
              { title: 'Name', dataIndex: 'name' },
              { title: 'Age', dataIndex: 'age', sorter: (a, b) => a.age - b.age },
            ],
          },
        ]}
        dataSource={data}
        pagination={false}
      />
    ))

    fireEvent.click(result.getByRole('button', { name: 'Sort by Age' }))

    const firstBodyRow = result.container.querySelector('tbody tr')!
    expect(within(firstBodyRow as HTMLElement).getByText('Linus')).toBeInTheDocument()
  })

  it('sorts by clicking a sortable column header and emits change details', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Table
        columns={[{ title: 'Age', dataIndex: 'age', sorter: (a, b) => a.age - b.age }]}
        dataSource={data}
        pagination={false}
        onChange={onChange}
      />
    ))

    fireEvent.click(result.getByRole('button', { name: 'Sort by Age' }))

    const rows = result.container.querySelectorAll('tbody tr')
    const sortButton = result.getByRole('button', { name: 'Sort by Age' })
    expect(sortButton).toHaveClass('ads-table-sorter')
    expect(sortButton).toHaveAttribute('aria-sort', 'ascending')
    expect(within(rows[0] as HTMLElement).getByText('28')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith(
      expect.any(Object),
      {},
      expect.objectContaining({ field: 'age', order: 'ascend' }),
      expect.objectContaining({ action: 'sort' }),
    )
  })

  it('filters by default filter controls and emits change details', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Table
        columns={[
          {
            title: 'Status',
            dataIndex: 'status',
            filters: [
              { text: 'Active', value: 'active' },
              { text: 'Idle', value: 'idle' },
            ],
            onFilter: (value, record) => record.status === value,
          },
          { title: 'Name', dataIndex: 'name' },
        ]}
        dataSource={data}
        pagination={false}
        onChange={onChange}
      />
    ))

    fireEvent.click(result.getByRole('button', { name: 'Filter Status' }))
    fireEvent.click(result.getByLabelText('Idle'))

    expect(result.queryByText('Ada')).toBeNull()
    expect(result.getByText('Grace')).toBeInTheDocument()
    expect(onChange).toHaveBeenCalledWith(
      expect.any(Object),
      { status: ['idle'] },
      {},
      expect.objectContaining({ action: 'filter' }),
    )
  })

  it('uses custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Table columns={columns} dataSource={data} />
      </ConfigProvider>
    ))
    expect(result.container.firstElementChild?.className).toContain('custom-table-wrapper')
  })
})
