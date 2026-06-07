import { createSignal } from 'solid-js'
import { Button, Modal, Space, message } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const modalRows: ApiTableRow[] = [
  {
    property: 'open',
    description: 'Controls whether the modal is visible.',
    type: 'boolean',
    defaultValue: 'false',
  },
  { property: 'title', description: 'Modal title content.', type: 'JSX.Element' },
  {
    property: 'footer',
    description:
      'Custom footer content. Set to null to hide the footer, or use a render function to wrap the default buttons.',
    type: 'JSX.Element | ((originNode, extra) => JSX.Element) | null',
    defaultValue: 'OK and Cancel buttons',
  },
  {
    property: 'okText',
    description: 'Text for the default OK button.',
    type: 'JSX.Element',
    defaultValue: "'OK'",
  },
  {
    property: 'cancelText',
    description: 'Text for the default Cancel button.',
    type: 'JSX.Element',
    defaultValue: "'Cancel'",
  },
  {
    property: 'confirmLoading',
    description: 'Shows loading state on the default OK button.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'closable',
    description: 'Shows or configures the close button in the top corner.',
    type: 'boolean | ModalClosableConfig',
    defaultValue: 'true',
  },
  {
    property: 'closeIcon',
    description: 'Custom close icon.',
    type: 'JSX.Element',
    defaultValue: '<CloseOutlined />',
  },
  {
    property: 'mask',
    description: 'Shows or configures the background mask.',
    type: 'boolean | ModalMaskConfig',
    defaultValue: 'true',
  },
  {
    property: 'maskClosable',
    description:
      'Closes the modal when clicking the wrapper outside the dialog. Ignored when mask.closable is provided.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'keyboard',
    description: 'Closes the top modal when pressing Escape.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'centered',
    description: 'Vertically centers the modal dialog.',
    type: 'boolean',
    defaultValue: 'false',
  },
  { property: 'width', description: 'Modal width.', type: 'number | string', defaultValue: '520' },
  { property: 'zIndex', description: 'Overrides modal z-index.', type: 'number' },
  {
    property: 'okType',
    description: 'Button type for the default OK button.',
    type: 'ButtonType',
    defaultValue: "'primary'",
  },
  {
    property: 'okButtonProps',
    description: 'Props for the default OK button.',
    type: 'ButtonProps',
  },
  {
    property: 'cancelButtonProps',
    description: 'Props for the default Cancel button.',
    type: 'ButtonProps',
  },
  { property: 'className', description: 'Class name for the modal dialog.', type: 'string' },
  { property: 'wrapClassName', description: 'Class name for the modal wrapper.', type: 'string' },
  { property: 'classNames', description: 'Semantic DOM class names.', type: 'ModalClassNames' },
  { property: 'styles', description: 'Semantic DOM inline styles.', type: 'ModalStyles' },
  {
    property: 'destroyOnHidden',
    description: 'Unmount children when the modal is hidden.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'forceRender',
    description: 'Render modal content before it is opened.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'getContainer',
    description: 'Custom mount node, selector, or false for inline rendering.',
    type: 'HTMLElement | () => HTMLElement | string | false',
    defaultValue: 'document.body',
  },
  {
    property: 'modalRender',
    description: 'Custom render wrapper for the modal dialog node.',
    type: '(node: JSX.Element) => JSX.Element',
  },
  {
    property: 'loading',
    description: 'Shows a loading body placeholder.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'onOk',
    description: 'Called when the default OK button is clicked.',
    type: '() => void | Promise<void>',
  },
  {
    property: 'onCancel',
    description: 'Called when the modal requests to close.',
    type: '() => void',
  },
  {
    property: 'afterClose',
    description: 'Called after the modal changes from open to closed.',
    type: '() => void',
  },
  {
    property: 'afterOpenChange',
    description: 'Called when the open state changes.',
    type: '(open: boolean) => void',
  },
]

