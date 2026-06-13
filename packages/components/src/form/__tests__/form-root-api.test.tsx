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
    const scrollIntoView = vi.fn()
    const focus = vi.fn()
    const originalScrollIntoView = Element.prototype.scrollIntoView
    const originalFocus = HTMLInputElement.prototype.focus
    Element.prototype.scrollIntoView = scrollIntoView
    HTMLInputElement.prototype.focus = focus

    try {
      const result = render(() => (
        <Form scrollToFirstError={{ focus: true }} onFinishFailed={() => undefined}>
          <Form.Item name="username" rules={[{ required: true, message: 'Required' }]}>
            <Input placeholder="username" />
          </Form.Item>
          <Button htmlType="submit">Submit</Button>
        </Form>
      ))

      fireEvent.click(result.getByRole('button', { name: 'Submit' }))

      await waitFor(() => expect(result.getByText('Required')).toBeInTheDocument())
      expect(scrollIntoView).toHaveBeenCalled()
      expect(focus).toHaveBeenCalled()
    } finally {
      Element.prototype.scrollIntoView = originalScrollIntoView
      HTMLInputElement.prototype.focus = originalFocus
    }
  })

  it('clears form values when clearOnDestroy unmounts the final owner', () => {
    const [visible, setVisible] = createSignal(true)
    const [form] = useForm()

    render(() => (
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
    setVisible(false)
    expect(form.getFieldsValue(true)).toEqual({})
  })
})
