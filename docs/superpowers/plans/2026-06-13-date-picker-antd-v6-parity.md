# DatePicker Ant Design v6 Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align `DatePicker` and `RangePicker` with Ant Design v6 while preserving Solid conventions, antd-aligned tokens, and updated docs.

**Architecture:** Keep the existing Solid-native dayjs DatePicker implementation. Update the public type layer first, then add runtime behavior, then migrate style tokens and docs so the user-facing API and examples match the new contract.

**Tech Stack:** SolidJS, TypeScript, dayjs, Vitest, `@solidjs/testing-library`, `@solid-ant-design/cssinjs`, project theme tokens.

---

## File Structure

- Modify `packages/components/src/date-picker/interface.ts` for public API types, `size`, `previewValue`, semantic function forms, RangePicker signatures, and deprecated prop removal.
- Modify `packages/components/src/date-picker/semantic.ts` for object/function semantic prop resolution and `size="medium"` class mapping.
- Modify `packages/components/src/date-picker/date-picker.tsx` for default `allowClear`, removed props, multiple/showTime behavior, semantic function inputs, and `previewValue`.
- Modify `packages/components/src/date-picker/range-picker.tsx` for default clear behavior, `id` object, `from` metadata, `disabledTime` signature, `previewValue`, and default separator icon.
- Modify `packages/components/src/date-picker/date-panel.tsx`, `month-panel.tsx`, `year-panel.tsx`, `decade-panel.tsx`, `picker-panel.tsx`, and `presets-panel.tsx` only as needed to accept resolved semantic maps and the updated disabled date metadata.
- Modify `packages/components/src/date-picker/format-utils.ts` for formatter functions inside arrays.
- Modify `packages/theme/src/types.ts` and `packages/theme/src/components.ts` for DatePicker component token definitions and defaults.
- Modify `packages/components/src/date-picker/date-picker.style.ts` to consume DatePicker component tokens.
- Modify tests under `packages/components/src/date-picker/__tests__/`.
- Modify `apps/docs/src/pages/components/date-picker.mdx` for examples and API docs.

## Task 1: Public Type Contract

**Files:**

- Modify: `packages/components/src/date-picker/interface.ts`
- Test: `packages/components/src/date-picker/__tests__/date-picker-types.test.tsx`

- [ ] **Step 1: Write failing public type tests**

Replace the "accepts public parity props" test in `packages/components/src/date-picker/__tests__/date-picker-types.test.tsx` with coverage for v6/Solid types:

