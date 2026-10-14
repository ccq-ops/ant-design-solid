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

function TokenDemo() {
  const [, hashId] = useStyleRegister(
    {
      path: ['TokenDemo'],
      token: { colorPrimary: '#1677ff', borderRadius: 6, lineHeight: 1.5 },
      theme: 'default',
    },
    () => ({
      '.token-demo': {
        color: '#1677ff',
        'border-radius': 6,
        'line-height': 1.5,
      },
    }),
  )
  return <div class={`token-demo ${hashId()}`}>Token demo</div>
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

  it('emits token CSS variables and rewrites component declarations in css-var mode', () => {
    document.head.innerHTML = ''
    const cache = createCache()
    const result = render(() => (
      <StyleProvider cache={cache} cssVar={{ key: 'css-var-brand', prefix: 'corp' }}>
        <TokenDemo />
      </StyleProvider>
    ))

    const demo = result.container.querySelector('.token-demo')
    const css = cache
      .entries()
      .map(([, value]) => value)
      .join('\n')

    expect(demo).toHaveClass('css-var-brand')
    expect(css).toContain('.css-var-brand{--corp-border-radius:6px;--corp-color-primary:#1677ff;')
    expect(css).toContain('--corp-line-height:1.5;')
    expect(css).toContain(
      '.token-demo{border-radius:var(--corp-border-radius);color:var(--corp-color-primary);line-height:var(--corp-line-height);}',
    )
    expect(document.head.querySelectorAll('style[data-ant-design-solid]')).toHaveLength(2)
  })

  it('inherits css-var configuration through nested style providers', () => {
    document.head.innerHTML = ''
    const result = render(() => (
      <StyleProvider cssVar={{ key: 'css-var-parent', prefix: 'parent' }}>
        <StyleProvider>
          <TokenDemo />
        </StyleProvider>
      </StyleProvider>
    ))

    expect(result.container.querySelector('.token-demo')).toHaveClass('css-var-parent')
    expect(document.head.textContent).toContain('--parent-color-primary:#1677ff;')
  })

  it('isolates styles registered under different css-var themes', () => {
    document.head.innerHTML = ''
    const cache = createCache()
    const result = render(() => (
      <>
        <StyleProvider cache={cache} cssVar={{ key: 'css-var-a', prefix: 'a' }}>
          <TokenDemo />
        </StyleProvider>
        <StyleProvider cache={cache} cssVar={{ key: 'css-var-b', prefix: 'b' }}>
          <TokenDemo />
        </StyleProvider>
      </>
    ))

    const demos = result.container.querySelectorAll('.token-demo')
    expect(demos[0]).toHaveClass('css-var-a')
    expect(demos[1]).toHaveClass('css-var-b')
    expect(document.head.textContent).toContain('color:var(--a-color-primary)')
    expect(document.head.textContent).toContain('color:var(--b-color-primary)')
    expect(document.head.querySelectorAll('style[data-ant-design-solid]')).toHaveLength(4)
  })
})
