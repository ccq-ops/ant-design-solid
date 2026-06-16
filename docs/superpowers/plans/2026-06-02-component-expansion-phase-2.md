# Component Expansion Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Phase 2 components `Pagination`, `Steps`, and `Slider` to `@solid-ant-design/core` with docs, exports, tests, reviews, and full verification.

**Architecture:** Each component follows the existing library pattern: component folder with `interface.ts`, `<component>.tsx`, `<component>.style.ts`, `index.ts`, plus behavior tests in `__tests__`. Components use `useConfig()`, `classNames()`, token-aware `useStyleRegister()`, and docs pages auto-discovered by the existing `import.meta.glob` route system.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, @solid-ant-design/cssinjs, @solid-ant-design/theme, pnpm/corepack.

---

## File Structure

Create component source files:

```text
packages/components/src/pagination/index.ts
packages/components/src/pagination/interface.ts
packages/components/src/pagination/pagination.tsx
packages/components/src/pagination/pagination.style.ts
packages/components/src/pagination/__tests__/pagination.test.tsx
packages/components/src/steps/index.ts
packages/components/src/steps/interface.ts
packages/components/src/steps/steps.tsx
packages/components/src/steps/steps.style.ts
packages/components/src/steps/__tests__/steps.test.tsx
packages/components/src/slider/index.ts
packages/components/src/slider/interface.ts
packages/components/src/slider/slider.tsx
packages/components/src/slider/slider.style.ts
packages/components/src/slider/__tests__/slider.test.tsx
```

Create docs pages:

```text
apps/docs/src/routes/components/pagination.tsx
apps/docs/src/routes/components/steps.tsx
apps/docs/src/routes/components/slider.tsx
```

Modify shared registry files:

```text
packages/components/src/index.ts
apps/docs/src/site/nav.ts
```

Do not manually edit `apps/docs/src/site/routes.ts` unless route auto-discovery no longer works.

---

### Task 1: Add Pagination

**Files:**

- Create: `packages/components/src/pagination/interface.ts`
- Create: `packages/components/src/pagination/pagination.style.ts`
- Create: `packages/components/src/pagination/pagination.tsx`
- Create: `packages/components/src/pagination/index.ts`
- Create: `packages/components/src/pagination/__tests__/pagination.test.tsx`
- Create: `apps/docs/src/routes/components/pagination.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing Pagination tests**

Create `packages/components/src/pagination/__tests__/pagination.test.tsx` with tests for:

```tsx
import { fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Pagination } from '../pagination'

