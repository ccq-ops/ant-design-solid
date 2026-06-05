import { cleanup, fireEvent, render, screen, within } from '@solidjs/testing-library'
import { Show, createSignal } from 'solid-js'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Color, clamp, colorToCss, normalizeHsb, normalizeRgb, parseColor } from '../color'
import { ColorPicker } from '../index'

function latestPanel() {
  const panels = screen.getAllByRole('dialog', { name: 'Color Picker Panel' })

  return within(panels.at(-1) as HTMLElement)
}

afterEach(() => {
  vi.useRealTimers()
  cleanup()
  document.body.innerHTML = ''
})

function mockRect(element: Element, rect: Partial<DOMRect>): void {
  element.getBoundingClientRect = vi.fn(() => ({
    x: rect.x ?? rect.left ?? 0,
    y: rect.y ?? rect.top ?? 0,
    left: rect.left ?? rect.x ?? 0,
    top: rect.top ?? rect.y ?? 0,
    right: rect.right ?? (rect.left ?? rect.x ?? 0) + (rect.width ?? 0),
    bottom: rect.bottom ?? (rect.top ?? rect.y ?? 0) + (rect.height ?? 0),
    width: rect.width ?? 0,
    height: rect.height ?? 0,
    toJSON: () => undefined,
  }))
}

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

