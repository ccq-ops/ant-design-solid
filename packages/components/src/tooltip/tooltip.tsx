import {
  Show,
  createEffect,
  createRenderEffect,
  createMemo,
  createSignal,
  onCleanup,
  splitProps,
  type JSX,
} from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import {
  addDocumentKeydown,
  addDocumentPointerDown,
  addPositionUpdateListeners,
} from '../shared/overlay'
import {
  getAdjustedTooltipPlacement,
  getTooltipPosition,
  type OverlayPosition,
  type TooltipPlacement,
} from '../shared/placement'
import { InternalPortal, canUseDom } from '../shared/portal'
import { ZIndexContext, useZIndex } from '../shared/z-index'
import type {
  TooltipProps,
  TooltipRef,
  TooltipSemanticClassNames,
  TooltipSemanticStyles,
  TooltipTrigger,
} from './interface'
import { useTooltipStyle } from './tooltip.style'

function hasTitle(title: TooltipProps['title']) {
  return title !== undefined && title !== null && title !== ''
}

function isRenderFunction(value: TooltipProps['title']): value is () => JSX.Element {
  return typeof value === 'function'
}

function resolveContent(value: TooltipProps['title']) {
  return isRenderFunction(value) ? value() : value
}

function normalizeTriggers(trigger: TooltipProps['trigger'] | undefined): TooltipTrigger[] {
  if (!trigger) return ['hover']
  return Array.isArray(trigger) ? trigger : [trigger]
}

function includesTrigger(triggers: TooltipTrigger[], trigger: TooltipTrigger) {
  return triggers.includes(trigger)
}

function assignRef(ref: TooltipProps['ref'], value: TooltipRef) {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(value)
    return
  }
  if ('current' in ref) ref.current = value
  else Object.assign(ref, value)
}

function textColorForBackground(color: string): string | undefined {
  if (!color.startsWith('#')) return undefined
  const value = color.slice(1)
  const normalized =
    value.length === 3
      ? value
          .split('')
          .map((part) => part + part)
          .join('')
      : value
  if (normalized.length !== 6) return undefined
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  if ([red, green, blue].some((part) => Number.isNaN(part))) return undefined
  const luminance = (red * 299 + green * 587 + blue * 114) / 1000
  return luminance > 160 ? 'rgba(0, 0, 0, 0.88)' : '#ffffff'
}

const uniqueTooltipControllers = new WeakMap<object, Set<(source: symbol) => void>>()

