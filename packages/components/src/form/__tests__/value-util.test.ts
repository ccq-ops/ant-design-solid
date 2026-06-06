import { describe, expect, it } from 'vitest'
import {
  cloneFormValues,
  deleteValue,
  flattenValuePaths,
  getValue,
  mergeValues,
  setValue,
} from '../value-util'

describe('form value utilities', () => {
  it('gets nested object and array values', () => {
    const values = { user: { email: 'a@example.com' }, users: [{ name: 'Ada' }] }

    expect(getValue(values, ['user', 'email'])).toBe('a@example.com')
    expect(getValue(values, ['users', 0, 'name'])).toBe('Ada')
    expect(getValue(values, ['missing'])).toBeUndefined()
  })

  it('sets nested object values immutably', () => {
    const original = { user: { email: 'old@example.com' } }
    const next = setValue(original, ['user', 'email'], 'new@example.com')

    expect(next).toEqual({ user: { email: 'new@example.com' } })
    expect(original).toEqual({ user: { email: 'old@example.com' } })
  })

  it('creates arrays for numeric path segments', () => {
    expect(setValue({}, ['users', 0, 'name'], 'Ada')).toEqual({ users: [{ name: 'Ada' }] })
  })

  it('deletes nested values immutably', () => {
    const original = { user: { email: 'a@example.com', name: 'Ada' } }
    const next = deleteValue(original, ['user', 'email'])

    expect(next).toEqual({ user: { name: 'Ada' } })
    expect(original).toEqual({ user: { email: 'a@example.com', name: 'Ada' } })
  })

  it('deep merges values', () => {
    expect(mergeValues({ user: { email: 'a@example.com' } }, { user: { name: 'Ada' } })).toEqual({
      user: { email: 'a@example.com', name: 'Ada' },
    })
  })

  it('clones values so public reads cannot mutate store state', () => {
    const values = { user: { email: 'a@example.com' } }
    const clone = cloneFormValues(values)
    ;(clone.user as { email: string }).email = 'changed@example.com'

    expect(values.user.email).toBe('a@example.com')
  })

  it('flattens nested values to field paths', () => {
    expect(flattenValuePaths({ user: { email: 'a@example.com' }, users: [{ name: 'Ada' }] })).toEqual([
      ['user', 'email'],
      ['users', 0, 'name'],
    ])
  })
})
