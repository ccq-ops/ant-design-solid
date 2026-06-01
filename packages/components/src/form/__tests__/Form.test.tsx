import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { Input } from '../../input'
import { Form, useForm } from '../index'
import type { FormItemControl } from '../index'

function DirectValueControl(props: { value?: unknown; onChange?: (value: string) => void }) {
  return (
    <button type="button" data-testid="direct-control" data-value={String(props.value ?? '')} onClick={() => props.onChange?.('custom')}>
      Direct
    </button>
  )
}

function ObjectValueControl(props: { value?: unknown; onChange?: (value: { id: number }) => void }) {
  return (
    <button type="button" data-testid="object-control" onClick={() => props.onChange?.({ id: 2 })}>
      Object
    </button>
  )
}

function ArrayValueControl(props: { value?: unknown; onChange?: (value: string[]) => void }) {
  return (
    <button type="button" data-testid="array-control" onClick={() => props.onChange?.(['b'])}>
      Array
    </button>
  )
}

function RequiredForm(props: { onFinish?: (values: Record<string, unknown>) => void; onFinishFailed?: (info: unknown) => void }) {
  return (
    <Form initialValues={{ username: 'seed' }} onFinish={props.onFinish} onFinishFailed={props.onFinishFailed}>
      <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Username is required' }]}>
        <Input placeholder="username" />
      </Form.Item>
      <Button htmlType="submit">Submit</Button>
    </Form>
  )
}