describe('ColorPicker panel interactions', () => {
  it('updates saturation and brightness during pointer drag and completes on release', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    render(() => (
      <ColorPicker
        defaultOpen
        defaultValue="hsb(0, 0%, 100%)"
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    ))
    const panel = latestPanel()
    const saturation = panel.getByRole('slider', { name: 'Saturation and brightness' })
    mockRect(saturation, { left: 10, top: 20, width: 100, height: 100 })

    fireEvent.pointerDown(saturation, { clientX: 60, clientY: 45 })
    fireEvent.pointerMove(document, { clientX: 110, clientY: 120 })

    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange.mock.calls[0][0]?.toHsb()).toEqual({ h: 0, s: 50, b: 75, a: 1 })
    expect(onChange.mock.calls[0][1]).toBe('#bf6060')
    expect(onChange.mock.calls[1][0]?.toRgbString()).toBe('rgb(0, 0, 0)')
    expect(panel.getByText('rgb(0, 0, 0)')).toBeInTheDocument()

    fireEvent.pointerUp(document)

    expect(onChangeComplete).toHaveBeenCalledTimes(1)
    expect(onChangeComplete.mock.calls[0][0]?.toRgbString()).toBe('rgb(0, 0, 0)')
  })

  it('updates hue and alpha sliders from pointer interactions', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    render(() => (
      <ColorPicker
        defaultOpen
        defaultValue="hsba(0, 100%, 100%, 1)"
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    ))
    const panel = latestPanel()
    const hue = panel.getByRole('slider', { name: 'Hue' })
    const alpha = panel.getByRole('slider', { name: 'Alpha' })
    mockRect(hue, { left: 10, top: 0, width: 360, height: 12 })
    mockRect(alpha, { left: 20, top: 0, width: 100, height: 12 })

    fireEvent.pointerDown(hue, { clientX: 130, clientY: 6 })
    fireEvent.pointerUp(document)
    fireEvent.pointerDown(alpha, { clientX: 45, clientY: 6 })
    fireEvent.pointerMove(document, { clientX: 70, clientY: 6 })
    fireEvent.pointerUp(document)

    expect(onChange.mock.calls[0][0]?.toHsb()).toEqual({ h: 120, s: 100, b: 100, a: 1 })
    expect(onChange.mock.calls[0][1]).toBe('#00ff00')
    expect(onChange.mock.calls[1][0]?.toHsb()).toEqual({ h: 120, s: 100, b: 100, a: 0.25 })
    expect(onChange.mock.calls[2][0]?.toHsb()).toEqual({ h: 120, s: 100, b: 100, a: 0.5 })
    expect(onChangeComplete).toHaveBeenCalledTimes(2)
    expect(onChangeComplete.mock.calls[1][0]?.toRgbString()).toBe('rgba(0, 255, 0, 0.5)')
  })

  it('completes and removes drag listeners when pointer is cancelled', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    render(() => (
      <ColorPicker
        defaultOpen
        defaultValue="hsba(0, 100%, 100%, 1)"
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    ))
    const panel = latestPanel()
    const alpha = panel.getByRole('slider', { name: 'Alpha' })
    mockRect(alpha, { left: 0, top: 0, width: 100, height: 12 })

    fireEvent.pointerDown(alpha, { clientX: 20, clientY: 6 })
    fireEvent.pointerCancel(document, { clientX: 60, clientY: 6 })
    fireEvent.pointerMove(document, { clientX: 90, clientY: 6 })

    expect(onChange).toHaveBeenCalledTimes(2)
    expect(onChange.mock.calls[1][0]?.toHsb()).toEqual({ h: 0, s: 100, b: 100, a: 0.6 })
    expect(onChangeComplete).toHaveBeenCalledTimes(1)
    expect(onChangeComplete.mock.calls[0][0]?.toHsb()).toEqual({ h: 0, s: 100, b: 100, a: 0.6 })
  })

  it('removes active drag listeners on unmount', () => {
    const onChange = vi.fn()
    const [mounted, setMounted] = createSignal(true)
    render(() => (
      <Show when={mounted()}>
        <ColorPicker defaultOpen defaultValue="hsb(0, 100%, 100%)" onChange={onChange} />
      </Show>
    ))
    const panel = latestPanel()
    const hue = panel.getByRole('slider', { name: 'Hue' })
    mockRect(hue, { left: 0, top: 0, width: 360, height: 12 })

    fireEvent.pointerDown(hue, { clientX: 120, clientY: 6 })
    expect(onChange).toHaveBeenCalledTimes(1)

    setMounted(false)
    fireEvent.pointerMove(document, { clientX: 180, clientY: 6 })

    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('replaces an active drag when a second pointer drag starts', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    render(() => (
      <ColorPicker
        defaultOpen
        defaultValue="hsb(0, 100%, 100%)"
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    ))
    const panel = latestPanel()
    const hue = panel.getByRole('slider', { name: 'Hue' })
    const alpha = panel.getByRole('slider', { name: 'Alpha' })
    mockRect(hue, { left: 0, top: 0, width: 360, height: 12 })
    mockRect(alpha, { left: 0, top: 0, width: 100, height: 12 })

    fireEvent.pointerDown(hue, { clientX: 120, clientY: 6 })
    fireEvent.pointerDown(alpha, { clientX: 50, clientY: 6 })
    fireEvent.pointerMove(document, { clientX: 75, clientY: 6 })
    fireEvent.pointerUp(document)

    expect(onChange.mock.calls.map((call) => call[0]?.toHsb())).toEqual([
      { h: 120, s: 100, b: 100, a: 1 },
      { h: 120, s: 100, b: 100, a: 0.5 },
      { h: 120, s: 100, b: 100, a: 0.75 },
    ])
    expect(onChangeComplete).toHaveBeenCalledTimes(1)
    expect(onChangeComplete.mock.calls[0][0]?.toHsb()).toEqual({ h: 120, s: 100, b: 100, a: 0.75 })
  })

  it('hides alpha slider when disabledAlpha is set', () => {
    render(() => <ColorPicker defaultOpen defaultValue="rgba(22, 119, 255, 0.5)" disabledAlpha />)

    const panel = latestPanel()

    expect(panel.getByRole('slider', { name: 'Hue' })).toBeInTheDocument()
    expect(panel.queryByRole('slider', { name: 'Alpha' })).toBeNull()
  })

  it('prevents pointer changes when disabled', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    render(() => (
      <ColorPicker
        disabled
        defaultOpen
        defaultValue="#1677ff"
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    ))
    const panel = latestPanel()
    const hue = panel.getByRole('slider', { name: 'Hue' })
    mockRect(hue, { left: 0, top: 0, width: 360, height: 12 })

    fireEvent.pointerDown(hue, { clientX: 120, clientY: 6 })
    fireEvent.pointerMove(document, { clientX: 180, clientY: 6 })
    fireEvent.pointerUp(document)

    expect(onChange).not.toHaveBeenCalled()
    expect(onChangeComplete).not.toHaveBeenCalled()
    expect(panel.getByRole('slider', { name: 'Saturation and brightness' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(hue).toHaveAttribute('aria-disabled', 'true')
    expect(panel.getByRole('slider', { name: 'Alpha' })).toHaveAttribute('aria-disabled', 'true')
    expect(panel.getByText('rgb(22, 119, 255)')).toBeInTheDocument()
  })

  it('disables format inputs and prevents text commits when disabled open', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    render(() => (
      <ColorPicker
        disabled
        defaultOpen
        defaultValue="#1677ff"
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    ))
    const panel = latestPanel()
    const formatSelect = panel.getByRole('combobox', { name: 'Color format' })
    const hexInput = panel.getByLabelText('Hex')

    expect(formatSelect).toBeDisabled()
    expect(hexInput).toBeDisabled()

    fireEvent.input(hexInput, { target: { value: '#52c41a' } })
    fireEvent.keyDown(hexInput, { key: 'Enter' })
    fireEvent.blur(hexInput)

    expect(onChange).not.toHaveBeenCalled()
    expect(onChangeComplete).not.toHaveBeenCalled()
    expect(hexInput).toHaveValue('#1677ff')
    expect(panel.getByText('rgb(22, 119, 255)')).toBeInTheDocument()
  })

  it('commits a hex input value when Enter is pressed', () => {
    const onChange = vi.fn()
    render(() => <ColorPicker defaultOpen defaultValue="#1677ff" onChange={onChange} />)
    const panel = latestPanel()
    const hexInput = panel.getByLabelText('Hex')

    fireEvent.input(hexInput, { target: { value: '#52c41a' } })
    fireEvent.keyDown(hexInput, { key: 'Enter' })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]?.toRgbString()).toBe('rgb(82, 196, 26)')
    expect(onChange.mock.calls[0][1]).toBe('#52c41a')
    expect(panel.getByText('rgb(82, 196, 26)')).toBeInTheDocument()
  })

  it('commits defaultFormat rgb channel inputs on blur', () => {
    const onChange = vi.fn()
    render(() => (
      <ColorPicker defaultOpen defaultValue="#000000" defaultFormat="rgb" onChange={onChange} />
    ))
    const panel = latestPanel()

    fireEvent.input(panel.getByLabelText('Red'), { target: { value: '82' } })
    fireEvent.input(panel.getByLabelText('Green'), { target: { value: '196' } })
    fireEvent.input(panel.getByLabelText('Blue'), { target: { value: '26' } })
    fireEvent.blur(panel.getByLabelText('Blue'))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]?.toRgb()).toEqual({ r: 82, g: 196, b: 26, a: 1 })
    expect(onChange.mock.calls[0][1]).toBe('#52c41a')
    expect(panel.getByText('rgb(82, 196, 26)')).toBeInTheDocument()
  })

  it("shows hsb fields for controlled format='hsb'", () => {
    render(() => <ColorPicker defaultOpen defaultValue="#1677ff" format="hsb" />)
    const panel = latestPanel()

    expect(panel.getByRole('combobox', { name: 'Color format' })).toBeDisabled()
    expect(panel.getByLabelText('H')).toHaveValue('215')
    expect(panel.getByLabelText('S')).toHaveValue('91')
    expect(panel.getByLabelText('B')).toHaveValue('100')
  })

  it('reverts invalid hex input on Enter without emitting changes', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    render(() => (
      <ColorPicker
        defaultOpen
        defaultValue="#1677ff"
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    ))
    const panel = latestPanel()
    const hexInput = panel.getByLabelText('Hex')

    fireEvent.input(hexInput, { target: { value: 'not-a-color' } })
    fireEvent.keyDown(hexInput, { key: 'Enter' })

    expect(hexInput).toHaveValue('#1677ff')
    expect(onChange).not.toHaveBeenCalled()
    expect(onChangeComplete).not.toHaveBeenCalled()
    expect(panel.getByText('rgb(22, 119, 255)')).toBeInTheDocument()
  })

  it('resyncs hex input when a controlled owner rejects the committed value', () => {
    const onChange = vi.fn()
    render(() => <ColorPicker defaultOpen value="#1677ff" onChange={onChange} />)
    const panel = latestPanel()
    const hexInput = panel.getByLabelText('Hex')

    fireEvent.input(hexInput, { target: { value: '#52c41a' } })
    fireEvent.keyDown(hexInput, { key: 'Enter' })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]?.toRgbString()).toBe('rgb(82, 196, 26)')
    expect(hexInput).toHaveValue('#1677ff')
    expect(panel.getByText('rgb(22, 119, 255)')).toBeInTheDocument()
  })

  it('does not double emit when Enter commit is followed by blur', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    render(() => (
      <ColorPicker
        defaultOpen
        defaultValue="#1677ff"
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    ))
    const panel = latestPanel()
    const hexInput = panel.getByLabelText('Hex')

    fireEvent.input(hexInput, { target: { value: '#52c41a' } })
    fireEvent.keyDown(hexInput, { key: 'Enter' })
    fireEvent.blur(hexInput)

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChangeComplete).toHaveBeenCalledTimes(1)
    expect(onChangeComplete.mock.calls[0][0]?.toRgbString()).toBe('rgb(82, 196, 26)')
  })

  it('commits hsb channel inputs and completes the change', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    render(() => (
      <ColorPicker
        defaultOpen
        defaultValue="#000000"
        defaultFormat="hsb"
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    ))
    const panel = latestPanel()

    fireEvent.input(panel.getByLabelText('H'), { target: { value: '120' } })
    fireEvent.input(panel.getByLabelText('S'), { target: { value: '100' } })
    fireEvent.input(panel.getByLabelText('B'), { target: { value: '50' } })
    fireEvent.blur(panel.getByLabelText('B'))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]?.toRgbString()).toBe('rgb(0, 128, 0)')
    expect(onChange.mock.calls[0][1]).toBe('#008000')
    expect(onChangeComplete).toHaveBeenCalledTimes(1)
    expect(onChangeComplete.mock.calls[0][0]?.toRgbString()).toBe('rgb(0, 128, 0)')
    expect(panel.getByText('rgb(0, 128, 0)')).toBeInTheDocument()
  })
})

