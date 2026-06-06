import { render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Input } from '../../input'
import { Form, useForm } from '../index'

describe('FormInstance core parity APIs', () => {
  it('stores nested values by NamePath', () => {
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ user: { email: 'seed@example.com' } }}>
        <Form.Item name={['user', 'email']}>
          <Input />
        </Form.Item>
      </Form>
    ))

    expect(form.getFieldValue(['user', 'email'])).toBe('seed@example.com')

    form.setFieldValue(['user', 'email'], 'next@example.com')

    expect(form.getFieldValue(['user', 'email'])).toBe('next@example.com')
    expect(form.getFieldsValue(true)).toEqual({ user: { email: 'next@example.com' } })
  })

  it('returns registered values by default and selected values by name list', () => {
    const [form] = useForm()
    render(() => (
      <Form
        form={form}
        initialValues={{ user: { email: 'a@example.com', name: 'Ada' }, hidden: 'x' }}
      >
        <Form.Item name={['user', 'email']}>
          <Input />
        </Form.Item>
      </Form>
    ))

    expect(form.getFieldsValue()).toEqual({ user: { email: 'a@example.com' } })
    expect(form.getFieldsValue([['user', 'name']])).toEqual({ user: { name: 'Ada' } })
    expect(form.getFieldsValue(true)).toEqual({
      user: { email: 'a@example.com', name: 'Ada' },
      hidden: 'x',
    })
  })

  it('sets field state through setFields', () => {
    const [form] = useForm()
    render(() => (
      <Form form={form}>
        <Form.Item name="username">
          <Input />
        </Form.Item>
      </Form>
    ))

    form.setFields([
      {
        name: 'username',
        value: 'Ada',
        errors: ['Broken'],
        warnings: ['Careful'],
        touched: true,
        validating: true,
      },
    ])

    expect(form.getFieldValue('username')).toBe('Ada')
    expect(form.getFieldError('username')).toEqual(['Broken'])
    expect(form.getFieldsError()).toEqual([
      { name: ['username'], errors: ['Broken'], warnings: ['Careful'] },
    ])
    expect(form.isFieldTouched('username')).toBe(true)
    expect(form.isFieldsTouched(['username'], true)).toBe(true)
    expect(form.isFieldValidating('username')).toBe(true)
  })

  it('fires onFieldsChange when values and field states change', () => {
    const onFieldsChange = vi.fn()
    const [form] = useForm()
    render(() => (
      <Form form={form} onFieldsChange={onFieldsChange}>
        <Form.Item name="username">
          <Input />
        </Form.Item>
      </Form>
    ))

    form.setFieldValue('username', 'Ada')

    expect(onFieldsChange).toHaveBeenCalledWith(
      [expect.objectContaining({ name: ['username'], value: 'Ada', touched: true })],
      [expect.objectContaining({ name: ['username'], value: 'Ada', touched: true })],
    )

    form.setFields([{ name: 'username', errors: ['Broken'], warnings: ['Careful'] }])

    expect(onFieldsChange).toHaveBeenLastCalledWith(
      [expect.objectContaining({ name: ['username'], errors: ['Broken'], warnings: ['Careful'] })],
      [expect.objectContaining({ name: ['username'], errors: ['Broken'], warnings: ['Careful'] })],
    )
  })

  it('resets nested fields to initial values and clears state', () => {
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ user: { email: 'seed@example.com' } }}>
        <Form.Item name={['user', 'email']}>
          <Input />
        </Form.Item>
      </Form>
    ))

    form.setFields([
      { name: ['user', 'email'], value: 'changed@example.com', errors: ['Bad'], touched: true },
    ])
    form.resetFields([['user', 'email']])

    expect(form.getFieldValue(['user', 'email'])).toBe('seed@example.com')
    expect(form.getFieldError(['user', 'email'])).toEqual([])
    expect(form.isFieldTouched(['user', 'email'])).toBe(false)
  })

  it('validates descendant fields when recursive config is enabled', async () => {
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ user: { email: '' } }}>
        <Form.Item
          name={['user', 'email']}
          rules={[{ required: true, message: 'Email is required' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    ))

    await expect(form.validateFields([['user']], { recursive: true })).rejects.toMatchObject({
      errorFields: [{ name: ['user', 'email'], errors: ['Email is required'] }],
    })
  })

  it('validateOnly rejects without updating stored field errors', async () => {
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ username: '' }}>
        <Form.Item name="username" rules={[{ required: true, message: 'Required' }]}>
          <Input />
        </Form.Item>
      </Form>
    ))

    await expect(form.validateFields(['username'], { validateOnly: true })).rejects.toMatchObject({
      errorFields: [{ name: ['username'], errors: ['Required'] }],
    })
    expect(form.getFieldError('username')).toEqual([])
  })

  it('notifies onFieldsChange when validateFields stores errors', async () => {
    const onFieldsChange = vi.fn()
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ username: '' }} onFieldsChange={onFieldsChange}>
        <Form.Item name="username" rules={[{ required: true, message: 'Required' }]}>
          <Input />
        </Form.Item>
      </Form>
    ))

    await expect(form.validateFields(['username'])).rejects.toMatchObject({
      errorFields: [{ name: ['username'], errors: ['Required'] }],
    })

    expect(onFieldsChange).toHaveBeenCalledWith(
      [expect.objectContaining({ name: ['username'], errors: ['Required'] })],
      [expect.objectContaining({ name: ['username'], errors: ['Required'] })],
    )
  })

  it('notifies validating state changes during async validation', async () => {
    let resolveValidation!: () => void
    const validationPending = new Promise<void>((resolve) => {
      resolveValidation = resolve
    })
    const onFieldsChange = vi.fn()
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ username: 'Ada' }} onFieldsChange={onFieldsChange}>
        <Form.Item
          name="username"
          rules={[
            {
              async validator() {
                await validationPending
              },
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    ))

    const validation = form.validateFields(['username'])

    expect(form.isFieldValidating('username')).toBe(true)
    expect(onFieldsChange).toHaveBeenCalledWith(
      [expect.objectContaining({ name: ['username'], validating: true })],
      [expect.objectContaining({ name: ['username'], validating: true })],
    )

    resolveValidation()
    await expect(validation).resolves.toEqual({ username: 'Ada' })

    expect(form.isFieldValidating('username')).toBe(false)
    expect(onFieldsChange).toHaveBeenCalledWith(
      [expect.objectContaining({ name: ['username'], validating: false })],
      [expect.objectContaining({ name: ['username'], validating: false })],
    )
  })

  it('keeps latest validation result when overlapping validations finish out of order', async () => {
    const resolvers: Array<() => void> = []
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ username: 'bad' }}>
        <Form.Item
          name="username"
          rules={[
            {
              async validator(_, value) {
                await new Promise<void>((resolve) => {
                  resolvers.push(resolve)
                })
                if (value === 'bad') throw new Error('Bad')
              },
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    ))

    const staleValidation = form.validateFields(['username'])
    form.setFieldValue('username', 'good')
    const latestValidation = form.validateFields(['username'])

    resolvers[1]()
    await expect(latestValidation).resolves.toEqual({ username: 'good' })
    expect(form.getFieldError('username')).toEqual([])

    resolvers[0]()
    await expect(staleValidation).rejects.toMatchObject({ outOfDate: true })
    expect(form.getFieldError('username')).toEqual([])
  })

  it('keeps field validating while a newer overlapping validation is pending', async () => {
    const resolvers: Array<() => void> = []
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ username: 'Ada' }}>
        <Form.Item
          name="username"
          rules={[
            {
              async validator() {
                await new Promise<void>((resolve) => {
                  resolvers.push(resolve)
                })
              },
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    ))

    const firstValidation = form.validateFields(['username'])
    const secondValidation = form.validateFields(['username'])

    expect(form.isFieldValidating('username')).toBe(true)
    resolvers[0]()
    await expect(firstValidation).rejects.toMatchObject({ outOfDate: true })
    expect(form.isFieldValidating('username')).toBe(true)

    resolvers[1]()
    await expect(secondValidation).resolves.toEqual({ username: 'Ada' })
    expect(form.isFieldValidating('username')).toBe(false)
  })

  it('does not write stale validation errors after a field remounts', async () => {
    let resolveValidation!: () => void
    const pendingValidation = new Promise<void>((resolve) => {
      resolveValidation = resolve
    })
    const [shown, setShown] = createSignal(true)
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ username: 'bad' }}>
        {shown() && (
          <Form.Item
            name="username"
            rules={[
              {
                async validator() {
                  await pendingValidation
                  throw new Error('Stale')
                },
              },
            ]}
          >
            <Input />
          </Form.Item>
        )}
      </Form>
    ))

    const staleValidation = form.validateFields(['username'])
    setShown(false)
    setShown(true)

    resolveValidation()
    await expect(staleValidation).rejects.toMatchObject({ outOfDate: true })
    expect(form.getFieldError('username')).toEqual([])
  })

  it('cleans up validating state when transform throws', async () => {
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ username: 'Ada' }}>
        <Form.Item
          name="username"
          rules={[
            {
              transform() {
                throw new Error('Boom')
              },
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    ))

    await expect(form.validateFields(['username'])).rejects.toMatchObject({
      errorFields: [{ name: ['username'], errors: ['Boom'] }],
    })
    expect(form.isFieldValidating('username')).toBe(false)
  })

  it('does not expose validating state for validateOnly async validation', async () => {
    let resolveValidation!: () => void
    const pendingValidation = new Promise<void>((resolve) => {
      resolveValidation = resolve
    })
    const onFieldsChange = vi.fn()
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ username: 'Ada' }} onFieldsChange={onFieldsChange}>
        <Form.Item
          name="username"
          rules={[
            {
              async validator() {
                await pendingValidation
              },
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    ))

    const validation = form.validateFields(['username'], { validateOnly: true })

    expect(form.isFieldValidating('username')).toBe(false)
    expect(onFieldsChange).not.toHaveBeenCalled()

    resolveValidation()
    await expect(validation).resolves.toEqual({ username: 'Ada' })
    expect(form.isFieldValidating('username')).toBe(false)
    expect(onFieldsChange).not.toHaveBeenCalled()
  })

  it('does not notify onFieldsChange when validateOnly is true', async () => {
    const onFieldsChange = vi.fn()
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ username: '' }} onFieldsChange={onFieldsChange}>
        <Form.Item name="username" rules={[{ required: true, message: 'Required' }]}>
          <Input />
        </Form.Item>
      </Form>
    ))

    await expect(form.validateFields(['username'], { validateOnly: true })).rejects.toMatchObject({
      errorFields: [{ name: ['username'], errors: ['Required'] }],
    })

    expect(onFieldsChange).not.toHaveBeenCalled()
  })

  it('supports isFieldsTouched allTouched boolean overload', () => {
    const [form] = useForm()
    render(() => (
      <Form form={form}>
        <Form.Item name="first">
          <Input />
        </Form.Item>
        <Form.Item name="second">
          <Input />
        </Form.Item>
      </Form>
    ))

    form.setFields([{ name: 'first', touched: true }])

    expect(form.isFieldsTouched()).toBe(true)
    expect(form.isFieldsTouched(true)).toBe(false)

    form.setFields([{ name: 'second', touched: true }])

    expect(form.isFieldsTouched(true)).toBe(true)
  })

  it('keeps only the active field registered after a reactive name change', () => {
    const [form] = useForm()
    const [fieldName, setFieldName] = createSignal('first')
    render(() => (
      <Form form={form}>
        <Form.Item name={fieldName()}>
          <Input />
        </Form.Item>
      </Form>
    ))

    form.setFieldValue('first', 'a')
    setFieldName('second')
    form.setFieldValue('second', 'b')

    expect(form.getFieldsValue()).toEqual({ second: 'b' })
  })

  it('does not register fields when reading an unregistered field error accessor', async () => {
    const [form] = useForm()
    const accessor = form.getFieldErrorAccessor('ghost')

    expect(accessor()).toEqual([])
    expect(form.getFieldsValue()).toEqual({})
    expect(form.getFieldsError()).toEqual([])
    await expect(form.validateFields()).resolves.toEqual({})
  })

  it('clears descendant validation state when setFieldsValue replaces a parent object', () => {
    const onFieldsChange = vi.fn()
    const [form] = useForm()
    render(() => (
      <Form
        form={form}
        initialValues={{ user: { email: 'seed@example.com' } }}
        onFieldsChange={onFieldsChange}
      >
        <Form.Item name={['user', 'email']}>
          <Input />
        </Form.Item>
      </Form>
    ))

    form.setFields([{ name: ['user', 'email'], errors: ['Bad'] }])
    onFieldsChange.mockClear()

    form.setFieldsValue({ user: {} })

    expect(form.getFieldError(['user', 'email'])).toEqual([])
    expect(onFieldsChange).toHaveBeenCalledWith(
      [expect.objectContaining({ name: ['user', 'email'], errors: [] })],
      [expect.objectContaining({ name: ['user', 'email'], errors: [] })],
    )
  })
})
