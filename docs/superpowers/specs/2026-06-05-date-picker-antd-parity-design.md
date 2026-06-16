# DatePicker antd Parity Design

## Goal

Rebuild `packages/components/src/date-picker` so it strictly targets the current public antd DatePicker API surface while using `dayjs` as the date/time value library. The delivered component must expose single DatePicker, picker variants, and RangePicker with antd-compatible prop names, callback shapes, and core behavior.

## Scope

This work covers the DatePicker family:

- `<DatePicker />`
- `<DatePicker picker="week" />`
- `<DatePicker picker="month" />`
- `<DatePicker picker="quarter" />`
- `<DatePicker picker="year" />`
- `<DatePicker.RangePicker />`
- named `RangePicker` export

The implementation will replace the current minimal `Date | string` picker with a `dayjs`-based implementation. New public examples and tests will use `Dayjs | null` and `[Dayjs | null, Dayjs | null] | null` values.

Deprecated antd props remain accepted when practical and map to the current API:

- `bordered` maps to `variant` behavior.
- `dropdownClassName` and `popupClassName` map to popup root classes.
- `popupStyle` maps to popup root styles.
- `dateRender` maps to `cellRender` compatibility.
- `onSelect` is called for single date cell selection in addition to the modern flow.
- `showTime.defaultValue` maps to `showTime.defaultOpenValue`.

## Non-goals

- The component will not wrap React antd or React rc-picker at runtime.
- The component will not preserve `Date | string` as the primary value API. Any legacy parsing support is only transitional and not documented as the preferred API.
- The component will not implement unrelated ConfigProvider component-level global configuration beyond existing project conventions unless DatePicker needs it for already-supported global settings such as `prefixCls`, `componentSize`, and `getPopupContainer`.

## Dependencies

Add `dayjs` as a runtime dependency of `@solid-ant-design/core`.

The implementation may use dayjs plugins needed for parity, including week, locale, custom parse format, quarter, advanced format, and localized format. Plugins must be registered from a focused date utility module instead of scattered across component files.

## Architecture

Use a Solid-native implementation with small focused modules. The outer DatePicker exports an antd-like API, while internal modules handle value normalization, formatting, panel state, input state, range selection, and rendering.

Expected file layout:

```text
packages/components/src/date-picker/
  index.ts
  interface.ts
  date-picker.tsx
  range-picker.tsx
  picker-input.tsx
  picker-panel.tsx
  date-panel.tsx
  month-panel.tsx
  year-panel.tsx
  decade-panel.tsx
  time-panel.tsx
  presets-panel.tsx
  multiple-tags.tsx
  date-utils.ts
  format-utils.ts
  locale.ts
  semantic.ts
  date-picker.style.ts
  __tests__/
    date-picker.test.tsx
    range-picker.test.tsx
    picker-variants.test.tsx
    show-time.test.tsx
    multiple.test.tsx
    custom-render.test.tsx
```

All new TypeScript file names must be lowercase kebab-case, matching repository AGENTS.md instructions.

## Public API

### Shared types

The public type layer uses `Dayjs` from `dayjs`.

Core aliases:

```ts
export type PickerType = 'date' | 'week' | 'month' | 'quarter' | 'year'
export type PickerMode = 'time' | 'date' | 'month' | 'year' | 'decade'
export type DatePickerValue = Dayjs | null
export type RangePickerValue = [Dayjs | null, Dayjs | null] | null
```

Format support:

```ts
export type DatePickerFormat =
  | string
  | ((value: Dayjs) => string)
  | Array<string | ((value: Dayjs) => string)>
  | {
      format: string
      type?: 'mask'
    }
```

### DatePicker exports

`DatePicker` is callable as a Solid component and has a static `RangePicker` member:

```tsx
<DatePicker />
<DatePicker picker="month" />
<DatePicker.RangePicker />
```

`RangePicker` is also exported as a named component.

### Common DatePicker and RangePicker props

The implementation will support these antd public props:

