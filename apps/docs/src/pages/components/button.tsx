import { Button, Space } from '@ant-design-solid/core'
import { DownloadOutlined, PoweroffOutlined, SearchOutlined } from '@ant-design-solid/icons'
import { DemoBlock } from '../../components/demo-block'

const apiRows = [
  {
    property: 'autoInsertSpace',
    description: 'Automatically inserts a space between two Chinese characters.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'block',
    description: 'Makes the button fit the width of its parent.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'color',
    description: 'Sets the button color. Preset colors follow the antd color names.',
    type: `'default' | 'primary' | 'danger' | PresetColor`,
    defaultValue: 'derived from type',
  },
  {
    property: 'danger',
    description: 'Applies danger styling. Explicit color takes priority when both are set.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'disabled',
    description: 'Disables user interaction.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'ghost',
    description: 'Makes the button background transparent.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'href',
    description: 'Renders the button as an anchor link when provided.',
    type: 'string',
    defaultValue: '-',
  },
  {
    property: 'htmlType',
    description: 'Sets the native button type when href is not provided.',
    type: `'button' | 'submit' | 'reset'`,
    defaultValue: `'button'`,
  },
  {
    property: 'icon',
    description: 'Renders an icon next to the button content.',
    type: 'JSX.Element',
    defaultValue: '-',
  },
  {
    property: 'iconPlacement',
    description: 'Controls whether the icon appears before or after the content.',
    type: `'start' | 'end'`,
    defaultValue: `'start'`,
  },
  {
    property: 'iconPosition',
    description: 'Legacy name for iconPlacement. Prefer iconPlacement for new code.',
    type: `'start' | 'end'`,
    defaultValue: `'start'`,
  },
  {
    property: 'loading',
    description: 'Shows a loading icon and prevents clicks. Supports delay and custom icon.',
    type: `boolean | { delay?: number; icon?: JSX.Element }`,
    defaultValue: 'false',
  },
  {
    property: 'onClick',
    description: 'Called when the button is clicked and not disabled or loading.',
    type: '(event: MouseEvent) => void',
    defaultValue: '-',
  },
  {
    property: 'shape',
    description: 'Sets the button shape.',
    type: `'default' | 'circle' | 'round'`,
    defaultValue: `'default'`,
  },
  {
    property: 'size',
    description: 'Sets the button size.',
    type: `'small' | 'middle' | 'large'`,
    defaultValue: `'middle'`,
  },
  {
    property: 'target',
    description: 'Sets the anchor target when href is provided.',
    type: 'string',
    defaultValue: '-',
  },
  {
    property: 'type',
    description: 'Syntactic sugar for common button styles.',
    type: `'default' | 'primary' | 'dashed' | 'text' | 'link'`,
    defaultValue: `'default'`,
  },
  {
    property: 'variant',
    description: 'Sets the visual variant. Explicit variant takes priority over type mapping.',
    type: `'outlined' | 'dashed' | 'solid' | 'filled' | 'text' | 'link'`,
    defaultValue: 'derived from type',
  },
]