describe('Pagination', () => {
  it('changes uncontrolled page and calls onChange', () => {
    const onChange = vi.fn()
    render(() => <Pagination total={100} defaultCurrent={1} pageSize={10} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }))

    expect(onChange).toHaveBeenLastCalledWith(2, 10)
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
  })

  it('disables prev and next at boundaries', () => {
    render(() => <Pagination total={20} defaultCurrent={1} pageSize={10} />)

    expect(screen.getByRole('button', { name: 'Previous Page' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }))
    expect(screen.getByRole('button', { name: 'Next Page' })).toBeDisabled()
  })

  it('supports controlled current', () => {
    function Demo() {
      const [current, setCurrent] = createSignal(1)
      return <Pagination total={30} current={current()} onChange={setCurrent} />
    }

    render(() => <Demo />)
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }))

    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
  })

  it('supports simple mode input commit', () => {
    const onChange = vi.fn()
    render(() => (
      <Pagination simple total={50} defaultCurrent={1} pageSize={10} onChange={onChange} />
    ))

    const input = screen.getByLabelText('Page')
    fireEvent.input(input, { target: { value: '4' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(onChange).toHaveBeenLastCalledWith(4, 10)
  })

  it('supports page size changes', () => {
    const onChange = vi.fn()
    const onShowSizeChange = vi.fn()
    render(() => (
      <Pagination
        total={100}
        defaultCurrent={3}
        defaultPageSize={10}
        showSizeChanger
        pageSizeOptions={[10, 20]}
        onChange={onChange}
        onShowSizeChange={onShowSizeChange}
      />
    ))

    fireEvent.change(screen.getByLabelText('Page Size'), { target: { value: '20' } })

    expect(onShowSizeChange).toHaveBeenLastCalledWith(3, 20)
    expect(onChange).toHaveBeenLastCalledWith(3, 20)
  })

  it('supports quick jumper and hideOnSinglePage', () => {
    const onChange = vi.fn()
    const { container } = render(() => (
      <>
        <Pagination total={100} showQuickJumper onChange={onChange} />
        <Pagination total={5} hideOnSinglePage />
      </>
    ))

    const jumpInput = screen.getByLabelText('Quick jump to page')
    fireEvent.input(jumpInput, { target: { value: '5' } })
    fireEvent.keyDown(jumpInput, { key: 'Enter' })

    expect(onChange).toHaveBeenLastCalledWith(5, 10)
    expect(container.querySelectorAll('.ads-pagination').length).toBe(1)
  })
})
```

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- pagination
```

Expected: FAIL because Pagination does not exist yet.

- [ ] **Step 2: Add Pagination interfaces**

Create `packages/components/src/pagination/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type PaginationPageSizeOption = string | number

export interface PaginationProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'onChange'> {
  current?: number
  defaultCurrent?: number
  pageSize?: number
  defaultPageSize?: number
  total?: number
  disabled?: boolean
  simple?: boolean
  showSizeChanger?: boolean
  pageSizeOptions?: PaginationPageSizeOption[]
  showQuickJumper?: boolean
  hideOnSinglePage?: boolean
  showTotal?: (total: number, range: [number, number]) => JSX.Element
  onChange?: (page: number, pageSize: number) => void
  onShowSizeChange?: (current: number, size: number) => void
}
```

- [ ] **Step 3: Add Pagination implementation and styles**

Create `pagination.tsx` implementing:

- controlled/uncontrolled `current` and `pageSize`
- page count/range clamping helpers
- full mode with prev, next, page buttons, and ellipsis
- simple mode with input
- page size `select`
- quick jumper input
- `showTotal`
- disabled/hide-on-single-page behavior

Create `pagination.style.ts` using token-aware styles for root nav, list, item buttons, active state, disabled state, ellipsis, simple input, select, quick jumper, and total text.

Create `index.ts`:

```ts
export * from './pagination'
export * from './interface'
```

- [ ] **Step 4: Add Pagination docs and exports**

Create `apps/docs/src/routes/components/pagination.tsx` with examples:

- Basic
- More pages / ellipsis
- Simple
- Size changer and quick jumper
- Controlled
- Disabled

Modify `packages/components/src/index.ts`:

```ts
export * from './pagination'
```

Modify `apps/docs/src/site/nav.ts` with:

```ts
  { path: '/components/pagination', label: 'Pagination' },
```

- [ ] **Step 5: Verify and commit Pagination**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- pagination
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm exec oxfmt --check packages/components/src/pagination apps/docs/src/routes/components/pagination.tsx
```

Expected: all pass.

Commit:

```bash
git add packages/components/src/pagination packages/components/src/index.ts apps/docs/src/routes/components/pagination.tsx apps/docs/src/site/nav.ts
git commit -m "feat(components): add pagination"
```

---

### Task 2: Add Steps

**Files:**

- Create: `packages/components/src/steps/interface.ts`
- Create: `packages/components/src/steps/steps.style.ts`
- Create: `packages/components/src/steps/steps.tsx`
- Create: `packages/components/src/steps/index.ts`
- Create: `packages/components/src/steps/__tests__/steps.test.tsx`
- Create: `apps/docs/src/routes/components/steps.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing Steps tests**

Create `packages/components/src/steps/__tests__/steps.test.tsx` with tests for:

```tsx
import { fireEvent, render, screen } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Steps } from '../steps'

const items = [
  { title: 'First', description: 'Start' },
  { title: 'Second', description: 'Middle' },
  { title: 'Third', description: 'End' },
]

describe('Steps', () => {
  it('derives finish, process, and wait statuses', () => {
    render(() => <Steps current={1} items={items} />)

    expect(screen.getByText('First').closest('li')?.className).toContain('ads-steps-item-finish')
    expect(screen.getByText('Second').closest('li')?.className).toContain('ads-steps-item-process')
    expect(screen.getByText('Third').closest('li')?.className).toContain('ads-steps-item-wait')
    expect(screen.getByText('Second').closest('li')).toHaveAttribute('aria-current', 'step')
  })

  it('supports item status override', () => {
    render(() => <Steps current={1} items={[items[0], { ...items[1], status: 'error' }]} />)

    expect(screen.getByText('Second').closest('li')?.className).toContain('ads-steps-item-error')
  })

  it('calls onChange for navigation steps and ignores disabled items', () => {
    const onChange = vi.fn()
    render(() => (
      <Steps
        type="navigation"
        current={0}
        onChange={onChange}
        items={[items[0], items[1], { ...items[2], disabled: true }]}
      />
    ))

    fireEvent.click(screen.getByRole('button', { name: 'Second' }))
    fireEvent.click(screen.getByRole('button', { name: 'Third' }))

    expect(onChange).toHaveBeenCalledWith(1)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('supports vertical and small classes', () => {
    const { container } = render(() => <Steps direction="vertical" size="small" items={items} />)
    const root = container.querySelector('.ads-steps')

    expect(root?.className).toContain('ads-steps-vertical')
    expect(root?.className).toContain('ads-steps-small')
  })
})
```

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- steps
```

Expected: FAIL because Steps does not exist yet.

- [ ] **Step 2: Add Steps interfaces**

Create `packages/components/src/steps/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type StepStatus = 'wait' | 'process' | 'finish' | 'error'
export type StepsDirection = 'horizontal' | 'vertical'
export type StepsSize = 'default' | 'small'
export type StepsType = 'default' | 'navigation'

export interface StepItem {
  title: JSX.Element
  description?: JSX.Element
  status?: StepStatus
  icon?: JSX.Element
  disabled?: boolean
}

export interface StepsProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: StepItem[]
  current?: number
  status?: StepStatus
  direction?: StepsDirection
  size?: StepsSize
  type?: StepsType
  onChange?: (current: number) => void
}
```

- [ ] **Step 3: Add Steps implementation and styles**

Create `steps.tsx` implementing:

- derived status helper
- ordered-list semantics
- aria-current step
- navigation buttons for non-disabled items
- disabled behavior
- icon fallback to step number/check/error mark
- horizontal/vertical/small/navigation classes

Create `steps.style.ts` with token-aware styles for root, item, tail, icon, content, title, description, statuses, vertical, small, navigation, disabled.

Create `index.ts`:

```ts
export * from './steps'
export * from './interface'
```

- [ ] **Step 4: Add Steps docs and exports**

Create `apps/docs/src/routes/components/steps.tsx` with examples:

- Basic
- Small
- Vertical
- Error status
- Navigation clickable
- Custom icon

Modify root export and nav:

```ts
export * from './steps'
```

```ts
  { path: '/components/steps', label: 'Steps' },
