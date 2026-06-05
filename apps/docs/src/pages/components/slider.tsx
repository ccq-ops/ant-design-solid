import { createSignal } from 'solid-js'
import { Slider, Space } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const sliderRows: ApiTableRow[] = [
  { property: 'value', description: 'Controlled slider value. Tuple form is used for ranges.', type: 'number | [number, number]' },
  { property: 'defaultValue', description: 'Initial value for uncontrolled usage.', type: 'number | [number, number]' },
  { property: 'min', description: 'Minimum value.', type: 'number', defaultValue: '0' },
  { property: 'max', description: 'Maximum value.', type: 'number', defaultValue: '100' },
  { property: 'step', description: 'Value increment.', type: 'number', defaultValue: '1' },
  { property: 'disabled', description: 'Disables user interaction.', type: 'boolean', defaultValue: 'false' },
  { property: 'range', description: 'Enables two-handle range selection.', type: 'boolean', defaultValue: 'false' },
  { property: 'marks', description: 'Tick mark labels keyed by numeric value.', type: 'Record<number, SliderMark>' },
  { property: 'vertical', description: 'Renders the slider vertically.', type: 'boolean', defaultValue: 'false' },
  { property: 'tooltipVisible', description: 'Forces the value tooltip to be visible.', type: 'boolean' },
  { property: 'onChange', description: 'Called while value changes.', type: '(value: SliderValue) => void' },
  { property: 'onAfterChange', description: 'Called after a committed change.', type: '(value: SliderValue) => void' },
]

const sliderMarkRows: ApiTableRow[] = [
  { property: 'JSX.Element', description: 'Simple mark label.', type: 'SliderMark' },
  { property: 'label', description: 'Mark label content for object marks.', type: 'JSX.Element' },
  { property: 'style', description: 'Inline style applied to the mark label.', type: 'JSX.CSSProperties' },
]

export default function SliderPage() {
  const [value, setValue] = createSignal(30)

  return (
    <>
      <h1>Slider</h1>
      <DemoBlock title="Basic" code={`<Slider defaultValue={30} />`}>
        <Slider defaultValue={30} />
      </DemoBlock>
      <DemoBlock
        title="Controlled"
        code={`const [value, setValue] = createSignal(30)\n<Slider value={value()} onChange={(next) => typeof next === 'number' && setValue(next)} />`}
      >
        <Space direction="vertical" class="w-80">
          <Slider
            value={value()}
            onChange={(next) => {
              if (typeof next === 'number') setValue(next)
            }}
          />
          <span>Current value: {value()}</span>
        </Space>
      </DemoBlock>
      <DemoBlock title="Range" code={`<Slider range defaultValue={[20, 60]} />`}>
        <Slider range defaultValue={[20, 60]} />
      </DemoBlock>
      <DemoBlock
        title="Marks"
        code={`<Slider marks={{ 0: '0°C', 26: '26°C', 37: { label: '37°C', style: { color: '#1677ff' } }, 100: '100°C' }} defaultValue={26} tooltipVisible />`}
      >
        <Slider
          defaultValue={26}
          tooltipVisible
          marks={{
            0: '0°C',
            26: '26°C',
            37: { label: '37°C', style: { color: '#1677ff' } },
            100: '100°C',
          }}
        />
      </DemoBlock>
      <DemoBlock title="Vertical" code={`<Slider vertical defaultValue={40} />`}>
        <div class="h-[180px]">
          <Slider vertical defaultValue={40} />
        </div>
      </DemoBlock>
      <DemoBlock title="Disabled" code={`<Slider disabled defaultValue={30} />`}>
        <Space direction="vertical" class="w-80">
          <Slider disabled defaultValue={30} />
          <Slider disabled range defaultValue={[20, 60]} />
        </Space>
      </DemoBlock>

      <h2>API</h2>
      <h3>Slider</h3>
      <ApiTable rows={sliderRows} aria-label="Slider API" />
      <h3>SliderMark</h3>
      <ApiTable rows={sliderMarkRows} aria-label="Slider Mark API" />
    </>
  )
}
