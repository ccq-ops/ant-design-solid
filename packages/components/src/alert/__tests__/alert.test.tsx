import { StyleProvider, createCache, extractStyle } from '@solid-ant-design/cssinjs'
import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { darkAlgorithm } from '@solid-ant-design/theme'
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

  it('centers icon and content for icon-only alerts', () => {
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache}>
        <Alert showIcon message="Centered" />
      </StyleProvider>
    ))

    expect(extractStyle(cache)).toContain('align-items:center;')
  })

  it('updates styles when ConfigProvider theme changes to dark', async () => {
    const cache = createCache()
    const [dark, setDark] = createSignal(false)
    render(() => (
      <StyleProvider cache={cache}>
        <ConfigProvider theme={dark() ? { algorithm: darkAlgorithm } : {}}>
          <Alert showIcon type="success" message="Theme aware" />
        </ConfigProvider>
      </StyleProvider>
    ))

    expect(extractStyle(cache)).toContain('background:#f6ffed;')

    setDark(true)
    await Promise.resolve()

    expect(extractStyle(cache)).toContain('background:rgba(82, 196, 26, 0.12);')
  })

  it('renders action and icon from the icons package when requested', () => {
    const result = render(() => (
      <Alert showIcon type="warning" message="Warning" action={<button>Retry</button>} />
    ))
    expect(result.getByText('Retry')).toBeTruthy()
    const icon = result.container.querySelector('.ads-alert-icon')
    expect(icon).toBeTruthy()
    const svg = icon?.querySelector('svg')
    expect(svg).toBeTruthy()
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
    expect(icon?.textContent).toBe('')
  })

  it('renders a close icon from the icons package when closable', () => {
    const result = render(() => <Alert closable message="Close me" />)
    const closeButton = result.getByRole('button', { name: 'close alert' })
    const svg = closeButton.querySelector('svg')

    expect(svg).toBeTruthy()
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
    expect(closeButton.textContent).toBe('')
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

  it('renders title in preference to legacy message', () => {
    const result = render(() => <Alert title="New title" message="Legacy message" />)

    expect(result.getByText('New title')).toBeTruthy()
    expect(result.queryByText('Legacy message')).toBeNull()
  })

  it('supports closable object callbacks custom icon and aria attributes', () => {
    const onClose = vi.fn()
    const afterClose = vi.fn()
    const result = render(() => (
      <Alert
        message="Object closable"
        closable={{
          'aria-label': 'dismiss alert',
          closeIcon: <span>Dismiss</span>,
          onClose,
          afterClose,
        }}
      />
    ))

    const closeButton = result.getByRole('button', { name: 'dismiss alert' })
    expect(closeButton.textContent).toBe('Dismiss')

    fireEvent.click(closeButton)

    expect(result.queryByText('Object closable')).toBeNull()
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(afterClose).toHaveBeenCalledTimes(1)
  })

  it('renders a custom icon when showIcon is enabled', () => {
    const result = render(() => (
      <Alert showIcon message="Custom icon" icon={<span data-testid="custom-icon">!</span>} />
    ))

    expect(result.getByTestId('custom-icon')).toBeTruthy()
  })

  it('uses banner defaults for type and icon visibility', () => {
    const result = render(() => <Alert banner message="Banner warning" />)
    const alert = result.getByRole('alert')

    expect(alert.className).toContain('ads-alert-banner')
    expect(alert.className).toContain('ads-alert-warning')
    expect(result.container.querySelector('.ads-alert-icon')).toBeTruthy()
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

  it('supports v6 variant rootClass prefixCls and semantic classNames/styles', () => {
    const result = render(() => (
      <Alert
        prefixCls="custom-alert"
        rootClass="root-extra"
        variant="filled"
        showIcon
        title="Semantic title"
        description="Semantic description"
        action={<button>Act</button>}
        closable
        classNames={{
          root: 'slot-root',
          icon: 'slot-icon',
          section: 'slot-section',
          title: 'slot-title',
          description: 'slot-description',
          actions: 'slot-actions',
          close: 'slot-close',
        }}
        styles={{
          root: { 'margin-top': '4px' },
          icon: { color: 'rgb(1, 2, 3)' },
          section: { 'min-width': '12px' },
          title: { 'font-weight': 600 },
          description: { color: 'rgb(4, 5, 6)' },
          actions: { 'margin-left': '8px' },
          close: { color: 'rgb(7, 8, 9)' },
        }}
      />
    ))

    const alert = result.getByRole('alert')
    expect(alert.className).toContain('custom-alert-filled')
    expect(alert.className).toContain('root-extra')
    expect(alert.className).toContain('slot-root')
    expect(alert.style.marginTop).toBe('4px')
    expect(result.container.querySelector('.custom-alert-icon.slot-icon')).toBeTruthy()
    expect(result.container.querySelector('.custom-alert-section.slot-section')).toBeTruthy()
    expect(result.container.querySelector('.custom-alert-title.slot-title')).toBeTruthy()
    expect(
      result.container.querySelector('.custom-alert-description.slot-description'),
    ).toBeTruthy()
    expect(result.container.querySelector('.custom-alert-actions.slot-actions')).toBeTruthy()
    expect(result.container.querySelector('.custom-alert-close-icon.slot-close')).toBeTruthy()
  })

  it('supports semantic classNames and styles functions', () => {
    const result = render(() => (
      <Alert
        type="success"
        title="Function semantic"
        classNames={({ props }) => ({ root: `slot-${props.type}` })}
        styles={({ props }) => ({ root: { opacity: props.type === 'success' ? 0.5 : 1 } })}
      />
    ))

    const alert = result.getByRole('alert')
    expect(alert.className).toContain('slot-success')
    expect(alert.style.opacity).toBe('0.5')
  })

  it('uses Alert ConfigProvider defaults for variant closable and icons', () => {
    const result = render(() => (
      <ConfigProvider
        alert={{
          variant: 'filled',
          closable: { closeIcon: <span>Global close</span>, 'aria-label': 'global close' },
          successIcon: <span data-testid="success-icon">S</span>,
          classNames: { root: 'global-root' },
          styles: { root: { 'padding-top': '3px' } },
        }}
      >
        <Alert showIcon type="success" title="Configured" />
      </ConfigProvider>
    ))

    const alert = result.getByRole('alert')
    expect(alert.className).toContain('ads-alert-filled')
    expect(alert.className).toContain('global-root')
    expect(alert.style.paddingTop).toBe('3px')
    expect(result.getByTestId('success-icon')).toBeTruthy()
    expect(result.getByRole('button', { name: 'global close' }).textContent).toBe('Global close')
  })

  it('supports deprecated closeText and closeIcon compatibility', () => {
    const closeTextResult = render(() => <Alert title="Close text" closeText="Dismiss" />)
    expect(closeTextResult.getByRole('button', { name: 'close alert' }).textContent).toBe('Dismiss')
    closeTextResult.unmount()

    const closeIconResult = render(() => <Alert title="Close icon" closeIcon={<span>X</span>} />)
    expect(closeIconResult.getByRole('button', { name: 'close alert' }).textContent).toBe('X')
  })

  it('lets closable config override top-level and global close callbacks', () => {
    const topLevelOnClose = vi.fn()
    const topLevelAfterClose = vi.fn()
    const configOnClose = vi.fn()
    const configAfterClose = vi.fn()
    const result = render(() => (
      <ConfigProvider alert={{ closable: { closeIcon: <span>Global</span> } }}>
        <Alert
          title="Callback precedence"
          closeText="Top"
          onClose={topLevelOnClose}
          afterClose={topLevelAfterClose}
          closable={{
            closeIcon: <span>Local</span>,
            onClose: configOnClose,
            afterClose: configAfterClose,
          }}
        />
      </ConfigProvider>
    ))

    const button = result.getByRole('button', { name: 'close alert' })
    expect(button.textContent).toBe('Local')
    fireEvent.click(button)

    expect(configOnClose).toHaveBeenCalledTimes(1)
    expect(configAfterClose).toHaveBeenCalledTimes(1)
    expect(topLevelOnClose).not.toHaveBeenCalled()
    expect(topLevelAfterClose).not.toHaveBeenCalled()
  })

  it('allows role override', () => {
    const result = render(() => <Alert role="status" title="Status alert" />)
    expect(result.getByRole('status')).toBeTruthy()
  })

  it('exposes Alert.ErrorBoundary', () => {
    const Broken = () => {
      throw new Error('Boom')
    }
    const result = render(() => (
      <Alert.ErrorBoundary title="Custom error" description="Details">
        <Broken />
      </Alert.ErrorBoundary>
    ))

    expect(result.getByText('Custom error')).toBeTruthy()
    expect(result.getByText('Details')).toBeTruthy()
    expect(result.container.querySelector('.ads-alert-error')).toBeTruthy()
  })
})
