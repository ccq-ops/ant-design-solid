import type { JSX } from 'solid-js'

export type SegmentedValue = string | number
export type SegmentedSize = 'small' | 'middle' | 'large'
export type SegmentedOption =
  | string
  | number
  | {
      label: JSX.Element
      value: SegmentedValue
      disabled?: boolean
      icon?: JSX.Element
      class?: string
    }

export interface SegmentedProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: SegmentedOption[]
  value?: SegmentedValue
  defaultValue?: SegmentedValue
  disabled?: boolean
  block?: boolean
  size?: SegmentedSize
  prefixCls?: string
  onChange?: (value: SegmentedValue) => void
}
