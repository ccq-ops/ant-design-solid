import type { JSX } from 'solid-js'

export type RateCharacterRender = (index: number) => JSX.Element

export interface RateProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: number
  defaultValue?: number
  count?: number
  allowHalf?: boolean
  allowClear?: boolean
  disabled?: boolean
  character?: JSX.Element | RateCharacterRender
  tooltips?: string[]
  onChange?: (next: number) => void
  onHoverChange?: (next: number) => void
}
