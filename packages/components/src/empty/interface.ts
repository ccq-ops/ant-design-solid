import type { JSX } from 'solid-js'

export interface EmptyProps extends JSX.HTMLAttributes<HTMLDivElement> {
  image?: JSX.Element | string
  imageStyle?: JSX.CSSProperties
  description?: JSX.Element
  children?: JSX.Element
}
