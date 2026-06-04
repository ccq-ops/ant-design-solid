import { Button, Dropdown, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../components/demo-block'

const items = [
  { key: 'edit', label: 'Edit' },
  { key: 'copy', label: 'Copy' },
  { key: 'disabled', label: 'Disabled', disabled: true },
  { key: 'divider', type: 'divider' as const },
  { key: 'delete', label: 'Delete' },
]

export default function DropdownPage() {
  return (
    <>
      <h1>Dropdown</h1>
      <DemoBlock
        title="Click"
        code={`<Dropdown menu={{ items }}><Button>Actions</Button></Dropdown>`}
      >
        <Dropdown menu={{ items, onClick: (info) => console.log(info.key) }}>
          <Button>Actions</Button>
        </Dropdown>
      </DemoBlock>
      <DemoBlock
        title="Hover"
        code={`<Dropdown trigger="hover" menu={{ items }}><Button>Hover</Button></Dropdown>`}
      >
        <Dropdown trigger="hover" menu={{ items }}>
          <Button>Hover</Button>
        </Dropdown>
      </DemoBlock>
      <DemoBlock
        title="Placement"
        code={`<Dropdown placement="topRight" menu={{ items }}><Button>Top right</Button></Dropdown>`}
      >
        <Space wrap>
          <Dropdown placement="bottomLeft" menu={{ items }}>
            <Button>Bottom left</Button>
          </Dropdown>
          <Dropdown placement="bottomRight" menu={{ items }}>
            <Button>Bottom right</Button>
          </Dropdown>
          <Dropdown placement="topLeft" menu={{ items }}>
            <Button>Top left</Button>
          </Dropdown>
          <Dropdown placement="topRight" menu={{ items }}>
            <Button>Top right</Button>
          </Dropdown>
        </Space>
      </DemoBlock>
    </>
  )
}
