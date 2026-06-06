import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
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
