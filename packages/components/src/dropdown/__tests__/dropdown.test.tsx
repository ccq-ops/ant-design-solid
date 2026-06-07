import { cleanup, fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Dropdown } from '../index'

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

describe('Dropdown', () => {
  beforeEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('opens overlay on click trigger with default bottomLeft class', () => {
    const result = render(() => (
      <Dropdown menu={{ items: [{ key: 'profile', label: 'Profile' }] }}>
        <button type="button">Actions</button>
      </Dropdown>
    ))

    fireEvent.click(result.container.querySelector('.ads-dropdown-trigger')!)

    expect(document.body.querySelector('.ads-dropdown')).toHaveClass('ads-dropdown-bottomLeft')
    expect(document.body.querySelector('[role="menu"]')).toHaveTextContent('Profile')
  })

  it('opens and closes overlay on hover trigger', () => {
    vi.useFakeTimers()
    const result = render(() => (
      <Dropdown trigger="hover" menu={{ items: [{ key: 'edit', label: 'Edit' }] }}>
        <button type="button">Actions</button>
      </Dropdown>
    ))
    const trigger = result.container.querySelector('.ads-dropdown-trigger')!

    fireEvent.mouseEnter(trigger)
    expect(document.body.querySelector('[role="menu"]')).toHaveTextContent('Edit')

    fireEvent.mouseLeave(trigger)
    vi.advanceTimersByTime(200)

    expect(document.body.querySelector('[role="menu"]')).toBeFalsy()
    vi.useRealTimers()
  })
  it('keeps hover overlay open when moving from trigger into the portaled overlay', () => {
    vi.useFakeTimers()
    const result = render(() => (
      <Dropdown trigger="hover" menu={{ items: [{ key: 'edit', label: 'Edit' }] }}>
        <button type="button">Actions</button>
      </Dropdown>
    ))
    const trigger = result.container.querySelector('.ads-dropdown-trigger')!

    fireEvent.mouseEnter(trigger)
    const overlay = document.body.querySelector<HTMLElement>('.ads-dropdown')!
    expect(overlay).toBeTruthy()

    fireEvent.mouseLeave(trigger, { relatedTarget: document.body })
    expect(document.body.querySelector('[role="menu"]')).toHaveTextContent('Edit')

    fireEvent.mouseEnter(overlay, { relatedTarget: document.body })
    vi.advanceTimersByTime(200)

    expect(document.body.querySelector('[role="menu"]')).toHaveTextContent('Edit')

    fireEvent.mouseLeave(overlay, { relatedTarget: document.body })
    vi.advanceTimersByTime(200)

    expect(document.body.querySelector('[role="menu"]')).toBeFalsy()
    vi.useRealTimers()
  })

  it('calls menu onClick and closes when clicking an enabled item', () => {
    const onClick = vi.fn()
    const result = render(() => (
      <Dropdown menu={{ items: [{ key: 'delete', label: 'Delete' }], onClick }}>
        <button type="button">Actions</button>
      </Dropdown>
    ))

    fireEvent.click(result.container.querySelector('.ads-dropdown-trigger')!)
    const item = document.body.querySelector<HTMLElement>('[data-menu-key="delete"]')!
    fireEvent.click(item)

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledWith({ key: 'delete', domEvent: expect.any(MouseEvent) })
    expect(document.body.querySelector('[role="menu"]')).toBeFalsy()
  })

  it('does not call menu onClick or close when clicking a disabled item', () => {
    const onClick = vi.fn()
    const result = render(() => (
      <Dropdown menu={{ items: [{ key: 'archive', label: 'Archive', disabled: true }], onClick }}>
        <button type="button">Actions</button>
      </Dropdown>
    ))

    fireEvent.click(result.container.querySelector('.ads-dropdown-trigger')!)
    const item = document.body.querySelector<HTMLElement>('[data-menu-key="archive"]')!
    fireEvent.click(item)

    expect(item).toHaveAttribute('aria-disabled', 'true')
    expect(onClick).not.toHaveBeenCalled()
    expect(document.body.querySelector('[role="menu"]')).toBeTruthy()
  })

  it('renders divider as a separator', () => {
    const result = render(() => (
      <Dropdown
        menu={{
          items: [
            { key: 'new', label: 'New' },
            { key: 'divider', type: 'divider' },
            { key: 'open', label: 'Open' },
          ],
        }}
      >
        <button type="button">Actions</button>
      </Dropdown>
    ))

    fireEvent.click(result.container.querySelector('.ads-dropdown-trigger')!)

    expect(document.body.querySelector('[role="separator"]')).toBeTruthy()
  })

  it('supports controlled open, topRight placement, and custom prefix class', () => {
    const [open, setOpen] = createSignal(true)
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Dropdown
          open={open()}
          onOpenChange={setOpen}
          placement="topRight"
          overlayClass="extra-overlay"
          menu={{ items: [{ key: 'settings', label: 'Settings' }] }}
        >
          <button type="button">Actions</button>
        </Dropdown>
      </ConfigProvider>
    ))

    expect(result.container.querySelector('.custom-dropdown-trigger')).toBeTruthy()
    const overlay = document.body.querySelector('.custom-dropdown')
    expect(overlay).toHaveClass('custom-dropdown-topRight')
    expect(overlay).toHaveClass('extra-overlay')
    expect(overlay).toHaveTextContent('Settings')

    fireEvent.click(result.container.querySelector('.custom-dropdown-trigger')!)
    expect(open()).toBe(false)
  })
})

