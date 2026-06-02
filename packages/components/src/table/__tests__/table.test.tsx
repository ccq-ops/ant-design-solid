import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Table } from '../index'

interface UserRecord {
  key: string
  name: string
  age: number
  status: string
}

const data: UserRecord[] = [
  { key: 'a', name: 'Ada', age: 32, status: 'active' },
  { key: 'b', name: 'Grace', age: 36, status: 'idle' },
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
    expect(result.getByText('active').tagName).toBe('STRONG')
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

  it('applies prefix, bordered, size, and loading classes', () => {
    const result = render(() => (
      <Table columns={columns} dataSource={data} bordered size="small" loading />
    ))
    const root = result.container.firstElementChild as HTMLElement
    expect(root.className).toContain('ads-table-wrapper')
    expect(root.className).toContain('ads-table-bordered')
    expect(root.className).toContain('ads-table-small')
    expect(root.className).toContain('ads-table-loading')
  })

  it('invokes row event handlers from onRow', () => {
    const onClick = vi.fn()
    const result = render(() => (
      <Table columns={columns} dataSource={data} onRow={() => ({ onClick })} />
    ))
    fireEvent.click(result.getByText('Ada').closest('tr')!)
    expect(onClick).toHaveBeenCalledTimes(1)
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
