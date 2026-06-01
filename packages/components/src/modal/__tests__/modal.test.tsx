import { cleanup, fireEvent, render, waitFor } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
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
})
