# ColorPicker Antd V6 Design

## Goal

Bring `ColorPicker` to current antd v6 API and behavior parity while keeping Solid conventions. React API names that conflict with this codebase's style use Solid names, such as `class` and `rootClass`.

## Current State

The existing implementation lives in `packages/components/src/color-picker/` and already supports single-color picking, alpha, hex/rgb/hsb input formats, presets, clear, click/hover popup triggers, controlled value/open state, and basic docs.

The main gaps against `antd@6.4.4` are gradient mode, richer `Color` methods, mode switching, format-change callbacks, clear callbacks, disabled format switching, semantic `classNames` and `styles`, custom trigger children, full tooltip placements, popup arrow and overflow controls, popup destroy behavior, preset metadata, and antd-aligned component tokens.

## Public API

`ColorPickerProps` will keep existing props and add the v6-compatible surface:

- `mode?: 'single' | 'gradient' | Array<'single' | 'gradient'>`
- `value?: ColorPickerValue`
- `defaultValue?: ColorPickerValue`
- `children?: JSX.Element`
- `arrow?: boolean | { pointAtCenter?: boolean }`
- `classNames?: ColorPickerSemanticClassNames | ((info: { props: ColorPickerProps }) => ColorPickerSemanticClassNames)`
- `styles?: ColorPickerSemanticStyles | ((info: { props: ColorPickerProps }) => ColorPickerSemanticStyles)`
- `rootClass?: string`
- `onFormatChange?: (format?: ColorPickerFormat) => void`
- `onClear?: () => void`
- `disabledFormat?: boolean`
- `autoAdjustOverflow?: boolean | TooltipOverflowConfig`
- `destroyOnHidden?: boolean`
- `destroyTooltipOnHide?: boolean | { keepParent?: boolean }`

`placement` will change from `DropdownPlacement` to full `TooltipPlacement`. Existing props `defaultOpen`, `popupClass`, `popupStyle`, and `zIndex` stay supported for compatibility. `popupClass` and `popupStyle` will map to popup semantic slots internally.

The semantic slots will be Solid-oriented but match antd's structure:

- `root`
- `body`
- `content`
- `description`
- `popup.root`
- `popupOverlayInner`

## Color Model

`ColorPickerValue` will support single colors and gradients:

```ts
export type GradientColor = {
  color: SingleColorValue
  percent: number
}[]

export type SingleColorValue = string | RgbColor | HsbColor | Color
export type ColorPickerValue = SingleColorValue | GradientColor | null | undefined
```

`Color` will become an aggregation color similar to antd's `AggregationColor`. It will keep existing methods and add:

- `isGradient(): boolean`
- `getColors(): { color: Color; percent: number }[]`
- `toCssString(): string`
- `equals(color: Color | null | undefined): boolean`

For a gradient, `toCssString()` returns `linear-gradient(90deg, ...)`. `toHexString()`, `toRgbString()`, and `toHsbString()` return the active or first color for compatibility with existing single-color consumers.

Parsing will continue to accept current string formats and object forms. Gradient input will be accepted as arrays of `{ color, percent }`, with percent clamped to `0..100` and colors normalized to `Color`.

## Component Behavior

The component keeps single-color behavior stable. `onChange` receives the aggregated `Color` and `color.toCssString()`. For single colors this gives a CSS color string; for gradients this gives a CSS linear gradient.

Mode behavior follows antd:

- Default mode is `single`.
- `mode="gradient"` starts in gradient mode.
- `mode={['single', 'gradient']}` shows a mode switcher.
- Switching single to gradient creates two stops at `0` and `100` with the current color.
- Switching gradient to single selects the first stop color and caches the gradient for switching back.
- Controlled `value` that is a gradient forces gradient mode when gradient is allowed.

Gradient editing supports:

- Selecting a stop.
- Dragging a stop along the gradient bar.
- Clicking the gradient bar to add a stop using interpolated color at that percent.
- Deleting an active stop by keyboard when more than two stops remain.
- Editing the active stop through existing saturation, hue, alpha, and input controls.
- Presets can include gradient values.

