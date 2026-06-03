import {
  For,
  Show,
  children,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  splitProps,
} from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useCarouselStyle } from './carousel.style'
import type { CarouselDotsObject, CarouselProps, CarouselRef } from './interface'

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function dotsObject(dots: CarouselProps['dots']): CarouselDotsObject | undefined {
  return typeof dots === 'object' ? dots : undefined
}

export function Carousel(props: CarouselProps) {
  const [local, rest] = splitProps(props, [
    'children',
    'autoplay',
    'autoplaySpeed',
    'dots',
    'dotPosition',
    'arrows',
    'effect',
    'fade',
    'easing',
    'speed',
    'infinite',
    'initialSlide',
    'beforeChange',
    'afterChange',
    'prefixCls',
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
  const [activeIndex, setActiveIndex] = createSignal(
    Math.max(0, Math.floor(local.initialSlide ?? 0)),
  )

  const slideCount = () => slides().length
  const infinite = () => local.infinite ?? true
  const dots = () => local.dots ?? true
  const dotPosition = () => local.dotPosition ?? 'bottom'
  const effect = () => (local.fade ? 'fade' : (local.effect ?? 'scrollx'))
  const isVerticalDots = () => dotPosition() === 'left' || dotPosition() === 'right'
  const speed = () => local.speed ?? 500
  const easing = () => local.easing ?? 'ease'

  function normalizeIndex(index: number): number {
    const count = slideCount()
    if (count <= 0) return 0
    const integer = Math.floor(index)
    if (infinite()) return ((integer % count) + count) % count
    return clamp(integer, 0, count - 1)
  }

  function goTo(slide: number): void {
    const count = slideCount()
    if (count <= 0) return
    const current = normalizeIndex(activeIndex())
    const next = normalizeIndex(slide)
    if (next === current) return
    local.beforeChange?.(current, next)
    setActiveIndex(next)
    local.afterChange?.(next)
  }

  const api: CarouselRef = {
    goTo: (slide: number) => goTo(slide),
    next: () => goTo(activeIndex() + 1),
    prev: () => goTo(activeIndex() - 1),
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
    if (!local.autoplay || slideCount() <= 1) return
    const interval = window.setInterval(() => api.next(), local.autoplaySpeed ?? 3000)
    onCleanup(() => window.clearInterval(interval))
  })

  const trackStyle = createMemo(() => {
    if (effect() === 'fade') return undefined
    return {
      transform: `translate3d(-${activeIndex() * 100}%, 0, 0)`,
      transition: `transform ${speed()}ms ${easing()}`,
    }
  })

  const slideStyle = createMemo(() => {
    if (effect() !== 'fade') return undefined
    return { transition: `opacity ${speed()}ms ${easing()}` }
  })

  const previousDisabled = () => !infinite() && activeIndex() <= 0
  const nextDisabled = () => !infinite() && activeIndex() >= slideCount() - 1

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        effect() === 'fade' && `${prefixCls()}-fade`,
        isVerticalDots() && `${prefixCls()}-vertical`,
        `${prefixCls()}-dot-${dotPosition()}`,
        hashId(),
        local.class,
      )}
      style={local.style}
    >
      <div class={`${prefixCls()}-viewport`}>
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

      <Show when={local.arrows && slideCount() > 1}>
        <button
          type="button"
          aria-label="Previous slide"
          class={classNames(`${prefixCls()}-arrow`, `${prefixCls()}-prev`)}
          disabled={previousDisabled()}
          onClick={() => api.prev()}
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next slide"
          class={classNames(`${prefixCls()}-arrow`, `${prefixCls()}-next`)}
          disabled={nextDisabled()}
          onClick={() => api.next()}
        >
          ›
        </button>
      </Show>

      <Show when={dots() && slideCount() > 1}>
        <ul class={classNames(`${prefixCls()}-dots`, dotsObject(dots())?.className)}>
          <For each={slides()}>
            {(_, index) => (
              <li>
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
                />
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  )
}
