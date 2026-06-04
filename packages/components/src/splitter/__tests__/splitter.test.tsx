import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Splitter } from '../index'

describe('Splitter', () => {
  it('renders panels with default horizontal layout', () => {
    const result = render(() => (
      <Splitter data-testid="splitter">
        <Splitter.Panel>Left</Splitter.Panel>
        <Splitter.Panel>Right</Splitter.Panel>
      </Splitter>
    ))

    const splitter = result.getByTestId('splitter')
    expect(splitter.className).toContain('ads-splitter')
    expect(splitter.className).toContain('ads-splitter-horizontal')
    expect(splitter).toHaveTextContent('Left')
    expect(splitter).toHaveTextContent('Right')
    expect(result.getAllByRole('separator')).toHaveLength(1)
  })

  it('supports vertical layout and default panel sizes', () => {
    const result = render(() => (
      <Splitter layout="vertical" data-testid="splitter">
        <Splitter.Panel defaultSize="30%">Top</Splitter.Panel>
        <Splitter.Panel defaultSize={120}>Bottom</Splitter.Panel>
      </Splitter>
    ))

    const splitter = result.getByTestId('splitter')
    const panels = splitter.querySelectorAll('.ads-splitter-panel')
    expect(splitter.className).toContain('ads-splitter-vertical')
    expect(panels[0]).toHaveStyle({ flexBasis: '30%' })
    expect(panels[1]).toHaveStyle({ flexBasis: '120px' })
  })

  it('resizes adjacent panels by dragging a horizontal splitter bar', () => {
    const onResizeStart = vi.fn()
    const onResize = vi.fn()
    const onResizeEnd = vi.fn()
    const result = render(() => (
      <Splitter
        data-testid="splitter"
        onResizeStart={onResizeStart}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
      >
        <Splitter.Panel defaultSize={100} min={80} max={160}>
          Left
        </Splitter.Panel>
        <Splitter.Panel defaultSize={100} min={60}>
          Right
        </Splitter.Panel>
      </Splitter>
    ))

    const bar = result.getByRole('separator')
    bar.dispatchEvent(
      new PointerEvent('pointerdown', { clientX: 100, clientY: 0, pointerId: 1, bubbles: true }),
    )
    document.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 140, clientY: 0, pointerId: 1, bubbles: true }),
    )
    document.dispatchEvent(
      new PointerEvent('pointerup', { clientX: 140, clientY: 0, pointerId: 1, bubbles: true }),
    )

    const panels = result.getByTestId('splitter').querySelectorAll('.ads-splitter-panel')
    expect((panels[0] as HTMLElement).style.flexBasis).toBe('140px')
    expect((panels[1] as HTMLElement).style.flexBasis).toBe('60px')
    expect(onResizeStart).toHaveBeenCalledWith([100, 100])
    expect(onResize).toHaveBeenCalledWith([140, 60])
    expect(onResizeEnd).toHaveBeenCalledWith([140, 60])
  })

  it('clamps dragging by panel min and max constraints', () => {
    const result = render(() => (
      <Splitter data-testid="splitter">
        <Splitter.Panel defaultSize={100} min={80} max={130}>
          Left
        </Splitter.Panel>
        <Splitter.Panel defaultSize={100} min={90} max={150}>
          Right
        </Splitter.Panel>
      </Splitter>
    ))

    const bar = result.getByRole('separator')
    bar.dispatchEvent(
      new PointerEvent('pointerdown', { clientX: 100, pointerId: 1, bubbles: true }),
    )
    document.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 160, pointerId: 1, bubbles: true }),
    )
    document.dispatchEvent(
      new PointerEvent('pointerup', { clientX: 160, pointerId: 1, bubbles: true }),
    )

    const panels = result.getByTestId('splitter').querySelectorAll('.ads-splitter-panel')
    expect((panels[0] as HTMLElement).style.flexBasis).toBe('110px')
    expect((panels[1] as HTMLElement).style.flexBasis).toBe('90px')
  })

  it('does not render a draggable bar when a neighbor panel is not resizable', () => {
    const result = render(() => (
      <Splitter>
        <Splitter.Panel resizable={false}>Left</Splitter.Panel>
        <Splitter.Panel>Right</Splitter.Panel>
      </Splitter>
    ))

    expect(result.queryAllByRole('separator')).toHaveLength(0)
  })

  it('supports controlled panel sizes', () => {
    const [size, setSize] = createSignal<number | string>(100)
    const result = render(() => (
      <>
        <button type="button" onClick={() => setSize(180)}>
          grow
        </button>
        <Splitter data-testid="splitter">
          <Splitter.Panel size={size()}>Left</Splitter.Panel>
          <Splitter.Panel>Right</Splitter.Panel>
        </Splitter>
      </>
    ))

    const firstPanel = () => result.getByTestId('splitter').querySelector('.ads-splitter-panel')
    expect(firstPanel()).toHaveStyle({ flexBasis: '100px' })
    fireEvent.click(result.getByRole('button', { name: 'grow' }))
    expect(firstPanel()).toHaveStyle({ flexBasis: '180px' })
  })

  it('uses ConfigProvider prefix', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Splitter data-testid="splitter">
          <Splitter.Panel>Left</Splitter.Panel>
          <Splitter.Panel>Right</Splitter.Panel>
        </Splitter>
      </ConfigProvider>
    ))

    expect(result.getByTestId('splitter').className).toContain('custom-splitter')
  })
})
