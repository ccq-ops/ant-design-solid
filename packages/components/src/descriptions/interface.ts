import type { JSX } from 'solid-js'

export type DescriptionsSize = 'default' | 'middle' | 'small'
export type DescriptionsLayout = 'horizontal' | 'vertical'

export interface DescriptionsItemType {
  label?: JSX.Element
  children?: JSX.Element
  span?: number
  class?: string
  className?: string
  style?: JSX.CSSProperties | string
}

export interface DescriptionsItemProps extends DescriptionsItemType {}

export interface DescriptionsProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: JSX.Element
  extra?: JSX.Element
  bordered?: boolean
  column?: number
  size?: DescriptionsSize
  layout?: DescriptionsLayout
  items?: DescriptionsItemType[]
  children?: JSX.Element
}
