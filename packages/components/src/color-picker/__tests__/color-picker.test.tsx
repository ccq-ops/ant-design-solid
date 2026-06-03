import { fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Color, clamp, colorToCss, normalizeHsb, normalizeRgb, parseColor } from '../color'
import { ColorPicker } from '../index'

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

  it('rejects malformed numeric tokens', () => {
    expect(parseColor('rgb(1.2.3, 0, 0)')).toBeUndefined()
    expect(parseColor('hsb(0, 1.2.3%, 100%)')).toBeUndefined()
  })

  it('normalizes non-finite object input to finite color channels', () => {
    expect(clamp(Number.NaN, 0, 255)).toBe(0)
    expect(clamp(Number.POSITIVE_INFINITY, 0, 255)).toBe(255)
    expect(clamp(Number.NEGATIVE_INFINITY, 0, 255)).toBe(0)
    expect(
      normalizeRgb({
        r: Number.NaN,
        g: Number.POSITIVE_INFINITY,
        b: Number.NEGATIVE_INFINITY,
        a: Number.NaN,
      }),
    ).toEqual({
      r: 0,
      g: 255,
      b: 0,
      a: 1,
    })
    expect(
      normalizeHsb({
        h: Number.NaN,
        s: Number.POSITIVE_INFINITY,
        b: Number.NEGATIVE_INFINITY,
        a: Number.NaN,
      }),
    ).toEqual({
      h: 0,
      s: 100,
      b: 0,
      a: 1,
    })
    expect(Color.fromRgb({ r: Number.NaN, g: Number.NaN, b: Number.NaN }).toRgb()).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    })
    expect(Color.fromHsb({ h: Number.NaN, s: Number.NaN, b: Number.NaN }).toRgb()).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    })
  })

  it('normalizes non-number runtime object input to finite color channels', () => {
    expect(clamp('bad' as unknown as number, 0, 255)).toBe(0)
    expect(clamp(undefined as unknown as number, 0, 255)).toBe(0)
    expect(clamp({} as unknown as number, 0, 255)).toBe(0)
    expect(
      Color.fromRgb({ r: undefined as unknown as number, g: 0, b: 0, a: 1 }).toRgbString(),
    ).toBe('rgb(0, 0, 0)')
    expect(normalizeRgb({ r: 'bad' as unknown as number, g: 0, b: 0, a: 1 })).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 1,
    })
    expect(
      normalizeHsb({
        h: 'bad' as unknown as number,
        s: 'bad' as unknown as number,
        b: 'bad' as unknown as number,
        a: 'bad' as unknown as number,
      }),
    ).toEqual({
      h: 0,
      s: 0,
      b: 0,
      a: 1,
    })
  })

  it('treats empty color values as missing colors', () => {
    expect(parseColor(undefined)).toBeUndefined()
    expect(parseColor(null)).toBeUndefined()
    expect(colorToCss(undefined)).toBe('transparent')
  })
})

describe('ColorPicker trigger', () => {
  it('renders a trigger with default value and showText', () => {
    const result = render(() => <ColorPicker defaultValue="#1677ff" showText />)
    const trigger = result.getByRole('button', { name: /color picker/i })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(result.getByText('#1677ff')).toBeInTheDocument()
    expect(result.container.querySelector('.ads-color-picker-color-block-inner')).toHaveStyle(
      'background: rgb(22, 119, 255)',
    )
  })

  it('supports controlled value display', () => {
    const [value, setValue] = createSignal('#1677ff')
    const result = render(() => <ColorPicker value={value()} showText />)

    expect(result.getByText('#1677ff')).toBeInTheDocument()

    setValue('#52c41a')

    expect(result.getByText('#52c41a')).toBeInTheDocument()
  })

  it('treats value undefined as a controlled empty color over defaultValue', () => {
    const result = render(() => <ColorPicker defaultValue="#1677ff" value={undefined} showText />)

    expect(result.queryByText('#1677ff')).toBeNull()
    expect(result.container.querySelector('.ads-color-picker-color-block-inner')).toHaveStyle(
      'background: transparent',
    )
  })

  it('treats value null as a controlled empty color over defaultValue', () => {
    const result = render(() => <ColorPicker defaultValue="#1677ff" value={null} showText />)

    expect(result.queryByText('#1677ff')).toBeNull()
    expect(result.container.querySelector('.ads-color-picker-color-block-inner')).toHaveStyle(
      'background: transparent',
    )
  })

  it('treats open undefined as controlled closed over defaultOpen', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <ColorPicker defaultOpen open={undefined} onOpenChange={onOpenChange} />
    ))
    const trigger = result.getByRole('button', { name: /color picker/i })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(trigger)

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('does not open when disabled', () => {
    const onOpenChange = vi.fn()
    const result = render(() => <ColorPicker disabled onOpenChange={onOpenChange} />)
    const trigger = result.getByRole('button', { name: /color picker/i })

    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-disabled', 'true')
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(result.queryByRole('dialog')).toBeNull()
  })
})

