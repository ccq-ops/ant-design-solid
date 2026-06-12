import type { JSX } from 'solid-js'

export type SliderValue = number | number[]
export type SliderOrientation = 'horizontal' | 'vertical'
export type SliderTooltipPlacement = 'top' | 'bottom' | 'left' | 'right'
export type SliderSemanticKey =
  | 'root'
  | 'rail'
  | 'track'
  | 'tracks'
  | 'handle'
  | 'step'
  | 'dot'
  | 'mark'
  | 'markText'
  | 'tooltip'
export type SliderSemanticClassNames = Partial<Record<SliderSemanticKey, string>>
export type SliderSemanticStyles = Partial<Record<SliderSemanticKey, JSX.CSSProperties>>
export type SliderSemanticInfo = { props: SliderProps }
export type SliderSemanticClassNamesConfig =
  | SliderSemanticClassNames
  | ((info: SliderSemanticInfo) => SliderSemanticClassNames)
export type SliderSemanticStylesConfig =
  | SliderSemanticStyles
  | ((info: SliderSemanticInfo) => SliderSemanticStyles)

export interface SliderMarkObject {
  label: JSX.Element
  style?: JSX.CSSProperties
}

export type SliderMark = JSX.Element | SliderMarkObject

export interface SliderRangeConfig {
  draggableTrack?: boolean
  editable?: boolean
  minCount?: number
  maxCount?: number
}

export interface SliderTooltipConfig {
  autoAdjustOverflow?: boolean
  open?: boolean
  placement?: SliderTooltipPlacement
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement
  formatter?: (value: number) => JSX.Element | null
  class?: string
  style?: JSX.CSSProperties
}

export interface SliderRef {
  focus: () => void
  blur: () => void
  nativeElement?: HTMLDivElement
}

export interface SliderProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange' | 'ref'> {
  value?: SliderValue
  defaultValue?: SliderValue
  min?: number
  max?: number
  step?: number | null
  disabled?: boolean
  keyboard?: boolean
  dots?: boolean
  included?: boolean
  range?: boolean | SliderRangeConfig
  marks?: Record<number, SliderMark>
  orientation?: SliderOrientation
  vertical?: boolean
  reverse?: boolean
  tooltip?: SliderTooltipConfig
  classNames?: SliderSemanticClassNamesConfig
  styles?: SliderSemanticStylesConfig
  ref?: SliderRef | { current?: SliderRef } | ((ref: SliderRef) => void)
  /** @deprecated Please use `tooltip.open` instead. */
  tooltipVisible?: boolean
  onChange?: (value: SliderValue) => void
  onChangeComplete?: (value: SliderValue) => void
  /** @deprecated Please use `onChangeComplete` instead. */
  onAfterChange?: (value: SliderValue) => void
}
