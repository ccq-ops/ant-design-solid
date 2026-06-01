import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ConfigProvider, useConfig, useToken } from '../index'

function Probe() {
  const config = useConfig()
  const token = useToken()
  return (
    <div
      data-prefix={config.prefixCls()}
      data-size={config.componentSize()}
      data-primary={token().colorPrimary}
      data-radius={token().borderRadius}
    />
  )
}

describe('ConfigProvider', () => {
  it('provides default config values', () => {
    const result = render(() => <Probe />)
    const probe = result.container.querySelector('div')!
    expect(probe.dataset.prefix).toBe('ads')
    expect(probe.dataset.size).toBe('middle')
    expect(probe.dataset.primary).toBe('#1677ff')
  })
  it('merges nested providers', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="outer" theme={{ token: { colorPrimary: '#722ed1' } }}>
        <ConfigProvider componentSize="large" theme={{ token: { borderRadius: 8 } }}>
          <Probe />
        </ConfigProvider>
      </ConfigProvider>
    ))
    const probe = result.container.querySelector('div')!
    expect(probe.dataset.prefix).toBe('outer')
    expect(probe.dataset.size).toBe('large')
    expect(probe.dataset.primary).toBe('#722ed1')
    expect(probe.dataset.radius).toBe('8')
  })
})
