import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Form } from '../../form'
import { InputNumber } from '../index'

describe('InputNumber', () => {
  it('renders default value with spinbutton semantics', () => {
    const result = render(() => <InputNumber defaultValue={3} min={1} max={10} />)
    const input = result.getByRole('spinbutton')

    expect(input).toHaveValue('3')
    expect(input).toHaveAttribute('aria-valuemin', '1')
    expect(input).toHaveAttribute('aria-valuemax', '10')
    expect(input).toHaveAttribute('aria-valuenow', '3')
  })

  it('normalizes uncontrolled input on blur', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber defaultValue={1} onChange={onChange} />)
    const input = result.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(input, { target: { value: '12' } })
    expect(input).toHaveValue('12')
    fireEvent.blur(input)

    expect(onChange).toHaveBeenLastCalledWith(12)
    expect(input).toHaveValue('12')
  })

  it('controlled mode calls onChange without mutating by itself', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber value={5} onChange={onChange} />)
    const input = result.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(input, { target: { value: '8' } })
    fireEvent.blur(input)

    expect(onChange).toHaveBeenCalledWith(8)
    expect(input).toHaveValue('5')
  })

  it('updates when controlled signal changes', () => {
    const [value, setValue] = createSignal(2)
    const result = render(() => <InputNumber value={value()} />)

    expect(result.getByRole('spinbutton')).toHaveValue('2')
    setValue(9)
    expect(result.getByRole('spinbutton')).toHaveValue('9')
  })

  it('clamps by min and max', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber min={0} max={10} onChange={onChange} />)
    const input = result.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(input, { target: { value: '99' } })
    fireEvent.blur(input)

    expect(onChange).toHaveBeenLastCalledWith(10)
    expect(input).toHaveValue('10')
  })

  it('increments and decrements by step controls', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber defaultValue={2} step={0.5} onChange={onChange} />)

    fireEvent.click(result.getByRole('button', { name: 'increase value' }))
    expect(onChange).toHaveBeenLastCalledWith(2.5)
    expect(result.getByRole('spinbutton')).toHaveValue('2.5')

    fireEvent.click(result.getByRole('button', { name: 'decrease value' }))
    expect(onChange).toHaveBeenLastCalledWith(2)
    expect(result.getByRole('spinbutton')).toHaveValue('2')
  })

  it('supports keyboard increment and decrement', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber defaultValue={1} onChange={onChange} />)
    const input = result.getByRole('spinbutton')

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(onChange).toHaveBeenLastCalledWith(2)
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(onChange).toHaveBeenLastCalledWith(1)
  })

  it('rounds with precision', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber precision={2} onChange={onChange} />)
    const input = result.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(input, { target: { value: '1.236' } })
    fireEvent.blur(input)

    expect(onChange).toHaveBeenLastCalledWith(1.24)
    expect(input).toHaveValue('1.24')
  })

  it('supports formatter and parser', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <InputNumber
        defaultValue={1000}
        formatter={(value) => (value === undefined ? '' : `$ ${value}`)}
        parser={(display) => {
          const parsed = Number(display.replace(/[$,\s]/g, ''))
          return Number.isNaN(parsed) ? undefined : parsed
        }}
        onChange={onChange}
      />
    ))
    const input = result.getByRole('spinbutton') as HTMLInputElement

    expect(input).toHaveValue('$ 1000')
    fireEvent.input(input, { target: { value: '$ 1234' } })
    fireEvent.blur(input)

    expect(onChange).toHaveBeenLastCalledWith(1234)
    expect(input).toHaveValue('$ 1234')
  })

  it('disabled state prevents interactions', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber defaultValue={4} disabled onChange={onChange} />)
    const input = result.getByRole('spinbutton')

    expect(input).toBeDisabled()
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    fireEvent.click(result.getByRole('button', { name: 'increase value' }))
    expect(onChange).not.toHaveBeenCalled()
    expect(input).toHaveValue('4')
  })

  it('supports size, status, hidden controls, and custom prefix classes', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <InputNumber size="large" status="error" controls={false} class="extra-input-number" />
      </ConfigProvider>
    ))
    const root = result.container.firstElementChild as HTMLElement

    expect(root.className).toContain('custom-input-number')
    expect(root.className).toContain('custom-input-number-lg')
    expect(root.className).toContain('custom-input-number-status-error')
    expect(root.className).toContain('extra-input-number')
    expect(result.queryByRole('button', { name: 'increase value' })).toBeNull()
  })

  it('integrates with Form.Item value collection', () => {
    const onFinish = vi.fn()
    const result = render(() => (
      <Form onFinish={onFinish}>
        <Form.Item name="amount">
          <InputNumber />
        </Form.Item>
        <button type="submit">Submit</button>
      </Form>
    ))
    const input = result.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(input, { target: { value: '7' } })
    fireEvent.blur(input)
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ amount: 7 })
  })
})
