# Component Expansion Phase 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Phase 3 components `TimePicker`, `DatePicker`, and `Upload` to `@ant-design-solid/core` with docs, exports, tests, reviews, and full verification.

**Architecture:** Each component follows the existing library pattern: component folder with `interface.ts`, `<component>.tsx`, `<component>.style.ts`, `index.ts`, plus behavior tests in `__tests__`. Pickers use local popup panels rather than portals to match the current `Select` simplicity. Upload uses a hidden native file input and a controlled/uncontrolled file list model.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, @ant-design-solid/cssinjs, @ant-design-solid/theme, pnpm/corepack.

---

## File Structure

Create component source files:

```text
packages/components/src/time-picker/index.ts
packages/components/src/time-picker/interface.ts
packages/components/src/time-picker/time-picker.tsx
packages/components/src/time-picker/time-picker.style.ts
packages/components/src/time-picker/__tests__/time-picker.test.tsx
packages/components/src/date-picker/index.ts
packages/components/src/date-picker/interface.ts
packages/components/src/date-picker/date-picker.tsx
packages/components/src/date-picker/date-picker.style.ts
packages/components/src/date-picker/__tests__/date-picker.test.tsx
packages/components/src/upload/index.ts
packages/components/src/upload/interface.ts
packages/components/src/upload/upload.tsx
packages/components/src/upload/upload.style.ts
packages/components/src/upload/__tests__/upload.test.tsx
```

Create docs pages:

```text
apps/docs/src/routes/components/time-picker.tsx
apps/docs/src/routes/components/date-picker.tsx
apps/docs/src/routes/components/upload.tsx
```

Modify shared registry files:

```text
packages/components/src/index.ts
apps/docs/src/site/nav.ts
```

Do not manually edit `apps/docs/src/site/routes.ts` unless route auto-discovery no longer works.

---

### Task 1: Add TimePicker

**Files:**

