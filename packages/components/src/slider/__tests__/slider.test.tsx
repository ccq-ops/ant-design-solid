import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Slider } from '../index'
import type { SliderValue } from '../interface'

function mockRect(element: Element, rect: Partial<DOMRect>) {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 100,
    bottom: 20,
    width: 100,
    height: 20,
    toJSON: () => ({}),
    ...rect,
  } as DOMRect)
}

describe('Slider', () => {
  it('changes uncontrolled single value from rail clicks and snaps to step', () => {
    const onChange = vi.fn()
    const result = render(() => <Slider defaultValue={10} step={5} onChange={onChange} />)
    const rail = result.container.querySelector('.ads-slider-rail')!
    mockRect(rail, { left: 0, right: 100, width: 100 })

    fireEvent.pointerDown(rail, { clientX: 63, pointerId: 1 })

    expect(onChange).toHaveBeenLastCalledWith(65)
    fireEvent.pointerUp(document, { clientX: 63, pointerId: 1 })

    expect(result.getByRole('slider')).toHaveAttribute('aria-valuenow', '65')
  })

  it('changes value when clicking the rendered track area', () => {
    const onChange = vi.fn()
    const result = render(() => <Slider defaultValue={30} onChange={onChange} />)
    const rail = result.container.querySelector('.ads-slider-rail')!
    const track = result.container.querySelector('.ads-slider-track')!
    mockRect(rail, { left: 0, right: 100, width: 100 })

    fireEvent.pointerDown(track, { clientX: 70, pointerId: 11 })
    fireEvent.pointerUp(document, { clientX: 70, pointerId: 11 })

    expect(onChange).toHaveBeenLastCalledWith(70)
    expect(result.getByRole('slider')).toHaveAttribute('aria-valuenow', '70')
  })

  it('changes value when clicking an uncovered root area', () => {
    const onChange = vi.fn()
    const result = render(() => <Slider defaultValue={30} onChange={onChange} />)
    const root = result.container.querySelector('.ads-slider')!
    const rail = result.container.querySelector('.ads-slider-rail')!
    mockRect(rail, { left: 0, right: 100, width: 100 })

    fireEvent.pointerDown(root, { clientX: 80, pointerId: 12 })
    fireEvent.pointerUp(document, { clientX: 80, pointerId: 12 })

    expect(onChange).toHaveBeenLastCalledWith(80)
    expect(result.getByRole('slider')).toHaveAttribute('aria-valuenow', '80')
  })

  it('supports controlled single value', () => {
    const [value, setValue] = createSignal(20)
    const onChange = vi.fn((next: SliderValue) => {
      if (typeof next === 'number') setValue(next)
    })
    const result = render(() => <Slider value={value()} onChange={onChange} />)
    const rail = result.container.querySelector('.ads-slider-rail')!
    mockRect(rail, { left: 0, right: 200, width: 200 })

    fireEvent.pointerDown(rail, { clientX: 150, pointerId: 2 })

    expect(onChange).toHaveBeenLastCalledWith(75)
    fireEvent.pointerUp(document, { clientX: 150, pointerId: 2 })

    expect(result.getByRole('slider')).toHaveAttribute('aria-valuenow', '75')
  })

  it('updates the nearest range handle from rail clicks', () => {
    const onChange = vi.fn()
    const result = render(() => <Slider range defaultValue={[20, 80]} onChange={onChange} />)
    const rail = result.container.querySelector('.ads-slider-rail')!
    mockRect(rail, { left: 0, right: 100, width: 100 })

    fireEvent.pointerDown(rail, { clientX: 70, pointerId: 3 })

    expect(onChange).toHaveBeenLastCalledWith([20, 70])
    fireEvent.pointerUp(document, { clientX: 70, pointerId: 3 })

    expect(result.getByRole('slider', { name: 'Maximum value' })).toHaveAttribute(
      'aria-valuenow',
      '70',
    )
  })

  it('does not change when disabled', () => {
    const onChange = vi.fn()
    const result = render(() => <Slider disabled defaultValue={30} onChange={onChange} />)
    const slider = result.getByRole('slider')
    const rail = result.container.querySelector('.ads-slider-rail')!
    mockRect(rail, { left: 0, right: 100, width: 100 })

    fireEvent.pointerDown(rail, { clientX: 90, pointerId: 4 })
    fireEvent.keyDown(slider, { key: 'ArrowRight' })

    expect(onChange).not.toHaveBeenCalled()
    expect(slider).toHaveAttribute('aria-valuenow', '30')
  })

  it('supports keyboard changes and commits after change', () => {
    const onChange = vi.fn()
    const onAfterChange = vi.fn()
    const result = render(() => (
      <Slider defaultValue={50} step={10} onChange={onChange} onAfterChange={onAfterChange} />
    ))
    let slider = result.getByRole('slider')

    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenLastCalledWith(60)
    expect(onAfterChange).toHaveBeenLastCalledWith(60)

    slider = result.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'PageDown' })
    expect(onChange).toHaveBeenLastCalledWith(0)
    expect(onAfterChange).toHaveBeenLastCalledWith(0)

    slider = result.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'End' })
    expect(onChange).toHaveBeenLastCalledWith(100)
    expect(onAfterChange).toHaveBeenLastCalledWith(100)

    slider = result.getByRole('slider')
    fireEvent.keyDown(slider, { key: 'Home' })
    expect(onChange).toHaveBeenLastCalledWith(0)
    expect(onAfterChange).toHaveBeenLastCalledWith(0)
  })

  it('supports all keyboard increment and decrement keys', () => {
    const onChange = vi.fn()
    const onAfterChange = vi.fn()
    const result = render(() => (
      <Slider defaultValue={50} step={5} onChange={onChange} onAfterChange={onAfterChange} />
    ))

    fireEvent.keyDown(result.getByRole('slider'), { key: 'ArrowLeft' })
    expect(onChange).toHaveBeenLastCalledWith(45)
    expect(onAfterChange).toHaveBeenLastCalledWith(45)

    fireEvent.keyDown(result.getByRole('slider'), { key: 'ArrowUp' })
    expect(onChange).toHaveBeenLastCalledWith(50)
    expect(onAfterChange).toHaveBeenLastCalledWith(50)

    fireEvent.keyDown(result.getByRole('slider'), { key: 'ArrowDown' })
    expect(onChange).toHaveBeenLastCalledWith(45)
    expect(onAfterChange).toHaveBeenLastCalledWith(45)

    fireEvent.keyDown(result.getByRole('slider'), { key: 'PageUp' })
    expect(onChange).toHaveBeenLastCalledWith(95)
    expect(onAfterChange).toHaveBeenLastCalledWith(95)
  })

  it('uses custom aria min and max attributes', () => {
    const result = render(() => <Slider min={10} max={50} defaultValue={30} />)
    const slider = result.getByRole('slider')

    expect(slider).toHaveAttribute('aria-valuemin', '10')
    expect(slider).toHaveAttribute('aria-valuemax', '50')
    expect(slider).toHaveAttribute('aria-valuenow', '30')
  })

  it('renders single mode with one handle and track from min to value', () => {
    const result = render(() => <Slider defaultValue={25} />)
    const handles = result.getAllByRole('slider')
    const track = result.container.querySelector('.ads-slider-track') as HTMLElement

    expect(handles).toHaveLength(1)
    expect(track.style.left).toBe('0%')
    expect(track.style.width).toBe('25%')
    expect(handles[0]).toHaveStyle('left: 25%')
  })

  it('renders range mode with two handles and track between values', () => {
    const result = render(() => <Slider range defaultValue={[20, 70]} />)
    const handles = result.getAllByRole('slider')
    const track = result.container.querySelector('.ads-slider-track') as HTMLElement

    expect(handles).toHaveLength(2)
    expect(result.getByRole('slider', { name: 'Minimum value' })).toHaveStyle('left: 20%')
    expect(result.getByRole('slider', { name: 'Maximum value' })).toHaveStyle('left: 70%')
    expect(track.style.left).toBe('20%')
    expect(track.style.width).toBe('50%')
  })

  it('clamps values to custom min and max before rendering', () => {
    const single = render(() => <Slider min={10} max={20} defaultValue={100} />)
    expect(single.getByRole('slider')).toHaveAttribute('aria-valuenow', '20')

    const range = render(() => <Slider range min={10} max={20} defaultValue={[5, 25]} />)
    expect(range.getByRole('slider', { name: 'Minimum value' })).toHaveAttribute(
      'aria-valuenow',
      '10',
    )
    expect(range.getByRole('slider', { name: 'Maximum value' })).toHaveAttribute(
      'aria-valuenow',
      '20',
    )
  })

  it('renders marks with labels and custom style', () => {
    const result = render(() => (
      <Slider
        marks={{
          0: 'A',
          50: { label: 'Middle', style: { color: 'red' } },
          100: 'Z',
        }}
      />
    ))

    expect(result.getByText('A')).toBeInTheDocument()
    expect(result.getByText('Middle')).toHaveStyle('color: rgb(255, 0, 0)')
    expect(result.getByText('Z')).toBeInTheDocument()
    expect(result.container.querySelectorAll('.ads-slider-mark-text')).toHaveLength(3)
  })

  it('drags handles continuously and calls onAfterChange on pointer release', () => {
    const onChange = vi.fn()
    const onAfterChange = vi.fn()
    const result = render(() => (
      <Slider defaultValue={10} onChange={onChange} onAfterChange={onAfterChange} />
    ))
    const handle = result.getByRole('slider') as HTMLElement
    const rail = result.container.querySelector('.ads-slider-rail')!
    mockRect(rail, { left: 0, right: 100, width: 100 })

    fireEvent.pointerDown(handle, { clientX: 10, pointerId: 5 })
    fireEvent.pointerMove(document, { clientX: 40, pointerId: 5 })
    fireEvent.pointerMove(document, { clientX: 75, pointerId: 5 })
    fireEvent.pointerUp(document, { clientX: 75, pointerId: 5 })

    expect(onChange).toHaveBeenCalledWith(40)
    expect(onChange).toHaveBeenLastCalledWith(75)
    expect(onAfterChange).toHaveBeenLastCalledWith(75)
  })

  it('supports vertical orientation', () => {
    const result = render(() => <Slider vertical defaultValue={25} />)
    const slider = result.getByRole('slider')
    const rail = result.container.querySelector('.ads-slider-rail')!
    mockRect(rail, { top: 0, bottom: 200, height: 200 })

    fireEvent.pointerDown(rail, { clientY: 50, pointerId: 6 })

    expect(slider).toHaveAttribute('aria-orientation', 'vertical')
    fireEvent.pointerUp(document, { clientY: 50, pointerId: 6 })

    expect(result.getByRole('slider')).toHaveAttribute('aria-valuenow', '75')
  })

  it('shows tooltip when tooltipVisible is true', () => {
    const result = render(() => <Slider defaultValue={42} tooltipVisible />)

    expect(result.getByText('42')).toHaveClass('ads-slider-tooltip')
  })

  it('supports onChangeComplete, keyboard toggle, orientation priority, and reverse', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    const result = render(() => (
      <Slider
        defaultValue={20}
        keyboard={false}
        vertical
        orientation="horizontal"
        reverse
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    ))
    const slider = result.getByRole('slider')
    const rail = result.container.querySelector('.ads-slider-rail')!
    mockRect(rail, { left: 0, right: 100, width: 100 })

    expect(slider).toHaveAttribute('aria-orientation', 'horizontal')
    fireEvent.keyDown(slider, { key: 'ArrowRight' })
    expect(onChange).not.toHaveBeenCalled()

    fireEvent.pointerDown(rail, { clientX: 25, pointerId: 7 })
    fireEvent.pointerUp(document, { clientX: 25, pointerId: 7 })

    expect(onChange).toHaveBeenLastCalledWith(75)
    expect(onChangeComplete).toHaveBeenLastCalledWith(75)
  })

  it('supports step null, dots, included false, semantic classNames, and styles', () => {
    const result = render(() => (
      <Slider
        defaultValue={33}
        step={null}
        dots
        included={false}
        marks={{ 0: '0', 25: '25', 75: '75', 100: '100' }}
        classNames={{
          root: 'semantic-root',
          rail: 'semantic-rail',
          track: 'semantic-track',
          handle: 'semantic-handle',
          step: 'semantic-step',
          dot: 'semantic-dot',
          mark: 'semantic-mark',
          markText: 'semantic-mark-text',
        }}
        styles={{ root: { margin: '9px' }, track: { background: 'red' } }}
      />
    ))
    const rail = result.container.querySelector('.ads-slider-rail')!
    mockRect(rail, { left: 0, right: 100, width: 100 })

    expect(result.container.firstElementChild).toHaveClass('semantic-root')
    expect(result.container.firstElementChild).toHaveStyle('margin: 9px')
    expect(rail).toHaveClass('semantic-rail')
    expect(result.container.querySelector('.ads-slider-track')).toHaveStyle('width: 0%')
    expect(result.container.querySelector('.ads-slider-track')).toHaveClass('semantic-track')
    expect(result.getByRole('slider')).toHaveAttribute('aria-valuenow', '25')
    expect(result.getByRole('slider')).toHaveClass('semantic-handle')
    expect(result.container.querySelector('.ads-slider-step')).toHaveClass('semantic-step')
    expect(result.container.querySelectorAll('.semantic-dot')).toHaveLength(4)
    expect(result.getByText('25')).toHaveClass('semantic-mark-text')

    fireEvent.pointerDown(rail, { clientX: 60, pointerId: 8 })
    fireEvent.pointerUp(document, { clientX: 60, pointerId: 8 })

    expect(result.getByRole('slider')).toHaveAttribute('aria-valuenow', '75')
  })

  it('supports tooltip options', () => {
    const result = render(() => (
      <Slider
        defaultValue={30}
        tooltip={{
          open: true,
          formatter: (value) => `${value}%`,
          placement: 'bottom',
          class: 'tooltip-class',
          style: { color: 'yellow' },
        }}
      />
    ))

    expect(result.getByText('30%')).toHaveClass('ads-slider-tooltip')
    expect(result.getByText('30%')).toHaveClass('tooltip-class')
    expect(result.getByText('30%')).toHaveClass('ads-slider-tooltip-bottom')
    expect(result.getByText('30%')).toHaveStyle('color: rgb(255, 255, 0)')
  })

  it('supports range object draggable track', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Slider range={{ draggableTrack: true }} defaultValue={[20, 40]} onChange={onChange} />
    ))
    const track = result.container.querySelector('.ads-slider-track')!
    const rail = result.container.querySelector('.ads-slider-rail')!
    mockRect(rail, { left: 0, right: 100, width: 100 })

    fireEvent.pointerDown(track, { clientX: 30, pointerId: 9 })
    fireEvent.pointerMove(document, { clientX: 50, pointerId: 9 })
    fireEvent.pointerUp(document, { clientX: 50, pointerId: 9 })

    expect(onChange).toHaveBeenLastCalledWith([40, 60])
    expect(result.getByRole('slider', { name: 'Minimum value' })).toHaveAttribute(
      'aria-valuenow',
      '40',
    )
    expect(result.getByRole('slider', { name: 'Maximum value' })).toHaveAttribute(
      'aria-valuenow',
      '60',
    )
  })

  it('supports editable range nodes with minCount and maxCount', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Slider
        range={{ editable: true, minCount: 1, maxCount: 3 }}
        defaultValue={[20, 80]}
        onChange={onChange}
      />
    ))
    const rail = result.container.querySelector('.ads-slider-rail')!
    mockRect(rail, { left: 0, right: 100, width: 100 })

    fireEvent.pointerDown(rail, { clientX: 50, pointerId: 10 })
    fireEvent.pointerUp(document, { clientX: 50, pointerId: 10 })

    expect(onChange).toHaveBeenLastCalledWith([20, 50, 80])
    expect(result.getAllByRole('slider')).toHaveLength(3)

    fireEvent.dblClick(result.getByRole('slider', { name: 'Value 2' }))
    expect(onChange).toHaveBeenLastCalledWith([20, 80])

    fireEvent.dblClick(result.getByRole('slider', { name: 'Value 1' }))
    expect(onChange).toHaveBeenLastCalledWith([80])

    fireEvent.dblClick(result.getByRole('slider', { name: 'Value 1' }))
    expect(onChange).toHaveBeenLastCalledWith([80])
  })

  it('exposes imperative focus and blur methods', () => {
    const sliderRef: { current?: { focus: () => void; blur: () => void } } = {}
    const result = render(() => <Slider ref={sliderRef} defaultValue={10} />)
    const handle = result.getByRole('slider')
    const focus = vi.spyOn(handle, 'focus')
    const blur = vi.spyOn(handle, 'blur')

    sliderRef.current?.focus()
    expect(focus).toHaveBeenCalledOnce()

    sliderRef.current?.blur()
    expect(blur).toHaveBeenCalledOnce()
  })
})
