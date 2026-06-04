import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { ConfigProvider } from '../../config-provider'
import { Form, useForm } from '../../form'
import { Mentions } from '../index'

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
    expect(result.queryByRole('listbox')).toBeNull()

    fireEvent.input(textarea, { target: { value: 'hello @a' } })

    expect(textarea.value).toBe('hello @a')
    expect(result.getByRole('listbox')).toBeTruthy()
    expect(result.getByRole('option', { name: 'Alice' })).toBeTruthy()
    expect(result.queryByRole('option', { name: 'Bob' })).toBeNull()
    expect(onSearch).toHaveBeenLastCalledWith('a', '@')
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('selects an option and inserts the mention into the textarea', () => {
    const onChange = vi.fn()
    const onSelect = vi.fn()
    const result = render(() => (
      <Mentions defaultValue="hello @a" options={options} onChange={onChange} onSelect={onSelect} />
    ))
    const textarea = result.getByRole('textbox') as HTMLTextAreaElement

    fireEvent.focus(textarea)
    fireEvent.click(result.getByRole('option', { name: 'Alice' }))

    expect(textarea.value).toBe('hello @alice ')
    expect(result.queryByRole('listbox')).toBeNull()
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
    expect(result.getByRole('listbox')).toBeTruthy()

    fireEvent.click(result.getByRole('option', { name: 'Bob' }))

    expect(textarea.value).toBe('hi @bob ')
    expect(result.queryByRole('listbox')).toBeNull()
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

    expect(result.getByRole('option', { name: 'Alice' })).toBeTruthy()
    expect(result.getByRole('option', { name: 'Charlie' })).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(result.getByRole('option', { name: 'Charlie' }))
    expect(textarea.value).toBe('ask #zzz')

    fireEvent.keyDown(textarea, { key: 'Enter' })
    expect(textarea.value).toBe('ask #alice ')

    fireEvent.input(textarea, { target: { value: 'ask @b' } })
    fireEvent.keyDown(textarea, { key: 'Escape' })
    expect(result.queryByRole('listbox')).toBeNull()

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
    expect(result.getByRole('listbox')).toBeTruthy()

    fireEvent.input(textarea, { target: { value: 'mail @a.b' } })
    expect(result.queryByRole('listbox')).toBeNull()

    fireEvent.input(textarea, { target: { value: 'mail @a' } })
    fireEvent.click(result.getByRole('option', { name: 'Alice' }))
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
    fireEvent.click(result.getByRole('option', { name: 'Alice' }))

    expect(form.getFieldValue('comment')).toBe('hello @alice ')

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ comment: 'hello @alice ' })
  })
})
