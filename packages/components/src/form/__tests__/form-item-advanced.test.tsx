import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { createSignal, Show } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { Input } from '../../input'
import { Form, useForm } from '../index'
import type { FormItemControl, ValidateStatus } from '../index'

function StatusProbe() {
  const status = Form.Item.useStatus()
  return (
    <output
      data-testid="status-probe"
      data-status={status.status() ?? ''}
      data-errors={status.errors().join('|')}
      data-warnings={status.warnings().join('|')}
    />
  )
}

describe('Form.Item advanced binding APIs', () => {
  afterEach(() => {
    vi.useRealTimers()
  })
  it('applies getValueFromEvent and normalize before storing the value', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form}>
        <Form.Item
          name="username"
          getValueFromEvent={(event) =>
            (event as Event & { currentTarget: HTMLInputElement }).currentTarget.value
          }
          normalize={(value) => String(value).trim().toUpperCase()}
        >
          <Input placeholder="username" />
        </Form.Item>
      </Form>
    ))

    fireEvent.input(result.getByPlaceholderText('username'), { target: { value: '  ada  ' } })

    expect(form.getFieldValue('username')).toBe('ADA')
  })

  it('exposes getValueProps through render-prop control valueProps', () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form} initialValues={{ visible: true }}>
        <Form.Item
          name="visible"
          valuePropName="checked"
          getValueProps={(value) => ({ checked: Boolean(value), 'data-bound': String(value) })}
        >
          {(control: FormItemControl) => (
            <button
              type="button"
              data-testid="toggle"
              data-checked={String(control.valueProps().checked)}
              data-bound={String(control.valueProps()['data-bound'])}
              onClick={() => control.onChange(false)}
            >
              Toggle
            </button>
          )}
        </Form.Item>
      </Form>
    ))

    expect(result.getByTestId('toggle')).toHaveAttribute('data-checked', 'true')
    expect(result.getByTestId('toggle')).toHaveAttribute('data-bound', 'true')

    fireEvent.click(result.getByTestId('toggle'))

    expect(form.getFieldValue('visible')).toBe(false)
    expect(result.getByTestId('toggle')).toHaveAttribute('data-checked', 'false')
    expect(result.getByTestId('toggle')).toHaveAttribute('data-bound', 'false')
  })

  it('validates only when the control trigger matches validateTrigger', async () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form} initialValues={{ username: 'seed' }}>
        <Form.Item
          name="username"
          validateTrigger="onBlur"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Input placeholder="username" />
        </Form.Item>
      </Form>
    ))
    const input = result.getByPlaceholderText('username')

    fireEvent.input(input, { target: { value: '' } })
    expect(form.getFieldError('username')).toEqual([])
    expect(result.queryByText('Required')).not.toBeInTheDocument()

    fireEvent.blur(input)

    await waitFor(() => expect(form.getFieldError('username')).toEqual(['Required']))
    expect(result.getByText('Required')).toBeInTheDocument()
  })

  it('Form.Item.useStatus exposes status, errors, and warnings reactively', async () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form}>
        <Form.Item name="age">
          <StatusProbe />
        </Form.Item>
      </Form>
    ))

    expect(result.getByTestId('status-probe')).toHaveAttribute('data-status', '')

    form.setFields([{ name: 'age', warnings: ['Young'] }])
    await waitFor(() =>
      expect(result.getByTestId('status-probe')).toHaveAttribute('data-status', 'warning'),
    )
    expect(result.getByTestId('status-probe')).toHaveAttribute('data-warnings', 'Young')

    form.setFields([{ name: 'age', errors: ['Invalid'] }])
    await waitFor(() =>
      expect(result.getByTestId('status-probe')).toHaveAttribute('data-status', 'error'),
    )
    expect(result.getByTestId('status-probe')).toHaveAttribute('data-errors', 'Invalid')

    form.setFields([{ name: 'age', errors: [], validating: true }])
    await waitFor(() =>
      expect(result.getByTestId('status-probe')).toHaveAttribute('data-status', 'validating'),
    )

    form.setFields([{ name: 'age', validating: false }])
    await waitFor(() =>
      expect(result.getByTestId('status-probe')).toHaveAttribute('data-status', 'warning'),
    )
  })

  it('wires validateFirst from Form.Item metadata', async () => {
    const [firstForm] = useForm()
    render(() => (
      <Form form={firstForm} initialValues={{ username: '' }}>
        <Form.Item
          name="username"
          validateFirst
          rules={[{ required: true, message: 'Required' }, { validator: () => 'Second error' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    ))

    await expect(firstForm.validateFields(['username'])).rejects.toMatchObject({
      errorFields: [{ name: ['username'], errors: ['Required'] }],
    })
    expect(firstForm.getFieldError('username')).toEqual(['Required'])

    const [collectForm] = useForm()
    render(() => (
      <Form form={collectForm} initialValues={{ username: '' }}>
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Required' }, { validator: () => 'Second error' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    ))

    await expect(collectForm.validateFields(['username'])).rejects.toMatchObject({
      errorFields: [{ name: ['username'], errors: ['Required', 'Second error'] }],
    })
    expect(collectForm.getFieldError('username')).toEqual(['Required', 'Second error'])
  })

  it('removes values on unmount only when preserve is false', () => {
    const [preservedShown, setPreservedShown] = createSignal(true)
    const [removedShown, setRemovedShown] = createSignal(true)
    const [form] = useForm()
    const result = render(() => (
      <Form form={form} initialValues={{ kept: 'seed', removed: 'seed' }}>
        <Show when={preservedShown()}>
          <Form.Item name="kept">
            <Input placeholder="kept" />
          </Form.Item>
        </Show>
        <Show when={removedShown()}>
          <Form.Item name="removed" preserve={false}>
            <Input placeholder="removed" />
          </Form.Item>
        </Show>
        <Button onClick={() => setPreservedShown(false)}>Hide kept</Button>
        <Button onClick={() => setRemovedShown(false)}>Hide removed</Button>
      </Form>
    ))

    fireEvent.input(result.getByPlaceholderText('kept'), { target: { value: 'typed kept' } })
    fireEvent.input(result.getByPlaceholderText('removed'), { target: { value: 'typed removed' } })

    fireEvent.click(result.getByRole('button', { name: 'Hide kept' }))
    fireEvent.click(result.getByRole('button', { name: 'Hide removed' }))

    expect(form.getFieldValue('kept')).toBe('typed kept')
    expect(form.getFieldValue('removed')).toBeUndefined()
    expect(form.getFieldsValue(true)).toEqual({ kept: 'typed kept' })
  })

  it('revalidates dependency fields when a dependency changes', async () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form} initialValues={{ password: 'secret', confirm: 'secret' }}>
        <Form.Item name="password">
          <Input placeholder="password" />
        </Form.Item>
        <Form.Item
          name="confirm"
          dependencies={['password']}
          rules={[
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (value !== getFieldValue('password')) return 'Passwords do not match'
              },
            }),
          ]}
        >
          <Input placeholder="confirm" />
        </Form.Item>
      </Form>
    ))

    await expect(form.validateFields(['confirm'])).resolves.toEqual({
      password: 'secret',
      confirm: 'secret',
    })
    expect(form.getFieldError('confirm')).toEqual([])

    fireEvent.input(result.getByPlaceholderText('password'), { target: { value: 'changed' } })

    await waitFor(() => expect(form.getFieldError('confirm')).toEqual(['Passwords do not match']))
  })

  it('render-prop controls can provide a source trigger for validation timing', async () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form} initialValues={{ username: 'seed' }}>
        <Form.Item
          name="username"
          validateTrigger="onBlur"
          rules={[{ required: true, message: 'Required' }]}
        >
          {(control: FormItemControl) => (
            <button
              type="button"
              data-testid="blur-control"
              onClick={() => control.setFieldValueFromControl('', 'onChange')}
              onBlur={() => control.setFieldValueFromControl('', 'onBlur')}
            >
              Custom
            </button>
          )}
        </Form.Item>
      </Form>
    ))

    const control = result.getByTestId('blur-control')
    fireEvent.click(control)
    expect(form.getFieldValue('username')).toBe('')
    expect(form.getFieldError('username')).toEqual([])

    fireEvent.blur(control)

    await waitFor(() => expect(form.getFieldError('username')).toEqual(['Required']))
  })

  it('validates on Input blur without firing onValuesChange again', async () => {
    const onValuesChange = vi.fn()
    const result = render(() => (
      <Form initialValues={{ username: 'seed' }} onValuesChange={onValuesChange}>
        <Form.Item
          name="username"
          validateTrigger="onBlur"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Input placeholder="blur username" />
        </Form.Item>
      </Form>
    ))
    const input = result.getByPlaceholderText('blur username')

    fireEvent.input(input, { target: { value: '' } })
    expect(onValuesChange).toHaveBeenCalledTimes(1)
    expect(result.queryByText('Required')).not.toBeInTheDocument()

    fireEvent.blur(input)

    await waitFor(() => expect(result.getByText('Required')).toBeInTheDocument())
    expect(onValuesChange).toHaveBeenCalledTimes(1)
  })

  it('keeps preserve=false field value during reactive metadata updates while mounted', () => {
    const [required, setRequired] = createSignal(false)
    const [form] = useForm()
    const result = render(() => (
      <Form form={form} initialValues={{ username: 'seed' }}>
        <Form.Item
          name="username"
          preserve={false}
          rules={required() ? [{ required: true, message: 'Required' }] : []}
        >
          <Input placeholder="preserve metadata" />
        </Form.Item>
        <Button onClick={() => setRequired(true)}>Require</Button>
      </Form>
    ))

    fireEvent.input(result.getByPlaceholderText('preserve metadata'), {
      target: { value: 'typed' },
    })
    fireEvent.click(result.getByRole('button', { name: 'Require' }))

    expect(form.getFieldValue('username')).toBe('typed')
  })

  it('debounces validation and cancels stale validation timers', async () => {
    vi.useFakeTimers()
    const [form] = useForm()
    const result = render(() => (
      <Form form={form} initialValues={{ username: 'seed' }}>
        <Form.Item
          name="username"
          validateDebounce={100}
          rules={[{ required: true, message: 'Required' }]}
        >
          <Input placeholder="debounced username" />
        </Form.Item>
      </Form>
    ))
    const input = result.getByPlaceholderText('debounced username')

    fireEvent.input(input, { target: { value: '' } })
    await vi.advanceTimersByTimeAsync(99)
    expect(form.getFieldError('username')).toEqual([])

    fireEvent.input(input, { target: { value: 'ok' } })
    await vi.advanceTimersByTimeAsync(99)
    expect(form.getFieldError('username')).toEqual([])

    await vi.advanceTimersByTimeAsync(1)
    await Promise.resolve()

    expect(form.getFieldError('username')).toEqual([])
    await expect(form.validateFields(['username'])).resolves.toEqual({ username: 'ok' })
  })

  it('prefers explicit validateStatus in useStatus', () => {
    const result = render(() => (
      <Form>
        <Form.Item name="field" validateStatus={'success' as ValidateStatus}>
          <StatusProbe />
        </Form.Item>
      </Form>
    ))

    expect(result.getByTestId('status-probe')).toHaveAttribute('data-status', 'success')
  })
})
