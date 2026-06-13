import { StyleProvider, createCache, extractStyle } from '@ant-design-solid/cssinjs'
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

  it('centers horizontal labels with controls and Ant Design label spacing', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <ConfigProvider prefixCls="ant">
          <Form layout="horizontal">
            <Form.Item label="Username">
              <Input />
            </Form.Item>
          </Form>
        </ConfigProvider>
      </StyleProvider>
    ))

    const css = extractStyle(cache)
    expect(css).toContain(
      '.ant-form-horizontal .ant-form-item{align-items:flex-start;display:flex;gap:0;',
    )
    expect(css).toContain(
      '.ant-form-horizontal .ant-form-item-label{align-items:center;display:inline-flex;height:32px;margin-bottom:0;',
    )
    expect(css).toContain(
      '.ant-form-item-label-colon .ant-form-item-label-content::after{content:":";margin-inline-end:8px;margin-inline-start:2px;',
    )
  })

  it('places vertical labels at top left with Ant Design vertical spacing', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <ConfigProvider prefixCls="ant">
          <Form layout="vertical">
            <Form.Item label="Username">
              <Input />
            </Form.Item>
          </Form>
        </ConfigProvider>
      </StyleProvider>
    ))

    const css = extractStyle(cache)
    expect(css).toContain('.ant-form-vertical .ant-form-item{align-items:flex-start;display:block;')
    expect(css).toContain(
      '.ant-form-vertical .ant-form-item-label{display:flex;height:auto;justify-content:flex-start;margin:0;padding:0 0 8px;text-align:left;white-space:initial;',
    )
    expect(css).toContain(
      '.ant-form-vertical .ant-form-item-label-colon .ant-form-item-label-content::after{visibility:hidden;',
    )
  })

  it('centers inline labels with controls', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <ConfigProvider prefixCls="ant">
          <Form layout="inline">
            <Form.Item label="Field name">
              <Input />
            </Form.Item>
          </Form>
        </ConfigProvider>
      </StyleProvider>
    ))

    const css = extractStyle(cache)
    expect(css).toContain(
      '.ant-form-inline .ant-form-item{align-items:flex-start;display:flex;margin-bottom:0;',
    )
    expect(css).toContain(
      '.ant-form-inline .ant-form-item-label{align-items:center;display:inline-flex;height:32px;margin-bottom:0;',
    )
  })

  it('keeps vertical labels left aligned even when labelAlign defaults to right', () => {
    const cache = createCache()
    const result = render(() => (
      <StyleProvider cache={cache}>
        <ConfigProvider prefixCls="ant">
          <Form layout="vertical">
            <Form.Item label="Field name">
              <Input />
            </Form.Item>
          </Form>
        </ConfigProvider>
      </StyleProvider>
    ))

    const label = result.getByText('Field name').closest('label')
    expect(label).toHaveClass('ant-form-item-label-right')

    const css = extractStyle(cache)
    expect(css).toContain(
      '.ant-form-vertical .ant-form-item-label{display:flex;height:auto;justify-content:flex-start;margin:0;padding:0 0 8px;text-align:left;',
    )
  })

  it('renders required mark as an Ant Design-style label pseudo element', () => {
    const cache = createCache()
    const result = render(() => (
      <StyleProvider cache={cache}>
        <ConfigProvider prefixCls="ant">
          <Form requiredMark>
            <Form.Item label="Username" name="username" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Form>
        </ConfigProvider>
      </StyleProvider>
    ))

    expect(result.getByText('Username').closest('label')).toHaveClass('ant-form-item-required')
    expect(result.queryByText('*')).not.toBeInTheDocument()

    const css = extractStyle(cache)
    expect(css).toContain(
      '.ant-form-item-label.ant-form-item-required::before{color:#ff4d4f;content:"*";display:inline-block;font-family:sans-serif;font-size:14px;line-height:1;margin-inline-end:4px;',
    )
  })

  it('uses Ant Design Form token defaults for label color and control height', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <ConfigProvider prefixCls="ant">
          <Form>
            <Form.Item label="Username">
              <Input />
            </Form.Item>
          </Form>
        </ConfigProvider>
      </StyleProvider>
    ))

    const css = extractStyle(cache)
    expect(css).toContain('.ant-form-item-label{color:rgba(0,0,0,0.88);font-size:14px;')
    expect(css).toContain(
      '.ant-form-item-control-input{align-items:center;display:flex;min-height:32px;',
    )
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

    expect(result.getByText('Username').closest('label')).toHaveClass('ant-form-item-required')
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

    expect(result.getByText('Email').closest('label')).toHaveClass('ant-form-item-required')
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
