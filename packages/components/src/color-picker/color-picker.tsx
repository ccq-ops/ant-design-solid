import { Show, createRenderEffect, createSignal, onCleanup, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { addDocumentKeydown, addDocumentPointerDown } from '../shared/overlay'
import { getDropdownPosition, type OverlayPosition } from '../shared/placement'
import { InternalPortal, canUseDom } from '../shared/portal'
import { colorToCss, parseColor } from './color'
import type { Color } from './color'
import { useColorPickerStyle } from './color-picker.style'
import type { ColorPickerProps } from './interface'

function emptyPosition(): OverlayPosition {
  return { top: '0px', left: '0px' }
}

function renderText(showText: ColorPickerProps['showText'], color: Color | undefined): JSX.Element {
  if (typeof showText === 'function') return showText(color)
  if (showText) return color?.toHexString() ?? ''
  return undefined
}

export function ColorPicker(props: ColorPickerProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'onChange',
    'onChangeComplete',
    'open',
    'defaultOpen',
    'onOpenChange',
    'disabled',
    'size',
    'placement',
    'trigger',
    'format',
    'defaultFormat',
    'disabledAlpha',
    'allowClear',
    'showText',
    'presets',
    'panelRender',
    'popupClass',
    'popupStyle',
    'class',
    'style',
    'onClick',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-color-picker`
  const [, hashId] = useColorPickerStyle(prefixCls())
  const [innerColor] = createSignal(parseColor(local.defaultValue))
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [position, setPosition] = createSignal<OverlayPosition>(emptyPosition())
  const valueControlled = () => 'value' in props
  const openControlled = () => 'open' in props
  let triggerRef: HTMLButtonElement | undefined
  let popupRef: HTMLDivElement | undefined

  const size = () => local.size ?? config.componentSize()
  const disabled = () => Boolean(local.disabled)
  const mergedColor = () => (valueControlled() ? parseColor(local.value) : innerColor())
  const open = () => (openControlled() ? Boolean(local.open) : innerOpen())
  const placement = () => local.placement ?? 'bottomLeft'

  function updatePosition(element = triggerRef): void {
    if (!canUseDom() || !element) return
    setPosition(getDropdownPosition(element.getBoundingClientRect(), placement(), 4))
  }

  function setOpen(nextOpen: boolean): void {
    if (disabled() && nextOpen) return
    if (nextOpen) updatePosition()
    if (!openControlled()) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  function containsTarget(target: EventTarget | null): boolean {
    return Boolean(
      target instanceof Node && (triggerRef?.contains(target) || popupRef?.contains(target)),
    )
  }

  const removeKeydown = addDocumentKeydown((event) => {
    if (event.key === 'Escape' && open()) setOpen(false)
  })
  const removePointerDown = addDocumentPointerDown((event) => {
    if (open() && !containsTarget(event.target)) setOpen(false)
  })

  createRenderEffect(() => {
    if (open()) updatePosition()
  })

  onCleanup(() => {
    removeKeydown()
    removePointerDown()
  })

  function renderPanel(): JSX.Element {
    return (
      <div class={`${prefixCls()}-panel`}>
        <div class={`${prefixCls()}-preview`}>
          <span class={`${prefixCls()}-preview-color`} aria-hidden="true">
            <span
              class={`${prefixCls()}-preview-color-inner`}
              style={{ background: colorToCss(mergedColor()) }}
            />
          </span>
          <span class={`${prefixCls()}-preview-text`}>
            {mergedColor()?.toRgbString() ?? 'No color'}
          </span>
        </div>
      </div>
    )
  }

  const renderedPanel = () =>
    local.panelRender?.(renderPanel(), { components: { picker: renderPanel() } }) ?? renderPanel()

  return (
    <>
      <button
        {...rest}
        ref={(element) => {
          triggerRef = element
        }}
        type="button"
        class={classNames(
          prefixCls(),
          size() === 'small' && `${prefixCls()}-sm`,
          size() === 'large' && `${prefixCls()}-lg`,
          disabled() && `${prefixCls()}-disabled`,
          hashId(),
          local.class,
        )}
        style={local.style}
        disabled={disabled()}
        aria-label="Color Picker"
        aria-haspopup="dialog"
        aria-expanded={open() ? 'true' : 'false'}
        aria-disabled={disabled() ? 'true' : undefined}
        onClick={(event) => {
          ;(local.onClick as ((event: MouseEvent) => void) | undefined)?.(event)
          if (event.defaultPrevented || local.trigger === 'hover') return
          setOpen(!open())
        }}
      >
        <span class={`${prefixCls()}-color-block`} aria-hidden="true">
          <span
            class={`${prefixCls()}-color-block-inner`}
            style={{ background: colorToCss(mergedColor()) }}
          />
        </span>
        {local.showText && (
          <span class={`${prefixCls()}-text`}>{renderText(local.showText, mergedColor())}</span>
        )}
      </button>
      <Show when={open()}>
        <InternalPortal>
          <div
            ref={(element) => {
              popupRef = element
            }}
            role="dialog"
            aria-label="Color Picker Panel"
            class={classNames(
              `${prefixCls()}-popup`,
              `${prefixCls()}-${placement()}`,
              hashId(),
              local.popupClass,
            )}
            style={{ ...position(), ...local.popupStyle }}
          >
            {renderedPanel()}
          </div>
        </InternalPortal>
      </Show>
    </>
  )
}
