import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Badge } from '../index'

describe('Badge', () => {
  it('renders count', () => {
    const result = render(() => <Badge count={5} />)
    expect(result.getByText('5').className).toContain('ads-badge-count')
  })

  it('handles overflow count', () => {
    const result = render(() => <Badge count={120} overflowCount={99} />)
    expect(result.getByText('99+')).toBeInTheDocument()
  })

  it('hides zero by default and shows zero with showZero', () => {
    const hidden = render(() => <Badge count={0} />)
    expect(hidden.queryByText('0')).toBeNull()
    hidden.unmount()

    const visible = render(() => <Badge count={0} showZero />)
    expect(visible.getByText('0')).toBeInTheDocument()
  })

  it('renders dot mode', () => {
    const result = render(() => <Badge dot count={9} />)
    expect(result.container.querySelector('.ads-badge-dot')).not.toBeNull()
    expect(result.queryByText('9')).toBeNull()
  })

  it('renders status with text', () => {
    const result = render(() => <Badge status="success" text="Active" />)
    expect(result.getByText('Active')).toBeInTheDocument()
    expect(result.container.querySelector('.ads-badge-status-success')).not.toBeNull()
  })

  it('renders wrapped children mode', () => {
    const result = render(() => (
      <Badge count={3}>
        <button>Inbox</button>
      </Badge>
    ))
    expect(result.getByRole('button', { name: 'Inbox' })).toBeInTheDocument()
    expect(result.getByText('3')).toBeInTheDocument()
    expect(result.container.firstElementChild?.className).toContain('ads-badge')
  })

  it('uses custom prefix from ConfigProvider', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Badge count={1} />
      </ConfigProvider>
    ))
    expect(result.getByText('1').className).toContain('custom-badge-count')
  })
})
