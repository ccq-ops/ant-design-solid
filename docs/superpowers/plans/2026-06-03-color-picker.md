# ColorPicker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an Ant Design-inspired Solid `ColorPicker` with custom panel interactions, format editing, presets, docs, and tests.

**Architecture:** The component normalizes all values through a focused `color.ts` utility module using an HSB + alpha internal model. `color-picker.tsx` owns controlled/uncontrolled value and popup state, composes small internal panel controls, and uses existing portal/placement/overlay helpers. Styling follows existing `useStyleRegister` patterns and docs integrate with the existing route/nav system.

**Tech Stack:** SolidJS, TypeScript, `@solidjs/testing-library`, Vitest, existing `@ant-design-solid/cssinjs`, `@ant-design-solid/theme`, and local overlay helpers.

---

## File Structure

Create:

- `packages/components/src/color-picker/color.ts` — pure color parsing, clamping, conversion, and `Color` wrapper helpers.
- `packages/components/src/color-picker/interface.ts` — public ColorPicker types and props.
- `packages/components/src/color-picker/color-picker.style.ts` — tokenized styles for trigger, popup, panel, gradients, inputs, presets, and disabled states.
- `packages/components/src/color-picker/color-picker.tsx` — Solid component, popup state, pointer interactions, format inputs, presets, clear, panel render.
- `packages/components/src/color-picker/index.ts` — component exports.
- `packages/components/src/color-picker/__tests__/color-picker.test.tsx` — behavior tests for utils and component.
- `apps/docs/src/routes/components/color-picker.tsx` — docs demos.

Modify:

- `packages/components/src/index.ts` — export ColorPicker.
- `apps/docs/src/site/nav.ts` — add docs navigation entry.

---

### Task 1: Color Model and Conversion Utilities

**Files:**

- Create: `packages/components/src/color-picker/color.ts`
- Test: `packages/components/src/color-picker/__tests__/color-picker.test.tsx`

- [ ] **Step 1: Create the test directory and write failing color utility tests**

Create `packages/components/src/color-picker/__tests__/color-picker.test.tsx` with these initial tests:

```tsx
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
```

- [ ] **Step 2: Run the focused test to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- color-picker.test.tsx
```

Expected: FAIL because `../color` does not exist.

- [ ] **Step 3: Implement color utilities**

Create `packages/components/src/color-picker/color.ts`:

```ts
export interface RgbColor {
  r: number
  g: number
  b: number
  a: number
}

export interface HsbColor {
  h: number
  s: number
  b: number
  a: number
}

export type ColorPickerValue = string | Color | RgbColor | HsbColor

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i
const RGB_RE = /^rgba?\(([^)]+)\)$/i
const HSB_RE = /^hsba?\(([^)]+)\)$/i

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function round(value: number): number {
  return Math.round(value)
}

function roundAlpha(value: number): number {
  return Number(clamp(value, 0, 1).toFixed(2))
}

function normalizeHue(value: number): number {
  if (!Number.isFinite(value)) return 0
  const next = value % 360
  return next < 0 ? next + 360 : next
}

function toHexByte(value: number): string {
  return clamp(round(value), 0, 255).toString(16).padStart(2, '0')
}

function parseNumericPart(part: string): number | undefined {
  const trimmed = part.trim().replace(/%$/, '')
  if (!trimmed) return undefined
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : undefined
}

function expandHex(hex: string): string {
  if (hex.length !== 3) return hex
  return hex
    .split('')
    .map((part) => part + part)
    .join('')
}

export function rgbToHsb(rgb: RgbColor): HsbColor {
  const r = clamp(rgb.r, 0, 255) / 255
  const g = clamp(rgb.g, 0, 255) / 255
  const b = clamp(rgb.b, 0, 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min
  let h = 0

  if (delta !== 0) {
    if (max === r) h = 60 * (((g - b) / delta) % 6)
    else if (max === g) h = 60 * ((b - r) / delta + 2)
    else h = 60 * ((r - g) / delta + 4)
  }

  return {
    h: round(normalizeHue(h)),
    s: max === 0 ? 0 : round((delta / max) * 100),
    b: round(max * 100),
    a: roundAlpha(rgb.a),
  }
}

export function hsbToRgb(hsb: HsbColor): RgbColor {
  const h = normalizeHue(hsb.h)
  const s = clamp(hsb.s, 0, 100) / 100
  const v = clamp(hsb.b, 0, 100) / 100
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r = 0
  let g = 0
  let b = 0

  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  return {
    r: round((r + m) * 255),
    g: round((g + m) * 255),
    b: round((b + m) * 255),
    a: roundAlpha(hsb.a),
  }
}

export function normalizeHsb(input: HsbColor): HsbColor {
  return {
    h: round(normalizeHue(input.h)),
    s: round(clamp(input.s, 0, 100)),
    b: round(clamp(input.b, 0, 100)),
    a: roundAlpha(input.a),
  }
}

export function normalizeRgb(input: RgbColor): RgbColor {
  return {
    r: round(clamp(input.r, 0, 255)),
    g: round(clamp(input.g, 0, 255)),
    b: round(clamp(input.b, 0, 255)),
    a: roundAlpha(input.a),
  }
}

export class Color {
  private readonly hsb: HsbColor

  constructor(input: HsbColor) {
    this.hsb = normalizeHsb(input)
  }

  static fromHsb(input: HsbColor): Color {
    return new Color(input)
  }

  static fromRgb(input: RgbColor): Color {
    return new Color(rgbToHsb(normalizeRgb(input)))
  }

  toHsb(): HsbColor {
    return { ...this.hsb }
  }

  toRgb(): RgbColor {
    return hsbToRgb(this.hsb)
  }

  toHex(): string {
    const rgb = this.toRgb()
    return `${toHexByte(rgb.r)}${toHexByte(rgb.g)}${toHexByte(rgb.b)}`
  }

  toHexString(): string {
    return `#${this.toHex()}`
  }

  toRgbString(): string {
    const rgb = this.toRgb()
    if (rgb.a < 1) return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
  }

  toHsbString(): string {
    const hsb = this.toHsb()
    if (hsb.a < 1) return `hsba(${hsb.h}, ${hsb.s}%, ${hsb.b}%, ${hsb.a})`
    return `hsb(${hsb.h}, ${hsb.s}%, ${hsb.b}%)`
  }
}

function parseHex(value: string): Color | undefined {
  const match = value.trim().match(HEX_RE)
  if (!match) return undefined
  const hex = expandHex(match[1].slice(0, 6))
  const alphaHex = match[1].length === 8 ? match[1].slice(6, 8) : undefined
  const rgb = {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
    a: alphaHex ? roundAlpha(Number.parseInt(alphaHex, 16) / 255) : 1,
  }
  return Color.fromRgb(rgb)
}

function parseRgb(value: string): Color | undefined {
  const match = value.trim().match(RGB_RE)
  if (!match) return undefined
  const parts = match[1].split(',').map(parseNumericPart)
  if (parts.length < 3 || parts.slice(0, 3).some((part) => part === undefined)) return undefined
  return Color.fromRgb({ r: parts[0]!, g: parts[1]!, b: parts[2]!, a: parts[3] ?? 1 })
}

function parseHsb(value: string): Color | undefined {
  const match = value.trim().match(HSB_RE)
  if (!match) return undefined
  const parts = match[1].split(',').map(parseNumericPart)
  if (parts.length < 3 || parts.slice(0, 3).some((part) => part === undefined)) return undefined
  return Color.fromHsb({ h: parts[0]!, s: parts[1]!, b: parts[2]!, a: parts[3] ?? 1 })
}

function isRgbColor(value: object): value is RgbColor {
  return 'r' in value && 'g' in value && 'b' in value
}

function isHsbColor(value: object): value is HsbColor {
  return 'h' in value && 's' in value && 'b' in value
}

export function parseColor(value: ColorPickerValue | undefined): Color | undefined {
  if (value === undefined || value === null) return undefined
  if (value instanceof Color) return value
  if (typeof value === 'string') return parseHex(value) ?? parseRgb(value) ?? parseHsb(value)
  if (typeof value === 'object') {
    if (isRgbColor(value)) return Color.fromRgb({ ...value, a: value.a ?? 1 })
    if (isHsbColor(value)) return Color.fromHsb({ ...value, a: value.a ?? 1 })
  }
  return undefined
}

export function colorFromHsb(input: HsbColor): Color {
  return Color.fromHsb(input)
}

export function colorToCss(value: Color | undefined): string {
  return value?.toRgbString() ?? 'transparent'
}
```

- [ ] **Step 4: Run focused test to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- color-picker.test.tsx
```

Expected: PASS for the color utility tests.

- [ ] **Step 5: Commit Task 1**

```bash
git add packages/components/src/color-picker/color.ts packages/components/src/color-picker/__tests__/color-picker.test.tsx
git commit -m "feat: add color picker color utilities"
```

---

### Task 2: Public Interface and Basic Trigger

**Files:**

- Create: `packages/components/src/color-picker/interface.ts`
- Create: `packages/components/src/color-picker/color-picker.tsx`
- Create: `packages/components/src/color-picker/color-picker.style.ts`
- Create: `packages/components/src/color-picker/index.ts`
- Modify: `packages/components/src/index.ts`
- Test: `packages/components/src/color-picker/__tests__/color-picker.test.tsx`

- [ ] **Step 1: Append failing trigger/export tests**

Append these tests to `packages/components/src/color-picker/__tests__/color-picker.test.tsx`:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { vi } from 'vitest'
import { ColorPicker } from '../index'

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

  it('does not open when disabled', () => {
    const onOpenChange = vi.fn()
    const result = render(() => <ColorPicker disabled onOpenChange={onOpenChange} />)
    const trigger = result.getByRole('button', { name: /color picker/i })

    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-disabled', 'true')
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(result.queryByRole('dialog')).toBeNull()
  })
})
```

- [ ] **Step 2: Run focused test to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- color-picker.test.tsx
```