- `allowClear`
- `className` and Solid `class`
- `classNames`
- `styles`
- `dateRender`
- `cellRender`
- `components`
- `defaultOpen`
- `disabled`
- `disabledDate`
- `dropdownClassName`
- `format`
- `order`
- `popupClassName`
- `preserveInvalidOnBlur`
- `getPopupContainer`
- `inputReadOnly`
- `locale`
- `minDate`
- `maxDate`
- `mode`
- `needConfirm`
- `nextIcon`
- `open`
- `panelRender`
- `picker`
- `placeholder`
- `placement`
- `popupStyle`
- `prefix`
- `presets`
- `prevIcon`
- `previewValue`
- `size`
- `status`
- `style`
- `styles`
- `suffixIcon`
- `superNextIcon`
- `superPrevIcon`
- `variant`
- `onOpenChange`
- `onPanelChange`
- `onSelect`

### DatePicker-specific props

The single picker will support:

- `value`
- `defaultValue`
- `defaultPickerValue`
- `pickerValue`
- `disabledTime`
- `multiple`
- `renderExtraFooter`
- `showNow`
- `showTime`
- `showTime.defaultOpenValue`
- `showTime.defaultValue` compatibility
- `showWeek`
- `tagRender`
- `onChange`
- `onOk`
- `onPanelChange`

### Variant picker behavior

`picker` changes selection granularity and default format:

- `date`: `YYYY-MM-DD`
- `week`: `YYYY-wo`
- `month`: `YYYY-MM`
- `quarter`: `YYYY-\QQ`
- `year`: `YYYY`

Week picker shows week information by default. Month, quarter, and year pickers select their corresponding unit. Multiple selection is supported for all single picker types where antd supports it.

### RangePicker props

RangePicker will support:

- `allowEmpty`
- `value`
- `defaultValue`
- `defaultPickerValue`
- `pickerValue`
- `disabled` as `[boolean, boolean]` or a single boolean compatibility form when useful
- `disabledTime`
- `format`
- `id`
- `presets`
- `renderExtraFooter`
- `separator`
- `showTime`
- `showTime.defaultOpenValue`
- `showTime.defaultValue` compatibility
- `onCalendarChange`
- `onChange`
- `onFocus`
- `onBlur`

RangePicker shares common APIs for panel rendering, cells, locale, popup behavior, status, variant, semantic class/style customization, and min/max date constraints.

## Value and state model

The component maintains separate state for:

- committed value
- pending value when `needConfirm` is active
- input text
- active range side for RangePicker
- open state
- view date / picker value
- panel mode
- hover preview value
- range hover value

Controlled props always win over internal state. Uncontrolled state initializes from default props.

`onChange` fires with `Dayjs | null` for single selection and `[Dayjs | null, Dayjs | null] | null` for ranges. Date strings match the selected format. Clearing emits `null` and an empty date string or empty string tuple.

`needConfirm` delays committed value changes until the OK action. `onCalendarChange` still reports intermediate range state.

## Formatting and parsing

Formatting uses dayjs. The first provided format controls display. Input parsing attempts every string format in the format list. Function formats are display-only and cannot parse input. Mask format uses the string `format` field for display and parsing.

Invalid input behavior:

- When `preserveInvalidOnBlur` is false, invalid input is cleared or reset to the previous committed value on blur.
- When `preserveInvalidOnBlur` is true, invalid text remains visible but does not emit `onChange`.

## Panels

Panel modules render focused responsibilities:

- Date panel: dates, weeks, disabled date, today, range states.
- Month panel: month grid.
- Year panel: year grid.
- Decade panel: decade navigation.
- Time panel: hour/minute/second selectors for `showTime`.
- Presets panel: quick selections for single and range values.

Panel navigation respects `minDate` and `maxDate`, including limiting panel switching beyond the supported range.

`disabledDate` receives `(currentDate, info)` where `info.type` is the picker type and `info.from` is provided for range-related checks when available.

## Rendering customization

`cellRender` receives the current dayjs value and an info object with the original node, today, range side when applicable, panel type, locale, and time subtype when applicable.

`dateRender` remains supported by adapting date cells to the legacy callback.

`panelRender` wraps the generated panel node.

`components` allows replacing supported panel and input slots. Unsupported custom component keys are ignored rather than throwing.

`renderExtraFooter` renders at the bottom of the popup panel.

