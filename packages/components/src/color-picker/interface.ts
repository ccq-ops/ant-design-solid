import type { ComponentSize } from '@ant-design-solid/theme'
import type { JSX } from 'solid-js'
import type { DropdownPlacement } from '../shared/placement'
import type { Color, ColorPickerValue } from './color'

export type ColorPickerFormat = 'hex' | 'rgb' | 'hsb'
export type ColorPickerTrigger = 'click' | 'hover'

export interface ColorPickerPreset {
  label?: JSX.Element
  colors: string[]
}

export interface ColorPickerPanelRenderExtra {
  components: Record<string, JSX.Element>
}

export interface ColorPickerProps
  extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'defaultValue' | 'onChange'> {
  value?: ColorPickerValue
  defaultValue?: ColorPickerValue
  onChange?: (value: Color | undefined, hex: string) => void
  onChangeComplete?: (value: Color | undefined) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  size?: ComponentSize
  placement?: DropdownPlacement
  trigger?: ColorPickerTrigger
  format?: ColorPickerFormat
  defaultFormat?: ColorPickerFormat
  disabledAlpha?: boolean
  allowClear?: boolean
  showText?: boolean | ((color: Color | undefined) => JSX.Element)
  presets?: ColorPickerPreset[]
  panelRender?: (panel: JSX.Element, extra: ColorPickerPanelRenderExtra) => JSX.Element
  popupClass?: string
  popupStyle?: JSX.CSSProperties
}
