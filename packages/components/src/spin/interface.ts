import type { JSX } from 'solid-js'

export type SpinSize = 'small' | 'medium' | 'large' | 'default'
export type SpinPercent = number | 'auto'
export type SpinSemanticSlot =
  | 'root'
  | 'section'
  | 'indicator'
  | 'description'
  | 'container'
  | 'tip'
  | 'mask'
export type SpinSemanticClassNames = Partial<Record<SpinSemanticSlot, string>>
export type SpinSemanticStyles = Partial<Record<SpinSemanticSlot, JSX.CSSProperties>>
export type SpinSemanticInfo = { props: SpinProps }
export type SpinSemanticClassNamesConfig =
  | SpinSemanticClassNames
  | ((info: SpinSemanticInfo) => SpinSemanticClassNames)
export type SpinSemanticStylesConfig =
  | SpinSemanticStyles
  | ((info: SpinSemanticInfo) => SpinSemanticStyles)

export interface SpinComponent {
  (props: SpinProps): JSX.Element
  setDefaultIndicator: (indicator: JSX.Element | undefined) => void
}

export interface SpinProps extends JSX.HTMLAttributes<HTMLDivElement> {
  spinning?: boolean
  size?: SpinSize
  tip?: JSX.Element
  description?: JSX.Element
  delay?: number
  fullscreen?: boolean
  wrapperClass?: string
  indicator?: JSX.Element
  percent?: SpinPercent
  classNames?: SpinSemanticClassNamesConfig
  styles?: SpinSemanticStylesConfig
  children?: JSX.Element
}