describe('ColorPicker presets, clear, and hover trigger', () => {
  it('selects a preset color and completes the change', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    render(() => (
      <ColorPicker
        defaultOpen
        defaultValue="#1677ff"
        presets={[{ label: 'Recommended', colors: ['#52c41a'] }]}
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    ))
    const panel = latestPanel()

    fireEvent.click(panel.getByRole('button', { name: 'Select preset color #52c41a' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]?.toRgbString()).toBe('rgb(82, 196, 26)')
    expect(onChange.mock.calls[0][1]).toBe('#52c41a')
    expect(onChangeComplete).toHaveBeenCalledTimes(1)
    expect(onChangeComplete.mock.calls[0][0]?.toRgbString()).toBe('rgb(82, 196, 26)')
    expect(panel.getByText('rgb(82, 196, 26)')).toBeInTheDocument()
  })

  it('clears the color when allowClear is enabled', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    render(() => (
      <ColorPicker
        defaultOpen
        defaultValue="#1677ff"
        allowClear
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    ))
    const panel = latestPanel()

    fireEvent.click(panel.getByRole('button', { name: 'Clear color' }))

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(undefined, '')
    expect(onChangeComplete).toHaveBeenCalledTimes(1)
    expect(onChangeComplete).toHaveBeenCalledWith(undefined)
    expect(panel.getByText('No color')).toBeInTheDocument()
  })

  it('renders showText functions with the current color and updates after preset selection', () => {
    render(() => (
      <ColorPicker
        defaultOpen
        defaultValue="#1677ff"
        showText={(color) => <strong>Current: {color?.toHexString() ?? 'empty'}</strong>}
        presets={[{ colors: ['#52c41a'] }]}
      />
    ))

    expect(screen.getByText('Current: #1677ff')).toBeInTheDocument()

    fireEvent.click(latestPanel().getByRole('button', { name: 'Select preset color #52c41a' }))

    expect(screen.getByText('Current: #52c41a')).toBeInTheDocument()
  })

  it('keeps a hover popup open while moving from trigger into the portaled popup', () => {
    vi.useFakeTimers()
    const onOpenChange = vi.fn()
    const dialogCount = () => screen.queryAllByRole('dialog', { name: 'Color Picker Panel' }).length
    const result = render(() => <ColorPicker trigger="hover" onOpenChange={onOpenChange} />)
    const trigger = result.getByRole('button', { name: /color picker/i })
    const initialDialogCount = dialogCount()

    fireEvent.click(trigger)

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(dialogCount()).toBe(initialDialogCount)

    fireEvent.mouseEnter(trigger)

    expect(onOpenChange).toHaveBeenLastCalledWith(true)
    expect(dialogCount()).toBe(initialDialogCount + 1)

    const popup = screen
      .getAllByRole('dialog', { name: 'Color Picker Panel' })
      .at(-1) as HTMLElement

    fireEvent.click(trigger)

    expect(dialogCount()).toBe(initialDialogCount + 1)

    fireEvent.mouseLeave(trigger, { relatedTarget: popup })
    fireEvent.mouseEnter(popup, { relatedTarget: trigger })
    vi.advanceTimersByTime(200)

    expect(dialogCount()).toBe(initialDialogCount + 1)

    fireEvent.mouseLeave(popup, { relatedTarget: document.body })
    vi.advanceTimersByTime(200)

    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(dialogCount()).toBe(initialDialogCount)
  })

  it('supports keyboard adjustments for hue, alpha, saturation, and brightness sliders', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    render(() => (
      <ColorPicker
        defaultOpen
        defaultValue="hsba(0, 50%, 50%, 0.5)"
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    ))
    const panel = latestPanel()
    const saturation = panel.getByRole('slider', { name: 'Saturation and brightness' })
    const hue = panel.getByRole('slider', { name: 'Hue' })
    const alpha = panel.getByRole('slider', { name: 'Alpha' })

    fireEvent.keyDown(hue, { key: 'ArrowRight' })
    fireEvent.keyDown(hue, { key: 'ArrowLeft' })
    fireEvent.keyDown(alpha, { key: 'ArrowRight' })
    fireEvent.keyDown(alpha, { key: 'ArrowLeft' })
    fireEvent.keyDown(saturation, { key: 'ArrowRight' })
    fireEvent.keyDown(saturation, { key: 'ArrowUp' })

    expect(onChange.mock.calls.map((call) => call[0]?.toHsb())).toEqual([
      { h: 1, s: 50, b: 50, a: 0.5 },
      { h: 0, s: 50, b: 50, a: 0.5 },
      { h: 0, s: 50, b: 50, a: 0.51 },
      { h: 0, s: 50, b: 50, a: 0.5 },
      { h: 0, s: 52, b: 50, a: 0.5 },
      { h: 0, s: 51, b: 51, a: 0.5 },
    ])
    expect(onChangeComplete).toHaveBeenCalledTimes(6)
    expect(onChangeComplete.mock.calls.at(-1)?.[0]?.toHsb()).toEqual({
      h: 0,
      s: 51,
      b: 51,
      a: 0.5,
    })
  })

  it('uses larger keyboard steps with Shift and supports Home and End on alpha and saturation', () => {
    const onChange = vi.fn()
    render(() => (
      <ColorPicker defaultOpen defaultValue="hsba(0, 50%, 50%, 0.5)" onChange={onChange} />
    ))
    const panel = latestPanel()

    fireEvent.keyDown(panel.getByRole('slider', { name: 'Hue' }), { key: 'End' })
    fireEvent.keyDown(panel.getByRole('slider', { name: 'Hue' }), { key: 'Home' })
    fireEvent.keyDown(panel.getByRole('slider', { name: 'Hue' }), {
      key: 'ArrowRight',
      shiftKey: true,
    })
    fireEvent.keyDown(panel.getByRole('slider', { name: 'Alpha' }), { key: 'End' })
    fireEvent.keyDown(panel.getByRole('slider', { name: 'Alpha' }), { key: 'Home' })
    fireEvent.keyDown(panel.getByRole('slider', { name: 'Saturation and brightness' }), {
      key: 'End',
    })
    fireEvent.keyDown(panel.getByRole('slider', { name: 'Saturation and brightness' }), {
      key: 'Home',
    })

    expect(onChange.mock.calls.map((call) => call[0]?.toHsb())).toEqual([
      { h: 0, s: 50, b: 50, a: 0.5 },
      { h: 0, s: 50, b: 50, a: 0.5 },
      { h: 9, s: 50, b: 50, a: 0.5 },
      { h: 9, s: 50, b: 50, a: 1 },
      { h: 9, s: 50, b: 50, a: 0 },
      { h: 10, s: 100, b: 100, a: 0 },
      { h: 0, s: 0, b: 0, a: 0 },
    ])
  })

  it('does not change sliders from keyboard when disabled', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    render(() => (
      <ColorPicker
        disabled
        defaultOpen
        defaultValue="hsba(0, 50%, 50%, 0.5)"
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    ))
    const panel = latestPanel()

    fireEvent.keyDown(panel.getByRole('slider', { name: 'Hue' }), { key: 'ArrowRight' })
    fireEvent.keyDown(panel.getByRole('slider', { name: 'Alpha' }), { key: 'ArrowRight' })
    fireEvent.keyDown(panel.getByRole('slider', { name: 'Saturation and brightness' }), {
      key: 'ArrowRight',
    })

    expect(onChange).not.toHaveBeenCalled()
    expect(onChangeComplete).not.toHaveBeenCalled()
    expect(panel.getByText('rgba(128, 64, 64, 0.5)')).toBeInTheDocument()
  })

  it('prevents disabled presets, clear, and hover opening while allowing disabled close behavior', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    const onOpenChange = vi.fn()
    const result = render(() => (
      <ColorPicker
        disabled
        defaultOpen
        defaultValue="#1677ff"
        trigger="hover"
        allowClear
        presets={[{ colors: ['#52c41a'] }]}
        onChange={onChange}
        onChangeComplete={onChangeComplete}
        onOpenChange={onOpenChange}
      />
    ))
    const panel = latestPanel()
    const trigger = result.getByRole('button', { name: /color picker/i })

    expect(trigger).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(panel.getByRole('button', { name: 'Select preset color #52c41a' }))
    fireEvent.click(panel.getByRole('button', { name: 'Clear color' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(onChangeComplete).not.toHaveBeenCalled()
    expect(panel.getByText('rgb(22, 119, 255)')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onOpenChange).toHaveBeenLastCalledWith(false)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')

    fireEvent.mouseEnter(trigger)

    expect(onOpenChange).toHaveBeenCalledTimes(1)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })
})

