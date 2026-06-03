import { describe, expect, it } from 'vitest'
import { Color, parseColor } from '../color'

describe('Color utilities', () => {
  it('parses hex colors and exposes conversion helpers', () => {
    const color = parseColor('#1677ff')

    expect(color?.toHex()).toBe('1677ff')
    expect(color?.toHexString()).toBe('#1677ff')
    expect(color?.toRgb()).toEqual({ r: 22, g: 119, b: 255, a: 1 })
    expect(color?.toRgbString()).toBe('rgb(22, 119, 255)')
    expect(color?.toHsb()).toEqual({ h: 215, s: 91, b: 100, a: 1 })
  })

  it('parses rgba colors and preserves alpha in string output', () => {
    const color = parseColor('rgba(22, 119, 255, 0.5)')

    expect(color?.toHexString()).toBe('#1677ff')
    expect(color?.toRgb()).toEqual({ r: 22, g: 119, b: 255, a: 0.5 })
    expect(color?.toRgbString()).toBe('rgba(22, 119, 255, 0.5)')
    expect(color?.toHsbString()).toBe('hsba(215, 91%, 100%, 0.5)')
  })

  it('parses hsb colors and rejects invalid input', () => {
    const color = parseColor('hsb(215, 91%, 100%)')

    expect(color?.toHexString()).toBe('#1778ff')
    expect(parseColor('not-a-color')).toBeUndefined()
  })

  it('can create colors from rgb and hsb objects', () => {
    expect(Color.fromRgb({ r: 255, g: 0, b: 0, a: 0.25 }).toHsb()).toEqual({
      h: 0,
      s: 100,
      b: 100,
      a: 0.25,
    })
    expect(Color.fromHsb({ h: 120, s: 100, b: 50, a: 1 }).toRgb()).toEqual({
      r: 0,
      g: 128,
      b: 0,
      a: 1,
    })
  })
})
