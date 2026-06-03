import type { JSX } from 'solid-js'

export interface ImageProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'placeholder' | 'onError' | 'onLoad'
> {
  src?: string
  alt?: string
  width?: number | string
  height?: number | string
  fallback?: string
  placeholder?: JSX.Element | boolean
  preview?: boolean
  prefixCls?: string
  onLoad?: JSX.EventHandler<HTMLImageElement, Event>
  onError?: JSX.EventHandler<HTMLImageElement, Event>
}
