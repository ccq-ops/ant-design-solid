import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Form, useForm } from '../../form'
import { Button } from '../../button'
import { Checkbox } from '../index'

describe('Checkbox', () => {
  it('supports controlled checked state', () => {
    const onChange = vi.fn()
    const [checked, setChecked] = createSignal(true)
    const result = render(() => <Checkbox checked={checked()} onChange={onChange}>Agree</Checkbox>)
    const input = result.getByRole('checkbox', { name: 'Agree' }) as HTMLInputElement

    expect(input.checked).toBe(true)
    expect(result.container.querySelector('.ads-checkbox-checked')).toBeTruthy()

    setChecked(false)

    expect(input.checked).toBe(false)
    expect(result.container.querySelector('.ads-checkbox-checked')).toBeFalsy()
  })

  it('restores controlled checked state when parent does not update', () => {
    const onChange = vi.fn()
    const result = render(() => <Checkbox checked={false} onChange={onChange}>Controlled</Checkbox>)
    const input = result.getByRole('checkbox', { name: 'Controlled' }) as HTMLInputElement

    fireEvent.click(input)

    expect(onChange).toHaveBeenCalledOnce()
    expect(input.checked).toBe(false)
    expect(result.container.querySelector('.ads-checkbox-checked')).toBeFalsy()
  })

  it('toggles from defaultChecked when uncontrolled', () => {
    const onChange = vi.fn()
    const result = render(() => <Checkbox defaultChecked onChange={onChange}>Toggle</Checkbox>)
    const input = result.getByRole('checkbox', { name: 'Toggle' }) as HTMLInputElement

    expect(input.checked).toBe(true)

    fireEvent.click(input)

    expect(input.checked).toBe(false)
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('does not update or fire onChange when disabled', () => {
    const onChange = vi.fn()
    const result = render(() => <Checkbox defaultChecked disabled onChange={onChange}>Disabled</Checkbox>)
    const input = result.getByRole('checkbox', { name: 'Disabled' }) as HTMLInputElement

    expect(input.disabled).toBe(true)

    fireEvent.click(input)

    expect(onChange).not.toHaveBeenCalled()
  })

  it('sets indeterminate class and DOM state', () => {
    const result = render(() => <Checkbox indeterminate>Partial</Checkbox>)
    const input = result.getByRole('checkbox', { name: 'Partial' }) as HTMLInputElement

    expect(result.container.querySelector('.ads-checkbox-indeterminate')).toBeTruthy()
    expect(input.indeterminate).toBe(true)
  })

  it('updates Form.Item checked value on blur when trigger is onBlur', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form}>
        <Form.Item name="agree" valuePropName="checked" trigger="onBlur">
          <Checkbox>Agree on blur</Checkbox>
        </Form.Item>
      </Form>
    ))
    const checkbox = result.getByRole('checkbox', { name: 'Agree on blur' }) as HTMLInputElement

    fireEvent.click(checkbox)

    expect(form.getFieldValue('agree')).toBeUndefined()
    expect(checkbox.checked).toBe(true)

    fireEvent.blur(checkbox)

    expect(form.getFieldValue('agree')).toBe(true)
  })


  it('clears pending onBlur checked DOM when resetFields runs before blur', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form}>
        <Form.Item name="agree" valuePropName="checked" trigger="onBlur">
          <Checkbox>Agree</Checkbox>
        </Form.Item>
      </Form>
    ))
    const checkbox = result.getByRole('checkbox', { name: 'Agree' }) as HTMLInputElement

    fireEvent.click(checkbox)

    expect(form.getFieldValue('agree')).toBeUndefined()

    form.resetFields()

    expect(checkbox.checked).toBe(false)
    expect(result.container.querySelector('.ads-checkbox-checked')).toBeFalsy()
  })

  it('clears Form.Item checked display when resetFields resets to undefined', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form}>
        <Form.Item name="agree" valuePropName="checked" trigger="onBlur">
          <Checkbox>Reset agree</Checkbox>
        </Form.Item>
      </Form>
    ))
    const checkbox = result.getByRole('checkbox', { name: 'Reset agree' }) as HTMLInputElement

    fireEvent.click(checkbox)
    fireEvent.blur(checkbox)
    expect(form.getFieldValue('agree')).toBe(true)
    expect(checkbox.checked).toBe(true)

    form.resetFields()

    expect(form.getFieldValue('agree')).toBeUndefined()
    expect(checkbox.checked).toBe(false)
  })

  it('supports custom prefixCls from props and ConfigProvider', () => {
    const withProp = render(() => <Checkbox prefixCls="custom-checkbox">Prop prefix</Checkbox>)
    expect(withProp.container.querySelector('.custom-checkbox')).toBeTruthy()

    const withProvider = render(() => (
      <ConfigProvider prefixCls="custom">
        <Checkbox>Provider prefix</Checkbox>
      </ConfigProvider>
    ))
    expect(withProvider.container.querySelector('.custom-checkbox')).toBeTruthy()
  })
})

