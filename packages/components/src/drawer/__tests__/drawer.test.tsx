import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import { StyleProvider, createCache, extractStyle } from '@solid-ant-design/cssinjs'
import { createSignal } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Select } from '../../select'
import { Drawer } from '../drawer'

describe('Drawer', () => {
  beforeEach(() => {
    cleanup()
    vi.useRealTimers()
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
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

  it('respects mask closable and keyboard false', () => {
    const onClose = vi.fn()
    render(() => (
      <Drawer open mask={{ closable: false }} keyboard={false} onClose={onClose}>
        Body
      </Drawer>
    ))

    fireEvent.click(document.body.querySelector('.ads-drawer-mask')!)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
  })

  it('supports placement sizing and destroyOnHidden', () => {
    vi.useFakeTimers()
    function Demo() {
      const [open, setOpen] = createSignal(true)
      return (
        <>
          <button onClick={() => setOpen(false)}>Close</button>
          <Drawer open={open()} placement="bottom" size={240} destroyOnHidden>
            Body
          </Drawer>
        </>
      )
    }

    render(() => <Demo />)

    expect(screen.getByRole('dialog')).toHaveStyle('height: 240px')
    expect(document.body.querySelector('.ads-drawer-bottom')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Close'))

    expect(screen.getByText('Body')).toBeInTheDocument()
    vi.advanceTimersByTime(500)
    expect(screen.queryByText('Body')).toBeNull()
  })

  it('calls afterOpenChange when open changes', () => {
    vi.useFakeTimers()
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

    expect(afterOpenChange).not.toHaveBeenCalled()
    vi.advanceTimersByTime(500)
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
    vi.useFakeTimers()
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
    expect(document.body.querySelector('.ads-drawer-root')).not.toHaveStyle('display: none')
    vi.advanceTimersByTime(500)
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

  it('supports size presets and custom sizes', () => {
    const { unmount } = render(() => (
      <Drawer open size="large">
        Body
      </Drawer>
    ))

    expect(screen.getByRole('dialog')).toHaveStyle('width: 736px')
    unmount()

    render(() => (
      <Drawer open placement="top" size="50%">
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
        rootClass="custom-root"
        rootStyle={{ 'pointer-events': 'none' }}
        classNames={{
          root: 'semantic-root',
          mask: 'custom-mask',
          wrapper: 'custom-wrapper',
          section: 'custom-section',
          header: 'custom-header',
          title: 'custom-title',
          extra: 'custom-extra',
          body: 'custom-body',
          footer: 'custom-footer',
          close: 'custom-close',
        }}
        styles={{
          root: { outline: '1px solid red' },
          mask: { opacity: 0.5 },
          wrapper: { color: 'red' },
          section: { background: 'rgb(250, 250, 250)' },
          header: { 'min-height': '11px' },
          title: { color: 'blue' },
          extra: { color: 'green' },
          body: { padding: '12px' },
          footer: { 'min-height': '13px' },
          close: { color: 'purple' },
        }}
        extra="Extra"
        footer="Footer"
      >
        Body
      </Drawer>
    ))

    expect(document.body.querySelector('.ads-drawer-root')).toHaveClass(
      'custom-root',
      'semantic-root',
    )
    expect(document.body.querySelector<HTMLElement>('.custom-root')).toHaveStyle(
      'pointer-events: none',
    )
    expect(document.body.querySelector<HTMLElement>('.custom-root')).toHaveStyle(
      'outline: 1px solid red',
    )
    expect(document.body.querySelector('.ads-drawer-mask')).toHaveClass('custom-mask')
    expect(document.body.querySelector<HTMLElement>('.ads-drawer-mask')).toHaveStyle('opacity: 0.5')
    expect(document.body.querySelector('.ads-drawer-content-wrapper')).toHaveClass('custom-wrapper')
    expect(document.body.querySelector<HTMLElement>('.ads-drawer-content-wrapper')).toHaveStyle(
      'color: rgb(255, 0, 0)',
    )
    expect(document.body.querySelector('.ads-drawer-section')).toHaveClass('custom-section')
    expect(document.body.querySelector<HTMLElement>('.ads-drawer-section')).toHaveStyle(
      'background: rgb(250, 250, 250)',
    )
    expect(document.body.querySelector('.ads-drawer-header')).toHaveClass('custom-header')
    expect(document.body.querySelector<HTMLElement>('.ads-drawer-header')).toHaveStyle(
      'min-height: 11px',
    )
    expect(document.body.querySelector('.ads-drawer-title')).toHaveClass('custom-title')
    expect(document.body.querySelector<HTMLElement>('.ads-drawer-title')).toHaveStyle(
      'color: rgb(0, 0, 255)',
    )
    expect(document.body.querySelector('.ads-drawer-extra')).toHaveClass('custom-extra')
    expect(document.body.querySelector<HTMLElement>('.ads-drawer-extra')).toHaveStyle(
      'color: rgb(0, 128, 0)',
    )
    expect(document.body.querySelector('.ads-drawer-body')).toHaveClass('custom-body')
    expect(document.body.querySelector<HTMLElement>('.ads-drawer-body')).toHaveStyle(
      'padding: 12px',
    )
    expect(document.body.querySelector('.ads-drawer-footer')).toHaveClass('custom-footer')
    expect(document.body.querySelector<HTMLElement>('.ads-drawer-footer')).toHaveStyle(
      'min-height: 13px',
    )
    expect(document.body.querySelector('.ads-drawer-close')).toHaveClass('custom-close')
    expect(document.body.querySelector<HTMLElement>('.ads-drawer-close')).toHaveStyle(
      'color: rgb(128, 0, 128)',
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

  it('uses absolute positioning for getContainer false inline rendering', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <section data-testid="host">
          <Drawer open getContainer={false}>
            Inline
          </Drawer>
        </section>
      </StyleProvider>
    ))

    expect(screen.getByTestId('host').querySelector('.ads-drawer-root')).toHaveClass(
      'ads-drawer-inline',
    )
    expect(extractStyle(cache)).toContain('.ads-drawer-root.ads-drawer-inline{position:absolute;')
  })

  it('force renders closed content and destroyOnHidden removes hidden content', () => {
    vi.useFakeTimers()
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

    expect(screen.getByText('Destroy hidden')).toBeInTheDocument()
    vi.advanceTimersByTime(500)
    expect(screen.queryByText('Destroy hidden')).toBeNull()
  })

  it('applies antd-style mask and panel motion classes while opening and closing', () => {
    vi.useFakeTimers()
    function Demo() {
      const [open, setOpen] = createSignal(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>Open</button>
          <button onClick={() => setOpen(false)}>Close</button>
          <Drawer open={open()} placement="right">
            Body
          </Drawer>
        </>
      )
    }

    render(() => <Demo />)
    fireEvent.click(screen.getByText('Open'))

    const root = document.body.querySelector('.ads-drawer-root')!
    const mask = document.body.querySelector('.ads-drawer-mask')!
    const wrapper = document.body.querySelector('.ads-drawer-content-wrapper')!

    expect(root).not.toHaveStyle('display: none')
    expect(mask).toHaveClass('ads-drawer-mask-motion-enter')
    expect(mask).not.toHaveClass('ads-drawer-mask-motion-enter-active')
    expect(wrapper).toHaveClass('ads-drawer-panel-motion-right-enter')
    expect(wrapper).not.toHaveClass('ads-drawer-panel-motion-right-enter-active')

    vi.advanceTimersByTime(0)

    expect(mask).toHaveClass('ads-drawer-mask-motion-enter', 'ads-drawer-mask-motion-enter-active')
    expect(wrapper).toHaveClass(
      'ads-drawer-panel-motion-right-enter',
      'ads-drawer-panel-motion-right-enter-active',
    )

    vi.advanceTimersByTime(500)

    expect(mask).not.toHaveClass('ads-drawer-mask-motion-enter')
    expect(wrapper).not.toHaveClass('ads-drawer-panel-motion-right-enter')

    fireEvent.click(screen.getByText('Close'))

    expect(root).not.toHaveStyle('display: none')
    expect(mask).toHaveClass('ads-drawer-mask-motion-leave')
    expect(mask).not.toHaveClass('ads-drawer-mask-motion-leave-active')
    expect(wrapper).toHaveClass('ads-drawer-panel-motion-right-leave')
    expect(wrapper).not.toHaveClass('ads-drawer-panel-motion-right-leave-active')

    vi.advanceTimersByTime(0)

    expect(mask).toHaveClass('ads-drawer-mask-motion-leave', 'ads-drawer-mask-motion-leave-active')
    expect(wrapper).toHaveClass(
      'ads-drawer-panel-motion-right-leave',
      'ads-drawer-panel-motion-right-leave-active',
    )

    vi.advanceTimersByTime(500)

    expect(root).toHaveStyle('display: none')
  })

  it('supports object closable options and object mask options', () => {
    const onClose = vi.fn()
    render(() => (
      <Drawer
        open
        title="Options"
        onClose={onClose}
        closeIcon="X"
        closable={{ disabled: true, placement: 'end' }}
        mask={{ enabled: true, blur: true, closable: false }}
      >
        Body
      </Drawer>
    ))

    expect(screen.getByRole('button', { name: 'close drawer' })).toHaveTextContent('X')
    expect(document.body.querySelector('.ads-drawer-close')).toHaveAttribute('disabled')
    expect(document.body.querySelector('.ads-drawer-close')).toHaveClass('ads-drawer-close-end')
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
    vi.useFakeTimers()
    function Demo() {
      const [open, setOpen] = createSignal(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>Trigger</button>
          <Drawer open={open()} onClose={() => setOpen(false)}>
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

    expect(trigger).not.toHaveFocus()
    vi.advanceTimersByTime(500)
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
      <Drawer open size={300} maxSize={320} resizable={{ onResizeStart, onResize, onResizeEnd }}>
        Body
      </Drawer>
    ))

    const handle = document.body.querySelector<HTMLElement>('.ads-drawer-resizable-dragger')!
    fireEvent.pointerDown(handle, { clientX: 0, clientY: 0, pointerId: 1 })
    fireEvent.pointerMove(document, { clientX: -50, clientY: 0 })
    fireEvent.pointerUp(document)

    expect(onResizeStart).toHaveBeenCalledTimes(1)
    expect(onResize).toHaveBeenLastCalledWith(320)
    expect(onResizeEnd).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('dialog')).toHaveStyle('width: 320px')
  })

  it('supports semantic dragger classes and styles', () => {
    render(() => (
      <Drawer
        open
        resizable
        classNames={{ dragger: 'custom-dragger' }}
        styles={{ dragger: { background: 'red' } }}
      >
        Body
      </Drawer>
    ))

    const dragger = document.body.querySelector<HTMLElement>('.ads-drawer-resizable-dragger')!
    expect(dragger).toHaveClass('custom-dragger')
    expect(dragger).toHaveStyle('background: red')
  })

  it('merges ConfigProvider drawer defaults with local props', () => {
    const onClose = vi.fn()
    render(() => (
      <ConfigProvider
        drawer={{
          class: 'global-panel',
          rootClass: 'global-root',
          style: { color: 'red' },
          rootStyle: { 'pointer-events': 'none' },
          classNames: { header: 'global-header', close: 'global-close' },
          styles: { header: { 'min-height': '15px' }, close: { color: 'blue' } },
          closable: { disabled: true, placement: 'end' },
          mask: { blur: true, closable: false },
          focusable: { focusTriggerAfterClose: false },
        }}
      >
        <Drawer
          open
          title="Global"
          class="local-panel"
          rootClass="local-root"
          classNames={{ header: 'local-header' }}
          onClose={onClose}
        >
          Body
        </Drawer>
      </ConfigProvider>
    ))

    expect(document.body.querySelector('.ads-drawer-root')).toHaveClass('global-root', 'local-root')
    expect(document.body.querySelector<HTMLElement>('.ads-drawer-root')).toHaveStyle(
      'pointer-events: none',
    )
    expect(document.body.querySelector('.ads-drawer-content-wrapper')).toHaveClass(
      'global-panel',
      'local-panel',
    )
    expect(document.body.querySelector<HTMLElement>('.ads-drawer-content-wrapper')).toHaveStyle(
      'color: rgb(255, 0, 0)',
    )
    expect(document.body.querySelector('.ads-drawer-header')).toHaveClass(
      'global-header',
      'local-header',
    )
    expect(document.body.querySelector<HTMLElement>('.ads-drawer-header')).toHaveStyle(
      'min-height: 15px',
    )
    expect(document.body.querySelector('.ads-drawer-close')).toHaveClass(
      'global-close',
      'ads-drawer-close-end',
    )
    expect(document.body.querySelector<HTMLElement>('.ads-drawer-close')).toHaveStyle(
      'color: rgb(0, 0, 255)',
    )
    expect(document.body.querySelector('.ads-drawer-mask')).toHaveClass('ads-drawer-mask-blur')

    fireEvent.click(document.body.querySelector('.ads-drawer-mask')!)
    fireEvent.click(screen.getByRole('button', { name: 'close drawer' }))

    expect(onClose).not.toHaveBeenCalled()
  })
})