```tsx
it('accepts v6 Solid public props and rejects removed compatibility props', () => {
  const single = (
    <DatePicker
      class="solid-picker"
      size="medium"
      previewValue="hover"
      format={['YYYY-MM-DD', (value) => value.format('YYYY/MM/DD')]}
      classNames={(info) => ({ root: info.props.class, popup: 'popup-slot' })}
      styles={() => ({ popup: { width: '320px' } })}
      superPrevIcon={<span />}
      superNextIcon={<span />}
      components={{
        input: (props) => <input ref={props.inputRef} value={props.value} />,
        panel: (props) => <div>{props.children}</div>,
        date: (props) => <div>{props.children}</div>,
      }}
      onSelect={(date) => date.format('YYYY-MM-DD')}
    />
  )
  const range = (
    <RangePicker
      class="solid-range-picker"
      id={{ start: 'range-start', end: 'range-end' }}
      size="medium"
      previewValue={false}
      disabledDate={(current, info) => {
        info.from?.format('YYYY-MM-DD')
        return current.isBefore(dayjs('2026-01-01'))
      }}
      disabledTime={(date, partial, info) => {
        date?.format('HH:mm:ss')
        partial.toUpperCase()
        info.from?.format('YYYY-MM-DD')
        return {}
      }}
      onChange={(dates, dateStrings) => {
        dates?.[0]?.format('YYYY-MM-DD')
        dateStrings?.[0]?.toUpperCase()
      }}
    />
  )
  const removedClassName = (
    // @ts-expect-error DatePicker uses Solid class instead of React className
    <DatePicker className="legacy" />
  )
  const removedPopupClassName = (
    // @ts-expect-error popupClassName is removed; use classNames.popup
    <DatePicker popupClassName="legacy-popup" />
  )
  const removedDropdownClassName = (
    // @ts-expect-error dropdownClassName is removed; use classNames.popup
    <DatePicker dropdownClassName="legacy-popup" />
  )
  const removedPopupStyle = (
    // @ts-expect-error popupStyle is removed; use styles.popup
    <DatePicker popupStyle={{ width: '320px' }} />
  )
  const removedBordered = (
    // @ts-expect-error bordered is removed; use variant
    <DatePicker bordered={false} />
  )
  const removedPreviousIcon = (
    // @ts-expect-error previousIcon alias is removed; use prevIcon
    <DatePicker previousIcon={<span />} />
  )
  const removedTimePickerMode = (
    // @ts-expect-error DatePicker picker does not expose time mode
    <DatePicker picker="time" />
  )
  const removedShowTimeDefaultValue = (
    // @ts-expect-error showTime.defaultValue compatibility alias is removed
    <DatePicker showTime={{ defaultValue: dayjs('2026-06-01') }} />
  )
  const multipleWithShowTime = (
    // @ts-expect-error multiple DatePicker does not support showTime
    <DatePicker multiple showTime />
  )

  expect(single).toBeTruthy()
  expect(range).toBeTruthy()
  expect(removedClassName).toBeTruthy()
  expect(removedPopupClassName).toBeTruthy()
  expect(removedDropdownClassName).toBeTruthy()
  expect(removedPopupStyle).toBeTruthy()
  expect(removedBordered).toBeTruthy()
  expect(removedPreviousIcon).toBeTruthy()
  expect(removedTimePickerMode).toBeTruthy()
  expect(removedShowTimeDefaultValue).toBeTruthy()
  expect(multipleWithShowTime).toBeTruthy()
})
```

- [ ] **Step 2: Run type test to verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test packages/components/src/date-picker/__tests__/date-picker-types.test.tsx
```

Expected: FAIL because current types still accept removed props, reject `size="medium"`, reject formatter functions inside format arrays, and use the old `previewValue` shape.

- [ ] **Step 3: Update public interfaces**

In `packages/components/src/date-picker/interface.ts`:

- Change `PickerType` to `'date' | 'week' | 'month' | 'quarter' | 'year'`.
- Change `PickerMode` to `PickerType | 'time' | 'decade'`.
- Change `DatePickerFormat` array member to `Array<string | ((value: Dayjs) => string)>`.
- Remove `defaultValue` from `ShowTimeOptions` and `RangeShowTimeOptions`.
- Add:

```ts
export type DatePickerSize = 'small' | 'medium' | 'large'
export type DatePickerPreviewValue = false | 'hover'

export type SemanticClassNames<Slot extends string, Props> =
  | Partial<Record<Slot, string>>
  | ((info: { props: Props }) => Partial<Record<Slot, string>>)

export type SemanticStyles<Slot extends string, Props> =
  | Partial<Record<Slot, JSX.CSSProperties>>
  | ((info: { props: Props }) => Partial<Record<Slot, JSX.CSSProperties>>)
