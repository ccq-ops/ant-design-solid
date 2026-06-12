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

  it('supports orientation and vertical direction props', () => {
    const result = render(() => (
      <>
        <Splitter vertical data-testid="vertical">
          <Splitter.Panel>Top</Splitter.Panel>
          <Splitter.Panel>Bottom</Splitter.Panel>
        </Splitter>
        <Splitter vertical orientation="horizontal" data-testid="horizontal">
          <Splitter.Panel>Left</Splitter.Panel>
          <Splitter.Panel>Right</Splitter.Panel>
        </Splitter>
      </>
    ))

    expect(result.getByTestId('vertical').className).toContain('ads-splitter-vertical')
    expect(result.getByTestId('horizontal').className).toContain('ads-splitter-horizontal')
  })

  it('supports semantic classNames and styles', () => {
    const result = render(() => (
      <Splitter
        data-testid="splitter"
        classNames={{
          root: 'custom-root',
          panel: 'custom-panel',
          dragger: { default: 'custom-dragger', active: 'custom-dragger-active' },
        }}
        styles={{
          root: { '--splitter-root': '1' },
          panel: { '--splitter-panel': '1' },
          dragger: {
            default: { '--splitter-dragger': '1' },
            active: { '--splitter-dragger-active': '1' },
          },
        }}
      >
        <Splitter.Panel>Left</Splitter.Panel>
        <Splitter.Panel>Right</Splitter.Panel>
      </Splitter>
    ))

    const splitter = result.getByTestId('splitter')
    const panel = splitter.querySelector('.ads-splitter-panel') as HTMLElement
    const dragger = result.getByRole('separator') as HTMLElement
    expect(splitter.className).toContain('custom-root')
    expect(splitter.style.getPropertyValue('--splitter-root')).toBe('1')
    expect(panel.className).toContain('custom-panel')
    expect(panel.style.getPropertyValue('--splitter-panel')).toBe('1')
    expect(dragger.className).toContain('custom-dragger')
    expect(dragger.style.getPropertyValue('--splitter-dragger')).toBe('1')

    dragger.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, bubbles: true }))
    expect(dragger.className).toContain('custom-dragger-active')
    expect(dragger.style.getPropertyValue('--splitter-dragger-active')).toBe('1')
    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 100, bubbles: true }))
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

  it('defers panel size updates while dragging in lazy mode', () => {
    const onResize = vi.fn()
    const result = render(() => (
      <Splitter data-testid="splitter" lazy onResize={onResize}>
        <Splitter.Panel defaultSize={100}>Left</Splitter.Panel>
        <Splitter.Panel defaultSize={100}>Right</Splitter.Panel>
      </Splitter>
    ))

    const bar = result.getByRole('separator')
    bar.dispatchEvent(new PointerEvent('pointerdown', { clientX: 100, bubbles: true }))
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: 140, bubbles: true }))

    const panels = result.getByTestId('splitter').querySelectorAll('.ads-splitter-panel')
    expect((panels[0] as HTMLElement).style.flexBasis).toBe('100px')
    expect((panels[1] as HTMLElement).style.flexBasis).toBe('100px')
    expect(onResize).not.toHaveBeenCalled()

    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 140, bubbles: true }))
    expect((panels[0] as HTMLElement).style.flexBasis).toBe('140px')
    expect((panels[1] as HTMLElement).style.flexBasis).toBe('60px')
    expect(onResize).toHaveBeenCalledWith([140, 60])
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

  it('supports dragger icons and double click callbacks', () => {
    const onDraggerDoubleClick = vi.fn()
    const result = render(() => (
      <Splitter
        draggerIcon={<span data-testid="icon">||</span>}
        onDraggerDoubleClick={onDraggerDoubleClick}
      >
        <Splitter.Panel>Left</Splitter.Panel>
        <Splitter.Panel>Right</Splitter.Panel>
      </Splitter>
    ))

    const bar = result.getByRole('separator')
    expect(result.getByTestId('icon')).toHaveTextContent('||')
    fireEvent.dblClick(bar)
    expect(onDraggerDoubleClick).toHaveBeenCalledWith(0)
  })

  it('collapses and restores panels from collapsible icons', () => {
    const onCollapse = vi.fn()
    const result = render(() => (
      <Splitter
        data-testid="splitter"
        collapsible={{ icon: { start: <span>start</span>, end: <span>end</span> } }}
        onCollapse={onCollapse}
      >
        <Splitter.Panel defaultSize={100} collapsible={{ end: true }}>
          Left
        </Splitter.Panel>
        <Splitter.Panel defaultSize={100} collapsible={{ start: true }}>
          Right
        </Splitter.Panel>
      </Splitter>
    ))

    const collapsePrevious = result.getByRole('button', { name: 'Collapse previous panel' })
    fireEvent.click(collapsePrevious)

    const panels = result.getByTestId('splitter').querySelectorAll('.ads-splitter-panel')
    expect((panels[0] as HTMLElement).style.flexBasis).toBe('0px')
    expect((panels[1] as HTMLElement).style.flexBasis).toBe('200px')
    expect(onCollapse).toHaveBeenCalledWith([true, false], [0, 200])

    const restorePrevious = result.getByRole('button', { name: 'Expand previous panel' })
    fireEvent.click(restorePrevious)
    expect((panels[0] as HTMLElement).style.flexBasis).toBe('100px')
    expect((panels[1] as HTMLElement).style.flexBasis).toBe('100px')
    expect(onCollapse).toHaveBeenLastCalledWith([false, false], [100, 100])
  })

  it('destroys hidden panel content when requested', () => {
    const result = render(() => (
      <Splitter destroyOnHidden>
        <Splitter.Panel size={0}>
          <span data-testid="hidden-content">Hidden</span>
        </Splitter.Panel>
        <Splitter.Panel>Visible</Splitter.Panel>
      </Splitter>
    ))

    expect(result.queryByTestId('hidden-content')).toBeNull()
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
