import type { JSX } from 'solid-js'

export type SkeletonSize = 'small' | 'medium' | 'default' | 'large' | number
export type SkeletonAvatarSize = SkeletonSize
export type SkeletonAvatarShape = 'circle' | 'square'
export type SkeletonElementShape = 'circle' | 'square' | 'round' | 'default'
export type SkeletonWidth = number | string
export type SkeletonSemanticSlot = 'root' | 'header' | 'section' | 'avatar' | 'title' | 'paragraph'
export type SkeletonElementSemanticSlot = 'root' | 'content'
export type SkeletonSemanticClassNamesMap = Partial<Record<SkeletonSemanticSlot, string>>
export type SkeletonSemanticStylesMap = Partial<Record<SkeletonSemanticSlot, JSX.CSSProperties>>
export type SkeletonSemanticInfo = { props: SkeletonProps }
export type SkeletonSemanticClassNames =
  | SkeletonSemanticClassNamesMap
  | ((info: SkeletonSemanticInfo) => SkeletonSemanticClassNamesMap)
export type SkeletonSemanticStyles =
  | SkeletonSemanticStylesMap
  | ((info: SkeletonSemanticInfo) => SkeletonSemanticStylesMap)
export type SkeletonElementSemanticClassNames = Partial<Record<SkeletonElementSemanticSlot, string>>
export type SkeletonElementSemanticStyles = Partial<
  Record<SkeletonElementSemanticSlot, JSX.CSSProperties>
>

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
  prefixCls?: string
  rootClassName?: string
  avatar?: boolean | SkeletonAvatarProps
  title?: boolean | SkeletonTitleProps
  paragraph?: boolean | SkeletonParagraphProps
  round?: boolean
  classNames?: SkeletonSemanticClassNames
  styles?: SkeletonSemanticStyles
  children?: JSX.Element
}

export interface SkeletonElementProps extends JSX.HTMLAttributes<HTMLDivElement> {
  active?: boolean
  prefixCls?: string
  rootClassName?: string
  size?: SkeletonSize
  shape?: SkeletonElementShape
  classNames?: SkeletonElementSemanticClassNames
  styles?: SkeletonElementSemanticStyles
}

export interface SkeletonButtonProps extends SkeletonElementProps {
  block?: boolean
}

export interface SkeletonInputProps extends Omit<SkeletonElementProps, 'shape'> {
  block?: boolean
}

export interface SkeletonIndependentAvatarProps extends Omit<SkeletonElementProps, 'shape'> {
  shape?: SkeletonAvatarShape
}

export interface SkeletonNodeProps extends Omit<SkeletonElementProps, 'size' | 'shape'> {
  internalClassName?: string
}

export interface SkeletonImageProps extends Omit<
  SkeletonNodeProps,
  'children' | 'internalClassName'
> {}

export interface SkeletonComponent {
  (props: SkeletonProps): JSX.Element
  Button: (props: SkeletonButtonProps) => JSX.Element
  Avatar: (props: SkeletonIndependentAvatarProps) => JSX.Element
  Input: (props: SkeletonInputProps) => JSX.Element
  Image: (props: SkeletonImageProps) => JSX.Element
  Node: (props: SkeletonNodeProps) => JSX.Element
}
