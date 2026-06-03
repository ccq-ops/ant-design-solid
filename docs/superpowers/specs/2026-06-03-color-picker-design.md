# ColorPicker Design

Date: 2026-06-03

## Goal

Implement an Ant Design-inspired `ColorPicker` component for `@ant-design-solid/core`. The component should provide a custom Solid implementation rather than a native color input wrapper, cover common Ant Design ColorPicker APIs, and fit the repository's existing component, style, docs, and test patterns.

## Scope

The initial implementation will include:

- Trigger button with color swatch and optional text.
- Popup panel rendered through the existing portal/overlay helpers.
- Saturation/brightness two-dimensional picker.
- Hue slider.
- Alpha slider, hidden when `disabledAlpha` is true.
- HEX, RGB, and HSB display/edit formats.
- Controlled and uncontrolled value support.
- Controlled and uncontrolled open state support.
- Preset color groups.
- Clear action when `allowClear` is enabled.
- `panelRender` for custom panel wrapping.
- Documentation route and examples.
- Unit tests for API and core interactions.

The implementation will not aim for pixel-perfect Ant Design parity. It will prioritize compatible concepts, stable behavior, and consistency with this repository's existing Solid components.

## Files

Add a new component folder:

- `packages/components/src/color-picker/color-picker.tsx`
- `packages/components/src/color-picker/color-picker.style.ts`
- `packages/components/src/color-picker/color.ts`
- `packages/components/src/color-picker/interface.ts`
- `packages/components/src/color-picker/index.ts`
- `packages/components/src/color-picker/__tests__/color-picker.test.tsx`

Update existing entry points and docs:

- `packages/components/src/index.ts`
- `apps/docs/src/routes/components/color-picker.tsx`
- `apps/docs/src/site/nav.ts`

All new TypeScript file names will use kebab-case in accordance with `AGENTS.md`.

## Public API

The component will expose a practical Ant Design-like API:

```ts
type ColorPickerFormat = 'hex' | 'rgb' | 'hsb'
type ColorPickerTrigger = 'click' | 'hover'

type ColorPickerPreset = {
  label?: JSX.Element
  colors: string[]
}

interface ColorPickerProps {
  value?: ColorPickerValue
  defaultValue?: ColorPickerValue
  onChange?: (value: Color | undefined, hex: string) => void
  onChangeComplete?: (value: Color | undefined) => void

  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void

  disabled?: boolean
  size?: 'small' | 'middle' | 'large'
  placement?: Placement
  trigger?: ColorPickerTrigger

  format?: ColorPickerFormat
  defaultFormat?: ColorPickerFormat
  disabledAlpha?: boolean
  allowClear?: boolean
  showText?: boolean | ((color: Color | undefined) => JSX.Element)
  presets?: ColorPickerPreset[]
  panelRender?: (panel: JSX.Element, extra: { components: Record<string, JSX.Element> }) => JSX.Element

  class?: string
  style?: JSX.CSSProperties
  popupClass?: string
  popupStyle?: JSX.CSSProperties
}
```

`ColorPickerValue` will accept strings and `Color` objects. Strings will support at least common HEX, RGB/RGBA, and HSB/HSV forms.

The exported `Color` object will provide common conversion helpers:

- `toHexString()`
- `toRgbString()`
- `toHsbString()`
- `toRgb()`
- `toHsb()`
- `toHex()`

## Internal Color Model

Internally, the component will normalize colors to:

```ts
type InternalColor = {
  h: number // 0..360
  s: number // 0..100
  b: number // 0..100
  a: number // 0..1
}
```

This model maps directly to the UI:

- Hue slider updates `h`.
- Saturation/brightness area updates `s` and `b`.
- Alpha slider updates `a`.
- Format inputs parse into the same model.

Utility functions in `color.ts` will handle clamping, parsing, conversion, and string formatting. Invalid input commits will be ignored and the display will resync to the current valid color.

## State Flow

Value state follows the repository's controlled/uncontrolled convention:

1. `value` controls the selected color when provided.
2. Otherwise, `defaultValue` initializes internal state.
3. Interactions produce a normalized `Color` object or `undefined` for clear.
4. Uncontrolled instances update internal state.
5. Every valid change calls `onChange(nextColor, nextHex)`, where `nextHex` is `''` when cleared.
6. Finalized actions call `onChangeComplete(nextColor)`.

Finalized actions include pointer release after dragging, input blur/Enter commits, preset clicks, and clear clicks.

Open state follows the same pattern:

1. `open` controls popup visibility when provided.
2. Otherwise, `defaultOpen` initializes internal open state.
3. Trigger actions call `onOpenChange(nextOpen)`.
4. Escape and outside pointer down close the popup.

## Interaction Design

The trigger renders as a button-like control with:

- Current color swatch, including checkerboard treatment for alpha.
- Optional text from `showText`.
- Disabled and size styling consistent with other controls.

The popup panel contains:

1. Saturation/brightness area with a draggable handle.
2. Hue slider.
3. Optional alpha slider.
4. Format selector and inputs.
5. Optional preset groups.
6. Optional clear button.

Pointer interactions use document-level `pointermove`, `pointerup`, and `pointercancel` listeners while dragging. Keyboard support will cover Enter/Escape for inputs and popup close; additional arrow-key picker movement can be added later without changing the public API.

## Styling

`color-picker.style.ts` will register styles through `useStyleRegister` and `useToken`, following existing component patterns. Styles will use the configured prefix class:

- `${prefixCls}` for trigger.
- `${prefixCls}-popup` for overlay.
- `${prefixCls}-panel` for panel layout.
- `${prefixCls}-saturation`, `${prefixCls}-hue`, `${prefixCls}-alpha` for picker controls.
- `${prefixCls}-presets` for preset groups.

The panel will use tokenized spacing, border, radius, shadow, font, focus, disabled, and background colors. Gradients will be inline or style-generated where they depend on current color state.

## Documentation

Add `apps/docs/src/routes/components/color-picker.tsx` with examples:

- Basic.
- Controlled.
- Different formats.
- Disabled alpha.
- Presets.
- Show text.
- Allow clear.
- Custom panel render.

Add `{ path: '/components/color-picker', label: 'ColorPicker' }` to `apps/docs/src/site/nav.ts` near other data-entry components.

## Testing

Add tests for:

- Component renders and exports.
- `defaultValue` initializes visible swatch/text.
- Trigger opens the popup.
- Escape and outside pointer down close the popup.
- Controlled `value` does not get overwritten internally.
- Saturation, hue, and alpha pointer interactions call `onChange`.
- HEX, RGB, and HSB input commits produce expected values.
- Preset clicks select colors.
- `allowClear` emits `undefined` and empty hex string.
- `disabled` prevents opening and changing.
- `panelRender` output appears.

Tests will focus on observable behavior rather than pixel-perfect layout.

## Verification

After implementation, run the repository verification commands required by `AGENTS.md`:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```
