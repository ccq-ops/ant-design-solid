import { Button, Drawer, Space } from '@ant-design-solid/core'
import { For, createSignal } from 'solid-js'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const drawerRows: ApiTableRow[] = [
  { property: 'open', description: 'Controls whether the drawer is visible.', type: 'boolean' },
  { property: 'title', description: 'Drawer title content.', type: 'JSX.Element' },
  { property: 'placement', description: 'Side of the viewport the drawer slides from.', type: "'left' | 'right' | 'top' | 'bottom'", defaultValue: "'right'" },
  { property: 'width', description: 'Drawer width for left and right placements.', type: 'number | string' },
  { property: 'height', description: 'Drawer height for top and bottom placements.', type: 'number | string' },
  { property: 'closable', description: 'Shows the close button.', type: 'boolean', defaultValue: 'true' },
  { property: 'mask', description: 'Shows the background mask.', type: 'boolean', defaultValue: 'true' },
  { property: 'maskClosable', description: 'Allows closing by clicking the mask wrapper.', type: 'boolean', defaultValue: 'true' },
  { property: 'keyboard', description: 'Allows closing with Escape.', type: 'boolean', defaultValue: 'true' },
  { property: 'destroyOnClose', description: 'Unmounts children after close.', type: 'boolean', defaultValue: 'false' },
  { property: 'extra', description: 'Extra header action content.', type: 'JSX.Element' },
  { property: 'footer', description: 'Footer content.', type: 'JSX.Element' },
  { property: 'zIndex', description: 'Overrides drawer z-index.', type: 'number' },
  { property: 'onClose', description: 'Called when the drawer requests close.', type: '() => void' },
  { property: 'afterOpenChange', description: 'Called after open state changes.', type: '(open: boolean) => void' },
  { property: 'children', description: 'Drawer body content.', type: 'JSX.Element' },
]

export default function DrawerPage() {
  const [basicOpen, setBasicOpen] = createSignal(false)
  const [placementOpen, setPlacementOpen] = createSignal(false)
  const [placement, setPlacement] = createSignal<'left' | 'right' | 'top' | 'bottom'>('right')
  const [extraOpen, setExtraOpen] = createSignal(false)
  const [lockedOpen, setLockedOpen] = createSignal(false)
  const [destroyOpen, setDestroyOpen] = createSignal(false)
  const placements = ['left', 'right', 'top', 'bottom'] as const

  return (
    <>
      <h1>Drawer</h1>
      <p>Drawer renders a slide-out panel for contextual tasks without leaving the page.</p>

      <DemoBlock title="Basic" code={`<Drawer open={open()} title="Basic drawer">Content</Drawer>`}>
        <Button type="primary" onClick={() => setBasicOpen(true)}>
          Open drawer
        </Button>
        <Drawer open={basicOpen()} title="Basic drawer" onClose={() => setBasicOpen(false)}>
          Content displayed inside the drawer body.
        </Drawer>
      </DemoBlock>

      <DemoBlock title="Placement" code={`<Drawer placement="left" open={open()} />`}>
        <Space>
          <For each={placements}>
            {(item) => (
              <Button
                onClick={() => {
                  setPlacement(item)
                  setPlacementOpen(true)
                }}
              >
                {item}
              </Button>
            )}
          </For>
        </Space>
        <Drawer
          open={placementOpen()}
          title={`${placement()} drawer`}
          placement={placement()}
          onClose={() => setPlacementOpen(false)}
        >
          Placement controls which side of the viewport the drawer is anchored to.
        </Drawer>
      </DemoBlock>

      <DemoBlock
        title="Extra and footer"
        code={`<Drawer extra={<Button>Action</Button>} footer={<Button>Close</Button>} />`}
      >
        <Button type="primary" onClick={() => setExtraOpen(true)}>
          Open with actions
        </Button>
        <Drawer
          open={extraOpen()}
          title="Action drawer"
          extra={<Button size="small">Extra</Button>}
          footer={
            <Space>
              <Button onClick={() => setExtraOpen(false)}>Cancel</Button>
              <Button type="primary" onClick={() => setExtraOpen(false)}>
                Submit
              </Button>
            </Space>
          }
          onClose={() => setExtraOpen(false)}
        >
          Use extra and footer for actions related to the drawer content.
        </Drawer>
      </DemoBlock>

      <DemoBlock
        title="No mask close"
        code={`<Drawer maskClosable={false} keyboard={false} open={open()} />`}
      >
        <Button onClick={() => setLockedOpen(true)}>Open locked drawer</Button>
        <Drawer
          open={lockedOpen()}
          title="Close button only"
          maskClosable={false}
          keyboard={false}
          onClose={() => setLockedOpen(false)}
        >
          Clicking the mask or pressing Escape will not close this drawer.
        </Drawer>
      </DemoBlock>

      <DemoBlock title="Destroy on close" code={`<Drawer destroyOnClose open={open()} />`}>
        <Button onClick={() => setDestroyOpen(true)}>Open destroy drawer</Button>
        <Drawer
          open={destroyOpen()}
          title="Destroy on close"
          destroyOnClose
          onClose={() => setDestroyOpen(false)}
        >
          Children are removed from the DOM after the drawer closes.
        </Drawer>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable rows={drawerRows} aria-label="Drawer API" />
    </>
  )
}
