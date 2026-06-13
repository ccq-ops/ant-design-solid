import type { JSX } from 'solid-js'

export type CarouselEffect = 'scrollx' | 'fade'
export type CarouselDotPlacement = 'top' | 'bottom' | 'start' | 'end'
export type CarouselDotPosition = CarouselDotPlacement | 'left' | 'right'
export type CarouselLazyLoad = 'ondemand' | 'progressive'

export interface CarouselRef {
  goTo: (slide: number, dontAnimate?: boolean) => void
  next: () => void
  prev: () => void
  autoPlay: (playType?: 'update' | 'leave' | 'blur') => void
  innerSlider: {
    currentSlide: number
    slideCount: number
  }
}

export interface CarouselDotsObject {
  class?: string
}

export type CarouselDots = boolean | CarouselDotsObject

export interface CarouselAutoplayObject {
  dotDuration?: boolean
}

export type CarouselAutoplay = boolean | CarouselAutoplayObject

export interface CarouselResponsiveObject {
  breakpoint: number
  settings: Partial<CarouselSettings> | 'unslick'
}

export interface CarouselSettings {
  adaptiveHeight?: boolean
  appendDots?: (dots: JSX.Element) => JSX.Element
  arrows?: boolean
  autoplay?: CarouselAutoplay
  autoplaySpeed?: number
  beforeChange?: (current: number, next: number) => void
  centerMode?: boolean
  centerPadding?: string
  customPaging?: (index: number) => JSX.Element
  dots?: CarouselDots
  draggable?: boolean
  easing?: string
  effect?: CarouselEffect
  fade?: boolean
  focusOnSelect?: boolean
  infinite?: boolean
  initialSlide?: number
  lazyLoad?: CarouselLazyLoad
  nextArrow?: JSX.Element
  pauseOnDotsHover?: boolean
  pauseOnFocus?: boolean
  pauseOnHover?: boolean
  prevArrow?: JSX.Element
  responsive?: CarouselResponsiveObject[]
  rtl?: boolean
  slidesToScroll?: number
  slidesToShow?: number
  speed?: number
  swipe?: boolean
  swipeToSlide?: boolean
  touchMove?: boolean
  touchThreshold?: number
  variableWidth?: boolean
  vertical?: boolean
  verticalSwiping?: boolean
  waitForAnimate?: boolean
}

export interface CarouselProps
  extends
    Omit<JSX.HTMLAttributes<HTMLDivElement>, 'draggable' | 'onChange' | 'ref'>,
    CarouselSettings {
  dotPosition?: CarouselDotPosition
  dotPlacement?: CarouselDotPlacement
  afterChange?: (current: number) => void
  prefixCls?: string
  rootClass?: string
  slickGoTo?: number
  ref?: CarouselRef | ((ref: CarouselRef) => void)
}