it('uses explicit zIndex and custom popup container', () => {
  const popupContainer = document.createElement('div')
  document.body.appendChild(popupContainer)
  render(() => (
    <Dropdown
      open
      zIndex={1240}
      getPopupContainer={() => popupContainer}
      menu={{ items: [{ key: 'one', label: 'One' }] }}
    >
      <button>trigger</button>
    </Dropdown>
  ))

  const overlay = popupContainer.querySelector<HTMLElement>('.ads-dropdown')!
  expect(overlay).toHaveTextContent('One')
  expect(overlay.style.zIndex).toBe('1240')
})

it('renders overlay in a portal with fixed positioning and explicit zIndex', () => {
  const result = render(() => (
    <Dropdown zIndex={1315} menu={{ items: [{ key: 'one', label: 'One' }] }}>
      <button type="button">Actions</button>
    </Dropdown>
  ))
  const trigger = result.container.querySelector('.ads-dropdown-trigger') as HTMLElement
  const rectSpy = vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
    top: 10,
    bottom: 42,
    left: 20,
    right: 220,
    width: 200,
    height: 32,
    x: 20,
    y: 10,
    toJSON: () => ({}),
  } as DOMRect)

  fireEvent.click(trigger)

  const overlay = document.body.querySelector<HTMLElement>('.ads-dropdown')!
  expect(overlay).toBeTruthy()
  expect(result.container.querySelector('.ads-dropdown')).toBeFalsy()
  expect(overlay.style.position).toBe('fixed')
  expect(overlay.style.top).toBe('46px')
  expect(overlay.style.left).toBe('20px')
  expect(overlay.style.zIndex).toBe('1315')
  rectSpy.mockRestore()
})

it('updates portaled overlay position when the page scrolls', () => {
  const result = render(() => (
    <Dropdown menu={{ items: [{ key: 'one', label: 'One' }] }}>
      <button type="button">Actions</button>
    </Dropdown>
  ))
  const trigger = result.container.querySelector('.ads-dropdown-trigger') as HTMLElement
  const rectSpy = vi
    .spyOn(trigger, 'getBoundingClientRect')
    .mockReturnValueOnce({
      top: 10,
      bottom: 42,
      left: 20,
      right: 220,
      width: 200,
      height: 32,
      x: 20,
      y: 10,
      toJSON: () => ({}),
    } as DOMRect)
    .mockReturnValueOnce({
      top: 10,
      bottom: 42,
      left: 20,
      right: 220,
      width: 200,
      height: 32,
      x: 20,
      y: 10,
      toJSON: () => ({}),
    } as DOMRect)
    .mockReturnValue({
      top: 30,
      bottom: 62,
      left: 40,
      right: 240,
      width: 200,
      height: 32,
      x: 40,
      y: 30,
      toJSON: () => ({}),
    } as DOMRect)

  fireEvent.click(trigger)

  const overlay = document.body.querySelector<HTMLElement>('.ads-dropdown')!
  expect(overlay.style.top).toBe('46px')
  expect(overlay.style.left).toBe('20px')

  window.dispatchEvent(new Event('scroll'))

  expect(overlay.style.top).toBe('66px')
  expect(overlay.style.left).toBe('40px')
  rectSpy.mockRestore()
})