const modalFuncRows: ApiTableRow[] = [
  {
    property: 'type',
    description: 'Semantic confirm dialog type.',
    type: "'info' | 'success' | 'error' | 'warning' | 'confirm'",
  },
  { property: 'title', description: 'Dialog title.', type: 'JSX.Element' },
  { property: 'content', description: 'Dialog body content.', type: 'JSX.Element' },
  { property: 'okText', description: 'OK button text.', type: 'JSX.Element', defaultValue: "'OK'" },
  {
    property: 'cancelText',
    description: 'Cancel button text.',
    type: 'JSX.Element',
    defaultValue: "'Cancel'",
  },
  {
    property: 'closable',
    description: 'Shows or configures a close button.',
    type: 'boolean | ModalClosableConfig',
    defaultValue: 'false',
  },
  { property: 'closeIcon', description: 'Custom close icon.', type: 'JSX.Element' },
  {
    property: 'mask',
    description: 'Shows or configures the background mask.',
    type: 'boolean | ModalMaskConfig',
    defaultValue: 'true',
  },
  {
    property: 'maskClosable',
    description: 'Allows closing by clicking outside.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'keyboard',
    description: 'Allows closing with Escape.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'centered',
    description: 'Vertically centers the dialog.',
    type: 'boolean',
    defaultValue: 'false',
  },
  { property: 'width', description: 'Dialog width.', type: 'number | string', defaultValue: '416' },
  { property: 'zIndex', description: 'Overrides modal z-index.', type: 'number' },
  { property: 'style', description: 'Inline style for the modal root.', type: 'JSX.CSSProperties' },
  { property: 'className', description: 'Class name for the modal dialog.', type: 'string' },
  { property: 'wrapClassName', description: 'Class name for the modal wrapper.', type: 'string' },
  { property: 'classNames', description: 'Semantic DOM class names.', type: 'ModalClassNames' },
  { property: 'styles', description: 'Semantic DOM inline styles.', type: 'ModalStyles' },
  {
    property: 'okType',
    description: 'Button type for the OK button.',
    type: 'ButtonType',
    defaultValue: "'primary'",
  },
  { property: 'okButtonProps', description: 'Props for the OK button.', type: 'ButtonProps' },
  {
    property: 'cancelButtonProps',
    description: 'Props for the Cancel button.',
    type: 'ButtonProps',
  },
  {
    property: 'footer',
    description: 'Custom footer content.',
    type: 'JSX.Element | ((originNode, extra) => JSX.Element) | null',
  },
  { property: 'icon', description: 'Custom confirm icon.', type: 'JSX.Element' },
  {
    property: 'afterClose',
    description: 'Called after the dialog is destroyed.',
    type: '() => void',
  },
  {
    property: 'getContainer',
    description: 'Custom mount node, selector, or false for inline rendering.',
    type: 'HTMLElement | () => HTMLElement | string | false',
  },
  {
    property: 'modalRender',
    description: 'Custom render wrapper for the dialog node.',
    type: '(node: JSX.Element) => JSX.Element',
  },
  {
    property: 'destroyOnHidden',
    description: 'Unmount children when hidden.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'forceRender',
    description: 'Render dialog content before it opens.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'onOk',
    description: 'Called when OK is clicked. Receives a close function for manual closing.',
    type: '(close?: () => void) => void | Promise<void>',
  },
  {
    property: 'onCancel',
    description: 'Called when Cancel is clicked. Receives a close function for manual closing.',
    type: '(close?: () => void) => void | Promise<void>',
  },
]

const modalMaskRows: ApiTableRow[] = [
  {
    property: 'enabled',
    description: 'Whether to render the mask element.',
    type: 'boolean',
    defaultValue: 'true',
  },
  {
    property: 'blur',
    description: 'Adds a backdrop blur effect to the mask.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'closable',
    description: 'Whether wrapper clicks close the modal. Takes precedence over maskClosable.',
    type: 'boolean',
  },
]

const modalClosableRows: ApiTableRow[] = [
  {
    property: 'closeIcon',
    description: 'Custom icon rendered inside the close button.',
    type: 'JSX.Element',
  },
  {
    property: 'disabled',
    description: 'Disables the close button action.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'onClose',
    description: 'Called when the close button is clicked.',
    type: '() => void',
  },
  {
    property: 'afterClose',
    description: 'Called after the modal changes from open to closed.',
    type: '() => void',
  },
]

const semanticRows: ApiTableRow[] = [
  { property: 'root', description: 'Root modal layer.', type: 'string | JSX.CSSProperties' },
  { property: 'mask', description: 'Background mask.', type: 'string | JSX.CSSProperties' },
  {
    property: 'wrap',
    description: 'Wrapper that handles outside clicks and centering.',
    type: 'string | JSX.CSSProperties',
  },
  { property: 'modal', description: 'Dialog element.', type: 'string | JSX.CSSProperties' },
  { property: 'content', description: 'Dialog content shell.', type: 'string | JSX.CSSProperties' },
  { property: 'header', description: 'Header container.', type: 'string | JSX.CSSProperties' },
  { property: 'title', description: 'Title element.', type: 'string | JSX.CSSProperties' },
  { property: 'body', description: 'Body container.', type: 'string | JSX.CSSProperties' },
  { property: 'footer', description: 'Footer container.', type: 'string | JSX.CSSProperties' },
  { property: 'close', description: 'Close button.', type: 'string | JSX.CSSProperties' },
]

