import { CloseOutlined } from '@solid-ant-design/icons'
import type { JSX } from 'solid-js'
import {
  Show,
  createContext,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  splitProps,
  useContext,
} from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { Skeleton } from '../skeleton'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { addDocumentKeydown, lockBodyScroll, unlockBodyScroll } from '../shared/overlay'
import { InternalPortal, canUseDom } from '../shared/portal'
import { ZIndexContext, useZIndex } from '../shared/z-index'
import { useWatermarkPanelRef } from '../watermark/context'
import type {
  DrawerClosableConfig,
  DrawerMaskConfig,
  DrawerPlacement,
  DrawerProps,
  DrawerPushConfig,
  DrawerResizableConfig,
  DrawerSemanticClassNames,
  DrawerSemanticStyles,
} from './interface'
import { useDrawerStyle } from './drawer.style'

const drawerStack: object[] = []
const defaultDrawerSize = 378
const largeDrawerSize = 736
const drawerMotionDuration = 500
type MotionStatus = 'enter' | 'enter-active' | 'stable' | 'leave' | 'leave-active'
type MotionPhase = 'enter' | 'leave'

interface DrawerPushContextValue {
  registerChild: (item: object) => void
  unregisterChild: (item: object) => void
}

const DrawerPushContext = createContext<DrawerPushContextValue>()

function removeFromStack(item: object) {
  const index = drawerStack.lastIndexOf(item)
  if (index !== -1) drawerStack.splice(index, 1)
}

function toCssLength(value: number | string | undefined, fallback: number): string {
  if (value === undefined) return `${fallback}px`
  return typeof value === 'number' ? `${value}px` : value
}

function numericCssLength(value: number | string | undefined, fallback: number): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function isHorizontalPlacement(placement: DrawerPlacement): boolean {
  return placement === 'left' || placement === 'right'
}

function normalizeSize(size: DrawerProps['size']): number | string | undefined {
  if (size === 'default') return defaultDrawerSize
  if (size === 'large') return largeDrawerSize
  if (typeof size === 'string' && /^\d+(\.\d+)?$/.test(size)) return Number(size)
  return size
}

function normalizeClosable(value: DrawerProps['closable']): false | DrawerClosableConfig {
  if (value === false) return false
  if (typeof value === 'object' && value !== null) return value
  return {}
}

function normalizeMask(value: DrawerProps['mask']): DrawerMaskConfig {
  if (value === false) return { enabled: false }
  if (typeof value === 'object' && value !== null) return { enabled: true, ...value }
  return { enabled: true }
}

function normalizePush(value: DrawerProps['push']): false | DrawerPushConfig {
  if (value === false) return false
  if (typeof value === 'object' && value !== null) return value
  return { distance: 180 }
}

