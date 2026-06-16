import { cleanup, fireEvent, render, waitFor } from '@solidjs/testing-library'
import { StyleProvider, createCache, extractStyle } from '@solid-ant-design/cssinjs'
import { createSignal } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from '../../app'
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

  it('uses antd v6 compact modal spacing without duplicated section padding', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <Modal open title="Spacing">
          Body
        </Modal>
      </StyleProvider>
    ))

    const css = extractStyle(cache)

    expect(css).toContain('.ads-modal{margin:0 auto;padding:0;')
    expect(css).toContain('.ads-modal-content{background:#ffffff;border-radius:6px;box-shadow:')
    expect(css).toContain('padding:20px 24px;')
    expect(css).toContain(
      '.ads-modal-header{background:transparent;border-bottom:none;border-radius:6px 6px 0 0;margin-bottom:8px;padding:0;',
    )
    expect(css).toContain('.ads-modal-body{color:rgba(0,0,0,0.88);padding:0;')
    expect(css).toContain(
      '.ads-modal-footer{align-items:center;background:transparent;border-radius:0;border-top:none;display:flex;gap:8px;justify-content:flex-end;margin-top:12px;padding:0;text-align:end;',
    )
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

  it('applies antd-style zoom and fade motion classes while opening and closing', async () => {
    vi.useFakeTimers()
    try {
      const [open, setOpen] = createSignal(false)
      const afterClose = vi.fn()
      const afterOpenChange = vi.fn()
      render(() => (
        <Modal
          open={open()}
          title="Motion"
          destroyOnHidden
          afterClose={afterClose}
          afterOpenChange={afterOpenChange}
        >
          Body
        </Modal>
      ))

      expect(document.body.querySelector('.ads-modal-root')).toBeFalsy()

      setOpen(true)
      await Promise.resolve()

      const modal = document.body.querySelector<HTMLElement>('.ads-modal')!
      const mask = document.body.querySelector<HTMLElement>('.ads-modal-mask')!
      expect(modal).toHaveClass('ads-zoom-enter')
      expect(modal).toHaveClass('ads-zoom-enter-active')
      expect(mask).toHaveClass('ads-fade-enter')
      expect(mask).toHaveClass('ads-fade-enter-active')
      expect(afterOpenChange).toHaveBeenCalledWith(true)

      vi.advanceTimersByTime(200)
      await Promise.resolve()

      expect(modal).not.toHaveClass('ads-zoom-enter')
      expect(mask).not.toHaveClass('ads-fade-enter')

      setOpen(false)
      await Promise.resolve()

      expect(document.body).toHaveTextContent('Motion')
      expect(modal).toHaveClass('ads-zoom-leave')
      expect(modal).toHaveClass('ads-zoom-leave-active')
      expect(mask).toHaveClass('ads-fade-leave')
      expect(mask).toHaveClass('ads-fade-leave-active')
      expect(afterClose).not.toHaveBeenCalled()

      vi.advanceTimersByTime(200)
      await Promise.resolve()

      expect(document.body).not.toHaveTextContent('Motion')
      expect(afterClose).toHaveBeenCalledTimes(1)
      expect(afterOpenChange).toHaveBeenCalledWith(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('keeps force rendered modal mounted but hidden after close motion finishes', async () => {
    vi.useFakeTimers()
    try {
      const [open, setOpen] = createSignal(true)
      render(() => (
        <Modal open={open()} forceRender title="Force motion">
          Body
        </Modal>
      ))

      const root = document.body.querySelector<HTMLElement>('.ads-modal-root')!
      expect(root.style.display).toBe('')

      setOpen(false)
      await Promise.resolve()
      expect(root.style.display).toBe('')
      expect(root.querySelector('.ads-modal')).toHaveClass('ads-zoom-leave')

      vi.advanceTimersByTime(200)
      await Promise.resolve()

      expect(document.body.querySelector('.ads-modal-root')).toBe(root)
      expect(root.style.display).toBe('none')
      expect(root).toHaveTextContent('Force motion')
    } finally {
      vi.useRealTimers()
    }
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

  it('renders default static method icons next to the confirm title', () => {
    const instances = [
      Modal.info({ title: 'Info title', content: 'Info content' }),
      Modal.success({ title: 'Success title', content: 'Success content' }),
      Modal.error({ title: 'Error title', content: 'Error content' }),
      Modal.warning({ title: 'Warning title', content: 'Warning content' }),
      Modal.confirm({ title: 'Confirm title', content: 'Confirm content' }),
    ]

    const dialogs = document.body.querySelectorAll('.ads-modal-confirm-body')
    expect(dialogs).toHaveLength(5)

    dialogs.forEach((dialog) => {
      const icon = dialog.querySelector('.ads-modal-confirm-icon')
      const svg = icon?.querySelector('svg')
      const title = dialog.querySelector('.ads-modal-confirm-title')
      expect(icon).toBeTruthy()
      expect(svg).toBeTruthy()
      expect(title).toBeTruthy()
      expect(icon?.nextElementSibling).toHaveClass('ads-modal-confirm-message')
      expect(title?.parentElement).toHaveClass('ads-modal-confirm-message')
    })

    expect(document.body.querySelectorAll('.ads-modal-header')).toHaveLength(0)
    instances.forEach((instance) => instance.destroy())
  })

  it('colors default static method icons by status', () => {
    const instances = [
      Modal.info({ title: 'Info title' }),
      Modal.success({ title: 'Success title' }),
      Modal.error({ title: 'Error title' }),
      Modal.warning({ title: 'Warning title' }),
      Modal.confirm({ title: 'Confirm title' }),
    ]

    expect(
      document.body.querySelector('.ads-modal-confirm-info .ads-modal-confirm-icon'),
    ).toBeTruthy()
    expect(
      document.body.querySelector('.ads-modal-confirm-success .ads-modal-confirm-icon'),
    ).toBeTruthy()
    expect(
      document.body.querySelector('.ads-modal-confirm-error .ads-modal-confirm-icon'),
    ).toBeTruthy()
    expect(
      document.body.querySelector('.ads-modal-confirm-warning .ads-modal-confirm-icon'),
    ).toBeTruthy()
    expect(
      document.body.querySelector('.ads-modal-confirm-confirm .ads-modal-confirm-icon'),
    ).toBeTruthy()

    instances.forEach((instance) => instance.destroy())
  })

  it('supports custom and hidden static method icons', () => {
    const custom = Modal.info({
      title: 'Custom icon',
      icon: <span data-testid="custom-static-icon">i</span>,
    })
    expect(document.body.querySelector('[data-testid="custom-static-icon"]')).toBeTruthy()
    custom.destroy()

    const hidden = Modal.success({ title: 'Hidden icon', icon: null })
    expect(document.body.querySelector('.ads-modal-confirm-icon')).toBeFalsy()
    hidden.destroy()
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

  it('accepts current Solid modal api props at runtime', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const afterOpenChange = vi.fn()

    render(() => (
      <Modal
        open
        title="Compat"
        class="compat-modal"
        wrapClass="compat-wrap"
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

  it('applies button props okType class and wrapClass', () => {
    render(() => (
      <Modal
        open
        title="Buttons"
        class="dialog-class"
        wrapClass="wrap-class"
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

  it('passes closable aria and data attrs to the close button', () => {
    render(() => (
      <Modal
        open
        title="Close attrs"
        closable={{
          closeIcon: <span data-testid="close-icon">close</span>,
          'aria-label': 'Dismiss dialog',
          'data-testid': 'close-button',
        }}
      >
        Body
      </Modal>
    ))

    const closeButton = document.body.querySelector<HTMLButtonElement>(
      '[data-testid="close-button"]',
    )!
    expect(closeButton).toHaveAttribute('aria-label', 'Dismiss dialog')
    expect(closeButton).toHaveTextContent('close')
  })

  it('supports object mask visibility blur and closable precedence', () => {
    const onCancel = vi.fn()
    render(() => (
      <Modal
        open
        title="Mask"
        mask={{ enabled: true, blur: true, closable: false }}
        onCancel={onCancel}
      >
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

  it('preserves hidden content by default and destroys it with destroyOnHidden', async () => {
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
    await waitFor(() => expect(document.body).not.toHaveTextContent('Destroyed body'))
  })

  it('supports forceRender modalRender classNames styles loading and afterOpenChange', async () => {
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
    expect(document.body.querySelector('.ads-modal-render')).toBeTruthy()
    expect(document.body.querySelector('.ads-modal-render')?.firstElementChild).toBe(
      document.body.querySelector('[data-testid="wrapped-modal"]'),
    )
    expect(document.body.querySelector<HTMLElement>('.ads-modal-render')!.style.width).toBe('')
    expect(document.body.querySelector<HTMLElement>('.ads-modal')!.style.width).toBe('')
    expect(document.body.querySelector('.semantic-body')).toBeTruthy()
    expect(document.body.querySelector<HTMLElement>('.semantic-body')!.style.color).toBe('blue')
    expect(document.body.querySelector('.ads-modal-loading')).toBeTruthy()

    setOpen(true)
    expect(afterOpenChange).toHaveBeenCalledWith(true)
    setOpen(false)
    await waitFor(() => expect(afterOpenChange).toHaveBeenCalledWith(false))
  })

  it('uses ConfigProvider modal defaults with explicit prop override', () => {
    render(() => (
      <ConfigProvider
        modal={{
          class: 'configured-dialog',
          classNames: { body: 'configured-body' },
          styles: { body: { color: 'red' } },
          closeIcon: <span data-testid="configured-close">close</span>,
          closable: { disabled: true },
          centered: true,
          okButtonProps: { class: 'configured-ok' },
          cancelButtonProps: { class: 'configured-cancel' },
          mask: { blur: true },
          focusable: { trap: false },
        }}
      >
        <Modal open title="Configured" closable={{ disabled: false }}>
          Body
        </Modal>
      </ConfigProvider>
    ))

    expect(document.body.querySelector('.configured-dialog')).toBeTruthy()
    expect(document.body.querySelector('.configured-body')).toBeTruthy()
    expect(document.body.querySelector<HTMLElement>('.configured-body')!.style.color).toBe('red')
    expect(document.body.querySelector('[data-testid="configured-close"]')).toBeTruthy()
    expect(document.body.querySelector('.ads-modal-centered')).toBeTruthy()
    expect(document.body.querySelector('.configured-ok')).toBeTruthy()
    expect(document.body.querySelector('.configured-cancel')).toBeTruthy()
    expect(document.body.querySelector('.ads-modal-mask-blur')).toBeTruthy()
    expect(
      document.body
        .querySelector<HTMLButtonElement>('.ads-modal-close')!
        .getAttribute('aria-disabled'),
    ).toBeNull()
  })

  it('passes static method visual and layout config to ModalBase', () => {
    const afterClose = vi.fn()
    const instance = Modal.confirm({
      title: 'Static config',
      content: 'Static body',
      centered: true,
      zIndex: 1555,
      style: { top: '12px' },
      class: 'static-dialog',
      wrapClass: 'static-wrap',
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

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>('.ads-modal-footer .ads-btn-primary')!,
    )
    expect(onOk).toHaveBeenCalledTimes(1)
    expect(document.body).not.toHaveTextContent('Close from ok')

    const onCancel = vi.fn((close?: () => void) => close?.())
    Modal.confirm({ title: 'Close from cancel', onCancel })
    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>(
        '.ads-modal-footer .ads-btn:not(.ads-btn-primary)',
      )!,
    )
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(document.body).not.toHaveTextContent('Close from cancel')
  })

  it('supports Solid class aliases root class and semantic functions', () => {
    render(() => (
      <Modal
        open
        title="Solid names"
        class="dialog-solid"
        rootClass="root-solid"
        wrapClass="wrap-solid"
        classNames={({ props }) => ({
          body: props.open ? 'body-open' : 'body-closed',
          wrapper: 'wrapper-solid',
          container: 'container-solid',
        })}
        styles={({ props }) => ({
          body: { color: props.open ? 'green' : 'red' },
          wrapper: { padding: '4px' },
          container: { border: '1px solid blue' },
        })}
      >
        Body
      </Modal>
    ))

    expect(document.body.querySelector('.root-solid')).toBeTruthy()
    expect(document.body.querySelector('.wrap-solid')).toBeTruthy()
    expect(document.body.querySelector('.wrapper-solid')).toBeTruthy()
    expect(document.body.querySelector('.dialog-solid')).toBeTruthy()
    expect(document.body.querySelector('.container-solid')).toBeTruthy()
    expect(document.body.querySelector('.body-open')).toBeTruthy()
    expect(document.body.querySelector<HTMLElement>('.body-open')!.style.color).toBe('green')
    expect(document.body.querySelector<HTMLElement>('.wrapper-solid')!.style.padding).toBe('4px')
    expect(document.body.querySelector<HTMLElement>('.container-solid')!.style.border).toBe(
      '1px solid blue',
    )
  })

  it('supports responsive width objects with breakpoint css variables', () => {
    render(() => (
      <Modal open title="Responsive" width={{ xs: 280, md: '640px' }}>
        Body
      </Modal>
    ))

    const dialog = document.body.querySelector<HTMLElement>('.ads-modal')!
    expect(dialog.style.getPropertyValue('--ads-modal-xs-width')).toBe('280px')
    expect(dialog.style.getPropertyValue('--ads-modal-md-width')).toBe('640px')
  })

  it('hides close button when closeIcon is null or false', () => {
    const first = render(() => (
      <Modal open title="No close" closeIcon={null}>
        Body
      </Modal>
    ))

    expect(document.body.querySelector('.ads-modal-close')).toBeFalsy()

    first.unmount()
    render(() => (
      <Modal open title="No close false" closeIcon={false}>
        Body
      </Modal>
    ))

    expect(document.body.querySelector('.ads-modal-close')).toBeFalsy()
  })

  it('passes click keyboard and close events to callbacks and respects confirmLoading cancel guard', () => {
    const onOk = vi.fn()
    const onCancel = vi.fn()
    const onClose = vi.fn()
    render(() => (
      <Modal open title="Events" closable={{ onClose }} onOk={onOk} onCancel={onCancel}>
        Body
      </Modal>
    ))

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>('.ads-modal-footer .ads-btn-primary')!,
    )
    expect(onOk).toHaveBeenCalledWith(expect.objectContaining({ type: 'click' }))

    onOk.mockClear()
    cleanup()
    render(() => (
      <Modal open title="Guarded" confirmLoading closable={{ onClose }} onCancel={onCancel}>
        Body
      </Modal>
    ))

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>(
        '.ads-modal-footer .ads-btn:not(.ads-btn-primary)',
      )!,
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCancel).not.toHaveBeenCalled()

    fireEvent.click(document.body.querySelector<HTMLButtonElement>('.ads-modal-close')!)
    expect(onClose).not.toHaveBeenCalled()
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('supports focusable trap and focus trigger after close behavior', async () => {
    const [open, setOpen] = createSignal(false)
    render(() => (
      <>
        <button type="button" data-testid="trigger" onClick={() => setOpen(true)}>
          Open
        </button>
        <Modal
          open={open()}
          title="Focusable"
          focusable={{ trap: true, focusTriggerAfterClose: true }}
          onCancel={() => setOpen(false)}
        >
          <button type="button" data-testid="inside">
            Inside
          </button>
        </Modal>
      </>
    ))

    const trigger = document.body.querySelector<HTMLButtonElement>('[data-testid="trigger"]')!
    trigger.focus()
    fireEvent.click(trigger)

    const inside = document.body.querySelector<HTMLButtonElement>('[data-testid="inside"]')!
    inside.focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).not.toBe(document.body)

    fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => expect(document.activeElement).toBe(trigger))
  })

  it('supports Modal.warn alias and useModal hook with context holder and promise result', async () => {
    expect(Modal.warn).toBe(Modal.warning)

    let api!: ReturnType<typeof Modal.useModal>[0]
    function HookHost() {
      const [modal, contextHolder] = Modal.useModal()
      api = modal
      return <>{contextHolder}</>
    }

    render(() => (
      <ConfigProvider prefixCls="hooked">
        <HookHost />
      </ConfigProvider>
    ))

    const result = api.confirm({ title: 'Hook confirm', content: 'Hook body' })
    await waitFor(() => expect(document.body.querySelector('.hooked-modal-root')).toBeTruthy())
    expect(result.then).toBeTypeOf('function')

    const confirmed = result.then((value) => value)
    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>(
        '.hooked-modal-footer .hooked-btn:not(.hooked-btn-primary)',
      )!,
    )

    await expect(confirmed).resolves.toBe(false)
    await waitFor(() => expect(document.body).not.toHaveTextContent('Hook confirm'))
  })

  it('supports App.useApp modal context', () => {
    function AppHost() {
      const { modal } = App.useApp()
      return (
        <button
          type="button"
          onClick={() =>
            modal.confirm({
              title: 'App context modal',
              content: 'Created from App.useApp().modal',
              rootClass: 'appctx-modal-root',
            })
          }
        >
          Open app modal
        </button>
      )
    }

    render(() => (
      <App>
        <AppHost />
      </App>
    ))

    fireEvent.click(document.body.querySelector<HTMLButtonElement>('button')!)

    expect(document.body.querySelector('.appctx-modal-root')).toBeTruthy()
    expect(document.body).toHaveTextContent('Created from App.useApp().modal')
  })

  it('passes static Solid class aliases and focusable auto focus config', async () => {
    Modal.confirm({
      title: 'Static aliases',
      class: 'static-solid',
      rootClass: 'static-root',
      wrapClass: 'static-wrap-solid',
      focusable: { autoFocusButton: 'cancel' },
    })

    expect(document.body.querySelector('.static-root')).toBeTruthy()
    expect(document.body.querySelector('.static-solid')).toBeTruthy()
    expect(document.body.querySelector('.static-wrap-solid')).toBeTruthy()
    await waitFor(() =>
      expect(document.activeElement).toBe(
        document.body.querySelector<HTMLButtonElement>(
          '.ads-modal-footer .ads-btn:not(.ads-btn-primary)',
        ),
      ),
    )
  })
})
