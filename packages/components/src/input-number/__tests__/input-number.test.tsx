import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Form, useForm } from '../../form'
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

  it('keeps controlled display at source value when parent rejects changes', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber value={5} onChange={onChange} />)
    const input = result.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(input, { target: { value: '8' } })
    expect(input).toHaveValue('8')
    fireEvent.blur(input)

    expect(onChange).toHaveBeenCalledWith(8)
    expect(input).toHaveValue('5')
  })

  it('reflects parent-clamped controlled values after commit', () => {
    const [value, setValue] = createSignal(5)
    const result = render(() => (
      <InputNumber value={value()} onChange={(next) => setValue(Math.min(Number(next ?? 0), 6))} />
    ))
    const input = result.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(input, { target: { value: '9' } })
    fireEvent.blur(input)

    expect(input).toHaveValue('6')
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

  it('renders icon components for step controls', () => {
    const result = render(() => <InputNumber defaultValue={2} />)
    const increaseButton = result.getByRole('button', { name: 'increase value' })
    const decreaseButton = result.getByRole('button', { name: 'decrease value' })

    expect(increaseButton.querySelector('svg')).toBeInTheDocument()
    expect(decreaseButton.querySelector('svg')).toBeInTheDocument()
    expect(increaseButton).not.toHaveTextContent('▲')
    expect(decreaseButton).not.toHaveTextContent('▼')
  })

  it('disables arrow key stepping when keyboard is false', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <InputNumber defaultValue={1} keyboard={false} onChange={onChange} />
    ))
    const input = result.getByRole('spinbutton')

    fireEvent.keyDown(input, { key: 'ArrowUp' })

    expect(onChange).not.toHaveBeenCalled()
    expect(input).toHaveValue('1')
  })

  it('calls onPressEnter after onKeyDown for Enter', () => {
    const onKeyDown = vi.fn()
    const onPressEnter = vi.fn()
    const result = render(() => <InputNumber onKeyDown={onKeyDown} onPressEnter={onPressEnter} />)
    const input = result.getByRole('spinbutton')

    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onKeyDown).toHaveBeenCalledTimes(1)
    expect(onPressEnter).toHaveBeenCalledTimes(1)
  })

  it('commits while typing when changeOnBlur is false', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber changeOnBlur={false} onChange={onChange} />)
    const input = result.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(input, { target: { value: '12' } })

    expect(onChange).toHaveBeenLastCalledWith(12)
    expect(input).toHaveValue('12')
  })

  it('readOnly prevents typing, keyboard, wheel, and control commits', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <InputNumber defaultValue={4} readOnly changeOnWheel onChange={onChange} />
    ))
    const input = result.getByRole('spinbutton') as HTMLInputElement

    expect(input).toHaveAttribute('readonly')
    fireEvent.input(input, { target: { value: '8' } })
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    fireEvent.wheel(input, { deltaY: -1 })

    expect(onChange).not.toHaveBeenCalled()
    expect(input).toHaveValue('4')
    expect(result.queryByRole('button', { name: 'increase value' })).toBeNull()
  })

  it('supports mouse wheel stepping and onStep metadata', () => {
    const onChange = vi.fn()
    const onStep = vi.fn()
    const result = render(() => (
      <InputNumber defaultValue={2} step={0.5} changeOnWheel onChange={onChange} onStep={onStep} />
    ))
    const input = result.getByRole('spinbutton')

    fireEvent.wheel(input, { deltaY: -1 })

    expect(onChange).toHaveBeenLastCalledWith(2.5)
    expect(onStep).toHaveBeenLastCalledWith(2.5, {
      offset: 0.5,
      type: 'up',
      emitter: 'wheel',
    })
  })

  it('calls onStep for handler and keyboard stepping', () => {
    const onStep = vi.fn()
    const result = render(() => <InputNumber defaultValue={2} step={2} onStep={onStep} />)
    const input = result.getByRole('spinbutton')

    fireEvent.click(result.getByRole('button', { name: 'increase value' }))
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    expect(onStep).toHaveBeenNthCalledWith(1, 4, {
      offset: 2,
      type: 'up',
      emitter: 'handler',
    })
    expect(onStep).toHaveBeenNthCalledWith(2, 2, {
      offset: -2,
      type: 'down',
      emitter: 'keydown',
    })
  })

  it('renders prefix, suffix, custom controls, and variant class', () => {
    const result = render(() => (
      <InputNumber
        prefix={<span data-testid="prefix-node">$</span>}
        suffix={<span data-testid="suffix-node">USD</span>}
        controls={{ upIcon: <span>plus</span>, downIcon: <span>minus</span> }}
        variant="filled"
      />
    ))
    const root = result.container.firstElementChild as HTMLElement

    expect(result.getByTestId('prefix-node')).toBeInTheDocument()
    expect(result.getByTestId('suffix-node')).toBeInTheDocument()
    expect(result.getByRole('button', { name: 'increase value' })).toHaveTextContent('plus')
    expect(result.getByRole('button', { name: 'decrease value' })).toHaveTextContent('minus')
    expect(root.className).toContain('ads-input-number-variant-filled')
  })

  it('supports string step values and stringMode change values', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <InputNumber defaultValue="1.1" step="0.2" stringMode onChange={onChange} />
    ))

    fireEvent.click(result.getByRole('button', { name: 'increase value' }))

    expect(onChange).toHaveBeenLastCalledWith('1.3')
    expect(result.getByRole('spinbutton')).toHaveValue('1.3')
  })

  it('supports decimalSeparator parsing and display', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber decimalSeparator="," onChange={onChange} />)
    const input = result.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(input, { target: { value: '1,5' } })
    fireEvent.blur(input)

    expect(onChange).toHaveBeenLastCalledWith(1.5)
    expect(input).toHaveValue('1,5')
  })

  it('passes userTyping info to formatter', () => {
    const formatter = vi.fn(
      (value: number | string | undefined, info: { userTyping: boolean; input: string }) =>
        info.userTyping ? info.input : `#${value ?? ''}`,
    )
    const result = render(() => <InputNumber defaultValue={3} formatter={formatter} />)
    const input = result.getByRole('spinbutton') as HTMLInputElement

    expect(input).toHaveValue('#3')
    fireEvent.input(input, { target: { value: '12' } })

    expect(formatter).toHaveBeenCalledWith(3, { userTyping: false, input: '3' })
    expect(input).toHaveValue('12')
  })

  it('applies semantic classes, styles, rootClassName, and prefixCls override', () => {
    const result = render(() => (
      <InputNumber
        prefixCls="custom-number"
        rootClassName="root-extra"
        prefix={<span />}
        suffix={<span />}
        classNames={{
          root: 'root-slot',
          prefix: 'prefix-slot',
          suffix: 'suffix-slot',
          input: 'input-slot',
          actions: 'actions-slot',
        }}
        styles={{ root: { width: '222px' }, input: { color: 'red' } }}
      />
    ))
    const root = result.container.firstElementChild as HTMLElement
    const input = result.getByRole('spinbutton') as HTMLInputElement

    expect(root.className).toContain('custom-number')
    expect(root.className).toContain('root-extra')
    expect(root.className).toContain('root-slot')
    expect(root).toHaveStyle({ width: '222px' })
    expect(input.className).toContain('input-slot')
    expect(input).toHaveStyle({ color: 'rgb(255, 0, 0)' })
    expect(root.querySelector('.prefix-slot')).toBeInTheDocument()
    expect(root.querySelector('.suffix-slot')).toBeInTheDocument()
    expect(root.querySelector('.actions-slot')).toBeInTheDocument()
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

  it('respects defaultPrevented keyboard events', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <InputNumber
        defaultValue={1}
        onChange={onChange}
        onKeyDown={(event) => event.preventDefault()}
      />
    ))
    const input = result.getByRole('spinbutton')

    fireEvent.keyDown(input, { key: 'ArrowUp' })

    expect(onChange).not.toHaveBeenCalled()
    expect(input).toHaveValue('1')
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

  it('falls back to step 1 for invalid step values', () => {
    const result = render(() => <InputNumber defaultValue={2} step={0} />)

    fireEvent.click(result.getByRole('button', { name: 'increase value' }))
    expect(result.getByRole('spinbutton')).toHaveValue('3')
  })

  it('ignores invalid and negative precision values', () => {
    const invalid = render(() => <InputNumber precision={Number.NaN} />)
    const invalidInput = invalid.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(invalidInput, { target: { value: '1.236' } })
    fireEvent.blur(invalidInput)
    expect(invalidInput).toHaveValue('1.236')

    const negative = render(() => <InputNumber precision={-1} />)
    const negativeInput = negative.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(negativeInput, { target: { value: '2.678' } })
    fireEvent.blur(negativeInput)
    expect(negativeInput).toHaveValue('2.678')
  })

  it('commits empty input as undefined', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber defaultValue={3} onChange={onChange} />)
    const input = result.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(input, { target: { value: '' } })
    fireEvent.blur(input)

    expect(onChange).toHaveBeenLastCalledWith(undefined)
    expect(input).toHaveValue('')
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

  it('uses numeric onChange values instead of DOM change events', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber onChange={onChange} />)
    const input = result.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(input, { target: { value: '4' } })
    fireEvent.blur(input)

    expect(onChange).toHaveBeenCalledWith(4)
    expect(onChange.mock.calls[0][0]).not.toHaveProperty('currentTarget')
  })

  it('updates Form.Item value on blur when trigger is onBlur', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form} initialValues={{ amount: 2 }}>
        <Form.Item name="amount" trigger="onBlur">
          <InputNumber />
        </Form.Item>
      </Form>
    ))
    const input = result.getByRole('spinbutton') as HTMLInputElement

    expect(input).toHaveValue('2')
    fireEvent.input(input, { target: { value: '7' } })
    expect(input).toHaveValue('7')
    expect(form.getFieldValue('amount')).toBe(2)

    fireEvent.blur(input)

    expect(form.getFieldValue('amount')).toBe(7)
    expect(input).toHaveValue('7')
  })

  it('submits Form.Item values collected with trigger onBlur', () => {
    const onFinish = vi.fn()
    const result = render(() => (
      <Form onFinish={onFinish}>
        <Form.Item name="amount" trigger="onBlur">
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
