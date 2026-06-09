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