export function Tooltip(props: TooltipProps) {
  const [local, rest] = splitProps(props, [
    'ref',
    'title',
    'overlay',
    'color',
    'placement',
    'builtinPlacements',
    'trigger',
    'open',
    'defaultOpen',
    'onOpenChange',
    'afterOpenChange',
    'mouseEnterDelay',
    'mouseLeaveDelay',
    'align',
    'arrow',
    'autoAdjustOverflow',
    'fresh',
    'destroyOnHidden',
    'destroyTooltipOnHide',
    'rootClass',
    'rootClassName',
    'openClass',
    'openClassName',
    'overlayClass',
    'overlayClassName',
    'overlayStyle',
    'overlayInnerStyle',
    'classNames',
    'styles',
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
    'onFocusIn',
    'onFocusOut',
    'onContextMenu',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-tooltip`
  const [, hashId] = useTooltipStyle(prefixCls())
  const [zIndex, contextZIndex] = useZIndex('Tooltip', local.zIndex)
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [hasBeenOpen, setHasBeenOpen] = createSignal(
    Boolean((local.defaultOpen || local.open) && hasTitle(local.title ?? local.overlay)),
  )
  const [cachedTitle, setCachedTitle] = createSignal(resolveContent(local.title ?? local.overlay))
  const [actualPlacement, setActualPlacement] = createSignal<TooltipPlacement>(
    local.placement ?? 'top',
  )
  const [position, setPosition] = createSignal<OverlayPosition>({ top: '0px', left: '0px' })
  let triggerRef: HTMLSpanElement | undefined
  let popupRef: HTMLDivElement | undefined
  let enterTimer: ReturnType<typeof setTimeout> | undefined
  let leaveTimer: ReturnType<typeof setTimeout> | undefined
  let previousOpen = Boolean(local.open ?? innerOpen())
  const uniqueId = Symbol('tooltip')
  const uniqueScope = config.tooltip
  const closeForUnique = (source: symbol) => {
    if (source !== uniqueId && open()) setOpen(false, { fromUnique: true })
  }

  const semanticProps = (): TooltipProps => ({
    ...props,
    placement: placement(),
    trigger: triggers(),
  })
  const configClassNames = () => {
    const classNames = config.tooltip().classNames
    return typeof classNames === 'function'
      ? classNames({ props: semanticProps() })
      : (classNames ?? {})
  }
  const localClassNames = () =>
    typeof local.classNames === 'function'
      ? local.classNames({ props: semanticProps() })
      : (local.classNames ?? {})
  const mergedClassNames = (): TooltipSemanticClassNames => ({
    ...configClassNames(),
    ...localClassNames(),
  })
  const configStyles = () => {
    const styles = config.tooltip().styles
    return typeof styles === 'function' ? styles({ props: semanticProps() }) : (styles ?? {})
  }
  const localStyles = () =>
    typeof local.styles === 'function'
      ? local.styles({ props: semanticProps() })
      : (local.styles ?? {})
  const mergedStyles = (): TooltipSemanticStyles => ({
    ...configStyles(),
    ...localStyles(),
  })
  const placement = () => local.placement ?? 'top'
  const triggers = createMemo(() => normalizeTriggers(local.trigger ?? config.tooltip().trigger))
  const titleSource = () => local.title ?? local.overlay
  const titleAvailable = () => hasTitle(titleSource())
  const open = () => Boolean((local.open ?? innerOpen()) && titleAvailable())
  const destroyOnHidden = () => local.destroyOnHidden ?? Boolean(local.destroyTooltipOnHide)
  const shouldRenderPopup = () => open() || (hasBeenOpen() && !destroyOnHidden())
  const showArrow = () => local.arrow ?? config.tooltip().arrow ?? true
  const pointAtCenter = () => {
    const arrow = showArrow()
    return typeof arrow === 'object' && Boolean(arrow.pointAtCenter)
  }
  const visibleTitle = () => (local.fresh || open() ? resolveContent(titleSource()) : cachedTitle())

  const clearTimer = (timer: ReturnType<typeof setTimeout> | undefined) => {
    if (timer) clearTimeout(timer)
  }

  const updatePosition = () => {
    if (!canUseDom() || !triggerRef) return
    const rect = triggerRef.getBoundingClientRect()
    const builtinAlign = local.builtinPlacements?.[placement()]
    const mergedAlign = local.align ?? builtinAlign
    const nextPlacement = getAdjustedTooltipPlacement(
      rect,
      placement(),
      8,
      local.autoAdjustOverflow ?? true,
    )
    setActualPlacement(nextPlacement)
    setPosition(getTooltipPosition(rect, nextPlacement, 8, mergedAlign))
  }

  const notifyUnique = () => {
    if (!config.tooltip().unique) return
    const scope = uniqueScope
    const controllers = uniqueTooltipControllers.get(scope)
    controllers?.forEach((controller) => controller(uniqueId))
  }

  const setOpen = (nextOpen: boolean, options?: { fromUnique?: boolean }) => {
    if (nextOpen && !titleAvailable()) return
    if (nextOpen) updatePosition()
    if (local.open === undefined) setInnerOpen(nextOpen)
    if (nextOpen && !options?.fromUnique) notifyUnique()
    local.onOpenChange?.(nextOpen)
  }

  const canCloseByOutsidePointer = () =>
    includesTrigger(triggers(), 'click') || includesTrigger(triggers(), 'contextMenu')
  const cleanupPointerDown = addDocumentPointerDown((event) => {
    if (!canCloseByOutsidePointer() || !open()) return
    if (triggerRef?.contains(event.target as Node)) return
    if (popupRef?.contains(event.target as Node)) return
    setOpen(false)
  })
  const cleanupKeydown = addDocumentKeydown((event) => {
    if (event.key === 'Escape' && canCloseByOutsidePointer() && open()) setOpen(false)
  })

  createEffect(() => {
    if (!config.tooltip().unique) return
    const scope = uniqueScope
    const controllers = uniqueTooltipControllers.get(scope) ?? new Set()
    controllers.add(closeForUnique)
    uniqueTooltipControllers.set(scope, controllers)
    onCleanup(() => {
      controllers.delete(closeForUnique)
      if (controllers.size === 0) uniqueTooltipControllers.delete(scope)
    })
  })

  createRenderEffect(() => {
    if (open()) updatePosition()
  })

  createEffect(() => {
    if (open()) {
      setHasBeenOpen(true)
      setCachedTitle(resolveContent(titleSource()))
    } else if (local.fresh) {
      setCachedTitle(resolveContent(titleSource()))
    }
  })

  createEffect(() => {
    const nextOpen = open()
    if (nextOpen !== previousOpen) {
      previousOpen = nextOpen
      local.afterOpenChange?.(nextOpen)
    }
  })

  createEffect(() => {
    assignRef(local.ref, tooltipRef)
  })

  createEffect(() => {
    if (!open()) return
    const removeListeners = addPositionUpdateListeners(updatePosition)
    onCleanup(removeListeners)
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
    if (!includesTrigger(triggers(), 'hover')) return
    clearTimer(leaveTimer)
    enterTimer = setTimeout(() => setOpen(true), (local.mouseEnterDelay ?? 0.1) * 1000)
  }

  const handleMouseLeave = (
    event: MouseEvent & { currentTarget: HTMLSpanElement; target: Element },
  ) => {
    ;(local.onMouseLeave as ((event: MouseEvent) => void) | undefined)?.(event)
    if (!includesTrigger(triggers(), 'hover')) return
    clearTimer(enterTimer)
    leaveTimer = setTimeout(() => setOpen(false), (local.mouseLeaveDelay ?? 0.1) * 1000)
  }

  const handleClick = (event: MouseEvent & { currentTarget: HTMLSpanElement; target: Element }) => {
    ;(local.onClick as ((event: MouseEvent) => void) | undefined)?.(event)
    if (!includesTrigger(triggers(), 'click')) return
    setOpen(!open())
  }

  const handleFocus = (event: FocusEvent & { currentTarget: HTMLSpanElement; target: Element }) => {
    ;(local.onFocus as ((event: FocusEvent) => void) | undefined)?.(event)
    if (includesTrigger(triggers(), 'focus')) setOpen(true)
  }

  const handleBlur = (event: FocusEvent & { currentTarget: HTMLSpanElement; target: Element }) => {
    ;(local.onBlur as ((event: FocusEvent) => void) | undefined)?.(event)
    if (includesTrigger(triggers(), 'focus')) setOpen(false)
  }

  const handleFocusIn = (
    event: FocusEvent & { currentTarget: HTMLSpanElement; target: Element },
  ) => {
    ;(local.onFocusIn as ((event: FocusEvent) => void) | undefined)?.(event)
    if (includesTrigger(triggers(), 'focus')) setOpen(true)
  }

  const handleFocusOut = (
    event: FocusEvent & { currentTarget: HTMLSpanElement; target: Element },
  ) => {
    ;(local.onFocusOut as ((event: FocusEvent) => void) | undefined)?.(event)
    if (includesTrigger(triggers(), 'focus')) setOpen(false)
  }

  const handleContextMenu = (
    event: MouseEvent & { currentTarget: HTMLSpanElement; target: Element },
  ) => {
    ;(local.onContextMenu as ((event: MouseEvent) => void) | undefined)?.(event)
    if (!includesTrigger(triggers(), 'contextMenu')) return
    event.preventDefault()
    setOpen(true)
  }

  const rootStyle = () => ({
    ...position(),
    'z-index': zIndex,
    'background-color': local.color,
    color: local.color ? textColorForBackground(local.color) : undefined,
    ...config.tooltip().style,
    ...mergedStyles().root,
    ...local.overlayStyle,
  })

  const containerStyle = () => ({
    ...mergedStyles().container,
    ...local.overlayInnerStyle,
  })

  const triggerClass = () =>
    classNames(
      `${prefixCls()}-trigger`,
      open() && (local.openClass ?? local.openClassName),
      hashId(),
      local.class,
    )

  const popupClass = () =>
    classNames(
      prefixCls(),
      `${prefixCls()}-${actualPlacement()}`,
      !open() && `${prefixCls()}-hidden`,
      pointAtCenter() && `${prefixCls()}-arrow-point-at-center`,
      hashId(),
      config.tooltip().class,
      local.rootClass,
      local.rootClassName,
      local.overlayClass,
      local.overlayClassName,
      mergedClassNames().root,
    )

  const arrowStyle = () => ({
    'background-color': local.color,
    ...mergedStyles().arrow,
  })

  const tooltipRef: TooltipRef = {
    forceAlign: updatePosition,
    get nativeElement() {
      return triggerRef
    },
    get popupElement() {
      return popupRef
    },
  }

  const popupNode = () => (
    <InternalPortal
      mount={() => local.getPopupContainer?.(triggerRef) ?? config.getPopupContainer?.(triggerRef)}
    >
      <div
        ref={(element) => {
          popupRef = element
        }}
        role="tooltip"
        aria-hidden={!open()}
        class={popupClass()}
        style={rootStyle()}
      >
        <Show when={showArrow()}>
          <div
            class={classNames(`${prefixCls()}-arrow`, mergedClassNames().arrow)}
            style={arrowStyle()}
          />
        </Show>
        <div
          class={classNames(`${prefixCls()}-inner`, mergedClassNames().container)}
          style={containerStyle()}
        >
          {visibleTitle()}
        </div>
      </div>
    </InternalPortal>
  )

  if ((local.open || local.defaultOpen) && titleAvailable()) {
    setHasBeenOpen(true)
  }

  return (
    <ZIndexContext.Provider value={contextZIndex}>
      <span
        {...rest}
        ref={(element) => {
          triggerRef = element
        }}
        class={triggerClass()}
        classList={local.classList}
        style={local.style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onFocusIn={handleFocusIn}
        onFocusOut={handleFocusOut}
        onContextMenu={handleContextMenu}
      >
        {local.children}
      </span>
      <Show when={shouldRenderPopup()}>{popupNode()}</Show>
    </ZIndexContext.Provider>
  )
}
