# ColorPicker Antd V6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `ColorPicker` to antd v6 API and behavior parity, including gradient editing, Solid-style API names, token alignment, examples, and API docs.

**Architecture:** Extend the existing local ColorPicker instead of introducing React or rc-component dependencies. First make the color model support aggregate single/gradient values, then layer component API, popup semantics, gradient editing, tokenized styles, and docs on top. Keep file names kebab-case and split only focused color-picker helpers where it reduces the current monolithic component risk.

**Tech Stack:** SolidJS, TypeScript, Vitest, `@solidjs/testing-library`, local cssinjs/theme utilities, existing overlay/portal/placement helpers.

---

## File Map

- Modify `packages/components/src/color-picker/color.ts`: aggregate `Color` model, gradient parsing, CSS output, equality.
- Modify `packages/components/src/color-picker/interface.ts`: public API types, semantic slots, gradient/preset/mode types.
- Modify `packages/components/src/color-picker/color-picker.tsx`: state orchestration, API props, trigger, popup, single-color panel behavior.
- Create `packages/components/src/color-picker/gradient-slider.tsx`: gradient stop bar interactions.
- Create `packages/components/src/color-picker/presets.tsx`: preset rendering, group default-open state, single/gradient preset selection.
- Create `packages/components/src/color-picker/color-picker-panel.tsx`: panel composition, operation row, and `panelRender` components.
- Modify `packages/components/src/color-picker/color-picker.style.ts`: antd v6 tokenized styles, popup arrow, gradient slider, mode switcher, semantic slots.
- Modify `packages/theme/src/types.ts`: add `ColorPickerComponentToken`.
- Modify `packages/theme/src/components.ts`: add ColorPicker token defaults.
- Modify `packages/theme/src/__tests__/theme.test.ts`: token default assertions.
- Modify `packages/components/src/color-picker/__tests__/color-picker.test.tsx`: behavior tests.
- Modify `apps/docs/src/pages/components/color-picker.mdx`: examples and API docs.

---

### Task 1: Aggregate Color Model

**Files:**

- Modify: `packages/components/src/color-picker/color.ts`
- Test: `packages/components/src/color-picker/__tests__/color-picker.test.tsx`

- [ ] **Step 1: Write failing tests for gradient color model**

Append these tests inside `describe('Color utilities', () => { ... })`:

```tsx
it('creates gradient colors and returns css gradient output', () => {
  const color = parseColor([
    { color: '#1677ff', percent: 0 },
    { color: 'rgba(82, 196, 26, 0.5)', percent: 100 },
  ])

  expect(color?.isGradient()).toBe(true)
  expect(color?.getColors().map((item) => [item.color.toHexString(), item.percent])).toEqual([
    ['#1677ff', 0],
    ['#52c41a', 100],
  ])
  expect(color?.toCssString()).toBe(
    'linear-gradient(90deg, rgb(22, 119, 255) 0%, rgba(82, 196, 26, 0.5) 100%)',
  )
})

it('compares single and gradient colors by normalized value', () => {
  const single = parseColor('#1677ff')!
  const sameSingle = parseColor({ r: 22, g: 119, b: 255 })!
  const gradient = parseColor([
    { color: '#1677ff', percent: 0 },
    { color: '#52c41a', percent: 100 },
  ])!
  const sameGradient = parseColor([
    { color: '#1677ff', percent: 0 },
    { color: '#52c41a', percent: 100 },
  ])!

  expect(single.equals(sameSingle)).toBe(true)
  expect(single.equals(gradient)).toBe(false)
  expect(gradient.equals(sameGradient)).toBe(true)
})

it('normalizes gradient percents and keeps first color methods compatible', () => {
  const color = parseColor([
    { color: '#1677ff', percent: -10 },
    { color: '#52c41a', percent: 140 },
  ])!

  expect(color.getColors().map((item) => item.percent)).toEqual([0, 100])
  expect(color.toHexString()).toBe('#1677ff')
  expect(color.toRgbString()).toBe('rgb(22, 119, 255)')
  expect(colorToCss(color)).toBe(
    'linear-gradient(90deg, rgb(22, 119, 255) 0%, rgb(82, 196, 26) 100%)',
  )
})
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- color-picker
```

Expected: FAIL with missing `isGradient`, `getColors`, `toCssString`, or gradient parse support.

- [ ] **Step 3: Implement aggregate color support**

Update `packages/components/src/color-picker/color.ts` with these concrete changes:

```ts
export interface GradientColorStop {
  color: SingleColorPickerValue
  percent: number
}

export type SingleColorPickerValue = string | RgbColor | HsbColor | Color
export type GradientColorValue = GradientColorStop[]
export type ColorPickerValue = SingleColorPickerValue | GradientColorValue | null | undefined
export interface ParsedGradientColorStop {
  color: Color
  percent: number
}
```

Change `Color` to hold either `rgb` or `colors`:

