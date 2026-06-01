import type { JSX } from 'solid-js'
export type SpaceSize = 'small' | 'middle' | 'large' | number | [number, number]
export interface SpaceProps extends JSX.HTMLAttributes<HTMLDivElement> {
  size?: SpaceSize
  direction?: 'horizontal' | 'vertical'
  align?: 'start' | 'end' | 'center' | 'baseline'
  wrap?: boolean
  split?: JSX.Element
}
