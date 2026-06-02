import type { JSX } from 'solid-js'

export type SliderValue = number | [number, number]

export interface SliderMarkObject {
  label: JSX.Element
  style?: JSX.CSSProperties
}

export type SliderMark = JSX.Element | SliderMarkObject

export interface SliderProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: SliderValue
  defaultValue?: SliderValue
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  range?: boolean
  marks?: Record<number, SliderMark>
  vertical?: boolean
  tooltipVisible?: boolean
  onChange?: (value: SliderValue) => void
  onAfterChange?: (value: SliderValue) => void
}