const footerRenderRows: ApiTableRow[] = [
  { property: 'originNode', description: 'The default footer node.', type: 'JSX.Element' },
  {
    property: 'extra.OkBtn',
    description: 'Default OK button component.',
    type: '() => JSX.Element',
  },
  {
    property: 'extra.CancelBtn',
    description: 'Default Cancel button component.',
    type: '() => JSX.Element',
  },
]

const modalReturnRows: ApiTableRow[] = [
  {
    property: 'destroy',
    description: 'Destroys the current static modal instance.',
    type: '() => void',
  },
  {
    property: 'update',
    description: 'Updates the current static modal config. Supports object or function form.',
    type: '(config | (prevConfig) => config) => void',
  },
]

const staticRows: ApiTableRow[] = [
  {
    property: 'Modal.confirm',
    description: 'Opens a confirmation dialog.',
    type: '(config: ModalFuncProps) => ModalFuncReturn',
  },
  {
    property: 'Modal.info',
    description: 'Opens an informational dialog.',
    type: '(config: ModalFuncProps) => ModalFuncReturn',
  },
  {
    property: 'Modal.success',
    description: 'Opens a success dialog.',
    type: '(config: ModalFuncProps) => ModalFuncReturn',
  },
  {
    property: 'Modal.error',
    description: 'Opens an error dialog.',
    type: '(config: ModalFuncProps) => ModalFuncReturn',
  },
  {
    property: 'Modal.warning',
    description: 'Opens a warning dialog.',
    type: '(config: ModalFuncProps) => ModalFuncReturn',
  },
  {
    property: 'Modal.destroyAll',
    description: 'Destroys all static modal instances.',
    type: '() => void',
  },
]

