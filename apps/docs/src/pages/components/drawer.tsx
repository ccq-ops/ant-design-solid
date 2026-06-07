import { Button, Drawer, Space } from '@ant-design-solid/core'
import { For, createSignal } from 'solid-js'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const drawerRows: ApiTableRow[] = [
  {
    property: 'open',
    description: 'Controls whether the drawer is visible.',
    type: 'boolean',
    defaultValue: 'false',
  },
  { property: 'title', description: 'Drawer title content.', type: 'JSX.Element' },
  {
    property: 'placement',
    description: 'Side of the viewport the drawer slides from.',
    type: "'left' | 'right' | 'top' | 'bottom'",
    defaultValue: "'right'",
  },
  {
    property: 'size',
    description:
      'Preset or custom drawer size. Takes precedence over width and height when provided.',
    type: "'default' | 'large' | number | string",
    defaultValue: "'default'",
  },
  {
    property: 'width',
    description:
      'Drawer width for left and right placements. Kept for antd compatibility; prefer size for new code.',
    type: 'number | string',
    defaultValue: '378',
  },
  {
    property: 'height',
    description:
      'Drawer height for top and bottom placements. Kept for antd compatibility; prefer size for new code.',
    type: 'number | string',
    defaultValue: '378',
  },
  {
    property: 'closable',
    description:
      'Shows the close button. Object form customizes icon, disabled state, and start/end position.',
    type: "boolean | { closeIcon?: JSX.Element; disabled?: boolean; placement?: 'start' | 'end' }",
    defaultValue: 'true',
  },
  {
    property: 'mask',
    description:
      'Shows the background mask. Object form configures whether the mask is enabled, blurred, or closable.',
    type: 'boolean | { enabled?: boolean; blur?: boolean; closable?: boolean }',
    defaultValue: 'true',
  },
  {
    property: 'maskClosable',
    description: 'Allows clicking the mask to close the drawer. Prefer mask.closable in new code.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'keyboard',
    description: 'Allows closing with Escape.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'destroyOnClose',
    description: 'Unmounts children after close. Prefer destroyOnHidden in new code.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'destroyOnHidden',
    description: 'Unmounts children after the drawer is hidden.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'forceRender',
    description: 'Pre-renders Drawer content even when closed.',
    type: 'boolean',
    defaultValue: 'false',
  },
  { property: 'extra', description: 'Extra header action content.', type: 'JSX.Element' },
  { property: 'footer', description: 'Footer content.', type: 'JSX.Element' },
  { property: 'zIndex', description: 'Overrides drawer z-index.', type: 'number' },
  {
    property: 'getContainer',
    description:
      'Portal mount container. Pass false to render inline instead of portaling to document.body.',
    type: 'HTMLElement | () => HTMLElement | string | false',
    defaultValue: 'document.body',
  },
  {
    property: 'rootClassName',
    description: 'Class name for the root element that contains the mask and drawer panel.',
    type: 'string',
  },
  {
    property: 'rootStyle',
    description: 'Inline style for the root element that contains the mask and drawer panel.',
    type: 'JSX.CSSProperties',
  },
  {
    property: 'classNames',
    description:
      'Semantic class names for mask, wrapper, content, header, body, footer, and section.',
    type: 'Partial<Record<DrawerSemanticDOM, string>> | (info) => Partial<Record<DrawerSemanticDOM, string>>',
  },
  {
    property: 'styles',
    description:
      'Semantic inline styles for mask, wrapper, content, header, body, footer, and section.',
    type: 'Partial<Record<DrawerSemanticDOM, JSX.CSSProperties>> | (info) => Partial<Record<DrawerSemanticDOM, JSX.CSSProperties>>',
  },
  {
    property: 'loading',
    description: 'Shows a skeleton loading state in the drawer body instead of children.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'push',
    description:
      'Pushes the parent drawer when a nested drawer opens. Pass an object to customize distance.',
    type: 'boolean | { distance: number | string }',
    defaultValue: '{ distance: 180 }',
  },
  {
    property: 'drawerRender',
    description: 'Custom render wrapper for the drawer panel node.',
    type: '(node: JSX.Element) => JSX.Element',
  },
  {
    property: 'focusable',
    description: 'Focus trap and return-focus configuration.',
    type: '{ trap?: boolean; focusTriggerAfterClose?: boolean }',
  },
  {
    property: 'resizable',
    description: 'Enables drag resizing and optional resize lifecycle callbacks.',
    type: 'boolean | { onResizeStart?: () => void; onResize?: (size: number) => void; onResizeEnd?: () => void }',
  },
  { property: 'maxSize', description: 'Maximum width or height while resizing.', type: 'number' },
  {
    property: 'onClose',
    description: 'Called when the drawer requests close from the close button, mask, or keyboard.',
    type: '(event?: MouseEvent | KeyboardEvent) => void',
  },
  {
    property: 'afterOpenChange',
    description: 'Called after open state changes.',
    type: '(open: boolean) => void',
  },
  { property: 'children', description: 'Drawer body content.', type: 'JSX.Element' },
  { property: 'class', description: 'Solid class for the drawer panel.', type: 'string' },
  {
    property: 'className',
    description: 'React-style alias for the drawer panel class.',
    type: 'string',
  },
  {
    property: 'classList',
    description: 'Solid classList for conditional drawer panel classes.',
    type: 'Record<string, boolean | undefined>',
  },
  {
    property: 'style',
    description: 'Inline style for the drawer panel.',
    type: 'JSX.CSSProperties',
  },
  { property: 'aria-label', description: 'Accessible label for the dialog.', type: 'string' },
  {
    property: 'aria-labelledby',
    description: 'ID of an external element that labels the dialog.',
    type: 'string',
  },
]

