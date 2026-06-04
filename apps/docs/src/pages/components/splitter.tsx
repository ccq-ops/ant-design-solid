import { Splitter } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

const panelStyle = {
  display: 'flex',
  'align-items': 'center',
  'justify-content': 'center',
  height: '100%',
  background: '#f5f5f5',
}

export default function SplitterPage() {
  return (
    <>
      <h1>Splitter</h1>
      <p>Splitter separates content into resizable panels.</p>

      <DemoBlock
        title="Basic"
        code={`<Splitter><Splitter.Panel>Left</Splitter.Panel><Splitter.Panel>Right</Splitter.Panel></Splitter>`}
      >
        <Splitter style={{ height: '160px' }}>
          <Splitter.Panel defaultSize="40%" style={panelStyle}>
            Left
          </Splitter.Panel>
          <Splitter.Panel style={panelStyle}>Right</Splitter.Panel>
        </Splitter>
      </DemoBlock>

      <DemoBlock
        title="Vertical"
        code={`<Splitter layout="vertical"><Splitter.Panel>Top</Splitter.Panel><Splitter.Panel>Bottom</Splitter.Panel></Splitter>`}
      >
        <Splitter layout="vertical" style={{ height: '220px' }}>
          <Splitter.Panel defaultSize="45%" style={panelStyle}>
            Top
          </Splitter.Panel>
          <Splitter.Panel style={panelStyle}>Bottom</Splitter.Panel>
        </Splitter>
      </DemoBlock>

      <DemoBlock
        title="Min and max"
        code={`<Splitter><Splitter.Panel defaultSize={160} min={100} max={240}>Resizable</Splitter.Panel><Splitter.Panel>Flexible</Splitter.Panel></Splitter>`}
      >
        <Splitter style={{ height: '160px' }}>
          <Splitter.Panel defaultSize={160} min={100} max={240} style={panelStyle}>
            100px - 240px
          </Splitter.Panel>
          <Splitter.Panel style={panelStyle}>Flexible</Splitter.Panel>
        </Splitter>
      </DemoBlock>
    </>
  )
}