```

- [ ] **Step 5: Verify and commit Steps**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- steps
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm exec oxfmt --check packages/components/src/steps apps/docs/src/routes/components/steps.tsx
```

Expected: all pass.

Commit:

```bash
git add packages/components/src/steps packages/components/src/index.ts apps/docs/src/routes/components/steps.tsx apps/docs/src/site/nav.ts
git commit -m "feat(components): add steps"
```

---

### Task 3: Add Slider

**Files:**

- Create: `packages/components/src/slider/interface.ts`
- Create: `packages/components/src/slider/slider.style.ts`
- Create: `packages/components/src/slider/slider.tsx`
- Create: `packages/components/src/slider/index.ts`
- Create: `packages/components/src/slider/__tests__/slider.test.tsx`
- Create: `apps/docs/src/routes/components/slider.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing Slider tests**

Create `packages/components/src/slider/__tests__/slider.test.tsx` with tests for:

```tsx
import { fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Slider } from '../slider'

function mockRect(element: Element, rect: Partial<DOMRect>) {
  element.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
      ...rect,
    }) as DOMRect
}

describe('Slider', () => {
  it('changes value from rail click and calls onAfterChange', () => {
    const onChange = vi.fn()
    const onAfterChange = vi.fn()
    const { container } = render(() => <Slider onChange={onChange} onAfterChange={onAfterChange} />)
    const rail = container.querySelector('.ads-slider-rail') as HTMLElement
    mockRect(rail, { left: 0, width: 100 })

    fireEvent.pointerDown(rail, { clientX: 50 })

    expect(onChange).toHaveBeenLastCalledWith(50)
    expect(onAfterChange).toHaveBeenLastCalledWith(50)
  })

  it('supports controlled value', () => {
    function Demo() {
      const [value, setValue] = createSignal(20)
      return <Slider value={value()} onChange={setValue} />
    }

    render(() => <Demo />)
    const handle = screen.getByRole('slider')
    fireEvent.keyDown(handle, { key: 'ArrowRight' })

    expect(handle).toHaveAttribute('aria-valuenow', '21')
  })

  it('does not change when disabled', () => {
    const onChange = vi.fn()
    render(() => <Slider disabled defaultValue={20} onChange={onChange} />)

    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '20')
  })

  it('supports range mode and nearest handle updates', () => {
    const onChange = vi.fn()
    const { container } = render(() => <Slider range defaultValue={[20, 80]} onChange={onChange} />)
    const rail = container.querySelector('.ads-slider-rail') as HTMLElement
    mockRect(rail, { left: 0, width: 100 })

    fireEvent.pointerDown(rail, { clientX: 30 })

    expect(onChange).toHaveBeenLastCalledWith([30, 80])
  })

  it('supports keyboard Home End and marks', () => {
    render(() => <Slider defaultValue={50} marks={{ 0: '0', 50: 'Mid', 100: '100' }} />)
    const handle = screen.getByRole('slider')

    expect(screen.getByText('Mid')).toBeInTheDocument()
    fireEvent.keyDown(handle, { key: 'Home' })
    expect(handle).toHaveAttribute('aria-valuenow', '0')
    fireEvent.keyDown(handle, { key: 'End' })
    expect(handle).toHaveAttribute('aria-valuenow', '100')
  })
})
```

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- slider
```

