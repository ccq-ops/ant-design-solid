import { cleanup, fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Select } from '../../select'
import type { TooltipRef } from '../../tooltip'
import { Popover } from '../index'

describe('Popover', () => {
  const visiblePopovers = () =>
    document.body.querySelectorAll('.ads-popover:not(.ads-popover-hidden)')

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
    expect(visiblePopovers()).toHaveLength(1)

    vi.advanceTimersByTime(1)
    expect(visiblePopovers()).toHaveLength(0)
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
    expect(visiblePopovers()).toHaveLength(0)
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
    expect(visiblePopovers()).toHaveLength(0)
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
    expect(visiblePopovers()).toHaveLength(0)
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

  it('supports render functions for title and content', () => {
    const [title, setTitle] = createSignal('Initial title')
    const [content, setContent] = createSignal('Initial content')

    render(() => (
      <Popover title={() => title()} content={() => content()} open fresh>
        <button type="button">Trigger</button>
      </Popover>
    ))

    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Initial title')
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Initial content')

    setTitle('Updated title')
    setContent('Updated content')
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Updated title')
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Updated content')
  })

  it('supports multiple triggers and contextMenu trigger through Tooltip behavior', () => {
    const result = render(() => (
      <Popover content="Multi trigger" trigger={['focus', 'contextMenu']}>
        <button type="button">Trigger</button>
      </Popover>
    ))
    const trigger = result.container.querySelector('.ads-popover-trigger')!

    fireEvent.focusIn(trigger)
    expect(document.body.querySelector('.ads-popover:not(.ads-popover-hidden)')).toHaveTextContent(
      'Multi trigger',
    )

    fireEvent.focusOut(trigger)
    expect(document.body.querySelector('.ads-popover:not(.ads-popover-hidden)')).toBeFalsy()

    fireEvent.contextMenu(trigger)
    expect(document.body.querySelector('.ads-popover:not(.ads-popover-hidden)')).toHaveTextContent(
      'Multi trigger',
    )

    fireEvent.pointerDown(document.body)
    expect(document.body.querySelector('.ads-popover:not(.ads-popover-hidden)')).toBeFalsy()
  })

  it('applies arrow, color, semantic classNames, and semantic styles', () => {
    render(() => (
      <Popover
        title="Styled title"
        content="Styled content"
        open
        color="#1677ff"
        arrow={{ pointAtCenter: true }}
        rootClass="root-extra"
        overlayClass="legacy-root"
        overlayInnerStyle={{ padding: '7px' }}
        classNames={{
          root: 'root-slot',
          container: 'container-slot',
          arrow: 'arrow-slot',
          title: 'title-slot',
          content: 'content-slot',
        }}
        styles={{
          root: { border: '1px solid rgb(255, 0, 0)' },
          container: { 'font-weight': 700 },
          arrow: { width: '10px' },
          title: { color: 'rgb(255, 255, 0)' },
          content: { color: 'rgb(0, 255, 0)' },
        }}
      >
        <button type="button">Trigger</button>
      </Popover>
    ))

    const root = document.body.querySelector<HTMLElement>('.ads-popover')!
    const container = document.body.querySelector<HTMLElement>('.ads-popover-inner')!
    const arrow = document.body.querySelector<HTMLElement>('.ads-popover-arrow')!
    const title = document.body.querySelector<HTMLElement>('.ads-popover-title')!
    const content = document.body.querySelector<HTMLElement>('.ads-popover-content')!

    expect(root).toHaveClass(
      'ads-popover-arrow-point-at-center',
      'root-extra',
      'legacy-root',
      'root-slot',
    )
    expect(root.style.backgroundColor).toBe('rgb(22, 119, 255)')
    expect(root.style.border).toBe('1px solid rgb(255, 0, 0)')
    expect(container).toHaveClass('container-slot')
    expect(container.style.backgroundColor).toBe('rgb(22, 119, 255)')
    expect(container.style.padding).toBe('7px')
    expect(container.style.fontWeight).toBe('700')
    expect(arrow).toHaveClass('arrow-slot')
    expect(arrow.style.backgroundColor).toBe('rgb(22, 119, 255)')
    expect(arrow.style.width).toBe('10px')
    expect(title).toHaveClass('title-slot')
    expect(title.style.color).toBe('rgb(255, 255, 0)')
    expect(content).toHaveClass('content-slot')
    expect(content.style.color).toBe('rgb(0, 255, 0)')
  })

  it('keeps popover visuals isolated from ConfigProvider tooltip styling', () => {
    const result = render(() => (
      <ConfigProvider
        tooltip={{
          trigger: 'click',
          arrow: false,
          class: 'tooltip-root-config',
          style: { 'background-color': 'rgb(0, 0, 0)', color: 'rgb(255, 255, 255)' },
          classNames: { root: 'tooltip-root-slot', container: 'tooltip-container-slot' },
          styles: { root: { border: '3px solid rgb(255, 0, 0)' } },
        }}
      >
        <Popover content="Popover content">
          <button type="button">Trigger</button>
        </Popover>
      </ConfigProvider>
    ))
    const trigger = result.container.querySelector('.ads-popover-trigger')!

    fireEvent.mouseEnter(trigger)
    vi.runAllTimers()

    const root = document.body.querySelector<HTMLElement>('.ads-popover')!
    expect(root).toHaveTextContent('Popover content')
    expect(root).not.toHaveClass('tooltip-root-config', 'tooltip-root-slot')
    expect(root.style.backgroundColor).toBe('')
    expect(root.style.color).toBe('')
    expect(root.style.border).toBe('')
    expect(root.querySelector('.ads-popover-inner')).not.toHaveClass('tooltip-container-slot')
    expect(root.querySelector('.ads-popover-arrow')).toBeTruthy()
  })

  it('does not register tooltip dark background styles under the popover prefix', () => {
    render(() => (
      <Popover content="Light popover" open>
        <button type="button">Trigger</button>
      </Popover>
    ))

    const injectedStyles = Array.from(
      document.head.querySelectorAll<HTMLStyleElement>('style[data-ant-design-solid]'),
    )
      .map((style) => style.textContent ?? '')
      .join('\n')

    expect(document.body.querySelector('.ads-popover')).toHaveTextContent('Light popover')
    expect(injectedStyles).toContain('.ads-popover')
    expect(injectedStyles).toContain('background:#ffffff')
    expect(injectedStyles).toContain('.ads-popover.ads-popover{background:#ffffff')
    expect(injectedStyles).toContain('.ads-popover.ads-popover .ads-popover-inner')
    expect(injectedStyles).toContain('.ads-popover.ads-popover .ads-popover-arrow')
    expect(injectedStyles).not.toContain('.ads-popover{position: fixed; max-width: 250px')
    expect(injectedStyles).not.toContain('.ads-popover{position: fixed;max-width:250px')
    expect(injectedStyles).not.toContain('tooltip-skip-style')
    expect(injectedStyles).not.toContain('background: rgba(0, 0, 0, 0.85)')
  })

  it('can hide the arrow', () => {
    render(() => (
      <Popover content="No arrow" open arrow={false}>
        <button type="button">Trigger</button>
      </Popover>
    ))

    expect(document.body.querySelector('.ads-popover-arrow')).toBeFalsy()
  })

  it('keeps hidden content mounted by default and destroys it when destroyOnHidden is true', () => {
    const [open, setOpen] = createSignal(false)
    render(() => (
      <Popover content="Cached" open={open()}>
        <button type="button">Trigger</button>
      </Popover>
    ))

    setOpen(true)
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Cached')
    setOpen(false)
    expect(document.body.querySelector('[role="tooltip"]')).toBeTruthy()
    expect(document.body.querySelector('.ads-popover-hidden')).toBeTruthy()

    cleanup()
    document.body.innerHTML = ''

    const [destroyOpen, setDestroyOpen] = createSignal(false)
    render(() => (
      <Popover content="Destroyed" open={destroyOpen()} destroyOnHidden>
        <button type="button">Trigger</button>
      </Popover>
    ))

    setDestroyOpen(true)
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Destroyed')
    setDestroyOpen(false)
    expect(document.body.querySelector('[role="tooltip"]')).toBeFalsy()
  })

  it('caches closed content unless fresh is set', () => {
    const [open, setOpen] = createSignal(true)
    const [content, setContent] = createSignal('Initial')
    render(() => (
      <Popover content={content()} open={open()}>
        <button type="button">Trigger</button>
      </Popover>
    ))

    setOpen(false)
    setContent('Updated')
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Initial')

    cleanup()
    document.body.innerHTML = ''

    const [freshOpen, setFreshOpen] = createSignal(true)
    const [freshContent, setFreshContent] = createSignal('Fresh initial')
    render(() => (
      <Popover content={freshContent()} open={freshOpen()} fresh>
        <button type="button">Trigger</button>
      </Popover>
    ))

    setFreshOpen(false)
    setFreshContent('Fresh updated')
    expect(document.body.querySelector('[role="tooltip"]')).toHaveTextContent('Fresh updated')
  })

  it('calls afterOpenChange and exposes TooltipRef methods and elements', () => {
    const afterOpenChange = vi.fn()
    let popoverRef: TooltipRef | undefined
    const [open, setOpen] = createSignal(false)

    render(() => (
      <Popover
        ref={(ref) => {
          popoverRef = ref
        }}
        content="Ref"
        open={open()}
        afterOpenChange={afterOpenChange}
      >
        <button type="button">Trigger</button>
      </Popover>
    ))

    setOpen(true)
    expect(afterOpenChange).toHaveBeenCalledWith(true)
    expect(popoverRef?.nativeElement).toHaveClass('ads-popover-trigger')
    expect(popoverRef?.popupElement).toHaveClass('ads-popover')
    expect(() => popoverRef?.forceAlign()).not.toThrow()
  })

  it('auto adjusts overflow and accepts align offsets from Tooltip positioning', () => {
    let popoverRef: TooltipRef | undefined
    const result = render(() => (
      <Popover
        ref={(ref) => {
          popoverRef = ref
        }}
        content="Aligned"
        open
        placement="top"
        align={{ offset: [5, 7] }}
      >
        <button type="button">Trigger</button>
      </Popover>
    ))

    const trigger = result.container.querySelector<HTMLElement>('.ads-popover-trigger')!
    trigger.getBoundingClientRect = vi.fn(
      () =>
        ({
          top: 0,
          left: 50,
          right: 90,
          bottom: 30,
          width: 40,
          height: 30,
        }) as DOMRect,
    ) as HTMLElement['getBoundingClientRect']

    popoverRef?.forceAlign()
    const overlay = document.body.querySelector<HTMLElement>('.ads-popover')!
    expect(overlay).toHaveClass('ads-popover-bottom')
    expect(overlay.style.top).toBe('45px')
    expect(overlay.style.left).toBe('75px')
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

it('renders a nested select dropdown above the popover overlay', () => {
  render(() => (
    <Popover
      open
      content={<Select open zIndex={1300} options={[{ value: 'one', label: 'One' }]} />}
    >
      <button>trigger</button>
    </Popover>
  ))

  const popover = document.body.querySelector<HTMLElement>('.ads-popover')!
  const dropdown = Array.from(
    document.body.querySelectorAll<HTMLElement>('.ads-select-dropdown'),
  ).find((element) => element.textContent?.includes('One'))!

  expect(dropdown).toHaveTextContent('One')
  expect(Number(dropdown.style.zIndex)).toBeGreaterThan(Number(popover.style.zIndex))
})