Expected: FAIL because `../index` and `ColorPicker` do not exist.

- [ ] **Step 3: Create public interface**

Create `packages/components/src/color-picker/interface.ts`:

```ts
import type { ComponentSize } from '@ant-design-solid/theme'
import type { JSX } from 'solid-js'
import type { DropdownPlacement } from '../shared/placement'
import type { Color, ColorPickerValue } from './color'

export type ColorPickerFormat = 'hex' | 'rgb' | 'hsb'
export type ColorPickerTrigger = 'click' | 'hover'

export interface ColorPickerPreset {
  label?: JSX.Element
  colors: string[]
}

export interface ColorPickerPanelRenderExtra {
  components: Record<string, JSX.Element>
}

export interface ColorPickerProps extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  'value' | 'defaultValue' | 'onChange'
> {
  value?: ColorPickerValue
  defaultValue?: ColorPickerValue
  onChange?: (value: Color | undefined, hex: string) => void
  onChangeComplete?: (value: Color | undefined) => void
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  disabled?: boolean
  size?: ComponentSize
  placement?: DropdownPlacement
  trigger?: ColorPickerTrigger
  format?: ColorPickerFormat
  defaultFormat?: ColorPickerFormat
  disabledAlpha?: boolean
  allowClear?: boolean
  showText?: boolean | ((color: Color | undefined) => JSX.Element)
  presets?: ColorPickerPreset[]
  panelRender?: (panel: JSX.Element, extra: ColorPickerPanelRenderExtra) => JSX.Element
  popupClass?: string
  popupStyle?: JSX.CSSProperties
}
```

- [ ] **Step 4: Create minimal style registration**

Create `packages/components/src/color-picker/color-picker.style.ts`:

