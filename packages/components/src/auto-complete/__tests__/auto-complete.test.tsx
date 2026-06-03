import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { ConfigProvider } from '../../config-provider'
import { Form, useForm } from '../../form'
import { AutoComplete } from '../index'

describe('AutoComplete', () => {
  const options = [
    { label: 'Alpha', value: 'alpha' },
    { label: 'Beta', value: 'beta' },
    { label: 'Gamma', value: 'gamma', disabled: true },
  ]

  it('renders placeholder and filters options while typing', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <AutoComplete placeholder="Search" options={options} onOpenChange={onOpenChange} />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    expect(combobox).toHaveAttribute('placeholder', 'Search')
    expect(result.queryByRole('listbox')).toBeNull()

    fireEvent.input(combobox, { target: { value: 'be' } })

    expect(combobox.value).toBe('be')
    expect(result.getByRole('listbox')).toBeTruthy()
    expect(result.getByRole('option', { name: 'Beta' })).toBeTruthy()
    expect(result.queryByRole('option', { name: 'Alpha' })).toBeNull()
    expect(onOpenChange).toHaveBeenCalledWith(true)
  })

  it('selects an option and calls callbacks', () => {
    const onChange = vi.fn()
    const onSelect = vi.fn()
    const result = render(() => (
      <AutoComplete options={options} onChange={onChange} onSelect={onSelect} />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.input(combobox, { target: { value: 'a' } })
    fireEvent.click(result.getByRole('option', { name: 'Alpha' }))

    expect(combobox.value).toBe('alpha')
    expect(result.queryByRole('listbox')).toBeNull()
    expect(onChange).toHaveBeenLastCalledWith('alpha')
    expect(onSelect).toHaveBeenCalledWith('alpha', { label: 'Alpha', value: 'alpha' })
  })

  it('supports controlled value and controlled open', () => {
    const [value, setValue] = createSignal('alpha')
    const [open, setOpen] = createSignal(false)
    const onOpenChange = vi.fn((next: boolean) => setOpen(next))
    const result = render(() => (
      <AutoComplete
        value={value()}
        open={open()}
        options={options}
        onChange={setValue}
        onOpenChange={onOpenChange}
      />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    expect(combobox.value).toBe('alpha')

    fireEvent.focus(combobox)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(result.getByRole('listbox')).toBeTruthy()

    fireEvent.click(result.getByRole('option', { name: 'Beta' }))

    expect(combobox.value).toBe('beta')
    expect(result.queryByRole('listbox')).toBeNull()
  })

  it('supports filterOption=false, disabled options, clear, and keyboard handling', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <AutoComplete allowClear filterOption={false} options={options} onChange={onChange} />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.input(combobox, { target: { value: 'zzz' } })

    expect(result.getByRole('option', { name: 'Alpha' })).toBeTruthy()
    expect(result.getByRole('option', { name: 'Gamma' })).toHaveAttribute('aria-disabled', 'true')

    fireEvent.click(result.getByRole('option', { name: 'Gamma' }))
    expect(combobox.value).toBe('zzz')

    fireEvent.keyDown(combobox, { key: 'Enter' })
    expect(combobox.value).toBe('alpha')

    fireEvent.input(combobox, { target: { value: 'b' } })
    fireEvent.keyDown(combobox, { key: 'Escape' })
    expect(result.queryByRole('listbox')).toBeNull()

    fireEvent.click(result.getByRole('button', { name: 'clear autocomplete' }))
    expect(combobox.value).toBe('')
    expect(onChange).toHaveBeenLastCalledWith('')
  })

  it('supports custom prefixCls from props and ConfigProvider', () => {
    const withProp = render(() => <AutoComplete prefixCls="custom-auto" options={options} />)
    expect(withProp.container.querySelector('.custom-auto')).toBeTruthy()

    const withProvider = render(() => (
      <ConfigProvider prefixCls="custom">
        <AutoComplete options={options} />
      </ConfigProvider>
    ))
    expect(withProvider.container.querySelector('.custom-auto-complete')).toBeTruthy()
  })

  it('integrates with Form.Item value semantics', () => {
    const [form] = useForm()
    const onFinish = vi.fn()
    const result = render(() => (
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="city">
          <AutoComplete options={options} />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.input(combobox, { target: { value: 'be' } })
    fireEvent.click(result.getByRole('option', { name: 'Beta' }))

    expect(form.getFieldValue('city')).toBe('beta')

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ city: 'beta' })
  })
})
