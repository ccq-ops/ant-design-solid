import { Avatar, Button, List, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

const tasks = ['Create component API', 'Write tests', 'Document examples']

const users = [
  {
    name: 'Ada Lovelace',
    description: 'Mathematician and first computer programmer.',
    avatar: 'A',
  },
  {
    name: 'Grace Hopper',
    description: 'Computer scientist and compiler pioneer.',
    avatar: 'G',
  },
]

export default function ListPage() {
  return (
    <>
      <h1>List</h1>
      <p>List displays a group of related items with optional headers, actions, and metadata.</p>

      <DemoBlock
        title="Data source"
        code={`<List dataSource={['Create API', 'Write tests']} renderItem={(item) => <List.Item>{item}</List.Item>} />`}
      >
        <List
          dataSource={tasks}
          renderItem={(item, index) => <List.Item>{`${index + 1}. ${item}`}</List.Item>}
        />
      </DemoBlock>

      <DemoBlock
        title="Bordered with header and footer"
        code={`<List bordered header="Header" footer="Footer" dataSource={items} renderItem={(item) => <List.Item>{item}</List.Item>} />`}
      >
        <List
          bordered
          header={<strong>Project checklist</strong>}
          footer="3 items"
          dataSource={tasks}
          renderItem={(item) => <List.Item>{item}</List.Item>}
        />
      </DemoBlock>

      <DemoBlock
        title="Meta and actions"
        code={`<List dataSource={users} renderItem={(user) => <List.Item actions={[<a>Edit</a>]}><List.Item.Meta avatar={<Avatar>{user.avatar}</Avatar>} title={user.name} description={user.description} /></List.Item>} />`}
      >
        <List
          dataSource={users}
          renderItem={(user) => (
            <List.Item
              actions={[
                <a href={`#edit-${user.avatar}`}>Edit</a>,
                <a href={`#view-${user.avatar}`}>View</a>,
              ]}
              extra={<Button size="small">Follow</Button>}
            >
              <List.Item.Meta
                avatar={<Avatar>{user.avatar}</Avatar>}
                title={<a href={`#${user.avatar}`}>{user.name}</a>}
                description={user.description}
              />
            </List.Item>
          )}
        />
      </DemoBlock>

      <DemoBlock
        title="Loading and empty"
        code={`<List loading dataSource={items} renderItem={(item) => <List.Item>{item}</List.Item>} />\n<List dataSource={[]} emptyText="Nothing found" />`}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <List
            loading
            dataSource={tasks}
            renderItem={(item) => <List.Item>{item}</List.Item>}
            bordered
          />
          <List dataSource={[]} emptyText="Nothing found" bordered />
        </Space>
      </DemoBlock>
    </>
  )
}