describe('ColorPicker popup', () => {
  it('opens from trigger and closes from trigger, Escape, and outside pointer down', () => {
    const onOpenChange = vi.fn()
    const result = render(() => <ColorPicker defaultValue="#1677ff" onOpenChange={onOpenChange} />)
    const trigger = result.getByRole('button', { name: /color picker/i })

    fireEvent.click(trigger)

    const popup = screen.getByRole('dialog', { name: 'Color Picker Panel' })
    expect(popup).toHaveClass('ads-color-picker-popup')
    expect(popup).toHaveTextContent('rgb(22, 119, 255)')
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(onOpenChange).toHaveBeenLastCalledWith(true)

    fireEvent.pointerDown(popup)
    expect(screen.getByRole('dialog', { name: 'Color Picker Panel' })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Color Picker Panel' })).toBeNull()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)

    fireEvent.click(trigger)
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('dialog', { name: 'Color Picker Panel' })).toBeNull()

    fireEvent.click(trigger)
    expect(screen.getByRole('dialog', { name: 'Color Picker Panel' })).toBeInTheDocument()
    fireEvent.click(trigger)
    expect(screen.queryByRole('dialog', { name: 'Color Picker Panel' })).toBeNull()
  })

  it('keeps controlled open state until the owner changes it', () => {
    const [open, setOpen] = createSignal(false)
    const onOpenChange = vi.fn((nextOpen: boolean) => setOpen(nextOpen))
    const result = render(() => <ColorPicker open={open()} onOpenChange={onOpenChange} />)
    const trigger = result.getByRole('button', { name: /color picker/i })

    fireEvent.click(trigger)

    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    expect(screen.getByRole('dialog', { name: 'Color Picker Panel' })).toBeInTheDocument()

    setOpen(false)
    expect(screen.queryByRole('dialog', { name: 'Color Picker Panel' })).toBeNull()
  })

  it('treats controlled open undefined as closed and only requests changes', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <ColorPicker defaultOpen open={undefined} onOpenChange={onOpenChange} />
    ))
    const trigger = result.getByRole('button', { name: /color picker/i })

    expect(screen.queryByRole('dialog', { name: 'Color Picker Panel' })).toBeNull()

    fireEvent.click(trigger)

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.queryByRole('dialog', { name: 'Color Picker Panel' })).toBeNull()
  })

  it('allows a disabled uncontrolled popup to close with Escape and outside pointer down', () => {
    const onOpenChange = vi.fn()
    const result = render(() => <ColorPicker disabled defaultOpen onOpenChange={onOpenChange} />)
    const trigger = result.getByRole('button', { name: /color picker/i })

    expect(screen.getByRole('dialog', { name: 'Color Picker Panel' })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(screen.queryByRole('dialog', { name: 'Color Picker Panel' })).toBeNull()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)

    render(() => <ColorPicker disabled defaultOpen onOpenChange={onOpenChange} />)
    expect(screen.getByRole('dialog', { name: 'Color Picker Panel' })).toBeInTheDocument()

    fireEvent.pointerDown(document.body)

    expect(screen.queryByRole('dialog', { name: 'Color Picker Panel' })).toBeNull()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('requests closing a disabled controlled open popup', () => {
    const [open, setOpen] = createSignal(true)
    const onOpenChange = vi.fn((nextOpen: boolean) => setOpen(nextOpen))
    render(() => <ColorPicker disabled open={open()} onOpenChange={onOpenChange} />)

    expect(screen.getByRole('dialog', { name: 'Color Picker Panel' })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(screen.queryByRole('dialog', { name: 'Color Picker Panel' })).toBeNull()
  })

  it('allows panelRender to wrap the preview panel', () => {
    const panelRender = vi.fn((panel, extra) => (
      <section data-testid="panel-wrapper">
        <h2>Wrapped panel</h2>
        {extra.components.picker}
        {panel}
      </section>
    ))

    render(() => (
      <ColorPicker
        defaultOpen
        defaultValue={null}
        popupClass="custom-popup"
        panelRender={panelRender}
      />
    ))

    const popup = screen.getByRole('dialog', { name: 'Color Picker Panel' })
    expect(popup).toHaveClass('custom-popup')
    expect(screen.getByTestId('panel-wrapper')).toHaveTextContent('Wrapped panel')
    expect(screen.getByTestId('panel-wrapper')).toHaveTextContent('No color')
    expect(panelRender).toHaveBeenCalledTimes(1)
    expect(panelRender.mock.calls[0][1]).toHaveProperty('components.picker')
  })
})
