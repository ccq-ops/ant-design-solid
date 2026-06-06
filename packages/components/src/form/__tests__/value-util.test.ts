import { describe, expect, it } from 'vitest'
import {
  cloneFormValues,
  deleteValue,
  flattenValuePaths,
  getValue,
  mergeValues,
  pickValues,
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

  it('deletes array indexes as sparse holes without shifting siblings', () => {
    const original = { users: [{ name: 'Ada' }, { name: 'Grace' }, { name: 'Linus' }] }
    const next = deleteValue(original, ['users', 1])
    const users = next.users as unknown[]

    expect(users).toHaveLength(3)
    expect(0 in users).toBe(true)
    expect(1 in users).toBe(false)
    expect(2 in users).toBe(true)
    expect(users[0]).toEqual({ name: 'Ada' })
    expect(users[1]).toBeUndefined()
    expect(users[2]).toEqual({ name: 'Linus' })
    expect(original.users).toEqual([{ name: 'Ada' }, { name: 'Grace' }, { name: 'Linus' }])
  })

  it('deep merges values', () => {
    expect(mergeValues({ user: { email: 'a@example.com' } }, { user: { name: 'Ada' } })).toEqual({
      user: { email: 'a@example.com', name: 'Ada' },
    })
  })

  it('clones assigned object and array values when setting nested values', () => {
    const assigned = { tags: ['initial'], profile: { name: 'Ada' } }
    const next = setValue({}, ['user'], assigned)

    assigned.tags.push('changed')
    assigned.profile.name = 'Grace'

    expect(next).toEqual({ user: { tags: ['initial'], profile: { name: 'Ada' } } })
  })

  it('clones assigned object and array values when merging patches', () => {
    const patch = { user: { tags: ['initial'], profile: { name: 'Ada' } } }
    const next = mergeValues({}, patch)

    patch.user.tags.push('changed')
    patch.user.profile.name = 'Grace'

    expect(next).toEqual({ user: { tags: ['initial'], profile: { name: 'Ada' } } })
  })

  it('clones values so public reads cannot mutate store state', () => {
    const values = { user: { email: 'a@example.com' } }
    const clone = cloneFormValues(values)
    ;(clone.user as { email: string }).email = 'changed@example.com'

    expect(values.user.email).toBe('a@example.com')
  })

  it('flattens nested values to field paths', () => {
    expect(
      flattenValuePaths({ user: { email: 'a@example.com' }, users: [{ name: 'Ada' }] }),
    ).toEqual([
      ['user', 'email'],
      ['users', 0, 'name'],
    ])
  })

  it('does not flatten empty object or array containers as leaf paths', () => {
    expect(flattenValuePaths({ empty: {}, list: [] })).toEqual([])
  })

  it('picks present values while omitting missing and undefined paths', () => {
    const values = {
      missingParent: undefined,
      present: {
        empty: '',
        falseValue: false,
        nullValue: null,
        zero: 0,
        undefinedValue: undefined,
      },
    }

    expect(
      pickValues(values, [
        ['present', 'empty'],
        ['present', 'falseValue'],
        ['present', 'nullValue'],
        ['present', 'zero'],
        ['present', 'undefinedValue'],
        ['missing'],
        ['missingParent', 'child'],
      ]),
    ).toEqual({
      present: {
        empty: '',
        falseValue: false,
        nullValue: null,
        zero: 0,
      },
    })
  })
})