describe('Checkbox.Group', () => {
  it('updates array values using options', () => {
    const onChange = vi.fn()
    const result = render(() => <Checkbox.Group defaultValue={['a']} options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]} onChange={onChange} />)
    const a = result.getByRole('checkbox', { name: 'A' }) as HTMLInputElement
    const b = result.getByRole('checkbox', { name: 'B' }) as HTMLInputElement

    expect(a.checked).toBe(true)
    expect(b.checked).toBe(false)

    fireEvent.click(b)

    expect(b.checked).toBe(true)
    expect(onChange).toHaveBeenLastCalledWith(['a', 'b'])

    fireEvent.click(a)

    expect(a.checked).toBe(false)
    expect(onChange).toHaveBeenLastCalledWith(['b'])
  })

  it('restores controlled option checked state when parent does not update', () => {
    const onChange = vi.fn()
    const result = render(() => <Checkbox.Group value={['a']} options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]} onChange={onChange} />)
    const a = result.getByRole('checkbox', { name: 'A' }) as HTMLInputElement
    const b = result.getByRole('checkbox', { name: 'B' }) as HTMLInputElement

    fireEvent.click(b)

    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
    expect(a.checked).toBe(true)
    expect(b.checked).toBe(false)
  })


  it('does not update group state or call onChange for group-level disabled options', async () => {
    const onChange = vi.fn()
    const result = render(() => <Checkbox.Group disabled defaultValue={['a']} options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]} onChange={onChange} />)
    const a = result.getByRole('checkbox', { name: 'A' }) as HTMLInputElement
    const b = result.getByRole('checkbox', { name: 'B' }) as HTMLInputElement

    expect(a.disabled).toBe(true)
    expect(b.disabled).toBe(true)

    fireEvent.click(a)
    fireEvent.click(b)

    await waitFor(() => {
      expect(a.checked).toBe(true)
      expect(b.checked).toBe(false)
    })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('does not update state, form, or call onChange for disabled option', async () => {
    const [form] = useForm()
    const onChange = vi.fn()
    const result = render(() => (
      <Form form={form} initialValues={{ choices: ['a'] }}>
        <Form.Item name="choices">
          <Checkbox.Group options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b', disabled: true }]} onChange={onChange} />
        </Form.Item>
      </Form>
    ))
    const b = result.getByRole('checkbox', { name: 'B' }) as HTMLInputElement

    expect(b.disabled).toBe(true)

    fireEvent.click(b)

    await waitFor(() => expect(b.checked).toBe(false))
    expect(onChange).not.toHaveBeenCalled()
    expect(form.getFieldValue('choices')).toEqual(['a'])
  })

  it('updates Form.Item array value on blur when trigger is onBlur', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form} initialValues={{ choices: ['a'] }}>
        <Form.Item name="choices" trigger="onBlur">
          <Checkbox.Group options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]} />
        </Form.Item>
      </Form>
    ))
    const a = result.getByRole('checkbox', { name: 'A' }) as HTMLInputElement
    const b = result.getByRole('checkbox', { name: 'B' }) as HTMLInputElement

    expect(a.checked).toBe(true)
    expect(b.checked).toBe(false)

    fireEvent.click(b)

    expect(b.checked).toBe(true)
    expect(form.getFieldValue('choices')).toEqual(['a'])

    fireEvent.focusOut(b, { relatedTarget: document.body })

    expect(form.getFieldValue('choices')).toEqual(['a', 'b'])
  })


  it('clears Form.Item group display when resetFields resets to undefined', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form}>
        <Form.Item name="choices">
          <Checkbox.Group options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]} />
        </Form.Item>
      </Form>
    ))
    const a = result.getByRole('checkbox', { name: 'A' }) as HTMLInputElement
    const b = result.getByRole('checkbox', { name: 'B' }) as HTMLInputElement

    fireEvent.click(a)
    fireEvent.click(b)
    expect(form.getFieldValue('choices')).toEqual(['a', 'b'])
    expect(a.checked).toBe(true)
    expect(b.checked).toBe(true)

    form.resetFields()

    expect(form.getFieldValue('choices')).toBeUndefined()
    expect(a.checked).toBe(false)
    expect(b.checked).toBe(false)
  })

  it('integrates with Form.Item checked semantics', () => {
    const [form] = useForm()
    const onFinish = vi.fn()
    const result = render(() => (
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="agree" valuePropName="checked">
          <Checkbox>Agree</Checkbox>
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))
    const checkbox = result.getByRole('checkbox', { name: 'Agree' }) as HTMLInputElement

    expect(checkbox.checked).toBe(false)

    fireEvent.click(checkbox)

    expect(form.getFieldValue('agree')).toBe(true)
    expect(checkbox.checked).toBe(true)

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ agree: true })
  })
})