```ts
export class Color {
  private readonly rgb: Required<RgbColor>
  private readonly colors?: ParsedGradientColorStop[]

  private constructor(color: RgbColor, colors?: ParsedGradientColorStop[]) {
    this.rgb = normalizeRgb(color)
    this.colors = colors
  }

  static fromRgb(color: RgbColor): Color {
    return new Color(color)
  }

  static fromHsb(color: HsbColor): Color {
    return new Color(hsbToRgb(color))
  }

  static fromGradient(colors: GradientColorValue): Color | undefined {
    const parsedColors = colors
      .map((item) => {
        const parsedColor = parseColor(item.color)
        if (!parsedColor) return undefined
        return {
          color: parsedColor.isGradient() ? parsedColor.getColors()[0].color : parsedColor,
          percent: clamp(item.percent, 0, 100),
        }
      })
      .filter((item): item is ParsedGradientColorStop => Boolean(item))

    if (!parsedColors.length) return undefined
    parsedColors.sort((a, b) => a.percent - b.percent)
    return new Color(parsedColors[0].color.toRgb(), parsedColors)
  }

  isGradient(): boolean {
    return Boolean(this.colors?.length)
  }

  getColors(): ParsedGradientColorStop[] {
    return (
      this.colors?.map((item) => ({ color: item.color, percent: item.percent })) ?? [
        { color: this, percent: 0 },
      ]
    )
  }

  toCssString(): string {
    if (this.colors) {
      const stops = this.colors
        .map((item) => `${item.color.toRgbString()} ${item.percent}%`)
        .join(', ')
      return `linear-gradient(90deg, ${stops})`
    }
    return this.toRgbString()
  }

  equals(color: Color | null | undefined): boolean {
    if (!color || this.isGradient() !== color.isGradient()) return false
    if (!this.isGradient()) return this.toRgbString() === color.toRgbString()
    const colors = this.getColors()
    const targetColors = color.getColors()
    return (
      colors.length === targetColors.length &&
      colors.every(
        (item, index) =>
          item.percent === targetColors[index].percent &&
          item.color.equals(targetColors[index].color),
      )
    )
  }
}
```

Update `parseColor`:

```ts
export function parseColor(value: ColorPickerValue): Color | undefined {
  if (value == null) return undefined
  if (value instanceof Color) return value
  if (Array.isArray(value)) return Color.fromGradient(value)
  if (typeof value !== 'string')
    return isRgbColor(value) ? Color.fromRgb(value) : Color.fromHsb(value)
  const trimmedValue = value.trim()
  return parseHexColor(trimmedValue) ?? parseRgbColor(trimmedValue) ?? parseHsbColor(trimmedValue)
}
```

Update `colorToCss` to return `parsed?.toCssString() ?? 'transparent'`.

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- color-picker
```

Expected: PASS for color utility tests and existing ColorPicker tests.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/color-picker/color.ts packages/components/src/color-picker/__tests__/color-picker.test.tsx
git commit -m "feat: add color picker gradient color model"
```

---

### Task 2: Public API Types And Basic Prop Behavior

**Files:**

- Modify: `packages/components/src/color-picker/interface.ts`
- Modify: `packages/components/src/color-picker/color-picker.tsx`
- Test: `packages/components/src/color-picker/__tests__/color-picker.test.tsx`

- [ ] **Step 1: Write failing tests for API props**

Append a new `describe('ColorPicker v6 API compatibility', () => { ... })`:

```tsx
describe('ColorPicker v6 API compatibility', () => {
  it('renders custom trigger children while preserving popup behavior', () => {
    const result = render(() => (
      <ColorPicker defaultValue="#1677ff">
        <span>Custom trigger</span>
      </ColorPicker>
    ))

    const trigger = result.getByRole('button', { name: /color picker/i })
    expect(result.getByText('Custom trigger')).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByRole('dialog', { name: 'Color Picker Panel' })).toBeInTheDocument()
  })

  it('calls onFormatChange when uncontrolled format changes', () => {
    const onFormatChange = vi.fn()
    render(() => <ColorPicker defaultOpen defaultValue="#1677ff" onFormatChange={onFormatChange} />)

    fireEvent.change(latestPanel().getByLabelText('Color format'), { target: { value: 'rgb' } })

    expect(onFormatChange).toHaveBeenCalledWith('rgb')
  })

  it('disables format switching with disabledFormat', () => {
    render(() => <ColorPicker defaultOpen defaultValue="#1677ff" disabledFormat />)

    expect(latestPanel().getByLabelText('Color format')).toBeDisabled()
  })

  it('calls onClear when the color is cleared', () => {
    const onClear = vi.fn()
    render(() => <ColorPicker defaultOpen defaultValue="#1677ff" allowClear onClear={onClear} />)

    fireEvent.click(latestPanel().getByRole('button', { name: /clear color/i }))

    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- color-picker
```

Expected: FAIL because `children`, `onFormatChange`, `disabledFormat`, or `onClear` behavior is missing.

- [ ] **Step 3: Implement API types and prop behavior**

In `interface.ts`, add:

```ts
import type { TooltipArrow, TooltipOverflowConfig } from '../tooltip'
import type { TooltipPlacement } from '../shared/placement'

export type ColorPickerMode = 'single' | 'gradient'
export type ColorPickerSemanticSlot =
  | 'root'
  | 'body'
  | 'content'
  | 'description'
  | 'popupOverlayInner'
export interface ColorPickerSemanticClassNames {
  root?: string
  body?: string
  content?: string
  description?: string
  popupOverlayInner?: string
  popup?: { root?: string }
}
export interface ColorPickerSemanticStyles {
  root?: JSX.CSSProperties
  body?: JSX.CSSProperties
  content?: JSX.CSSProperties
  description?: JSX.CSSProperties
  popupOverlayInner?: JSX.CSSProperties
  popup?: { root?: JSX.CSSProperties }
}
export type ColorPickerSemanticClassNamesConfig =
  | ColorPickerSemanticClassNames
  | ((info: { props: ColorPickerProps }) => ColorPickerSemanticClassNames)
export type ColorPickerSemanticStylesConfig =
  | ColorPickerSemanticStyles
  | ((info: { props: ColorPickerProps }) => ColorPickerSemanticStyles)
```

