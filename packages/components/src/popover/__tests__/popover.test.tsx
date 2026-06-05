import { cleanup, fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Popover } from '../index'

describe('Popover', () => {
  beforeEach(() => {
    cleanup()
    document.body.innerHTML = ''
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    document.body.innerHTML = ''
  })

  it('opens and closes overlay on hover with delays and onOpenChange', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <Popover
        title="Title"
        content="Helpful content"
        mouseEnterDelay={0.1}
        mouseLeaveDelay={0.2}
        onOpenChange={onOpenChange}
      >
        <button type="button">Trigger</button>
      </Popover>
    ))
    const trigger = result.container.querySelector('.ads-popover-trigger')!

    fireEvent.mouseEnter(trigger)
    expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()

    vi.advanceTimersByTime(100)
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Title')
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Helpful content')
    expect(onOpenChange).toHaveBeenCalledWith(true)

    fireEvent.mouseLeave(trigger)
    vi.advanceTimersByTime(199)
    expect(document.body.querySelector('[role="tooltip"]')).toBeTruthy()

    vi.advanceTimersByTime(1)
    expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('toggles overlay on click and closes on outside pointer down', () => {
    const result = render(() => (
      <Popover content="Clicked content" trigger="click">
        <button type="button">Trigger</button>
      </Popover>
    ))
    const trigger = result.container.querySelector('.ads-popover-trigger')!

    fireEvent.click(trigger)
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Clicked content')

    fireEvent.pointerDown(document.body)
    expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()
  })

  it('opens on focus and closes on blur', () => {
    const result = render(() => (
      <Popover content="Focused content" trigger="focus">
        <button type="button">Trigger</button>
      </Popover>
    ))
    const trigger = result.container.querySelector('.ads-popover-trigger')!

    fireEvent.focus(trigger)
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Focused content')

    fireEvent.blur(trigger)
    expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()
  })

  it('renders controlled open overlay and placement class', () => {
    const [open, setOpen] = createSignal(true)
    render(() => (
      <Popover content="Controlled content" placement="bottom" open={open()}>
        <button type="button">Trigger</button>
      </Popover>
    ))

    expect(document.body.querySelector('.ads-popover-bottom')).toHaveTextContent(
      'Controlled content',
    )

    setOpen(false)
    expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()
  })

  it('suppresses overlay when both title and content are empty', () => {
    const result = render(() => (
      <Popover title="" content={null} defaultOpen>
        <button type="button">Trigger</button>
      </Popover>
    ))

    expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()

    fireEvent.mouseEnter(result.container.querySelector('.ads-popover-trigger')!)
    vi.runAllTimers()
    expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()
  })

  it('applies custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Popover content="Custom content" defaultOpen>
          <button type="button">Trigger</button>
        </Popover>
      </ConfigProvider>
    ))

    expect(result.container.querySelector('.custom-popover-trigger')).toBeTruthy()
    expect(document.body.querySelector('.custom-popover')).toHaveTextContent('Custom content')
    expect(document.body.querySelector('.ads-popover')).toBeFalsy()
  })

  it('applies overlayClass and overlayStyle to the overlay', () => {
    render(() => (
      <Popover
        content="Styled content"
        defaultOpen
        overlayClass="custom-overlay"
        overlayStyle={{ width: '240px' }}
      >
        <button type="button">Trigger</button>
      </Popover>
    ))

    const overlay = document.body.querySelector('.ads-popover') as HTMLElement
    expect(overlay).toHaveClass('custom-overlay')
    expect(overlay.style.width).toBe('240px')
  })
})

it('uses explicit zIndex and custom popup container', () => {
  const popupContainer = document.createElement('div')
  document.body.appendChild(popupContainer)
  const result = render(() => (
    <Popover content="Layer" open zIndex={1235} getPopupContainer={() => popupContainer}>
      <button>trigger</button>
    </Popover>
  ))

  const overlay = popupContainer.querySelector<HTMLElement>('.ads-popover')!
  expect(overlay).toHaveTextContent('Layer')
  expect(overlay.style.zIndex).toBe('1235')
  expect(result.container.querySelector('.ads-popover')).toBeFalsy()
})
