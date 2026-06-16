# Component Expansion Phase 3 Design

Date: 2026-06-02

## Goal

Expand `@solid-ant-design/core` with the third requested batch of data-entry components:

1. `TimePicker`
2. `DatePicker`
3. `Upload`

This phase intentionally implements practical core subsets rather than full Ant Design parity. The goal is to provide usable, typed, documented, tested components that fit this repository's current architecture and can be expanded later.

## Existing Patterns To Follow

Each component should use the current component layout:

```text
packages/components/src/<component>/
  index.ts
  interface.ts
  <component>.tsx
  <component>.style.ts
```

Behavior-heavy components should include tests under:

```text
packages/components/src/<component>/__tests__/<component>.test.tsx
```

Each component should get a docs page:

```text
apps/docs/src/routes/components/<component>.tsx
```

Docs routes are auto-discovered by `apps/docs/src/site/routes.ts` through `import.meta.glob`, so this phase should not manually edit `routes.ts` unless the route system changes.

Shared exports and docs navigation should be updated in:

```text
packages/components/src/index.ts
apps/docs/src/site/nav.ts
```

All new TypeScript source filenames must be lowercase kebab-case.

## Component Designs

### TimePicker

`TimePicker` provides single time selection using a text input-like trigger and a popup with time columns.

Supported API:

- `value`: controlled selected time string
- `defaultValue`: uncontrolled initial selected time string
- `format`: `'HH:mm:ss' | 'HH:mm'`, default `'HH:mm:ss'`
- `placeholder`: input placeholder, default `'Select time'`
- `disabled`: disables trigger and popup interaction
- `allowClear`: shows clear button when a value exists
- `open`: controlled popup open state
- `defaultOpen`: uncontrolled initial popup open state
- `minuteStep`: minute increment, default `1`
- `secondStep`: second increment, default `1`
- `disabledHours`: callback returning disabled hour numbers
- `disabledMinutes`: callback receiving selected hour and returning disabled minute numbers
- `disabledSeconds`: callback receiving selected hour/minute and returning disabled second numbers
- `onChange`: callback `(value: string | undefined) => void`
- `onOpenChange`: callback `(open: boolean) => void`
- standard `div` HTML attributes where practical

Behavior:

- Trigger displays selected value or placeholder.
- Clicking trigger opens/closes the popup unless disabled.
- Popup contains hour, minute, and optionally second columns.
- `format="HH:mm"` hides the seconds column and emits `HH:mm` strings.
- Selecting a complete valid time updates value and calls `onChange`.
- Disabled time cells cannot be selected.
- Clear button sets value to `undefined` and calls `onChange(undefined)`.
- Escape closes the popup.
- Controlled `value` and `open` props are respected.
- Time strings are normalized and clamped to valid two-digit segments.

Out of scope:

- 12-hour mode
- Time zones
- Range picker
- Now/OK footer behavior
- Free-form parsing beyond supported formats

### DatePicker

`DatePicker` provides single date selection using a text input-like trigger and a calendar popup.

Supported API:

- `value`: controlled selected date as `Date` or date string
- `defaultValue`: uncontrolled initial selected date as `Date` or date string
- `format`: string format, default `'YYYY-MM-DD'`
- `placeholder`: input placeholder, default `'Select date'`
- `disabled`: disables trigger and popup interaction
- `allowClear`: shows clear button when a value exists
- `open`: controlled popup open state
- `defaultOpen`: uncontrolled initial popup open state
- `disabledDate`: callback `(date: Date) => boolean`
- `onChange`: callback `(value: Date | undefined, dateString: string) => void`
- `onOpenChange`: callback `(open: boolean) => void`
- standard `div` HTML attributes where practical

Behavior:

- Trigger displays formatted selected date or placeholder.
- Clicking trigger opens/closes the calendar unless disabled.
- Calendar shows one month at a time with previous/next month controls.
- Clicking an enabled date selects it, calls `onChange`, and closes the popup.
- Disabled dates cannot be selected.
- Clear button sets value to `undefined`, emits an empty string, and calls `onChange(undefined, '')`.
- Escape closes the popup.
- Controlled `value` and `open` props are respected.
- Date strings are parsed for the supported default format and basic ISO-like date strings.
- Date cells expose button semantics; selected date exposes `aria-pressed`.

