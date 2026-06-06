import { fireEvent, render } from '@solidjs/testing-library'
import { For } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { Input } from '../../input'
import { Form } from '../index'

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

  it('adds, removes, and moves fields', () => {
    const result = render(() => (
      <Form initialValues={{ users: [{ name: 'Ada' }] }}>
        <Form.List name="users">
          {(fields, operation) => (
            <>
              <For each={fields()}>
                {(field) => (
                  <span data-testid="field">
                    {field.name}:{field.key}
                  </span>
                )}
              </For>
              <button onClick={() => operation.add({ name: 'Grace' })}>Add</button>
              <button onClick={() => operation.remove(0)}>Remove</button>
              <button onClick={() => operation.move(1, 0)}>Move</button>
            </>
          )}
        </Form.List>
      </Form>
    ))

    fireEvent.click(result.getByText('Add'))
    expect(result.getAllByTestId('field')).toHaveLength(2)

    fireEvent.click(result.getByText('Move'))
    expect(result.getAllByTestId('field')[0]).toHaveTextContent('0:')

    fireEvent.click(result.getByText('Remove'))
    expect(result.getAllByTestId('field')).toHaveLength(1)
  })

  it('renders Form.ErrorList messages', () => {
    const result = render(() => <Form.ErrorList errors={['Broken']} warnings={['Careful']} />)

    expect(result.getByText('Broken')).toBeInTheDocument()
    expect(result.getByText('Careful')).toBeInTheDocument()
  })
})
