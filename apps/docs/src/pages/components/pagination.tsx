import { createSignal } from 'solid-js'
import { Pagination, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

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
    </>
  )
}
