import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { ConfigProvider } from '../../config-provider'
import { Form, useForm } from '../../form'
import { Radio } from '../index'

describe('Radio', () => {
  it('supports controlled checked state', () => {
    const [checked, setChecked] = createSignal(true)
    const onChange = vi.fn()
    const result = render(() => <Radio checked={checked()} onChange={onChange}>Choice</Radio>)
    const input = result.getByRole('radio', { name: 'Choice' }) as HTMLInputElement

    expect(input.checked).toBe(true)
    expect(result.container.querySelector('.ads-radio-checked')).toBeTruthy()

    setChecked(false)

    expect(input.checked).toBe(false)
    expect(result.container.querySelector('.ads-radio-checked')).toBeFalsy()
  })

  it('restores controlled checked state when parent does not update', () => {
    const onChange = vi.fn()
    const result = render(() => <Radio checked={false} onChange={onChange}>Controlled</Radio>)
    const input = result.getByRole('radio', { name: 'Controlled' }) as HTMLInputElement

    fireEvent.click(input)

    expect(onChange).toHaveBeenCalledOnce()
    expect(input.checked).toBe(false)
    expect(result.container.querySelector('.ads-radio-checked')).toBeFalsy()
  })

  it('supports defaultChecked and selects when uncontrolled', () => {
    const onChange = vi.fn()
    const checkedResult = render(() => <Radio defaultChecked>Default</Radio>)
    const checkedInput = checkedResult.getByRole('radio', { name: 'Default' }) as HTMLInputElement

    expect(checkedInput.checked).toBe(true)

    const result = render(() => <Radio onChange={onChange}>Pick</Radio>)
    const input = result.getByRole('radio', { name: 'Pick' }) as HTMLInputElement

    expect(input.checked).toBe(false)

    fireEvent.click(input)

    expect(input.checked).toBe(true)
    expect(onChange).toHaveBeenCalledOnce()
  })

  it('does not update or fire onChange when disabled', () => {
    const onChange = vi.fn()
    const result = render(() => <Radio disabled onChange={onChange}>Disabled</Radio>)
    const input = result.getByRole('radio', { name: 'Disabled' }) as HTMLInputElement

    expect(input.disabled).toBe(true)

    fireEvent.click(input)

    expect(onChange).not.toHaveBeenCalled()
    expect(input.checked).toBe(false)
  })

  it('supports custom prefixCls from props and ConfigProvider', () => {
    const withProp = render(() => <Radio prefixCls="custom-radio">Prop prefix</Radio>)
    expect(withProp.container.querySelector('.custom-radio')).toBeTruthy()

    const withProvider = render(() => (
      <ConfigProvider prefixCls="custom">
        <Radio>Provider prefix</Radio>
      </ConfigProvider>
    ))
    expect(withProvider.container.querySelector('.custom-radio')).toBeTruthy()
  })
})

describe('Radio.Group', () => {
  it('updates value using options', () => {
    const onChange = vi.fn()
    const result = render(() => <Radio.Group defaultValue="a" options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]} onChange={onChange} />)
    const a = result.getByRole('radio', { name: 'A' }) as HTMLInputElement
    const b = result.getByRole('radio', { name: 'B' }) as HTMLInputElement

    expect(a.checked).toBe(true)
    expect(b.checked).toBe(false)

    fireEvent.click(b)

    expect(a.checked).toBe(false)
    expect(b.checked).toBe(true)
    expect(onChange).toHaveBeenLastCalledWith('b')
  })

  it('restores controlled option checked state when parent does not update', () => {
    const onChange = vi.fn()
    const result = render(() => <Radio.Group value="a" options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]} onChange={onChange} />)
    const a = result.getByRole('radio', { name: 'A' }) as HTMLInputElement
    const b = result.getByRole('radio', { name: 'B' }) as HTMLInputElement

    fireEvent.click(b)

    expect(onChange).toHaveBeenCalledWith('b')
    expect(a.checked).toBe(true)
    expect(b.checked).toBe(false)
  })

  it('does not update or call onChange when group or option is disabled', () => {
    const onGroupChange = vi.fn()
    const groupDisabled = render(() => <Radio.Group disabled defaultValue="a" options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]} onChange={onGroupChange} />)
    const disabledB = groupDisabled.getByRole('radio', { name: 'B' }) as HTMLInputElement

    expect(disabledB.disabled).toBe(true)
    fireEvent.click(disabledB)
    expect(disabledB.checked).toBe(false)
    expect(onGroupChange).not.toHaveBeenCalled()

    const onOptionChange = vi.fn()
    const optionDisabled = render(() => <Radio.Group defaultValue="a" options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b', disabled: true }]} onChange={onOptionChange} />)
    const optionB = optionDisabled.getByRole('radio', { name: 'B' }) as HTMLInputElement

    expect(optionB.disabled).toBe(true)
    fireEvent.click(optionB)
    expect(optionB.checked).toBe(false)
    expect(onOptionChange).not.toHaveBeenCalled()
  })

  it('supports optionType button classes', () => {
    const result = render(() => <Radio.Group optionType="button" defaultValue="a" options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]} />)

    expect(result.container.querySelector('.ads-radio-group-button')).toBeTruthy()
    expect(result.container.querySelectorAll('.ads-radio-button-wrapper')).toHaveLength(2)
    expect(result.container.querySelector('.ads-radio-button-wrapper-checked')).toBeTruthy()
  })

  it('clears Form.Item group display when resetFields resets to undefined', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form}>
        <Form.Item name="choice">
          <Radio.Group options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]} />
        </Form.Item>
      </Form>
    ))
    const a = result.getByRole('radio', { name: 'A' }) as HTMLInputElement
    const b = result.getByRole('radio', { name: 'B' }) as HTMLInputElement

    fireEvent.click(b)
    expect(form.getFieldValue('choice')).toBe('b')
    expect(a.checked).toBe(false)
    expect(b.checked).toBe(true)

    form.resetFields()

    expect(form.getFieldValue('choice')).toBeUndefined()
    expect(a.checked).toBe(false)
    expect(b.checked).toBe(false)
  })

  it('integrates with Form.Item value semantics', () => {
    const [form] = useForm()
    const onFinish = vi.fn()
    const result = render(() => (
      <Form form={form} onFinish={onFinish}>
        <Form.Item name="choice">
          <Radio.Group options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]} />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))
    const b = result.getByRole('radio', { name: 'B' }) as HTMLInputElement

    fireEvent.click(b)

    expect(form.getFieldValue('choice')).toBe('b')
    expect(b.checked).toBe(true)

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ choice: 'b' })
  })

  it('updates Form.Item value on blur when trigger is onBlur', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form} initialValues={{ choice: 'a' }}>
        <Form.Item name="choice" trigger="onBlur">
          <Radio.Group options={[{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }]} />
        </Form.Item>
      </Form>
    ))
    const a = result.getByRole('radio', { name: 'A' }) as HTMLInputElement
    const b = result.getByRole('radio', { name: 'B' }) as HTMLInputElement

    expect(a.checked).toBe(true)
    expect(b.checked).toBe(false)

    fireEvent.click(b)

    expect(a.checked).toBe(false)
    expect(b.checked).toBe(true)
    expect(form.getFieldValue('choice')).toBe('a')

    fireEvent.focusOut(b, { relatedTarget: document.body })

    expect(form.getFieldValue('choice')).toBe('b')
  })
})
