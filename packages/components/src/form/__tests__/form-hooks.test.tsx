import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal, Show } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { Button } from '../../button'
import { Input } from '../../input'
import { Form, useForm } from '../index'
import type { FormInstance } from '../index'

function InstanceProbe() {
  const form = Form.useFormInstance()
  return <button onClick={() => form.setFieldValue('username', 'Ada')}>Fill</button>
}

function WatchProbe() {
  const username = Form.useWatch('username')
  return <span data-testid="watch">{String(username() ?? '')}</span>
}

function SelectorProbe() {
  const label = Form.useWatch((values) => `${values.first ?? ''}-${values.last ?? ''}`)
  return <span data-testid="selector">{String(label())}</span>
}

function ExplicitFormProbe(props: { form: FormInstance }) {
  const username = Form.useWatch('username', props.form)
  return <span data-testid="explicit-watch">{String(username() ?? '')}</span>
}

function PreserveProbe() {
  const username = Form.useWatch('username')
  return <span data-testid="preserve-watch">{String(username() ?? '')}</span>
}

describe('Form hooks', () => {
  it('Form.useFormInstance returns the parent form', () => {
    const result = render(() => (
      <Form>
        <Form.Item name="username">
          <Input placeholder="username" />
        </Form.Item>
        <InstanceProbe />
      </Form>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Fill' }))

    expect(result.getByPlaceholderText('username')).toHaveValue('Ada')
  })

  it('Form.useWatch reacts to field changes', () => {
    const result = render(() => (
      <Form>
        <Form.Item name="username">
          <Input placeholder="username" />
        </Form.Item>
        <WatchProbe />
      </Form>
    ))

    fireEvent.input(result.getByPlaceholderText('username'), {
      target: { value: 'Ada' },
    })

    expect(result.getByTestId('watch')).toHaveTextContent('Ada')
  })

  it('Form.useWatch supports selector functions', () => {
    const result = render(() => (
      <Form>
        <Form.Item name="first">
          <Input placeholder="first" />
        </Form.Item>
        <Form.Item name="last">
          <Input placeholder="last" />
        </Form.Item>
        <SelectorProbe />
      </Form>
    ))

    fireEvent.input(result.getByPlaceholderText('first'), { target: { value: 'Ada' } })
    fireEvent.input(result.getByPlaceholderText('last'), { target: { value: 'Lovelace' } })

    expect(result.getByTestId('selector')).toHaveTextContent('Ada-Lovelace')
  })

  it('Form.useWatch can watch an explicit form instance', () => {
    const [form] = useForm()
    const result = render(() => (
      <>
        <Form form={form}>
          <Form.Item name="username">
            <Input placeholder="username" />
          </Form.Item>
        </Form>
        <ExplicitFormProbe form={form} />
      </>
    ))

    form.setFieldValue('username', 'Grace')

    expect(result.getByTestId('explicit-watch')).toHaveTextContent('Grace')
  })

  it('Form.useWatch reacts when preserve=false removes a value', () => {
    const [form] = useForm()
    const [visible, setVisible] = createSignal(true)

    const result = render(() => (
      <Form form={form} initialValues={{ username: 'Ada' }}>
        <Show when={visible()}>
          <Form.Item name="username" preserve={false}>
            <Input placeholder="username" />
          </Form.Item>
        </Show>
        <PreserveProbe />
        <Button onClick={() => setVisible(false)}>Hide</Button>
      </Form>
    ))

    expect(result.getByTestId('preserve-watch')).toHaveTextContent('Ada')
    fireEvent.click(result.getByRole('button', { name: 'Hide' }))
    expect(result.getByTestId('preserve-watch')).toHaveTextContent(/^$/)
  })
})
