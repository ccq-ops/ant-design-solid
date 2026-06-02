import { Badge, Table, Tag } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

interface UserRecord {
  key: string
  name: string
  age: number
  status: 'active' | 'idle'
}

const data: UserRecord[] = [
  { key: '1', name: 'Ada Lovelace', age: 32, status: 'active' },
  { key: '2', name: 'Grace Hopper', age: 36, status: 'idle' },
]

const columns = [
  { title: 'Name', dataIndex: 'name' },
  { title: 'Age', dataIndex: 'age', align: 'right' as const },
  {
    title: 'Status',
    dataIndex: 'status',
    render: (value: unknown) =>
      value === 'active' ? <Tag color="success">Active</Tag> : <Badge status="default" text="Idle" />,
  },
]

export default function TablePage() {
  return (
    <>
      <h1>Table</h1>
      <DemoBlock title="Basic" code={`<Table columns={columns} dataSource={data} />`}>
        <Table columns={columns} dataSource={data} />
      </DemoBlock>
      <DemoBlock title="Bordered small" code={`<Table bordered size="small" columns={columns} dataSource={data} />`}>
        <Table bordered size="small" columns={columns} dataSource={data} />
      </DemoBlock>
      <DemoBlock title="Empty and loading" code={`<Table loading columns={columns} dataSource={[]} emptyText="No users" />`}>
        <Table loading columns={columns} dataSource={[]} emptyText="No users" />
      </DemoBlock>
    </>
  )
}
