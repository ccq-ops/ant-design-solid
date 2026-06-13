import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Carousel } from '../index'
import type { CarouselRef } from '../index'

function slides() {
  return (
    <>
      <div>Slide one</div>
      <div>Slide two</div>
      <div>Slide three</div>
    </>
  )
}

function activeSlide(container: HTMLElement) {
  return container.querySelector('.ads-carousel-slide-active') as HTMLElement
}

describe('Carousel', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders slides and starts from initialSlide', () => {
    const result = render(() => <Carousel initialSlide={1}>{slides()}</Carousel>)

    expect(result.getByText('Slide one')).toBeInTheDocument()
    expect(result.getByText('Slide two')).toBeInTheDocument()
    expect(activeSlide(result.container)).toHaveTextContent('Slide two')
    expect(result.getAllByRole('tab')).toHaveLength(3)
    expect(result.getByRole('tab', { name: 'Go to slide 2' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('changes slides from dots and calls callbacks', () => {
    const beforeChange = vi.fn()
    const afterChange = vi.fn()
    const result = render(() => (
      <Carousel beforeChange={beforeChange} afterChange={afterChange}>
        {slides()}
      </Carousel>
    ))

    fireEvent.click(result.getByRole('tab', { name: 'Go to slide 3' }))

    expect(beforeChange).toHaveBeenCalledWith(0, 2)
    expect(afterChange).toHaveBeenCalledWith(2)
    expect(activeSlide(result.container)).toHaveTextContent('Slide three')
    expect(result.getByRole('tab', { name: 'Go to slide 3' })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  it('changes slides from arrows and wraps by default', () => {
    const result = render(() => <Carousel arrows>{slides()}</Carousel>)

    fireEvent.click(result.getByRole('button', { name: 'prev' }))
    expect(activeSlide(result.container)).toHaveTextContent('Slide three')

    fireEvent.click(result.getByRole('button', { name: 'next' }))
    expect(activeSlide(result.container)).toHaveTextContent('Slide one')
  })

  it('clamps navigation and disables edge arrows when infinite is false', () => {
    const result = render(() => (
      <Carousel arrows infinite={false}>
        {slides()}
      </Carousel>
    ))
    const previous = result.getByRole('button', { name: 'prev' })
    const next = result.getByRole('button', { name: 'next' })

    expect(previous).toBeDisabled()
    fireEvent.click(previous)
    expect(activeSlide(result.container)).toHaveTextContent('Slide one')

    fireEvent.click(next)
    fireEvent.click(next)
    expect(activeSlide(result.container)).toHaveTextContent('Slide three')
    expect(next).toBeDisabled()
  })

  it('exposes goTo, next, and prev methods through ref', () => {
    let carousel: CarouselRef | undefined
    const result = render(() => (
      <Carousel
        ref={(ref) => {
          carousel = ref
        }}
      >
        {slides()}
      </Carousel>
    ))

    carousel?.goTo(2)
    expect(activeSlide(result.container)).toHaveTextContent('Slide three')

    carousel?.next()
    expect(activeSlide(result.container)).toHaveTextContent('Slide one')

    carousel?.prev()
    expect(activeSlide(result.container)).toHaveTextContent('Slide three')
  })

  it('autoplays with the configured speed', () => {
    vi.useFakeTimers()
    const afterChange = vi.fn()
    const result = render(() => (
      <Carousel autoplay autoplaySpeed={1000} afterChange={afterChange}>
        {slides()}
      </Carousel>
    ))

    vi.advanceTimersByTime(1000)

    expect(activeSlide(result.container)).toHaveTextContent('Slide two')
    expect(afterChange).toHaveBeenCalledWith(1)
  })

  it('renders fade effect classes', () => {
    const result = render(() => <Carousel effect="fade">{slides()}</Carousel>)
    const root = result.container.firstElementChild as HTMLElement

    expect(root.className).toContain('ads-carousel-fade')
    expect(activeSlide(result.container)).toHaveTextContent('Slide one')
  })

  it('supports custom prefix, class, style, dotPosition, dots className, and hidden arrows/dots', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Carousel
          arrows={false}
          dots={{ class: 'extra-dots' }}
          dotPosition="left"
          class="extra-carousel"
          style={{ width: '240px' }}
        >
          {slides()}
        </Carousel>
      </ConfigProvider>
    ))
    const root = result.container.firstElementChild as HTMLElement

    expect(root.className).toContain('custom-carousel')
    expect(root.className).toContain('custom-carousel-vertical')
    expect(root.className).toContain('custom-carousel-dot-start')
    expect(result.container.querySelector('.custom-carousel-slider')).toHaveClass('extra-carousel')
    expect(root).toHaveStyle('width: 240px')
    expect(result.container.querySelector('.extra-dots')).toBeInTheDocument()
    expect(result.queryByRole('button', { name: 'next' })).not.toBeInTheDocument()
  })

  it('reacts to dynamic children by keeping the active index valid', () => {
    const [showThird, setShowThird] = createSignal(true)
    const result = render(() => (
      <Carousel initialSlide={2}>
        <div>Slide one</div>
        <div>Slide two</div>
        {showThird() && <div>Slide three</div>}
      </Carousel>
    ))

    expect(activeSlide(result.container)).toHaveTextContent('Slide three')
    setShowThird(false)

    expect(activeSlide(result.container)).toHaveTextContent('Slide two')
    expect(result.getAllByRole('tab')).toHaveLength(2)
  })

  it('supports dotPlacement start/end and keeps deprecated dotPosition compatible', () => {
    const start = render(() => <Carousel dotPlacement="start">{slides()}</Carousel>)
    const startRoot = start.container.firstElementChild as HTMLElement

    expect(startRoot.className).toContain('ads-carousel-vertical')
    expect(startRoot.className).toContain('ads-carousel-dot-start')

    const legacy = render(() => <Carousel dotPosition="right">{slides()}</Carousel>)
    const legacyRoot = legacy.container.firstElementChild as HTMLElement

    expect(legacyRoot.className).toContain('ads-carousel-vertical')
    expect(legacyRoot.className).toContain('ads-carousel-dot-end')
  })

  it('supports Solid class names for root, dots, and custom paging', () => {
    const result = render(() => (
      <Carousel
        rootClass="root-extra"
        class="inner-extra"
        dots={{ class: 'dots-extra' }}
        customPaging={(index) => <span data-testid={`page-${index}`}>{index + 1}</span>}
      >
        {slides()}
      </Carousel>
    ))
    const root = result.container.firstElementChild as HTMLElement

    expect(root.className).toContain('ads-carousel')
    expect(root.className).toContain('root-extra')
    expect(result.container.querySelector('.ads-carousel-slider')).toHaveClass('inner-extra')
    expect(result.container.querySelector('.dots-extra')).toBeInTheDocument()
    expect(result.getByTestId('page-1')).toHaveTextContent('2')
  })

  it('supports appendDots and custom arrows', () => {
    const result = render(() => (
      <Carousel
        arrows
        prevArrow={<span data-testid="prev-arrow">Prev</span>}
        nextArrow={<span data-testid="next-arrow">Next</span>}
        appendDots={(dots) => <ol class="custom-dots">{dots}</ol>}
      >
        {slides()}
      </Carousel>
    ))

    expect(result.getByTestId('prev-arrow')).toHaveTextContent('Prev')
    expect(result.getByTestId('next-arrow')).toHaveTextContent('Next')
    expect(result.container.querySelector('.custom-dots')).toBeInTheDocument()

    fireEvent.click(result.getByRole('button', { name: 'next' }))
    expect(activeSlide(result.container)).toHaveTextContent('Slide two')
  })

  it('supports slickGoTo and goTo without animation', () => {
    let carousel: CarouselRef | undefined
    const [target, setTarget] = createSignal(1)
    const result = render(() => (
      <Carousel
        slickGoTo={target()}
        ref={(ref) => {
          carousel = ref
        }}
      >
        {slides()}
      </Carousel>
    ))

    expect(activeSlide(result.container)).toHaveTextContent('Slide two')

    setTarget(2)
    expect(activeSlide(result.container)).toHaveTextContent('Slide three')

    carousel?.goTo(0, true)
    const track = result.container.querySelector('.ads-carousel-track') as HTMLElement
    expect(activeSlide(result.container)).toHaveTextContent('Slide one')
    expect(track.style.transition).toBe('none')
  })

  it('supports autoplay dot duration and pause interactions', () => {
    vi.useFakeTimers()
    const result = render(() => (
      <Carousel autoplay={{ dotDuration: true }} autoplaySpeed={1000} pauseOnHover>
        {slides()}
      </Carousel>
    ))
    const root = result.container.firstElementChild as HTMLElement

    expect(root.style.getPropertyValue('--dot-duration')).toBe('1000ms')

    fireEvent.mouseEnter(root)
    vi.advanceTimersByTime(1000)
    expect(activeSlide(result.container)).toHaveTextContent('Slide one')

    fireEvent.mouseLeave(root)
    vi.advanceTimersByTime(1000)
    expect(activeSlide(result.container)).toHaveTextContent('Slide two')
  })

  it('supports draggable desktop swiping', () => {
    const result = render(() => <Carousel draggable>{slides()}</Carousel>)
    const viewport = result.container.querySelector('.ads-carousel-viewport') as HTMLElement

    fireEvent.pointerDown(viewport, { clientX: 120, clientY: 0, pointerId: 1 })
    fireEvent.pointerMove(viewport, { clientX: 20, clientY: 0, pointerId: 1 })
    fireEvent.pointerUp(viewport, { clientX: 20, clientY: 0, pointerId: 1 })

    expect(activeSlide(result.container)).toHaveTextContent('Slide two')
  })

  it('supports slidesToShow, slidesToScroll, vertical, rtl, and adaptiveHeight', () => {
    const result = render(() => (
      <Carousel arrows adaptiveHeight dotPlacement="end" rtl slidesToShow={2} slidesToScroll={2}>
        <div style={{ height: '50px' }}>Slide one</div>
        <div style={{ height: '60px' }}>Slide two</div>
        <div style={{ height: '70px' }}>Slide three</div>
      </Carousel>
    ))
    const root = result.container.firstElementChild as HTMLElement
    const viewport = result.container.querySelector('.ads-carousel-viewport') as HTMLElement
    const firstSlide = result.container.querySelector('.ads-carousel-slide') as HTMLElement

    expect(root.className).toContain('ads-carousel-rtl')
    expect(root.className).toContain('ads-carousel-vertical')
    expect(firstSlide.style.flexBasis).toBe('50%')

    fireEvent.click(result.getByRole('button', { name: 'prev' }))
    expect(activeSlide(result.container)).toHaveTextContent('Slide three')
    expect(viewport.style.height).toBe('70px')
  })

  it('applies responsive settings from matching breakpoints', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('max-width: 800px'),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    const result = render(() => (
      <Carousel slidesToShow={3} responsive={[{ breakpoint: 800, settings: { slidesToShow: 1 } }]}>
        {slides()}
      </Carousel>
    ))
    const firstSlide = result.container.querySelector('.ads-carousel-slide') as HTMLElement

    expect(firstSlide.style.flexBasis).toBe('100%')

    vi.unstubAllGlobals()
  })
})