export default function ModalPage() {
  const [basicOpen, setBasicOpen] = createSignal(false)
  const [footerOpen, setFooterOpen] = createSignal(false)
  const [loadingOpen, setLoadingOpen] = createSignal(false)
  const [loading, setLoading] = createSignal(false)
  const [buttonsOpen, setButtonsOpen] = createSignal(false)
  const [maskOpen, setMaskOpen] = createSignal(false)
  const [containerOpen, setContainerOpen] = createSignal(false)
  const [inlineOpen, setInlineOpen] = createSignal(false)
  const [semanticOpen, setSemanticOpen] = createSignal(false)
  const [renderOpen, setRenderOpen] = createSignal(false)
  const [destroyOpen, setDestroyOpen] = createSignal(false)
  const [forceOpen, setForceOpen] = createSignal(false)
  let containerRef!: HTMLDivElement

  function handleLoadingOk() {
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setLoadingOpen(false)
      message.success('Saved')
    }, 800)
  }

  function openAdvancedConfirm() {
    const modal = Modal.confirm({
      title: 'Archive project?',
      content: 'You can restore it from the archive later.',
      icon: <span style={{ color: '#faad14' }}>!</span>,
      okText: 'Archive',
      okButtonProps: { danger: true },
      cancelButtonProps: { type: 'text' },
      afterClose: () => message.info('Confirm closed'),
      onOk: (close) => {
        message.success('Archived')
        close?.()
      },
    })

    window.setTimeout(() => {
      modal.update((prev) => ({ title: `${prev.title} (updated)` }))
    }, 600)
  }

  return (
    <>
      <h1>Modal</h1>
      <p>Modal displays important content in a focused dialog above the page.</p>

      <DemoBlock
        title="Basic"
        code={`<Modal open={open()} title="Basic modal" onCancel={() => setOpen(false)}>Content</Modal>`}
      >
        <Button type="primary" onClick={() => setBasicOpen(true)}>
          Open modal
        </Button>
        <Modal
          open={basicOpen()}
          title="Basic modal"
          onOk={() => {
            setBasicOpen(false)
          }}
          onCancel={() => {
            setBasicOpen(false)
          }}
        >
          Modal content stays mounted in a portal while open.
        </Modal>
      </DemoBlock>

      <DemoBlock title="Custom footer" code={`<Modal footer={<Button>Custom action</Button>} />`}>
        <Button onClick={() => setFooterOpen(true)}>Open custom footer</Button>
        <Modal
          open={footerOpen()}
          title="Custom footer"
          footer={
            <Space>
              <Button onClick={() => setFooterOpen(false)}>Close</Button>
              <Button type="primary" onClick={() => setFooterOpen(false)}>
                Apply
              </Button>
            </Space>
          }
          onCancel={() => {
            setFooterOpen(false)
          }}
        >
          Replace the default footer with any Solid content.
        </Modal>
      </DemoBlock>

      <DemoBlock
        title="Footer render function"
        code={`<Modal footer={(originNode, { OkBtn, CancelBtn }) => (
  <Space>
    <Button type="text">Help</Button>
    <CancelBtn />
    <OkBtn />
  </Space>
)} />`}
      >
        <Button onClick={() => setButtonsOpen(true)}>Open custom buttons</Button>
        <Modal
          open={buttonsOpen()}
          title="Custom buttons"
          okText="Publish"
          cancelText="Back"
          okType="default"
          okButtonProps={{ danger: true }}
          cancelButtonProps={{ type: 'text' }}
          footer={(_originNode, { OkBtn, CancelBtn }) => (
            <Space>
              <Button type="link" onClick={() => message.info('Open help')}>
                Help
              </Button>
              <CancelBtn />
              <OkBtn />
            </Space>
          )}
          onOk={() => {
            message.success('Published')
            setButtonsOpen(false)
          }}
          onCancel={() => {
            setButtonsOpen(false)
          }}
        >
          Use button props and footer render functions to customize the default actions.
        </Modal>
      </DemoBlock>

      <DemoBlock
        title="Confirm loading"
        code={`<Modal confirmLoading={loading()} onOk={save}>Saving content</Modal>`}
      >
        <Button onClick={() => setLoadingOpen(true)}>Open async modal</Button>
        <Modal
          open={loadingOpen()}
          title="Confirm loading"
          confirmLoading={loading()}
          onOk={handleLoadingOk}
          onCancel={() => {
            setLoadingOpen(false)
          }}
        >
          Click OK to simulate an async operation.
        </Modal>
      </DemoBlock>

      <DemoBlock
        title="Custom close and mask"
        code={`<Modal
  mask={{ blur: true, closable: false }}
  closable={{ closeIcon: <span>Close</span> }}
/>`}
      >
        <Button onClick={() => setMaskOpen(true)}>Open locked mask modal</Button>
        <Modal
          open={maskOpen()}
          title="Custom close and mask"
          mask={{ blur: true, closable: false }}
          closable={{ closeIcon: <span>Close</span>, onClose: () => message.info('Close clicked') }}
          onCancel={() => {
            setMaskOpen(false)
          }}
        >
          The blurred mask is visible, but clicking outside does not close this modal.
        </Modal>
      </DemoBlock>

      <DemoBlock
        title="Custom container"
        code={`<Modal getContainer={() => containerRef}>Mounted inside a custom node</Modal>
<Modal getContainer={false}>Rendered inline</Modal>`}
      >
        <Space wrap>
          <Button onClick={() => setContainerOpen(true)}>Mount into container</Button>
          <Button onClick={() => setInlineOpen(true)}>Render inline</Button>
        </Space>
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            margin: '12px 0',
            padding: '12px',
            border: '1px dashed #d9d9d9',
            'min-height': '48px',
          }}
        >
          Custom container target
        </div>
        <Modal
          open={containerOpen()}
          title="Custom container"
          getContainer={() => containerRef}
          onOk={() => {
            setContainerOpen(false)
          }}
          onCancel={() => {
            setContainerOpen(false)
          }}
        >
          This modal portal is mounted into the dashed container.
        </Modal>
        <div style={{ position: 'relative' }}>
          <Modal
            open={inlineOpen()}
            title="Inline modal"
            getContainer={false}
            onOk={() => {
              setInlineOpen(false)
            }}
            onCancel={() => {
              setInlineOpen(false)
            }}
          >
            Setting getContainer to false renders the modal inline.
          </Modal>
        </div>
      </DemoBlock>

      <DemoBlock
        title="Semantic classNames and styles"
        code={`<Modal
  className="demo-modal"
  wrapClassName="demo-wrap"
  classNames={{ body: 'demo-body' }}
  styles={{ body: { background: '#f6ffed' } }}
/>`}
      >
        <Button onClick={() => setSemanticOpen(true)}>Open styled modal</Button>
        <Modal
          open={semanticOpen()}
          title="Semantic styles"
          className="demo-modal"
          wrapClassName="demo-wrap"
          classNames={{ body: 'demo-body', footer: 'demo-footer' }}
          styles={{ body: { background: '#f6ffed' }, title: { color: '#1677ff' } }}
          onOk={() => {
            setSemanticOpen(false)
          }}
          onCancel={() => {
            setSemanticOpen(false)
          }}
        >
          Use semantic keys to customize stable parts of the Modal DOM.
        </Modal>
      </DemoBlock>

      <DemoBlock
        title="Render control"
        code={`<Modal forceRender afterOpenChange={console.log} />
<Modal destroyOnHidden />
<Modal modalRender={(node) => <section>{node}</section>} />`}
      >
        <Space wrap>
          <Button onClick={() => setForceOpen(true)}>Force rendered modal</Button>
          <Button onClick={() => setDestroyOpen(true)}>Destroy on hidden</Button>
          <Button onClick={() => setRenderOpen(true)}>Wrapped render</Button>
        </Space>
        <Modal
          open={forceOpen()}
          forceRender
          title="Force render"
          afterOpenChange={(open) => message.info(`Force modal open: ${open}`)}
          onOk={() => {
            setForceOpen(false)
          }}
          onCancel={() => {
            setForceOpen(false)
          }}
        >
          This modal content is rendered before first open.
        </Modal>
        <Modal
          open={destroyOpen()}
          destroyOnHidden
          title="Destroy on hidden"
          onOk={() => {
            setDestroyOpen(false)
          }}
          onCancel={() => {
            setDestroyOpen(false)
          }}
        >
          Content is unmounted after the modal is hidden.
        </Modal>
        <Modal
          open={renderOpen()}
          title="modalRender"
          modalRender={(node) => <section style={{ border: '2px solid #1677ff' }}>{node}</section>}
          onOk={() => {
            setRenderOpen(false)
          }}
          onCancel={() => {
            setRenderOpen(false)
          }}
        >
          modalRender wraps the dialog node.
        </Modal>
      </DemoBlock>

      <DemoBlock
        title="Static confirm"
        code={`Modal.confirm({ title: 'Delete item?', content: 'This action cannot be undone.' })`}
      >
        <Button
          danger
          onClick={() =>
            Modal.confirm({
              title: 'Delete item?',
              content: 'This action cannot be undone.',
              okText: 'Delete',
              onOk: () => {
                message.success('Deleted')
              },
            })
          }
        >
          Confirm delete
        </Button>
      </DemoBlock>

      <DemoBlock
        title="Static method advanced config"
        code={`const modal = Modal.confirm({
  icon: <span>!</span>,
  okButtonProps: { danger: true },
  onOk: (close) => close?.(),
})
modal.update((prev) => ({ title: prev.title + ' updated' }))`}
      >
        <Button onClick={openAdvancedConfirm}>Open advanced confirm</Button>
      </DemoBlock>

      <DemoBlock
        title="Information methods"
        code={`Modal.info({ title: 'Info', content: 'Useful detail' })
Modal.success({ title: 'Success' })`}
      >
        <Space wrap>
          <Button onClick={() => Modal.info({ title: 'Info', content: 'Useful detail' })}>
            Info
          </Button>
          <Button onClick={() => Modal.success({ title: 'Success', content: 'All done' })}>
            Success
          </Button>
          <Button onClick={() => Modal.warning({ title: 'Warning', content: 'Check this first' })}>
            Warning
          </Button>
          <Button onClick={() => Modal.destroyAll()}>Destroy all</Button>
        </Space>
      </DemoBlock>

      <h2>API</h2>
      <h3>Modal</h3>
      <ApiTable rows={modalRows} aria-label="Modal API" />
      <h3>Modal function config</h3>
      <ApiTable rows={modalFuncRows} aria-label="Modal Function API" />
      <h3>ModalMaskConfig</h3>
      <ApiTable rows={modalMaskRows} aria-label="Modal Mask Config API" />
      <h3>ModalClosableConfig</h3>
      <ApiTable rows={modalClosableRows} aria-label="Modal Closable Config API" />
      <h3>Semantic DOM keys</h3>
      <ApiTable rows={semanticRows} aria-label="Modal Semantic DOM API" />
      <h3>Footer render extra</h3>
      <ApiTable rows={footerRenderRows} aria-label="Modal Footer Render API" />
      <h3>Modal function return</h3>
      <ApiTable rows={modalReturnRows} aria-label="Modal Function Return API" />
      <h3>Static methods</h3>
      <ApiTable rows={staticRows} aria-label="Modal Static Methods API" />
    </>
  )
}
