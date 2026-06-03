import { createSignal } from 'solid-js'
import { ColorPicker, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

export default function ColorPickerPage() {
  const [value, setValue] = createSignal('#1677ff')
  const [open, setOpen] = createSignal(false)

  return (
    <>
      <h1>ColorPicker</h1>
      <p>Provide color selection with presets, alpha, formats, and controlled state.</p>

      <DemoBlock title="Basic" code={`<ColorPicker defaultValue="#1677ff" />`}>
        <ColorPicker defaultValue="#1677ff" />
      </DemoBlock>

      <DemoBlock
        title="Controlled"
        code={`const [value, setValue] = createSignal('#1677ff')
<ColorPicker value={value()} showText onChange={(color) => setValue(color?.toHexString() ?? '')} />`}
      >
        <Space direction="vertical">
          <ColorPicker
            value={value()}
            showText
            onChange={(color) => setValue(color?.toHexString() ?? '')}
          />
          <span>Current value: {value()}</span>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Formats"
        code={`<ColorPicker defaultValue="rgba(22, 119, 255, 0.7)" defaultFormat="rgb" />
<ColorPicker defaultValue="#52c41a" format="hsb" />`}
      >
        <Space>
          <ColorPicker defaultValue="rgba(22, 119, 255, 0.7)" defaultFormat="rgb" />
          <ColorPicker defaultValue="#52c41a" format="hsb" />
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Disabled alpha"
        code={`<ColorPicker disabledAlpha defaultValue="#52c41a" />`}
      >
        <ColorPicker disabledAlpha defaultValue="#52c41a" />
      </DemoBlock>

      <DemoBlock
        title="Presets"
        code={`<ColorPicker presets={[{ label: 'Recommended', colors: ['#1677ff', '#52c41a', '#faad14', '#ff4d4f'] }]} />`}
      >
        <ColorPicker
          presets={[{ label: 'Recommended', colors: ['#1677ff', '#52c41a', '#faad14', '#ff4d4f'] }]}
        />
      </DemoBlock>

      <DemoBlock
        title="Show text"
        code={`<ColorPicker defaultValue="#722ed1" showText={(color) => <span>{color?.toHexString()}</span>} />`}
      >
        <ColorPicker
          defaultValue="#722ed1"
          showText={(color) => <span>{color?.toHexString()}</span>}
        />
      </DemoBlock>

      <DemoBlock
        title="Allow clear"
        code={`<ColorPicker allowClear defaultValue="#1677ff" showText />`}
      >
        <ColorPicker allowClear defaultValue="#1677ff" showText />
      </DemoBlock>

      <DemoBlock
        title="Controlled open"
        code={`const [open, setOpen] = createSignal(false)
<ColorPicker open={open()} onOpenChange={setOpen} defaultValue="#1677ff" />`}
      >
        <Space>
          <ColorPicker open={open()} onOpenChange={setOpen} defaultValue="#1677ff" />
          <span>Open: {String(open())}</span>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Custom panel render"
        code={`<ColorPicker panelRender={(panel) => <div style={{ border: '1px solid #1677ff', padding: '8px' }}>{panel}</div>} />`}
      >
        <ColorPicker
          panelRender={(panel) => (
            <div style={{ border: '1px solid #1677ff', padding: '8px', 'border-radius': '8px' }}>
              {panel}
            </div>
          )}
        />
      </DemoBlock>

      <DemoBlock
        title="Hover trigger"
        code={`<ColorPicker trigger="hover" defaultValue="#1677ff" />`}
      >
        <ColorPicker trigger="hover" defaultValue="#1677ff" />
      </DemoBlock>

      <h2>API</h2>
      <ul>
        <li>
          Use <code>value</code>, <code>defaultValue</code>, and <code>onChange</code> to manage the
          selected color.
        </li>
        <li>
          Use <code>format</code> or <code>defaultFormat</code> to choose HEX, RGB, or HSB inputs.
        </li>
        <li>
          Use <code>presets</code>, <code>allowClear</code>, <code>showText</code>, and{' '}
          <code>panelRender</code> to customize the picker.
        </li>
      </ul>
    </>
  )
}