```

- Remove `className`, `popupClassName`, `dropdownClassName`, `popupStyle`, `bordered`, and `previousIcon` from `CommonPickerProps`.
- Set `size?: DatePickerSize`.
- Set `previewValue?: DatePickerPreviewValue`.
- Set common `disabledDate?: (current: Dayjs, info: { type: PickerType; from?: Dayjs }) => boolean`.
- Split DatePicker single and multiple props so `showTime?: boolean | ShowTimeOptions` exists only on single props and `showTime?: never` exists on multiple props.
- Move `showTime` out of `CommonPickerProps` if needed to make that split work.
- Set `classNames?: SemanticClassNames<DatePickerSemanticSlot, DatePickerProps>`.
- Set `styles?: SemanticStyles<DatePickerSemanticSlot, DatePickerProps>`.
- Change `RangePickerProps.id` to `{ start?: string; end?: string }`.
- Change `RangePickerProps.disabledTime` to `(date: Dayjs | null, partial: RangeSide, info: { from?: Dayjs }) => DisabledTimeConfig`.
- Change `RangePickerProps.onChange` to `(dates: RangePickerValue, dateStrings: [string, string] | null) => void`.
- Use `SemanticClassNames<DatePickerSemanticSlot, RangePickerProps>` and `SemanticStyles<DatePickerSemanticSlot, RangePickerProps>` for RangePicker.

- [ ] **Step 4: Run type test to verify pass**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test packages/components/src/date-picker/__tests__/date-picker-types.test.tsx
```

Expected: PASS.

## Task 2: Semantic Helpers and Format Arrays

**Files:**

- Modify: `packages/components/src/date-picker/semantic.ts`
- Modify: `packages/components/src/date-picker/format-utils.ts`
- Modify: DatePicker panel files that call `semanticClass`/`semanticStyle`
- Test: `packages/components/src/date-picker/__tests__/custom-render.test.tsx`

- [ ] **Step 1: Write failing tests**

In `packages/components/src/date-picker/__tests__/custom-render.test.tsx`, replace the bordered/previousIcon tests with v6 behavior:

```tsx
it('supports function semantic classNames/styles and medium size', () => {
  const result = render(() => (
    <DatePicker
      defaultOpen
      class="solid-root"
      defaultValue={dayjs('2026-06-01')}
      allowClear
      size="medium"
      presets={[{ label: 'Slot preset', value: dayjs('2026-06-02') }]}
      renderExtraFooter={() => <span>slot footer</span>}
      classNames={(info) => ({
        root: info.props.class,
        selector: 'slot-selector',
        clear: 'slot-clear',
        cell: 'slot-cell',
        presets: 'slot-presets',
        footer: 'slot-footer',
        popup: 'slot-popup',
      })}
      styles={() => ({
        root: { width: '222px' },
        selector: { height: '44px' },
        clear: { color: 'red' },
        cell: { color: 'blue' },
        presets: { margin: '3px' },
        footer: { padding: '5px' },
        popup: { width: '333px' },
      })}
    />
  ))

  const root = result.container.querySelector<HTMLElement>('.ads-date-picker')
  const selector = result.container.querySelector<HTMLElement>('.ads-date-picker-selector')
  const clear = result.container.querySelector<HTMLElement>('.ads-date-picker-clear')
  const popup = document.body.querySelector<HTMLElement>('.ads-date-picker-dropdown')
  const presets = document.body.querySelector<HTMLElement>('.ads-date-picker-presets')
  const footer = document.body.querySelector<HTMLElement>('.ads-date-picker-footer')
  const cell = screen.getByRole('button', { name: '2026-06-01' })

  expect(root).toHaveClass('solid-root')
  expect(root).toHaveClass('ads-date-picker-md')
  expect(root?.style.width).toBe('222px')
  expect(selector).toHaveClass('slot-selector')
  expect(selector?.style.height).toBe('44px')
  expect(clear).toHaveClass('slot-clear')
  expect(clear?.style.color).toBe('red')
  expect(cell).toHaveClass('slot-cell')
  expect(cell.style.color).toBe('blue')
  expect(presets).toHaveClass('slot-presets')
  expect(presets?.style.margin).toBe('3px')
  expect(footer).toHaveClass('slot-footer')
  expect(footer?.style.padding).toBe('5px')
  expect(popup).toHaveClass('slot-popup')
  expect(popup?.style.width).toBe('333px')
})

it('uses prevIcon and rejects the removed previousIcon alias at runtime', () => {
  render(() => (
    <RangePicker
      defaultOpen
      prevIcon={<span data-testid="range-prev-icon">prev</span>}
      nextIcon={<span data-testid="range-next-icon">next</span>}
    />
  ))

  expect(screen.getByTestId('range-prev-icon')).toBeInTheDocument()
  expect(screen.getByTestId('range-next-icon')).toBeInTheDocument()
})

it('formats with formatter functions inside format arrays', () => {
  render(() => (
    <DatePicker
      defaultValue={dayjs('2026-06-01')}
      format={['YYYY-MM-DD', (value) => value.format('YYYY/MM/DD')]}
    />
  ))

  expect(screen.getByRole('textbox')).toHaveValue('2026-06-01')
})
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test packages/components/src/date-picker/__tests__/custom-render.test.tsx
```

