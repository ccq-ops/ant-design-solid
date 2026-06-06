import { describe, expect, it } from 'vitest'
import { validateValue } from '../validation'

describe('form validation v2', () => {
  it('validates common rule fields', async () => {
    await expect(
      validateValue('email', 'bad', {}, [{ type: 'email', message: 'Invalid email' }]),
    ).resolves.toEqual({ errors: ['Invalid email'], warnings: [] })
    await expect(
      validateValue('name', '   ', {}, [{ whitespace: true, message: 'No blanks' }]),
    ).resolves.toEqual({ errors: ['No blanks'], warnings: [] })
    await expect(
      validateValue('role', 'guest', {}, [{ type: 'enum', enum: ['admin'], message: 'Nope' }]),
    ).resolves.toEqual({ errors: ['Nope'], warnings: [] })
  })

  it('supports transform before validation', async () => {
    await expect(
      validateValue('name', ' Ada ', {}, [
        { transform: (value) => String(value).trim(), len: 3, message: 'Must be three' },
      ]),
    ).resolves.toEqual({ errors: [], warnings: [] })
  })

  it('supports async validators that resolve', async () => {
    await expect(
      validateValue('username', 'available', {}, [
        {
          async validator(_, value) {
            if (value === 'taken') throw new Error('Taken')
          },
        },
      ]),
    ).resolves.toEqual({ errors: [], warnings: [] })
  })

  it('supports async validators that reject', async () => {
    await expect(
      validateValue('username', 'taken', {}, [
        {
          validator(_, value) {
            if (value === 'taken') return Promise.reject(new Error('Taken'))
          },
        },
      ]),
    ).resolves.toEqual({ errors: ['Taken'], warnings: [] })
  })

  it('supports async validators that throw', async () => {
    await expect(
      validateValue('username', 'taken', {}, [
        {
          async validator(_, value) {
            if (value === 'taken') throw new Error('Taken')
          },
        },
      ]),
    ).resolves.toEqual({ errors: ['Taken'], warnings: [] })
  })

  it('supports validators that return a string', async () => {
    await expect(
      validateValue('username', 'taken', {}, [
        {
          validator(_, value) {
            if (value === 'taken') return 'Taken'
          },
        },
      ]),
    ).resolves.toEqual({ errors: ['Taken'], warnings: [] })
  })

  it('stores warningOnly failures as warnings', async () => {
    await expect(
      validateValue('age', 16, {}, [{ min: 18, warningOnly: true, message: 'Young' }]),
    ).resolves.toEqual({
      errors: [],
      warnings: ['Young'],
    })
  })

  it('stops on the first error when validateFirst is true', async () => {
    await expect(
      validateValue(
        'name',
        '',
        {},
        [
          { required: true, message: 'Required' },
          { min: 3, message: 'Too short' },
        ],
        { validateFirst: true },
      ),
    ).resolves.toEqual({ errors: ['Required'], warnings: [] })
  })
})
