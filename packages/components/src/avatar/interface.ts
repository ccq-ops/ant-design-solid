import type { JSX } from 'solid-js'
import type { ResponsiveLike } from '../shared/responsive-observer'
import type { PopoverProps, PopoverTrigger } from '../popover'

export type AvatarSize = 'small' | 'medium' | 'default' | 'large' | number
export type AvatarResponsiveSize = ResponsiveLike<number>
export type AvatarShape = 'circle' | 'square'
export type AvatarImageCrossOrigin = '' | 'anonymous' | 'use-credentials'

export interface AvatarProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  prefixCls?: string
  rootClass?: string
  size?: AvatarSize | AvatarResponsiveSize
  shape?: AvatarShape
  src?: string | JSX.Element
  srcSet?: string
  alt?: string
  draggable?: boolean | 'true' | 'false'
  crossOrigin?: AvatarImageCrossOrigin
  icon?: JSX.Element
  gap?: number
  onError?: () => boolean
  children?: JSX.Element
}

export interface AvatarGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  prefixCls?: string
  rootClass?: string
  maxCount?: number
  maxStyle?: JSX.CSSProperties
  maxPopoverPlacement?: 'top' | 'bottom'
  maxPopoverTrigger?: PopoverTrigger
  max?: {
    count?: number
    style?: JSX.CSSProperties
    popover?: PopoverProps
  }
  size?: AvatarSize | AvatarResponsiveSize
  shape?: AvatarShape
  children?: JSX.Element
}