Expected: FAIL because function-form semantic props are not resolved, `size="medium"` has no medium class, and removed alias code still exists.

- [ ] **Step 3: Implement semantic resolution**

In `semantic.ts`:

- Add helper `resolveSemanticRecord(value, props)` that returns `value({ props })` when `value` is a function, otherwise `value`.
- Change `semanticClass` and `semanticStyle` to receive an already resolved object.
- Update call sites in DatePicker and panel components to resolve once per render:

```ts
const resolvedClassNames = createMemo(() => resolveSemanticRecord(local.classNames, props))
const resolvedStyles = createMemo(() => resolveSemanticRecord(local.styles, props))
```

- Pass `resolvedClassNames()` and `resolvedStyles()` to panels.
- Update `rootVariantClass` to map `medium` to an `ads-date-picker-md` class, `small` to `ads-date-picker-sm`, and `large` to `ads-date-picker-lg`.
- Remove `bordered` mapping and `previousIcon` handling from call sites.

- [ ] **Step 4: Implement format array function support**

In `format-utils.ts`, update formatter selection so arrays can contain strings or formatter functions. Use the first array item for display formatting and support parsing with string entries only:

```ts
function primaryFormat(
  format: DatePickerFormat | undefined,
  picker: PickerType,
): string | ((value: dayjs.Dayjs) => string) {
  const normalized = format ?? defaultFormat(picker)
  if (Array.isArray(normalized)) return normalized[0] ?? defaultFormat(picker)
  if (typeof normalized === 'object') return normalized.format
  return normalized
}
```

When parsing, filter arrays to string entries and object `format` values.

