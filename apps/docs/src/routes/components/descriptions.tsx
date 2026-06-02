import { Descriptions } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

const basicItems = [
  { label: 'UserName', children: 'Zhou Maomao' },
  { label: 'Telephone', children: '1810000000' },
  { label: 'Live', children: 'Hangzhou, Zhejiang' },
]

const detailItems = [
  { label: 'Product', children: 'Cloud Database' },
  { label: 'Billing Mode', children: 'Prepaid' },
  { label: 'Automatic Renewal', children: 'Yes' },
  { label: 'Order time', children: '2018-04-24 18:00:00' },
  { label: 'Usage Time', children: '2019-04-24 18:00:00' },
  { label: 'Status', children: 'Running' },
  { label: 'Negotiated Amount', children: '$80.00', span: 2 },
  { label: 'Discount', children: '$20.00' },
]

export default function DescriptionsPage() {
  return (
    <>
      <h1>Descriptions</h1>
      <p>Descriptions displays multiple read-only fields in groups.</p>

      <DemoBlock
        title="Basic"
        code={`<Descriptions title="User Info" items={[{ label: 'UserName', children: 'Zhou Maomao' }]} />`}
      >
        <Descriptions title="User Info" items={basicItems} />
      </DemoBlock>

      <DemoBlock
        title="Bordered"
        code={`<Descriptions title="Product" bordered items={[{ label: 'Product', children: 'Cloud Database' }]} />`}
      >
        <Descriptions title="Product" bordered items={detailItems} />
      </DemoBlock>

      <DemoBlock
        title="Vertical"
        code={`<Descriptions title="User Info" layout="vertical" items={[{ label: 'UserName', children: 'Zhou Maomao' }]} />`}
      >
        <Descriptions title="User Info" layout="vertical" bordered items={basicItems} />
      </DemoBlock>

      <DemoBlock
        title="Children"
        code={`<Descriptions title="User Info"><Descriptions.Item label="UserName">Zhou Maomao</Descriptions.Item></Descriptions>`}
      >
        <Descriptions title="User Info" extra={<a href="#more">More</a>}>
          <Descriptions.Item label="UserName">Zhou Maomao</Descriptions.Item>
          <Descriptions.Item label="Telephone">1810000000</Descriptions.Item>
          <Descriptions.Item label="Address" span={2}>
            Hangzhou, Zhejiang
          </Descriptions.Item>
        </Descriptions>
      </DemoBlock>
    </>
  )
}
