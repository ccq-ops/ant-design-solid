import { render } from '@solidjs/testing-library'
import { darkAlgorithm, defaultAlgorithm } from '@ant-design-solid/theme'
import { describe, expect, it } from 'vitest'
import type { JSX } from 'solid-js'
import { ConfigProvider, useConfig, useToken } from '../index'

function Probe() {
  const config = useConfig()
  const token = useToken()
  return (
    <div
      data-prefix={config.prefixCls()}
      data-icon-prefix={config.iconPrefixCls()}
      data-size={config.componentSize()}
      data-disabled={String(config.componentDisabled())}
      data-variant={config.variant()}
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
    expect(probe.dataset.iconPrefix).toBe('adsicon')
    expect(probe.dataset.size).toBe('middle')
    expect(probe.dataset.disabled).toBe('false')
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
    expect(inheritedPrimary).toBe('#642ab5')
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

  it('supports v6 global config values', () => {
    let targetContainer: HTMLElement | Window | ShadowRoot | undefined
    let popupContainer: HTMLElement | ShadowRoot | undefined
    let emptyNode: JSX.Element
    const target = document.createElement('main')
    const popup = document.createElement('section')

    function Reader() {
      const config = useConfig()
      targetContainer = config.getTargetContainer?.()
      popupContainer = config.getPopupContainer?.(document.body)
      emptyNode = config.renderEmpty?.('Select')
      return (
        <div
          data-prefix={config.prefixCls()}
          data-icon-prefix={config.iconPrefixCls()}
          data-size={config.componentSize()}
          data-disabled={String(config.componentDisabled())}
          data-variant={config.variant()}
          data-virtual={String(config.virtual())}
          data-popup-match={String(config.popupMatchSelectWidth())}
          data-popup-overflow={config.popupOverflow()}
          data-wave-disabled={String(config.wave().disabled)}
          data-locale={config.locale()?.locale}
        />
      )
    }

    const result = render(() => (
      <ConfigProvider
        prefixCls="corp"
        iconPrefixCls="corpicon"
        componentSize="medium"
        componentDisabled
        variant="filled"
        virtual={false}
        popupMatchSelectWidth={false}
        popupOverflow="scroll"
        locale={{ locale: 'en_US' }}
        wave={{ disabled: true }}
        getTargetContainer={() => target}
        getPopupContainer={() => popup}
        renderEmpty={(componentName) => <span data-empty={componentName}>empty</span>}
      >
        <Reader />
      </ConfigProvider>
    ))

    const probe = result.container.querySelector('div')!
    expect(probe.dataset.prefix).toBe('corp')
    expect(probe.dataset.iconPrefix).toBe('corpicon')
    expect(probe.dataset.size).toBe('medium')
    expect(probe.dataset.disabled).toBe('true')
    expect(probe.dataset.variant).toBe('filled')
    expect(probe.dataset.virtual).toBe('false')
    expect(probe.dataset.popupMatch).toBe('false')
    expect(probe.dataset.popupOverflow).toBe('scroll')
    expect(probe.dataset.waveDisabled).toBe('true')
    expect(probe.dataset.locale).toBe('en_US')
    expect(targetContainer).toBe(target)
    expect(popupContainer).toBe(popup)
    expect(emptyNode).toEqual(<span data-empty="Select">empty</span>)
  })

  it('supports inherit false for child themes', () => {
    let childPrimary = ''
    let childRadius = 0

    function ThemeProbe() {
      const { token } = useConfig()
      childPrimary = token().colorPrimary
      childRadius = token().borderRadius
      return <div />
    }

    render(() => (
      <ConfigProvider theme={{ token: { colorPrimary: '#722ed1', borderRadius: 10 } }}>
        <ConfigProvider theme={{ inherit: false, token: { colorPrimary: '#eb2f96' } }}>
          <ThemeProbe />
        </ConfigProvider>
      </ConfigProvider>
    ))

    expect(childPrimary).toBe('#eb2f96')
    expect(childRadius).toBe(6)
  })

  it('merges Solid component config with class fields', () => {
    let buttonClass = ''
    let inputVariant = ''
    let tooltipClass = ''

    function ComponentConfigProbe() {
      const config = useConfig()
      buttonClass = config.button().class ?? ''
      inputVariant = config.input().variant ?? ''
      tooltipClass = config.tooltip().class ?? ''
      return <div />
    }

    render(() => (
      <ConfigProvider
        button={{ class: 'outer-button', autoInsertSpace: false }}
        input={{ variant: 'filled' }}
        tooltip={{ class: 'outer-tooltip' }}
      >
        <ConfigProvider button={{ class: 'inner-button' }}>
          <ComponentConfigProbe />
        </ConfigProvider>
      </ConfigProvider>
    ))

    expect(buttonClass).toBe('inner-button')
    expect(inputVariant).toBe('filled')
    expect(tooltipClass).toBe('outer-tooltip')
  })

  it('exposes static config and useConfig helpers', () => {
    ConfigProvider.config({ prefixCls: 'global', iconPrefixCls: 'globalicon' })

    let componentDisabled = true
    let componentSize = ''

    function HookProbe() {
      const config = ConfigProvider.useConfig()
      componentDisabled = config.componentDisabled()
      componentSize = config.componentSize()
      return (
        <div data-prefix={useConfig().prefixCls()} data-icon-prefix={useConfig().iconPrefixCls()} />
      )
    }

    const result = render(() => <HookProbe />)
    const probe = result.container.querySelector('div')!
    expect(probe.dataset.prefix).toBe('global')
    expect(probe.dataset.iconPrefix).toBe('globalicon')
    expect(componentDisabled).toBe(false)
    expect(componentSize).toBe('middle')

    ConfigProvider.config({ prefixCls: undefined, iconPrefixCls: undefined })
  })
})

it('inherits and overrides getPopupContainer', () => {
  const outerContainer = document.createElement('div')
  const innerContainer = document.createElement('div')
  let outerResolved: HTMLElement | ShadowRoot | undefined
  let innerResolved: HTMLElement | ShadowRoot | undefined

  function Reader(props: { onRead: (element: HTMLElement | ShadowRoot | undefined) => void }) {
    const config = useConfig()
    props.onRead(config.getPopupContainer?.(document.body))
    return null
  }

  render(() => (
    <ConfigProvider getPopupContainer={() => outerContainer}>
      <Reader onRead={(element) => (outerResolved = element)} />
      <ConfigProvider getPopupContainer={() => innerContainer}>
        <Reader onRead={(element) => (innerResolved = element)} />
      </ConfigProvider>
    </ConfigProvider>
  ))

  expect(outerResolved).toBe(outerContainer)
  expect(innerResolved).toBe(innerContainer)
})