- [ ] **Step 5: Run tests to verify pass**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test packages/components/src/date-picker/__tests__/custom-render.test.tsx
```

Expected: PASS.

## Task 3: DatePicker Behavior

**Files:**

- Modify: `packages/components/src/date-picker/date-picker.tsx`
- Test: `packages/components/src/date-picker/__tests__/date-picker.test.tsx`
- Test: `packages/components/src/date-picker/__tests__/multiple.test.tsx`

- [ ] **Step 1: Write failing tests**

Add to `date-picker.test.tsx`:

```tsx
it('shows clear button by default and hides it with allowClear false', () => {
  const { unmount } = render(() => <DatePicker defaultValue={dayjs('2026-06-01')} />)
  expect(screen.getByRole('button', { name: 'Clear date' })).toBeInTheDocument()

  unmount()
  cleanup()
  document.body.innerHTML = ''

  render(() => <DatePicker defaultValue={dayjs('2026-06-01')} allowClear={false} />)
  expect(screen.queryByRole('button', { name: 'Clear date' })).not.toBeInTheDocument()
})
```

Add to `multiple.test.tsx`:

```tsx
it('does not render the time panel when multiple is combined with showTime at runtime', () => {
  render(() => (
    <DatePicker
      // Runtime guard for JS consumers; TypeScript rejects this combination.
      {...({ multiple: true, showTime: true } as any)}
      defaultOpen
      defaultPickerValue={dayjs('2026-06-01')}
    />
  ))

  expect(document.body.querySelector('.ads-date-picker-time-panel')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test packages/components/src/date-picker/__tests__/date-picker.test.tsx packages/components/src/date-picker/__tests__/multiple.test.tsx
```

Expected: FAIL because default `allowClear` is currently false and `showTime` can render for multiple.

- [ ] **Step 3: Implement DatePicker behavior**

In `date-picker.tsx`:

- Treat `allowClear` as enabled unless `local.allowClear === false`.
- Keep custom clear icon when `typeof local.allowClear === 'object'`.
- Make `showTimeEnabled()` return `false` when `multiple()` is true.
- Remove `className`, `popupClassName`, `dropdownClassName`, `popupStyle`, `bordered`, and `previousIcon` from `splitProps` and render usage.
- Use `class={local.class}` only for root classes.
- Use semantic popup classes/styles instead of removed popup props.
- Use `prevIcon` only for previous icon.

- [ ] **Step 4: Run tests to verify pass**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test packages/components/src/date-picker/__tests__/date-picker.test.tsx packages/components/src/date-picker/__tests__/multiple.test.tsx
```

Expected: PASS.

## Task 4: RangePicker Behavior

**Files:**

- Modify: `packages/components/src/date-picker/range-picker.tsx`
- Modify: `packages/components/src/date-picker/date-panel.tsx`
- Test: `packages/components/src/date-picker/__tests__/range-picker.test.tsx`
- Test: `packages/components/src/date-picker/__tests__/show-time.test.tsx`

- [ ] **Step 1: Write failing RangePicker tests**

Add to `range-picker.test.tsx`:

```tsx
it('uses object ids for start and end inputs', () => {
  render(() => <RangePicker id={{ start: 'range-start', end: 'range-end' }} />)

  expect(screen.getAllByRole('textbox')[0]).toHaveAttribute('id', 'range-start')
  expect(screen.getAllByRole('textbox')[1]).toHaveAttribute('id', 'range-end')
})

it('uses a default icon separator instead of a hyphen', () => {
  render(() => <RangePicker />)

  expect(document.body.textContent).not.toBe('-')
  expect(document.querySelector('.ads-date-picker-range-separator svg')).toBeTruthy()
})

it('clears the full range by default and emits null values', () => {
  const onChange = vi.fn()
  render(() => (
    <RangePicker defaultValue={[dayjs('2026-06-01'), dayjs('2026-06-15')]} onChange={onChange} />
  ))

  fireEvent.click(screen.getByRole('button', { name: 'Clear date range' }))

  expect(onChange).toHaveBeenLastCalledWith(null, null)
  const inputs = screen.getAllByRole('textbox')
  expect(inputs[0]).toHaveValue('')
  expect(inputs[1]).toHaveValue('')
})

it('passes from date to disabledDate while selecting a range end', () => {
  const disabledDate = vi.fn(() => false)
  render(() => (
    <RangePicker defaultOpen defaultPickerValue={dayjs('2026-06-01')} disabledDate={disabledDate} />
  ))

  fireEvent.click(screen.getByRole('button', { name: '2026-06-10' }))
  fireEvent.mouseEnter(screen.getByRole('button', { name: '2026-06-15' }))

  expect(
    disabledDate.mock.calls.some(([, info]) => info.from?.format('YYYY-MM-DD') === '2026-06-10'),
  ).toBe(true)
})

it('disables hover preview when previewValue is false', () => {
  render(() => (
    <RangePicker defaultOpen previewValue={false} defaultPickerValue={dayjs('2026-06-01')} />
  ))

  fireEvent.click(screen.getByRole('button', { name: '2026-06-10' }))
  fireEvent.mouseEnter(screen.getByRole('button', { name: '2026-06-15' }))

  expect(screen.getByRole('button', { name: '2026-06-12' })).not.toHaveClass(
    'ads-date-picker-cell-in-range',
  )
})
```

Add to `show-time.test.tsx`:

```tsx
it('passes active partial and from date to RangePicker disabledTime', () => {
  const disabledTime = vi.fn(() => ({}))
  render(() => (
    <RangePicker
      showTime
      defaultOpen
      defaultPickerValue={dayjs('2026-06-01')}
      disabledTime={disabledTime}
    />
  ))

  fireEvent.click(screen.getByRole('button', { name: '2026-06-10' }))

  expect(
    disabledTime.mock.calls.some(
      ([, partial, info]) => partial === 'end' && info.from?.format('YYYY-MM-DD') === '2026-06-10',
    ),
  ).toBe(true)
})
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test packages/components/src/date-picker/__tests__/range-picker.test.tsx packages/components/src/date-picker/__tests__/show-time.test.tsx
```

Expected: FAIL because object ids, full-range clear, from metadata, disabledTime metadata, default icon separator, and preview disabling are not implemented.

- [ ] **Step 3: Implement RangePicker behavior**

In `range-picker.tsx`:

- Treat `allowClear` as enabled unless `local.allowClear === false`.
- Add an overall clear button for the full range when any value exists. Use aria-label `Clear date range`.
- Keep side-specific clear buttons only when `allowEmpty?.[index]` is true.
- Emit `local.onChange?.(null, null)` when clearing the full range.
- Store input values as `['', '']` when range is null.
- Change `inputId(side)` to read `local.id?.start` and `local.id?.end`.
- Add `fromForSide(side)` helper returning the opposite selected or pending endpoint.
- Call `disabledDate(date, { type: picker(), from })` with `fromForSide(activeRange())` while selecting.
- Call `disabledTime(activeDate, activeRange(), { from: fromForSide(activeRange()) })`.
- Only set hover preview when `local.previewValue !== false`.
- Remove deprecated props from `splitProps` and render usage.
- Use semantic popup class/style only.
- Import a project icon equivalent to right arrow, for example `SwapRightOutlined` if available, and render it as default separator.

- [ ] **Step 4: Update panels if needed**

If `DatePanel` needs active range metadata to compute disabled cells, thread the resolved `disabledDate` callback from RangePicker instead of changing each panel's public API.

- [ ] **Step 5: Run tests to verify pass**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test packages/components/src/date-picker/__tests__/range-picker.test.tsx packages/components/src/date-picker/__tests__/show-time.test.tsx
```

Expected: PASS.

## Task 5: DatePicker Component Tokens and Styles

**Files:**

- Modify: `packages/theme/src/types.ts`
- Modify: `packages/theme/src/components.ts`
- Modify: `packages/components/src/date-picker/date-picker.style.ts`
- Test: `packages/components/src/date-picker/__tests__/custom-render.test.tsx`

- [ ] **Step 1: Write failing token style test**

Add to `custom-render.test.tsx`:

```tsx
it('consumes DatePicker component tokens for dimensions and range colors', () => {
  const cache = createCache()
  render(() => (
    <StyleProvider cache={cache}>
      <DatePicker defaultOpen defaultValue={dayjs('2026-06-01')} />
    </StyleProvider>
  ))

  const css = extractStyle(cache)
  expect(css).toContain('height:32px')
  expect(css).toContain('width:36px')
  expect(css).toContain('background:#e6f4ff')
})
```

- [ ] **Step 2: Run token test to verify failure or weak coverage**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test packages/components/src/date-picker/__tests__/custom-render.test.tsx
```

Expected: FAIL if current CSS does not contain the desired token-derived values, or PASS weakly if values are hardcoded. If it passes before implementation, continue and later verify by changing a token in the test to prove token consumption.

- [ ] **Step 3: Add DatePicker token types and defaults**

In `packages/theme/src/types.ts`, replace the current generic `DatePicker?: ComponentTokenBase` entry with a dedicated `DatePickerComponentToken` interface containing the spec token names, and set `DatePicker?: DatePickerComponentToken`.

In `packages/theme/src/components.ts`, add DatePicker defaults mapped from alias tokens. Use antd-like defaults:

- `activeBorderColor: token.colorPrimary`
- `activeShadow: token.controlOutline`
- `cellActiveWithRangeBg: token.colorPrimaryBg`
- `cellHoverBg: token.controlItemBgHover`
- `cellRangeBorderColor: token.colorPrimary`
- `cellHeight: 24`
- `cellWidth: 36`
- `inputFontSize: token.fontSize`
- `inputFontSizeLG: token.fontSizeLG`
- `inputFontSizeSM: token.fontSizeSM`
- `paddingBlock: token.paddingXXS`
- `paddingInline: token.paddingSM`
- `presetsWidth: 120`
- `timeColumnHeight: 224`
- `timeColumnWidth: 56`

- [ ] **Step 4: Consume tokens in DatePicker styles**

In `date-picker.style.ts`:

- Read `const datePickerToken = getComponentToken('DatePicker', token)`.
- Replace DatePicker-specific hardcoded dimensions/colors with `datePickerToken` values.
- Keep shared alias token usage for generic text, border, radius, and disabled colors.

- [ ] **Step 5: Strengthen token test if needed**

If Step 2 passed before implementation, update the test to wrap a `ConfigProvider` theme override:

```tsx
<ConfigProvider
  theme={{ components: { DatePicker: { cellWidth: 44, cellActiveWithRangeBg: '#abcdef' } } }}
>
  <StyleProvider cache={cache}>
    <DatePicker defaultOpen defaultValue={dayjs('2026-06-01')} />
  </StyleProvider>
</ConfigProvider>
```

Then assert `width:44px` and `background:#abcdef`.

- [ ] **Step 6: Run token tests to verify pass**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test packages/components/src/date-picker/__tests__/custom-render.test.tsx
```

Expected: PASS.

## Task 6: Documentation Examples and API

**Files:**

- Modify: `apps/docs/src/pages/components/date-picker.mdx`
- Test: docs route/runtime tests if present

- [ ] **Step 1: Update docs examples**

Rewrite `apps/docs/src/pages/components/date-picker.mdx` DatePicker examples to include:

- Basic DatePicker
- RangePicker
- Picker variants
- Format
- Multiple
- Need confirm
- Choose time
- Disabled date and disabled time
- Presets
- Extra footer
- Custom cell render
- Panel render
- Status and variants
- Prefix and suffix icons
- Semantic `classNames` and `styles`
- Ref methods

Use Solid syntax and the new public API only. Use `class`, `classNames.popup`, `styles.popup`, `prevIcon`, `size="medium"`, and `previewValue={false}` where relevant. Do not include `className`, `popupClassName`, `dropdownClassName`, `popupStyle`, `bordered`, `previousIcon`, or `showTime.defaultValue`.

- [ ] **Step 2: Update API tables**

Update the DatePicker, RangePicker, ShowTimeOptions, DisabledTimeConfig, Locale, Semantic slots, and Methods sections:

- Show `size` as `'small' | 'medium' | 'large'`.
- Show `previewValue` as `false | 'hover'`.
- Show `format` as `string | ((value: Dayjs) => string) | Array<string | ((value: Dayjs) => string)> | { format: string; type?: 'mask' }`.
- Show RangePicker `id` as `{ start?: string; end?: string }`.
- Show RangePicker `disabledDate` and `disabledTime` metadata.
- Show `classNames` and `styles` object/function forms.
- Remove all deleted compatibility props.

- [ ] **Step 3: Run docs checks**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test
```

Expected: PASS.

## Task 7: Full DatePicker Verification

**Files:**

- All modified DatePicker/theme/docs files

- [ ] **Step 1: Run focused DatePicker tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test packages/components/src/date-picker/__tests__
```

Expected: PASS.

- [ ] **Step 2: Run full repository verification**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: all commands exit 0. If any command fails, fix the failure and rerun the failed command before reporting status.

- [ ] **Step 3: Review diff for removed compatibility props**

Run:

```bash
rg "className|popupClassName|dropdownClassName|popupStyle|bordered|previousIcon|defaultValue\\?" packages/components/src/date-picker apps/docs/src/pages/components/date-picker.mdx
```

Expected: no deleted compatibility prop references remain in DatePicker public code or docs. `defaultValue` as DatePicker value prop may still appear; only `showTime.defaultValue` compatibility should be gone.

- [ ] **Step 4: Summarize final changes**

Report the changed files, verification results, and any intentionally deferred gaps.
