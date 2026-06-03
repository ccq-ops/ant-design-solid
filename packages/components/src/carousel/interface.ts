import type { JSX } from 'solid-js'

export type CarouselEffect = 'scrollx' | 'fade'
export type CarouselDotPosition = 'top' | 'bottom' | 'left' | 'right'

export interface CarouselRef {
  goTo: (slide: number, dontAnimate?: boolean) => void
  next: () => void
  prev: () => void
}

export interface CarouselDotsObject {
  className?: string
}

export type CarouselDots = boolean | CarouselDotsObject

export interface CarouselProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'ref'
> {
  autoplay?: boolean
  autoplaySpeed?: number
  dots?: CarouselDots
  dotPosition?: CarouselDotPosition
  arrows?: boolean
  effect?: CarouselEffect
  fade?: boolean
  easing?: string
  speed?: number
  infinite?: boolean
  initialSlide?: number
  beforeChange?: (current: number, next: number) => void
  afterChange?: (current: number) => void
  prefixCls?: string
  ref?: CarouselRef | ((ref: CarouselRef) => void)
}
