import { Show, createRenderEffect, createSignal, onCleanup, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { addDocumentKeydown, addDocumentPointerDown } from '../shared/overlay'
import { getTooltipPosition, type OverlayPosition } from '../shared/placement'
import { InternalPortal, canUseDom } from '../shared/portal'
import { ZIndexContext, useZIndex } from '../shared/z-index'
import type { TooltipProps } from './interface'
import { useTooltipStyle } from './tooltip.style'

function hasTitle(title: TooltipProps['title']) {
  return title !== undefined && title !== null && title !== ''
}

export function Tooltip(props: TooltipProps) {
  const [local, rest] = splitProps(props, [
    'title',
    'placement',
    'trigger',
    'open',
    'defaultOpen',
    'onOpenChange',
    'mouseEnterDelay',
    'mouseLeaveDelay',
    'overlayClass',
    'overlayStyle',
    'zIndex',
    'getPopupContainer',
    'children',
    'class',
    'classList',
    'style',
    'onMouseEnter',
    'onMouseLeave',
    'onClick',
    'onFocus',
    'onBlur',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-tooltip`
  const [, hashId] = useTooltipStyle(prefixCls())
  const [zIndex, contextZIndex] = useZIndex('Tooltip', local.zIndex)
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [position, setPosition] = createSignal<OverlayPosition>({ top: '0px', left: '0px' })
  let triggerRef: HTMLSpanElement | undefined
  let enterTimer: ReturnType<typeof setTimeout> | undefined
  let leaveTimer: ReturnType<typeof setTimeout> | undefined

  const placement = () => local.placement ?? 'top'
  const trigger = () => local.trigger ?? 'hover'
  const titleAvailable = () => hasTitle(local.title)
  const open = () => Boolean((local.open ?? innerOpen()) && titleAvailable())

  const clearTimer = (timer: ReturnType<typeof setTimeout> | undefined) => {
    if (timer) clearTimeout(timer)
  }

  const updatePosition = () => {
    if (!canUseDom() || !triggerRef) return
    setPosition(getTooltipPosition(triggerRef.getBoundingClientRect(), placement(), 8))
  }

  const setOpen = (nextOpen: boolean) => {
    if (nextOpen && !titleAvailable()) return
    if (nextOpen) updatePosition()
    if (local.open === undefined) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  const cleanupPointerDown = addDocumentPointerDown((event) => {
    if (trigger() !== 'click' || !open()) return
    if (triggerRef?.contains(event.target as Node)) return
    setOpen(false)
  })
  const cleanupKeydown = addDocumentKeydown((event) => {
    if (event.key === 'Escape' && trigger() === 'click' && open()) setOpen(false)
  })

  createRenderEffect(() => {
    if (open()) updatePosition()
  })

  onCleanup(() => {
    clearTimer(enterTimer)
    clearTimer(leaveTimer)
    cleanupPointerDown()
    cleanupKeydown()
  })

  const handleMouseEnter = (
    event: MouseEvent & { currentTarget: HTMLSpanElement; target: Element },
  ) => {
    ;(local.onMouseEnter as ((event: MouseEvent) => void) | undefined)?.(event)
    if (trigger() !== 'hover') return
    clearTimer(leaveTimer)
    enterTimer = setTimeout(() => setOpen(true), (local.mouseEnterDelay ?? 0) * 1000)
  }

  const handleMouseLeave = (
    event: MouseEvent & { currentTarget: HTMLSpanElement; target: Element },
  ) => {
    ;(local.onMouseLeave as ((event: MouseEvent) => void) | undefined)?.(event)
    if (trigger() !== 'hover') return
    clearTimer(enterTimer)
    leaveTimer = setTimeout(() => setOpen(false), (local.mouseLeaveDelay ?? 0.1) * 1000)
  }

  const handleClick = (event: MouseEvent & { currentTarget: HTMLSpanElement; target: Element }) => {
    ;(local.onClick as ((event: MouseEvent) => void) | undefined)?.(event)
    if (trigger() !== 'click') return
    setOpen(!open())
  }

  const handleFocus = (event: FocusEvent & { currentTarget: HTMLSpanElement; target: Element }) => {
    ;(local.onFocus as ((event: FocusEvent) => void) | undefined)?.(event)
    if (trigger() === 'focus') setOpen(true)
  }

  const handleBlur = (event: FocusEvent & { currentTarget: HTMLSpanElement; target: Element }) => {
    ;(local.onBlur as ((event: FocusEvent) => void) | undefined)?.(event)
    if (trigger() === 'focus') setOpen(false)
  }

  return (
    <>
      <span
        {...rest}
        ref={(element) => {
          triggerRef = element
        }}
        class={classNames(`${prefixCls()}-trigger`, hashId(), local.class)}
        classList={local.classList}
        style={local.style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {local.children}
      </span>
      <Show when={open()}>
        <InternalPortal mount={() => local.getPopupContainer?.(triggerRef) ?? config.getPopupContainer?.(triggerRef)}>
          <ZIndexContext.Provider value={contextZIndex}>
          <div
            role="tooltip"
            class={classNames(
              prefixCls(),
              `${prefixCls()}-${placement()}`,
              hashId(),
              local.overlayClass,
            )}
            style={{ ...position(), 'z-index': zIndex, ...local.overlayStyle }}
          >
            {local.title}
          </div>
          </ZIndexContext.Provider>
        </InternalPortal>
      </Show>
    </>
  )
}
