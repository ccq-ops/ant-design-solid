import type { JSX } from 'solid-js'

export type CardSize = 'default' | 'small'

export interface CardProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: JSX.Element
  extra?: JSX.Element
  cover?: JSX.Element
  actions?: JSX.Element[]
  bordered?: boolean
  hoverable?: boolean
  size?: CardSize
  children?: JSX.Element
}
