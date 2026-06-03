import { createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { colorToCss, parseColor } from './color'
import type { Color } from './color'
import { useColorPickerStyle } from './color-picker.style'
import type { ColorPickerProps } from './interface'

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
  const valueControlled = () => 'value' in props
  const openControlled = () => 'open' in props

  const size = () => local.size ?? config.componentSize()
  const disabled = () => Boolean(local.disabled)
  const mergedColor = () => (valueControlled() ? parseColor(local.value) : innerColor())
  const open = () => (openControlled() ? Boolean(local.open) : innerOpen())

  function setOpen(nextOpen: boolean): void {
    if (disabled()) return
    if (!openControlled()) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  return (
    <button
      {...rest}
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
  )
}
