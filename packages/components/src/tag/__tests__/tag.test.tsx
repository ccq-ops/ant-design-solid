import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Tag } from '../index'

describe('Tag', () => {
  it('renders children and default classes', () => {
    const result = render(() => <Tag>Open</Tag>)
    const tag = result.getByText('Open')
    expect(tag.className).toContain('ads-tag')
  })

  it('supports color and borderless state', () => {
    const result = render(() => (
      <Tag color="success" bordered={false}>
        Success
      </Tag>
    ))
    const tag = result.getByText('Success')
    expect(tag.className).toContain('ads-tag-success')
    expect(tag.className).toContain('ads-tag-borderless')
  })

  it('supports arbitrary color as inline custom property', () => {
    const result = render(() => <Tag color="#722ed1">Purple</Tag>)
    const tag = result.getByText('Purple') as HTMLElement
    expect(tag.getAttribute('style')).toContain('--ads-tag-custom-color: #722ed1')
    expect(tag.className).toContain('ads-tag-has-color')
  })

  it('calls onClose when closable close button is clicked', () => {
    const onClose = vi.fn()
    const result = render(() => (
      <Tag closable onClose={onClose}>
        Closable
      </Tag>
    ))
    fireEvent.click(result.getByLabelText('Close tag'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('uses custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Tag>Custom</Tag>
      </ConfigProvider>
    ))
    expect(result.getByText('Custom').className).toContain('custom-tag')
  })
})
