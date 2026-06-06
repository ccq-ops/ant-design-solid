import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Input } from '../../input'
import { Form } from '../index'

describe('Form layout props', () => {
  it('applies form layout classes', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="ant">
        <Form layout="vertical" aria-label="profile" />
      </ConfigProvider>
    ))
    expect(result.getByLabelText('profile')).toHaveClass('ant-form-vertical')
  })

  it('renders required mark according to required rules', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="ant">
        <Form requiredMark>
          <Form.Item label="Username" name="username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </ConfigProvider>
    ))

    expect(result.getByText('*')).toBeInTheDocument()
  })

  it('hides required mark when disabled at Form level', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="ant">
        <Form requiredMark={false}>
          <Form.Item label="Username" name="username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Form>
      </ConfigProvider>
    ))

    expect(result.queryByText('*')).not.toBeInTheDocument()
  })

  it('updates required mark when Form requiredMark changes after render', () => {
    const [requiredMark, setRequiredMark] = createSignal(false)
    const result = render(() => (
      <ConfigProvider prefixCls="ant">
        <Form requiredMark={requiredMark()}>
          <Form.Item label="Username" name="username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <button type="button" onClick={() => setRequiredMark(true)}>
            Show marks
          </button>
        </Form>
      </ConfigProvider>
    ))

    expect(result.queryByText('*')).not.toBeInTheDocument()

    fireEvent.click(result.getByRole('button', { name: 'Show marks' }))

    expect(result.getByText('*')).toBeInTheDocument()
  })

  it('renders required mark for function rules that resolve to required', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="ant">
        <Form>
          <Form.Item label="Email" name="email" rules={[() => ({ required: true })]}>
            <Input />
          </Form.Item>
        </Form>
      </ConfigProvider>
    ))

    expect(result.getByText('*')).toBeInTheDocument()
  })

  it('shows optional label for non-required fields', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="ant">
        <Form requiredMark="optional">
          <Form.Item label="Nickname" name="nickname">
            <Input />
          </Form.Item>
        </Form>
      </ConfigProvider>
    ))

    expect(result.getByText('(optional)')).toBeInTheDocument()
  })

  it('allows Form.Item labelAlign and colon to override Form defaults', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="ant">
        <Form labelAlign="right" colon>
          <Form.Item label="Username" labelAlign="left" colon={false}>
            <Input />
          </Form.Item>
        </Form>
      </ConfigProvider>
    ))

    const label = result.getByText('Username').closest('label')
    expect(label).toHaveClass('ant-form-item-label-left')
    expect(label).not.toHaveClass('ant-form-item-label-colon')
  })

  it('renders Form.Item tooltip beside the label', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="ant">
        <Form>
          <Form.Item label="Username" tooltip={<span>Helpful hint</span>}>
            <Input />
          </Form.Item>
        </Form>
      </ConfigProvider>
    ))

    expect(result.getByText('Helpful hint')).toBeInTheDocument()
  })
})
