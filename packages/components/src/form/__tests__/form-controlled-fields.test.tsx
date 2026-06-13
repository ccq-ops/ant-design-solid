import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Input } from '../../input'
import { Form } from '../index'
import type { FieldData } from '../index'

describe('Form controlled fields', () => {
  it('hydrates field values and errors from fields prop', () => {
    const [fields, setFields] = createSignal<FieldData[]>([
      { name: 'username', value: 'Ada', errors: ['Broken'], touched: true },
    ])

    const result = render(() => (
      <>
        <Form fields={fields()}>
          <Form.Item name="username">
            <Input placeholder="username" />
          </Form.Item>
        </Form>
        <button
          type="button"
          onClick={() => setFields([{ name: 'username', value: 'Grace', errors: [] }])}
        >
          Update
        </button>
      </>
    ))

    expect(result.getByPlaceholderText('username')).toHaveValue('Ada')
    expect(result.getByText('Broken')).toBeInTheDocument()

    fireEvent.click(result.getByRole('button', { name: 'Update' }))

    expect(result.getByPlaceholderText('username')).toHaveValue('Grace')
    expect(result.queryByText('Broken')).not.toBeInTheDocument()
  })

  it('emits onFieldsChange when users edit controlled fields', () => {
    const onFieldsChange = vi.fn()
    const result = render(() => (
      <Form fields={[{ name: 'username', value: 'Ada' }]} onFieldsChange={onFieldsChange}>
        <Form.Item name="username">
          <Input placeholder="username" />
        </Form.Item>
      </Form>
    ))

    fireEvent.input(result.getByPlaceholderText('username'), { target: { value: 'Grace' } })

    expect(onFieldsChange).toHaveBeenCalledWith(
      [expect.objectContaining({ name: ['username'], value: 'Grace' })],
      [expect.objectContaining({ name: ['username'], value: 'Grace' })],
    )
  })
})
