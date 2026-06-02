import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Slider } from '../index'

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
    const slider = result.getByRole('slider')
    const rail = result.container.querySelector('.ads-slider-rail')!
    mockRect(rail, { left: 0, right: 100, width: 100 })

    fireEvent.pointerDown(rail, { clientX: 63, pointerId: 1 })

    expect(onChange).toHaveBeenLastCalledWith(65)
    fireEvent.pointerUp(document, { clientX: 63, pointerId: 1 })

    expect(result.getByRole('slider')).toHaveAttribute('aria-valuenow', '65')
  })

  it('supports controlled single value', () => {
    const [value, setValue] = createSignal(20)
    const onChange = vi.fn((next: number | [number, number]) => {
      if (typeof next === 'number') setValue(next)
    })
    const result = render(() => <Slider value={value()} onChange={onChange} />)
    const slider = result.getByRole('slider')
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
})
