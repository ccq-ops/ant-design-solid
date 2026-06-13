import {
  Show,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  onCleanup,
  splitProps,
} from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { Menu } from '../menu'
import type { MenuProps, MenuSemanticName } from '../menu'
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
} from '../shared/placement'
import { InternalPortal, canUseDom } from '../shared/portal'
import { ZIndexContext, useZIndex } from '../shared/z-index'
import { useWatermarkPanelRef } from '../watermark/context'
import type {
  DropdownProps,
  DropdownSemanticClassNames,
  DropdownSemanticStyles,
  DropdownTrigger,
} from './interface'
import { useDropdownStyle } from './dropdown.style'

const noopHashId = () => undefined

function normalizeTriggers(trigger: DropdownProps['trigger'] | undefined): DropdownTrigger[] {
  if (!trigger) return ['hover']
  return Array.isArray(trigger) ? trigger : [trigger]
}

function includesTrigger(triggers: DropdownTrigger[], trigger: DropdownTrigger) {
  return triggers.includes(trigger)
}

function mergeStyle(
  ...styles: Array<JSX.CSSProperties | string | undefined>
): JSX.CSSProperties | string {
  const stringStyle = styles.find((style): style is string => typeof style === 'string')
  if (stringStyle) return stringStyle
  return Object.assign({}, ...styles.filter(Boolean))
}

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
    'disabled',
    'arrow',
    'autoAdjustOverflow',
    'align',
    'popupRender',
    'dropdownRender',
    'destroyOnHidden',
    'destroyPopupOnHide',
    'forceRender',
    'autoFocus',
    'mouseEnterDelay',
    'mouseLeaveDelay',
    'rootClass',
    'openClass',
    'overlayClass',
    'overlayClassName',
    'overlayStyle',
    'classNames',
    'styles',
    'zIndex',
    'getPopupContainer',
    'class',
    'classList',
    'style',
    'onClick',
    'onMouseEnter',
    'onMouseLeave',
    'onContextMenu',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-dropdown`
  const menuPrefixCls = () => `${prefixCls()}-menu`
  const watermarkPanelRef = useWatermarkPanelRef()
  const dropdownStyle = useDropdownStyle(prefixCls())
  const hashId = dropdownStyle?.[1] ?? noopHashId
  const [zIndex, contextZIndex] = useZIndex('Dropdown', local.zIndex)
  const [triggerElement, setTriggerElement] = createSignal<HTMLSpanElement>()
  const [overlayElement, setOverlayElement] = createSignal<HTMLDivElement>()
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [hasBeenOpen, setHasBeenOpen] = createSignal(Boolean(local.defaultOpen || local.open))
  const [actualPlacement, setActualPlacement] = createSignal(local.placement ?? 'bottomLeft')
  const [position, setPosition] = createSignal<OverlayPosition>(emptyPosition())
  let enterTimer: ReturnType<typeof setTimeout> | undefined
  let leaveTimer: ReturnType<typeof setTimeout> | undefined
  let contextMenuPoint: { x: number; y: number } | undefined

  const placement = () => local.placement ?? 'bottomLeft'
  const triggers = createMemo(() => normalizeTriggers(local.trigger))
  const mergedOpen = () => Boolean(local.open ?? innerOpen())
  const destroyOnHidden = () => local.destroyOnHidden ?? local.destroyPopupOnHide ?? true
  const shouldRenderPopup = () =>
    mergedOpen() || local.forceRender || (hasBeenOpen() && !destroyOnHidden())
  const showArrow = () => Boolean(local.arrow)
  const pointAtCenter = () =>
    typeof local.arrow === 'object' ? Boolean(local.arrow.pointAtCenter) : false

  const semanticProps = (): DropdownProps => ({
    ...props,
    placement: actualPlacement(),
    trigger: triggers(),
  })
  const semanticClassNames = (): DropdownSemanticClassNames =>
    typeof local.classNames === 'function'
      ? local.classNames({ props: semanticProps() })
      : (local.classNames ?? {})
  const semanticStyles = (): DropdownSemanticStyles =>
    typeof local.styles === 'function'
      ? local.styles({ props: semanticProps() })
      : (local.styles ?? {})

  const clearTimer = (timer: ReturnType<typeof setTimeout> | undefined) => {
    if (timer) clearTimeout(timer)
  }

  function updatePosition() {
    if (!canUseDom()) return
    if (contextMenuPoint) {
      setActualPlacement(placement())
      setPosition({ top: `${contextMenuPoint.y}px`, left: `${contextMenuPoint.x}px` })
      return
    }
    const target = triggerElement()
    if (!target) return
    const rect = target.getBoundingClientRect()
    const nextPlacement = getAdjustedTooltipPlacement(
      rect,
      placement(),
      showArrow() ? 8 : 4,
      local.autoAdjustOverflow ?? true,
    ) as NonNullable<DropdownProps['placement']>
    setActualPlacement(nextPlacement)
    setPosition(getTooltipPosition(rect, nextPlacement, showArrow() ? 8 : 4, local.align))
  }

  function setOpen(nextOpen: boolean, source: 'trigger' | 'menu') {
    if (local.disabled && nextOpen) return
    if (nextOpen) {
      updatePosition()
      setHasBeenOpen(true)
    } else {
      contextMenuPoint = undefined
    }
    if (local.open === undefined) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen, { source })
  }

  function containsTarget(target: EventTarget | null) {
    return Boolean(
      target instanceof Node &&
      (triggerElement()?.contains(target) || overlayElement()?.contains(target)),
    )
  }

  const canCloseByOutsidePointer = () =>
    includesTrigger(triggers(), 'click') || includesTrigger(triggers(), 'contextMenu')
  const removeKeydown = addDocumentKeydown((event) => {
    if (event.key === 'Escape' && mergedOpen()) setOpen(false, 'trigger')
  })
  const removePointerDown = addDocumentPointerDown((event) => {
    if (!canCloseByOutsidePointer() || !mergedOpen() || containsTarget(event.target)) return
    setOpen(false, 'trigger')
  })

  createRenderEffect(() => {
    if (mergedOpen()) updatePosition()
  })

  createEffect(() => {
    if (mergedOpen()) {
      setHasBeenOpen(true)
      if (local.autoFocus) queueMicrotask(() => overlayElement()?.focus())
    }
  })

  createEffect(() => {
    if (!mergedOpen()) return
    const removeListeners = addPositionUpdateListeners(updatePosition)
    onCleanup(removeListeners)
  })

  onCleanup(() => {
    removeKeydown()
    removePointerDown()
    clearTimer(enterTimer)
    clearTimer(leaveTimer)
  })

  const handleMouseEnter = (event: MouseEvent) => {
    ;(local.onMouseEnter as ((event: MouseEvent) => void) | undefined)?.(event)
    if (local.disabled || !includesTrigger(triggers(), 'hover')) return
    clearTimer(leaveTimer)
    enterTimer = setTimeout(() => setOpen(true, 'trigger'), (local.mouseEnterDelay ?? 0.15) * 1000)
  }

  const handleMouseLeave = (event: MouseEvent) => {
    ;(local.onMouseLeave as ((event: MouseEvent) => void) | undefined)?.(event)
    if (!includesTrigger(triggers(), 'hover') || containsTarget(event.relatedTarget)) return
    clearTimer(enterTimer)
    leaveTimer = setTimeout(() => setOpen(false, 'trigger'), (local.mouseLeaveDelay ?? 0.1) * 1000)
  }

  const handleClick = (event: MouseEvent) => {
    ;(local.onClick as ((event: MouseEvent) => void) | undefined)?.(event)
    if (local.disabled || !includesTrigger(triggers(), 'click')) return
    setOpen(!mergedOpen(), 'trigger')
  }

  const handleContextMenu = (event: MouseEvent) => {
    ;(local.onContextMenu as ((event: MouseEvent) => void) | undefined)?.(event)
    if (local.disabled || !includesTrigger(triggers(), 'contextMenu')) return
    event.preventDefault()
    contextMenuPoint = { x: event.clientX, y: event.clientY }
    setOpen(true, 'trigger')
  }

  const rootClass = () =>
    classNames(
      prefixCls(),
      `${prefixCls()}-${actualPlacement()}`,
      !mergedOpen() && `${prefixCls()}-hidden`,
      pointAtCenter() && `${prefixCls()}-arrow-point-at-center`,
      hashId(),
      local.rootClass,
      local.overlayClass,
      local.overlayClassName,
      semanticClassNames().root,
    )

  const rootStyle = () =>
    mergeStyle(
      {
        position: 'fixed',
        ...position(),
        'z-index': `${zIndex}`,
      },
      semanticStyles().root,
      local.overlayStyle,
    )

  const triggerClass = () =>
    classNames(
      `${prefixCls()}-trigger`,
      mergedOpen() && local.openClass,
      local.disabled && `${prefixCls()}-trigger-disabled`,
      local.class,
    )

  const menuProps = () => local.menu as MenuProps | undefined
  const resolvedMenuClassNames = (): Partial<Record<MenuSemanticName, string>> => {
    const classNames = menuProps()?.classNames
    return typeof classNames === 'function'
      ? classNames({ props: menuProps() ?? {} })
      : (classNames ?? {})
  }
  const resolvedMenuStyles = (): Partial<Record<MenuSemanticName, JSX.CSSProperties>> => {
    const styles = menuProps()?.styles
    return typeof styles === 'function' ? styles({ props: menuProps() ?? {} }) : (styles ?? {})
  }
  const menuClassNames = () => ({
    ...resolvedMenuClassNames(),
    root: classNames(menuPrefixCls(), resolvedMenuClassNames().root),
    item: classNames(semanticClassNames().item, resolvedMenuClassNames().item),
    itemIcon: classNames(semanticClassNames().itemIcon, resolvedMenuClassNames().itemIcon),
    itemContent: classNames(semanticClassNames().itemContent, resolvedMenuClassNames().itemContent),
  })

  const menuStyles = () => ({
    ...resolvedMenuStyles(),
    item: mergeStyle(semanticStyles().item, resolvedMenuStyles().item) as JSX.CSSProperties,
    itemIcon: mergeStyle(
      semanticStyles().itemIcon,
      resolvedMenuStyles().itemIcon,
    ) as JSX.CSSProperties,
    itemContent: mergeStyle(
      semanticStyles().itemContent,
      resolvedMenuStyles().itemContent,
    ) as JSX.CSSProperties,
  })
  const menuItems = () => local.menu?.items as Parameters<typeof Menu>[0]['items']

  const menuNode = () => (
    <Menu
      mode="vertical"
      selectable={false}
      {...local.menu}
      items={menuItems()}
      class={classNames(menuPrefixCls(), local.menu?.class)}
      classNames={menuClassNames()}
      styles={menuStyles()}
      getPopupContainer={local.getPopupContainer ?? config.getPopupContainer}
      zIndex={zIndex + 1}
      onClick={(info) => {
        local.menu?.onClick?.(info)
        if (!info.domEvent.defaultPrevented) setOpen(false, 'menu')
      }}
    />
  )

  const overlayNode = () => {
    const node = (
      <div
        ref={(element) => {
          setOverlayElement(element)
          watermarkPanelRef(element)
        }}
        tabindex={-1}
        aria-hidden={!mergedOpen() ? 'true' : undefined}
        class={rootClass()}
        style={rootStyle()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Show when={showArrow()}>
          <div class={`${prefixCls()}-arrow`} />
        </Show>
        {menuNode()}
      </div>
    )
    return (local.popupRender ?? local.dropdownRender)?.(node) ?? node
  }

  return (
    <ZIndexContext.Provider value={contextZIndex}>
      <span
        {...rest}
        ref={setTriggerElement}
        aria-disabled={local.disabled ? 'true' : undefined}
        class={triggerClass()}
        classList={local.classList}
        style={local.style}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
      >
        {local.children}
      </span>
      <Show when={shouldRenderPopup()}>
        <InternalPortal
          mount={() =>
            local.getPopupContainer?.(triggerElement()) ??
            config.getPopupContainer?.(triggerElement())
          }
        >
          {overlayNode()}
        </InternalPortal>
      </Show>
    </ZIndexContext.Provider>
  )
}
