import {
  For,
  Show,
  children,
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
  splitProps,
  untrack,
} from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useCarouselStyle } from './carousel.style'
import type {
  CarouselDotPlacement,
  CarouselDotsObject,
  CarouselProps,
  CarouselRef,
  CarouselSettings,
} from './interface'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function dotsObject(dots: CarouselProps['dots']): CarouselDotsObject | undefined {
  return typeof dots === 'object' ? dots : undefined
}

function normalizeDotPlacement(
  dotPlacement?: CarouselProps['dotPlacement'],
  dotPosition?: CarouselProps['dotPosition'],
): CarouselDotPlacement {
  const placement = dotPlacement ?? dotPosition ?? 'bottom'
  if (placement === 'left') return 'start'
  if (placement === 'right') return 'end'
  return placement
}

function positiveInteger(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value) || value === undefined) return fallback
  return Math.max(1, Math.floor(value))
}

function responsiveSettings(
  responsive: CarouselProps['responsive'],
): Partial<CarouselSettings> | undefined {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
  return responsive
    ?.slice()
    .sort((a, b) => a.breakpoint - b.breakpoint)
    .find((entry) => window.matchMedia(`(max-width: ${entry.breakpoint}px)`).matches)?.settings as
    | Partial<CarouselSettings>
    | undefined
}

