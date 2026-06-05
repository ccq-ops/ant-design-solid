import { Form, Cascader, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const cascaderRows: ApiTableRow[] = [
  {
    property: 'options',
    description: 'Nested option tree rendered by the cascader.',
    type: 'CascaderOption[]',
  },
  {
    property: 'value',
    description: 'Controlled selected path values.',
    type: 'OptionValue[] | OptionValue[][]',
  },
  {
    property: 'defaultValue',
    description: 'Initial selected path values for uncontrolled usage.',
    type: 'OptionValue[] | OptionValue[][]',
  },
  { property: 'open', description: 'Controlled popup open state.', type: 'boolean' },
  {
    property: 'defaultOpen',
    description: 'Initial popup open state.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'placeholder',
    description: 'Placeholder shown when no path is selected.',
    type: 'JSX.Element',
  },
  {
    property: 'disabled',
    description: 'Disables opening and selection.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'allowClear',
    description: 'Shows a clear button when a value is selected.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'changeOnSelect',
    description: 'Allows selecting intermediate parent options.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'expandTrigger',
    description: 'Interaction used to expand child columns.',
    type: "'click' | 'hover'",
    defaultValue: "'click'",
  },
  {
    property: 'displayRender',
    description: 'Customizes selected path display.',
    type: '(labels: JSX.Element[], selectedOptions: CascaderOption[]) => JSX.Element',
  },
  { property: 'prefixCls', description: 'Custom CSS class prefix.', type: 'string' },
  { property: 'zIndex', description: 'Overrides popup z-index.', type: 'number' },
  {
    property: 'getPopupContainer',
    description: 'Returns the element used to mount the popup portal.',
    type: '(triggerNode?: HTMLElement) => HTMLElement',
  },

  {
    property: 'showSearch',
    description:
      'Enables path search or configures filtering, sorting, rendering, and search control.',
    type: 'boolean | CascaderShowSearch',
    defaultValue: 'false',
  },
  { property: 'searchValue', description: 'Controlled search text.', type: 'string' },
  {
    property: 'onSearch',
    description: 'Called when search input changes.',
    type: '(search: string) => void',
  },
  {
    property: 'loadData',
    description: 'Loads child options lazily for options with isLeaf set to false.',
    type: '(selectedOptions: CascaderOption[]) => void | Promise<void>',
  },
  {
    property: 'loadingIcon',
    description: 'Custom loading indicator for lazy options.',
    type: 'JSX.Element',
  },
  {
    property: 'multiple',
    description: 'Enables multiple path selection.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'showCheckedStrategy',
    description: 'Controls whether parent or child paths are shown in multiple mode.',
    type: 'Cascader.SHOW_PARENT | Cascader.SHOW_CHILD',
    defaultValue: 'Cascader.SHOW_PARENT',
  },
  {
    property: 'tagRender',
    description: 'Custom multiple tag renderer.',
    type: '(label: JSX.Element, onClose: () => void, value: OptionValue[]) => JSX.Element',
  },
  {
    property: 'removeIcon',
    description: 'Custom remove icon for multiple tags.',
    type: 'JSX.Element',
  },
  {
    property: 'maxTagCount',
    description: 'Maximum number of visible tags.',
    type: "number | 'responsive'",
  },
  {
    property: 'maxTagPlaceholder',
    description: 'Placeholder rendered for omitted tags.',
    type: 'JSX.Element | ((omittedValues: CascaderSelectedPath[]) => JSX.Element)',
  },
  { property: 'maxTagTextLength', description: 'Maximum tag label text length.', type: 'number' },
  {
    property: 'autoClearSearchValue',
    description: 'Clears search text after selecting in multiple search mode.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'size',
    description: 'Selector size.',
    type: "'large' | 'middle' | 'small'",
    defaultValue: "'middle'",
  },
  { property: 'status', description: 'Validation status style.', type: "'error' | 'warning'" },
  {
    property: 'variant',
    description: 'Selector visual variant.',
    type: "'outlined' | 'borderless' | 'filled' | 'underlined'",
    defaultValue: "'outlined'",
  },
  {
    property: 'prefix',
    description: 'Custom prefix content inside the selector.',
    type: 'JSX.Element',
  },
  {
    property: 'onChange',
    description: 'Called with selected values and selected option path.',
    type: '(value: OptionValue[], selectedOptions: CascaderOption[]) => void',
  },
  {
    property: 'onOpenChange',
    description: 'Called when popup open state changes.',
    type: '(open: boolean) => void',
  },
]

const cascaderOptionRows: ApiTableRow[] = [
  { property: 'label', description: 'Option display label.', type: 'JSX.Element' },
  { property: 'value', description: 'Option value.', type: 'string | number | boolean' },
  { property: 'disabled', description: 'Disables this option.', type: 'boolean' },
  {
    property: 'children',
    description: 'Child options rendered in the next column.',
    type: 'CascaderOption[]',
  },
  {
    property: 'isLeaf',
    description: 'Marks a lazy option as leaf or non-leaf when children are not loaded yet.',
    type: 'boolean',
  },
  { property: 'loading', description: 'Marks this option as loading.', type: 'boolean' },
]

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
        title="Search"
        code={`<Cascader showSearch placeholder="Search area" options={options} />`}
      >
        <Cascader showSearch placeholder="Search area" options={options} />
      </DemoBlock>

      <DemoBlock
        title="Lazy loading"
        code={`<Cascader options={[{ label: 'Lazy node', value: 'lazy', isLeaf: false }]} loadData={() => Promise.resolve()} loadingIcon="Loading" />`}
      >
        <Cascader
          options={[{ label: 'Lazy node', value: 'lazy', isLeaf: false }]}
          loadData={() => Promise.resolve()}
          loadingIcon="Loading"
        />
      </DemoBlock>

      <DemoBlock title="Multiple" code={`<Cascader multiple maxTagCount={1} options={options} />`}>
        <Cascader multiple maxTagCount={1} options={options} />
      </DemoBlock>

      <DemoBlock
        title="Visual props"
        code={`<Cascader size="large" status="error" variant="filled" prefix="Area" options={options} />`}
      >
        <Cascader size="large" status="error" variant="filled" prefix="Area" options={options} />
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

      <h2>API</h2>
      <h3>Cascader</h3>
      <ApiTable rows={cascaderRows} aria-label="Cascader API" />
      <h3>CascaderOption</h3>
      <ApiTable rows={cascaderOptionRows} aria-label="Cascader Option API" />
    </>
  )
}
