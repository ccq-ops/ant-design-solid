import type { ComponentSize } from '@solid-ant-design/theme'
import type { JSX } from 'solid-js'
import type { TooltipPlacement } from '../shared/placement'
import type { TooltipArrow, TooltipOverflowConfig } from '../tooltip'
import type { Color, ColorPickerValue } from './color'
import type { ColorPickerPanelParts } from './color-picker-panel'

export type ColorPickerFormat = 'hex' | 'rgb' | 'hsb'
export type ColorPickerMode = 'single' | 'gradient'
export type ColorPickerTrigger = 'click' | 'hover'
export type ColorPickerSemanticSlot =
  | 'root'
  | 'body'
  | 'content'
  | 'description'
  | 'popupOverlayInner'

export interface ColorPickerSemanticClassNames {
  root?: string
  body?: string
  content?: string
  description?: string
  popupOverlayInner?: string
  popup?: { root?: string }
}

export interface ColorPickerSemanticStyles {
  root?: JSX.CSSProperties
  body?: JSX.CSSProperties
  content?: JSX.CSSProperties
  description?: JSX.CSSProperties
  popupOverlayInner?: JSX.CSSProperties
  popup?: { root?: JSX.CSSProperties }
}

export type ColorPickerSemanticClassNamesConfig =
  | ColorPickerSemanticClassNames
  | ((info: { props: ColorPickerProps }) => ColorPickerSemanticClassNames)

export type ColorPickerSemanticStylesConfig =
  | ColorPickerSemanticStyles
  | ((info: { props: ColorPickerProps }) => ColorPickerSemanticStyles)

export interface ColorPickerPreset {
  label: JSX.Element
  colors: ColorPickerValue[]
  defaultOpen?: boolean
  key?: string | number
}

export interface ColorPickerPanelRenderExtra {
  components: ColorPickerPanelParts
}

export interface ColorPickerProps extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  'value' | 'defaultValue' | 'onChange'
> {
  value?: ColorPickerValue
  defaultValue?: ColorPickerValue
  onChange?: (value: Color | undefined, hex: string) => void
  onChangeComplete?: (value: Color | undefined) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  size?: ComponentSize
  mode?: ColorPickerMode | ColorPickerMode[]
  children?: JSX.Element
  placement?: TooltipPlacement
  arrow?: TooltipArrow
  rootClass?: string
  classNames?: ColorPickerSemanticClassNamesConfig
  styles?: ColorPickerSemanticStylesConfig
  autoAdjustOverflow?: boolean | TooltipOverflowConfig
  destroyOnHidden?: boolean
  destroyTooltipOnHide?: boolean | { keepParent?: boolean }
  trigger?: ColorPickerTrigger
  format?: ColorPickerFormat
  defaultFormat?: ColorPickerFormat
  onFormatChange?: (format?: ColorPickerFormat) => void
  disabledFormat?: boolean
  disabledAlpha?: boolean
  allowClear?: boolean
  onClear?: () => void
  showText?: boolean | ((color: Color | undefined) => JSX.Element)
  presets?: ColorPickerPreset[]
  panelRender?: (panel: JSX.Element, extra: ColorPickerPanelRenderExtra) => JSX.Element
  popupClass?: string
  popupStyle?: JSX.CSSProperties
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot
}