- Create: `packages/components/src/time-picker/interface.ts`
- Create: `packages/components/src/time-picker/time-picker.style.ts`
- Create: `packages/components/src/time-picker/time-picker.tsx`
- Create: `packages/components/src/time-picker/index.ts`
- Create: `packages/components/src/time-picker/__tests__/time-picker.test.tsx`
- Create: `apps/docs/src/routes/components/time-picker.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing TimePicker tests**

Create `packages/components/src/time-picker/__tests__/time-picker.test.tsx` with tests for:

```tsx
import { fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { TimePicker } from '../time-picker'

describe('TimePicker', () => {
  it('selects an uncontrolled time and calls onChange', () => {
    const onChange = vi.fn()
    render(() => <TimePicker defaultOpen onChange={onChange} />)

    fireEvent.click(screen.getByRole('option', { name: '09 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '05 minutes' }))
    fireEvent.click(screen.getByRole('option', { name: '07 seconds' }))

    expect(onChange).toHaveBeenLastCalledWith('09:05:07')
    expect(screen.getByRole('combobox')).toHaveTextContent('09:05:07')
  })

  it('supports HH:mm format without seconds', () => {
    const onChange = vi.fn()
    render(() => <TimePicker defaultOpen format="HH:mm" onChange={onChange} />)

    fireEvent.click(screen.getByRole('option', { name: '10 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '30 minutes' }))

    expect(onChange).toHaveBeenLastCalledWith('10:30')
    expect(screen.queryByText('seconds')).not.toBeInTheDocument()
  })

  it('supports controlled value', () => {
    function Demo() {
      const [value, setValue] = createSignal('01:02:03')
      return <TimePicker value={value()} defaultOpen onChange={(next) => next && setValue(next)} />
    }

    render(() => <Demo />)
    expect(screen.getByRole('combobox')).toHaveTextContent('01:02:03')
    fireEvent.click(screen.getByRole('option', { name: '04 hours' }))
    fireEvent.click(screen.getByRole('option', { name: '05 minutes' }))
    fireEvent.click(screen.getByRole('option', { name: '06 seconds' }))
    expect(screen.getByRole('combobox')).toHaveTextContent('04:05:06')
  })

  it('does not select disabled time cells', () => {
    const onChange = vi.fn()
    render(() => <TimePicker defaultOpen disabledHours={() => [9]} onChange={onChange} />)

    fireEvent.click(screen.getByRole('option', { name: '09 hours' }))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('clears value and closes with Escape', () => {
    const onChange = vi.fn()
    const onOpenChange = vi.fn()
    render(() => (
      <TimePicker
        defaultOpen
        defaultValue="12:00:00"
        allowClear
        onChange={onChange}
        onOpenChange={onOpenChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Clear time' }))
    expect(onChange).toHaveBeenLastCalledWith(undefined)

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })
})
```

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- time-picker
```

Expected: FAIL because TimePicker does not exist yet.

- [ ] **Step 2: Add TimePicker interfaces**

Create `packages/components/src/time-picker/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type TimePickerFormat = 'HH:mm:ss' | 'HH:mm'

export interface TimePickerProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: string
  defaultValue?: string
  format?: TimePickerFormat
  placeholder?: string
  disabled?: boolean
  allowClear?: boolean
  open?: boolean
  defaultOpen?: boolean
  minuteStep?: number
  secondStep?: number
  disabledHours?: () => number[]
  disabledMinutes?: (selectedHour: number | undefined) => number[]
  disabledSeconds?: (
    selectedHour: number | undefined,
    selectedMinute: number | undefined,
  ) => number[]
  onChange?: (value: string | undefined) => void
  onOpenChange?: (open: boolean) => void
}
```

- [ ] **Step 3: Add TimePicker implementation and styles**

Create `time-picker.tsx` implementing:

- parse/format helpers for `HH:mm:ss` and `HH:mm`
- controlled/uncontrolled value and open state
- trigger with role `combobox`
- popup columns with role `listbox` and cells role `option`
- hour/minute/second options with step filtering
- disabled callbacks
- selection state and commit when required segments are available
- clear button and Escape close

Create `time-picker.style.ts` with token-aware styles for root, selector, placeholder/value, clear button, dropdown, columns, cells, selected/disabled state.

Create `index.ts`:

```ts
export * from './time-picker'
export * from './interface'
```

- [ ] **Step 4: Add TimePicker docs and exports**

Create `apps/docs/src/routes/components/time-picker.tsx` with examples:

- Basic
- HH:mm format
- Controlled
- Disabled time
- Clearable
- Disabled

Modify `packages/components/src/index.ts`:

```ts
export * from './time-picker'
```

Modify `apps/docs/src/site/nav.ts`:

```ts
  { path: '/components/time-picker', label: 'TimePicker' },
```

- [ ] **Step 5: Verify and commit TimePicker**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- time-picker
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm exec oxfmt --check packages/components/src/time-picker apps/docs/src/routes/components/time-picker.tsx
```

Expected: all pass.

Commit:

```bash
git add packages/components/src/time-picker packages/components/src/index.ts apps/docs/src/routes/components/time-picker.tsx apps/docs/src/site/nav.ts
git commit -m "feat(components): add time picker"
```

---

### Task 2: Add DatePicker

**Files:**

- Create: `packages/components/src/date-picker/interface.ts`
- Create: `packages/components/src/date-picker/date-picker.style.ts`
- Create: `packages/components/src/date-picker/date-picker.tsx`
- Create: `packages/components/src/date-picker/index.ts`
- Create: `packages/components/src/date-picker/__tests__/date-picker.test.tsx`
- Create: `apps/docs/src/routes/components/date-picker.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing DatePicker tests**

Create `packages/components/src/date-picker/__tests__/date-picker.test.tsx` with tests for:

```tsx
import { fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { DatePicker } from '../date-picker'

describe('DatePicker', () => {
  it('selects an uncontrolled date and calls onChange', () => {
    const onChange = vi.fn()
    render(() => <DatePicker defaultOpen defaultValue="2026-06-01" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '2026-06-15' }))

    expect(onChange).toHaveBeenLastCalledWith(expect.any(Date), '2026-06-15')
    expect(screen.getByRole('combobox')).toHaveTextContent('2026-06-15')
  })

  it('supports controlled value', () => {
    function Demo() {
      const [value, setValue] = createSignal<Date | string | undefined>('2026-06-01')
      return <DatePicker value={value()} defaultOpen onChange={(next) => setValue(next)} />
    }

    render(() => <Demo />)
    fireEvent.click(screen.getByRole('button', { name: '2026-06-20' }))
    expect(screen.getByRole('combobox')).toHaveTextContent('2026-06-20')
  })

  it('navigates months', () => {
    render(() => <DatePicker defaultOpen defaultValue="2026-06-01" />)

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }))
    expect(screen.getByText('2026-07')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Previous month' }))
    expect(screen.getByText('2026-06')).toBeInTheDocument()
  })

  it('does not select disabled dates', () => {
    const onChange = vi.fn()
    render(() => (
      <DatePicker
        defaultOpen
        defaultValue="2026-06-01"
        disabledDate={(date) => date.getDate() === 10}
        onChange={onChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: '2026-06-10' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('clears value and closes with Escape', () => {
    const onChange = vi.fn()
    const onOpenChange = vi.fn()
    render(() => (
      <DatePicker
        defaultOpen
        defaultValue="2026-06-01"
        allowClear
        onChange={onChange}
        onOpenChange={onOpenChange}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Clear date' }))
    expect(onChange).toHaveBeenLastCalledWith(undefined, '')

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' })
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })
})
```

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- date-picker
```

Expected: FAIL because DatePicker does not exist yet.

- [ ] **Step 2: Add DatePicker interfaces**

Create `packages/components/src/date-picker/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type DatePickerValue = Date | string

export interface DatePickerProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: DatePickerValue
  defaultValue?: DatePickerValue
  format?: string
  placeholder?: string
  disabled?: boolean
  allowClear?: boolean
  open?: boolean
  defaultOpen?: boolean
  disabledDate?: (date: Date) => boolean
  onChange?: (value: Date | undefined, dateString: string) => void
  onOpenChange?: (open: boolean) => void
}
```

- [ ] **Step 3: Add DatePicker implementation and styles**

Create `date-picker.tsx` implementing:

- parse helper for `YYYY-MM-DD` and ISO-like date strings
- format helper for default `YYYY-MM-DD`
- controlled/uncontrolled selected value and open state
- view month state initialized from selected date or today
- calendar grid with leading/trailing days if useful, or current-month cells only with weekday headers
- prev/next month controls
- disabledDate guard
- clear button and Escape close
- role `combobox` trigger and button date cells with `aria-pressed`

Create `date-picker.style.ts` with token-aware styles for root, selector, dropdown, header, month controls, weekday row, date grid, date cell, selected/disabled/today state.

Create `index.ts`:

```ts
export * from './date-picker'
export * from './interface'
```

- [ ] **Step 4: Add DatePicker docs and exports**

Create `apps/docs/src/routes/components/date-picker.tsx` with examples:

- Basic
- Controlled
- Disabled date
- Clearable
- Disabled

Modify root export and nav:

```ts
export * from './date-picker'
```

```ts
  { path: '/components/date-picker', label: 'DatePicker' },
```

- [ ] **Step 5: Verify and commit DatePicker**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- date-picker
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm exec oxfmt --check packages/components/src/date-picker apps/docs/src/routes/components/date-picker.tsx
```

Expected: all pass.

Commit:

```bash
git add packages/components/src/date-picker packages/components/src/index.ts apps/docs/src/routes/components/date-picker.tsx apps/docs/src/site/nav.ts
git commit -m "feat(components): add date picker"
```

---

### Task 3: Add Upload

**Files:**

- Create: `packages/components/src/upload/interface.ts`
- Create: `packages/components/src/upload/upload.style.ts`
- Create: `packages/components/src/upload/upload.tsx`
- Create: `packages/components/src/upload/index.ts`
- Create: `packages/components/src/upload/__tests__/upload.test.tsx`
- Create: `apps/docs/src/routes/components/upload.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing Upload tests**

Create `packages/components/src/upload/__tests__/upload.test.tsx` with tests for:

```tsx
import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Upload } from '../upload'

function file(name: string, type = 'text/plain') {
  return new File(['content'], name, { type })
}

describe('Upload', () => {
  it('adds selected files and marks them done without customRequest', async () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Upload onChange={onChange}>
        <button>Upload</button>
      </Upload>
    ))
    const input = result.container.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file('a.txt')] } })

    await waitFor(() => expect(screen.getByText('a.txt')).toBeInTheDocument())
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ file: expect.objectContaining({ name: 'a.txt', status: 'done' }) }),
    )
  })

  it('respects beforeUpload false', async () => {
    const onChange = vi.fn()
    const beforeUpload = vi.fn(() => false)
    const result = render(() => (
      <Upload beforeUpload={beforeUpload} onChange={onChange}>
        <button>Upload</button>
      </Upload>
    ))
    const input = result.container.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file('b.txt')] } })

    await waitFor(() => expect(screen.getByText('b.txt')).toBeInTheDocument())
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        file: expect.objectContaining({ name: 'b.txt', status: 'ready' }),
      }),
    )
  })

  it('updates progress and success from customRequest', async () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Upload
        customRequest={({ onProgress, onSuccess }) => {
          onProgress(50)
          onSuccess({ ok: true })
        }}
        onChange={onChange}
      >
        <button>Upload</button>
      </Upload>
    ))
    const input = result.container.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file('c.txt')] } })

    await waitFor(() => expect(screen.getByText('done')).toBeInTheDocument())
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ file: expect.objectContaining({ status: 'done', percent: 100 }) }),
    )
  })

  it('supports maxCount and remove cancellation', async () => {
    const onRemove = vi.fn(() => false)
    const result = render(() => (
      <Upload maxCount={1} onRemove={onRemove}>
        <button>Upload</button>
      </Upload>
    ))
    const input = result.container.querySelector('input[type="file"]') as HTMLInputElement

    fireEvent.change(input, { target: { files: [file('a.txt'), file('b.txt')] } })

    await waitFor(() => expect(screen.queryByText('a.txt')).not.toBeInTheDocument())
    expect(screen.getByText('b.txt')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Remove b.txt' }))
    expect(onRemove).toHaveBeenCalled()
    expect(screen.getByText('b.txt')).toBeInTheDocument()
  })

  it('supports controlled fileList', () => {
    function Demo() {
      const [files, setFiles] = createSignal([
        { uid: '1', name: 'initial.txt', status: 'done' as const },
      ])
      return (
        <Upload fileList={files()} onChange={({ fileList }) => setFiles(fileList)}>
          <button>Upload</button>
        </Upload>
      )
    }

    render(() => <Demo />)
    expect(screen.getByText('initial.txt')).toBeInTheDocument()
  })
})
```

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- upload
```

