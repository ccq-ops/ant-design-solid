import { Button, Space, Tooltip } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

export default function TooltipPage() {
  return (
    <>
      <h1>Tooltip</h1>
      <DemoBlock title="Hover" code={`<Tooltip title="Helpful text"><Button>Hover</Button></Tooltip>`}>
        <Tooltip title="Helpful text">
          <Button>Hover</Button>
        </Tooltip>
      </DemoBlock>
      <DemoBlock title="Triggers" code={`<Tooltip trigger="click" title="Clicked"><Button>Click</Button></Tooltip>`}>
        <Space wrap>
          <Tooltip trigger="click" title="Clicked">
            <Button>Click</Button>
          </Tooltip>
          <Tooltip trigger="focus" title="Focused">
            <Button>Focus</Button>
          </Tooltip>
        </Space>
      </DemoBlock>
      <DemoBlock title="Placement" code={`<Tooltip placement="right" title="Right"><Button>Right</Button></Tooltip>`}>
        <Space wrap>
          <Tooltip placement="top" title="Top">
            <Button>Top</Button>
          </Tooltip>
          <Tooltip placement="bottom" title="Bottom">
            <Button>Bottom</Button>
          </Tooltip>
          <Tooltip placement="left" title="Left">
            <Button>Left</Button>
          </Tooltip>
          <Tooltip placement="right" title="Right">
            <Button>Right</Button>
          </Tooltip>
        </Space>
      </DemoBlock>
    </>
  )
}
