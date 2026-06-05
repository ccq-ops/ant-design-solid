import { fireEvent, render, screen } from '@solidjs/testing-library'
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
    const result = render(() => (
      <Select placeholder="Pick one" options={options} onOpenChange={onOpenChange} />
    ))
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveTextContent('Pick one')
    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).toBeNull()

    fireEvent.click(combobox)

    expect(combobox).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox')).toBeTruthy()
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
    fireEvent.click(screen.getByRole('option', { name: 'Beta' }))

    expect(combobox).toHaveTextContent('Beta')
    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(onChange).toHaveBeenCalledWith('b', { label: 'Beta', value: 'b' })
  })

  it('supports controlled value and controlled open', () => {
    const [value, setValue] = createSignal('a')
    const [open, setOpen] = createSignal(false)
    const onOpenChange = vi.fn((next: boolean) => setOpen(next))
    const result = render(() => (
      <Select
        value={value()}
        open={open()}
        options={options}
        onOpenChange={onOpenChange}
        onChange={(next) => setValue(next as string)}
      />
    ))
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveTextContent('Alpha')

    fireEvent.click(combobox)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('listbox')).toBeTruthy()

    fireEvent.click(screen.getByRole('option', { name: 'Beta' }))

    expect(combobox).toHaveTextContent('Beta')
    expect(combobox).toHaveAttribute('aria-expanded', 'false')
  })

  it('clears value with allowClear', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Select allowClear defaultValue="a" options={options} onChange={onChange} />
    ))
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveTextContent('Alpha')

    fireEvent.click(result.getByRole('button', { name: 'clear selection' }))

    expect(combobox).not.toHaveTextContent('Alpha')
    expect(onChange).toHaveBeenCalledWith(undefined, undefined)
  })

  it('does not open or clear when disabled', () => {
    const onOpenChange = vi.fn()
    const onChange = vi.fn()
    const result = render(() => (
      <Select
        disabled
        allowClear
        defaultValue="a"
        options={options}
        onOpenChange={onOpenChange}
        onChange={onChange}
      />
    ))
    const combobox = result.getByRole('combobox')

    expect(combobox).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(combobox)

    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(result.queryByRole('button', { name: 'clear selection' })).toBeNull()
  })

  it('closes dropdown on outside pointer down', () => {
    const onOpenChange = vi.fn()
    const result = render(() => <Select options={options} onOpenChange={onOpenChange} />)
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    expect(screen.getByRole('listbox')).toBeTruthy()

    fireEvent.pointerDown(document.body)

    expect(screen.queryByRole('listbox')).toBeNull()
    expect(combobox).toHaveAttribute('aria-expanded', 'false')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('closes with Escape and selects first enabled option with Enter', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Select
        options={[{ label: 'Disabled', value: 'x', disabled: true }, ...options]}
        onChange={onChange}
      />
    ))
    const combobox = result.getByRole('combobox')

    fireEvent.click(combobox)
    fireEvent.keyDown(combobox, { key: 'Escape' })

    expect(screen.queryByRole('listbox')).toBeNull()

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
    fireEvent.click(screen.getByRole('option', { name: 'Beta' }))

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
    fireEvent.click(screen.getByRole('option', { name: 'Beta' }))

    expect(form.getFieldValue('choice')).toBe('b')
    expect(combobox).toHaveTextContent('Beta')

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ choice: 'b' })
  })
})

it('renders dropdown in a portal with fixed positioning and explicit zIndex', () => {
  const result = render(() => (
    <Select zIndex={1301} options={[{ value: 'one', label: 'One' }]} style={{ width: '200px' }} />
  ))
  const selector = result.container.querySelector('.ads-select-selector') as HTMLElement
  const rectSpy = vi.spyOn(selector, 'getBoundingClientRect').mockReturnValue({
    top: 10,
    bottom: 42,
    left: 20,
    right: 220,
    width: 200,
    height: 32,
    x: 20,
    y: 10,
    toJSON: () => ({}),
  } as DOMRect)

  fireEvent.click(selector)

  const dropdown = Array.from(
    document.body.querySelectorAll<HTMLElement>('.ads-select-dropdown'),
  ).find((element) => element.textContent?.includes('One'))!
  expect(dropdown).toBeTruthy()
  expect(result.container.querySelector('.ads-select-dropdown')).toBeFalsy()
  expect(dropdown.style.position).toBe('fixed')
  expect(dropdown.style.top).toBe('46px')
  expect(dropdown.style.left).toBe('20px')
  expect(dropdown.style.width).toBe('200px')
  expect(dropdown.style.zIndex).toBe('1301')
  rectSpy.mockRestore()
})

it('updates portal dropdown position when the page scrolls', () => {
  const result = render(() => <Select options={[{ value: 'one', label: 'One' }]} />)
  const selector = result.container.querySelector('.ads-select-selector') as HTMLElement
  const rectSpy = vi
    .spyOn(selector, 'getBoundingClientRect')
    .mockReturnValueOnce({
      top: 10,
      bottom: 42,
      left: 20,
      right: 220,
      width: 200,
      height: 32,
      x: 20,
      y: 10,
      toJSON: () => ({}),
    } as DOMRect)
    .mockReturnValueOnce({
      top: 10,
      bottom: 42,
      left: 20,
      right: 220,
      width: 200,
      height: 32,
      x: 20,
      y: 10,
      toJSON: () => ({}),
    } as DOMRect)
    .mockReturnValue({
      top: 30,
      bottom: 62,
      left: 20,
      right: 220,
      width: 200,
      height: 32,
      x: 20,
      y: 30,
      toJSON: () => ({}),
    } as DOMRect)

  fireEvent.click(selector)

  expect(
    Array.from(document.body.querySelectorAll<HTMLElement>('.ads-select-dropdown')).find(
      (element) => element.textContent?.includes('One'),
    )!.style.top,
  ).toBe('46px')

  window.dispatchEvent(new Event('scroll'))
  expect(rectSpy).toHaveBeenCalledTimes(3)
  const updatedDropdown = Array.from(
    document.body.querySelectorAll<HTMLElement>('.ads-select-dropdown'),
  ).find((element) => element.textContent?.includes('One') && element.style.top === '66px')!
  expect(updatedDropdown).toBeTruthy()
  rectSpy.mockRestore()
})
