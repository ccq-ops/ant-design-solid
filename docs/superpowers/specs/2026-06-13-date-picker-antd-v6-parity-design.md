# DatePicker Ant Design v6 Parity Design

## Goal

Align `DatePicker` and `DatePicker.RangePicker` with the current Ant Design v6 API surface while preserving Solid conventions and the existing dayjs-based implementation.

The public API should feel native in Solid:

- Use `class` as the root class prop instead of React-style `className`.
- Use `JSX.Element` and `JSX.CSSProperties` in public types instead of React types.
- Use Solid component override types for internal slot components.
- Remove deprecated compatibility props rather than continuing to expose old antd aliases.

## Scope

This work covers:

- `<DatePicker />`
- `<DatePicker picker="week" />`
- `<DatePicker picker="month" />`
- `<DatePicker picker="quarter" />`
- `<DatePicker picker="year" />`
- `<DatePicker.RangePicker />`
- named `RangePicker` export
- DatePicker docs examples and API tables
- DatePicker component tokens and styles

The implementation remains Solid-native and keeps dayjs as the value type. It will not wrap React antd or React rc-picker at runtime.

## Public API

Remove deprecated or compatibility props from the public DatePicker types and docs:

- `className`
- `popupClassName`
- `dropdownClassName`
- `popupStyle`
- `bordered`
- `previousIcon`
- `showTime.defaultValue`

The root class API is `class`. Popup styling should go through semantic `classNames` and `styles`.

Shared DatePicker and RangePicker props should include:

- `allowClear?: boolean | { clearIcon?: JSX.Element }`
- `class?: string`
- `style?: JSX.CSSProperties`
- `classNames?: SemanticClassNames<DatePickerSemanticSlot, DatePickerProps>`
- `styles?: SemanticStyles<DatePickerSemanticSlot, DatePickerProps>`
- `cellRender`
- `components`
- `dateRender`
- `defaultOpen`
- `disabled`
- `disabledDate`
- `format`
- `getPopupContainer`
- `inputReadOnly`
- `locale`
- `maxDate`
- `minDate`
- `mode`
- `needConfirm`
- `nextIcon`
- `open`
- `order`
- `panelRender`
- `picker`
- `placeholder`
- `placement`
- `prefix`
- `preserveInvalidOnBlur`
- `presets`
- `previewValue?: false | 'hover'`
- `prevIcon`
- `renderExtraFooter`
- `size?: 'small' | 'medium' | 'large'`
- `status?: 'error' | 'warning'`
- `suffixIcon`
- `superNextIcon`
- `superPrevIcon`
- `variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'`
- `onOpenChange`
- `onPanelChange`
- `onSelect`

`DatePickerFormat` should match antd's current shape:

```ts
export type DatePickerFormat =
  | string
  | ((value: Dayjs) => string)
  | Array<string | ((value: Dayjs) => string)>
  | { format: string; type?: 'mask' }
```

`picker` should only expose DatePicker picker modes:

```ts
export type PickerType = 'date' | 'week' | 'month' | 'quarter' | 'year'
export type PickerMode = 'time' | 'date' | 'month' | 'year' | 'decade'
```

`picker="time"` should not be part of the DatePicker API.

Multiple selection should be unavailable with `showTime` at the type level where practical. Runtime behavior should also avoid rendering the time panel for multiple selection.

## RangePicker API

RangePicker should align these v6 details:

- `id?: { start?: string; end?: string }`
- `disabled?: boolean | [boolean, boolean]`
- `allowEmpty?: [boolean, boolean]`
- `disabledDate?: (current: Dayjs, info: { type: PickerType; from?: Dayjs }) => boolean`
- `disabledTime?: (date: Dayjs | null, partial: 'start' | 'end', info: { from?: Dayjs }) => DisabledTimeConfig`
- `onChange?: (dates: RangePickerValue, dateStrings: [string, string] | null) => void`
- `onCalendarChange?: (dates: RangePickerValue, dateStrings: [string, string], info: { range: 'start' | 'end' }) => void`
- `onFocus` and `onBlur` keep the existing Solid event plus `{ range }` metadata shape.

