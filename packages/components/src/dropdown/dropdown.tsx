import { For, Show, createSignal, onCleanup, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { addDocumentKeydown, addDocumentPointerDown } from '../shared/overlay'
import { getDropdownPosition, type OverlayPosition } from '../shared/placement'
import { InternalPortal, canUseDom } from '../shared/portal'
import type { DropdownMenuItem, DropdownProps } from './interface'
import { useDropdownStyle } from './dropdown.style'

function emptyPosition(): OverlayPosition {
  return { top: '0px', left: '0px' }
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
    'class',
    'style',
    'onClick',
    'onMouseEnter',
    'onMouseLeave',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-dropdown`
  const [, hashId] = useDropdownStyle(prefixCls())
  const [triggerElement, setTriggerElement] = createSignal<HTMLSpanElement>()
  const [overlayElement, setOverlayElement] = createSignal<HTMLDivElement>()
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [position, setPosition] = createSignal<OverlayPosition>(emptyPosition())
  const trigger = () => local.trigger ?? 'click'
  const placement = () => local.placement ?? 'bottomLeft'
  const mergedOpen = () => (local.open !== undefined ? Boolean(local.open) : innerOpen())

  function updatePosition(element = triggerElement()) {
    if (!canUseDom() || !element) return
    setPosition(getDropdownPosition(element.getBoundingClientRect(), placement(), 4))
  }

  function setOpen(nextOpen: boolean) {
    if (nextOpen) updatePosition()
    if (local.open === undefined) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  function containsTarget(target: EventTarget | null) {
    return Boolean(
      target instanceof Node &&
        (triggerElement()?.contains(target) || overlayElement()?.contains(target)),
    )
  }

  const removeKeydown = addDocumentKeydown((event) => {
    if (event.key === 'Escape' && mergedOpen()) setOpen(false)
  })
  const removePointerDown = addDocumentPointerDown((event) => {
    if (trigger() === 'click' && mergedOpen() && !containsTarget(event.target)) setOpen(false)
  })
  onCleanup(() => {
    removeKeydown()
    removePointerDown()
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
          if (trigger() === 'hover') setOpen(true)
        }}
        onMouseLeave={(event) => {
          ;(local.onMouseLeave as ((event: MouseEvent) => void) | undefined)?.(event)
          if (trigger() === 'hover') setOpen(false)
        }}
      >
        {local.children}
      </span>
      <Show when={mergedOpen()}>
        <InternalPortal>
          <div
            ref={setOverlayElement}
            class={classNames(prefixCls(), `${prefixCls()}-${placement()}`, hashId(), local.overlayClass)}
            style={{ ...position(), ...local.overlayStyle }}
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
