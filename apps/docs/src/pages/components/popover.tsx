import { Button, Popover, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

export default function PopoverPage() {
  return (
    <>
      <h1>Popover</h1>
      <p>Popover displays rich floating content around a trigger element.</p>

      <DemoBlock
        title="Basic"
        code={`<Popover title="Title" content="Helpful content"><Button>Hover me</Button></Popover>`}
      >
        <Popover title="Title" content="Helpful content">
          <Button>Hover me</Button>
        </Popover>
      </DemoBlock>

      <DemoBlock
        title="Trigger"
        code={`<Popover trigger="click" content="Clicked content"><Button>Click</Button></Popover>`}
      >
        <Space wrap>
          <Popover trigger="click" title="Click" content="Clicked content">
            <Button>Click</Button>
          </Popover>
          <Popover trigger="focus" title="Focus" content="Focused content">
            <Button>Focus</Button>
          </Popover>
        </Space>
      </DemoBlock>

      <DemoBlock
        title="Placement"
        code={`<Popover placement="right" title="Right" content="Placement demo"><Button>Right</Button></Popover>`}
      >
        <Space wrap>
          <Popover placement="top" content="Top content">
            <Button>Top</Button>
          </Popover>
          <Popover placement="bottom" content="Bottom content">
            <Button>Bottom</Button>
          </Popover>
          <Popover placement="left" content="Left content">
            <Button>Left</Button>
          </Popover>
          <Popover placement="right" content="Right content">
            <Button>Right</Button>
          </Popover>
        </Space>
      </DemoBlock>
    </>
  )
}
