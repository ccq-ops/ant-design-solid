import { For, Show, createEffect, createSignal, onCleanup, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import {
  addDocumentKeydown,
  addDocumentPointerDown,
  addPositionUpdateListeners,
} from '../shared/overlay'
import { getDropdownPosition } from '../shared/placement'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useZIndex } from '../shared/z-index'
import type { DropdownMenuItem, DropdownProps } from './interface'
import { useDropdownStyle } from './dropdown.style'

function emptyPosition(): JSX.CSSProperties {
  return { position: 'fixed', top: '0px', left: '0px' }
}

export function Dropdown(props: DropdownProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'menu',
    'trigger',
    'placement',
    'open',
    'defaultOpen',
    'onOpenChange',
    'overlayClass',
    'overlayStyle',
    'zIndex',
    'getPopupContainer',
    'class',
    'style',
    'onClick',
    'onMouseEnter',
    'onMouseLeave',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-dropdown`
  const [, hashId] = useDropdownStyle(prefixCls())
  const [zIndex] = useZIndex('Dropdown', local.zIndex)
  const [triggerElement, setTriggerElement] = createSignal<HTMLSpanElement>()
  const [overlayElement, setOverlayElement] = createSignal<HTMLDivElement>()
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [position, setPosition] = createSignal<JSX.CSSProperties>(emptyPosition())
  let hoverCloseTimer: ReturnType<typeof setTimeout> | undefined
  const trigger = () => local.trigger ?? 'click'
  const placement = () => local.placement ?? 'bottomLeft'
  const mergedOpen = () => (local.open !== undefined ? Boolean(local.open) : innerOpen())

  function updatePosition(element?: HTMLSpanElement | Event) {
    const target = element instanceof HTMLElement ? element : triggerElement()
    if (!canUseDom() || !target) return
    setPosition({
      position: 'fixed',
      ...getDropdownPosition(target.getBoundingClientRect(), placement(), 4),
    })
  }

  function setOpen(nextOpen: boolean) {
    if (nextOpen) updatePosition()
    if (local.open === undefined) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  function clearHoverCloseTimer() {
    if (!hoverCloseTimer) return
    clearTimeout(hoverCloseTimer)
    hoverCloseTimer = undefined
  }

  function scheduleHoverClose() {
    clearHoverCloseTimer()
    hoverCloseTimer = setTimeout(() => {
      hoverCloseTimer = undefined
      setOpen(false)
    }, 100)
  }

  function containsTarget(target: EventTarget | null) {
    return Boolean(
      target instanceof Node &&
      (triggerElement()?.contains(target) || overlayElement()?.contains(target)),
    )
  }

  function handleHoverEnter() {
    if (trigger() !== 'hover') return
    clearHoverCloseTimer()
    setOpen(true)
  }

  function handleHoverLeave(event: MouseEvent) {
    if (trigger() !== 'hover') return
    if (containsTarget(event.relatedTarget)) return
    scheduleHoverClose()
  }

  const removeKeydown = addDocumentKeydown((event) => {
    if (event.key === 'Escape' && mergedOpen()) setOpen(false)
  })
  const removePointerDown = addDocumentPointerDown((event) => {
    if (trigger() === 'click' && mergedOpen() && !containsTarget(event.target)) setOpen(false)
  })
  createEffect(() => {
    if (!mergedOpen()) return
    updatePosition()
    const removeListeners = addPositionUpdateListeners(updatePosition)
    onCleanup(removeListeners)
  })

  onCleanup(() => {
    removeKeydown()
    removePointerDown()
    clearHoverCloseTimer()
  })

  function clickItem(item: DropdownMenuItem, event: MouseEvent) {
    event.stopPropagation()
    if (item.disabled || item.type === 'divider') return
    local.menu.onClick?.({ key: item.key, domEvent: event })
    setOpen(false)
  }

  return (
    <>
      <span
        {...rest}
        ref={setTriggerElement}
        class={classNames(`${prefixCls()}-trigger`, local.class)}
        style={local.style}
        onClick={(event) => {
          ;(local.onClick as ((event: MouseEvent) => void) | undefined)?.(event)
          if (trigger() === 'click') setOpen(!mergedOpen())
        }}
        onMouseEnter={(event) => {
          ;(local.onMouseEnter as ((event: MouseEvent) => void) | undefined)?.(event)
          handleHoverEnter()
        }}
        onMouseLeave={(event) => {
          ;(local.onMouseLeave as ((event: MouseEvent) => void) | undefined)?.(event)
          handleHoverLeave(event)
        }}
      >
        {local.children}
      </span>
      <Show when={mergedOpen()}>
        <InternalPortal
          mount={() =>
            local.getPopupContainer?.(triggerElement()) ??
            config.getPopupContainer?.(triggerElement())
          }
        >
          <div
            ref={setOverlayElement}
            class={classNames(
              prefixCls(),
              `${prefixCls()}-${placement()}`,
              hashId(),
              local.overlayClass,
            )}
            style={{ ...position(), 'z-index': zIndex, ...local.overlayStyle }}
            onMouseEnter={handleHoverEnter}
            onMouseLeave={handleHoverLeave}
            on:click={(event) => event.stopPropagation()}
          >
            <ul role="menu" class={`${prefixCls()}-menu`}>
              <For each={local.menu.items}>
                {(item) => (
                  <Show
                    when={item.type === 'divider'}
                    fallback={
                      <li
                        role="menuitem"
                        data-menu-key={item.key}
                        aria-disabled={item.disabled ? 'true' : undefined}
                        class={classNames(
                          `${prefixCls()}-menu-item`,
                          item.disabled && `${prefixCls()}-menu-item-disabled`,
                        )}
                        on:click={(event) => clickItem(item, event)}
                      >
                        {item.label}
                      </li>
                    }
                  >
                    <li role="separator" class={`${prefixCls()}-menu-divider`} />
                  </Show>
                )}
              </For>
            </ul>
          </div>
        </InternalPortal>
      </Show>
    </>
  )
}
