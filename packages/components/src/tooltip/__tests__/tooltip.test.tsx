import { cleanup, fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import type { TooltipRef } from '../index'
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

  const visibleTooltips = () =>
    document.body.querySelectorAll('.ads-tooltip:not(.ads-tooltip-hidden)')

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
    expect(visibleTooltips()).toHaveLength(0)
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
    expect(visibleTooltips()).toHaveLength(0)
  })

  it('opens on focus and closes on blur', () => {
    const result = render(() => (
      <Tooltip title="Focused" trigger="focus">
        <button type="button">Trigger</button>
      </Tooltip>
    ))
    const trigger = result.container.querySelector('button')!

    fireEvent.focusIn(trigger)
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Focused')

    fireEvent.focusOut(trigger)
    expect(visibleTooltips()).toHaveLength(0)
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
    expect(visibleTooltips()).toHaveLength(0)
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

  it('supports edge placements from the antd api', () => {
    render(() => (
      <Tooltip title="Placed" placement="topLeft" open>
        <button type="button">Trigger</button>
      </Tooltip>
    ))

    expect(document.body.querySelector('.ads-tooltip-topLeft')).toHaveTextContent('Placed')
  })

  it('supports multiple triggers and contextMenu trigger', () => {
    const result = render(() => (
      <Tooltip title="Multi" trigger={['focus', 'contextMenu']}>
        <button type="button">Trigger</button>
      </Tooltip>
    ))
    const trigger = result.container.querySelector('.ads-tooltip-trigger')!

    fireEvent.focus(trigger)
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Multi')

    fireEvent.blur(trigger)
    expect(visibleTooltips()).toHaveLength(0)

    fireEvent.contextMenu(trigger)
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Multi')

    fireEvent.pointerDown(document.body)
    expect(visibleTooltips()).toHaveLength(0)

    fireEvent.contextMenu(trigger)
    expect(document.body.querySelector('.ads-tooltip:not(.ads-tooltip-hidden)')).toHaveTextContent(
      'Multi',
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(visibleTooltips()).toHaveLength(0)
  })

  it('applies color, semantic classNames, semantic styles, and solid class aliases', () => {
    render(() => (
      <Tooltip
        title="Styled"
        open
        color="#1677ff"
        rootClass="root-extra"
        overlayClass="legacy-root"
        overlayInnerStyle={{ padding: '7px' }}
        classNames={{ root: 'root-slot', container: 'container-slot', arrow: 'arrow-slot' }}
        styles={{
          root: { border: '1px solid rgb(255, 0, 0)' },
          container: { 'font-weight': 700 },
          arrow: { width: '10px' },
        }}
      >
        <button type="button">Trigger</button>
      </Tooltip>
    ))

    const root = document.body.querySelector<HTMLElement>('.ads-tooltip')!
    const container = document.body.querySelector<HTMLElement>('.ads-tooltip-inner')!
    const arrow = document.body.querySelector<HTMLElement>('.ads-tooltip-arrow')!

    expect(root).toHaveClass('root-extra', 'legacy-root', 'root-slot')
    expect(root.style.backgroundColor).toBe('rgb(22, 119, 255)')
    expect(root.style.border).toBe('1px solid rgb(255, 0, 0)')
    expect(container).toHaveClass('container-slot')
    expect(container.style.padding).toBe('7px')
    expect(container.style.fontWeight).toBe('700')
    expect(arrow).toHaveClass('arrow-slot')
    expect(arrow.style.width).toBe('10px')
  })

  it('can hide the arrow and point arrow at the trigger center', () => {
    render(() => (
      <>
        <Tooltip title="No arrow" open arrow={false}>
          <button type="button">A</button>
        </Tooltip>
        <Tooltip title="Centered" open arrow={{ pointAtCenter: true }} placement="bottomRight">
          <button type="button">B</button>
        </Tooltip>
      </>
    ))

    const overlays = document.body.querySelectorAll('.ads-tooltip')
    expect(overlays[0].querySelector('.ads-tooltip-arrow')).toBeFalsy()
    expect(overlays[1]).toHaveClass('ads-tooltip-arrow-point-at-center')
    expect(overlays[1].querySelector('.ads-tooltip-arrow')).toBeTruthy()
  })

  it('keeps hidden content mounted by default and destroys it when destroyOnHidden is true', () => {
    const [open, setOpen] = createSignal(false)
    render(() => (
      <Tooltip title="Cached" open={open()}>
        <button type="button">Trigger</button>
      </Tooltip>
    ))

    setOpen(true)
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Cached')
    setOpen(false)
    expect(document.body.querySelector('[role="tooltip"]')).toBeTruthy()
    expect(document.body.querySelector('.ads-tooltip-hidden')).toBeTruthy()

    cleanup()
    document.body.innerHTML = ''

    const [destroyOpen, setDestroyOpen] = createSignal(false)
    render(() => (
      <Tooltip title="Destroyed" open={destroyOpen()} destroyOnHidden>
        <button type="button">Trigger</button>
      </Tooltip>
    ))

    setDestroyOpen(true)
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Destroyed')
    setDestroyOpen(false)
    expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()
  })

  it('caches closed title unless fresh is set', () => {
    const [open, setOpen] = createSignal(true)
    const [title, setTitle] = createSignal('Initial')
    render(() => (
      <Tooltip title={title()} open={open()}>
        <button type="button">Trigger</button>
      </Tooltip>
    ))

    setOpen(false)
    setTitle('Updated')
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Initial')

    cleanup()
    document.body.innerHTML = ''

    const [freshOpen, setFreshOpen] = createSignal(true)
    const [freshTitle, setFreshTitle] = createSignal('Fresh initial')
    render(() => (
      <Tooltip title={freshTitle()} open={freshOpen()} fresh>
        <button type="button">Trigger</button>
      </Tooltip>
    ))

    setFreshOpen(false)
    setFreshTitle('Fresh updated')
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Fresh updated')
  })

  it('calls afterOpenChange and exposes TooltipRef methods and elements', () => {
    const afterOpenChange = vi.fn()
    let tooltipRef: TooltipRef | undefined
    const [open, setOpen] = createSignal(false)

    render(() => (
      <Tooltip
        ref={(ref) => {
          tooltipRef = ref
        }}
        title="Ref"
        open={open()}
        afterOpenChange={afterOpenChange}
      >
        <button type="button">Trigger</button>
      </Tooltip>
    ))

    setOpen(true)
    expect(afterOpenChange).toHaveBeenCalledWith(true)
    expect(tooltipRef?.nativeElement).toHaveClass('ads-tooltip-trigger')
    expect(tooltipRef?.popupElement).toHaveClass('ads-tooltip')
    expect(() => tooltipRef?.forceAlign()).not.toThrow()
  })

  it('forceAlign recalculates overlay position from the current trigger rect', () => {
    let tooltipRef: TooltipRef | undefined
    const rects = [
      { top: 50, left: 60, right: 100, bottom: 80, width: 40, height: 30 },
      { top: 90, left: 120, right: 180, bottom: 130, width: 60, height: 40 },
    ]
    let rectIndex = 0

    const result = render(() => (
      <Tooltip
        ref={(ref) => {
          tooltipRef = ref
        }}
        title="Aligned"
        open
        autoAdjustOverflow={false}
      >
        <button type="button">Trigger</button>
      </Tooltip>
    ))

    const trigger = result.container.querySelector<HTMLElement>('.ads-tooltip-trigger')!
    trigger.getBoundingClientRect = vi.fn(
      () => rects[rectIndex] as DOMRect,
    ) as HTMLElement['getBoundingClientRect']

    tooltipRef?.forceAlign()
    const overlay = document.body.querySelector<HTMLElement>('.ads-tooltip')!
    expect(overlay.style.top).toBe('42px')
    expect(overlay.style.left).toBe('80px')

    rectIndex = 1
    tooltipRef?.forceAlign()
    expect(overlay.style.top).toBe('82px')
    expect(overlay.style.left).toBe('150px')
  })

  it('supports ConfigProvider tooltip defaults and unique display', () => {
    const result = render(() => (
      <ConfigProvider tooltip={{ trigger: 'click', unique: true, arrow: false }}>
        <Tooltip title="First">
          <button type="button">First</button>
        </Tooltip>
        <Tooltip title="Second">
          <button type="button">Second</button>
        </Tooltip>
      </ConfigProvider>
    ))
    const triggers = result.container.querySelectorAll('.ads-tooltip-trigger')

    fireEvent.click(triggers[0])
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('First')
    expect(document.body.querySelector('.ads-tooltip-arrow')).toBeFalsy()

    fireEvent.click(triggers[1])
    expect(document.body.querySelectorAll('.ads-tooltip:not(.ads-tooltip-hidden)')).toHaveLength(1)
    expect(document.body.querySelector('.ads-tooltip:not(.ads-tooltip-hidden)')).toHaveTextContent(
      'Second',
    )
  })
})

it('uses explicit zIndex and custom popup container', () => {
  const popupContainer = document.createElement('div')
  document.body.appendChild(popupContainer)
  const result = render(() => (
    <Tooltip title="Layer" open zIndex={1234} getPopupContainer={() => popupContainer}>
      <button>trigger</button>
    </Tooltip>
  ))

  const overlay = popupContainer.querySelector<HTMLElement>('.ads-tooltip')!
  expect(overlay).toHaveTextContent('Layer')
  expect(overlay.style.zIndex).toBe('1234')
  expect(result.container.querySelector('.ads-tooltip')).toBeFalsy()
})
