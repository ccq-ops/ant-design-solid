import { AutoComplete, Form } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const autoCompleteRows: ApiTableRow[] = [
  { property: 'value', description: 'Controlled input value.', type: 'string' },
  {
    property: 'defaultValue',
    description: 'Initial input value for uncontrolled usage.',
    type: 'string',
  },
  { property: 'open', description: 'Controlled popup open state.', type: 'boolean' },
  {
    property: 'defaultOpen',
    description: 'Initial popup open state.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'options',
    description: 'Suggestion options shown in the popup.',
    type: 'AutoCompleteOption[]',
  },
  { property: 'placeholder', description: 'Input placeholder text.', type: 'string' },
  {
    property: 'disabled',
    description: 'Disables text input and selection.',
    type: 'boolean',
    defaultValue: 'false',
  },
  { property: 'size', description: 'Input size.', type: "'small' | 'middle' | 'large'" },
  { property: 'status', description: 'Validation visual status.', type: "'error' | 'warning'" },
  {
    property: 'variant',
    description: 'Visual input variant.',
    type: "'outlined' | 'borderless' | 'filled' | 'underlined'",
  },
  {
    property: 'allowClear',
    description: 'Shows a clear affordance. Object form customizes the clear icon.',
    type: 'boolean | { clearIcon?: JSX.Element }',
    defaultValue: 'false',
  },
  {
    property: 'showSearch',
    description: 'Enables search configuration including filterOption and onSearch.',
    type: 'true | AutoCompleteShowSearch',
  },
  {
    property: 'defaultActiveFirstOption',
    description: 'Activates the first option by default when the popup opens.',
    type: 'boolean',
  },
  {
    property: 'backfill',
    description: 'Backfills the input with the active option during keyboard navigation.',
    type: 'boolean',
  },
  {
    property: 'notFoundContent',
    description: 'Content shown when no options match.',
    type: 'JSX.Element',
  },
  {
    property: 'popupMatchSelectWidth',
    description: 'Controls popup width matching behavior.',
    type: 'boolean | number',
  },
  {
    property: 'popupRender',
    description: 'Customizes popup rendering.',
    type: '(originNode: JSX.Element) => JSX.Element',
  },
  {
    property: 'filterOption',
    description: 'Controls built-in filtering or supplies a custom filter.',
    type: 'boolean | ((inputValue: string, option: AutoCompleteOption) => boolean)',
  },
  { property: 'prefixCls', description: 'Custom CSS class prefix.', type: 'string' },
  { property: 'zIndex', description: 'Overrides popup z-index.', type: 'number' },
  {
    property: 'getPopupContainer',
    description: 'Returns the element used to mount the popup portal.',
    type: '(triggerNode?: HTMLElement) => HTMLElement',
  },
  {
    property: 'onChange',
    description: 'Called when input value changes.',
    type: '(value: string) => void',
  },
  {
    property: 'onSelect',
    description: 'Called when an option is selected.',
    type: '(value: string, option: AutoCompleteOption) => void',
  },
  {
    property: 'onOpenChange',
    description: 'Called when popup open state changes.',
    type: '(open: boolean) => void',
  },
  { property: 'onClear', description: 'Called after clearing the value.', type: '() => void' },
  {
    property: 'onInputKeyDown',
    description: 'Called for input keyboard events.',
    type: '(event: KeyboardEvent) => void',
  },
  {
    property: 'onPopupScroll',
    description: 'Called when the popup scrolls.',
    type: '(event: UIEvent) => void',
  },
]

const optionRows: ApiTableRow[] = [
  {
    property: 'label',
    description: 'Option display label. Falls back to value when omitted.',
    type: 'JSX.Element',
  },
  { property: 'value', description: 'Option value inserted into the input.', type: 'string' },
  { property: 'disabled', description: 'Disables selecting this option.', type: 'boolean' },
]

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

      <h2>API</h2>
      <h3>AutoComplete</h3>
      <ApiTable rows={autoCompleteRows} aria-label="AutoComplete API" />
      <h3>AutoCompleteOption</h3>
      <ApiTable rows={optionRows} aria-label="AutoComplete Option API" />
    </>
  )
}
