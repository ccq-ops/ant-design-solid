import type { JSX } from 'solid-js'
import type { TooltipProps } from '../tooltip'

export type RateSize = 'small' | 'medium' | 'large'
export type RateItemState = 'zero' | 'half' | 'full'
export type RateTooltip = string | Omit<TooltipProps, 'children'>

export interface RateRef {
  focus: () => void
  blur: () => void
  nativeElement?: HTMLDivElement
}

export interface RateCharacterRenderProps {
  index: number
  value: number
  count: number
  state: RateItemState
  disabled: boolean
}

export type RateCharacterRender = (props: number & RateCharacterRenderProps) => JSX.Element

export interface RateProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange' | 'ref'> {
  value?: number
  defaultValue?: number
  count?: number
  allowHalf?: boolean
  allowClear?: boolean
  disabled?: boolean
  keyboard?: boolean
  size?: RateSize
  character?: JSX.Element | RateCharacterRender
  tooltips?: RateTooltip[]
  ref?: RateRef | { current?: RateRef } | ((ref: RateRef) => void)
  onChange?: (next: number) => void
  onHoverChange?: (next: number) => void
}
