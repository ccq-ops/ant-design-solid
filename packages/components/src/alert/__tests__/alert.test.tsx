import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Alert } from '../index'

describe('Alert', () => {
  it('renders message and description', () => {
    const result = render(() => <Alert type="success" message="Saved" description="Everything is safe" />)
    expect(result.getByText('Saved')).toBeTruthy()
    expect(result.getByText('Everything is safe')).toBeTruthy()
    expect(result.container.querySelector('.ant-alert-success')).toBeTruthy()
    expect(result.container.querySelector('.ant-alert-with-description')).toBeTruthy()
  })

  it('renders action and icon when requested', () => {
    const result = render(() => <Alert showIcon message="Warning" action={<button>Retry</button>} />)
    expect(result.getByText('Retry')).toBeTruthy()
    expect(result.container.querySelector('.ant-alert-icon')).toBeTruthy()
  })

  it('closes and calls close callbacks', () => {
    const onClose = vi.fn()
    const afterClose = vi.fn()
    const result = render(() => <Alert closable message="Close me" onClose={onClose} afterClose={afterClose} />)

    fireEvent.click(result.getByRole('button', { name: 'close alert' }))

    expect(result.queryByText('Close me')).toBeNull()
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(afterClose).toHaveBeenCalledTimes(1)
  })

  it('supports ConfigProvider prefixCls', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Alert message="Prefixed" />
      </ConfigProvider>
    ))
    expect(result.container.querySelector('.custom-alert')).toBeTruthy()
  })
})
