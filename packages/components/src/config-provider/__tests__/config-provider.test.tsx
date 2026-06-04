import { render } from '@solidjs/testing-library'
import { darkAlgorithm, defaultAlgorithm } from '@ant-design-solid/theme'
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
  it('inherits parent theme algorithm when child only overrides tokens', () => {
    let inheritedBg = ''
    let inheritedPrimary = ''

    function AlgorithmProbe() {
      const { token } = useConfig()
      inheritedBg = token().colorBgContainer
      inheritedPrimary = token().colorPrimary
      return <div />
    }

    render(() => (
      <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
        <ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}>
          <AlgorithmProbe />
        </ConfigProvider>
      </ConfigProvider>
    ))

    expect(inheritedBg).toBe('#141414')
    expect(inheritedPrimary).toBe('#722ed1')
  })

  it('allows child theme algorithm to override parent algorithm', () => {
    let childBg = ''

    function AlgorithmProbe() {
      const { token } = useConfig()
      childBg = token().colorBgContainer
      return <div />
    }

    render(() => (
      <ConfigProvider theme={{ algorithm: darkAlgorithm }}>
        <ConfigProvider theme={{ algorithm: defaultAlgorithm }}>
          <AlgorithmProbe />
        </ConfigProvider>
      </ConfigProvider>
    ))

    expect(childBg).toBe('#ffffff')
  })
})