export default function ButtonPage() {
  return (
    <>
      <h1>Button</h1>
      <p>Buttons trigger actions, submit forms, or navigate to another page.</p>

      <DemoBlock
        title="Types"
        code={`<Space wrap>
  <Button type="primary">Primary</Button>
  <Button>Default</Button>
  <Button type="dashed">Dashed</Button>
  <Button type="text">Text</Button>
  <Button type="link">Link</Button>
</Space>`}
      >
        <Space wrap>
          <Button type="primary">Primary</Button>
          <Button>Default</Button>
          <Button type="dashed">Dashed</Button>
          <Button type="text">Text</Button>
          <Button type="link">Link</Button>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Color and variant"
        code={`<Space wrap>
  <Button color="primary" variant="solid">Primary</Button>
  <Button color="danger" variant="outlined">Danger</Button>
  <Button color="blue" variant="filled">Blue</Button>
  <Button color="green" variant="dashed">Green</Button>
  <Button color="purple" variant="text">Purple</Button>
  <Button color="orange" variant="link">Orange</Button>
</Space>`}
      >
        <Space wrap>
          <Button color="primary" variant="solid">
            Primary
          </Button>
          <Button color="danger" variant="outlined">
            Danger
          </Button>
          <Button color="blue" variant="filled">
            Blue
          </Button>
          <Button color="green" variant="dashed">
            Green
          </Button>
          <Button color="purple" variant="text">
            Purple
          </Button>
          <Button color="orange" variant="link">
            Orange
          </Button>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Sizes"
        code={`<Space align="center" wrap>
  <Button size="small">Small</Button>
  <Button>Middle</Button>
  <Button size="large">Large</Button>
</Space>`}
      >
        <Space align="center" wrap>
          <Button size="small">Small</Button>
          <Button>Middle</Button>
          <Button size="large">Large</Button>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Shapes"
        code={`<Space wrap>
  <Button>Default</Button>
  <Button shape="circle" icon={<SearchOutlined />} />
  <Button shape="round">Round</Button>
</Space>`}
      >
        <Space wrap>
          <Button>Default</Button>
          <Button shape="circle" icon={<SearchOutlined />} aria-label="Search" />
          <Button shape="round">Round</Button>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Icon placement"
        code={`<Space wrap>
  <Button icon={<SearchOutlined />}>Search</Button>
  <Button icon={<DownloadOutlined />} iconPlacement="end">Download</Button>
</Space>`}
      >
        <Space wrap>
          <Button icon={<SearchOutlined />}>Search</Button>
          <Button icon={<DownloadOutlined />} iconPlacement="end">
            Download
          </Button>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Loading"
        code={`<Space wrap>
  <Button loading>Loading</Button>
  <Button loading={{ delay: 500 }}>Delayed</Button>
  <Button loading={{ icon: <PoweroffOutlined /> }}>Custom icon</Button>
</Space>`}
      >
        <Space wrap>
          <Button loading>Loading</Button>
          <Button loading={{ delay: 500 }}>Delayed</Button>
          <Button loading={{ icon: <PoweroffOutlined /> }}>Custom icon</Button>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="States"
        code={`<Space direction="vertical" class="w-full">
  <Space wrap>
    <Button danger>Danger</Button>
    <Button ghost>Ghost</Button>
    <Button disabled>Disabled</Button>
  </Space>
  <Button block type="primary">Block button</Button>
</Space>`}
      >
        <Space direction="vertical" class="w-full">
          <Space wrap>
            <Button danger>Danger</Button>
            <Button ghost>Ghost</Button>
            <Button disabled>Disabled</Button>
          </Space>
          <Button block type="primary">
            Block button
          </Button>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Link button"
        code={`<Space wrap>
  <Button href="https://ant.design" target="_blank" type="link">Open Ant Design</Button>
  <Button href="#button-api" color="primary" variant="outlined">Jump to API</Button>
</Space>`}
      >
        <Space wrap>
          <Button href="https://ant.design" target="_blank" type="link">
            Open Ant Design
          </Button>
          <Button href="#button-api" color="primary" variant="outlined">
            Jump to API
          </Button>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Chinese auto spacing"
        code={`<Space wrap>
  <Button>按钮</Button>
  <Button autoInsertSpace={false}>按钮</Button>
</Space>`}
      >
        <Space wrap>
          <Button>按钮</Button>
          <Button autoInsertSpace={false}>按钮</Button>
        </Space>
      </DemoBlock>

      <h2 id="button-api">API</h2>
      <p>
        Button accepts native button attributes. When <code>href</code> is provided, it renders as
        an anchor-like button and <code>target</code> is applied to the link.
      </p>
      <div class="overflow-auto">
        <table class="w-full border-collapse text-left text-sm">
          <thead>
            <tr>
              <th class="border border-gray-200 bg-slate-50 px-3 py-2">Property</th>
              <th class="border border-gray-200 bg-slate-50 px-3 py-2">Description</th>
              <th class="border border-gray-200 bg-slate-50 px-3 py-2">Type</th>
              <th class="border border-gray-200 bg-slate-50 px-3 py-2">Default</th>
            </tr>
          </thead>
          <tbody>
            {apiRows.map((row) => (
              <tr>
                <td class="border border-gray-200 px-3 py-2 align-top">
                  <code>{row.property}</code>
                </td>
                <td class="border border-gray-200 px-3 py-2 align-top">{row.description}</td>
                <td class="border border-gray-200 px-3 py-2 align-top">
                  <code>{row.type}</code>
                </td>
                <td class="border border-gray-200 px-3 py-2 align-top">
                  <code>{row.defaultValue}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>PresetColor</h3>
      <p>
        <code>PresetColor</code> is one of{' '}
        <code>
          blue | purple | cyan | green | magenta | pink | red | orange | yellow | volcano | geekblue
          | lime | gold
        </code>
        .
      </p>
      <p>
        The semantic <code>classNames</code> and <code>styles</code> APIs are intentionally not part
        of this implementation.
      </p>
    </>
  )
}
