import type { JSX } from 'solid-js'
import type { TooltipProps } from '../tooltip'

export type SegmentedValue = string | number
export type SegmentedSize = 'small' | 'middle' | 'medium' | 'large'
export type SegmentedOrientation = 'horizontal' | 'vertical'
export type SegmentedShape = 'default' | 'round'
export type SegmentedSemanticDOM = 'root' | 'item' | 'icon' | 'label'
export type SegmentedSemanticClassNames = Partial<Record<SegmentedSemanticDOM, string>>
export type SegmentedSemanticStyles = Partial<Record<SegmentedSemanticDOM, JSX.CSSProperties>>
export type SegmentedSemanticInfo = { props: SegmentedProps }
export type SegmentedSemanticClassNamesConfig =
  | SegmentedSemanticClassNames
  | ((info: SegmentedSemanticInfo) => SegmentedSemanticClassNames)
export type SegmentedSemanticStylesConfig =
  | SegmentedSemanticStyles
  | ((info: SegmentedSemanticInfo) => SegmentedSemanticStyles)
export type SegmentedTooltip = string | Omit<TooltipProps, 'children'>
export type SegmentedOption =
  | string
  | number
  | {
      label?: JSX.Element
      value: SegmentedValue
      disabled?: boolean
      icon?: JSX.Element
      class?: string
      tooltip?: SegmentedTooltip
    }

export interface SegmentedProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options?: SegmentedOption[]
  value?: SegmentedValue
  defaultValue?: SegmentedValue
  disabled?: boolean
  block?: boolean
  size?: SegmentedSize
  orientation?: SegmentedOrientation
  vertical?: boolean
  shape?: SegmentedShape
  name?: string
  prefixCls?: string
  rootClass?: string
  classNames?: SegmentedSemanticClassNamesConfig
  styles?: SegmentedSemanticStylesConfig
  onChange?: (value: SegmentedValue) => void
}
