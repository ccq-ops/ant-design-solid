import type { Component, JSX } from 'solid-js'
import type { ComponentSize } from '@solid-ant-design/theme'
export type SpaceSingleSize = 'small' | 'middle' | 'large' | number
export type SpaceSize = SpaceSingleSize | [SpaceSingleSize, SpaceSingleSize]
export type SpaceOrientation = 'horizontal' | 'vertical'
export type SpaceSemanticSlot = 'item' | 'split'
export type SpaceSemanticClassNames =
  | Partial<Record<SpaceSemanticSlot, string>>
  | ((info: { props: SpaceProps }) => Partial<Record<SpaceSemanticSlot, string>>)
export type SpaceSemanticStyles =
  | Partial<Record<SpaceSemanticSlot, JSX.CSSProperties>>
  | ((info: { props: SpaceProps }) => Partial<Record<SpaceSemanticSlot, JSX.CSSProperties>>)
export interface SpaceProps extends JSX.HTMLAttributes<HTMLDivElement> {
  size?: SpaceSize
  direction?: SpaceOrientation
  orientation?: SpaceOrientation
  vertical?: boolean
  align?: 'start' | 'end' | 'center' | 'baseline'
  wrap?: boolean
  split?: JSX.Element
  separator?: JSX.Element
  classNames?: SpaceSemanticClassNames
  styles?: SpaceSemanticStyles
}
export interface SpaceCompactProps extends JSX.HTMLAttributes<HTMLDivElement> {
  block?: boolean
  direction?: SpaceOrientation
  orientation?: SpaceOrientation
  vertical?: boolean
  size?: ComponentSize | 'medium'
}
export interface SpaceAddonProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  children?: JSX.Element
}
export type SpaceComponent = Component<SpaceProps> & {
  Compact: Component<SpaceCompactProps>
  Addon: Component<SpaceAddonProps>
}
