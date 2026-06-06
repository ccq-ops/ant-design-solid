import { render } from '@solidjs/testing-library'
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
})
