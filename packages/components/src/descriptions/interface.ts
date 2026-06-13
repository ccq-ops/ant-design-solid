import type { JSX } from 'solid-js'
import type { Breakpoint, ResponsiveLike } from '../shared/responsive-observer'

export type DescriptionsSize = 'large' | 'medium' | 'small'
export type DescriptionsLayout = 'horizontal' | 'vertical'
export type DescriptionsColumn = number | ResponsiveLike<number>
export type DescriptionsItemSpan = number | 'filled' | ResponsiveLike<number>

export interface DescriptionsCellClassNames {
  label?: string
  content?: string
}

export interface DescriptionsCellStyles {
  label?: JSX.CSSProperties | string
  content?: JSX.CSSProperties | string
}

export interface DescriptionsClassNames extends DescriptionsCellClassNames {
  root?: string
  header?: string
  title?: string
  extra?: string
}

export interface DescriptionsStyles extends DescriptionsCellStyles {
  root?: JSX.CSSProperties | string
  header?: JSX.CSSProperties | string
  title?: JSX.CSSProperties | string
  extra?: JSX.CSSProperties | string
}

export interface DescriptionsSemanticInfo {
  props: DescriptionsProps & {
    column: number
    size: DescriptionsSize
    layout: DescriptionsLayout
    colon: boolean
    items: DescriptionsItemType[]
  }
}

export type DescriptionsClassNamesConfig =
  | DescriptionsClassNames
  | ((info: DescriptionsSemanticInfo) => DescriptionsClassNames)

export type DescriptionsStylesConfig =
  | DescriptionsStyles
  | ((info: DescriptionsSemanticInfo) => DescriptionsStyles)

export interface DescriptionsItemType {
  key?: string | number
  label?: JSX.Element
  children?: JSX.Element
  span?: DescriptionsItemSpan
  class?: string
  style?: JSX.CSSProperties | string
  classNames?: DescriptionsCellClassNames
  styles?: DescriptionsCellStyles
}

export interface DescriptionsItemProps extends DescriptionsItemType {}

export interface DescriptionsProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: JSX.Element
  extra?: JSX.Element
  bordered?: boolean
  column?: DescriptionsColumn
  size?: DescriptionsSize
  layout?: DescriptionsLayout
  colon?: boolean
  classNames?: DescriptionsClassNamesConfig
  styles?: DescriptionsStylesConfig
  items?: DescriptionsItemType[]
  children?: JSX.Element
}

export type { Breakpoint }
