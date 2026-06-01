import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { ConfigProvider } from '../../config-provider'
import { Form, useForm } from '../../form'
import { Select } from '../index'

describe('Select', () => {
  const options = [
    { label: 'Alpha', value: 'a' },
    { label: 'Beta', value: 'b' },
  ]

  it('renders placeholder and opens/closes dropdown', () => {
    const onOpenChange = vi.fn()
    const result = render(() => <Select placeholder="Pick one" options={options} onOpenChange={onOpenChange} />)
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveTextContent('Pick one')
    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(result.queryByRole('listbox')).toBeNull()

    fireEvent.click(combobox)

    expect(combobox).toHaveAttribute('aria-expanded', 'true')
    expect(result.getByRole('listbox')).toBeTruthy()
    expect(onOpenChange).toHaveBeenCalledWith(true)

    fireEvent.click(combobox)

    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('selects an option and calls onChange', () => {
    const onChange = vi.fn()
    const result = render(() => <Select placeholder="Pick" options={options} onChange={onChange} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.click(result.getByRole('option', { name: 'Beta' }))

    expect(combobox).toHaveTextContent('Beta')
    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(onChange).toHaveBeenCalledWith('b', { label: 'Beta', value: 'b' })
  })

  it('supports controlled value and controlled open', () => {
    const [value, setValue] = createSignal('a')
    const [open, setOpen] = createSignal(false)
    const onOpenChange = vi.fn((next: boolean) => setOpen(next))
    const result = render(() => <Select value={value()} open={open()} options={options} onOpenChange={onOpenChange} onChange={(next) => setValue(next as string)} />)
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveTextContent('Alpha')

    fireEvent.click(combobox)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(result.getByRole('listbox')).toBeTruthy()

    fireEvent.click(result.getByRole('option', { name: 'Beta' }))

    expect(combobox).toHaveTextContent('Beta')
    expect(combobox).toHaveAttribute('aria-expanded', 'false')
  })

  it('clears value with allowClear', () => {
    const onChange = vi.fn()
    const result = render(() => <Select allowClear defaultValue="a" options={options} onChange={onChange} />)
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveTextContent('Alpha')

    fireEvent.click(result.getByRole('button', { name: 'clear selection' }))

    expect(combobox).not.toHaveTextContent('Alpha')
    expect(onChange).toHaveBeenCalledWith(undefined, undefined)
  })

  it('does not open or clear when disabled', () => {
    const onOpenChange = vi.fn()
    const onChange = vi.fn()
    const result = render(() => <Select disabled allowClear defaultValue="a" options={options} onOpenChange={onOpenChange} onChange={onChange} />)
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(combobox)

    expect(result.queryByRole('listbox')).toBeNull()
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(result.queryByRole('button', { name: 'clear selection' })).toBeNull()
  })

  it('closes with Escape and selects first enabled option with Enter', () => {
    const onChange = vi.fn()
    const result = render(() => <Select options={[{ label: 'Disabled', value: 'x', disabled: true }, ...options]} onChange={onChange} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.keyDown(combobox, { key: 'Escape' })

    expect(result.queryByRole('listbox')).toBeNull()

    fireEvent.click(combobox)
    fireEvent.keyDown(combobox, { key: 'Enter' })

    expect(combobox).toHaveTextContent('Alpha')
    expect(onChange).toHaveBeenCalledWith('a', { label: 'Alpha', value: 'a' })
  })

  it('supports custom prefixCls from props and ConfigProvider', () => {
    const withProp = render(() => <Select prefixCls="custom-select" options={options} />)
    expect(withProp.container.querySelector('.custom-select')).toBeTruthy()

    const withProvider = render(() => (
      <ConfigProvider prefixCls="custom">
        <Select options={options} />
      </ConfigProvider>
    ))
    expect(withProvider.container.querySelector('.custom-select')).toBeTruthy()
  })



  it('updates Form.Item value on blur when trigger is onBlur', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form} initialValues={{ choice: 'a' }}>
        <Form.Item name="choice" trigger="onBlur">
          <Select options={options} />
        </Form.Item>
      </Form>
    ))
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveTextContent('Alpha')

    fireEvent.click(combobox)
    fireEvent.click(result.getByRole('option', { name: 'Beta' }))

    expect(combobox).toHaveTextContent('Beta')
    expect(form.getFieldValue('choice')).toBe('a')

    fireEvent.focusOut(combobox, { relatedTarget: document.body })

    expect(form.getFieldValue('choice')).toBe('b')
  })

  it('integrates with Form.Item value semantics', () => {
    const [form] = useForm()
    const onFinish = vi.fn()
    const result = render(() => (
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="choice">
          <Select options={options} />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.click(result.getByRole('option', { name: 'Beta' }))

    expect(form.getFieldValue('choice')).toBe('b')
    expect(combobox).toHaveTextContent('Beta')

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ choice: 'b' })
  })
})
