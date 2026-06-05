import { createSignal } from 'solid-js'
import { Form, Mentions, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const mentionsRows: ApiTableRow[] = [
  { property: 'value', description: 'Controlled textarea value.', type: 'string' },
  {
    property: 'defaultValue',
    description: 'Initial textarea value for uncontrolled usage.',
    type: 'string',
  },
  { property: 'open', description: 'Controlled suggestions popup open state.', type: 'boolean' },
  {
    property: 'defaultOpen',
    description: 'Initial suggestions popup open state.',
    type: 'boolean',
    defaultValue: 'false',
  },
  { property: 'options', description: 'Suggestion options.', type: 'MentionsOption[]' },
  {
    property: 'prefix',
    description: 'Mention trigger prefix or prefixes.',
    type: 'string | string[]',
    defaultValue: "'@'",
  },
  {
    property: 'split',
    description: 'Text inserted after a selected mention.',
    type: 'string',
    defaultValue: "' '",
  },
  { property: 'placeholder', description: 'Textarea placeholder text.', type: 'string' },
  {
    property: 'disabled',
    description: 'Disables editing and suggestions.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'allowClear',
    description: 'Shows a clear affordance when the value is not empty.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'filterOption',
    description: 'Controls filtering or supplies a custom option filter.',
    type: 'boolean | ((inputValue: string, option: MentionsOption) => boolean)',
  },
  {
    property: 'validateSearch',
    description: 'Controls whether text after a prefix should open suggestions.',
    type: '(text: string, props: MentionsProps) => boolean',
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
    description: 'Called when textarea value changes.',
    type: '(value: string) => void',
  },
  {
    property: 'onSelect',
    description: 'Called when an option is selected.',
    type: '(option: MentionsOption, prefix: string) => void',
  },
  {
    property: 'onSearch',
    description: 'Called while searching after a prefix.',
    type: '(text: string, prefix: string) => void',
  },
  {
    property: 'onOpenChange',
    description: 'Called when popup open state changes.',
    type: '(open: boolean) => void',
  },
]

const optionRows: ApiTableRow[] = [
  {
    property: 'label',
    description: 'Option display label. Falls back to value when omitted.',
    type: 'JSX.Element',
  },
  { property: 'value', description: 'Mention value inserted after the prefix.', type: 'string' },
  { property: 'disabled', description: 'Disables selecting this option.', type: 'boolean' },
]

const peopleOptions = [
  { label: 'Alice', value: 'alice' },
  { label: 'Bob', value: 'bob' },
  { label: 'Charlie', value: 'charlie', disabled: true },
]

const topicOptions = [
  { label: 'Design', value: 'design' },
  { label: 'Solid', value: 'solid' },
  { label: 'Components', value: 'components' },
]

export default function MentionsPage() {
  const [value, setValue] = createSignal('Hello @alice ')

  return (
    <>
      <h1>Mentions</h1>
      <p>Mentions lets users select people or topics while typing in a textarea.</p>

      <DemoBlock
        title="Basic"
        code={`<Mentions placeholder="Mention someone" options={peopleOptions} />`}
      >
        <Mentions placeholder="Mention someone with @" options={peopleOptions} />
      </DemoBlock>

      <DemoBlock
        title="Default value and clear"
        code={`<Mentions allowClear defaultValue="Hello @alice " options={peopleOptions} />`}
      >
        <Mentions allowClear defaultValue="Hello @alice " options={peopleOptions} />
      </DemoBlock>

      <DemoBlock
        title="Controlled"
        code={`const [value, setValue] = createSignal('Hello @alice ')
<Mentions value={value()} onChange={setValue} options={peopleOptions} />`}
      >
        <Space direction="vertical" class="w-80">
          <Mentions value={value()} onChange={setValue} options={peopleOptions} />
          <span>Value: {value()}</span>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Multiple prefixes"
        code={`<Mentions prefix={["@", "#"]} options={topicOptions} />`}
      >
        <Space direction="vertical" class="w-80">
          <Mentions
            prefix={['@', '#']}
            placeholder="Type @ or # to open suggestions"
            options={topicOptions}
          />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Disabled and form"
        code={`<Form><Form.Item name="comment"><Mentions options={peopleOptions} /></Form.Item></Form>`}
      >
        <Space direction="vertical" class="w-80">
          <Mentions disabled defaultValue="Disabled @alice" options={peopleOptions} />
          <Form initialValues={{ comment: 'Hi @bob ' }}>
            <Form.Item name="comment">
              <Mentions options={peopleOptions} />
            </Form.Item>
          </Form>
        </Space>
      </DemoBlock>

      <h2>API</h2>
      <h3>Mentions</h3>
      <ApiTable rows={mentionsRows} aria-label="Mentions API" />
      <h3>MentionsOption</h3>
      <ApiTable rows={optionRows} aria-label="Mentions Option API" />
    </>
  )
}