`allowClear` clears to an empty color, calls `onChange`, `onChangeComplete`, and `onClear`. `disabledAlpha` normalizes emitted alpha to `1`. `disabledFormat` disables the format selector. `onFormatChange` fires only when the effective format changes.

`children` replaces the default trigger content when provided. The trigger wrapper still owns popup events, disabled state, ARIA attributes, and semantic classes.

## Popup Behavior

`ColorPicker` will continue using the repository's portal and placement helpers, extended to full `TooltipPlacement` and `autoAdjustOverflow`.

`arrow` will render a popup arrow unless `false`, with `pointAtCenter` class behavior aligned to Tooltip/Popover. `destroyOnHidden` and `destroyTooltipOnHide` control whether hidden popup content remains mounted. The default keeps existing behavior: popup content is unmounted when closed because the current ColorPicker only renders the portal when open. If compatibility with Tooltip defaults becomes necessary, this behavior can be revisited, but tests will document the chosen behavior.

## Styling And Tokens

Add a `ColorPickerComponentToken` to `packages/theme/src/types.ts` and defaults in `packages/theme/src/components.ts`.

Default token values match antd v6:

- `colorPickerWidth: 234`
- `colorPickerHandlerSize: 16`
- `colorPickerHandlerSizeSM: 12`
- `colorPickerAlphaInputWidth: 44`
- `colorPickerInputNumberHandleWidth: 16`
- `colorPickerPresetColorSize: 24`
- `colorPickerInsetShadow: inset 0 0 1px 0 token.colorTextQuaternary`
- `colorPickerSliderHeight: 8`
- `colorPickerPreviewSize: colorPickerSliderHeight * 2 + token.marginSM`

`color-picker.style.ts` will read component tokens via `getComponentToken('ColorPicker', t)`. The trigger, popup, panel width, clear slash, handlers, gradient slider, presets, mode switcher, disabled state, active state, and semantic slots will use the shared token names and existing global tokens.

## File Structure

Keep the existing file names kebab-case. Split only where it reduces risk and file size:

- `packages/components/src/color-picker/color.ts`: color parsing and aggregation model.
- `packages/components/src/color-picker/interface.ts`: public types and semantic slot types.
- `packages/components/src/color-picker/color-picker.tsx`: orchestration, popup, controlled state, trigger.
- `packages/components/src/color-picker/color-picker-panel.tsx`: panel layout and `panelRender`.
- `packages/components/src/color-picker/gradient-slider.tsx`: gradient stop add, select, drag, delete.
- `packages/components/src/color-picker/presets.tsx`: preset groups and preset selection.
- `packages/components/src/color-picker/color-picker.style.ts`: styles and component token consumption.

If a split causes churn without reducing complexity, keep helper functions in `color-picker.tsx` during implementation and only extract the gradient/presets modules.

## Documentation

Update `apps/docs/src/pages/components/color-picker.mdx` to align with antd v6 examples in Solid style:

- Basic
- Size
- Controlled
- Disabled
- Trigger
- Disabled Alpha
- Clear
- Format
- Disabled Format
- Presets
- Show Text
- Custom Trigger
- Custom Panel
- Gradient
- Placement or Popup Container

The API table will document the Solid naming differences:

- `class` instead of React `className`
- `rootClass` instead of React `rootClassName`

The docs will also describe `Color` methods and gradient value shape.

## Testing

Use TDD. Add failing tests before each implementation slice.

Test coverage will include:

- `Color` gradient construction, normalization, CSS output, equality, and single-color compatibility.
- `mode` options and mode switching.
- `onChange`, `onChangeComplete`, `onClear`, and `onFormatChange`.
- `disabledAlpha` and `disabledFormat`.
- Semantic `classNames` and `styles`.
- `children` custom trigger behavior.
- Full placement classes and `autoAdjustOverflow`.
- Popup arrow classes and hidden/destroy behavior.
- Presets with `defaultOpen`, `key`, single colors, and gradients.
- Gradient stop selection, adding, dragging, deleting, and active stop color editing.
- Docs examples compile through the existing docs typecheck/build pipeline.

## Verification

After implementation and documentation updates, run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

No TypeScript file names will be introduced outside kebab-case.
