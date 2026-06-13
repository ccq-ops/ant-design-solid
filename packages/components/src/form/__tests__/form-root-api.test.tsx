import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { createSignal, Show } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { Input } from '../../input'
import { Form, useForm } from '../index'

describe('Form root v6 APIs', () => {
  it('applies semantic root class and style with Solid class prop', () => {
    const result = render(() => (
      <Form
        aria-label="semantic"
        class="outer-form"
        classNames={{ root: 'semantic-root' }}
        styles={{ root: { color: 'rgb(1, 2, 3)' } }}
      />
    ))

    const form = result.getByLabelText('semantic')
    expect(form).toHaveClass('outer-form')
    expect(form).toHaveClass('semantic-root')
    expect(form).toHaveStyle({ color: 'rgb(1, 2, 3)' })
  })

  it('preserves string style on the root element', () => {
    const result = render(() => <Form aria-label="styled" style="display: none;" />)

    expect(result.getByLabelText('styled')).toHaveAttribute('style', 'display: none;')
  })

  it('renders no form element when component is false', () => {
    const result = render(() => (
      <Form component={false}>
        <Form.Item name="username">
          <Input placeholder="username" />
        </Form.Item>
      </Form>
    ))

    expect(result.container.querySelector('form')).toBeNull()
    expect(result.getByPlaceholderText('username')).toBeInTheDocument()
  })

  it('renders a custom root element when component is provided', () => {
    const result = render(() => (
      <Form component="section" aria-label="custom-root">
        <Form.Item name="username">
          <Input />
        </Form.Item>
      </Form>
    ))

    expect(result.getByLabelText('custom-root').tagName).toBe('SECTION')
  })

  it('scrolls and focuses the first error field on failed submit', async () => {
    const result = render(() => (
      <Form scrollToFirstError={{ focus: true }} onFinishFailed={() => undefined}>
        <Form.Item name="username" rules={[{ required: true, message: 'Required' }]}>
          <Input placeholder="username" />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))
    const input = result.getByPlaceholderText('username') as HTMLInputElement
    const fieldElement = input.closest('.ads-form-item') as HTMLElement | null
    const scrollIntoView = vi.fn()
    const focus = vi.fn()
    const originalScrollIntoView = fieldElement?.scrollIntoView
    const originalFocus = input.focus

    expect(fieldElement).toBeInstanceOf(HTMLElement)
    fieldElement!.scrollIntoView = scrollIntoView
    input.focus = focus

    try {
      fireEvent.click(result.getByRole('button', { name: 'Submit' }))

      await waitFor(() => expect(result.getByText('Required')).toBeInTheDocument())
      expect(scrollIntoView).toHaveBeenCalled()
      expect(focus).toHaveBeenCalled()
    } finally {
      fieldElement!.scrollIntoView = originalScrollIntoView ?? Element.prototype.scrollIntoView
      input.focus = originalFocus
    }
  })

  it('clears form values when clearOnDestroy unmounts the final owner', () => {
    const [visible, setVisible] = createSignal(true)
    const [form] = useForm()

    const result = render(() => (
      <>
        <Show when={visible()}>
          <Form form={form} clearOnDestroy initialValues={{ username: 'Ada' }}>
            <Form.Item name="username">
              <Input />
            </Form.Item>
          </Form>
        </Show>
        <button type="button" onClick={() => setVisible(false)}>
          Hide
        </button>
      </>
    ))

    expect(form.getFieldsValue(true)).toEqual({ username: 'Ada' })
    fireEvent.click(result.getByRole('button', { name: 'Hide' }))
    expect(form.getFieldsValue(true)).toEqual({})
  })

  it('does not clear a shared form instance until the final owner unmounts', () => {
    const [firstVisible, setFirstVisible] = createSignal(true)
    const [secondVisible, setSecondVisible] = createSignal(true)
    const [form] = useForm()

    const result = render(() => (
      <>
        <Show when={firstVisible()}>
          <Form form={form} clearOnDestroy initialValues={{ username: 'Ada' }}>
            <Form.Item name="username">
              <Input />
            </Form.Item>
          </Form>
        </Show>
        <Show when={secondVisible()}>
          <Form form={form} clearOnDestroy>
            <Form.Item name="username">
              <Input />
            </Form.Item>
          </Form>
        </Show>
        <button type="button" onClick={() => setFirstVisible(false)}>
          Hide first
        </button>
        <button type="button" onClick={() => setSecondVisible(false)}>
          Hide second
        </button>
      </>
    ))

    expect(form.getFieldsValue(true)).toEqual({ username: 'Ada' })
    fireEvent.click(result.getByRole('button', { name: 'Hide first' }))
    expect(form.getFieldsValue(true)).toEqual({ username: 'Ada' })
    fireEvent.click(result.getByRole('button', { name: 'Hide second' }))
    expect(form.getFieldsValue(true)).toEqual({})
  })
})
