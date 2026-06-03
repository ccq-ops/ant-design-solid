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

    fireEvent.click(result.getByRole('button', { name: 'Previous slide' }))
    expect(activeSlide(result.container)).toHaveTextContent('Slide three')

    fireEvent.click(result.getByRole('button', { name: 'Next slide' }))
    expect(activeSlide(result.container)).toHaveTextContent('Slide one')
  })

  it('clamps navigation and disables edge arrows when infinite is false', () => {
    const result = render(() => (
      <Carousel arrows infinite={false}>
        {slides()}
      </Carousel>
    ))
    const previous = result.getByRole('button', { name: 'Previous slide' })
    const next = result.getByRole('button', { name: 'Next slide' })

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
          dots={{ className: 'extra-dots' }}
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
    expect(root.className).toContain('custom-carousel-dot-left')
    expect(root.className).toContain('extra-carousel')
    expect(root).toHaveStyle('width: 240px')
    expect(result.container.querySelector('.extra-dots')).toBeInTheDocument()
    expect(result.queryByRole('button', { name: 'Next slide' })).not.toBeInTheDocument()
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
})
