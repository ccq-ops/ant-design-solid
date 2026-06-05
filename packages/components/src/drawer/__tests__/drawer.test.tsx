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
})
