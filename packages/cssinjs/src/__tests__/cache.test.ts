import { describe, expect, it } from 'vitest'
import { createCache, extractStyle } from '../index'

describe('style cache', () => {
  it('deduplicates registered styles by key', () => {
    const cache = createCache()
    cache.register('a', '.a{color:red;}')
    cache.register('a', '.a{color:red;}')
    cache.register('b', '.b{color:blue;}')
    expect(cache.size()).toBe(2)
    expect(extractStyle(cache)).toBe('.a{color:red;}\n.b{color:blue;}')
  })

  it('extracts hydratable style tags with deterministic ids and a CSP nonce', () => {
    const cache = createCache()
    cache.register('button-style', '.button{color:red;}')
    cache.register('unsafe-style', '.unsafe::after{content:"</style>";}')

    const html = extractStyle(cache, {
      format: 'style-tag',
      nonce: 'nonce-"value',
    })

    expect(html).toContain(
      '<style data-ant-design-solid="css-16hrqrt" nonce="nonce-&quot;value">.button{color:red;}</style>',
    )
    expect(html).toContain('content:"<\\/style>";')
    expect(html).not.toContain('content:"</style>";')
  })

  it('keeps request caches isolated', () => {
    const first = createCache()
    const second = createCache()
    first.register('first', '.first{color:red;}')
    second.register('second', '.second{color:blue;}')

    expect(extractStyle(first)).toBe('.first{color:red;}')
    expect(extractStyle(second)).toBe('.second{color:blue;}')
  })
})
