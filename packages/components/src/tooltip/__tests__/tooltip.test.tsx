import { cleanup, fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Tooltip } from '../index'

describe('Tooltip', () => {
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
      <Tooltip
        title="Helpful"
        mouseEnterDelay={0.1}
        mouseLeaveDelay={0.2}
        onOpenChange={onOpenChange}
      >
        <button type="button">Trigger</button>
      </Tooltip>
    ))
    const trigger = result.container.querySelector('.ads-tooltip-trigger')!

    fireEvent.mouseEnter(trigger)
    expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()

    vi.advanceTimersByTime(100)
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Helpful')
    expect(onOpenChange).toHaveBeenCalledWith(true)

    fireEvent.mouseLeave(trigger)
    vi.advanceTimersByTime(199)
    expect(document.body.querySelector('[role="tooltip"]')).toBeTruthy()

    vi.advanceTimersByTime(1)
    expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('toggles overlay on click', () => {
    const result = render(() => (
      <Tooltip title="Clicked" trigger="click">
        <button type="button">Trigger</button>
      </Tooltip>
    ))
    const trigger = result.container.querySelector('.ads-tooltip-trigger')!

    fireEvent.click(trigger)
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Clicked')

    fireEvent.click(trigger)
    expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()
  })

  it('opens on focus and closes on blur', () => {
    const result = render(() => (
      <Tooltip title="Focused" trigger="focus">
        <button type="button">Trigger</button>
      </Tooltip>
    ))
    const trigger = result.container.querySelector('.ads-tooltip-trigger')!

    fireEvent.focus(trigger)
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Focused')

    fireEvent.blur(trigger)
    expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()
  })

  it('renders controlled open overlay and placement class', () => {
    const [open, setOpen] = createSignal(true)
    render(() => (
      <Tooltip title="Controlled" placement="bottom" open={open()}>
        <button type="button">Trigger</button>
      </Tooltip>
    ))

    expect(document.body.querySelector('.ads-tooltip-bottom')).toHaveTextContent('Controlled')

    setOpen(false)
    expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()
  })

  it('suppresses overlay for an empty title', () => {
    const result = render(() => (
      <Tooltip title="" defaultOpen>
        <button type="button">Trigger</button>
      </Tooltip>
    ))

    expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()

    fireEvent.mouseEnter(result.container.querySelector('.ads-tooltip-trigger')!)
    vi.runAllTimers()
    expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()
  })

  it('applies custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Tooltip title="Custom" defaultOpen>
          <button type="button">Trigger</button>
        </Tooltip>
      </ConfigProvider>
    ))

    expect(result.container.querySelector('.custom-tooltip-trigger')).toBeTruthy()
    expect(document.body.querySelector('.custom-tooltip')).toHaveTextContent('Custom')
    expect(document.body.querySelector('.ads-tooltip')).toBeFalsy()
  })
})
