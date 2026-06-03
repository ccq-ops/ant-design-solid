import { render } from '@solidjs/testing-library'
import { describe, expect, test } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Result } from '../index'

describe('Result', () => {
  test('renders default info result content', () => {
    const result = render(() => <Result title="Information" subTitle="Helpful details" />)

    expect(result.getByText('Information')).toBeTruthy()
    expect(result.getByText('Helpful details')).toBeTruthy()
    expect(result.container.querySelector('.ads-result-info')).toBeTruthy()
    expect(result.container.querySelector('.ads-result-icon')).toHaveTextContent('ℹ')
  })

  test('renders status classes for common and http statuses', () => {
    const success = render(() => <Result status="success" title="Done" />)
    expect(success.container.querySelector('.ads-result-success')).toBeTruthy()

    const error = render(() => <Result status="error" title="Failed" />)
    expect(error.container.querySelector('.ads-result-error')).toBeTruthy()

    const warning = render(() => <Result status="warning" title="Careful" />)
    expect(warning.container.querySelector('.ads-result-warning')).toBeTruthy()

    const notFound = render(() => <Result status="404" title="Missing" />)
    expect(notFound.container.querySelector('.ads-result-404')).toBeTruthy()
  })

  test('supports custom icon extra and children', () => {
    const result = render(() => (
      <Result
        icon={<span data-testid="rocket">🚀</span>}
        title="Launched"
        subTitle="Everything is ready"
        extra={<button type="button">Continue</button>}
      >
        <div>More details</div>
      </Result>
    ))

    expect(result.getByTestId('rocket')).toBeTruthy()
    expect(result.getByRole('button', { name: 'Continue' })).toBeTruthy()
    expect(result.getByText('More details')).toBeTruthy()
  })

  test('supports custom and config provider prefixes', () => {
    const custom = render(() => <Result prefixCls="custom-result" title="Custom" />)
    expect(custom.container.querySelector('.custom-result')).toBeTruthy()

    const configured = render(() => (
      <ConfigProvider prefixCls="corp">
        <Result title="Configured" />
      </ConfigProvider>
    ))
    expect(configured.container.querySelector('.corp-result')).toBeTruthy()
  })
})
