import type { JSX } from 'solid-js'

export interface ColorPickerPanelParts {
  Picker: () => JSX.Element
  Presets: () => JSX.Element
}

export interface ColorPickerPanelProps {
  prefixCls: string
  modeSwitcher?: JSX.Element
  gradientSlider?: JSX.Element
  picker: JSX.Element
  presets?: JSX.Element
  actions?: JSX.Element
  preview: JSX.Element
}

export function ColorPickerPanel(props: ColorPickerPanelProps): JSX.Element {
  return (
    <div class={`${props.prefixCls}-panel`}>
      {props.modeSwitcher}
      {props.gradientSlider}
      {props.picker}
      {props.presets}
      {props.actions}
      {props.preview}
    </div>
  )
}
