import { describe, expect, it } from 'vitest'
import { hashString, stableStringify } from '../index'

describe('hash utilities', () => {
  it('creates stable strings independent of object key insertion order', () => {
    expect(stableStringify({ b: 2, a: 1 })).toBe(stableStringify({ a: 1, b: 2 }))
  })
  it('creates deterministic short hashes', () => {
    expect(hashString('Button.ads')).toBe(hashString('Button.ads'))
    expect(hashString('Button.ads')).toMatch(/^css-[a-z0-9]+$/)
  })
})
