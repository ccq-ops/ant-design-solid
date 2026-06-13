import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { Input } from '../../input'
import { Form } from '../index'

describe('Form.Provider', () => {
  it('notifies named form field changes with changed fields and forms map', () => {
    const onFormChange = vi.fn()
    const result = render(() => (
      <Form.Provider onFormChange={onFormChange}>
        <Form name="profile">
          <Form.Item name="username">
            <Input placeholder="username" />
          </Form.Item>
        </Form>
      </Form.Provider>
    ))

    fireEvent.input(result.getByPlaceholderText('username'), { target: { value: 'Ada' } })

    expect(onFormChange).toHaveBeenCalledWith(
      'profile',
      expect.objectContaining({
        changedFields: [expect.objectContaining({ name: ['username'], value: 'Ada' })],
        forms: expect.objectContaining({ profile: expect.any(Object) }),
      }),
    )
  })

  it('notifies named form finish with submitted values and forms map', () => {
    const onFormFinish = vi.fn()
    const result = render(() => (
      <Form.Provider onFormFinish={onFormFinish}>
        <Form name="profile" initialValues={{ username: 'Ada' }}>
          <Form.Item name="username">
            <Input />
          </Form.Item>
          <Button htmlType="submit">Submit</Button>
        </Form>
      </Form.Provider>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    return waitFor(() =>
      expect(onFormFinish).toHaveBeenCalledWith(
        'profile',
        expect.objectContaining({
          values: { username: 'Ada' },
          forms: expect.objectContaining({ profile: expect.any(Object) }),
        }),
      ),
    )
  })
})