Out of scope:

- RangePicker
- showTime
- Locale/i18n beyond English weekday labels
- Custom cell rendering
- Complex arbitrary format parsing
- Full calendar keyboard navigation

### Upload

`Upload` provides file selection, optional custom upload request handling, and a basic upload list.

Supported API:

- `fileList`: controlled file list
- `defaultFileList`: uncontrolled initial file list
- `accept`: file input accept attribute
- `multiple`: allow multiple selection
- `disabled`: disables trigger and remove actions
- `maxCount`: maximum number of files retained
- `showUploadList`: boolean, default `true`
- `beforeUpload`: callback `(file: File) => boolean | Promise<boolean>`
- `customRequest`: callback receiving request options
- `onChange`: callback `({ file, fileList }) => void`
- `onRemove`: callback `(file) => boolean | Promise<boolean>`
- `children`: trigger content
- standard `div` HTML attributes where practical

`UploadFile` supports:

- `uid`: stable identifier
- `name`: display name
- `status`: `'ready' | 'uploading' | 'done' | 'error' | 'removed'`
- `percent`: upload progress percent
- `originFileObj`: original `File`
- `url`: optional download/view URL
- `response`: upload response
- `error`: upload error

`UploadRequestOptions` supports:

- `file`: `File`
- `onProgress`: `(percent: number) => void`
- `onSuccess`: `(response?: unknown) => void`
- `onError`: `(error: unknown) => void`

Behavior:

- Renders a hidden file input and uses `children` as trigger content.
- Clicking trigger opens the native file picker unless disabled.
- Selecting files creates `UploadFile` entries.
- `beforeUpload` returning or resolving `false` adds the file with `ready` status and does not auto-upload.
- If `customRequest` is provided, files enter `uploading` status and request callbacks update progress/status.
- Without `customRequest`, files complete immediately with `done` status.
- `maxCount` keeps only the latest allowed number of files.
- Removing a file calls `onRemove`; returning/resolving `false` cancels removal.
- Controlled `fileList` is respected; uncontrolled state updates internally.
- `onChange` fires with the changed file and next file list.

Out of scope:

- Drag-and-drop upload
- Image preview
- Chunked upload
- Built-in XHR `action` transport
- Directory upload

## Styling Approach

Use the existing `@solid-ant-design/cssinjs` registration pattern and tokens from `useToken()`. Use stable class names through `config.prefixCls()`:

- `ant-time-picker`
- `ant-date-picker`
- `ant-upload`

CSS values that are unitless in CSS, such as line-height ratios, font-weight, opacity, flex, and z-index, should be strings when necessary to avoid the local serializer appending `px`. Numeric lengths should use explicit `px` strings.

## Documentation

Each new docs page should include:

- Basic usage
- Controlled example
- Disabled state
- Clearable behavior
- Main variants for that component
- Concise API notes matching existing docs style

Docs navigation should place:

- `TimePicker` and `DatePicker` near data-entry components
- `Upload` near data-entry components after pickers

## Testing and Verification

Add tests for behavior-heavy paths:

- `TimePicker`: controlled/uncontrolled changes, format differences, disabled cells, clear behavior, controlled open, Escape close.
- `DatePicker`: controlled/uncontrolled selection, month navigation, disabled date, clear behavior, controlled open, Escape close, formatting.
- `Upload`: uncontrolled selection, `beforeUpload=false`, async `beforeUpload`, `customRequest` success/error/progress, maxCount, controlled fileList, remove cancellation.

Final verification commands:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

## Out of Scope For Phase 3

- Full Ant Design API parity
- Date/time range pickers
- Locale packs and advanced calendar localization
- Arbitrary date format parsing
- Real network upload transport without `customRequest`
- Upload dragger and preview list variants
