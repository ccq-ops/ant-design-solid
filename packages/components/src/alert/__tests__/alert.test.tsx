import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Alert } from '../index'

describe('Alert', () => {
  it('renders message and description', () => {
    const result = render(() => (
      <Alert type="success" message="Saved" description="Everything is safe" />
    ))
    expect(result.getByText('Saved')).toBeTruthy()
    expect(result.getByText('Everything is safe')).toBeTruthy()
    expect(result.container.querySelector('.ads-alert-success')).toBeTruthy()
    expect(result.container.querySelector('.ads-alert-with-description')).toBeTruthy()
  })

  it('renders action and icon when requested', () => {
    const result = render(() => (
      <Alert showIcon message="Warning" action={<button>Retry</button>} />
    ))
    expect(result.getByText('Retry')).toBeTruthy()
    const icon = result.container.querySelector('.ads-alert-icon')
    expect(icon).toBeTruthy()
    expect(icon?.getAttribute('aria-hidden')).toBe('true')
  })

  it('closes and calls close callbacks', () => {
    const onClose = vi.fn()
    const afterClose = vi.fn()
    const result = render(() => (
      <Alert closable message="Close me" onClose={onClose} afterClose={afterClose} />
    ))

    fireEvent.click(result.getByRole('button', { name: 'close alert' }))

    expect(result.queryByText('Close me')).toBeNull()
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(afterClose).toHaveBeenCalledTimes(1)
  })

  it('forwards rest attributes to the alert root', () => {
    const result = render(() => (
      <Alert
        id="custom-alert"
        data-testid="alert-root"
        aria-label="custom alert"
        class="extra"
        classList={{ active: true }}
        message="Attrs"
      />
    ))
    const alert = result.getByTestId('alert-root')

    expect(alert.id).toBe('custom-alert')
    expect(alert.getAttribute('aria-label')).toBe('custom alert')
    expect(alert.className).toContain('extra')
    expect(alert.className).toContain('active')
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
