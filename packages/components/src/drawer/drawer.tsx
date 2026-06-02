import {
  Show,
  createRenderEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  splitProps,
} from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { addDocumentKeydown, lockBodyScroll, unlockBodyScroll } from '../shared/overlay'
import { InternalPortal } from '../shared/portal'
import type { DrawerPlacement, DrawerProps } from './interface'
import { useDrawerStyle } from './drawer.style'

const drawerStack: object[] = []

function removeFromStack(item: object) {
  const index = drawerStack.lastIndexOf(item)
  if (index !== -1) drawerStack.splice(index, 1)
}

function toCssLength(value: number | string | undefined, fallback: number): string {
  if (value === undefined) return `${fallback}px`
  return typeof value === 'number' ? `${value}px` : value
}

function isHorizontalPlacement(placement: DrawerPlacement): boolean {
  return placement === 'left' || placement === 'right'
}

export function Drawer(props: DrawerProps) {
  const [local] = splitProps(props, [
    'open',
    'title',
    'placement',
    'width',
    'height',
    'closable',
    'mask',
    'maskClosable',
    'keyboard',
    'destroyOnClose',
    'extra',
    'footer',
    'zIndex',
    'onClose',
    'afterOpenChange',
    'children',
    'class',
    'classList',
    'style',
    'aria-label',
    'aria-labelledby',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-drawer`
  const [, hashId] = useDrawerStyle(prefixCls())
  const titleId = createUniqueId()
  const stackItem = {}
  const [retained, setRetained] = createSignal(Boolean(local.open))
  let locked = false
  let wasOpen = Boolean(local.open)

  const placement = () => local.placement ?? 'right'

  createRenderEffect(() => {
    const open = Boolean(local.open)

    if (open) {
      setRetained(true)
      if (!locked) {
        lockBodyScroll()
        drawerStack.push(stackItem)
        locked = true
      }
    } else if (locked) {
      unlockBodyScroll()
      removeFromStack(stackItem)
      locked = false
    }

    if (open !== wasOpen) {
      if (!open && local.destroyOnClose) setRetained(false)
      local.afterOpenChange?.(open)
    }
    wasOpen = open
  })

  const cleanupKeydown = addDocumentKeydown((event) => {
    if (
      event.key === 'Escape' &&
      local.open &&
      (local.keyboard ?? true) &&
      drawerStack[drawerStack.length - 1] === stackItem
    ) {
      local.onClose?.()
    }
  })

  onCleanup(() => {
    cleanupKeydown()
    if (locked) {
      unlockBodyScroll()
      removeFromStack(stackItem)
    }
  })

  const drawerStyle = () => {
    const side = placement()
    const size = isHorizontalPlacement(side)
      ? { width: toCssLength(local.width, 378) }
      : { height: toCssLength(local.height, 378) }
    return { ...size, ...local.style }
  }
  const rootStyle = () => ({ 'z-index': local.zIndex, display: local.open ? undefined : 'none' })
  const titleLabelId = () => local['aria-labelledby'] ?? (local.title ? titleId : undefined)
  const shouldRender = () => Boolean(local.open) || retained()

  return (
    <Show when={shouldRender()}>
      <InternalPortal>
        <div class={classNames(`${prefixCls()}-root`, hashId())} style={rootStyle()}>
          <Show when={local.mask ?? true}>
            <div
              class={`${prefixCls()}-mask`}
              onClick={() => {
                if (local.maskClosable ?? true) local.onClose?.()
              }}
            />
          </Show>
          <div
            role="dialog"
            aria-modal="true"
            aria-label={local['aria-label']}
            aria-labelledby={titleLabelId()}
            class={classNames(prefixCls(), `${prefixCls()}-${placement()}`, local.class)}
            classList={local.classList}
            style={drawerStyle()}
          >
            <div class={`${prefixCls()}-content`}>
              <Show when={local.title || local.extra || (local.closable ?? true)}>
                <div class={`${prefixCls()}-header`}>
                  <Show when={local.title} fallback={<span class={`${prefixCls()}-title`} />}>
                    <div id={titleId} class={`${prefixCls()}-title`}>
                      {local.title}
                    </div>
                  </Show>
                  <Show when={local.extra}>
                    <div class={`${prefixCls()}-extra`}>{local.extra}</div>
                  </Show>
                  <Show when={local.closable ?? true}>
                    <button
                      type="button"
                      class={`${prefixCls()}-close`}
                      aria-label="close drawer"
                      onClick={() => local.onClose?.()}
                    >
                      ×
                    </button>
                  </Show>
                </div>
              </Show>
              <div class={`${prefixCls()}-body`}>{local.children}</div>
              <Show when={local.footer}>
                <div class={`${prefixCls()}-footer`}>{local.footer}</div>
              </Show>
            </div>
          </div>
        </div>
      </InternalPortal>
    </Show>
  )
}