const semanticRows: ApiTableRow[] = [
  { property: 'mask', description: 'Background mask element.', type: 'DrawerSemanticDOM' },
  { property: 'wrapper', description: 'Drawer panel dialog element.', type: 'DrawerSemanticDOM' },
  {
    property: 'content',
    description: 'Content container inside the panel.',
    type: 'DrawerSemanticDOM',
  },
  {
    property: 'header',
    description: 'Header area that contains title, extra, and close.',
    type: 'DrawerSemanticDOM',
  },
  { property: 'body', description: 'Scrollable body content area.', type: 'DrawerSemanticDOM' },
  { property: 'footer', description: 'Footer action area.', type: 'DrawerSemanticDOM' },
  {
    property: 'section',
    description: 'Alias applied to the drawer panel for antd-style semantic styling.',
    type: 'DrawerSemanticDOM',
  },
]

const closableRows: ApiTableRow[] = [
  { property: 'closeIcon', description: 'Custom close icon content.', type: 'JSX.Element' },
  {
    property: 'disabled',
    description: 'Disables the close button.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'placement',
    description: 'Places the close button before or after the title area.',
    type: "'start' | 'end'",
    defaultValue: "'end'",
  },
]

const maskRows: ApiTableRow[] = [
  {
    property: 'enabled',
    description: 'Whether to render the mask.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'blur',
    description: 'Adds backdrop blur to the mask.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'closable',
    description: 'Whether clicking the mask requests close.',
    type: 'boolean',
    defaultValue: 'true',
  },
]

const focusableRows: ApiTableRow[] = [
  {
    property: 'trap',
    description: 'Traps Tab focus inside the drawer.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'focusTriggerAfterClose',
    description: 'Returns focus to the previously focused trigger after close.',
    type: 'boolean',
    defaultValue: 'false',
  },
]

const resizableRows: ApiTableRow[] = [
  { property: 'onResizeStart', description: 'Called when dragging starts.', type: '() => void' },
  {
    property: 'onResize',
    description: 'Called while dragging with the current size.',
    type: '(size: number) => void',
  },
  { property: 'onResizeEnd', description: 'Called when dragging ends.', type: '() => void' },
]

