import { createSignal } from 'solid-js'
import { Button, Modal, Space, message } from '@ant-design-solid/core'
import { ApiTable } from '../../components/api-table'
import { DemoBlock } from '../../components/demo-block'
import type { ApiTableRow } from '../../components/api-table'

const modalRows: ApiTableRow[] = [
  { property: 'open', description: 'Controls whether the modal is visible.', type: 'boolean' },
  { property: 'title', description: 'Modal title content.', type: 'JSX.Element' },
  { property: 'footer', description: 'Custom footer content. Set to null to hide the footer.', type: 'JSX.Element | null' },
  { property: 'okText', description: 'Text for the default OK button.', type: 'JSX.Element', defaultValue: "'OK'" },
  { property: 'cancelText', description: 'Text for the default Cancel button.', type: 'JSX.Element', defaultValue: "'Cancel'" },
  { property: 'confirmLoading', description: 'Shows loading state on the default OK button.', type: 'boolean', defaultValue: 'false' },
  { property: 'closable', description: 'Shows the close button in the top corner.', type: 'boolean', defaultValue: 'true' },
  { property: 'mask', description: 'Shows the background mask.', type: 'boolean', defaultValue: 'true' },
  { property: 'maskClosable', description: 'Closes the modal when clicking the mask wrapper.', type: 'boolean', defaultValue: 'true' },
  { property: 'keyboard', description: 'Closes the top modal when pressing Escape.', type: 'boolean', defaultValue: 'true' },
  { property: 'centered', description: 'Vertically centers the modal dialog.', type: 'boolean', defaultValue: 'false' },
  { property: 'width', description: 'Modal width.', type: 'number | string' },
  { property: 'zIndex', description: 'Overrides modal z-index.', type: 'number' },
  { property: 'onOk', description: 'Called when the default OK button is clicked.', type: '() => void | Promise<void>' },
  { property: 'onCancel', description: 'Called when the modal requests to close.', type: '() => void' },
  { property: 'afterClose', description: 'Called after the modal changes from open to closed.', type: '() => void' },
]

const modalFuncRows: ApiTableRow[] = [
  { property: 'type', description: 'Semantic confirm dialog type.', type: "'info' | 'success' | 'error' | 'warning' | 'confirm'" },
  { property: 'title', description: 'Dialog title.', type: 'JSX.Element' },
  { property: 'content', description: 'Dialog body content.', type: 'JSX.Element' },
  { property: 'okText', description: 'OK button text.', type: 'JSX.Element' },
  { property: 'cancelText', description: 'Cancel button text.', type: 'JSX.Element' },
  { property: 'closable', description: 'Shows a close button.', type: 'boolean' },
  { property: 'maskClosable', description: 'Allows closing by clicking outside.', type: 'boolean' },
  { property: 'keyboard', description: 'Allows closing with Escape.', type: 'boolean' },
  { property: 'width', description: 'Dialog width.', type: 'number | string' },
  { property: 'onOk', description: 'Called when OK is clicked.', type: '() => void | Promise<void>' },
  { property: 'onCancel', description: 'Called when Cancel is clicked.', type: '() => void' },
]

const staticRows: ApiTableRow[] = [
  { property: 'Modal.confirm', description: 'Opens a confirmation dialog.', type: '(config: ModalFuncProps) => ModalFuncReturn' },
  { property: 'Modal.info', description: 'Opens an informational dialog.', type: '(config: ModalFuncProps) => ModalFuncReturn' },
  { property: 'Modal.success', description: 'Opens a success dialog.', type: '(config: ModalFuncProps) => ModalFuncReturn' },
  { property: 'Modal.error', description: 'Opens an error dialog.', type: '(config: ModalFuncProps) => ModalFuncReturn' },
  { property: 'Modal.warning', description: 'Opens a warning dialog.', type: '(config: ModalFuncProps) => ModalFuncReturn' },
  { property: 'Modal.destroyAll', description: 'Destroys all static modal instances.', type: '() => void' },
]

export default function ModalPage() {
  const [basicOpen, setBasicOpen] = createSignal(false)
  const [footerOpen, setFooterOpen] = createSignal(false)
  const [loadingOpen, setLoadingOpen] = createSignal(false)
  const [loading, setLoading] = createSignal(false)

  function handleLoadingOk() {
    setLoading(true)
    window.setTimeout(() => {
      setLoading(false)
      setLoadingOpen(false)
      message.success('Saved')
    }, 800)
  }

  return (
    <>
      <h1>Modal</h1>
      <p>Modal displays important content in a focused dialog above the page.</p>

      <DemoBlock title="Basic" code={`<Modal open={open()} title="Basic modal" onCancel={() => setOpen(false)}>Content</Modal>`}>
        <Button type="primary" onClick={() => setBasicOpen(true)}>Open modal</Button>
        <Modal
          open={basicOpen()}
          title="Basic modal"
          onOk={() => { setBasicOpen(false) }}
          onCancel={() => setBasicOpen(false)}
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
              <Button type="primary" onClick={() => setFooterOpen(false)}>Apply</Button>
            </Space>
          }
          onCancel={() => setFooterOpen(false)}
        >
          Replace the default footer with any Solid content.
        </Modal>
      </DemoBlock>

      <DemoBlock title="Confirm loading" code={`<Modal confirmLoading={loading()} onOk={save}>Saving content</Modal>`}>
        <Button onClick={() => setLoadingOpen(true)}>Open async modal</Button>
        <Modal
          open={loadingOpen()}
          title="Confirm loading"
          confirmLoading={loading()}
          onOk={handleLoadingOk}
          onCancel={() => setLoadingOpen(false)}
        >
          Click OK to simulate an async operation.
        </Modal>
      </DemoBlock>

      <DemoBlock title="Static confirm" code={`Modal.confirm({ title: 'Delete item?', content: 'This action cannot be undone.' })`}>
        <Button
          danger
          onClick={() =>
            Modal.confirm({
              title: 'Delete item?',
              content: 'This action cannot be undone.',
              okText: 'Delete',
              onOk: () => { message.success('Deleted') },
            })
          }
        >
          Confirm delete
        </Button>
      </DemoBlock>

      <DemoBlock title="Information methods" code={`Modal.info({ title: 'Info', content: 'Useful detail' })
Modal.success({ title: 'Success' })`}>
        <Space wrap>
          <Button onClick={() => Modal.info({ title: 'Info', content: 'Useful detail' })}>Info</Button>
          <Button onClick={() => Modal.success({ title: 'Success', content: 'All done' })}>Success</Button>
          <Button onClick={() => Modal.warning({ title: 'Warning', content: 'Check this first' })}>Warning</Button>
          <Button onClick={() => Modal.destroyAll()}>Destroy all</Button>
        </Space>
      </DemoBlock>

      <h2>API</h2>
      <h3>Modal</h3>
      <ApiTable rows={modalRows} aria-label="Modal API" />
      <h3>Modal function config</h3>
      <ApiTable rows={modalFuncRows} aria-label="Modal Function API" />
      <h3>Static methods</h3>
      <ApiTable rows={staticRows} aria-label="Modal Static Methods API" />
    </>
  )
}
