import type { JSX } from 'solid-js'

export type DividerType = 'horizontal' | 'vertical'
export type DividerOrientation = 'left' | 'center' | 'right'

export interface DividerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  type?: DividerType
  orientation?: DividerOrientation
  dashed?: boolean
  plain?: boolean
  children?: JSX.Element
}
