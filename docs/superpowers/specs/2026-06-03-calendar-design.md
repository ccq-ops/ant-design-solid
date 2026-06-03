# Calendar Component Design

Date: 2026-06-03

## Goal

Add an Ant Design-style `Calendar` component to `@ant-design-solid/core` with the common display, selection, customization, documentation, and test coverage expected by the existing component library.

The implementation should follow repository conventions:

- Component files live under `packages/components/src/calendar/`.
- Docs live under `apps/docs/src/routes/components/calendar.tsx`.
- Root exports are updated in `packages/components/src/index.ts`.
- Docs navigation is updated in `apps/docs/src/site/nav.ts`.
- All TypeScript filenames use lowercase kebab-case.
- Styling uses `@ant-design-solid/cssinjs` and theme tokens via `useToken()`.

## Existing Patterns To Follow

Most components use this package layout:

```text
packages/components/src/<component>/
  index.ts
  interface.ts
  <component>.tsx
  <component>.style.ts
  __tests__/<component>.test.tsx
```

`DatePicker` already has local-date parsing, formatting, month navigation, selected/today/disabled cell states, and controlled/uncontrolled state patterns. `Calendar` should reuse those ideas, but it should remain an independent display component rather than depending on DatePicker's popup and selector UI.

## Supported API

```ts
export type CalendarValue = Date | string
export type CalendarMode = 'month' | 'year'

export interface CalendarHeaderRenderConfig {
  value: Date
  mode: CalendarMode
  onChange: (value: Date) => void
  onModeChange: (mode: CalendarMode) => void
}

export interface CalendarProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onSelect'
> {
  value?: CalendarValue
  defaultValue?: CalendarValue
  mode?: CalendarMode
  defaultMode?: CalendarMode
  fullscreen?: boolean
  disabledDate?: (date: Date) => boolean
  dateCellRender?: (date: Date) => JSX.Element
  dateFullCellRender?: (date: Date) => JSX.Element
  monthCellRender?: (date: Date) => JSX.Element
  monthFullCellRender?: (date: Date) => JSX.Element
  headerRender?: (config: CalendarHeaderRenderConfig) => JSX.Element
  onSelect?: (date: Date) => void
  onChange?: (date: Date) => void
  onPanelChange?: (date: Date, mode: CalendarMode) => void
  prefixCls?: string
}
```

Notes:

- `fullscreen` defaults to `true`.
- `mode` is controlled when the prop key is present; otherwise `defaultMode` initializes internal mode and defaults to `'month'`.
- `value` is controlled when the prop key is present; otherwise `defaultValue` initializes internal selection.
- `Date` and string values are parsed as local dates. ISO-like strings such as `2026-06-01T12:00:00` display as the local date portion.

## Behavior

### Value and Selection

- The selected date comes from controlled `value` when supplied, otherwise internal state initialized from `defaultValue`.
- If neither `value` nor `defaultValue` is provided, the selected date defaults to today.
- Clicking an enabled date or month cell calls `onSelect(date)`.
- If the selected date changes, the component updates internal state when uncontrolled and calls `onChange(date)`.
- Controlled `value={undefined}` is treated as controlled and does not fall back to `defaultValue`.

### Panel Date and Mode

- The visible panel date starts from the selected date, or today when no valid selected date exists.
- Month mode renders the visible month.
- Year mode renders all 12 months for the visible year.
- Default header controls allow moving to previous/next month, previous/next year, and switching between `month` and `year` modes.
- Changing the panel date or mode calls `onPanelChange(viewDate, mode)`.
- `headerRender` replaces the default header and receives callbacks for changing the panel date and mode.

### Month View

- Month view renders a 6-row by 7-column grid so layout height is stable.
- The grid includes leading and trailing dates from adjacent months.
- Cells expose accessible button labels in `YYYY-MM-DD` format.
- Cells visually distinguish selected date, today, disabled dates, and outside-month dates.
- `disabledDate` disables matching date cells and prevents selection.
- `dateFullCellRender(date)` fully replaces a date cell's inner content.
- `dateCellRender(date)` is rendered below the default date number when `dateFullCellRender` is not provided.

### Year View

- Year view renders 12 month cells for the visible year.
- Selecting a month uses a date on the first day of that month.
- Month cells expose accessible button labels in `YYYY-MM` format.
- `monthFullCellRender(date)` fully replaces a month cell's inner content.
- `monthCellRender(date)` is rendered below the default month label when `monthFullCellRender` is not provided.
- Disabled month selection is determined by applying `disabledDate` to the first day of each month.

## Styling Approach

Use `useCalendarStyle(prefixCls)` and register styles under `['Calendar', prefixCls]`.

Default class names use the configured prefix:

- `${prefixCls}` root, normally `ant-calendar`
- `${prefixCls}-fullscreen`
- `${prefixCls}-mini`
- `${prefixCls}-header`
- `${prefixCls}-body`
- `${prefixCls}-weekdays`
- `${prefixCls}-date-grid`
- `${prefixCls}-year-grid`
- `${prefixCls}-cell`
- `${prefixCls}-cell-selected`
- `${prefixCls}-cell-today`
- `${prefixCls}-cell-disabled`
- `${prefixCls}-cell-outside`

Styles should cover:

- Fullscreen calendar block with tokenized border, background, spacing, and typography.
- Mini/non-fullscreen calendar suitable for card-like usage.
- Header buttons and mode switch buttons.
- Date and month cells with hover, selected, today, disabled, and outside-month states.
- Custom cell content spacing so demos can show events or badges without breaking the grid.

## Documentation

Add `apps/docs/src/routes/components/calendar.tsx` with examples for:

1. Basic calendar.
2. Non-fullscreen card calendar.
3. Custom date content through `dateCellRender`.
4. Controlled `value` and `mode`.
5. Disabled dates.
6. Custom header render if concise enough for the docs page.

Add Calendar to `apps/docs/src/site/nav.ts` near `DatePicker` because both are date-entry/display components.

## Testing

Add `packages/components/src/calendar/__tests__/calendar.test.tsx` covering:

- Default month view renders weekday headers and date cells.
- Uncontrolled date selection calls `onSelect` and `onChange` and updates selected state.
- Controlled `value` updates through the parent and controlled `value={undefined}` remains controlled.
- Disabled dates expose disabled state and cannot be selected.
- Previous/next header controls and mode switching call `onPanelChange`.
- `dateCellRender`, `dateFullCellRender`, `monthCellRender`, and `monthFullCellRender` render expected custom content.
- `headerRender` can replace the default header and use callbacks to change date or mode.
- `fullscreen={false}` applies the mini class.
- `prefixCls` customizes root class names.

## Out Of Scope

- Locale/i18n APIs beyond English default labels.
- `validRange`.
- Keyboard roving focus and full grid keyboard navigation.
- Time selection.
- Date libraries or timezone configuration.
- Refactoring DatePicker to use a shared date panel in this change.

## Verification

After implementation, run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```