The default separator should render the project icon equivalent of antd's right-arrow range separator instead of a plain hyphen.

## Behavior

`allowClear` defaults to `true` for DatePicker and RangePicker. Passing `allowClear={false}` disables the clear control. Passing `{ clearIcon }` uses that icon.

RangePicker has two clear behaviors:

- The overall clear control clears the whole range and emits `onChange(null, null)`.
- Single-side clearing remains controlled by `allowEmpty` and should not appear for a side unless that side can be empty.

`previewValue` controls hover preview behavior:

- Omitted or `'hover'`: keep hover range preview enabled.
- `false`: disable hover preview and temporary input preview.

`disabledDate` receives `from` during range selection when the opposite endpoint is available. This enables dynamic range limits such as "end date cannot be more than seven days after the start date".

`disabledTime` receives the active range side and `from` for RangePicker. The time panel must call it with the currently active side.

`showTime.defaultOpenValue` remains supported. The deprecated `showTime.defaultValue` compatibility alias is removed from public types and docs.

## Semantic Styling

Semantic styling supports both object and function forms:

```ts
type SemanticClassNames<Slot extends string, Props> =
  | Partial<Record<Slot, string>>
  | ((info: { props: Props }) => Partial<Record<Slot, string>>)

type SemanticStyles<Slot extends string, Props> =
  | Partial<Record<Slot, JSX.CSSProperties>>
  | ((info: { props: Props }) => Partial<Record<Slot, JSX.CSSProperties>>)
```

The initial slot set remains focused and stable:

- `root`
- `selector`
- `input`
- `clear`
- `popup`
- `cell`
- `presets`
- `footer`

This slot set should be documented as the supported Solid semantic DOM surface. Additional antd slots can be added later if a concrete styling need appears.

## Token Design

DatePicker styles should consume DatePicker component tokens through the existing theme pipeline. Token names should follow antd's DatePicker token vocabulary where useful and map back to alias tokens when the project does not need a separate value.

Initial component token surface:

- `activeBg`
- `activeBorderColor`
- `activeShadow`
- `addonBg`
- `cellActiveWithRangeBg`
- `cellBgDisabled`
- `cellHoverBg`
- `cellHoverWithRangeBg`
- `cellRangeBorderColor`
- `cellHeight`
- `cellWidth`
- `hoverBg`
- `hoverBorderColor`
- `inputFontSize`
- `inputFontSizeLG`
- `inputFontSizeSM`
- `multipleItemBg`
- `multipleItemBorderColor`
- `multipleItemHeight`
- `multipleItemHeightLG`
- `multipleItemHeightSM`
- `paddingBlock`
- `paddingBlockLG`
- `paddingBlockSM`
- `paddingInline`
- `paddingInlineLG`
- `paddingInlineSM`
- `presetsWidth`
- `textHeight`
- `timeColumnHeight`
- `timeColumnWidth`
- `withoutTimeCellHeight`

The style file should read the DatePicker component token rather than hardcoding DatePicker-specific colors, dimensions, and spacing.

## Documentation

Update `apps/docs/src/pages/components/date-picker.mdx` to mirror antd's current DatePicker example coverage while using Solid syntax:

- Basic DatePicker
- RangePicker
- picker variants
- format
- multiple
- need confirm
- choose time
- disabled date and disabled time
- presets
- extra footer
- custom cell render
- panel render
- status and variants
- prefix and suffix icons
- semantic `classNames` and `styles`
- ref methods

API tables should remove deprecated compatibility props and use Solid naming and types.

## Testing

Use TDD for behavior changes. Add failing tests before implementation for:

- removed compatibility props rejected by public types
- `size="medium"` accepted and rendered with the medium size class
- `format` array accepting formatter functions
- `previewValue={false}` disabling range hover preview
- function-form `classNames` and `styles`
- DatePicker default `allowClear`
- RangePicker overall clear emitting `onChange(null, null)`
- RangePicker `id={{ start, end }}`
- RangePicker `disabledDate` receiving `info.from`
- RangePicker `disabledTime(date, partial, { from })`
- default RangePicker separator icon
- multiple selection not rendering `showTime`
- token registration and style consumption for DatePicker

Run the repository verification commands after implementation:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```