it('uses explicit zIndex and custom popup container', () => {
  const popupContainer = document.createElement('div')
  document.body.appendChild(popupContainer)
  render(() => <ColorPicker open zIndex={1237} getPopupContainer={() => popupContainer} />)

  const popup = popupContainer.querySelector<HTMLElement>('.ads-color-picker-popup')!
  expect(popup).toBeTruthy()
  expect(popup.style.zIndex).toBe('1237')
})

it('renders popup in a portal with fixed positioning and explicit zIndex', () => {
  const result = render(() => <ColorPicker zIndex={1314} />)
  const trigger = result.getByRole('button', { name: /color picker/i })
  const rectSpy = vi.spyOn(trigger, 'getBoundingClientRect').mockReturnValue({
    top: 10,
    bottom: 42,
    left: 20,
    right: 220,
    width: 200,
    height: 32,
    x: 20,
    y: 10,
    toJSON: () => ({}),
  } as DOMRect)

  fireEvent.click(trigger)

  const popup = screen.getAllByRole('dialog', { name: 'Color Picker Panel' }).at(-1) as HTMLElement
  expect(result.container.querySelector('.ads-color-picker-popup')).toBeFalsy()
  expect(popup.style.position).toBe('fixed')
  expect(popup.style.top).toBe('46px')
  expect(popup.style.left).toBe('20px')
  expect(popup.style.zIndex).toBe('1314')
  rectSpy.mockRestore()
})

