# DatePicker antd Parity Design

## Goal

Rebuild `packages/components/src/date-picker` so it uses `dayjs` as its value and date manipulation library, and supports the current public antd DatePicker API surface except `classNames` and `styles`, which are intentionally out of scope.

The resulting component should expose:

- `DatePicker`
- `DatePicker.RangePicker`
- optional named `RangePicker` export
- `picker="date" | "week" | "month" | "quarter" | "year"`
- single, range, multiple, and show-time selection flows

## Explicit Non-Goals

- Do not implement `classNames`.
- Do not implement `styles`.
- Do not preserve `Date | string` as the primary value type. New public values use `Dayjs | null` or arrays of `Dayjs | null`.
- Do not wrap React antd or React rc-picker components at runtime.
- Do not implement perfect pixel parity with antd. The target is API and behavior parity within this Solid component library's styling system.

## Public API Scope

### Common API

Implement these antd-compatible common props:

- `allowClear?: boolean | { clearIcon?: JSX.Element }`
- `bordered?: boolean` as deprecated compatibility mapped to `variant`
- `className?: string` as an alias merged with Solid `class`
- `dateRender?: DateRender` as deprecated compatibility mapped to `cellRender`
- `cellRender?: CellRender`
- `components?: Partial<Record<PanelName | 'input', ComponentLike>>`
- `defaultOpen?: boolean`
- `disabled?: boolean`
- `disabledDate?: (currentDate: Dayjs, info: { from?: Dayjs; type: PickerType }) => boolean`
- `dropdownClassName?: string` deprecated popup class compatibility
- `format?: FormatType`
- `order?: boolean`
- `popupClassName?: string` deprecated popup class compatibility
- `popupStyle?: JSX.CSSProperties` deprecated popup style compatibility
- `preserveInvalidOnBlur?: boolean`
- `getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement`
- `inputReadOnly?: boolean`
- `locale?: DatePickerLocale`
- `minDate?: Dayjs`
- `maxDate?: Dayjs`
- `mode?: PanelMode`
- `needConfirm?: boolean`
- `nextIcon?: JSX.Element`
- `open?: boolean`
- `panelRender?: (panelNode: JSX.Element) => JSX.Element`
- `picker?: PickerType`
- `placeholder?: string | [string, string]`
- `placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'`
- `prefix?: JSX.Element`
- `presets?: Preset[]`
- `prevIcon?: JSX.Element`
- `previewValue?: false | 'hover'`
- `size?: ComponentSize`
- `status?: 'error' | 'warning'`
- `suffixIcon?: JSX.Element`
- `superNextIcon?: JSX.Element`
- `superPrevIcon?: JSX.Element`
- `variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'`
- `onOpenChange?: (open: boolean) => void`
- `onPanelChange?: (value: Dayjs | [Dayjs | null, Dayjs | null] | null, mode: PanelMode) => void`
- deprecated `onSelect?: (value: Dayjs) => void`

Do not add `classNames` or `styles` to the public interface.

### DatePicker API

Implement:

- `value?: Dayjs | null` for normal single selection
- `defaultValue?: Dayjs | null`
- `value?: Dayjs[]` and `defaultValue?: Dayjs[]` when `multiple` is true
- `defaultPickerValue?: Dayjs`
- `pickerValue?: Dayjs`
- `disabledTime?: (date: Dayjs) => DisabledTimeConfig`
- `multiple?: boolean`
- `renderExtraFooter?: (mode: PanelMode) => JSX.Element`
- `showNow?: boolean`
- `showTime?: boolean | ShowTimeOptions`
- deprecated `showTime.defaultValue` compatibility mapped to `showTime.defaultOpenValue`
- `showTime.defaultOpenValue?: Dayjs`
- `showWeek?: boolean`
- `tagRender?: (props: TagRenderProps) => JSX.Element`
- `onChange?: (date: Dayjs | Dayjs[] | null, dateString: string | string[]) => void`
- `onOk?: (date?: Dayjs | Dayjs[] | null) => void`
- `onPanelChange?: (value: Dayjs | null, mode: PanelMode) => void`

### RangePicker API

Implement:

- `allowEmpty?: [boolean, boolean]`
- `value?: [Dayjs | null, Dayjs | null] | null`
- `defaultValue?: [Dayjs | null, Dayjs | null] | null`
- `defaultPickerValue?: Dayjs | [Dayjs, Dayjs]`
- `pickerValue?: Dayjs | [Dayjs, Dayjs]`
- `disabled?: boolean | [boolean, boolean]`
- `disabledTime?: (date: Dayjs, partial: 'start' | 'end', info: { from?: Dayjs }) => DisabledTimeConfig`
- `format?: FormatType`
- `id?: { start?: string; end?: string }`
- `presets?: RangePreset[]`
- `renderExtraFooter?: (mode: PanelMode) => JSX.Element`
- `separator?: JSX.Element`
- `showTime?: boolean | RangeShowTimeOptions`
- deprecated `showTime.defaultValue` compatibility mapped to `showTime.defaultOpenValue`
- `showTime.defaultOpenValue?: [Dayjs, Dayjs]`
- `onCalendarChange?: (dates: [Dayjs | null, Dayjs | null], dateStrings: [string, string], info: { range: 'start' | 'end' }) => void`
- `onChange?: (dates: [Dayjs | null, Dayjs | null] | null, dateStrings: [string, string] | null) => void`
- `onFocus?: (event: FocusEvent, info: { range: 'start' | 'end' }) => void`
- `onBlur?: (event: FocusEvent, info: { range: 'start' | 'end' }) => void`

## Architecture

### Module layout

Use small kebab-case modules under `packages/components/src/date-picker`:

- `interface.ts`: public types and component signatures.
- `date-picker.tsx`: single picker composition and `DatePicker.RangePicker` assignment.
- `range-picker.tsx`: range composition.
- `picker-input.tsx`: input, clear button, prefix/suffix, focus/blur handling.
- `picker-popup.tsx`: portal, placement, z-index, outside click handling.
- `picker-panel.tsx`: shared panel shell, header, footer, confirm buttons.
- `date-panel.tsx`: date grid, week display, hover preview, range classes.
- `month-panel.tsx`: month and quarter cell panels.
- `year-panel.tsx`: year and decade cell panels.
- `time-panel.tsx`: embedded time selector for `showTime`.
- `presets-panel.tsx`: single and range presets.
- `multiple-tags.tsx`: multiple value tag display and `tagRender`.
- `date-utils.ts`: dayjs comparisons, bounds checks, add/snap helpers.
- `format-utils.ts`: antd `FormatType` display and parsing.
- `locale.ts`: default locale and merge helper.
- `semantic.ts`: internal semantic slot names only for class construction, not public `classNames`/`styles`.
- `date-picker.style.ts`: component styles.

### Value model

All internal values are `dayjs.Dayjs` or `null`:

- Single: `Dayjs | null`
- Multiple: `Dayjs[]`
- Range: `[Dayjs | null, Dayjs | null] | null`

Selection compares at picker granularity:

- date: `day`
- week: `week`
- month: `month`
- quarter: `quarter`
- year: `year`

Range ordering honors `order !== false`. Multiple ordering also honors `order !== false`.

### Formatting and input parsing

Implement `FormatType`:

```ts
type FormatType =
  | string
  | ((value: Dayjs) => string)
  | Array<string | ((value: Dayjs) => string)>
  | { format: string; type?: 'mask' }
```

Rules:

- Display uses the first available formatter.
- Parsing tries string formatters in order, then dayjs fallback.
- Function formatters are display-only because they are not parseable.
- Mask objects use their `format` for display and parse.
- Invalid blur clears input unless `preserveInvalidOnBlur` is true.

### Panel behavior

Panel mode uses:

```ts
type PanelMode = 'time' | 'date' | 'month' | 'year' | 'decade'
type PickerType = 'date' | 'week' | 'month' | 'quarter' | 'year'
```

Default panel mode is derived from `picker`, with internal transitions:

- date picker can navigate decade -> year -> month -> date.
- month picker selects from month panel.
- quarter picker selects from quarter cells in month panel.
- year picker selects from year panel.
- week picker selects a week row from date panel.

`pickerValue` controls panel date. `defaultPickerValue` seeds panel date and resets when opened. `onPanelChange` fires when panel date or panel mode changes.

`minDate` and `maxDate` restrict both selection and panel navigation.

### Single selection

For normal single DatePicker:

- Selecting a cell commits immediately unless `showTime` or `needConfirm` requires pending confirmation.
- With `showTime`, date selection updates pending value and the time panel adjusts time; OK commits and calls `onOk` and `onChange`.
- `showNow` provides a quick current datetime action when time is shown.
- `disabledDate` and `disabledTime` prevent invalid selection.

### Multiple selection

When `multiple` is true:

- Value is `Dayjs[]`.
- Selecting an existing value removes it; selecting a new cell adds it.
- `multiple` is incompatible with `showTime`; if both are supplied, ignore `showTime` and warn in development only if the repo already has a warning helper. If no warning helper exists, silently prioritize `multiple`.
- Tags render inside the selector; `tagRender` customizes tags.
- `needConfirm` controls whether additions/removals are pending until OK.

