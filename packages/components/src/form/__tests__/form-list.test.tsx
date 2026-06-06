import { fireEvent, render } from '@solidjs/testing-library'
import { For } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { Input } from '../../input'
import { Form } from '../index'
import type { FieldMeta, FormInstance } from '../index'

function listFieldTexts(result: ReturnType<typeof render>) {
  return result.getAllByTestId('field').map((field) => field.textContent ?? '')
}

function countActiveRegistrations(form: FormInstance) {
  const originalRegisterField = form.registerField
  let activeRegistrations = 0
  form.registerField = (meta: FieldMeta) => {
    activeRegistrations += 1
    const unregister = originalRegisterField(meta)
    let unregistered = false
    return () => {
      if (unregistered) return
      unregistered = true
      activeRegistrations -= 1
      unregister()
    }
  }
  return () => activeRegistrations
}

describe('Form.List', () => {
  it('submits nested array values', () => {
    const onFinish = vi.fn()
    const result = render(() => (
      <Form onFinish={onFinish} initialValues={{ users: [{ name: 'Ada' }] }}>
        <Form.List name="users">
          {(fields) => (
            <For each={fields()}>
              {(field) => (
                <Form.Item name={[field.name, 'name']}>
                  <Input aria-label={`user-${field.name}`} />
                </Form.Item>
              )}
            </For>
          )}
        </Form.List>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))

    fireEvent.input(result.getByLabelText('user-0'), { target: { value: 'Grace' } })
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ users: [{ name: 'Grace' }] })
  })

  it('adds fields and submits list values', () => {
    const onFinish = vi.fn()
    const result = render(() => (
      <Form initialValues={{ users: [{ name: 'Ada' }] }} onFinish={onFinish}>
        <Form.List name="users">
          {(fields, operation) => (
            <>
              <For each={fields()}>
                {(field) => (
                  <Form.Item name={[field.name, 'name']}>
                    <Input aria-label={`user-${field.name}`} />
                  </Form.Item>
                )}
              </For>
              <button type="button" onClick={() => operation.add({ name: 'Grace' })}>
                Add
              </button>
              <Button htmlType="submit">Submit</Button>
            </>
          )}
        </Form.List>
      </Form>
    ))

    fireEvent.click(result.getByText('Add'))
    expect(result.getAllByRole('textbox')).toHaveLength(2)
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ users: [{ name: 'Ada' }, { name: 'Grace' }] })
  })

  it('removes a field and submits without stale values from old indexes', () => {
    const onFinish = vi.fn()
    const result = render(() => (
      <Form initialValues={{ users: [{ name: 'Ada' }, { name: 'Grace' }] }} onFinish={onFinish}>
        <Form.List name="users">
          {(fields, operation) => (
            <>
              <For each={fields()}>
                {(field) => (
                  <Form.Item name={[field.name, 'name']}>
                    <Input aria-label={`user-${field.name}`} />
                  </Form.Item>
                )}
              </For>
              <button type="button" onClick={() => operation.remove(0)}>
                Remove first
              </button>
              <Button htmlType="submit">Submit</Button>
            </>
          )}
        </Form.List>
      </Form>
    ))

    fireEvent.click(result.getByText('Remove first'))
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ users: [{ name: 'Grace' }] })
  })

  it('moves a field and submits reordered values', () => {
    const onFinish = vi.fn()
    const result = render(() => (
      <Form initialValues={{ users: [{ name: 'Ada' }, { name: 'Grace' }] }} onFinish={onFinish}>
        <Form.List name="users">
          {(fields, operation) => (
            <>
              <For each={fields()}>
                {(field) => (
                  <Form.Item name={[field.name, 'name']}>
                    <Input aria-label={`user-${field.name}`} />
                  </Form.Item>
                )}
              </For>
              <button type="button" onClick={() => operation.move(1, 0)}>
                Move second first
              </button>
              <Button htmlType="submit">Submit</Button>
            </>
          )}
        </Form.List>
      </Form>
    ))

    fireEvent.click(result.getByText('Move second first'))
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ users: [{ name: 'Grace' }, { name: 'Ada' }] })
  })

  it('moves stable keys with their values', () => {
    const result = render(() => (
      <Form initialValues={{ users: [{ name: 'Ada' }, { name: 'Grace' }] }}>
        <Form.List name="users">
          {(fields, operation) => (
            <>
              <For each={fields()}>
                {(field) => (
                  <Form.Item noStyle name={[field.name, 'name']}>
                    {(control) => (
                      <span data-testid="field">
                        {field.name}:{field.key}:{String(control.value())}
                      </span>
                    )}
                  </Form.Item>
                )}
              </For>
              <button type="button" onClick={() => operation.move(1, 0)}>
                Move second first
              </button>
            </>
          )}
        </Form.List>
      </Form>
    ))

    const beforeMove = listFieldTexts(result)
    const adaKey = beforeMove[0].split(':')[1]
    const graceKey = beforeMove[1].split(':')[1]

    fireEvent.click(result.getByText('Move second first'))

    expect(listFieldTexts(result)).toEqual([`0:${graceKey}:Grace`, `1:${adaKey}:Ada`])
  })

  it('cleans list item registrations when fields are removed', () => {
    const [form] = Form.useForm()
    const activeRegistrations = countActiveRegistrations(form)
    const result = render(() => (
      <Form form={form} initialValues={{ users: [{ name: 'Ada' }, { name: 'Grace' }] }}>
        <Form.List name="users">
          {(fields, operation) => (
            <>
              <For each={fields()}>
                {(field) => (
                  <Form.Item name={[field.name, 'name']}>
                    <Input aria-label={`user-${field.name}`} />
                  </Form.Item>
                )}
              </For>
              <button type="button" onClick={() => operation.remove(0)}>
                Remove first
              </button>
            </>
          )}
        </Form.List>
      </Form>
    ))

    expect(activeRegistrations()).toBe(2)

    fireEvent.click(result.getByText('Remove first'))

    expect(activeRegistrations()).toBe(1)
  })

  it('renders Form.ErrorList messages', () => {
    const result = render(() => <Form.ErrorList errors={['Broken']} warnings={['Careful']} />)

    expect(result.getByText('Broken')).toBeInTheDocument()
    expect(result.getByText('Careful')).toBeInTheDocument()
  })

  it('exposes list-level rule errors through meta and Form.ErrorList', async () => {
    const onFinishFailed = vi.fn()
    const result = render(() => (
      <Form initialValues={{ users: [] }} onFinishFailed={onFinishFailed}>
        <Form.List name="users" rules={[{ required: true, message: 'Add at least one user' }]}>
          {(_, __, meta) => (
            <>
              <Form.ErrorList errors={meta.errors} />
              <Button htmlType="submit">Submit</Button>
            </>
          )}
        </Form.List>
      </Form>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinishFailed).toHaveBeenCalled()
    expect(result.getByText('Add at least one user')).toBeInTheDocument()
  })
})