Update `ColorPickerPreset`:

```ts
export interface ColorPickerPreset {
  label: JSX.Element
  colors: ColorPickerValue[]
  defaultOpen?: boolean
  key?: string | number
}
```

Update `ColorPickerProps`:

```ts
  mode?: ColorPickerMode | ColorPickerMode[]
  children?: JSX.Element
  placement?: TooltipPlacement
  arrow?: TooltipArrow
  rootClass?: string
  classNames?: ColorPickerSemanticClassNamesConfig
  styles?: ColorPickerSemanticStylesConfig
  autoAdjustOverflow?: boolean | TooltipOverflowConfig
  destroyOnHidden?: boolean
  destroyTooltipOnHide?: boolean | { keepParent?: boolean }
  onFormatChange?: (format?: ColorPickerFormat) => void
  onClear?: () => void
  disabledFormat?: boolean
```

In `color-picker.tsx`:

- Add the new props to `splitProps`.
- Render `local.children` inside the trigger when present; otherwise render the existing color block/text.
- Change format select `disabled` to `disabled() || formatControlled() || Boolean(local.disabledFormat)`.
- In format `onChange`, set uncontrolled format and call `local.onFormatChange?.(nextFormat)` only when `nextFormat !== format()`.
- In `clearColor`, call `local.onClear?.()` after `onChange` and `onChangeComplete`.

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- color-picker
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/color-picker/interface.ts packages/components/src/color-picker/color-picker.tsx packages/components/src/color-picker/__tests__/color-picker.test.tsx
git commit -m "feat: expand color picker v6 props"
```

---

### Task 3: Popup Semantics, Placement, Arrow, And Destroy Controls

**Files:**

- Modify: `packages/components/src/color-picker/color-picker.tsx`
- Modify: `packages/components/src/color-picker/color-picker.style.ts`
- Test: `packages/components/src/color-picker/__tests__/color-picker.test.tsx`

- [ ] **Step 1: Write failing tests for popup compatibility**

Append to `describe('ColorPicker v6 API compatibility', ...)`:

```tsx
it('applies root and popup semantic classNames and styles', () => {
  render(() => (
    <ColorPicker
      open
      classNames={{
        root: 'root-slot',
        popup: { root: 'popup-root-slot' },
        popupOverlayInner: 'inner-slot',
      }}
      styles={{
        root: { width: '123px' },
        popup: { root: { width: '234px' } },
        popupOverlayInner: { padding: '9px' },
      }}
    />
  ))

  const trigger = screen.getByRole('button', { name: /color picker/i })
  const popup = screen.getByRole('dialog', { name: 'Color Picker Panel' })
  const inner = popup.querySelector<HTMLElement>('.ads-color-picker-popup-inner')!

  expect(trigger).toHaveClass('root-slot')
  expect(trigger.style.width).toBe('123px')
  expect(popup).toHaveClass('popup-root-slot')
  expect(popup.style.width).toBe('234px')
  expect(inner).toHaveClass('inner-slot')
  expect(inner.style.padding).toBe('9px')
})

it('supports full tooltip placements and hidden arrows', () => {
  render(() => <ColorPicker open placement="rightTop" arrow={false} />)

  const popup = screen.getByRole('dialog', { name: 'Color Picker Panel' })
  expect(popup).toHaveClass('ads-color-picker-rightTop')
  expect(popup.querySelector('.ads-color-picker-arrow')).toBeNull()
})