describe('Form', () => {
  it('submits valid values from Input', () => {
    const onFinish = vi.fn()
    const result = render(() => <RequiredForm onFinish={onFinish} />)

    fireEvent.change(result.getByPlaceholderText('username'), { target: { value: 'solid' } })
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ username: 'solid' })
  })

  it('blocks submit and displays rule errors', async () => {
    const onFinish = vi.fn()
    const onFinishFailed = vi.fn()
    const result = render(() => <RequiredForm onFinish={onFinish} onFinishFailed={onFinishFailed} />)

    fireEvent.change(result.getByPlaceholderText('username'), { target: { value: '' } })
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).not.toHaveBeenCalled()
    expect(onFinishFailed).toHaveBeenCalledOnce()
    expect(await result.findByText('Username is required')).toBeInTheDocument()
  })

  it('clears field errors after correcting invalid values', async () => {
    const result = render(() => <RequiredForm />)

    fireEvent.change(result.getByPlaceholderText('username'), { target: { value: '' } })
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))
    expect(await result.findByText('Username is required')).toBeInTheDocument()

    fireEvent.change(result.getByPlaceholderText('username'), { target: { value: 'solid' } })

    expect(result.queryByText('Username is required')).not.toBeInTheDocument()
  })

  it('keeps unrelated field errors when another field value changes', async () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form}>
        <Form.Item label="A" name="a" initialValue="" rules={[{ required: true, message: 'A required' }]}>
          <Input placeholder="a" />
        </Form.Item>
        <Form.Item label="B" name="b">
          <Input placeholder="b" />
        </Form.Item>
        <Button htmlType="submit">Validate</Button>
      </Form>
    ))

    form.submit()
    expect(form.getFieldError('a')()).toEqual(['A required'])

    form.setFieldValue('b', 'changed')

    expect(form.getFieldError('a')()).toEqual(['A required'])
    expect(result.getByText('A required')).toBeInTheDocument()
  })

  it('supports stable custom controls through Form.Item render props', () => {
    const onFinish = vi.fn()
    const originalOnChange = vi.fn()
    const result = render(() => (
      <Form initialValues={{ choice: 'seed' }} onFinish={onFinish}>
        <Form.Item name="choice">
          {(control: FormItemControl) => (
            <DirectValueControl
              value={control.value()}
              onChange={(value) => {
                originalOnChange(value)
                control.onChange(value)
              }}
            />
          )}
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))

    expect(result.getByTestId('direct-control')).toHaveAttribute('data-value', 'seed')
    fireEvent.click(result.getByTestId('direct-control'))
    expect(originalOnChange).toHaveBeenCalledWith('custom')
    expect(result.getByTestId('direct-control')).toHaveAttribute('data-value', 'custom')

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ choice: 'custom' })
  })

  it('stores and submits direct object values from custom render-prop callbacks', () => {
    const [form] = useForm()
    const onFinish = vi.fn()
    const result = render(() => (
      <Form form={form} initialValues={{ choice: { id: 1 } }} onFinish={onFinish}>
        <Form.Item name="choice">
          {(control: FormItemControl) => <ObjectValueControl value={control.value()} onChange={control.onChange as (value: { id: number }) => void} />}
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))

    fireEvent.click(result.getByTestId('object-control'))

    expect(form.getFieldValue('choice')).toEqual({ id: 2 })
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))
    expect(onFinish).toHaveBeenCalledWith({ choice: { id: 2 } })
  })

  it('stores and submits direct array values from custom render-prop callbacks', () => {
    const [form] = useForm()
    const onFinish = vi.fn()
    const result = render(() => (
      <Form form={form} initialValues={{ choice: ['a'] }} onFinish={onFinish}>
        <Form.Item name="choice">
          {(control: FormItemControl) => <ArrayValueControl value={control.value()} onChange={control.onChange as (value: string[]) => void} />}
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))

    fireEvent.click(result.getByTestId('array-control'))

    expect(form.getFieldValue('choice')).toEqual(['b'])
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))
    expect(onFinish).toHaveBeenCalledWith({ choice: ['b'] })
  })

  it('submits default Form.Item Input values typed through input events', () => {
    const onFinish = vi.fn()
    const result = render(() => (
      <Form onFinish={onFinish}>
        <Form.Item name="username">
          <Input placeholder="username" />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))

    fireEvent.input(result.getByPlaceholderText('username'), { target: { value: 'solid' } })
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ username: 'solid' })
  })

  it('clears controlled Input display when resetFields resets an undefined field', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form}>
        <Form.Item name="username">
          <Input placeholder="username" />
        </Form.Item>
      </Form>
    ))
    const input = result.getByPlaceholderText('username') as HTMLInputElement

    fireEvent.change(input, { target: { value: 'typed' } })
    expect(form.getFieldValue('username')).toBe('typed')
    expect(input.value).toBe('typed')

    form.resetFields()

    expect(form.getFieldValue('username')).toBeUndefined()
    expect(input.value).toBe('')
  })

  it('uses updated onFinish callbacks after props change', () => {
    const firstOnFinish = vi.fn()
    const secondOnFinish = vi.fn()
    const [useSecondCallback, setUseSecondCallback] = createSignal(false)
    const result = render(() => (
      <Form initialValues={{ username: 'seed' }} onFinish={useSecondCallback() ? secondOnFinish : firstOnFinish}>
        <Form.Item name="username">
          <Input placeholder="username" />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))
    expect(firstOnFinish).toHaveBeenCalledWith({ username: 'seed' })

    setUseSecondCallback(true)
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(firstOnFinish).toHaveBeenCalledOnce()
    expect(secondOnFinish).toHaveBeenCalledWith({ username: 'seed' })
  })

  it('uses updated onFinishFailed callbacks after props change', async () => {
    const firstOnFinishFailed = vi.fn()
    const secondOnFinishFailed = vi.fn()
    const [useSecondCallback, setUseSecondCallback] = createSignal(false)
    const result = render(() => (
      <Form initialValues={{ username: '' }} onFinishFailed={useSecondCallback() ? secondOnFinishFailed : firstOnFinishFailed}>
        <Form.Item name="username" rules={[{ required: true, message: 'Required' }]}>
          <Input placeholder="username" />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))
    expect(firstOnFinishFailed).toHaveBeenCalledWith({ values: { username: '' }, errorFields: [{ name: 'username', errors: ['Required'] }] })

    setUseSecondCallback(true)
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(firstOnFinishFailed).toHaveBeenCalledOnce()
    expect(secondOnFinishFailed).toHaveBeenCalledWith({ values: { username: '' }, errorFields: [{ name: 'username', errors: ['Required'] }] })
    expect(await result.findByText('Required')).toBeInTheDocument()
  })

  it('uses updated onValuesChange callbacks after props change', () => {
    const [form] = useForm()
    const firstOnValuesChange = vi.fn()
    const secondOnValuesChange = vi.fn()
    const [useSecondCallback, setUseSecondCallback] = createSignal(false)
    const result = render(() => (
      <Form form={form} onValuesChange={useSecondCallback() ? secondOnValuesChange : firstOnValuesChange}>
        <Form.Item name="username">
          <Input placeholder="username" />
        </Form.Item>
      </Form>
    ))
    const input = result.getByPlaceholderText('username') as HTMLInputElement

    fireEvent.change(input, { target: { value: 'first' } })
    expect(firstOnValuesChange).toHaveBeenCalledWith({ username: 'first' }, { username: 'first' })

    setUseSecondCallback(true)
    fireEvent.change(input, { target: { value: 'second' } })

    expect(firstOnValuesChange).toHaveBeenCalledOnce()
    expect(secondOnValuesChange).toHaveBeenCalledWith({ username: 'second' }, { username: 'second' })
  })

  it('uses updated Form.Item trigger when handling Input events', () => {
    const [form] = useForm()
    const [trigger, setTrigger] = createSignal<'onChange' | 'onBlur'>('onChange')
    const result = render(() => (
      <Form form={form} initialValues={{ username: 'seed' }}>
        <Form.Item name="username" trigger={trigger()}>
          <Input placeholder="username" />
        </Form.Item>
      </Form>
    ))
    const input = result.getByPlaceholderText('username') as HTMLInputElement

    fireEvent.input(input, { target: { value: 'typed' } })
    expect(form.getFieldValue('username')).toBe('typed')

    setTrigger('onBlur')
    fireEvent.input(input, { target: { value: 'after-trigger-change' } })
    expect(form.getFieldValue('username')).toBe('typed')

    fireEvent.blur(input, { target: { value: 'after-trigger-change' } })
    expect(form.getFieldValue('username')).toBe('after-trigger-change')
  })

  it('exposes valuePropName as a reactive Form.Item control accessor', () => {
    const [valuePropName, setValuePropName] = createSignal<'value' | 'checked'>('value')
    const result = render(() => (
      <Form>
        <Form.Item name="enabled" valuePropName={valuePropName()}>
          {(control: FormItemControl) => <span data-testid="value-prop-name">{control.valuePropName()}</span>}
        </Form.Item>
      </Form>
    ))

    expect(result.getByTestId('value-prop-name')).toHaveTextContent('value')

    setValuePropName('checked')

    expect(result.getByTestId('value-prop-name')).toHaveTextContent('checked')
  })

  it('does not update Input on input when explicit trigger is onBlur', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form} initialValues={{ username: 'seed' }}>
        <Form.Item name="username" trigger="onBlur">
          <Input placeholder="username" />
        </Form.Item>
      </Form>
    ))
    const input = result.getByPlaceholderText('username') as HTMLInputElement

    fireEvent.input(input, { target: { value: 'typed' } })
    expect(form.getFieldValue('username')).toBe('seed')

    fireEvent.blur(input, { target: { value: 'typed' } })
    expect(form.getFieldValue('username')).toBe('typed')
  })

  it('does not update form value from allowClear click when explicit trigger is onBlur', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form} initialValues={{ username: 'seed' }}>
        <Form.Item name="username" trigger="onBlur">
          <Input placeholder="username" allowClear />
        </Form.Item>
      </Form>
    ))
    const input = result.getByPlaceholderText('username') as HTMLInputElement

    fireEvent.click(result.getByRole('button', { name: 'clear input' }))

    expect(input.value).toBe('')
    expect(form.getFieldValue('username')).toBe('seed')

    fireEvent.blur(input)
    expect(form.getFieldValue('username')).toBe('')
  })

  it('resets fields to Form.Item initialValue', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form}>
        <Form.Item name="username" initialValue="item-seed">
          <Input placeholder="username" />
        </Form.Item>
      </Form>
    ))

    expect(form.getFieldValue('username')).toBe('item-seed')
    form.setFieldValue('username', 'changed')
    expect((result.getByPlaceholderText('username') as HTMLInputElement).value).toBe('changed')

    form.resetFields()

    expect(form.getFieldValue('username')).toBe('item-seed')
    expect((result.getByPlaceholderText('username') as HTMLInputElement).value).toBe('item-seed')
  })

  it('updates field registration when rules change', async () => {
    const [required, setRequired] = createSignal(false)
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ username: '' }}>
        <Form.Item name="username" rules={required() ? [{ required: true, message: 'Now required' }] : []}>
          <Input placeholder="username" />
        </Form.Item>
      </Form>
    ))

    await expect(form.validateFields()).resolves.toEqual({ username: '' })

    setRequired(true)

    await expect(form.validateFields()).rejects.toMatchObject({ errorFields: [{ name: 'username', errors: ['Now required'] }] })
  })

  it('supports form instance value APIs', async () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form} initialValues={{ username: 'seed' }}>
        <Form.Item name="username">
          <Input placeholder="username" />
        </Form.Item>
      </Form>
    ))

    expect(form.getFieldValue('username')).toBe('seed')
    form.setFieldValue('username', 'changed')
    expect((result.getByPlaceholderText('username') as HTMLInputElement).value).toBe('changed')

    form.setFieldsValue({ username: 'bulk' })
    expect(form.getFieldsValue()).toEqual({ username: 'bulk' })

    form.resetFields()
    expect(form.getFieldValue('username')).toBe('seed')

    await expect(form.validateFields()).resolves.toEqual({ username: 'seed' })
  })
})
