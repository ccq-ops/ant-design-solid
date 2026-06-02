import type { JSX } from 'solid-js'

export type AvatarSize = 'small' | 'default' | 'large' | number
export type AvatarShape = 'circle' | 'square'

export interface AvatarProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  size?: AvatarSize
  shape?: AvatarShape
  src?: string
  alt?: string
  icon?: JSX.Element
  gap?: number
  children?: JSX.Element
}

export interface AvatarGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  maxCount?: number
  maxStyle?: JSX.CSSProperties
  size?: AvatarSize
  shape?: AvatarShape
  children?: JSX.Element
}