export function Carousel(props: CarouselProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'adaptiveHeight',
    'appendDots',
    'autoplay',
    'autoplaySpeed',
    'dots',
    'dotPlacement',
    'dotPosition',
    'arrows',
    'customPaging',
    'draggable',
    'effect',
    'fade',
    'easing',
    'focusOnSelect',
    'speed',
    'infinite',
    'initialSlide',
    'lazyLoad',
    'nextArrow',
    'pauseOnDotsHover',
    'pauseOnFocus',
    'pauseOnHover',
    'prevArrow',
    'responsive',
    'rtl',
    'slidesToScroll',
    'slidesToShow',
    'slickGoTo',
    'swipe',
    'swipeToSlide',
    'touchMove',
    'touchThreshold',
    'variableWidth',
    'vertical',
    'verticalSwiping',
    'waitForAnimate',
    'beforeChange',
    'afterChange',
    'prefixCls',
    'rootClass',
    'class',
    'style',
    'ref',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-carousel`
  const [, hashId] = useCarouselStyle(prefixCls())
  const resolvedChildren = children(() => local.children)
  const slides = createMemo(() =>
    resolvedChildren
      .toArray()
      .filter((slide) => slide !== null && slide !== undefined && slide !== false),
  )
  const matchedSettings = createMemo(() => responsiveSettings(local.responsive) ?? {})
  const settings = createMemo(() => mergeProps(local, matchedSettings()) as CarouselProps)
  const [activeIndex, setActiveIndex] = createSignal(
    Math.max(0, Math.floor(local.initialSlide ?? 0)),
  )
  const [animate, setAnimate] = createSignal(true)
  const [paused, setPaused] = createSignal(false)
  const [dragStart, setDragStart] = createSignal<{ x: number; y: number } | null>(null)

  const slideCount = () => slides().length
  const infinite = () => settings().infinite ?? true
  const dots = () => settings().dots ?? true
  const dotPlacement = () => normalizeDotPlacement(settings().dotPlacement, local.dotPosition)
  const isVertical = () =>
    settings().vertical || dotPlacement() === 'start' || dotPlacement() === 'end'
  const effect = () => (settings().fade ? 'fade' : (settings().effect ?? 'scrollx'))
  const speed = () => settings().speed ?? 500
  const easing = () => settings().easing ?? 'linear'
  const slidesToShow = () => positiveInteger(settings().slidesToShow, 1)
  const slidesToScroll = () => positiveInteger(settings().slidesToScroll, 1)
  const autoplaySpeed = () => settings().autoplaySpeed ?? 3000
  const autoplayEnabled = () => !!settings().autoplay
  const dotDuration = () => {
    const autoplay = settings().autoplay
    return autoplay && typeof autoplay === 'object' && autoplay.dotDuration
      ? `${autoplaySpeed()}ms`
      : undefined
  }

  function normalizeIndex(index: number): number {
    const count = slideCount()
    if (count <= 0) return 0
    const integer = Math.floor(index)
    if (infinite()) return ((integer % count) + count) % count
    return clamp(integer, 0, count - 1)
  }

  function goTo(slide: number, dontAnimate = false): void {
    const count = slideCount()
    if (count <= 0) return
    const current = normalizeIndex(activeIndex())
    const next = normalizeIndex(slide)
    if (next === current) return
    if (settings().waitForAnimate && !animate()) return
    setAnimate(!dontAnimate)
    settings().beforeChange?.(current, next)
    setActiveIndex(next)
    settings().afterChange?.(next)
  }

  const api: CarouselRef = {
    goTo: (slide: number, dontAnimate?: boolean) => goTo(slide, dontAnimate),
    next: () => goTo(activeIndex() + slidesToScroll()),
    prev: () => goTo(activeIndex() - slidesToScroll()),
    autoPlay: () => setPaused(false),
    get innerSlider() {
      return {
        currentSlide: activeIndex(),
        slideCount: slideCount(),
      }
    },
  }

  createEffect(() => {
    const ref = local.ref
    if (typeof ref === 'function') ref(api)
    else if (ref && typeof ref === 'object') Object.assign(ref, api)
  })

  createEffect(() => {
    const count = slideCount()
    if (count <= 0) {
      setActiveIndex(0)
      return
    }
    const next = clamp(activeIndex(), 0, count - 1)
    if (next !== activeIndex()) setActiveIndex(next)
  })

  createEffect(() => {
    const target = local.slickGoTo
    if (typeof target === 'number') untrack(() => goTo(target))
  })

  createEffect(() => {
    if (!autoplayEnabled() || paused() || slideCount() <= slidesToShow()) return
    const interval = window.setInterval(() => api.next(), autoplaySpeed())
    onCleanup(() => window.clearInterval(interval))
  })

  const trackStyle = createMemo(() => {
    if (effect() === 'fade') return undefined
    const axis = isVertical() ? 'Y' : 'X'
    const offset = (activeIndex() * 100) / slidesToShow()
    return {
      transform: axis === 'Y' ? `translate3d(0, -${offset}%, 0)` : `translate3d(-${offset}%, 0, 0)`,
      transition: animate() ? `transform ${speed()}ms ${easing()}` : 'none',
    }
  })

  const slideStyle = createMemo(() => {
    const basis = `${100 / slidesToShow()}%`
    if (effect() !== 'fade') {
      return isVertical() ? { height: basis, 'flex-basis': basis } : { 'flex-basis': basis }
    }
    return { transition: animate() ? `opacity ${speed()}ms ${easing()}` : 'none' }
  })

  const viewportStyle = createMemo(() => {
    if (!settings().adaptiveHeight) return undefined
    const activeSlide = slides()[activeIndex()]
    if (!activeSlide || typeof activeSlide !== 'object' || !('style' in activeSlide))
      return undefined
    const style = activeSlide.style as { height?: string | number } | undefined
    const height = style?.height
    return height === undefined
      ? undefined
      : { height: typeof height === 'number' ? `${height}px` : height }
  })

  const previousDisabled = () => !infinite() && activeIndex() <= 0
  const nextDisabled = () => !infinite() && activeIndex() >= slideCount() - 1
  const arrowLabel = (type: 'prev' | 'next') =>
    settings().rtl ? (type === 'prev' ? 'next' : 'prev') : type
  const dragEnabled = () => settings().draggable || settings().swipe || settings().touchMove

  function dragPoint(event: PointerEvent): { x: number; y: number } {
    return { x: event.clientX, y: event.clientY }
  }

  function onPointerDown(event: PointerEvent): void {
    if (!dragEnabled()) return
    setDragStart(dragPoint(event))
  }

  function onPointerUp(event: PointerEvent): void {
    const start = dragStart()
    if (!start) return
    setDragStart(null)
    const end = dragPoint(event)
    const delta = isVertical() ? start.y - end.y : start.x - end.x
    const threshold = settings().touchThreshold ?? 50
    if (Math.abs(delta) < threshold) return
    if (delta > 0) api.next()
    else api.prev()
  }

  const dotsNode = () => (
    <ul
      class={classNames(
        `${prefixCls()}-dots`,
        `slick-dots`,
        `slick-dots-${dotPlacement()}`,
        dotsObject(dots())?.class,
      )}
      onMouseEnter={() => settings().pauseOnDotsHover && setPaused(true)}
      onMouseLeave={() => settings().pauseOnDotsHover && setPaused(false)}
    >
      <For each={slides()}>
        {(_, index) => (
          <li class={classNames(index() === activeIndex() && 'slick-active')}>
            <button
              type="button"
              role="tab"
              aria-label={`Go to slide ${index() + 1}`}
              aria-current={index() === activeIndex() ? 'true' : undefined}
              class={classNames(
                `${prefixCls()}-dot`,
                index() === activeIndex() && `${prefixCls()}-dot-active`,
              )}
              onClick={() => goTo(index())}
            >
              {settings().customPaging?.(index())}
            </button>
          </li>
        )}
      </For>
    </ul>
  )

  return (
    <div
      class={classNames(
        prefixCls(),
        settings().rtl && `${prefixCls()}-rtl`,
        effect() === 'fade' && `${prefixCls()}-fade`,
        isVertical() && `${prefixCls()}-vertical`,
        `${prefixCls()}-dot-${dotPlacement()}`,
        hashId(),
        local.rootClass,
      )}
      style={{
        '--dot-duration': dotDuration(),
        ...(typeof local.style === 'object' ? local.style : {}),
      }}
      onMouseEnter={(event) => {
        const handler = rest.onMouseEnter
        if (typeof handler === 'function') handler(event)
        if (settings().pauseOnHover) setPaused(true)
      }}
      onMouseLeave={(event) => {
        const handler = rest.onMouseLeave
        if (typeof handler === 'function') handler(event)
        if (settings().pauseOnHover) setPaused(false)
      }}
      onFocusIn={() => settings().pauseOnFocus && setPaused(true)}
      onFocusOut={() => settings().pauseOnFocus && setPaused(false)}
    >
      <div {...rest} class={classNames(`${prefixCls()}-slider`, local.class)}>
        <div
          class={`${prefixCls()}-viewport`}
          style={viewportStyle()}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <div class={`${prefixCls()}-track`} style={trackStyle()}>
            <For each={slides()}>
              {(slide, index) => (
                <div
                  class={classNames(
                    `${prefixCls()}-slide`,
                    index() === activeIndex() && `${prefixCls()}-slide-active`,
                  )}
                  aria-hidden={index() === activeIndex() ? 'false' : 'true'}
                  style={slideStyle()}
                >
                  {slide}
                </div>
              )}
            </For>
          </div>
        </div>

        <Show when={settings().arrows && slideCount() > slidesToShow()}>
          <button
            type="button"
            aria-label={arrowLabel('prev')}
            class={classNames(`${prefixCls()}-arrow`, `${prefixCls()}-prev`, 'slick-prev')}
            disabled={previousDisabled()}
            onClick={() => api.prev()}
          >
            {settings().prevArrow ?? '‹'}
          </button>
          <button
            type="button"
            aria-label={arrowLabel('next')}
            class={classNames(`${prefixCls()}-arrow`, `${prefixCls()}-next`, 'slick-next')}
            disabled={nextDisabled()}
            onClick={() => api.next()}
          >
            {settings().nextArrow ?? '›'}
          </button>
        </Show>

        <Show when={dots() && slideCount() > slidesToShow()}>
          {settings().appendDots ? settings().appendDots?.(dotsNode()) : dotsNode()}
        </Show>
      </div>
    </div>
  )
}
