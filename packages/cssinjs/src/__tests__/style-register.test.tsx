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
})