## Input, focus, and keyboard

Render input-like controls instead of the current non-input-only combobox. The component exposes `focus()` and `blur()` methods via Solid ref usage where practical for this project.

Keyboard support includes:

- Escape closes the popup.
- Enter confirms typed values or `needConfirm` values.
- Tab/blur performs invalid input handling.
- Arrow-key date grid navigation is included for the active panel when focus is inside the panel.

`inputReadOnly` sets the underlying input readonly attribute.

## Popup and placement

Reuse existing project helpers for portal, overlay listeners, and z-index. Support placements:

- `bottomLeft`
- `bottomRight`
- `topLeft`
- `topRight`

`getPopupContainer` follows prop first, then ConfigProvider.

`zIndex` remains supported as a project extension and maps to popup z-index.

## Styling and semantic DOM

Extend `date-picker.style.ts` to cover the expanded structure:

- root
- input wrapper
- input
- prefix
- suffix
- clear
- dropdown
- panel
- header
- navigation buttons
- date/month/year/decade cells
- selected/today/disabled/hover states
- range start/end/in-range states
- time panel
- presets
- footer
- multiple tags
- sizes
- statuses
- variants
- placements

`classNames` and `styles` customize semantic slots. Solid `class` and antd `className` both apply to the root. Deprecated popup class/style props map to the popup root slot.

## Locale

Provide an internal default English locale. Accept component-level locale objects for DatePicker text such as placeholders, today, now, ok, time labels, and week labels. Dayjs locale must still be configured by consumers when they need localized date formatting; component locale controls UI text.

## Tests

Use TDD. Each new behavior starts with a failing test and then the minimal implementation.

Required test files:

- `date-picker.test.tsx`: single picker, dayjs value, formatting, open state, clear, input, min/max, icons, size/status/variant.
- `picker-variants.test.tsx`: week/month/quarter/year, panel mode changes, showWeek, pickerValue/defaultPickerValue.
- `range-picker.test.tsx`: range selection, allowEmpty, order, disabled endpoints, onCalendarChange, separator, range focus/blur.
- `show-time.test.tsx`: showTime, showNow, disabledTime, onOk, defaultOpenValue.
- `multiple.test.tsx`: multiple selection, tagRender, needConfirm, order.
- `custom-render.test.tsx`: cellRender, dateRender, panelRender, renderExtraFooter, presets, classNames, styles, custom components.

Verification commands after implementation:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

## Documentation

Update `apps/docs/src/pages/components/date-picker.tsx` with:

- dayjs examples
- picker variants
- RangePicker
- showTime
- multiple
- presets
- custom rendering
- API tables for DatePicker and RangePicker

The docs should state that values use `dayjs`.

## Risks and mitigations

### Risk: feature scope is large

Mitigation: split implementation into small modules and write tests per capability. Avoid one giant component file.

### Risk: exact antd parity is nuanced

Mitigation: use antd prop names, callback shapes, and documented behavior as the source of truth. Build tests for documented behavior rather than internal rc-picker details.

### Risk: input parsing is complex

Mitigation: support documented format shapes with deterministic parsing. Treat function formats as display-only and document that behavior in local docs if needed.

### Risk: Solid ref methods differ from React refs

Mitigation: expose focus/blur in the idiomatic way used by this project while testing that consumers can call focus and blur through a component ref.

## Acceptance criteria

- `@solid-ant-design/core` depends on dayjs.
- DatePicker public values and callbacks use dayjs-compatible types.
- Single DatePicker supports common antd APIs and DatePicker-specific APIs listed in this document.
- DatePicker supports date, week, month, quarter, and year picker modes.
- DatePicker supports multiple selection where antd documents it.
- DatePicker supports showTime and disabledTime.
- RangePicker exists as `DatePicker.RangePicker` and named `RangePicker`.
- RangePicker supports documented range APIs listed in this document.
- Custom rendering, presets, footer, semantic classes/styles, statuses, variants, sizes, icons, popup placement, and clear behavior are tested.
- Existing DatePicker tests are migrated or replaced with dayjs tests.
- Docs page demonstrates the new dayjs API and major capabilities.
- Lint, format check, typecheck, tests, and build pass.
