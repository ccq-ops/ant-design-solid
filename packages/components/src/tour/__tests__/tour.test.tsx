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
})