export default function DrawerPage() {
  const [basicOpen, setBasicOpen] = createSignal(false)
  const [placementOpen, setPlacementOpen] = createSignal(false)
  const [placement, setPlacement] = createSignal<'left' | 'right' | 'top' | 'bottom'>('right')
  const [sizeOpen, setSizeOpen] = createSignal(false)
  const [customOpen, setCustomOpen] = createSignal(false)
  const [extraOpen, setExtraOpen] = createSignal(false)
  const [loadingOpen, setLoadingOpen] = createSignal(false)
  const [lockedOpen, setLockedOpen] = createSignal(false)
  const [destroyOpen, setDestroyOpen] = createSignal(false)
  const [inlineOpen, setInlineOpen] = createSignal(false)
  const [parentOpen, setParentOpen] = createSignal(false)
  const [childOpen, setChildOpen] = createSignal(false)
  const [renderOpen, setRenderOpen] = createSignal(false)
  const [resizeOpen, setResizeOpen] = createSignal(false)
  const [resizeValue, setResizeValue] = createSignal(378)
  const placements = ['left', 'right', 'top', 'bottom'] as const

  return (
    <>
      <h1>Drawer</h1>
      <p>
        Drawer renders a slide-out panel for contextual tasks without leaving the page. It supports
        antd-style placement, sizing, semantic styling, nested push behavior, loading, custom
        containers, focus handling, and resizing.
      </p>

      <DemoBlock title="Basic" code={`<Drawer open={open()} title="Basic drawer">Content</Drawer>`}>
        <Button type="primary" onClick={() => setBasicOpen(true)}>
          Open drawer
        </Button>
        <Drawer open={basicOpen()} title="Basic drawer" onClose={() => setBasicOpen(false)}>
          Content displayed inside the drawer body.
        </Drawer>
      </DemoBlock>

      <DemoBlock
        title="Placement"
        code={`const placements = ['left', 'right', 'top', 'bottom'] as const

<Drawer placement={placement()} open={open()} title={placement() + ' drawer'}>
  Placement controls which side of the viewport the drawer is anchored to.
</Drawer>`}
      >
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
          title={placement() + ' drawer'}
          placement={placement()}
          onClose={() => setPlacementOpen(false)}
        >
          Placement controls which side of the viewport the drawer is anchored to.
        </Drawer>
      </DemoBlock>

      <DemoBlock
        title="Preset and custom size"
        code={`<Drawer open={open()} title="Large drawer" size="large">
  Large preset drawers use 736px.
</Drawer>

<Drawer open={open()} placement="bottom" size="45%">
  Custom string and numeric sizes are also supported.
</Drawer>`}
      >
        <Button type="primary" onClick={() => setSizeOpen(true)}>
          Open large drawer
        </Button>
        <Drawer
          open={sizeOpen()}
          title="Large drawer"
          size="large"
          onClose={() => setSizeOpen(false)}
        >
          The <code>size</code> prop accepts <code>default</code>, <code>large</code>, numbers, and
          CSS length strings. It takes precedence over <code>width</code> and <code>height</code>.
        </Drawer>
      </DemoBlock>

      <DemoBlock
        title="Custom close button and mask"
        code={`<Drawer
  open={open()}
  title="Custom close"
  closable={{ closeIcon: 'Close', placement: 'start' }}
  mask={{ blur: true, closable: false }}
>
  The mask is blurred and clicking it will not close the drawer.
</Drawer>`}
      >
        <Button onClick={() => setCustomOpen(true)}>Open custom drawer</Button>
        <Drawer
          open={customOpen()}
          title="Custom close"
          closable={{ closeIcon: 'Close', placement: 'start' }}
          mask={{ blur: true, closable: false }}
          onClose={() => setCustomOpen(false)}
        >
          The close button is rendered at the start of the header. The mask is blurred and does not
          close the drawer when clicked.
        </Drawer>
      </DemoBlock>

      <DemoBlock
        title="Extra and footer"
        code={`<Drawer
  extra={<Button>Action</Button>}
  footer={<Button>Close</Button>}
>
  Use header and footer actions for drawer workflows.
</Drawer>`}
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
        title="Loading"
        code={`<Drawer open={open()} title="Loading drawer" loading>
  Loaded content will be hidden while loading is true.
</Drawer>`}
      >
        <Button onClick={() => setLoadingOpen(true)}>Open loading drawer</Button>
        <Drawer
          open={loadingOpen()}
          title="Loading drawer"
          loading
          onClose={() => setLoadingOpen(false)}
        >
          Loaded content will be hidden while loading is true.
        </Drawer>
      </DemoBlock>

      <DemoBlock
        title="Semantic styling"
        code={`<Drawer
  open={open()}
  rootClassName="demo-drawer-root"
  rootStyle={{ 'pointer-events': 'auto' }}
  classNames={{ header: 'demo-drawer-header', body: 'demo-drawer-body' }}
  styles={{
    header: { 'border-bottom': '2px solid #1677ff' },
    body: { background: 'var(--docs-surface-subtle)' },
  }}
>
  Style semantic parts without depending on internal DOM depth.
</Drawer>`}
      >
        <Button onClick={() => setRenderOpen(true)}>Open styled drawer</Button>
        <Drawer
          open={renderOpen()}
          title="Semantic styling"
          rootClassName="demo-drawer-root"
          rootStyle={{ 'pointer-events': 'auto' }}
          classNames={{ header: 'demo-drawer-header', body: 'demo-drawer-body' }}
          styles={{
            header: { 'border-bottom': '2px solid #1677ff' },
            body: { background: 'var(--docs-surface-subtle)' },
          }}
          onClose={() => setRenderOpen(false)}
        >
          Style semantic parts with <code>classNames</code> and <code>styles</code> instead of
          relying on internal DOM depth.
        </Drawer>
      </DemoBlock>

      <DemoBlock
        title="No mask close or keyboard close"
        code={`<Drawer maskClosable={false} keyboard={false} open={open()}>
  Clicking the mask or pressing Escape will not close this drawer.
</Drawer>`}
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

      <DemoBlock
        title="Destroy on hidden and force render"
        code={`<Drawer destroyOnHidden open={open()}>
  Children are removed from the DOM after the drawer closes.
</Drawer>

<Drawer forceRender open={false}>
  Content is pre-rendered while hidden.
</Drawer>`}
      >
        <Button onClick={() => setDestroyOpen(true)}>Open destroy drawer</Button>
        <Drawer
          open={destroyOpen()}
          title="Destroy on hidden"
          destroyOnHidden
          onClose={() => setDestroyOpen(false)}
        >
          Children are removed from the DOM after the drawer closes.
        </Drawer>
      </DemoBlock>

      <DemoBlock
        title="Render inline"
        code={`<section class="relative">
  <Drawer open={open()} getContainer={false}>
    This drawer is rendered inline instead of being portaled to document.body.
  </Drawer>
</section>`}
      >
        <Button onClick={() => setInlineOpen(true)}>Open inline drawer</Button>
        <div class="relative mt-3 min-h-20 rounded border border-dashed border-gray-300 p-3 text-sm text-gray-500">
          Inline host element
          <Drawer
            open={inlineOpen()}
            title="Inline drawer"
            getContainer={false}
            onClose={() => setInlineOpen(false)}
          >
            This drawer is rendered inline instead of being portaled to document.body.
          </Drawer>
        </div>
      </DemoBlock>

      <DemoBlock
        title="Nested drawer push"
        code={`<Drawer open={parentOpen()} title="Parent" push={{ distance: 120 }}>
  <Button onClick={() => setChildOpen(true)}>Open child</Button>
  <Drawer open={childOpen()} title="Child">
    Opening the child pushes the parent drawer.
  </Drawer>
</Drawer>`}
      >
        <Button type="primary" onClick={() => setParentOpen(true)}>
          Open parent drawer
        </Button>
        <Drawer
          open={parentOpen()}
          title="Parent drawer"
          push={{ distance: 120 }}
          onClose={() => {
            setParentOpen(false)
            setChildOpen(false)
          }}
        >
          <p>Open a nested drawer to push this parent drawer.</p>
          <Button type="primary" onClick={() => setChildOpen(true)}>
            Open child drawer
          </Button>
          <Drawer open={childOpen()} title="Child drawer" onClose={() => setChildOpen(false)}>
            Opening the child pushes the parent drawer by the configured distance.
          </Drawer>
        </Drawer>
      </DemoBlock>

      <DemoBlock
        title="Custom render and focus return"
        code={`<Drawer
  open={open()}
  focusable={{ focusTriggerAfterClose: true }}
  drawerRender={(node) => <div class="rounded-xl ring-4 ring-blue-100">{node}</div>}
>
  The panel is wrapped by drawerRender and focus returns to the trigger after close.
</Drawer>`}
      >
        <Button onClick={() => setRenderOpen(true)}>Open custom render drawer</Button>
        <Drawer
          open={renderOpen()}
          title="Custom render"
          focusable={{ focusTriggerAfterClose: true }}
          drawerRender={(node) => <div class="rounded-xl ring-4 ring-blue-100">{node}</div>}
          onClose={() => setRenderOpen(false)}
        >
          The drawer panel node is wrapped with <code>drawerRender</code>. Focus returns to the
          trigger when the drawer closes.
        </Drawer>
      </DemoBlock>

      <DemoBlock
        title="Resizable"
        code={`const [size, setSize] = createSignal(378)

<Drawer
  open={open()}
  resizable={{ onResize: setSize }}
  maxSize={720}
>
  Current size: {size()}px
</Drawer>`}
      >
        <Button onClick={() => setResizeOpen(true)}>Open resizable drawer</Button>
        <span class="ml-3 text-sm text-gray-500">Current size: {resizeValue()}px</span>
        <Drawer
          open={resizeOpen()}
          title="Resizable drawer"
          resizable={{ onResize: setResizeValue }}
          maxSize={720}
          onClose={() => setResizeOpen(false)}
        >
          Drag the handle on the drawer edge to resize it. Current size: {resizeValue()}px.
        </Drawer>
      </DemoBlock>

      <h2>API</h2>
      <ApiTable rows={drawerRows} aria-label="Drawer API" />

      <h2>Semantic DOM</h2>
      <p>
        Use these keys with <code>classNames</code> and <code>styles</code> to customize stable
        semantic sections of the drawer.
      </p>
      <ApiTable rows={semanticRows} aria-label="Drawer semantic DOM API" />

      <h2>ClosableConfig</h2>
      <ApiTable rows={closableRows} aria-label="Drawer closable config API" />

      <h2>MaskConfig</h2>
      <ApiTable rows={maskRows} aria-label="Drawer mask config API" />

      <h2>FocusableConfig</h2>
      <ApiTable rows={focusableRows} aria-label="Drawer focusable config API" />

      <h2>ResizableConfig</h2>
      <ApiTable rows={resizableRows} aria-label="Drawer resizable config API" />
    </>
  )
}