Expected: FAIL because Slider does not exist yet.

- [ ] **Step 2: Add Slider interfaces**

Create `packages/components/src/slider/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type SliderValue = number | [number, number]

export interface SliderMarkObject {
  label: JSX.Element
  style?: JSX.CSSProperties
}

export type SliderMark = JSX.Element | SliderMarkObject

export interface SliderProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  value?: SliderValue
  defaultValue?: SliderValue
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  range?: boolean
  marks?: Record<number, SliderMark>
  vertical?: boolean
  tooltipVisible?: boolean
  onChange?: (value: SliderValue) => void
  onAfterChange?: (value: SliderValue) => void
}
```

- [ ] **Step 3: Add Slider implementation and styles**

Create `slider.tsx` implementing:

- numeric helpers: clamp, snap-to-step, value-to-percent, percent-to-value
- controlled/uncontrolled single and range values
- rail click behavior
- pointer drag on handles with pointer capture when available
- nearest handle selection in range mode
- keyboard Arrow, PageUp/PageDown, Home, End
- marks rendering
- optional tooltip display
- disabled behavior
- ARIA slider attributes

Create `slider.style.ts` with token-aware styles for root, rail, track, handle, mark, dot, tooltip, vertical layout, disabled state.

Create `index.ts`:

```ts
export * from './slider'
export * from './interface'
```

- [ ] **Step 4: Add Slider docs and exports**

Create `apps/docs/src/routes/components/slider.tsx` with examples:

- Basic
- Controlled
- Range
- Marks
- Vertical
- Disabled

Modify root export and nav:

```ts
export * from './slider'
```

```ts
  { path: '/components/slider', label: 'Slider' },
```

- [ ] **Step 5: Verify and commit Slider**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- slider
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm exec oxfmt --check packages/components/src/slider apps/docs/src/routes/components/slider.tsx
```

Expected: all pass.

Commit:

```bash
git add packages/components/src/slider packages/components/src/index.ts apps/docs/src/routes/components/slider.tsx apps/docs/src/site/nav.ts
git commit -m "feat(components): add slider"
```

---

### Task 4: Final verification and cleanup

**Files:**

- Modify only if verification reveals formatting, lint, type, test, or build issues.

- [ ] **Step 1: Run full lint**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: exits `0`.

- [ ] **Step 2: Run full format check**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: exits `0`. If it fails on files changed in Phase 2, run targeted `oxfmt --write` on those files, inspect the diff, and commit the formatting changes.

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
git commit -m "chore: verify component expansion phase 2"
```

If no fixes were required and the working tree is clean, skip this commit.

---

## Self-Review

- Spec coverage: `Pagination`, `Steps`, and `Slider` each have implementation, tests, docs, exports, nav updates, and targeted verification tasks.
- Placeholder scan: No `TBD`, `TODO`, or deferred implementation instructions remain.
- Type consistency: Prop names match the Phase 2 design: `current`, `defaultCurrent`, `pageSize`, `defaultPageSize`, `showSizeChanger`, `showQuickJumper`, `items`, `status`, `direction`, `range`, `marks`, `tooltipVisible`, `onAfterChange`.
