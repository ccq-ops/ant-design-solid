import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Select } from '../../select'
import { Drawer } from '../drawer'

describe('Drawer', () => {
  beforeEach(() => {
    cleanup()
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  afterEach(() => {
    cleanup()
    document.body.style.overflow = ''
  })

  it('renders open drawer with title and body', () => {
    render(() => (
      <Drawer open title="Title">
        Body
      </Drawer>
    ))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('calls onClose from close button, mask, and Escape', () => {
    const onClose = vi.fn()
    render(() => (
      <Drawer open title="Title" onClose={onClose}>
        Body
      </Drawer>
    ))

    fireEvent.click(screen.getByRole('button', { name: 'close drawer' }))
    fireEvent.click(document.body.querySelector('.ads-drawer-mask')!)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('respects maskClosable and keyboard false', () => {
    const onClose = vi.fn()
    render(() => (
      <Drawer open maskClosable={false} keyboard={false} onClose={onClose}>
        Body
      </Drawer>
    ))

    fireEvent.click(document.body.querySelector('.ads-drawer-mask')!)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
  })

  it('supports placement sizing and destroyOnClose', () => {
    function Demo() {
      const [open, setOpen] = createSignal(true)
      return (
        <>
          <button onClick={() => setOpen(false)}>Close</button>
          <Drawer open={open()} placement="bottom" height={240} destroyOnClose>
            Body
          </Drawer>
        </>
      )
    }

    render(() => <Demo />)

    expect(screen.getByRole('dialog')).toHaveStyle('height: 240px')
    expect(document.body.querySelector('.ads-drawer-bottom')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Close'))

    expect(screen.queryByText('Body')).toBeNull()
  })

  it('calls afterOpenChange when open changes', () => {
    const afterOpenChange = vi.fn()
    function Demo() {
      const [open, setOpen] = createSignal(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>Open</button>
          <Drawer open={open()} afterOpenChange={afterOpenChange}>
            Body
          </Drawer>
        </>
      )
    }

    render(() => <Demo />)
    fireEvent.click(screen.getByText('Open'))

    expect(afterOpenChange).toHaveBeenLastCalledWith(true)
  })

  it('locks body scroll while open and unlocks on close and unmount', () => {
    const [open, setOpen] = createSignal(true)
    const result = render(() => (
      <Drawer open={open()} title="Scroll">
        Body
      </Drawer>
    ))

    expect(document.body.style.overflow).toBe('hidden')

    setOpen(false)
    expect(document.body.style.overflow).toBe('')

    setOpen(true)
    expect(document.body.style.overflow).toBe('hidden')

    result.unmount()
    expect(document.body.style.overflow).toBe('')
  })

  it('retains non-destroyed content hidden after close', () => {
    function Demo() {
      const [open, setOpen] = createSignal(true)
      return (
        <>
          <button onClick={() => setOpen(false)}>Hide</button>
          <Drawer open={open()} title="Retained">
            Retained body
          </Drawer>
        </>
      )
    }

    render(() => <Demo />)
    fireEvent.click(screen.getByText('Hide'))

    expect(screen.getByText('Retained body')).toBeInTheDocument()
    expect(document.body.querySelector('.ads-drawer-root')).toHaveStyle('display: none')
  })

  it('labels dialog from title', () => {
    render(() => (
      <Drawer open title="Accessible title">
        Body
      </Drawer>
    ))

    const dialog = screen.getByRole('dialog')
    const labelId = dialog.getAttribute('aria-labelledby')

    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(labelId).toBeTruthy()
    expect(document.getElementById(labelId!)).toHaveTextContent('Accessible title')
  })

  it('uses shared zIndex on the drawer root', () => {
    render(() => (
      <Drawer open title="Layer" zIndex={1421}>
        Body
      </Drawer>
    ))

    const root = document.body.querySelector<HTMLElement>('.ads-drawer-root')!
    expect(root.style.zIndex).toBe('1421')
  })

  it('raises nested consumer popups above the drawer root', () => {
    render(() => (
      <Drawer open title="Layer" zIndex={1421}>
        <Select open options={[{ value: 'one', label: 'One' }]} />
      </Drawer>
    ))

    const root = document.body.querySelector<HTMLElement>('.ads-drawer-root')!
    const dropdown = document.body.querySelector<HTMLElement>('.ads-select-dropdown')!
    expect(Number(dropdown.style.zIndex)).toBeGreaterThan(Number(root.style.zIndex))
  })

  it('supports size presets and custom size over deprecated width and height', () => {
    const { unmount } = render(() => (
      <Drawer open size="large" width={320}>
        Body
      </Drawer>
    ))

    expect(screen.getByRole('dialog')).toHaveStyle('width: 736px')
    unmount()

    render(() => (
      <Drawer open placement="top" size="50%" height={240}>
        Body
      </Drawer>
    ))

    expect(screen.getByRole('dialog')).toHaveStyle('height: 50%')
  })

  it('applies root, semantic class names, and semantic styles', () => {
    render(() => (
      <Drawer
        open
        title="Styled"
        rootClassName="custom-root"
        rootStyle={{ 'pointer-events': 'none' }}
        classNames={{
          mask: 'custom-mask',
          wrapper: 'custom-wrapper',
          header: 'custom-header',
          body: 'custom-body',
          footer: 'custom-footer',
        }}
        styles={{
          mask: { opacity: 0.5 },
          wrapper: { color: 'red' },
          header: { 'min-height': '11px' },
          body: { padding: '12px' },
          footer: { 'min-height': '13px' },
        }}
        footer="Footer"
      >
        Body
      </Drawer>
    ))

    expect(document.body.querySelector('.ads-drawer-root')).toHaveClass('custom-root')
    expect(document.body.querySelector<HTMLElement>('.custom-root')).toHaveStyle(
      'pointer-events: none',
    )
    expect(document.body.querySelector('.ads-drawer-mask')).toHaveClass('custom-mask')
    expect(document.body.querySelector<HTMLElement>('.ads-drawer-mask')).toHaveStyle('opacity: 0.5')
    expect(document.body.querySelector('.ads-drawer')).toHaveClass('custom-wrapper')
    expect(document.body.querySelector<HTMLElement>('.ads-drawer')).toHaveStyle(
      'color: rgb(255, 0, 0)',
    )
    expect(document.body.querySelector('.ads-drawer-header')).toHaveClass('custom-header')
    expect(document.body.querySelector<HTMLElement>('.ads-drawer-header')).toHaveStyle(
      'min-height: 11px',
    )
    expect(document.body.querySelector('.ads-drawer-body')).toHaveClass('custom-body')
    expect(document.body.querySelector<HTMLElement>('.ads-drawer-body')).toHaveStyle(
      'padding: 12px',
    )
    expect(document.body.querySelector('.ads-drawer-footer')).toHaveClass('custom-footer')
    expect(document.body.querySelector<HTMLElement>('.ads-drawer-footer')).toHaveStyle(
      'min-height: 13px',
    )
  })

  it('mounts into a custom container and supports inline rendering with getContainer false', () => {
    const container = document.createElement('div')
    document.body.append(container)

    const { unmount } = render(() => (
      <Drawer open getContainer={container}>
        Custom container
      </Drawer>
    ))

    expect(container.querySelector('.ads-drawer-root')).toBeInTheDocument()
    unmount()

    const result = render(() => (
      <section data-testid="host">
        <Drawer open getContainer={false}>
          Inline
        </Drawer>
      </section>
    ))

    expect(result.container.querySelector('.ads-drawer-root')).toBeInTheDocument()
  })

  it('force renders closed content and destroyOnHidden removes hidden content', () => {
    const { unmount } = render(() => (
      <Drawer open={false} forceRender>
        Pre-rendered
      </Drawer>
    ))

    expect(screen.getByText('Pre-rendered')).toBeInTheDocument()
    expect(document.body.querySelector('.ads-drawer-root')).toHaveStyle('display: none')
    unmount()

    function Demo() {
      const [open, setOpen] = createSignal(true)
      return (
        <>
          <button onClick={() => setOpen(false)}>Hide</button>
          <Drawer open={open()} destroyOnHidden>
            Destroy hidden
          </Drawer>
        </>
      )
    }

    render(() => <Demo />)
    fireEvent.click(screen.getByText('Hide'))

    expect(screen.queryByText('Destroy hidden')).toBeNull()
  })

  it('supports object closable options and object mask options', () => {
    const onClose = vi.fn()
    render(() => (
      <Drawer
        open
        title="Options"
        onClose={onClose}
        closable={{ disabled: true, closeIcon: 'X', placement: 'start' }}
        mask={{ enabled: true, blur: true, closable: false }}
      >
        Body
      </Drawer>
    ))

    expect(screen.getByRole('button', { name: 'close drawer' })).toHaveTextContent('X')
    expect(document.body.querySelector('.ads-drawer-close')).toHaveAttribute('disabled')
    expect(document.body.querySelector('.ads-drawer-header')).toHaveClass(
      'ads-drawer-header-close-start',
    )
    expect(document.body.querySelector('.ads-drawer-mask')).toHaveClass('ads-drawer-mask-blur')

    fireEvent.click(screen.getByRole('button', { name: 'close drawer' }))
    fireEvent.click(document.body.querySelector('.ads-drawer-mask')!)

    expect(onClose).not.toHaveBeenCalled()
  })

  it('shows loading state instead of children', () => {
    render(() => (
      <Drawer open loading>
        Body
      </Drawer>
    ))

    expect(document.body.querySelector('.ads-drawer-loading')).toBeInTheDocument()
    expect(screen.queryByText('Body')).toBeNull()
  })

  it('wraps drawer content with drawerRender', () => {
    render(() => (
      <Drawer open drawerRender={(node) => <div data-testid="custom-render">{node}</div>}>
        Body
      </Drawer>
    ))

    expect(screen.getByTestId('custom-render')).toContainElement(screen.getByText('Body'))
  })

  it('supports focus management and returns focus after close', () => {
    function Demo() {
      const [open, setOpen] = createSignal(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>Trigger</button>
          <Drawer
            open={open()}
            focusable={{ focusTriggerAfterClose: true }}
            onClose={() => setOpen(false)}
          >
            <button>Inside</button>
          </Drawer>
        </>
      )
    }

    render(() => <Demo />)
    const trigger = screen.getByText('Trigger')
    trigger.focus()
    fireEvent.click(trigger)

    expect(screen.getByRole('dialog')).toHaveFocus()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(trigger).toHaveFocus()
  })

  it('pushes parent drawer when nested drawer opens', () => {
    render(() => (
      <Drawer open push={{ distance: 120 }}>
        Parent
        <Drawer open>Child</Drawer>
      </Drawer>
    ))

    const drawers = document.body.querySelectorAll<HTMLElement>('.ads-drawer')
    expect(drawers[0]).toHaveStyle('transform: translateX(-120px)')
  })

  it('supports resizing with maxSize and resize callbacks', () => {
    const onResizeStart = vi.fn()
    const onResize = vi.fn()
    const onResizeEnd = vi.fn()
    render(() => (
      <Drawer open width={300} maxSize={320} resizable={{ onResizeStart, onResize, onResizeEnd }}>
        Body
      </Drawer>
    ))

    const handle = document.body.querySelector<HTMLElement>('.ads-drawer-resize-handle')!
    fireEvent.pointerDown(handle, { clientX: 0, clientY: 0, pointerId: 1 })
    fireEvent.pointerMove(document, { clientX: -50, clientY: 0 })
    fireEvent.pointerUp(document)

    expect(onResizeStart).toHaveBeenCalledTimes(1)
    expect(onResize).toHaveBeenLastCalledWith(320)
    expect(onResizeEnd).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('dialog')).toHaveStyle('width: 320px')
  })
})
