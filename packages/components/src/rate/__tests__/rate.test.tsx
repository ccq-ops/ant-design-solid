import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Rate } from '../index'

describe('Rate', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('changes uncontrolled value and clears when selecting the current value', () => {
    const onChange = vi.fn()
    const result = render(() => <Rate defaultValue={2} onChange={onChange} />)
    const radios = result.getAllByRole('radio')

    expect(radios[1]).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(radios[3])

    expect(radios[3]).toHaveAttribute('aria-checked', 'true')
    expect(onChange).toHaveBeenLastCalledWith(4)

    fireEvent.click(radios[3])

    expect(radios[3]).toHaveAttribute('aria-checked', 'false')
    expect(onChange).toHaveBeenLastCalledWith(0)
  })

  it('follows controlled value without updating itself', () => {
    const [value, setValue] = createSignal(2)
    const onChange = vi.fn((next: number) => setValue(next))
    const result = render(() => <Rate value={value()} onChange={onChange} />)
    const radios = result.getAllByRole('radio')

    expect(radios[1]).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(radios[4])

    expect(onChange).toHaveBeenCalledWith(5)
    expect(radios[4]).toHaveAttribute('aria-checked', 'true')
  })

  it('does not change when disabled', () => {
    const onChange = vi.fn()
    const result = render(() => <Rate disabled defaultValue={3} onChange={onChange} />)
    const radiogroup = result.getByRole('radiogroup')
    const radios = result.getAllByRole('radio')

    fireEvent.click(radios[4])
    fireEvent.keyDown(radiogroup, { key: 'ArrowRight' })

    expect(radios[2]).toHaveAttribute('aria-checked', 'true')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('increments and decrements with arrow keys', () => {
    const onChange = vi.fn()
    const result = render(() => <Rate defaultValue={2} onChange={onChange} />)
    const radiogroup = result.getByRole('radiogroup')
    const radios = result.getAllByRole('radio')

    fireEvent.keyDown(radiogroup, { key: 'ArrowRight' })

    expect(radios[2]).toHaveAttribute('aria-checked', 'true')
    expect(onChange).toHaveBeenLastCalledWith(3)

    fireEvent.keyDown(radiogroup, { key: 'ArrowLeft' })

    expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    expect(onChange).toHaveBeenLastCalledWith(2)
  })

  it('handles keyboard events from focused rating items', () => {
    const onChange = vi.fn()
    const result = render(() => <Rate defaultValue={2} onChange={onChange} />)
    const radios = result.getAllByRole('radio')

    radios[1].focus()
    fireEvent.keyDown(radios[1], { key: 'ArrowRight' })

    expect(radios[2]).toHaveAttribute('aria-checked', 'true')
    expect(onChange).toHaveBeenLastCalledWith(3)
  })

  it('does not change from keyboard events when keyboard is false', () => {
    const onChange = vi.fn()
    const result = render(() => <Rate defaultValue={2} keyboard={false} onChange={onChange} />)
    const radiogroup = result.getByRole('radiogroup')
    const radios = result.getAllByRole('radio')

    fireEvent.keyDown(radiogroup, { key: 'ArrowRight' })

    expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('supports half selection from pointer position', () => {
    const onChange = vi.fn()
    const result = render(() => <Rate allowHalf onChange={onChange} />)
    const third = result.getAllByRole('radio')[2] as HTMLElement
    vi.spyOn(third, 'getBoundingClientRect').mockReturnValue({
      x: 100,
      y: 0,
      left: 100,
      top: 0,
      right: 120,
      bottom: 20,
      width: 20,
      height: 20,
      toJSON: () => ({}),
    } as DOMRect)

    fireEvent.click(third, { clientX: 105 })

    expect(onChange).toHaveBeenLastCalledWith(2.5)
    expect(third).toHaveAttribute('aria-checked', 'true')
    expect(third).toHaveAttribute('aria-label', '2.5 of 5')
  })

  it('does not clear the current value when allowClear is false', () => {
    const onChange = vi.fn()
    const result = render(() => <Rate defaultValue={3} allowClear={false} onChange={onChange} />)
    const third = result.getAllByRole('radio')[2]

    fireEvent.click(third)

    expect(third).toHaveAttribute('aria-checked', 'true')
    expect(onChange).toHaveBeenLastCalledWith(3)
  })

  it('supports Home and End keys', () => {
    const onChange = vi.fn()
    const result = render(() => <Rate defaultValue={2} onChange={onChange} />)
    const radiogroup = result.getByRole('radiogroup')
    const radios = result.getAllByRole('radio')

    fireEvent.keyDown(radiogroup, { key: 'End' })

    expect(radios[4]).toHaveAttribute('aria-checked', 'true')
    expect(onChange).toHaveBeenLastCalledWith(5)

    fireEvent.keyDown(radiogroup, { key: 'Home' })

    expect(radios[0]).toHaveAttribute('aria-checked', 'true')
    expect(onChange).toHaveBeenLastCalledWith(1)
  })

  it('fires hover callback with preview values and resets on leave', () => {
    const onHoverChange = vi.fn()
    const result = render(() => <Rate allowHalf onHoverChange={onHoverChange} />)
    const second = result.getAllByRole('radio')[1] as HTMLElement
    vi.spyOn(second, 'getBoundingClientRect').mockReturnValue({
      x: 50,
      y: 0,
      left: 50,
      top: 0,
      right: 70,
      bottom: 20,
      width: 20,
      height: 20,
      toJSON: () => ({}),
    } as DOMRect)

    fireEvent.pointerMove(second, { clientX: 65 })
    fireEvent.pointerLeave(result.getByRole('radiogroup'))

    expect(onHoverChange).toHaveBeenNthCalledWith(1, 2)
    expect(onHoverChange).toHaveBeenNthCalledWith(2, 0)
  })

  it('applies size classes', () => {
    const result = render(() => <Rate size="large" />)

    expect(result.getByRole('radiogroup')).toHaveClass('ads-rate-large')
  })

  it('supports tooltip props for items', () => {
    const result = render(() => (
      <Rate tooltips={['bad', { title: 'great', placement: 'bottom', open: true }]} count={2} />
    ))

    expect(result.getByTitle('bad')).toBeTruthy()
    expect(document.body.querySelector('.ads-tooltip-bottom')).toHaveTextContent('great')
  })

  it('passes rate item props to custom character render functions', () => {
    const result = render(() => (
      <Rate
        defaultValue={2}
        character={({ index, value, count }) => `${index}:${value}/${count}`}
      />
    ))

    expect(result.getAllByText('1:2/5')).toHaveLength(2)
  })

  it('supports focus and blur through ref', () => {
    const ref: {
      current?: { focus: () => void; blur: () => void; nativeElement?: HTMLDivElement }
    } = {}
    const result = render(() => <Rate ref={ref} />)
    const radiogroup = result.getByRole('radiogroup')
    const first = result.getAllByRole('radio')[0]

    ref.current?.focus()
    expect(document.activeElement).toBe(first)

    ref.current?.blur()
    expect(document.activeElement).not.toBe(first)
    expect(ref.current?.nativeElement).toBe(radiogroup)
  })
})
