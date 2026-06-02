import { createSignal } from 'solid-js'
import { Slider, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

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
        <Space direction="vertical" style={{ width: '320px' }}>
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
        <div style={{ height: '180px' }}>
          <Slider vertical defaultValue={40} />
        </div>
      </DemoBlock>
      <DemoBlock title="Disabled" code={`<Slider disabled defaultValue={30} />`}>
        <Space direction="vertical" style={{ width: '320px' }}>
          <Slider disabled defaultValue={30} />
          <Slider disabled range defaultValue={[20, 60]} />
        </Space>
      </DemoBlock>
    </>
  )
}
