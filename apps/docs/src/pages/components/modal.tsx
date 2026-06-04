import { Button, Modal, Space } from '@ant-design-solid/core'
import { createSignal } from 'solid-js'
import { DemoBlock } from '../../components/demo-block'

export default function ModalPage() {
  const [open, setOpen] = createSignal(false)
  return (
    <>
      <h1>Modal</h1>
      <DemoBlock title="Basic" code={`<Modal open={open()} title="Basic modal">Content</Modal>`}>
        <Space>
          <Button type="primary" onClick={() => setOpen(true)}>
            Open modal
          </Button>
          <Button onClick={() => Modal.confirm({ title: 'Confirm', content: 'Are you sure?' })}>
            Confirm
          </Button>
        </Space>
        <Modal
          open={open()}
          title="Basic modal"
          onOk={() => {
            setOpen(false)
          }}
          onCancel={() => setOpen(false)}
        >
          Content
        </Modal>
      </DemoBlock>
    </>
  )
}
