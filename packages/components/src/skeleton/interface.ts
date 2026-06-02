import type { JSX } from 'solid-js'

export type SkeletonAvatarSize = 'small' | 'default' | 'large' | number
export type SkeletonAvatarShape = 'circle' | 'square'
export type SkeletonWidth = number | string

export interface SkeletonAvatarProps {
  size?: SkeletonAvatarSize
  shape?: SkeletonAvatarShape
}

export interface SkeletonTitleProps {
  width?: SkeletonWidth
}

export interface SkeletonParagraphProps {
  rows?: number
  width?: SkeletonWidth | SkeletonWidth[]
}

export interface SkeletonProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'> {
  active?: boolean
  loading?: boolean
  avatar?: boolean | SkeletonAvatarProps
  title?: boolean | SkeletonTitleProps
  paragraph?: boolean | SkeletonParagraphProps
  round?: boolean
  children?: JSX.Element
}
