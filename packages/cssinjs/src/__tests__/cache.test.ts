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
})
