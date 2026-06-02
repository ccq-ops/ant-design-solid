import type { JSX } from 'solid-js'

export type SpinSize = 'small' | 'default' | 'large'

export interface SpinProps extends JSX.HTMLAttributes<HTMLDivElement> {
  spinning?: boolean
  size?: SpinSize
  tip?: JSX.Element
  delay?: number
  fullscreen?: boolean
  indicator?: JSX.Element
  children?: JSX.Element
}