it('renders a centered popup arrow when requested', () => {
  render(() => <ColorPicker open placement="bottomRight" arrow={{ pointAtCenter: true }} />)

  const popup = screen.getByRole('dialog', { name: 'Color Picker Panel' })
  expect(popup).toHaveClass('ads-color-picker-arrow-point-at-center')
  expect(popup.querySelector('.ads-color-picker-arrow')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- color-picker
```

Expected: FAIL because semantic slots and arrow are missing or placement is too narrow.

- [ ] **Step 3: Implement popup semantics**

In `color-picker.tsx`, add helpers:

```ts
function resolveMaybeFn<T>(
  value: T | ((info: { props: ColorPickerProps }) => T) | undefined,
  props: ColorPickerProps,
): T | undefined {
  return typeof value === 'function'
    ? (value as (info: { props: ColorPickerProps }) => T)({ props })
    : value
}

function showArrow(arrow: ColorPickerProps['arrow']): boolean {
  return arrow !== false
}

function pointAtCenter(arrow: ColorPickerProps['arrow']): boolean {
  return typeof arrow === 'object' && Boolean(arrow.pointAtCenter)
}
```

Use `getAdjustedTooltipPlacement` and `getTooltipPosition` to support `TooltipPlacement` and `autoAdjustOverflow`:

```ts
import { getAdjustedTooltipPlacement, getTooltipPosition } from '../shared/placement'
```

Set position with:

```ts
const rect = target.getBoundingClientRect()
const nextPlacement = getAdjustedTooltipPlacement(
  rect,
  placement(),
  4,
  local.autoAdjustOverflow ?? true,
)
setPosition({
  position: 'fixed',
  ...getTooltipPosition(rect, nextPlacement, 4),
})
```

Render popup inner and arrow:

```tsx
<Show when={showArrow(local.arrow)}>
  <span class={`${prefixCls()}-arrow`} aria-hidden="true" />
</Show>
<div
  class={classNames(`${prefixCls()}-popup-inner`, mergedClassNames()?.popupOverlayInner)}
  style={mergedStyles()?.popupOverlayInner}
>
  {renderedPanel()}
</div>
```

Apply `rootClass`, semantic root class/style to trigger, semantic popup class/style to popup, and preserve `popupClass/popupStyle`.

In `color-picker.style.ts`, add arrow styles using existing Tooltip/Popover arrow patterns and add `.ads-color-picker-popup-inner`.

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- color-picker
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/color-picker/color-picker.tsx packages/components/src/color-picker/color-picker.style.ts packages/components/src/color-picker/__tests__/color-picker.test.tsx
git commit -m "feat: align color picker popup semantics"
```

---

### Task 4: Mode Switching And Gradient Editing

**Files:**

- Create: `packages/components/src/color-picker/color-picker-panel.tsx`
- Create: `packages/components/src/color-picker/gradient-slider.tsx`
- Modify: `packages/components/src/color-picker/color-picker.tsx`
- Modify: `packages/components/src/color-picker/interface.ts`
- Test: `packages/components/src/color-picker/__tests__/color-picker.test.tsx`

- [ ] **Step 1: Write failing tests for gradient mode**

Append:

```tsx
describe('ColorPicker gradient mode', () => {
  it('renders mode switcher and switches from single to gradient', () => {
    const onChange = vi.fn()
    render(() => (
      <ColorPicker
        defaultOpen
        defaultValue="#1677ff"
        mode={['single', 'gradient']}
        onChange={onChange}
      />
    ))

    fireEvent.click(latestPanel().getByRole('button', { name: 'Gradient' }))

    expect(latestPanel().getByRole('slider', { name: 'Gradient stops' })).toBeInTheDocument()
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ isGradient: expect.any(Function) }),
      'linear-gradient(90deg, rgb(22, 119, 255) 0%, rgb(22, 119, 255) 100%)',
    )
  })

  it('uses gradient defaultValue and updates the active stop color', () => {
    const onChange = vi.fn()
    render(() => (
      <ColorPicker
        defaultOpen
        mode="gradient"
        defaultValue={[
          { color: '#1677ff', percent: 0 },
          { color: '#52c41a', percent: 100 },
        ]}
        onChange={onChange}
      />
    ))

    const gradient = latestPanel().getByRole('slider', { name: 'Gradient stops' })
    expect(gradient).toHaveStyle(
      'background: linear-gradient(90deg, rgb(22, 119, 255) 0%, rgb(82, 196, 26) 100%)',
    )

    fireEvent.click(latestPanel().getByRole('button', { name: /gradient stop 100/i }))
    fireEvent.change(latestPanel().getByLabelText('Hex'), { target: { value: '#faad14' } })
    fireEvent.blur(latestPanel().getByLabelText('Hex'))

    expect(onChange.mock.calls.at(-1)?.[1]).toContain('rgb(250, 173, 20) 100%')
  })

  it('adds and deletes gradient stops', () => {
    const onChangeComplete = vi.fn()
    render(() => (
      <ColorPicker
        defaultOpen
        mode="gradient"
        defaultValue={[
          { color: '#000000', percent: 0 },
          { color: '#ffffff', percent: 100 },
        ]}
        onChangeComplete={onChangeComplete}
      />
    ))

    const gradient = latestPanel().getByRole('slider', { name: 'Gradient stops' })
    mockRect(gradient, { left: 0, top: 0, width: 100, height: 12 })

    fireEvent.pointerDown(gradient, { clientX: 50, clientY: 6 })
    fireEvent.pointerUp(document, { clientX: 50, clientY: 6 })
    expect(latestPanel().getByRole('button', { name: /gradient stop 50/i })).toBeInTheDocument()

    fireEvent.keyDown(latestPanel().getByRole('button', { name: /gradient stop 50/i }), {
      key: 'Delete',
    })
    expect(latestPanel().queryByRole('button', { name: /gradient stop 50/i })).toBeNull()
    expect(onChangeComplete).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- color-picker
```

Expected: FAIL because gradient mode UI is missing.

- [ ] **Step 3: Create gradient slider component**

Create `packages/components/src/color-picker/gradient-slider.tsx`:

```tsx
import { For, onCleanup } from 'solid-js'
import type { JSX } from 'solid-js'
import { classNames } from '../shared/class-names'
import type { ParsedGradientColorStop } from './color'
import { Color, clamp } from './color'

export interface GradientSliderProps {
  prefixCls: string
  colors: ParsedGradientColorStop[]
  activeIndex: number
  disabled?: boolean
  onActive: (index: number) => void
  onChange: (colors: ParsedGradientColorStop[], dragging?: boolean) => void
  onChangeComplete: (colors: ParsedGradientColorStop[]) => void
}

function interpolateColor(colors: ParsedGradientColorStop[], percent: number): Color {
  const sorted = [...colors].sort((a, b) => a.percent - b.percent)
  const lower = [...sorted].reverse().find((item) => item.percent <= percent) ?? sorted[0]
  const upper = sorted.find((item) => item.percent >= percent) ?? sorted.at(-1) ?? lower
  if (lower.percent === upper.percent) return lower.color
  const ratio = (percent - lower.percent) / (upper.percent - lower.percent)
  const low = lower.color.toRgb()
  const high = upper.color.toRgb()
  return Color.fromRgb({
    r: low.r + (high.r - low.r) * ratio,
    g: low.g + (high.g - low.g) * ratio,
    b: low.b + (high.b - low.b) * ratio,
    a: low.a + (high.a - low.a) * ratio,
  })
}

export function gradientCss(colors: ParsedGradientColorStop[]): string {
  return `linear-gradient(90deg, ${colors.map((item) => `${item.color.toRgbString()} ${item.percent}%`).join(', ')})`
}

export function GradientSlider(props: GradientSliderProps): JSX.Element {
  let sliderRef: HTMLDivElement | undefined
  let cleanupDrag: (() => void) | undefined

  const percentFromEvent = (event: Pick<PointerEvent, 'clientX'>) => {
    const rect = sliderRef?.getBoundingClientRect()
    const width = rect?.width || 1
    return Math.round(clamp(((event.clientX - (rect?.left ?? 0)) / width) * 100, 0, 100))
  }

  const sortedColors = () => [...props.colors].sort((a, b) => a.percent - b.percent)

  const commit = (colors: ParsedGradientColorStop[], dragging = false) => {
    props.onChange(
      [...colors].sort((a, b) => a.percent - b.percent),
      dragging,
    )
  }

  const startStopDrag = (index: number, event: PointerEvent) => {
    if (props.disabled) return
    event.preventDefault()
    props.onActive(index)
    const move = (moveEvent: PointerEvent) => {
      const next = sortedColors()
      next[index] = { ...next[index], percent: percentFromEvent(moveEvent) }
      commit(next, true)
    }
    const up = (upEvent: PointerEvent) => {
      move(upEvent)
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', up)
      cleanupDrag = undefined
      props.onChangeComplete(sortedColors())
    }
    cleanupDrag = () => {
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerup', up)
    }
    document.addEventListener('pointermove', move)
    document.addEventListener('pointerup', up)
  }

  const addStop = (event: PointerEvent & { currentTarget: HTMLDivElement }) => {
    if (props.disabled || event.target !== event.currentTarget) return
    const percent = percentFromEvent(event)
    const next = sortedColors()
    next.push({ color: interpolateColor(next, percent), percent })
    next.sort((a, b) => a.percent - b.percent)
    const activeIndex = next.findIndex((item) => item.percent === percent)
    props.onActive(Math.max(activeIndex, 0))
    commit(next, false)
    props.onChangeComplete(next)
  }

  onCleanup(() => cleanupDrag?.())

  return (
    <div
      ref={sliderRef}
      role="slider"
      aria-label="Gradient stops"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={props.colors[props.activeIndex]?.percent ?? 0}
      class={`${props.prefixCls}-gradient-slider`}
      style={{ background: gradientCss(sortedColors()) }}
      onPointerDown={addStop}
    >
      <For each={sortedColors()}>
        {(item, index) => (
          <button
            type="button"
            class={classNames(
              `${props.prefixCls}-gradient-stop`,
              index() === props.activeIndex && `${props.prefixCls}-gradient-stop-active`,
            )}
            style={{ left: `${item.percent}%`, background: item.color.toRgbString() }}
            aria-label={`Gradient stop ${item.percent}`}
            onClick={(event) => {
              event.stopPropagation()
              props.onActive(index())
            }}
            onPointerDown={(event) => {
              event.stopPropagation()
              startStopDrag(index(), event)
            }}
            onKeyDown={(event) => {
              if (
                (event.key === 'Delete' || event.key === 'Backspace') &&
                sortedColors().length > 2
              ) {
                const next = sortedColors().filter((_, currentIndex) => currentIndex !== index())
                props.onActive(Math.max(0, index() - 1))
                commit(next, false)
                props.onChangeComplete(next)
              }
            }}
          />
        )}
      </For>
    </div>
  )
}
```

- [ ] **Step 4: Extract panel composition and integrate mode state**

Create `packages/components/src/color-picker/color-picker-panel.tsx` with a `ColorPickerPanel` component that receives the existing panel render callbacks and props from `color-picker.tsx`. Move the JSX currently returned by `renderPanel()` into this component, preserving the existing class names for saturation, hue, alpha, format row, actions, and preview. Expose two Solid render components for `panelRender`:

```tsx
export interface ColorPickerPanelParts {
  Picker: () => JSX.Element
  Presets: () => JSX.Element
}
```

Update `ColorPickerPanelRenderExtra` in `interface.ts` to:

```ts
export interface ColorPickerPanelRenderExtra {
  components: {
    Picker: () => JSX.Element
    Presets: () => JSX.Element
  }
}
```

In `color-picker.tsx`, call `local.panelRender?.(panel, { components: { Picker, Presets } }) ?? panel`.

- [ ] **Step 5: Integrate gradient slider and active gradient editing**

In `color-picker.tsx`:

- Import `GradientSlider`.
- Add `mode`, `activeGradientIndex`, `cachedGradientColor` signals.
- Add helpers `modeOptions()`, `modeState()`, `setModeState()`, `mergedDisplayColor()`, and `activeColor()`.
- When current value is gradient, use `mergedColor()?.getColors()[activeGradientIndex()]?.color` for sliders and inputs.
- When emitting color from sliders/inputs in gradient mode, replace the active stop and call `onChange(nextGradient, nextGradient.toCssString())`.
- Render mode buttons when `mode` contains both modes:

```tsx
<div class={`${prefixCls()}-mode-switch`} role="group" aria-label="Color mode">
  <button
    type="button"
    aria-pressed={modeState() === 'single'}
    onClick={() => switchMode('single')}
  >
    Single
  </button>
  <button
    type="button"
    aria-pressed={modeState() === 'gradient'}
    onClick={() => switchMode('gradient')}
  >
    Gradient
  </button>
</div>
```

- Render `GradientSlider` from `color-picker-panel.tsx` when `modeState() === 'gradient'`.

- [ ] **Step 6: Run tests to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- color-picker
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/components/src/color-picker/color-picker-panel.tsx packages/components/src/color-picker/gradient-slider.tsx packages/components/src/color-picker/color-picker.tsx packages/components/src/color-picker/interface.ts packages/components/src/color-picker/__tests__/color-picker.test.tsx
git commit -m "feat: add color picker gradient mode"
```

---

### Task 5: Presets With Gradient Values And Collapsed Groups

**Files:**

- Create: `packages/components/src/color-picker/presets.tsx`
- Modify: `packages/components/src/color-picker/color-picker.tsx`
- Test: `packages/components/src/color-picker/__tests__/color-picker.test.tsx`

- [ ] **Step 1: Write failing preset tests**

Append:

```tsx
it('supports preset defaultOpen and gradient preset values', () => {
  const onChange = vi.fn()
  render(() => (
    <ColorPicker
      defaultOpen
      mode={['single', 'gradient']}
      onChange={onChange}
      presets={[
        {
          label: 'Brand',
          defaultOpen: false,
          key: 'brand',
          colors: [
            [
              { color: '#1677ff', percent: 0 },
              { color: '#52c41a', percent: 100 },
            ],
          ],
        },
      ]}
    />
  ))

  expect(latestPanel().queryByRole('button', { name: /select preset color/i })).toBeNull()

  fireEvent.click(latestPanel().getByRole('button', { name: 'Brand' }))
  fireEvent.click(latestPanel().getByRole('button', { name: /select preset color/i }))

  expect(onChange.mock.calls.at(-1)?.[1]).toBe(
    'linear-gradient(90deg, rgb(22, 119, 255) 0%, rgb(82, 196, 26) 100%)',
  )
})
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- color-picker
```

Expected: FAIL because presets do not collapse or accept gradient values.

- [ ] **Step 3: Create presets component**

Create `packages/components/src/color-picker/presets.tsx`:

```tsx
import { For, Show, createSignal } from 'solid-js'
import type { JSX } from 'solid-js'
import { colorToCss, parseColor } from './color'
import type { ColorPickerPreset, ColorPickerValue } from './interface'

export interface PresetsProps {
  prefixCls: string
  presets: ColorPickerPreset[]
  disabled?: boolean
  onSelect: (value: ColorPickerValue) => void
}

export function Presets(props: PresetsProps): JSX.Element {
  const [openKeys, setOpenKeys] = createSignal(
    new Set(
      props.presets
        .map((preset, index) => ({
          key: String(preset.key ?? index),
          open: preset.defaultOpen !== false,
        }))
        .filter((item) => item.open)
        .map((item) => item.key),
    ),
  )

  const toggle = (key: string) => {
    setOpenKeys((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div class={`${props.prefixCls}-presets`}>
      <For each={props.presets}>
        {(preset, index) => {
          const key = () => String(preset.key ?? index())
          return (
            <div class={`${props.prefixCls}-preset`}>
              <button
                type="button"
                class={`${props.prefixCls}-preset-label`}
                aria-expanded={openKeys().has(key()) ? 'true' : 'false'}
                onClick={() => toggle(key())}
              >
                {preset.label}
              </button>
              <Show when={openKeys().has(key())}>
                <div class={`${props.prefixCls}-preset-colors`}>
                  <For each={preset.colors}>
                    {(presetColor) => (
                      <button
                        type="button"
                        class={`${props.prefixCls}-preset-color`}
                        aria-label="Select preset color"
                        disabled={props.disabled}
                        onClick={() => props.onSelect(presetColor)}
                      >
                        <span
                          class={`${props.prefixCls}-preset-color-inner`}
                          style={{ background: colorToCss(parseColor(presetColor)) }}
                        />
                      </button>
                    )}
                  </For>
                </div>
              </Show>
            </div>
          )
        }}
      </For>
    </div>
  )
}
```

- [ ] **Step 4: Replace inline preset rendering**

In `color-picker.tsx`, import `Presets`, remove inline preset JSX, and call:

```tsx
<Presets
  prefixCls={prefixCls()}
  presets={presetList()}
  disabled={disabled()}
  onSelect={selectPreset}
/>
```

Update `selectPreset(value: ColorPickerValue)` to parse gradients and switch mode to gradient when needed.

- [ ] **Step 5: Run tests to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- color-picker
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/components/src/color-picker/presets.tsx packages/components/src/color-picker/color-picker.tsx packages/components/src/color-picker/__tests__/color-picker.test.tsx
git commit -m "feat: support color picker v6 presets"
```

---

### Task 6: Antd V6 Component Tokens And Styles

**Files:**

- Modify: `packages/theme/src/types.ts`
- Modify: `packages/theme/src/components.ts`
- Modify: `packages/theme/src/__tests__/theme.test.ts`
- Modify: `packages/components/src/color-picker/color-picker.style.ts`
- Test: `packages/theme/src/__tests__/theme.test.ts`

- [ ] **Step 1: Write failing token tests**

Add near the existing component token assertions in `packages/theme/src/__tests__/theme.test.ts`:

```ts
const colorPicker = getComponentToken('ColorPicker', token)
expect(colorPicker.colorPickerWidth).toBe(234)
expect(colorPicker.colorPickerHandlerSize).toBe(16)
expect(colorPicker.colorPickerHandlerSizeSM).toBe(12)
expect(colorPicker.colorPickerAlphaInputWidth).toBe(44)
expect(colorPicker.colorPickerInputNumberHandleWidth).toBe(16)
expect(colorPicker.colorPickerPresetColorSize).toBe(24)
expect(colorPicker.colorPickerSliderHeight).toBe(8)
expect(colorPicker.colorPickerPreviewSize).toBe(24)
expect(colorPicker.colorPickerInsetShadow).toBe(`inset 0 0 1px 0 ${token.colorTextQuaternary}`)
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/theme test
```

Expected: FAIL because `ColorPicker` token is currently `ComponentTokenBase | undefined`.

- [ ] **Step 3: Add token type and defaults**

In `packages/theme/src/types.ts`, add:

```ts
export interface ColorPickerComponentToken extends ComponentTokenBase {
  colorPickerWidth: number
  colorPickerHandlerSize: number
  colorPickerHandlerSizeSM: number
  colorPickerAlphaInputWidth: number
  colorPickerInputNumberHandleWidth: number
  colorPickerPresetColorSize: number
  colorPickerInsetShadow: string
  colorPickerSliderHeight: number
  colorPickerPreviewSize: number
}
```

Change `ComponentTokenMap` entry to:

```ts
ColorPicker: ColorPickerComponentToken
```

In `packages/theme/src/components.ts`, add default:

```ts
ColorPicker: {
  colorPickerWidth: 234,
  colorPickerHandlerSize: 16,
  colorPickerHandlerSizeSM: 12,
  colorPickerAlphaInputWidth: 44,
  colorPickerInputNumberHandleWidth: 16,
  colorPickerPresetColorSize: 24,
  colorPickerInsetShadow: `inset 0 0 1px 0 ${token.colorTextQuaternary}`,
  colorPickerSliderHeight: 8,
  colorPickerPreviewSize: 8 * 2 + token.marginSM,
},
```

In `color-picker.style.ts`, import `getComponentToken` and use the component token for widths, handlers, preset sizes, slider height, preview size, and inset shadow.

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/theme test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- color-picker
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/theme/src/types.ts packages/theme/src/components.ts packages/theme/src/__tests__/theme.test.ts packages/components/src/color-picker/color-picker.style.ts
git commit -m "feat: align color picker component tokens"
```

---

### Task 7: Docs Examples And API Tables

**Files:**

- Modify: `apps/docs/src/pages/components/color-picker.mdx`

- [ ] **Step 1: Replace docs with v6-aligned Solid examples**

Update `apps/docs/src/pages/components/color-picker.mdx` so it includes these sections:

````mdx
# ColorPicker

Provide color selection with presets, alpha, formats, controlled state, and gradient colors.

### Basic

```tsx
import { ColorPicker } from '@solid-ant-design/core'

const Demo1 = function () {
  return <ColorPicker defaultValue="#1677ff" />
}

export default Demo1
```

### Size

```tsx
import { ColorPicker, Space } from '@solid-ant-design/core'

const Demo2 = function () {
  return (
    <Space align="center">
      <ColorPicker size="small" defaultValue="#1677ff" />
      <ColorPicker defaultValue="#1677ff" />
      <ColorPicker size="large" defaultValue="#1677ff" />
    </Space>
  )
}

export default Demo2
```

### Controlled

```tsx
import { createSignal } from 'solid-js'
import { ColorPicker, Space } from '@solid-ant-design/core'

const Demo3 = function () {
  const [value, setValue] = createSignal('#1677ff')

  return (
    <Space direction="vertical">
      <ColorPicker value={value()} showText onChange={(color, css) => setValue(css)} />
      <span>Current value: {value()}</span>
    </Space>
  )
}

export default Demo3
```

### Gradient

```tsx
import { ColorPicker } from '@solid-ant-design/core'

const Demo4 = function () {
  return (
    <ColorPicker
      mode={['single', 'gradient']}
      defaultValue={[
        { color: '#1677ff', percent: 0 },
        { color: '#52c41a', percent: 100 },
      ]}
      showText={(color) => color?.toCssString()}
    />
  )
}

export default Demo4
```

### Custom Trigger

```tsx
import { ColorPicker } from '@solid-ant-design/core'

const Demo5 = function () {
  return (
    <ColorPicker defaultValue="#1677ff">
      <button type="button">Pick brand color</button>
    </ColorPicker>
  )
}

export default Demo5
```
````

Use these exact section titles and snippets for the remaining examples:

````mdx
### Disabled

```tsx
import { ColorPicker, Space } from '@solid-ant-design/core'

const Demo6 = function () {
  return (
    <Space>
      <ColorPicker defaultValue="#1677ff" disabled />
      <ColorPicker defaultValue="#1677ff" disabled showText />
    </Space>
  )
}

export default Demo6
```

### Trigger

```tsx
import { ColorPicker, Space } from '@solid-ant-design/core'

const Demo7 = function () {
  return (
    <Space>
      <ColorPicker defaultValue="#1677ff" trigger="click" />
      <ColorPicker defaultValue="#52c41a" trigger="hover" />
    </Space>
  )
}

export default Demo7
```

### Disabled Alpha

```tsx
import { ColorPicker } from '@solid-ant-design/core'

const Demo8 = function () {
  return <ColorPicker disabledAlpha defaultValue="rgba(22, 119, 255, 0.6)" />
}

export default Demo8
```

### Clear

```tsx
import { ColorPicker } from '@solid-ant-design/core'

const Demo9 = function () {
  return <ColorPicker allowClear defaultValue="#1677ff" showText />
}

export default Demo9
```

### Format

```tsx
import { ColorPicker, Space } from '@solid-ant-design/core'

const Demo10 = function () {
  return (
    <Space>
      <ColorPicker defaultValue="#1677ff" defaultFormat="hex" />
      <ColorPicker defaultValue="#1677ff" defaultFormat="rgb" />
      <ColorPicker defaultValue="#1677ff" defaultFormat="hsb" />
    </Space>
  )
}

export default Demo10
```

### Disabled Format

```tsx
import { ColorPicker } from '@solid-ant-design/core'

const Demo11 = function () {
  return <ColorPicker defaultValue="#1677ff" defaultFormat="rgb" disabledFormat />
}

export default Demo11
```

### Presets

```tsx
import { ColorPicker } from '@solid-ant-design/core'

const Demo12 = function () {
  return (
    <ColorPicker
      presets={[
        {
          label: 'Recommended',
          colors: ['#1677ff', '#52c41a', '#faad14', '#ff4d4f'],
        },
        {
          label: 'Gradients',
          colors: [
            [
              { color: '#1677ff', percent: 0 },
              { color: '#52c41a', percent: 100 },
            ],
          ],
        },
      ]}
    />
  )
}

export default Demo12
```

### Show Text

```tsx
import { ColorPicker, Space } from '@solid-ant-design/core'

const Demo13 = function () {
  return (
    <Space direction="vertical">
      <ColorPicker defaultValue="#1677ff" showText />
      <ColorPicker defaultValue="#722ed1" showText={(color) => color?.toRgbString()} />
    </Space>
  )
}

export default Demo13
```

### Custom Panel

```tsx
import { ColorPicker } from '@solid-ant-design/core'

const Demo14 = function () {
  return (
    <ColorPicker
      defaultValue="#1677ff"
      panelRender={(panel) => (
        <div style={{ padding: '8px', border: '1px solid #1677ff', 'border-radius': '8px' }}>
          {panel}
        </div>
      )}
    />
  )
}

export default Demo14
```

### Placement

```tsx
import { ColorPicker, Space } from '@solid-ant-design/core'

const Demo15 = function () {
  return (
    <Space wrap>
      <ColorPicker defaultValue="#1677ff" placement="bottomLeft" />
      <ColorPicker defaultValue="#1677ff" placement="bottomRight" />
      <ColorPicker defaultValue="#1677ff" placement="topLeft" />
      <ColorPicker defaultValue="#1677ff" placement="rightTop" />
    </Space>
  )
}

export default Demo15
```
````

- [ ] **Step 2: Update API tables**

Document all public props from the approved spec:

- `mode`
- `value`
- `defaultValue`
- `children`
- `open`
- `defaultOpen`
- `disabled`
- `placement`
- `trigger`
- `format`
- `defaultFormat`
- `disabledFormat`
- `disabledAlpha`
- `allowClear`
- `arrow`
- `showText`
- `presets`
- `panelRender`
- `class`
- `rootClass`
- `classNames`
- `styles`
- `popupClass`
- `popupStyle`
- `zIndex`
- `getPopupContainer`
- `autoAdjustOverflow`
- `destroyOnHidden`
- `destroyTooltipOnHide`
- `onOpenChange`
- `onFormatChange`
- `onChange`
- `onChangeComplete`
- `onClear`

Document `ColorPickerPreset`, gradient value shape, and `Color` methods.

- [ ] **Step 3: Run docs and type verification**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs build
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/docs/src/pages/components/color-picker.mdx
git commit -m "docs: update color picker v6 examples"
```

---

### Task 8: Final Verification

**Files:**

- No planned code changes.

- [ ] **Step 1: Run required repository checks**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: all commands pass.

- [ ] **Step 2: Fix verification failures with TDD where behavior changes are needed**

If a verification failure exposes a missing behavior, first add or adjust a focused failing test in:

```text
packages/components/src/color-picker/__tests__/color-picker.test.tsx
```

Run the focused failing test, implement the minimal fix, then rerun the focused test before rerunning the full command that failed.

- [ ] **Step 3: Commit verification fixes if any**

```bash
git status --short
git add <changed-files>
git commit -m "fix: stabilize color picker v6 parity"
```

If no files changed, do not create an empty commit.
