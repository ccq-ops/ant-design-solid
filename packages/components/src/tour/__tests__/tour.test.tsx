import { cleanup, fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Tour } from '../index'

describe('Tour', () => {
  beforeEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
  })

  it('renders the current step with progress and default actions', () => {
    render(() => (
      <Tour
        defaultOpen
        steps={[
          { title: 'First', description: 'Intro' },
          { title: 'Second', description: 'Details' },
        ]}
      />
    ))

    const dialog = document.body.querySelector('.ads-tour')!
    expect(dialog).toHaveAttribute('role', 'dialog')
    expect(dialog).toHaveTextContent('First')
    expect(dialog).toHaveTextContent('Intro')
    expect(dialog).toHaveTextContent('1 / 2')
    expect(dialog).toHaveTextContent('Next')
    expect(dialog).not.toHaveTextContent('Previous')
  })

  it('moves between steps and finishes on the last step', () => {
    const onChange = vi.fn()
    const onFinish = vi.fn()
    const onClose = vi.fn()
    render(() => (
      <Tour
        defaultOpen
        onChange={onChange}
        onFinish={onFinish}
        onClose={onClose}
        steps={[{ title: 'First' }, { title: 'Second' }]}
      />
    ))

    fireEvent.click(document.body.querySelector<HTMLButtonElement>('.ads-tour-next-btn')!)
    expect(onChange).toHaveBeenCalledWith(1)
    expect(document.body.querySelector('.ads-tour')).toHaveTextContent('Second')
    expect(document.body.querySelector('.ads-tour')).toHaveTextContent('Finish')

    fireEvent.click(document.body.querySelector<HTMLButtonElement>('.ads-tour-finish-btn')!)
    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledWith(1)
    expect(document.body.querySelector('.ads-tour')).toBeFalsy()
  })

  it('supports controlled current and open state', () => {
    const [open, setOpen] = createSignal(true)
    const [current, setCurrent] = createSignal(0)
    render(() => (
      <Tour
        open={open()}
        current={current()}
        onClose={() => setOpen(false)}
        onChange={setCurrent}
        steps={[{ title: 'First' }, { title: 'Second' }]}
      />
    ))

    fireEvent.click(document.body.querySelector<HTMLButtonElement>('.ads-tour-next-btn')!)
    expect(current()).toBe(1)
    expect(document.body.querySelector('.ads-tour')).toHaveTextContent('Second')

    fireEvent.click(document.body.querySelector<HTMLButtonElement>('.ads-tour-close')!)
    expect(open()).toBe(false)
    expect(document.body.querySelector('.ads-tour')).toBeFalsy()
  })

  it('positions around target and renders mask highlight', () => {
    let target: HTMLButtonElement | undefined
    render(() => (
      <>
        <button
          id="target"
          ref={(element) => {
            target = element
          }}
        >
          Target
        </button>
        <Tour
          defaultOpen
          steps={[
            {
              title: 'Targeted',
              target: () => target,
              placement: 'bottom',
            },
          ]}
        />
      </>
    ))
    if (!target) throw new Error('target should render')
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      x: 10,
      y: 20,
      top: 20,
      left: 10,
      right: 110,
      bottom: 60,
      width: 100,
      height: 40,
      toJSON: () => ({}),
    })

    window.dispatchEvent(new Event('resize'))

    const tour = document.body.querySelector<HTMLElement>('.ads-tour')!
    expect(tour).toHaveClass('ads-tour-bottom')
    expect(tour.style.top).toBe('72px')
    expect(tour.style.left).toBe('60px')
    expect(document.body.querySelector<HTMLElement>('.ads-tour-mask-target')!.style.top).toBe(
      '12px',
    )
  })

  it('closes on escape and applies custom prefix', () => {
    const onClose = vi.fn()
    render(() => (
      <ConfigProvider prefixCls="custom">
        <Tour defaultOpen onClose={onClose} steps={[{ title: 'Custom' }]} />
      </ConfigProvider>
    ))

    expect(document.body.querySelector('.custom-tour')).toHaveTextContent('Custom')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledWith(0)
    expect(document.body.querySelector('.custom-tour')).toBeFalsy()
  })

  it('uses shared zIndex and custom popup container', () => {
    const popupContainer = document.createElement('div')
    document.body.appendChild(popupContainer)

    render(() => (
      <Tour
        defaultOpen
        zIndex={1410}
        getPopupContainer={() => popupContainer}
        steps={[{ title: 'Portaled tour' }]}
      />
    ))

    const root = popupContainer.querySelector<HTMLElement>('.ads-tour-root')!
    expect(root).toBeTruthy()
    expect(document.body.firstElementChild).not.toBe(root)
    expect(root.style.zIndex).toBe('1410')
  })

  it('supports cover, type, custom actions, semantic classes and styles', () => {
    render(() => (
      <Tour
        defaultOpen
        type="primary"
        classNames={{ root: 'custom-root', section: 'custom-section', title: 'custom-title' }}
        styles={{ section: { width: '360px' }, title: { color: 'rgb(255, 255, 0)' } }}
        actionsRender={(originNode, info) => (
          <div class="custom-actions">
            {originNode}
            <span>{`${info.current + 1}/${info.total}`}</span>
          </div>
        )}
        steps={[
          {
            title: 'Styled',
            cover: <div class="custom-cover">Cover content</div>,
          },
        ]}
      />
    ))

    const dialog = document.body.querySelector<HTMLElement>('.ads-tour')!
    expect(dialog).toHaveClass('ads-tour-primary')
    expect(dialog).toHaveClass('custom-root')
    expect(dialog.querySelector('.custom-section')).toBeTruthy()
    expect(dialog.querySelector<HTMLElement>('.custom-section')!.style.width).toBe('360px')
    expect(dialog.querySelector('.custom-title')).toHaveTextContent('Styled')
    expect(dialog.querySelector<HTMLElement>('.custom-title')!.style.color).toBe('rgb(255, 255, 0)')
    expect(dialog.querySelector('.custom-cover')).toHaveTextContent('Cover content')
    expect(dialog.querySelector('.custom-actions')).toHaveTextContent('1/1')
  })

  it('supports object mask, object gap and disabled target interaction', () => {
    let target: HTMLButtonElement | undefined
    render(() => (
      <>
        <button ref={(element) => (target = element)}>Target</button>
        <Tour
          defaultOpen
          disabledInteraction
          mask={{ color: 'rgba(255, 0, 0, 0.2)', style: { opacity: 0.8 } }}
          gap={{ offset: [10, 4], radius: 12 }}
          steps={[{ title: 'Masked', target: () => target }]}
        />
      </>
    ))
    if (!target) throw new Error('target should render')
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
      x: 20,
      y: 30,
      top: 30,
      left: 20,
      right: 120,
      bottom: 70,
      width: 100,
      height: 40,
      toJSON: () => ({}),
    })

    window.dispatchEvent(new Event('resize'))

    const maskTarget = document.body.querySelector<HTMLElement>('.ads-tour-mask-target')!
    expect(maskTarget.style.top).toBe('26px')
    expect(maskTarget.style.left).toBe('10px')
    expect(maskTarget.style.width).toBe('120px')
    expect(maskTarget.style.height).toBe('48px')
    expect(maskTarget.style.borderRadius).toBe('12px')
    expect(maskTarget.style.pointerEvents).toBe('auto')
    expect(maskTarget.style.boxShadow).toContain('rgba(255, 0, 0, 0.2)')
    expect(maskTarget.style.opacity).toBe('0.8')
  })

  it('respects keyboard false and scrolls targets into view', () => {
    const onClose = vi.fn()
    let target: HTMLButtonElement | undefined
    render(() => (
      <>
        <button ref={(element) => (target = element)}>Target</button>
        <Tour
          defaultOpen
          keyboard={false}
          onClose={onClose}
          scrollIntoViewOptions={{ block: 'center' }}
          steps={[{ title: 'Targeted', target: () => target }]}
        />
      </>
    ))
    if (!target) throw new Error('target should render')
    const scrollIntoView = vi.fn()
    target.scrollIntoView = scrollIntoView

    window.dispatchEvent(new Event('resize'))
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onClose).not.toHaveBeenCalled()
    expect(document.body.querySelector('.ads-tour')).toBeTruthy()
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'center' })
  })

  it('supports step level close icon, close callback, type, class and style overrides', () => {
    const onStepClose = vi.fn()
    render(() => (
      <Tour
        defaultOpen
        type="primary"
        closeIcon="Global"
        steps={[
          {
            title: 'Step custom',
            closeIcon: 'Step close',
            onClose: onStepClose,
            type: 'default',
            class: 'step-root',
            style: { width: '280px' },
            classNames: { description: 'step-description' },
            styles: { description: { color: 'rgb(1, 2, 3)' } },
            description: 'Step description',
          },
        ]}
      />
    ))

    const dialog = document.body.querySelector<HTMLElement>('.ads-tour')!
    expect(dialog).not.toHaveClass('ads-tour-primary')
    expect(dialog).toHaveClass('step-root')
    expect(dialog.style.width).toBe('280px')
    expect(dialog.querySelector('.ads-tour-close')).toHaveTextContent('Step close')
    expect(dialog.querySelector('.step-description')).toHaveTextContent('Step description')
    expect(dialog.querySelector<HTMLElement>('.step-description')!.style.color).toBe('rgb(1, 2, 3)')

    fireEvent.click(document.body.querySelector<HTMLButtonElement>('.ads-tour-close')!)
    expect(onStepClose).toHaveBeenCalledTimes(1)
  })

  it('renders footer actions with shared Button props', () => {
    render(() => (
      <Tour
        defaultOpen
        defaultCurrent={1}
        steps={[
          { title: 'First' },
          {
            title: 'Second',
            prevButtonProps: { danger: true, children: 'Back' },
            nextButtonProps: { loading: true, children: 'Working' },
          },
        ]}
      />
    ))

    const prevButton = document.body.querySelector<HTMLButtonElement>('.ads-tour-prev-btn')!
    const nextButton = document.body.querySelector<HTMLButtonElement>('.ads-tour-finish-btn')!
    expect(prevButton).toHaveClass('ads-btn')
    expect(prevButton).toHaveClass('ads-btn-dangerous')
    expect(nextButton).toHaveClass('ads-btn')
    expect(nextButton).toHaveClass('ads-btn-loading')
    expect(nextButton).toBeDisabled()
  })
})
