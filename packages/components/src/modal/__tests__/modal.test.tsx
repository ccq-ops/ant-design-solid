import { cleanup, fireEvent, render, waitFor } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Select } from '../../select'
import { Modal } from '../index'

describe('Modal', () => {
  beforeEach(() => {
    cleanup()
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    Modal.destroyAll?.()
  })

  afterEach(() => {
    cleanup()
    Modal.destroyAll?.()
    document.body.style.overflow = ''
  })

  it('renders title body and default prefix-aware footer when open', () => {
    const onOk = vi.fn()
    const onCancel = vi.fn()
    render(() => (
      <Modal open title="Title" onOk={onOk} onCancel={onCancel}>
        Body
      </Modal>
    ))

    expect(document.body).toHaveTextContent('Title')
    expect(document.body).toHaveTextContent('Body')
    expect(document.body.querySelector('.ads-modal-root')).toBeTruthy()

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>('.ads-modal-footer .ads-btn-primary')!,
    )
    expect(onOk).toHaveBeenCalledTimes(1)

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>(
        '.ads-modal-footer .ads-btn:not(.ads-btn-primary)',
      )!,
    )
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('uses ConfigProvider prefix for modal and default footer buttons', () => {
    render(() => (
      <ConfigProvider prefixCls="custom">
        <Modal open title="Custom prefix">
          Body
        </Modal>
      </ConfigProvider>
    ))

    expect(document.body.querySelector('.custom-modal-root')).toBeTruthy()
    expect(document.body.querySelector('.custom-modal-footer .custom-btn-primary')).toBeTruthy()
    expect(document.body.querySelector('.ads-modal-root')).toBeFalsy()
  })

  it('respects maskClosable and keyboard', () => {
    const onCancel = vi.fn()
    render(() => (
      <Modal open title="Locked" maskClosable={false} keyboard={false} onCancel={onCancel}>
        Body
      </Modal>
    ))

    fireEvent.click(document.body.querySelector('.ads-modal-wrap')!)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCancel).not.toHaveBeenCalled()
  })

  it('cancels from wrap backdrop clicks but not dialog content clicks', () => {
    const onCancel = vi.fn()
    render(() => (
      <Modal open title="Backdrop" onCancel={onCancel}>
        Body
      </Modal>
    ))

    fireEvent.click(document.body.querySelector('.ads-modal-content')!)
    expect(onCancel).not.toHaveBeenCalled()

    fireEvent.click(document.body.querySelector('.ads-modal-wrap')!)
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel for backdrop click and Escape by default', () => {
    const onCancel = vi.fn()
    render(() => (
      <Modal open title="Closable" onCancel={onCancel}>
        Body
      </Modal>
    ))

    fireEvent.click(document.body.querySelector('.ads-modal-wrap')!)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCancel).toHaveBeenCalledTimes(2)
  })

  it('only lets the topmost modal handle Escape', () => {
    const onFirstCancel = vi.fn()
    const onSecondCancel = vi.fn()
    render(() => (
      <>
        <Modal open title="First" onCancel={onFirstCancel}>
          First body
        </Modal>
        <Modal open title="Second" onCancel={onSecondCancel}>
          Second body
        </Modal>
      </>
    ))

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onFirstCancel).not.toHaveBeenCalled()
    expect(onSecondCancel).toHaveBeenCalledTimes(1)
  })

  it('labels the dialog from its title', () => {
    render(() => (
      <Modal open title="Accessible title">
        Body
      </Modal>
    ))

    const dialog = document.body.querySelector<HTMLElement>('[role="dialog"]')!
    const labelId = dialog.getAttribute('aria-labelledby')

    expect(labelId).toBeTruthy()
    expect(document.getElementById(labelId!)).toHaveTextContent('Accessible title')
  })

  it('catches sync throws and rejected promises from base modal OK handler', async () => {
    const onThrow = vi.fn(() => {
      throw new Error('sync failure')
    })
    const onReject = vi.fn(() => Promise.reject(new Error('async failure')))

    const { unmount } = render(() => (
      <Modal open title="Throw" onOk={onThrow}>
        Body
      </Modal>
    ))

    expect(() => {
      fireEvent.click(
        document.body.querySelector<HTMLButtonElement>('.ads-modal-footer .ads-btn-primary')!,
      )
    }).not.toThrow()
    expect(onThrow).toHaveBeenCalledTimes(1)

    unmount()
    render(() => (
      <Modal open title="Reject base" onOk={onReject}>
        Body
      </Modal>
    ))

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>('.ads-modal-footer .ads-btn-primary')!,
    )
    await Promise.resolve()
    expect(onReject).toHaveBeenCalledTimes(1)
    expect(document.body).toHaveTextContent('Reject base')
  })

  it('locks body scroll while open and unlocks when closed or unmounted', () => {
    const [open, setOpen] = createSignal(true)
    const result = render(() => (
      <Modal open={open()} title="Scroll">
        Body
      </Modal>
    ))
    expect(document.body.style.overflow).toBe('hidden')

    setOpen(false)
    expect(document.body.style.overflow).toBe('')

    setOpen(true)
    expect(document.body.style.overflow).toBe('hidden')

    result.unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('creates updates and destroys confirm modal', () => {
    const instance = Modal.confirm({ title: 'Confirm', content: 'Delete?' })
    expect(document.body).toHaveTextContent('Confirm')
    expect(document.body).toHaveTextContent('Delete?')
    expect(document.body.querySelectorAll('.ads-modal-footer .ads-btn')).toHaveLength(2)

    instance.update({ title: 'Updated', content: 'Sure?' })
    expect(document.body).not.toHaveTextContent('Confirm')
    expect(document.body).toHaveTextContent('Updated')
    expect(document.body).toHaveTextContent('Sure?')

    instance.destroy()
    expect(document.body).not.toHaveTextContent('Updated')

    expect(() => instance.destroy()).not.toThrow()
    expect(() => instance.update({ title: 'After destroy' })).not.toThrow()
    expect(document.body).not.toHaveTextContent('After destroy')
  })

  it('renders info success error and warning static methods with OK only', () => {
    const instances = [
      Modal.info({ title: 'Info' }),
      Modal.success({ title: 'Success' }),
      Modal.error({ title: 'Error' }),
      Modal.warning({ title: 'Warning' }),
    ]

    expect(document.body).toHaveTextContent('Info')
    expect(document.body).toHaveTextContent('Success')
    expect(document.body).toHaveTextContent('Error')
    expect(document.body).toHaveTextContent('Warning')
    expect(
      document.body.querySelectorAll('.ads-modal-confirm .ads-modal-footer .ads-btn'),
    ).toHaveLength(4)
    expect(
      document.body.querySelectorAll('.ads-modal-confirm .ads-modal-footer .ads-btn-primary'),
    ).toHaveLength(4)

    instances.forEach((instance) => instance.destroy())
  })

  it('keeps confirm modal open while async onOk resolves', async () => {
    let resolve!: () => void
    const promise = new Promise<void>((next) => {
      resolve = next
    })
    Modal.confirm({ title: 'Async', onOk: () => promise })

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>('.ads-modal-footer .ads-btn-primary')!,
    )
    expect(document.body).toHaveTextContent('Async')
    expect(document.body.querySelector('.ads-btn-loading')).toBeTruthy()

    resolve()
    await waitFor(() => expect(document.body).not.toHaveTextContent('Async'))
  })

  it('keeps confirm modal open when onOk throws synchronously', () => {
    const onOk = vi.fn(() => {
      throw new Error('sync confirm failure')
    })
    Modal.confirm({ title: 'Sync throw', onOk })

    expect(() => {
      fireEvent.click(
        document.body.querySelector<HTMLButtonElement>('.ads-modal-footer .ads-btn-primary')!,
      )
    }).not.toThrow()

    expect(onOk).toHaveBeenCalledTimes(1)
    expect(document.body).toHaveTextContent('Sync throw')
    expect(document.body.querySelector('.ads-btn-loading')).toBeFalsy()
  })

  it('keeps confirm modal open and clears loading when async onOk rejects', async () => {
    let reject!: () => void
    const promise = new Promise<void>((_, nextReject) => {
      reject = nextReject
    })
    Modal.confirm({ title: 'Reject', onOk: () => promise })

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>('.ads-modal-footer .ads-btn-primary')!,
    )
    expect(document.body.querySelector('.ads-btn-loading')).toBeTruthy()

    reject()
    await waitFor(() => expect(document.body).toHaveTextContent('Reject'))
    await waitFor(() => expect(document.body.querySelector('.ads-btn-loading')).toBeFalsy())
  })

  it('destroys all static modals', () => {
    Modal.confirm({ title: 'A' })
    Modal.info({ title: 'B' })

    Modal.destroyAll()

    expect(document.body).not.toHaveTextContent('A')
    expect(document.body).not.toHaveTextContent('B')
  })

  it('uses shared zIndex and provides context to nested popups', () => {
    render(() => (
      <Modal open title="Layer" zIndex={1420}>
        <div>Body</div>
      </Modal>
    ))

    const root = document.body.querySelector<HTMLElement>('.ads-modal-root')!
    expect(root.style.zIndex).toBe('1420')
  })

  it('raises nested consumer popups above the modal root', () => {
    render(() => (
      <Modal open title="Layer" zIndex={1420}>
        <Select open options={[{ value: 'one', label: 'One' }]} />
      </Modal>
    ))

    const root = document.body.querySelector<HTMLElement>('.ads-modal-root')!
    const dropdown = document.body.querySelector<HTMLElement>('.ads-select-dropdown')!
    expect(Number(dropdown.style.zIndex)).toBeGreaterThan(Number(root.style.zIndex))
  })

  it('accepts P0 and P1 modal api props at runtime', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const afterOpenChange = vi.fn()

    render(() => (
      <Modal
        open
        title="Compat"
        className="compat-modal"
        wrapClassName="compat-wrap"
        okType="default"
        okButtonProps={{ danger: true, class: 'ok-extra' }}
        cancelButtonProps={{ disabled: true, class: 'cancel-extra' }}
        closeIcon={<span data-testid="custom-close">x</span>}
        mask={{ enabled: true, blur: true, closable: false }}
        closable={{ closeIcon: <span data-testid="object-close">close</span> }}
        classNames={{ body: 'compat-body' }}
        styles={{ body: { color: 'red' } }}
        getContainer={container}
        modalRender={(node) => <section data-testid="modal-render">{node}</section>}
        forceRender
        destroyOnHidden={false}
        afterOpenChange={afterOpenChange}
        loading
      >
        Body
      </Modal>
    ))

    expect(container).toHaveTextContent('Compat')
    expect(container.querySelector('.compat-modal')).toBeTruthy()
    expect(container.querySelector('.compat-wrap')).toBeTruthy()
    expect(container.querySelector('.compat-body')).toBeTruthy()
    expect(container.querySelector<HTMLElement>('.compat-body')!.style.color).toBe('red')
    expect(container.querySelector('[data-testid="modal-render"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="object-close"]')).toBeTruthy()
    expect(container.querySelector('.ads-modal-mask-blur')).toBeTruthy()
    expect(container.querySelector('.ads-modal-loading')).toBeTruthy()
  })

  it('applies button props okType className and wrapClassName', () => {
    render(() => (
      <Modal
        open
        title="Buttons"
        className="dialog-class"
        wrapClassName="wrap-class"
        okType="default"
        okButtonProps={{ danger: true, class: 'ok-extra' }}
        cancelButtonProps={{ disabled: true, class: 'cancel-extra' }}
      >
        Body
      </Modal>
    ))

    expect(document.body.querySelector('.dialog-class')).toBeTruthy()
    expect(document.body.querySelector('.wrap-class')).toBeTruthy()
    expect(document.body.querySelector('.ok-extra')).toBeTruthy()
    expect(document.body.querySelector('.ok-extra')!.className).not.toContain('ads-btn-primary')
    expect(document.body.querySelector('.ok-extra')!.className).toContain('ads-btn-dangerous')
    expect(document.body.querySelector<HTMLButtonElement>('.cancel-extra')!.disabled).toBe(true)
  })

  it('supports object closable custom icon and disabled close', () => {
    const onClose = vi.fn()
    const onCancel = vi.fn()
    render(() => (
      <Modal
        open
        title="Close"
        closable={{
          closeIcon: <span data-testid="close-icon">custom</span>,
          disabled: true,
          onClose,
        }}
        onCancel={onCancel}
      >
        Body
      </Modal>
    ))

    fireEvent.click(document.body.querySelector<HTMLButtonElement>('.ads-modal-close')!)

    expect(document.body.querySelector('[data-testid="close-icon"]')).toBeTruthy()
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('supports object mask visibility blur and closable precedence', () => {
    const onCancel = vi.fn()
    render(() => (
      <Modal open title="Mask" mask={{ enabled: true, blur: true, closable: false }} onCancel={onCancel}>
        Body
      </Modal>
    ))

    expect(document.body.querySelector('.ads-modal-mask')).toBeTruthy()
    expect(document.body.querySelector('.ads-modal-mask-blur')).toBeTruthy()
    fireEvent.click(document.body.querySelector('.ads-modal-wrap')!)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('supports getContainer selector and false inline rendering', () => {
    const host = document.createElement('div')
    host.id = 'modal-host'
    document.body.appendChild(host)

    const inline = render(() => (
      <div data-testid="inline-root">
        <Modal open title="Inline" getContainer={false}>
          Inline body
        </Modal>
      </div>
    ))
    render(() => (
      <Modal open title="Hosted" getContainer="#modal-host">
        Hosted body
      </Modal>
    ))

    expect(host).toHaveTextContent('Hosted')
    expect(inline.container).toHaveTextContent('Inline')
  })

  it('preserves hidden content by default and destroys it with destroyOnHidden', () => {
    const [open, setOpen] = createSignal(true)
    const preserved = render(() => (
      <Modal open={open()} title="Preserved">
        Preserved body
      </Modal>
    ))

    setOpen(false)
    expect(document.body).toHaveTextContent('Preserved body')

    preserved.unmount()
    const [destroyOpen, setDestroyOpen] = createSignal(true)
    render(() => (
      <Modal open={destroyOpen()} destroyOnHidden title="Destroyed">
        Destroyed body
      </Modal>
    ))

    setDestroyOpen(false)
    expect(document.body).not.toHaveTextContent('Destroyed body')
  })

  it('supports forceRender modalRender classNames styles loading and afterOpenChange', () => {
    const [open, setOpen] = createSignal(false)
    const afterOpenChange = vi.fn()
    render(() => (
      <Modal
        open={open()}
        forceRender
        title="Advanced"
        classNames={{ body: 'semantic-body' }}
        styles={{ body: { color: 'blue' } }}
        modalRender={(node) => <section data-testid="wrapped-modal">{node}</section>}
        loading
        afterOpenChange={afterOpenChange}
      >
        Advanced body
      </Modal>
    ))

    expect(document.body).toHaveTextContent('Advanced')
    expect(document.body.querySelector('[data-testid="wrapped-modal"]')).toBeTruthy()
    expect(document.body.querySelector('.semantic-body')).toBeTruthy()
    expect(document.body.querySelector<HTMLElement>('.semantic-body')!.style.color).toBe('blue')
    expect(document.body.querySelector('.ads-modal-loading')).toBeTruthy()

    setOpen(true)
    expect(afterOpenChange).toHaveBeenCalledWith(true)
    setOpen(false)
    expect(afterOpenChange).toHaveBeenCalledWith(false)
  })

  it('passes static method visual and layout config to ModalBase', () => {
    const afterClose = vi.fn()
    const instance = Modal.confirm({
      title: 'Static config',
      content: 'Static body',
      centered: true,
      zIndex: 1555,
      style: { top: '12px' },
      className: 'static-dialog',
      wrapClassName: 'static-wrap',
      okType: 'default',
      okButtonProps: { class: 'static-ok' },
      cancelButtonProps: { class: 'static-cancel' },
      closeIcon: <span data-testid="static-close">close</span>,
      closable: true,
      icon: <span data-testid="static-icon">!</span>,
      footer: <button type="button">custom footer</button>,
      afterClose,
    })

    expect(document.body.querySelector('.static-dialog')).toBeTruthy()
    expect(document.body.querySelector('.static-wrap')).toBeTruthy()
    expect(document.body.querySelector<HTMLElement>('.ads-modal-root')!.style.zIndex).toBe('1555')
    expect(document.body.querySelector<HTMLElement>('.ads-modal-root')!.style.top).toBe('12px')
    expect(document.body.querySelector('[data-testid="static-close"]')).toBeTruthy()
    expect(document.body.querySelector('[data-testid="static-icon"]')).toBeTruthy()
    expect(document.body).toHaveTextContent('custom footer')

    instance.destroy()
    expect(afterClose).toHaveBeenCalledTimes(1)
  })

  it('supports static update function form', () => {
    const instance = Modal.info({ title: 'Before', content: 'Body' })

    instance.update((prev) => ({ title: `${prev.title} After`, content: 'Updated body' }))

    expect(document.body).toHaveTextContent('Before After')
    expect(document.body).toHaveTextContent('Updated body')
    instance.destroy()
  })

  it('passes close function to static onOk and onCancel handlers', () => {
    const onOk = vi.fn((close?: () => void) => close?.())
    Modal.confirm({ title: 'Close from ok', onOk })

    fireEvent.click(document.body.querySelector<HTMLButtonElement>('.ads-modal-footer .ads-btn-primary')!)
    expect(onOk).toHaveBeenCalledTimes(1)
    expect(document.body).not.toHaveTextContent('Close from ok')

    const onCancel = vi.fn((close?: () => void) => close?.())
    Modal.confirm({ title: 'Close from cancel', onCancel })
    fireEvent.click(document.body.querySelector<HTMLButtonElement>('.ads-modal-footer .ads-btn:not(.ads-btn-primary)')!)
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(document.body).not.toHaveTextContent('Close from cancel')
  })
})