Expected: FAIL because Upload does not exist yet.

- [ ] **Step 2: Add Upload interfaces**

Create `packages/components/src/upload/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type UploadFileStatus = 'ready' | 'uploading' | 'done' | 'error' | 'removed'

export interface UploadFile {
  uid: string
  name: string
  status?: UploadFileStatus
  percent?: number
  originFileObj?: File
  url?: string
  response?: unknown
  error?: unknown
}

export interface UploadRequestOptions {
  file: File
  onProgress: (percent: number) => void
  onSuccess: (response?: unknown) => void
  onError: (error: unknown) => void
}

export interface UploadChangeInfo {
  file: UploadFile
  fileList: UploadFile[]
}

export interface UploadProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'children'
> {
  fileList?: UploadFile[]
  defaultFileList?: UploadFile[]
  accept?: string
  multiple?: boolean
  disabled?: boolean
  maxCount?: number
  showUploadList?: boolean
  beforeUpload?: (file: File) => boolean | Promise<boolean>
  customRequest?: (options: UploadRequestOptions) => void
  onChange?: (info: UploadChangeInfo) => void
  onRemove?: (file: UploadFile) => boolean | Promise<boolean>
  children?: JSX.Element
}
```

- [ ] **Step 3: Add Upload implementation and styles**

