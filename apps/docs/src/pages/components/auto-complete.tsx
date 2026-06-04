import { AutoComplete, Form } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

const options = [{ value: 'Burns Bay Road' }, { value: 'Downing Street' }, { value: 'Wall Street' }]

export default function AutoCompletePage() {
  return (
    <>
      <h1>AutoComplete</h1>
      <p>Text input with selectable suggestions.</p>

      <DemoBlock title="Basic" code={`<AutoComplete placeholder="Search" options={options} />`}>
        <AutoComplete placeholder="Search" options={options} />
      </DemoBlock>

      <DemoBlock
        title="No filtering"
        code={`<AutoComplete filterOption={false} options={options} />`}
      >
        <AutoComplete filterOption={false} placeholder="Show all on focus" options={options} />
      </DemoBlock>

      <DemoBlock
        title="Clearable and disabled option"
        code={`<AutoComplete allowClear options={options} />`}
      >
        <AutoComplete
          allowClear
          placeholder="Pick one"
          options={[...options, { value: 'Disabled option', disabled: true }]}
        />
      </DemoBlock>

      <DemoBlock
        title="In Form"
        code={`<Form><Form.Item name="street"><AutoComplete options={options} /></Form.Item></Form>`}
      >
        <Form>
          <Form.Item name="street" label="Street">
            <AutoComplete placeholder="Street" options={options} />
          </Form.Item>
        </Form>
      </DemoBlock>
    </>
  )
}
