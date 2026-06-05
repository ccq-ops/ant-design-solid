import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { ConfigProvider } from '../../config-provider'
import { Form, useForm } from '../../form'
import { Mentions } from '../index'

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})

describe('Mentions', () => {
  const options = [
    { label: 'Alice', value: 'alice' },
    { label: 'Bob', value: 'bob' },
    { label: 'Charlie', value: 'charlie', disabled: true },
  ]

  it('opens suggestions after prefix and filters options by search text', () => {
    const onSearch = vi.fn()
    const onOpenChange = vi.fn()
    const result = render(() => (
      <Mentions
        placeholder="Mention someone"
        options={options}
        onSearch={onSearch}
        onOpenChange={onOpenChange}
      />
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    expect(textarea).toHaveAttribute('placeholder', 'Mention someone')
    expect(screen.queryByRole('listbox')).toBeNull()

    fireEvent.input(textarea, { target: { value: 'hello @a' } })

    expect(textarea.value).toBe('hello @a')
    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Alice' })).toBeTruthy()
    expect(screen.queryByRole('option', { name: 'Bob' })).toBeNull()
    expect(onSearch).toHaveBeenLastCalledWith('a', '@')
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('closes suggestions on outside pointer down', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <Mentions defaultValue="hello @a" options={options} onOpenChange={onOpenChange} />
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    fireEvent.focus(textarea)
    expect(screen.getByRole('listbox')).toBeTruthy()

    fireEvent.pointerDown(document.body)

    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('selects an option and inserts the mention into the textarea', () => {
    const onChange = vi.fn()
    const onSelect = vi.fn()
    const result = render(() => (
      <Mentions defaultValue="hello @a" options={options} onChange={onChange} onSelect={onSelect} />
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    fireEvent.focus(textarea)
    fireEvent.click(screen.getByRole('option', { name: 'Alice' }))

    expect(textarea.value).toBe('hello @alice ')
    expect(screen.queryByRole('listbox')).toBeNull()
    expect(onChange).toHaveBeenLastCalledWith('hello @alice ')
    expect(onSelect).toHaveBeenCalledWith({ label: 'Alice', value: 'alice' }, '@')
  })

  it('supports controlled value and controlled open', () => {
    const [value, setValue] = createSignal('hi @')
    const [open, setOpen] = createSignal(false)
    const onOpenChange = vi.fn((next: boolean) => setOpen(next))
    const result = render(() => (
      <Mentions
        value={value()}
        open={open()}
        options={options}
        onChange={setValue}
        onOpenChange={onOpenChange}
      />
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    expect(textarea.value).toBe('hi @')

    fireEvent.focus(textarea)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('listbox')).toBeTruthy()

    fireEvent.click(screen.getByRole('option', { name: 'Bob' }))

    expect(textarea.value).toBe('hi @bob ')
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('supports multiple prefixes, disabled options, clear, and keyboard handling', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Mentions
        allowClear
        defaultValue="ask #zzz"
        prefix={['@', '#']}
        filterOption={false}
        options={options}
        onChange={onChange}
      />
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    fireEvent.focus(textarea)

    expect(screen.getByRole('option', { name: 'Alice' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'Charlie' })).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(screen.getByRole('option', { name: 'Charlie' }))
    expect(textarea.value).toBe('ask #zzz')

    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(textarea.value).toBe('ask #alice ')

    fireEvent.input(textarea, { target: { value: 'ask @b' } })
    fireEvent.keyDown(textarea, { key: 'Escape' })
    expect(screen.queryByRole('listbox')).toBeNull()

    fireEvent.click(result.getByRole('button', { name: 'clear mentions' }))
    expect(textarea.value).toBe('')
    expect(onChange).toHaveBeenLastCalledWith('')
  })

  it('honors validateSearch and split when selecting mentions', () => {
    const result = render(() => (
      <Mentions
        defaultValue="mail @"
        split=","
        options={options}
        validateSearch={(search) => !search.includes('.')}
      />
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    fireEvent.focus(textarea)
    expect(screen.getByRole('listbox')).toBeTruthy()

    fireEvent.input(textarea, { target: { value: 'mail @a.b' } })
    expect(screen.queryByRole('listbox')).toBeNull()

    fireEvent.input(textarea, { target: { value: 'mail @a' } })
    fireEvent.click(screen.getByRole('option', { name: 'Alice' }))
    expect(textarea.value).toBe('mail @alice,')
  })

  it('supports custom prefixCls from props and ConfigProvider', () => {
    const withProp = render(() => <Mentions prefixCls="custom-mentions" options={options} />)
    expect(withProp.container.querySelector('.custom-mentions')).toBeTruthy()

    const withProvider = render(() => (
      <ConfigProvider prefixCls="custom">
        <Mentions options={options} />
      </ConfigProvider>
    ))
    expect(withProvider.container.querySelector('.custom-mentions')).toBeTruthy()
  })

  it('integrates with Form.Item value semantics', () => {
    const [form] = useForm()
    const onFinish = vi.fn()
    const result = render(() => (
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="comment">
          <Mentions options={options} />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    fireEvent.input(textarea, { target: { value: 'hello @a' } })
    fireEvent.click(screen.getByRole('option', { name: 'Alice' }))

    expect(form.getFieldValue('comment')).toBe('hello @alice ')

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ comment: 'hello @alice ' })
  })
})

it('renders dropdown in a portal with fixed positioning and explicit zIndex', () => {
  const result = render(() => (
    <Mentions zIndex={1311} defaultValue="hello @" options={[{ value: 'one', label: 'One' }]} />
  ))
  const textarea = result.getByRole('textbox') as HTMLTextAreaElement
  const rectSpy = vi.spyOn(textarea, 'getBoundingClientRect').mockReturnValue({
    top: 10,
    bottom: 50,
    left: 20,
    right: 220,
    width: 200,
    height: 40,
    x: 20,
    y: 10,
    toJSON: () => ({}),
  } as DOMRect)

  fireEvent.focus(textarea)

  const dropdown = screen.getByRole('listbox') as HTMLElement
  expect(result.container.querySelector('.ads-mentions-dropdown')).toBeFalsy()
  expect(dropdown.style.position).toBe('fixed')
  expect(dropdown.style.top).toBe('54px')
  expect(dropdown.style.left).toBe('20px')
  expect(dropdown.style.width).toBe('200px')
  expect(dropdown.style.zIndex).toBe('1311')
  rectSpy.mockRestore()
})
