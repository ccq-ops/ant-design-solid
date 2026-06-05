import { createSignal } from 'solid-js'
import { ColorPicker, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const colorPickerRows: ApiTableRow[] = [
  { property: 'value', description: 'Controlled color value.', type: 'ColorPickerValue' },
  {
    property: 'defaultValue',
    description: 'Initial color value for uncontrolled usage.',
    type: 'ColorPickerValue',
  },
  {
    property: 'onChange',
    description: 'Called when the color changes with Color object and hex string.',
    type: '(value: Color | undefined, hex: string) => void',
  },
  {
    property: 'onChangeComplete',
    description: 'Called after a committed color change.',
    type: '(value: Color | undefined) => void',
  },
  { property: 'open', description: 'Controlled popup open state.', type: 'boolean' },
  {
    property: 'defaultOpen',
    description: 'Initial popup open state.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'onOpenChange',
    description: 'Called when popup open state changes.',
    type: '(open: boolean) => void',
  },
  {
    property: 'disabled',
    description: 'Disables the picker.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'size',
    description: 'Picker size.',
    type: "'small' | 'middle' | 'large'",
    defaultValue: 'ConfigProvider size',
  },
  {
    property: 'placement',
    description: 'Popup placement.',
    type: 'DropdownPlacement',
    defaultValue: "'bottomLeft'",
  },
  {
    property: 'trigger',
    description: 'Interaction that opens the popup.',
    type: "'click' | 'hover'",
    defaultValue: "'click'",
  },
  {
    property: 'format',
    description: 'Controlled color input format.',
    type: "'hex' | 'rgb' | 'hsb'",
    defaultValue: "'hex'",
  },
  {
    property: 'defaultFormat',
    description: 'Initial color input format.',
    type: "'hex' | 'rgb' | 'hsb'",
    defaultValue: "'hex'",
  },
  {
    property: 'disabledAlpha',
    description: 'Disables alpha editing.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'allowClear',
    description: 'Shows a clear button.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'showText',
    description: 'Shows selected color text or custom text renderer.',
    type: 'boolean | ((color: Color | undefined) => JSX.Element)',
  },
  { property: 'presets', description: 'Preset color groups.', type: 'ColorPickerPreset[]' },
  {
    property: 'panelRender',
    description: 'Custom panel renderer.',
    type: '(panel: JSX.Element, extra: ColorPickerPanelRenderExtra) => JSX.Element',
  },
  { property: 'popupClass', description: 'Additional popup class.', type: 'string' },
  { property: 'popupStyle', description: 'Popup inline style.', type: 'JSX.CSSProperties' },
  { property: 'zIndex', description: 'Custom popup z-index.', type: 'number' },
  {
    property: 'getPopupContainer',
    description: 'Returns popup portal container.',
    type: '(triggerNode?: HTMLElement) => HTMLElement',
  },
]

const colorPickerPresetRows: ApiTableRow[] = [
  { property: 'label', description: 'Preset group label.', type: 'JSX.Element' },
  { property: 'colors', description: 'Preset color values.', type: 'string[]' },
]

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
      <h3>ColorPicker</h3>
      <ApiTable rows={colorPickerRows} aria-label="ColorPicker API" />
      <h3>ColorPickerPreset</h3>
      <ApiTable rows={colorPickerPresetRows} aria-label="ColorPicker Preset API" />
    </>
  )
}
