import { describe, expect, it } from 'vitest'
import {
  containsNamePath,
  getNamePath,
  isSameNamePath,
  matchNamePath,
  serializeNamePath,
} from '../name-path'

describe('form name-path utilities', () => {
  it('normalizes string, number, and array names', () => {
    expect(getNamePath('user')).toEqual(['user'])
    expect(getNamePath(0)).toEqual([0])
    expect(getNamePath(['users', 0, 'name'])).toEqual(['users', 0, 'name'])
  })

  it('serializes paths without dot-join collisions', () => {
    expect(serializeNamePath(['a.b'])).not.toBe(serializeNamePath(['a', 'b']))
    expect(serializeNamePath(['users', 0, 'name'])).toBe('["users",0,"name"]')
  })

  it('compares exact paths', () => {
    expect(isSameNamePath(['user', 'email'], ['user', 'email'])).toBe(true)
    expect(isSameNamePath(['user', 'email'], ['user'])).toBe(false)
    expect(isSameNamePath(['0'], [0])).toBe(false)
  })

  it('detects parent-child path relationships', () => {
    expect(containsNamePath(['user'], ['user', 'email'])).toBe(true)
    expect(containsNamePath(['user', 'email'], ['user'])).toBe(false)
    expect(containsNamePath(['users', 0], ['users', 0, 'name'])).toBe(true)
    expect(containsNamePath(['users', 1], ['users', 0, 'name'])).toBe(false)
  })

  it('matches paths exactly or recursively', () => {
    expect(matchNamePath(['user'], ['user', 'email'], false)).toBe(false)
    expect(matchNamePath(['user'], ['user', 'email'], true)).toBe(true)
    expect(matchNamePath(['user', 'email'], ['user', 'email'], false)).toBe(true)
  })
})