it('updates portaled popup position when the page scrolls', () => {
  const result = render(() => <ColorPicker />)
  const trigger = result.getByRole('button', { name: /color picker/i })
  const rectSpy = vi
    .spyOn(trigger, 'getBoundingClientRect')
    .mockReturnValueOnce({
      top: 10,
      bottom: 42,
      left: 20,
      right: 220,
      width: 200,
      height: 32,
      x: 20,
      y: 10,
      toJSON: () => ({}),
    } as DOMRect)
    .mockReturnValueOnce({
      top: 10,
      bottom: 42,
      left: 20,
      right: 220,
      width: 200,
      height: 32,
      x: 20,
      y: 10,
      toJSON: () => ({}),
    } as DOMRect)
    .mockReturnValue({
      top: 30,
      bottom: 62,
      left: 40,
      right: 240,
      width: 200,
      height: 32,
      x: 40,
      y: 30,
      toJSON: () => ({}),
    } as DOMRect)

  fireEvent.click(trigger)

  const popup = screen.getAllByRole('dialog', { name: 'Color Picker Panel' }).at(-1) as HTMLElement
  expect(popup.style.top).toBe('46px')
  expect(popup.style.left).toBe('20px')

  window.dispatchEvent(new Event('scroll'))

  expect(popup.style.top).toBe('66px')
  expect(popup.style.left).toBe('40px')
  rectSpy.mockRestore()
})
