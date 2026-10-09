import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { StyleProvider, createCache, useStyleRegister } from '../index'

function Demo() {
  const [, hashId] = useStyleRegister(
    { path: ['Demo'], token: { color: 'red' }, theme: 'default' },
    () => ({ '.demo': { color: 'red' } }),
  )
  return <div class={`demo ${hashId()}`}>Demo</div>
}

describe('useStyleRegister', () => {
  it('injects one style tag and returns a hash id', () => {
    document.head.innerHTML = ''
    const cache = createCache()
    const result = render(() => (
      <StyleProvider cache={cache}>
        <Demo />
        <Demo />
      </StyleProvider>
    ))
    expect(result.container.querySelector('.demo')?.className).toMatch(/css-[a-z0-9]+/)
    expect(document.head.querySelectorAll('style[data-ant-design-solid]').length).toBe(1)
    expect(cache.size()).toBe(1)
  })

  it('adds a CSP nonce and inherits the parent cache', () => {
    document.head.innerHTML = ''
    const cache = createCache()
    render(() => (
      <StyleProvider cache={cache} nonce="nonce-value">
        <StyleProvider>
          <Demo />
        </StyleProvider>
      </StyleProvider>
    ))

    const style = document.head.querySelector('style[data-ant-design-solid]')
    expect(style).toHaveAttribute('nonce', 'nonce-value')
    expect(cache.size()).toBe(1)
  })

  it('restores a removed style element even when the cache already contains the rule', () => {
    document.head.innerHTML = ''
    const cache = createCache()
    const first = render(() => (
      <StyleProvider cache={cache}>
        <Demo />
      </StyleProvider>
    ))
    first.unmount()
    document.head.innerHTML = ''

    render(() => (
      <StyleProvider cache={cache}>
        <Demo />
      </StyleProvider>
    ))

    expect(document.head.querySelectorAll('style[data-ant-design-solid]')).toHaveLength(1)
  })

  it('supports disabling hashed class names without disabling style injection', () => {
    document.head.innerHTML = ''
    const result = render(() => (
      <StyleProvider hashed={false}>
        <Demo />
      </StyleProvider>
    ))

    expect(result.container.querySelector('.demo')).toHaveClass('demo')
    expect(result.container.querySelector('.demo')?.className).not.toMatch(/css-[a-z0-9]+/)
    expect(document.head.querySelectorAll('style[data-ant-design-solid]')).toHaveLength(1)
  })

  it('skips runtime style registration and hash classes in zero-runtime mode', () => {
    document.head.innerHTML = ''
    const cache = createCache()
    const result = render(() => (
      <StyleProvider cache={cache} zeroRuntime>
        <Demo />
      </StyleProvider>
    ))

    expect(result.container.querySelector('.demo')).toHaveClass('demo')
    expect(result.container.querySelector('.demo')?.className).not.toMatch(/css-[a-z0-9]+/)
    expect(document.head.querySelectorAll('style[data-ant-design-solid]')).toHaveLength(0)
    expect(cache.size()).toBe(0)
  })
})