function resolveSemanticClassNames(
  value: DrawerSemanticClassNames | undefined,
  props: DrawerProps,
): Partial<Record<string, string>> {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function resolveSemanticStyles(
  value: DrawerSemanticStyles | undefined,
  props: DrawerProps,
): Partial<Record<string, JSX.CSSProperties>> {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function mergeSemanticClassNames(
  ...values: Array<Partial<Record<string, string>>>
): Partial<Record<string, string>> {
  const merged: Partial<Record<string, string>> = {}
  values.forEach((value) => {
    Object.keys(value).forEach((key) => {
      merged[key] = classNames(merged[key], value[key])
    })
  })
  return merged
}

function mergeSemanticStyles(
  ...values: Array<Partial<Record<string, JSX.CSSProperties>>>
): Partial<Record<string, JSX.CSSProperties>> {
  const merged: Partial<Record<string, JSX.CSSProperties>> = {}
  values.forEach((value) => {
    Object.keys(value).forEach((key) => {
      merged[key] = { ...merged[key], ...value[key] }
    })
  })
  return merged
}

function resolveContainer(getContainer: DrawerProps['getContainer']): HTMLElement | undefined {
  if (!canUseDom()) return undefined
  if (getContainer === undefined) return document.body
  if (getContainer === false) return undefined
  if (typeof getContainer === 'string')
    return document.querySelector<HTMLElement>(getContainer) ?? undefined
  if (typeof getContainer === 'function') return getContainer()
  return getContainer
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute('disabled') && element.tabIndex !== -1)
}

function drawerContentNode(props: { node: JSX.Element }) {
  return <>{props.node}</>
}

export function Drawer(props: DrawerProps) {
  const [local] = splitProps(props, [
    'open',
    'title',
    'placement',
    'size',
    'defaultSize',
    'closable',
    'closeIcon',
    'mask',
    'keyboard',
    'destroyOnHidden',
    'forceRender',
    'extra',
    'footer',
    'zIndex',
    'getContainer',
    'rootClass',
    'rootStyle',
    'classNames',
    'styles',
    'loading',
    'push',
    'drawerRender',
    'focusable',
    'resizable',
    'maxSize',
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
  const drawerConfig = config.drawer
  const parentPushContext = useContext(DrawerPushContext)
  const prefixCls = () => `${config.prefixCls()}-drawer`
  const watermarkPanelRef = useWatermarkPanelRef(`.${prefixCls()}-section`)
  const [, hashId] = useDrawerStyle(prefixCls())
  const [zIndex, contextZIndex] = useZIndex('Drawer', local.zIndex)
  const titleId = createUniqueId()
  const stackItem = {}
  const [retained, setRetained] = createSignal(Boolean(local.open || local.forceRender))
  const [visible, setVisible] = createSignal(Boolean(local.open))
  const [motionStatus, setMotionStatus] = createSignal<MotionStatus>(
    local.open ? 'enter' : 'stable',
  )
  const [childPushCount, setChildPushCount] = createSignal(0)
  const [resizedSize, setResizedSize] = createSignal<number>()
  let locked = false
  let wasOpen = false
  let motionTimer: ReturnType<typeof setTimeout> | undefined
  let motionFrameTimer: ReturnType<typeof setTimeout> | undefined
  let dialogRef: HTMLDivElement | undefined
  let lastActiveElement: HTMLElement | undefined

  const placement = () => local.placement ?? 'right'
  const closableConfig = createMemo(() =>
    normalizeClosable(local.closable ?? drawerConfig().closable),
  )
  const maskConfig = createMemo(() => normalizeMask(local.mask ?? drawerConfig().mask))
  const pushConfig = createMemo(() => normalizePush(local.push))
  const semanticClassNames = createMemo(() =>
    mergeSemanticClassNames(
      resolveSemanticClassNames(drawerConfig().classNames, props),
      resolveSemanticClassNames(local.classNames, props),
    ),
  )
  const semanticStyles = createMemo(() =>
    mergeSemanticStyles(
      resolveSemanticStyles(drawerConfig().styles, props),
      resolveSemanticStyles(local.styles, props),
    ),
  )
  const destroyOnHidden = () => Boolean(local.destroyOnHidden)
  const focusableConfig = () => ({
    trap: maskConfig().enabled,
    focusTriggerAfterClose: true,
    ...drawerConfig().focusable,
    ...local.focusable,
  })
  const focusTrapEnabled = () => focusableConfig().trap !== false
  const motionClass = (name: string, target: MotionStatus) => {
    if (target === 'stable') return undefined
    if (target === 'enter-active') return `${name}-enter ${name}-enter-active`
    if (target === 'leave-active') return `${name}-leave ${name}-leave-active`
    return `${name}-${target}`
  }
  const maskMotionClass = () => motionClass(`${prefixCls()}-mask-motion`, motionStatus())
  const panelMotionClass = () =>
    motionClass(`${prefixCls()}-panel-motion-${placement()}`, motionStatus())
  const finishMotion = (status: MotionPhase) => {
    if (status === 'enter' && local.open) {
      setMotionStatus('stable')
      local.afterOpenChange?.(true)
      return
    }
    if (status === 'leave' && !local.open) {
      setMotionStatus('stable')
      setVisible(false)
      if (destroyOnHidden() && !local.forceRender) setRetained(false)
      local.afterOpenChange?.(false)
      if (focusableConfig().focusTriggerAfterClose) lastActiveElement?.focus?.()
    }
  }
  const startMotion = (status: MotionPhase) => {
    if (motionTimer) clearTimeout(motionTimer)
    if (motionFrameTimer) clearTimeout(motionFrameTimer)
    setMotionStatus(status)
    motionFrameTimer = setTimeout(() => {
      setMotionStatus(status === 'enter' ? 'enter-active' : 'leave-active')
    }, 0)
    motionTimer = setTimeout(() => finishMotion(status), drawerMotionDuration)
  }

  const pushContext: DrawerPushContextValue = {
    registerChild(_item) {
      setChildPushCount((count) => count + 1)
    },
    unregisterChild(_item) {
      setChildPushCount((count) => Math.max(0, count - 1))
    },
  }

  createRenderEffect(() => {
    const open = Boolean(local.open)

    if (open) {
      setRetained(true)
      setVisible(true)
      if (!locked) {
        lastActiveElement = canUseDom()
          ? ((document.activeElement as HTMLElement | null) ?? undefined)
          : undefined
        lockBodyScroll()
        drawerStack.push(stackItem)
        parentPushContext?.registerChild(stackItem)
        locked = true
      }
    } else if (locked) {
      unlockBodyScroll()
      removeFromStack(stackItem)
      parentPushContext?.unregisterChild(stackItem)
      locked = false
    }

    if (open && !wasOpen) {
      startMotion('enter')
    }

    if (!open && wasOpen) {
      setVisible(true)
      startMotion('leave')
    }

    wasOpen = open
  })

  createEffect(() => {
    if (local.open && dialogRef && focusTrapEnabled()) dialogRef.focus()
  })

  const cleanupKeydown = addDocumentKeydown((event) => {
    if (!local.open || drawerStack[drawerStack.length - 1] !== stackItem) return

    if (event.key === 'Escape' && (local.keyboard ?? true)) {
      local.onClose?.(event)
      return
    }

    if (event.key === 'Tab' && focusTrapEnabled() && dialogRef) {
      const focusables = getFocusableElements(dialogRef)
      if (!focusables.length) {
        event.preventDefault()
        dialogRef.focus()
        return
      }

      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  })

  onCleanup(() => {
    if (motionTimer) clearTimeout(motionTimer)
    if (motionFrameTimer) clearTimeout(motionFrameTimer)
    cleanupKeydown()
    if (locked) {
      unlockBodyScroll()
      removeFromStack(stackItem)
      parentPushContext?.unregisterChild(stackItem)
    }
  })

  const baseSizeValue = () => {
    const size = normalizeSize(local.size)
    if (size !== undefined) return size
    return local.defaultSize
  }

  const baseNumericSize = () =>
    numericCssLength(baseSizeValue(), local.defaultSize ?? defaultDrawerSize)
  const currentSize = () => resizedSize() ?? baseNumericSize()
  const currentCssSize = () =>
    resizedSize() !== undefined
      ? `${resizedSize()}px`
      : toCssLength(baseSizeValue(), local.defaultSize ?? defaultDrawerSize)

  const pushTransform = () => {
    if (!childPushCount()) return undefined
    const config = pushConfig()
    if (!config) return undefined
    const distance = toCssLength(config.distance, 180)
    const sign = placement() === 'left' || placement() === 'top' ? '' : '-'
    if (isHorizontalPlacement(placement())) return `translateX(${sign}${distance})`
    return `translateY(${sign}${distance})`
  }

  const wrapperStyle = () => {
    const side = placement()
    const size = isHorizontalPlacement(side)
      ? { width: currentCssSize() }
      : { height: currentCssSize() }
    const transform = pushTransform()
    return {
      ...size,
      ...(transform ? { transform } : {}),
      ...drawerConfig().style,
      ...local.style,
      ...semanticStyles().wrapper,
    }
  }
  const rootStyle = () => ({
    'z-index': zIndex,
    display: visible() ? undefined : 'none',
    ...drawerConfig().rootStyle,
    ...local.rootStyle,
    ...semanticStyles().root,
  })
  const titleLabelId = () => local['aria-labelledby'] ?? (local.title ? titleId : undefined)
  const shouldRender = () =>
    Boolean(local.open) || visible() || retained() || Boolean(local.forceRender)
  const maskClosable = () => maskConfig().closable ?? true

  const onResizePointerDown = (event: PointerEvent) => {
    if (!local.resizable) return
    event.preventDefault()
    const startX = event.clientX
    const startY = event.clientY
    const startSize = currentSize()
    const config =
      typeof local.resizable === 'object' ? (local.resizable as DrawerResizableConfig) : {}
    config.onResizeStart?.()

    const onMove = (moveEvent: PointerEvent) => {
      let delta = isHorizontalPlacement(placement())
        ? moveEvent.clientX - startX
        : moveEvent.clientY - startY
      if (placement() === 'right') delta = -delta
      if (placement() === 'bottom') delta = -delta
      const nextSize = Math.max(
        0,
        local.maxSize ? Math.min(local.maxSize, startSize + delta) : startSize + delta,
      )
      setResizedSize(nextSize)
      config.onResize?.(nextSize)
    }
    const onUp = () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerup', onUp)
      config.onResizeEnd?.()
    }
    document.addEventListener('pointermove', onMove)
    document.addEventListener('pointerup', onUp)
  }

  const closeButton = () => {
    const config = closableConfig()
    if (!config) return null
    return (
      <button
        type="button"
        class={classNames(
          `${prefixCls()}-close`,
          config.placement === 'end' && `${prefixCls()}-close-end`,
          semanticClassNames().close,
        )}
        style={semanticStyles().close}
        aria-label="close drawer"
        disabled={config.disabled}
        onClick={(event) => {
          if (!config.disabled) local.onClose?.(event)
        }}
      >
        {local.closeIcon ?? config.closeIcon ?? <CloseOutlined />}
      </button>
    )
  }

  const section = () => (
    <div
      class={classNames(`${prefixCls()}-section`, semanticClassNames().section)}
      style={{
        'min-height': semanticStyles().section?.['min-height'],
        ...semanticStyles().section,
      }}
    >
      <Show when={local.title || local.extra || closableConfig()}>
        <div
          class={classNames(`${prefixCls()}-header`, semanticClassNames().header)}
          style={{
            'min-height': semanticStyles().header?.['min-height'],
            ...semanticStyles().header,
          }}
        >
          <div class={`${prefixCls()}-header-title`}>
            <Show
              when={Boolean(
                closableConfig() && (closableConfig() as DrawerClosableConfig).placement !== 'end',
              )}
            >
              {closeButton()}
            </Show>
            <div
              id={titleId}
              class={classNames(`${prefixCls()}-title`, semanticClassNames().title)}
              style={semanticStyles().title}
            >
              {local.title}
            </div>
          </div>
          <Show when={local.extra}>
            <div
              class={classNames(`${prefixCls()}-extra`, semanticClassNames().extra)}
              style={semanticStyles().extra}
            >
              {local.extra}
            </div>
          </Show>
          <Show
            when={Boolean(
              closableConfig() && (closableConfig() as DrawerClosableConfig).placement === 'end',
            )}
          >
            {closeButton()}
          </Show>
        </div>
      </Show>
      <div
        class={classNames(`${prefixCls()}-body`, semanticClassNames().body)}
        style={{
          padding: semanticStyles().body?.padding,
          'min-height': semanticStyles().body?.['min-height'],
          ...semanticStyles().body,
        }}
      >
        <Show when={local.loading} fallback={local.children}>
          <div class={`${prefixCls()}-loading`}>
            <Skeleton active title={false} paragraph={{ rows: 5 }} />
          </div>
        </Show>
      </div>
      <Show when={local.footer}>
        <div
          class={classNames(`${prefixCls()}-footer`, semanticClassNames().footer)}
          style={{
            'min-height': semanticStyles().footer?.['min-height'],
            ...semanticStyles().footer,
          }}
        >
          {local.footer}
        </div>
      </Show>
    </div>
  )

  const drawerNode = () => {
    const node = (
      <div
        ref={(element) => {
          dialogRef = element
          watermarkPanelRef(element)
        }}
        role="dialog"
        aria-modal="true"
        aria-label={local['aria-label']}
        aria-labelledby={titleLabelId()}
        tabIndex={-1}
        class={classNames(
          prefixCls(),
          `${prefixCls()}-${placement()}`,
          `${prefixCls()}-content-wrapper`,
          local.resizable && `${prefixCls()}-resizable`,
          panelMotionClass(),
          semanticClassNames().wrapper,
          drawerConfig().class,
          local.class,
        )}
        classList={local.classList}
        style={wrapperStyle()}
      >
        <Show when={local.resizable}>
          <div
            class={classNames(
              `${prefixCls()}-resizable-dragger`,
              `${prefixCls()}-resizable-dragger-${placement()}`,
              semanticClassNames().dragger,
            )}
            style={semanticStyles().dragger}
            onPointerDown={onResizePointerDown}
          />
        </Show>
        {section()}
      </div>
    )
    return local.drawerRender ? local.drawerRender(node) : node
  }

  const root = () => (
    <ZIndexContext.Provider value={contextZIndex}>
      <DrawerPushContext.Provider value={pushContext}>
        <Show when={shouldRender()}>
          <div
            class={classNames(
              `${prefixCls()}-root`,
              `${prefixCls()}-${placement()}`,
              local.getContainer === false && `${prefixCls()}-inline`,
              hashId(),
              drawerConfig().rootClass,
              local.rootClass,
              semanticClassNames().root,
            )}
            style={rootStyle()}
          >
            <Show when={maskConfig().enabled ?? true}>
              <div
                class={classNames(
                  `${prefixCls()}-mask`,
                  maskConfig().blur && `${prefixCls()}-mask-blur`,
                  maskMotionClass(),
                  semanticClassNames().mask,
                )}
                style={semanticStyles().mask}
                onClick={(event) => {
                  if (maskClosable()) local.onClose?.(event)
                }}
              />
            </Show>
            {drawerNode()}
          </div>
        </Show>
      </DrawerPushContext.Provider>
    </ZIndexContext.Provider>
  )

  return (
    <Show
      when={local.getContainer === false}
      fallback={
        <InternalPortal mount={() => resolveContainer(local.getContainer)}>{root()}</InternalPortal>
      }
    >
      <Dynamic component={drawerContentNode} node={root()} />
    </Show>
  )
}