### Range selection

RangePicker tracks:

- active input: `start` or `end`
- selected range
- pending range while selecting
- hover date for preview
- separate panel dates when needed

Behavior:

- First click sets active boundary.
- Second click completes range.
- `allowEmpty` allows clearing one side.
- `disabled` can disable both or individual inputs.
- `onCalendarChange` fires during partial selection.
- `onChange` fires when the final normalized range changes, or with `null` when cleared.
- `separator` renders between inputs.
- `showTime` adds time selection for each boundary and OK confirmation.

### Custom rendering

- `cellRender` wraps each cell with an `originNode` and metadata.
- Deprecated `dateRender` maps to date cell rendering when `cellRender` is absent.
- `renderExtraFooter` appears in panel footer.
- `panelRender` receives the complete panel node and returns replacement JSX.
- `components` can replace high-level panels or input where practical. Unsupported component keys are ignored rather than breaking rendering.

### Visual API

Implement class-based visual props:

- `size`: default from `ConfigProvider.componentSize()`.
- `status`: root status class.
- `variant`: root variant class.
- deprecated `bordered={false}` maps to `variant="borderless"` when `variant` is absent.
- `prefix`, `suffixIcon`, clear icon, navigation icons.
- `placement` affects popup class and positioning.
- deprecated popup class/style props are applied to popup root.

### Focus and blur methods

Expose imperative methods compatible with antd expectations as much as Solid allows. The public component function cannot receive React refs, so implement focus/blur through a Solid-compatible `ref` pattern documented in examples:

```tsx
let pickerRef: DatePickerRef | undefined
;<DatePicker ref={pickerRef} />
pickerRef?.focus()
pickerRef?.blur()
```

If the existing component conventions do not support object refs, provide the methods through function refs on the root input element and document that limitation.

### Accessibility and keyboard

Minimum keyboard behavior:

- Enter opens popup or confirms focused cell.
- Escape closes popup.
- Arrow keys navigate focused date cells when popup is open.
- Tab leaves inputs normally.
- Inputs expose combobox semantics and `aria-expanded`.
- Disabled cells use `aria-disabled`.
- Selected cells use `aria-selected` or `aria-pressed`.

## Testing Strategy

Use TDD. Add failing tests before production changes.

Test files:

- `date-picker.test.tsx`: single picker baseline, dayjs value, open, clear, disabled, input parsing.
- `picker-variants.test.tsx`: week, month, quarter, year, panel navigation.
- `range-picker.test.tsx`: range selection, allowEmpty, separator, onCalendarChange, disabled sides.
- `show-time.test.tsx`: showTime, disabledTime, showNow, onOk.
- `multiple.test.tsx`: add/remove multiple values, ordering, needConfirm, tagRender.
- `custom-render.test.tsx`: cellRender, dateRender, renderExtraFooter, panelRender, icons, presets.
- `date-picker-style-api.test.tsx`: size, status, variant, className, popup class/style, placement, prefix/suffix/clearIcon.

Verification commands:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

## Documentation

Update `apps/docs/src/pages/components/date-picker.tsx` to show:

- basic dayjs usage
- controlled value
- picker variants
- RangePicker
- showTime
- multiple
- presets
- custom cell/footer/panel
- size/status/variant
- disabled date/time

Document that `classNames` and `styles` are intentionally unsupported for now.

## Risks and Mitigations

### Large API surface

Risk: implementing every behavior in one file would become unmaintainable.

Mitigation: split by focused modules listed above and test each behavior separately.

### antd behavior edge cases

Risk: exact rc-picker parity has many edge cases.

Mitigation: align public behavior covered by tests and document limitations only where Solid runtime differences require them.

### Solid ref differences

Risk: antd imperative ref methods are React-centric.

Mitigation: expose the closest Solid-compatible ref behavior and add tests for focus/blur where possible.

### TimePicker reuse mismatch

Risk: existing `TimePicker` is string-based and standalone.

Mitigation: implement an embedded dayjs `time-panel.tsx`, sharing only concepts and styling where appropriate.

## Self-Review

- Placeholder scan: no TBD/TODO placeholders remain.
- Scope check: `classNames` and `styles` are explicitly excluded; all other requested antd DatePicker areas are included.
- Consistency check: all public value types use `Dayjs` and all file names are kebab-case.
- Ambiguity check: deprecated antd props are compatibility props; unsupported `components` keys are ignored rather than throwing.
