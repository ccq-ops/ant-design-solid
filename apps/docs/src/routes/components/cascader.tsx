import { Form, Cascader, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

const options = [
  {
    label: 'Zhejiang',
    value: 'zhejiang',
    children: [
      {
        label: 'Hangzhou',
        value: 'hangzhou',
        children: [{ label: 'West Lake', value: 'west-lake' }],
      },
      { label: 'Ningbo', value: 'ningbo' },
    ],
  },
  {
    label: 'Jiangsu',
    value: 'jiangsu',
    children: [{ label: 'Nanjing', value: 'nanjing' }],
  },
]

export default function CascaderPage() {
  return (
    <>
      <h1>Cascader</h1>
      <p>Select from a nested set of related options with one menu column per level.</p>

      <DemoBlock title="Basic" code={`<Cascader placeholder="Select area" options={options} />`}>
        <Cascader placeholder="Select area" options={options} />
      </DemoBlock>

      <DemoBlock
        title="Default value and allow clear"
        code={`<Cascader allowClear defaultValue={['zhejiang', 'hangzhou', 'west-lake']} options={options} />`}
      >
        <Cascader
          allowClear
          defaultValue={['zhejiang', 'hangzhou', 'west-lake']}
          options={options}
        />
      </DemoBlock>

      <DemoBlock
        title="Change on select"
        code={`<Cascader changeOnSelect placeholder="Select any level" options={options} />`}
      >
        <Cascader changeOnSelect placeholder="Select any level" options={options} />
      </DemoBlock>

      <DemoBlock
        title="Hover expand"
        code={`<Cascader expandTrigger="hover" placeholder="Hover to expand" options={options} />`}
      >
        <Cascader expandTrigger="hover" placeholder="Hover to expand" options={options} />
      </DemoBlock>

      <DemoBlock
        title="Disabled"
        code={`<Cascader disabled defaultValue={['jiangsu', 'nanjing']} options={options} />`}
      >
        <Space direction="vertical">
          <Cascader disabled placeholder="Disabled" options={options} />
          <Cascader disabled defaultValue={['jiangsu', 'nanjing']} options={options} />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Custom display render"
        code={`<Cascader displayRender={(labels) => labels.at(-1)} options={options} />`}
      >
        <Cascader
          defaultValue={['zhejiang', 'hangzhou', 'west-lake']}
          options={options}
          displayRender={(labels) => <strong>{labels.at(-1)}</strong>}
        />
      </DemoBlock>

      <DemoBlock
        title="Form usage"
        code={`<Form><Form.Item name="area" label="Area"><Cascader options={options} /></Form.Item></Form>`}
      >
        <Form onFinish={(values) => console.log(values)}>
          <Form.Item name="area" label="Area">
            <Cascader options={options} />
          </Form.Item>
          <button type="submit">Submit</button>
        </Form>
      </DemoBlock>
    </>
  )
}