```ts
import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useColorPickerStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['ColorPicker', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          display: 'inline-flex',
          'align-items': 'center',
          gap: `${t.marginXS}px`,
          height: `${t.controlHeight}px`,
          padding: `4px ${t.paddingXS}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          background: t.colorBgContainer,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          cursor: 'pointer',
          transition: `all ${t.motionDurationMid} ${t.motionEaseInOut}`,
        },
        [`.${prefixCls}:hover`]: {
          'border-color': t.colorPrimaryHover,
        },
        [`.${prefixCls}-sm`]: {
          height: `${t.controlHeightSM}px`,
          padding: `2px ${t.paddingXS}px`,
        },
        [`.${prefixCls}-lg`]: {
          height: `${t.controlHeightLG}px`,
          padding: `6px ${t.paddingSM}px`,
        },
        [`.${prefixCls}-disabled`]: {
          color: t.colorTextDisabled,
          background: t.colorFillAlter,
          cursor: 'not-allowed',
          '&:hover': { 'border-color': t.colorBorder },
        },
        [`.${prefixCls}-color-block`]: {
          width: '20px',
          height: '20px',
          padding: '2px',
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
          'border-radius': `${t.borderRadiusSM}px`,
          background:
            'linear-gradient(45deg, #ddd 25%, transparent 25%), linear-gradient(-45deg, #ddd 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ddd 75%), linear-gradient(-45deg, transparent 75%, #ddd 75%)',
          'background-size': '8px 8px',
          'background-position': '0 0, 0 4px, 4px -4px, -4px 0px',
        },
        [`.${prefixCls}-color-block-inner`]: {
          display: 'block',
          width: '100%',
          height: '100%',
          'border-radius': `${Math.max(1, t.borderRadiusSM - 1)}px`,
        },
        [`.${prefixCls}-text`]: {
          'line-height': 1,
        },
      }
    },
  )
}
```

- [ ] **Step 5: Create minimal trigger component**

Create `packages/components/src/color-picker/color-picker.tsx`:

```tsx
import { createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { colorToCss, parseColor } from './color'
import type { Color } from './color'
import type { ColorPickerProps } from './interface'
import { useColorPickerStyle } from './color-picker.style'

function renderText(showText: ColorPickerProps['showText'], color: Color | undefined): JSX.Element {
  if (typeof showText === 'function') return showText(color)
  if (showText) return color?.toHexString() ?? ''
  return undefined
}

export function ColorPicker(props: ColorPickerProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'onChange',
    'onChangeComplete',
    'open',
    'defaultOpen',
    'onOpenChange',
    'disabled',
    'size',
    'placement',
    'trigger',
    'format',
    'defaultFormat',
    'disabledAlpha',
    'allowClear',
    'showText',
    'presets',
    'panelRender',
    'popupClass',
    'popupStyle',
    'class',
    'style',
    'onClick',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-color-picker`
  const [, hashId] = useColorPickerStyle(prefixCls())
  const [innerColor] = createSignal(parseColor(local.defaultValue))
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))

  const size = () => local.size ?? config.componentSize()
  const disabled = () => Boolean(local.disabled)
  const mergedColor = () => parseColor(local.value) ?? innerColor()
  const open = () => Boolean(local.open ?? innerOpen())

  function setOpen(nextOpen: boolean): void {
    if (disabled()) return
    if (local.open === undefined) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  return (
    <button
      {...rest}
      type="button"
      class={classNames(
        prefixCls(),
        size() === 'small' && `${prefixCls()}-sm`,
        size() === 'large' && `${prefixCls()}-lg`,
        disabled() && `${prefixCls()}-disabled`,
        hashId(),
        local.class,
      )}
      style={local.style}
      disabled={disabled()}
      aria-label="Color Picker"
      aria-haspopup="dialog"
      aria-expanded={open() ? 'true' : 'false'}
      aria-disabled={disabled() ? 'true' : undefined}
      onClick={(event) => {
        ;(local.onClick as ((event: MouseEvent) => void) | undefined)?.(event)
        if (event.defaultPrevented || local.trigger === 'hover') return
        setOpen(!open())
      }}
    >
      <span class={`${prefixCls()}-color-block`} aria-hidden="true">
        <span
          class={`${prefixCls()}-color-block-inner`}
          style={{ background: colorToCss(mergedColor()) }}
        />
      </span>
      {local.showText && (
        <span class={`${prefixCls()}-text`}>{renderText(local.showText, mergedColor())}</span>
      )}
    </button>
  )
}
```

- [ ] **Step 6: Create component index and export from package**

Create `packages/components/src/color-picker/index.ts`:

```ts
export * from './color'
export * from './interface'
export * from './color-picker'
```

Modify `packages/components/src/index.ts` by adding the export near other data entry components:

```ts
export * from './color-picker'
```

Place it after `export * from './calendar'` or near `date-picker` if preserving category order.

- [ ] **Step 7: Run focused test to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- color-picker.test.tsx
```

Expected: PASS for utility and trigger tests.

- [ ] **Step 8: Commit Task 2**

```bash
git add packages/components/src/color-picker packages/components/src/index.ts
git commit -m "feat: add color picker trigger"
```

---

### Task 3: Popup Panel, Open State, and Closing Behavior

**Files:**

- Modify: `packages/components/src/color-picker/color-picker.tsx`
- Modify: `packages/components/src/color-picker/color-picker.style.ts`
- Test: `packages/components/src/color-picker/__tests__/color-picker.test.tsx`

- [ ] **Step 1: Append failing popup tests**

Append to the `ColorPicker trigger` describe block or add a new `describe('ColorPicker popup', ...)` block:

```tsx
describe('ColorPicker popup', () => {
  it('opens and closes the popup from trigger, Escape, and outside pointer down', () => {
    const onOpenChange = vi.fn()
    const result = render(() => <ColorPicker defaultValue="#1677ff" onOpenChange={onOpenChange} />)
    const trigger = result.getByRole('button', { name: /color picker/i })

    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(result.getByRole('dialog')).toBeInTheDocument()
    expect(onOpenChange).toHaveBeenLastCalledWith(true)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(result.queryByRole('dialog')).toBeNull()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)

    fireEvent.click(trigger)
    expect(result.getByRole('dialog')).toBeInTheDocument()

    fireEvent.pointerDown(document.body)

    expect(result.queryByRole('dialog')).toBeNull()
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('supports controlled open state', () => {
    const [open, setOpen] = createSignal(false)
    const onOpenChange = vi.fn((next: boolean) => setOpen(next))
    const result = render(() => <ColorPicker open={open()} onOpenChange={onOpenChange} />)
    const trigger = result.getByRole('button', { name: /color picker/i })

    fireEvent.click(trigger)

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(result.getByRole('dialog')).toBeInTheDocument()
  })

  it('supports panelRender wrapping', () => {
    const result = render(() => (
      <ColorPicker
        defaultOpen
        panelRender={(panel) => <section data-testid="custom-panel">{panel}</section>}
      />
    ))

    expect(result.getByTestId('custom-panel')).toBeInTheDocument()
    expect(result.getByRole('dialog')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run focused test to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- color-picker.test.tsx
```

Expected: FAIL because no popup dialog renders.

- [ ] **Step 3: Extend styles for popup and panel shell**

Add these selectors inside the style object in `color-picker.style.ts`:

```ts
        [`.${prefixCls}-popup`]: {
          position: 'fixed',
          'z-index': 1050,
          width: '280px',
          padding: `${t.paddingSM}px`,
          background: t.colorBgElevated,
          'border-radius': `${t.borderRadiusLG}px`,
          'box-shadow': t.boxShadowSecondary,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
        },
        [`.${prefixCls}-panel`]: {
          display: 'flex',
          'flex-direction': 'column',
          gap: `${t.marginSM}px`,
        },
        [`.${prefixCls}-preview`]: {
          display: 'flex',
          'align-items': 'center',
          gap: `${t.marginXS}px`,
        },
```

- [ ] **Step 4: Implement popup shell and close behavior**

Update `color-picker.tsx` imports:

```tsx
import { Show, createSignal, onCleanup, splitProps } from 'solid-js'
import { addDocumentKeydown, addDocumentPointerDown } from '../shared/overlay'
import { getDropdownPosition, type OverlayPosition } from '../shared/placement'
import { InternalPortal, canUseDom } from '../shared/portal'
```

Inside `ColorPicker`, add refs and position state:

```tsx
const [position, setPosition] = createSignal<OverlayPosition>({ top: '0px', left: '0px' })
let triggerRef: HTMLButtonElement | undefined
let popupRef: HTMLDivElement | undefined

const placement = () => local.placement ?? 'bottomLeft'
```

Add these functions before `return`:

```tsx
function updatePosition(): void {
  if (!canUseDom() || !triggerRef) return
  setPosition(getDropdownPosition(triggerRef.getBoundingClientRect(), placement(), 4))
}

function setOpen(nextOpen: boolean): void {
  if (disabled()) return
  if (nextOpen) updatePosition()
  if (local.open === undefined) setInnerOpen(nextOpen)
  local.onOpenChange?.(nextOpen)
}

function containsTarget(target: EventTarget | null): boolean {
  return Boolean(
    target instanceof Node && (triggerRef?.contains(target) || popupRef?.contains(target)),
  )
}

const removeKeydown = addDocumentKeydown((event) => {
  if (event.key === 'Escape' && open()) setOpen(false)
})
const removePointerDown = addDocumentPointerDown((event) => {
  if (open() && !containsTarget(event.target)) setOpen(false)
})

onCleanup(() => {
  removeKeydown()
  removePointerDown()
})

const panel = () => (
  <div class={`${prefixCls()}-panel`}>
    <div class={`${prefixCls()}-preview`}>
      <span class={`${prefixCls()}-color-block`} aria-hidden="true">
        <span
          class={`${prefixCls()}-color-block-inner`}
          style={{ background: colorToCss(mergedColor()) }}
        />
      </span>
      <span>{mergedColor()?.toRgbString() ?? 'No color'}</span>
    </div>
  </div>
)

const renderedPanel = () => {
  const content = panel()
  return local.panelRender
    ? local.panelRender(content, { components: { picker: content } })
    : content
}
```

Replace the single `<button>` return with a fragment containing the button and portal. Ensure the button gets a ref:

```tsx
return (
  <>
    <button
      {...rest}
      ref={(element) => {
        triggerRef = element
      }}
      type="button"
      class={classNames(
        prefixCls(),
        size() === 'small' && `${prefixCls()}-sm`,
        size() === 'large' && `${prefixCls()}-lg`,
        disabled() && `${prefixCls()}-disabled`,
        hashId(),
        local.class,
      )}
      style={local.style}
      disabled={disabled()}
      aria-label="Color Picker"
      aria-haspopup="dialog"
      aria-expanded={open() ? 'true' : 'false'}
      aria-disabled={disabled() ? 'true' : undefined}
      onClick={(event) => {
        ;(local.onClick as ((event: MouseEvent) => void) | undefined)?.(event)
        if (event.defaultPrevented || local.trigger === 'hover') return
        setOpen(!open())
      }}
    >
      <span class={`${prefixCls()}-color-block`} aria-hidden="true">
        <span
          class={`${prefixCls()}-color-block-inner`}
          style={{ background: colorToCss(mergedColor()) }}
        />
      </span>
      {local.showText && (
        <span class={`${prefixCls()}-text`}>{renderText(local.showText, mergedColor())}</span>
      )}
    </button>
    <Show when={open()}>
      <InternalPortal>
        <div
          ref={(element) => {
            popupRef = element
          }}
          role="dialog"
          aria-label="Color Picker Panel"
          class={classNames(`${prefixCls()}-popup`, hashId(), local.popupClass)}
          style={{ ...position(), ...local.popupStyle }}
          on:click={(event) => event.stopPropagation()}
        >
          {renderedPanel()}
        </div>
      </InternalPortal>
    </Show>
  </>
)
```

Remove the earlier duplicate `setOpen` function from Task 2 when adding the version above.

- [ ] **Step 5: Run focused test to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- color-picker.test.tsx
```

Expected: PASS through popup tests.

- [ ] **Step 6: Commit Task 3**

```bash
git add packages/components/src/color-picker
git commit -m "feat: add color picker popup"
```

---

### Task 4: Saturation, Hue, Alpha Interactions and Value Changes

**Files:**

- Modify: `packages/components/src/color-picker/color-picker.tsx`
- Modify: `packages/components/src/color-picker/color-picker.style.ts`
- Test: `packages/components/src/color-picker/__tests__/color-picker.test.tsx`

- [ ] **Step 1: Add failing pointer interaction tests and helper**

Add this helper near the top of `color-picker.test.tsx`:

```tsx
function mockRect(element: Element, rect: Partial<DOMRect>) {
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 100,
    bottom: 100,
    width: 100,
    height: 100,
    toJSON: () => ({}),
    ...rect,
  } as DOMRect)
}
```

Append tests:

```tsx
describe('ColorPicker picking interactions', () => {
  it('changes color from saturation area and completes on pointer release', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    const result = render(() => (
      <ColorPicker
        defaultOpen
        defaultValue="#ff0000"
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    ))
    const saturation = result.getByLabelText('Saturation and brightness')
    mockRect(saturation, { left: 0, top: 0, width: 100, height: 100 })

    fireEvent.pointerDown(saturation, { clientX: 50, clientY: 25, pointerId: 1 })
    fireEvent.pointerUp(document, { clientX: 50, clientY: 25, pointerId: 1 })

    expect(onChange).toHaveBeenCalled()
    expect(onChange.mock.lastCall?.[0]?.toHsb()).toEqual({ h: 0, s: 50, b: 75, a: 1 })
    expect(onChangeComplete.mock.lastCall?.[0]?.toHsb()).toEqual({ h: 0, s: 50, b: 75, a: 1 })
  })

  it('changes hue and alpha from sliders', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <ColorPicker defaultOpen defaultValue="#ff0000" onChange={onChange} />
    ))
    const hue = result.getByLabelText('Hue')
    const alpha = result.getByLabelText('Alpha')
    mockRect(hue, { left: 0, width: 360 })
    mockRect(alpha, { left: 0, width: 100 })

    fireEvent.pointerDown(hue, { clientX: 120, pointerId: 2 })
    fireEvent.pointerUp(document, { clientX: 120, pointerId: 2 })
    expect(onChange.mock.lastCall?.[0]?.toHsb().h).toBe(120)

    fireEvent.pointerDown(alpha, { clientX: 40, pointerId: 3 })
    fireEvent.pointerUp(document, { clientX: 40, pointerId: 3 })
    expect(onChange.mock.lastCall?.[0]?.toRgb().a).toBe(0.4)
  })

  it('hides alpha slider when disabledAlpha is true', () => {
    const result = render(() => <ColorPicker defaultOpen disabledAlpha />)

    expect(result.queryByLabelText('Alpha')).toBeNull()
  })
})
```

- [ ] **Step 2: Run focused test to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- color-picker.test.tsx
```

Expected: FAIL because the picker controls do not exist.

- [ ] **Step 3: Extend styles for picker controls**

Add these selectors inside `color-picker.style.ts`:

```ts
        [`.${prefixCls}-saturation`]: {
          position: 'relative',
          height: '160px',
          overflow: 'hidden',
          'border-radius': `${t.borderRadius}px`,
          cursor: 'crosshair',
          'touch-action': 'none',
        },
        [`.${prefixCls}-saturation-white`]: {
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, #fff, rgba(255,255,255,0))',
        },
        [`.${prefixCls}-saturation-black`]: {
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(0deg, #000, rgba(0,0,0,0))',
        },
        [`.${prefixCls}-handler`]: {
          position: 'absolute',
          width: '12px',
          height: '12px',
          border: '2px solid #fff',
          'border-radius': '50%',
          'box-shadow': '0 0 0 1px rgba(0,0,0,0.35)',
          transform: 'translate(-50%, -50%)',
          'pointer-events': 'none',
        },
        [`.${prefixCls}-slider`]: {
          position: 'relative',
          height: '12px',
          'border-radius': '999px',
          cursor: 'pointer',
          'touch-action': 'none',
        },
        [`.${prefixCls}-hue`]: {
          background: 'linear-gradient(90deg, red, yellow, lime, cyan, blue, magenta, red)',
        },
        [`.${prefixCls}-alpha`]: {
          backgroundColor: t.colorFillAlter,
        },
        [`.${prefixCls}-slider-handler`]: {
          position: 'absolute',
          top: '50%',
          width: '14px',
          height: '14px',
          border: '2px solid #fff',
          'border-radius': '50%',
          'box-shadow': '0 0 0 1px rgba(0,0,0,0.35)',
          transform: 'translate(-50%, -50%)',
          'pointer-events': 'none',
        },
```

- [ ] **Step 4: Implement value state, emit, and pointer controls**

Update imports in `color-picker.tsx`:

```tsx
import { Show, createMemo, createSignal, onCleanup, splitProps } from 'solid-js'
import { Color, clamp, colorFromHsb, colorToCss, parseColor } from './color'
import type { HsbColor } from './color'
```

Change the value state line from `const [innerColor] = ...` to:

```tsx
const [innerColor, setInnerColor] = createSignal(parseColor(local.defaultValue))
const mergedColor = createMemo(() => parseColor(local.value) ?? innerColor())
const mergedHsb = () => mergedColor()?.toHsb() ?? { h: 0, s: 100, b: 100, a: 1 }
```

Remove the old `const mergedColor = () => ...` line.

Add helpers before `panel`:

```tsx
function emitColor(nextColor: Color | undefined, complete = false): void {
  if (local.value === undefined) setInnerColor(nextColor)
  local.onChange?.(nextColor, nextColor?.toHexString() ?? '')
  if (complete) local.onChangeComplete?.(nextColor)
}

function updateHsb(nextHsb: HsbColor, complete = false): void {
  emitColor(colorFromHsb(nextHsb), complete)
}

function hsbWith(partial: Partial<HsbColor>): HsbColor {
  return { ...mergedHsb(), ...partial }
}

function updateSaturation(event: PointerEvent, element: HTMLElement, complete = false): void {
  const rect = element.getBoundingClientRect()
  const s = clamp(((event.clientX - rect.left) / (rect.width || 1)) * 100, 0, 100)
  const b = clamp((1 - (event.clientY - rect.top) / (rect.height || 1)) * 100, 0, 100)
  updateHsb(hsbWith({ s, b }), complete)
}

function updateSlider(
  event: PointerEvent,
  element: HTMLElement,
  type: 'hue' | 'alpha',
  complete = false,
): void {
  const rect = element.getBoundingClientRect()
  const ratio = clamp((event.clientX - rect.left) / (rect.width || 1), 0, 1)
  updateHsb(type === 'hue' ? hsbWith({ h: ratio * 360 }) : hsbWith({ a: ratio }), complete)
}

function startPointerDrag(
  event: PointerEvent,
  element: HTMLElement,
  move: (event: PointerEvent, complete?: boolean) => void,
): void {
  if (disabled()) return
  event.preventDefault()
  const pointerId = event.pointerId
  move(event)

  const handleMove = (moveEvent: PointerEvent) => {
    if (moveEvent.pointerId === pointerId) move(moveEvent)
  }
  const handleEnd = (endEvent: PointerEvent) => {
    if (endEvent.pointerId !== pointerId) return
    move(endEvent, true)
    document.removeEventListener('pointermove', handleMove)
    document.removeEventListener('pointerup', handleEnd)
    document.removeEventListener('pointercancel', handleEnd)
  }

  element.setPointerCapture?.(pointerId)
  document.addEventListener('pointermove', handleMove)
  document.addEventListener('pointerup', handleEnd)
  document.addEventListener('pointercancel', handleEnd)
}
```

Replace `panel` with:

```tsx
const panel = () => {
  const hsb = mergedHsb()
  const hueColor = colorFromHsb({ h: hsb.h, s: 100, b: 100, a: 1 }).toHexString()
  const currentColor = mergedColor()
  return (
    <div class={`${prefixCls()}-panel`}>
      <div
        class={`${prefixCls()}-saturation`}
        aria-label="Saturation and brightness"
        role="slider"
        aria-valuetext={`${Math.round(hsb.s)}%, ${Math.round(hsb.b)}%`}
        style={{ background: hueColor }}
        onPointerDown={(event) =>
          startPointerDrag(event, event.currentTarget, (nextEvent, complete) =>
            updateSaturation(nextEvent, event.currentTarget, complete),
          )
        }
      >
        <div class={`${prefixCls()}-saturation-white`} />
        <div class={`${prefixCls()}-saturation-black`} />
        <span
          class={`${prefixCls()}-handler`}
          style={{ left: `${hsb.s}%`, top: `${100 - hsb.b}%` }}
        />
      </div>
      <div
        class={classNames(`${prefixCls()}-slider`, `${prefixCls()}-hue`)}
        aria-label="Hue"
        role="slider"
        aria-valuemin="0"
        aria-valuemax="360"
        aria-valuenow={Math.round(hsb.h)}
        onPointerDown={(event) =>
          startPointerDrag(event, event.currentTarget, (nextEvent, complete) =>
            updateSlider(nextEvent, event.currentTarget, 'hue', complete),
          )
        }
      >
        <span class={`${prefixCls()}-slider-handler`} style={{ left: `${(hsb.h / 360) * 100}%` }} />
      </div>
      <Show when={!local.disabledAlpha}>
        <div
          class={classNames(`${prefixCls()}-slider`, `${prefixCls()}-alpha`)}
          aria-label="Alpha"
          role="slider"
          aria-valuemin="0"
          aria-valuemax="1"
          aria-valuenow={hsb.a}
          style={{
            background: `linear-gradient(90deg, transparent, ${currentColor?.toHexString() ?? '#000000'})`,
          }}
          onPointerDown={(event) =>
            startPointerDrag(event, event.currentTarget, (nextEvent, complete) =>
              updateSlider(nextEvent, event.currentTarget, 'alpha', complete),
            )
          }
        >
          <span class={`${prefixCls()}-slider-handler`} style={{ left: `${hsb.a * 100}%` }} />
        </div>
      </Show>
      <div class={`${prefixCls()}-preview`}>
        <span class={`${prefixCls()}-color-block`} aria-hidden="true">
          <span
            class={`${prefixCls()}-color-block-inner`}
            style={{ background: colorToCss(currentColor) }}
          />
        </span>
        <span>{currentColor?.toRgbString() ?? 'No color'}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Run focused test to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- color-picker.test.tsx
```

Expected: PASS through picking interaction tests.

- [ ] **Step 6: Commit Task 4**

```bash
git add packages/components/src/color-picker
git commit -m "feat: add color picker panel interactions"
```

---

### Task 5: Format Selector and HEX/RGB/HSB Inputs

**Files:**

- Modify: `packages/components/src/color-picker/color-picker.tsx`
- Modify: `packages/components/src/color-picker/color-picker.style.ts`
- Test: `packages/components/src/color-picker/__tests__/color-picker.test.tsx`

- [ ] **Step 1: Append failing format input tests**

Append:

```tsx
describe('ColorPicker format inputs', () => {
  it('commits hex input changes on Enter', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <ColorPicker defaultOpen defaultValue="#1677ff" onChange={onChange} />
    ))
    const input = result.getByLabelText('HEX') as HTMLInputElement

    fireEvent.input(input, { target: { value: '#52c41a' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onChange.mock.lastCall?.[0]?.toHexString()).toBe('#52c41a')
    expect(onChange.mock.lastCall?.[1]).toBe('#52c41a')
  })

  it('switches to rgb format and commits channel changes on blur', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <ColorPicker defaultOpen defaultValue="#000000" defaultFormat="rgb" onChange={onChange} />
    ))
    const red = result.getByLabelText('R') as HTMLInputElement
    const green = result.getByLabelText('G') as HTMLInputElement
    const blue = result.getByLabelText('B') as HTMLInputElement

    fireEvent.input(red, { target: { value: '82' } })
    fireEvent.input(green, { target: { value: '196' } })
    fireEvent.input(blue, { target: { value: '26' } })
    fireEvent.blur(blue)

    expect(onChange.mock.lastCall?.[0]?.toHexString()).toBe('#52c41a')
  })

  it('switches controlled format to hsb fields', () => {
    const result = render(() => <ColorPicker defaultOpen defaultValue="#1677ff" format="hsb" />)

    expect(result.getByLabelText('H')).toBeInTheDocument()
    expect(result.getByLabelText('S')).toBeInTheDocument()
    expect(result.getByLabelText('B')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run focused test to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- color-picker.test.tsx
```

Expected: FAIL because format inputs do not exist.

- [ ] **Step 3: Add format input styles**

Add selectors:

```ts
        [`.${prefixCls}-format`]: {
          display: 'flex',
          gap: `${t.marginXS}px`,
          'align-items': 'center',
        },
        [`.${prefixCls}-format-select`]: {
          height: `${t.controlHeightSM}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadiusSM}px`,
          background: t.colorBgContainer,
        },
        [`.${prefixCls}-inputs`]: {
          display: 'grid',
          gap: `${t.marginXS}px`,
          flex: 1,
        },
        [`.${prefixCls}-inputs-hex`]: {
          'grid-template-columns': '1fr',
        },
        [`.${prefixCls}-inputs-rgb`]: {
          'grid-template-columns': localColumns('4'),
        },
        [`.${prefixCls}-inputs-hsb`]: {
          'grid-template-columns': localColumns('4'),
        },
        [`.${prefixCls}-input`]: {
          width: '100%',
          'box-sizing': 'border-box',
          height: `${t.controlHeightSM}px`,
          padding: `0 ${t.paddingXS}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadiusSM}px`,
          background: t.colorBgContainer,
          color: t.colorText,
        },
```

At the top of `useColorPickerStyle`, before `return useStyleRegister`, add:

```ts
const localColumns = (count: string) => `repeat(${count}, minmax(0, 1fr))`
```

- [ ] **Step 4: Implement format state and inputs**

Update imports:

```tsx
import { Color, clamp, colorFromHsb, colorToCss, parseColor } from './color'
import type { ColorPickerFormat } from './interface'
```

Add state after `innerOpen`:

```tsx
const [innerFormat, setInnerFormat] = createSignal<ColorPickerFormat>(local.defaultFormat ?? 'hex')
const format = () => local.format ?? innerFormat()
```

Add helper functions before `panel`:

```tsx
function commitParsedInput(value: string): void {
  const next = parseColor(value)
  if (next) emitColor(next, true)
}

function commitRgbInputs(container: HTMLElement): void {
  const r = Number((container.querySelector('[aria-label="R"]') as HTMLInputElement | null)?.value)
  const g = Number((container.querySelector('[aria-label="G"]') as HTMLInputElement | null)?.value)
  const b = Number((container.querySelector('[aria-label="B"]') as HTMLInputElement | null)?.value)
  const aInput = (container.querySelector('[aria-label="A"]') as HTMLInputElement | null)?.value
  if ([r, g, b].some((value) => !Number.isFinite(value))) return
  emitColor(
    Color.fromRgb({ r, g, b, a: Number.isFinite(Number(aInput)) ? Number(aInput) : 1 }),
    true,
  )
}

function commitHsbInputs(container: HTMLElement): void {
  const h = Number((container.querySelector('[aria-label="H"]') as HTMLInputElement | null)?.value)
  const s = Number((container.querySelector('[aria-label="S"]') as HTMLInputElement | null)?.value)
  const b = Number((container.querySelector('[aria-label="B"]') as HTMLInputElement | null)?.value)
  const aInput = (container.querySelector('[aria-label="A"]') as HTMLInputElement | null)?.value
  if ([h, s, b].some((value) => !Number.isFinite(value))) return
  emitColor(
    Color.fromHsb({ h, s, b, a: Number.isFinite(Number(aInput)) ? Number(aInput) : 1 }),
    true,
  )
}

function handleInputKeyDown(event: KeyboardEvent, commit: () => void): void {
  if (event.key !== 'Enter') return
  event.preventDefault()
  commit()
}

function formatInputs(): JSX.Element {
  const current = mergedColor() ?? Color.fromHsb(mergedHsb())
  const rgb = current.toRgb()
  const hsb = current.toHsb()

  if (format() === 'rgb') {
    return (
      <div
        class={classNames(`${prefixCls()}-inputs`, `${prefixCls()}-inputs-rgb`)}
        onBlur={(event) => commitRgbInputs(event.currentTarget)}
        onKeyDown={(event) => handleInputKeyDown(event, () => commitRgbInputs(event.currentTarget))}
      >
        <input aria-label="R" class={`${prefixCls()}-input`} value={rgb.r} />
        <input aria-label="G" class={`${prefixCls()}-input`} value={rgb.g} />
        <input aria-label="B" class={`${prefixCls()}-input`} value={rgb.b} />
        <input aria-label="A" class={`${prefixCls()}-input`} value={rgb.a} />
      </div>
    )
  }

  if (format() === 'hsb') {
    return (
      <div
        class={classNames(`${prefixCls()}-inputs`, `${prefixCls()}-inputs-hsb`)}
        onBlur={(event) => commitHsbInputs(event.currentTarget)}
        onKeyDown={(event) => handleInputKeyDown(event, () => commitHsbInputs(event.currentTarget))}
      >
        <input aria-label="H" class={`${prefixCls()}-input`} value={hsb.h} />
        <input aria-label="S" class={`${prefixCls()}-input`} value={hsb.s} />
        <input aria-label="B" class={`${prefixCls()}-input`} value={hsb.b} />
        <input aria-label="A" class={`${prefixCls()}-input`} value={hsb.a} />
      </div>
    )
  }

  return (
    <div class={classNames(`${prefixCls()}-inputs`, `${prefixCls()}-inputs-hex`)}>
      <input
        aria-label="HEX"
        class={`${prefixCls()}-input`}
        value={current.toHexString()}
        onBlur={(event) => commitParsedInput(event.currentTarget.value)}
        onKeyDown={(event) =>
          handleInputKeyDown(event, () => commitParsedInput(event.currentTarget.value))
        }
      />
    </div>
  )
}
```

Inside `panel`, add this block before the preview block:

```tsx
<div class={`${prefixCls()}-format`}>
  <select
    aria-label="Color format"
    class={`${prefixCls()}-format-select`}
    value={format()}
    disabled={local.format !== undefined}
    onChange={(event) => setInnerFormat(event.currentTarget.value as ColorPickerFormat)}
  >
    <option value="hex">HEX</option>
    <option value="rgb">RGB</option>
    <option value="hsb">HSB</option>
  </select>
  {formatInputs()}
</div>
```

- [ ] **Step 5: Run focused test to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- color-picker.test.tsx
```

Expected: PASS through format input tests.

- [ ] **Step 6: Commit Task 5**

```bash
git add packages/components/src/color-picker
git commit -m "feat: add color picker format inputs"
```

---

### Task 6: Presets, Clear, Show Text Function, and Hover Trigger

**Files:**

- Modify: `packages/components/src/color-picker/color-picker.tsx`
- Modify: `packages/components/src/color-picker/color-picker.style.ts`
- Test: `packages/components/src/color-picker/__tests__/color-picker.test.tsx`

- [ ] **Step 1: Append failing tests for remaining API behavior**

Append:

```tsx
describe('ColorPicker presets and clear', () => {
  it('selects preset colors and calls onChangeComplete', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    const result = render(() => (
      <ColorPicker
        defaultOpen
        onChange={onChange}
        onChangeComplete={onChangeComplete}
        presets={[{ label: 'Recommended', colors: ['#1677ff', '#52c41a'] }]}
      />
    ))

    fireEvent.click(result.getByRole('button', { name: '#52c41a' }))

    expect(onChange.mock.lastCall?.[0]?.toHexString()).toBe('#52c41a')
    expect(onChangeComplete.mock.lastCall?.[0]?.toHexString()).toBe('#52c41a')
  })

  it('clears value when allowClear is enabled', () => {
    const onChange = vi.fn()
    const onChangeComplete = vi.fn()
    const result = render(() => (
      <ColorPicker
        defaultOpen
        allowClear
        defaultValue="#1677ff"
        onChange={onChange}
        onChangeComplete={onChangeComplete}
      />
    ))

    fireEvent.click(result.getByRole('button', { name: 'Clear color' }))

    expect(onChange).toHaveBeenLastCalledWith(undefined, '')
    expect(onChangeComplete).toHaveBeenLastCalledWith(undefined)
  })

  it('supports showText render function and hover trigger', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <ColorPicker
        defaultValue="#1677ff"
        trigger="hover"
        onOpenChange={onOpenChange}
        showText={(color) => <strong>Picked {color?.toHexString()}</strong>}
      />
    ))
    const trigger = result.getByRole('button', { name: /color picker/i })

    expect(result.getByText('Picked #1677ff')).toBeInTheDocument()

    fireEvent.mouseEnter(trigger)
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(result.getByRole('dialog')).toBeInTheDocument()

    fireEvent.mouseLeave(trigger)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
```

- [ ] **Step 2: Run focused test to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- color-picker.test.tsx
```

Expected: FAIL because presets, clear, and hover trigger are not implemented.

- [ ] **Step 3: Add presets and clear styles**

Add selectors:

```ts
        [`.${prefixCls}-presets`]: {
          display: 'flex',
          'flex-direction': 'column',
          gap: `${t.marginXS}px`,
        },
        [`.${prefixCls}-preset-label`]: {
          color: t.colorTextSecondary,
          'font-size': `${t.fontSizeSM}px`,
        },
        [`.${prefixCls}-preset-colors`]: {
          display: 'flex',
          'flex-wrap': 'wrap',
          gap: `${t.marginXS}px`,
        },
        [`.${prefixCls}-preset-color`]: {
          width: '20px',
          height: '20px',
          padding: 0,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadiusSM}px`,
          cursor: 'pointer',
        },
        [`.${prefixCls}-actions`]: {
          display: 'flex',
          'justify-content': 'flex-end',
        },
        [`.${prefixCls}-clear`]: {
          height: `${t.controlHeightSM}px`,
          padding: `0 ${t.paddingSM}px`,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadiusSM}px`,
          background: t.colorBgContainer,
          cursor: 'pointer',
        },
```

- [ ] **Step 4: Implement presets, clear, and hover handlers**

Update imports:

```tsx
import { For, Show, createMemo, createSignal, onCleanup, splitProps } from 'solid-js'
```

Add functions before `panel`:

```tsx
function clearColor(): void {
  emitColor(undefined, true)
}

function selectPreset(value: string): void {
  const next = parseColor(value)
  if (next) emitColor(next, true)
}

function presetList(): JSX.Element {
  return (
    <Show when={local.presets?.length}>
      <div class={`${prefixCls()}-presets`}>
        <For each={local.presets}>
          {(preset) => (
            <div>
              <Show when={preset.label}>
                <div class={`${prefixCls()}-preset-label`}>{preset.label}</div>
              </Show>
              <div class={`${prefixCls()}-preset-colors`}>
                <For each={preset.colors}>
                  {(presetColor) => (
                    <button
                      type="button"
                      aria-label={presetColor}
                      class={`${prefixCls()}-preset-color`}
                      style={{ background: colorToCss(parseColor(presetColor)) }}
                      onClick={() => selectPreset(presetColor)}
                    />
                  )}
                </For>
              </div>
            </div>
          )}
        </For>
      </div>
    </Show>
  )
}
```

Inside `panel`, insert `{presetList()}` after the format block and before preview. Insert actions before the closing panel div:

```tsx
<Show when={local.allowClear}>
  <div class={`${prefixCls()}-actions`}>
    <button type="button" class={`${prefixCls()}-clear`} onClick={clearColor}>
      Clear color
    </button>
  </div>
</Show>
```

Add button handlers on the trigger:

```tsx
        onMouseEnter={() => {
          if (local.trigger === 'hover') setOpen(true)
        }}
        onMouseLeave={() => {
          if (local.trigger === 'hover') setOpen(false)
        }}
```

Place them alongside the existing `onClick` on the trigger button.

- [ ] **Step 5: Run focused test to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- color-picker.test.tsx
```

Expected: PASS all `color-picker.test.tsx` tests.

- [ ] **Step 6: Commit Task 6**

```bash
git add packages/components/src/color-picker
git commit -m "feat: add color picker presets and clear"
```

---

### Task 7: Docs Page and Navigation

**Files:**

- Create: `apps/docs/src/routes/components/color-picker.tsx`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Add the docs route**

Create `apps/docs/src/routes/components/color-picker.tsx`:

```tsx
import { createSignal } from 'solid-js'
import { ColorPicker, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

export default function ColorPickerPage() {
  const [value, setValue] = createSignal('#1677ff')

  return (
    <>
      <h1>ColorPicker</h1>
      <DemoBlock title="Basic" code={`<ColorPicker defaultValue="#1677ff" />`}>
        <ColorPicker defaultValue="#1677ff" />
      </DemoBlock>
      <DemoBlock
        title="Controlled"
        code={`const [value, setValue] = createSignal('#1677ff')\n<ColorPicker value={value()} onChange={(color) => setValue(color?.toHexString() ?? '')} showText />`}
      >
        <Space direction="vertical">
          <ColorPicker
            value={value()}
            showText
            onChange={(color) => setValue(color?.toHexString() ?? '')}
          />
          <span>Current value: {value()}</span>
        </Space>
      </DemoBlock>
      <DemoBlock
        title="Formats"
        code={`<ColorPicker defaultOpen defaultFormat="rgb" defaultValue="rgba(22, 119, 255, 0.7)" />`}
      >
        <ColorPicker defaultFormat="rgb" defaultValue="rgba(22, 119, 255, 0.7)" />
      </DemoBlock>
      <DemoBlock
        title="Disabled alpha"
        code={`<ColorPicker disabledAlpha defaultValue="#52c41a" />`}
      >
        <ColorPicker disabledAlpha defaultValue="#52c41a" />
      </DemoBlock>
      <DemoBlock
        title="Presets"
        code={`<ColorPicker presets={[{ label: 'Recommended', colors: ['#1677ff', '#52c41a', '#faad14', '#ff4d4f'] }]} />`}
      >
        <ColorPicker
          presets={[{ label: 'Recommended', colors: ['#1677ff', '#52c41a', '#faad14', '#ff4d4f'] }]}
        />
      </DemoBlock>
      <DemoBlock title="Show text" code={`<ColorPicker defaultValue="#722ed1" showText />`}>
        <ColorPicker defaultValue="#722ed1" showText />
      </DemoBlock>
      <DemoBlock
        title="Allow clear"
        code={`<ColorPicker allowClear defaultValue="#1677ff" showText />`}
      >
        <ColorPicker allowClear defaultValue="#1677ff" showText />
      </DemoBlock>
      <DemoBlock
        title="Custom panel render"
        code={`<ColorPicker panelRender={(panel) => <div style={{ border: '1px solid #1677ff', padding: '8px' }}>{panel}</div>} />`}
      >
        <ColorPicker
          panelRender={(panel) => (
            <div style={{ border: '1px solid #1677ff', padding: '8px', 'border-radius': '8px' }}>
              {panel}
            </div>
          )}
        />
      </DemoBlock>
    </>
  )
}
```

- [ ] **Step 2: Add nav item**

Modify `apps/docs/src/site/nav.ts` to add ColorPicker near data-entry components, after Calendar:

```ts
  { path: '/components/calendar', label: 'Calendar' },
  { path: '/components/color-picker', label: 'ColorPicker' },
```

- [ ] **Step 3: Run docs route test and typecheck to verify docs compile**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit Task 7**

```bash
git add apps/docs/src/routes/components/color-picker.tsx apps/docs/src/site/nav.ts
git commit -m "docs: add color picker examples"
```

---

### Task 8: Formatting, Type Fixes, and Full Verification

**Files:**

- Modify as required by formatter/typecheck/lint output.

- [ ] **Step 1: Run formatter**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format
```

Expected: files are formatted successfully.

- [ ] **Step 2: Run required lint check**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: PASS. If it fails, fix the exact reported issues without changing behavior, then rerun until PASS.

- [ ] **Step 3: Run required format check**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: PASS.

- [ ] **Step 4: Run required typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: PASS. Fix type errors in the smallest affected files, then rerun until PASS.

- [ ] **Step 5: Run required tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: PASS. Fix failing tests with TDD: add or adjust the failing test expectation only if it contradicts the approved spec; otherwise fix implementation.

- [ ] **Step 6: Run required builds**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: PASS.

- [ ] **Step 7: Commit verification fixes**

If Step 1-6 changed files, commit them:

```bash
git add packages/components/src/color-picker packages/components/src/index.ts apps/docs/src/routes/components/color-picker.tsx apps/docs/src/site/nav.ts
git commit -m "chore: verify color picker implementation"
```

If no files changed, skip this commit and note that verification passed with no follow-up changes.

---

## Self-Review

- Spec coverage: Tasks 1-6 cover API, color model, popup, interactions, formats, presets, clear, showText, panelRender, disabled, and controlled/uncontrolled state. Task 7 covers docs route and nav. Task 8 covers all AGENTS.md verification commands.
- Placeholder scan: The plan contains no TBD/TODO placeholders and each code step includes concrete code or exact commands.
- Type consistency: The plan consistently uses `Color`, `ColorPickerValue`, `ColorPickerFormat`, `ColorPickerProps`, `ColorPickerPreset`, `ColorPickerTrigger`, `HsbColor`, and `RgbColor` across utility, interface, component, and tests.
