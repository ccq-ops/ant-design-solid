import { Show, createRenderEffect, createSignal, onCleanup, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { addDocumentKeydown, addDocumentPointerDown } from '../shared/overlay'
import { getTooltipPosition, type OverlayPosition } from '../shared/placement'
import { InternalPortal, canUseDom } from '../shared/portal'
import type { PopoverProps } from './interface'
import { usePopoverStyle } from './popover.style'

function hasNode(node: PopoverProps['title'] | PopoverProps['content']) {
  return node !== undefined && node !== null && node !== ''
}

function hasOverlayContent(title: PopoverProps['title'], content: PopoverProps['content']) {
  return hasNode(title) || hasNode(content)
}

export function Popover(props: PopoverProps) {
  const [local, rest] = splitProps(props, [
    'title',
    'content',
    'placement',
    'trigger',
    'open',
    'defaultOpen',
    'onOpenChange',
    'mouseEnterDelay',
    'mouseLeaveDelay',
    'overlayClass',
    'overlayStyle',
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
  const prefixCls = () => `${config.prefixCls()}-popover`
  const [, hashId] = usePopoverStyle(prefixCls())
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [position, setPosition] = createSignal<OverlayPosition>({ top: '0px', left: '0px' })
  let triggerRef: HTMLSpanElement | undefined
  let overlayRef: HTMLDivElement | undefined
  let enterTimer: ReturnType<typeof setTimeout> | undefined
  let leaveTimer: ReturnType<typeof setTimeout> | undefined

  const placement = () => local.placement ?? 'top'
  const trigger = () => local.trigger ?? 'hover'
  const contentAvailable = () => hasOverlayContent(local.title, local.content)
  const open = () => Boolean((local.open ?? innerOpen()) && contentAvailable())

  const clearTimer = (timer: ReturnType<typeof setTimeout> | undefined) => {
    if (timer) clearTimeout(timer)
  }

  const updatePosition = () => {
    if (!canUseDom() || !triggerRef) return
    setPosition(getTooltipPosition(triggerRef.getBoundingClientRect(), placement(), 8))
  }

  const setOpen = (nextOpen: boolean) => {
    if (nextOpen && !contentAvailable()) return
    if (nextOpen) updatePosition()
    if (local.open === undefined) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  const containsTarget = (target: EventTarget | null) =>
    Boolean(
      target instanceof Node && (triggerRef?.contains(target) || overlayRef?.contains(target)),
    )

  const cleanupPointerDown = addDocumentPointerDown((event) => {
    if (trigger() !== 'click' || !open()) return
    if (containsTarget(event.target)) return
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
        <InternalPortal>
          <div
            ref={(element) => {
              overlayRef = element
            }}
            role="tooltip"
            class={classNames(
              prefixCls(),
              `${prefixCls()}-${placement()}`,
              hashId(),
              local.overlayClass,
            )}
            style={{ ...position(), ...local.overlayStyle }}
          >
            <div class={`${prefixCls()}-inner`}>
              <Show when={local.title}>
                <div class={`${prefixCls()}-title`}>{local.title}</div>
              </Show>
              <Show when={local.content}>
                <div class={`${prefixCls()}-content`}>{local.content}</div>
              </Show>
            </div>
          </div>
        </InternalPortal>
      </Show>
    </>
  )
}