Create `upload.tsx` implementing:

- hidden file input and trigger wrapper
- controlled/uncontrolled file list
- file-to-upload-file helper with generated uid
- async beforeUpload handling
- maxCount application
- customRequest callbacks for progress/success/error
- immediate done when no customRequest and beforeUpload allows upload
- remove handling with async cancellation support
- showUploadList toggle
- disabled guards

Create `upload.style.ts` with token-aware styles for root, trigger, hidden input, list, item, name, status, progress bar, remove button, disabled state.

Create `index.ts`:

```ts
export * from './upload'
export * from './interface'
```

- [ ] **Step 4: Add Upload docs and exports**

Create `apps/docs/src/routes/components/upload.tsx` with examples:

- Basic
- Multiple
- beforeUpload false
- Custom request
- Max count
- Disabled

Modify root export and nav:

```ts
export * from './upload'
```

```ts
  { path: '/components/upload', label: 'Upload' },
```

- [ ] **Step 5: Verify and commit Upload**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- upload
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm exec oxfmt --check packages/components/src/upload apps/docs/src/routes/components/upload.tsx
```

Expected: all pass.

Commit:

```bash
git add packages/components/src/upload packages/components/src/index.ts apps/docs/src/routes/components/upload.tsx apps/docs/src/site/nav.ts
git commit -m "feat(components): add upload"
```

---

### Task 4: Final verification and cleanup

**Files:**

- Modify only if verification reveals formatting, lint, type, test, or build issues.

- [ ] **Step 1: Run full lint**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: exits `0` without warnings for Phase 3 files.

- [ ] **Step 2: Run full format check**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: exits `0`.

- [ ] **Step 3: Run workspace typecheck**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: exits `0`.

- [ ] **Step 4: Run workspace tests**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: exits `0`.

- [ ] **Step 5: Run workspace build**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: exits `0`.

- [ ] **Step 6: Commit verification fixes if needed**

If fixes were required:

```bash
git add .
git commit -m "chore: verify component expansion phase 3"
```

If no fixes were required and the working tree is clean, skip this commit.

---

## Self-Review

- Spec coverage: `TimePicker`, `DatePicker`, and `Upload` each have implementation, tests, docs, exports, nav updates, and targeted verification tasks.
- Placeholder scan: No `TBD`, `TODO`, or deferred implementation instructions remain.
- Type consistency: Prop names match the Phase 3 design: `format`, `allowClear`, `open`, `defaultOpen`, `disabledDate`, `beforeUpload`, `customRequest`, `fileList`, `defaultFileList`, `showUploadList`, `maxCount`.
