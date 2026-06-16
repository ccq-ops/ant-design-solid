# Component Expansion Phase 4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Phase 4 feedback/loading components `Spin`, `Progress`, `Skeleton`, and `Drawer` to `@solid-ant-design/core` with docs, exports, tests, reviews, and full verification.

**Architecture:** Each component follows the existing library pattern: component folder with `interface.ts`, `<component>.tsx`, `<component>.style.ts`, `index.ts`, plus behavior tests in `__tests__`. Drawer reuses `InternalPortal`, document keydown helpers, and body scroll lock helpers from existing modal infrastructure. Display components use token-aware CSS-in-JS and keep behavior local.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, @solid-ant-design/cssinjs, @solid-ant-design/theme, pnpm/corepack.

---

## File Structure

Create component source files:

```text
packages/components/src/spin/index.ts
packages/components/src/spin/interface.ts
packages/components/src/spin/spin.tsx
packages/components/src/spin/spin.style.ts
packages/components/src/spin/__tests__/spin.test.tsx
packages/components/src/progress/index.ts
packages/components/src/progress/interface.ts
packages/components/src/progress/progress.tsx
packages/components/src/progress/progress.style.ts
packages/components/src/progress/__tests__/progress.test.tsx
packages/components/src/skeleton/index.ts
packages/components/src/skeleton/interface.ts
packages/components/src/skeleton/skeleton.tsx
packages/components/src/skeleton/skeleton.style.ts
packages/components/src/skeleton/__tests__/skeleton.test.tsx
packages/components/src/drawer/index.ts
packages/components/src/drawer/interface.ts
packages/components/src/drawer/drawer.tsx
packages/components/src/drawer/drawer.style.ts
packages/components/src/drawer/__tests__/drawer.test.tsx
```

Create docs pages:

```text
apps/docs/src/routes/components/spin.tsx
apps/docs/src/routes/components/progress.tsx
apps/docs/src/routes/components/skeleton.tsx
apps/docs/src/routes/components/drawer.tsx
```

Modify shared registry files:

```text
packages/components/src/index.ts
apps/docs/src/site/nav.ts
```

Do not manually edit `apps/docs/src/site/routes.ts` unless route auto-discovery no longer works.

---

### Task 1: Add Spin

**Files:**

- Create: `packages/components/src/spin/interface.ts`
- Create: `packages/components/src/spin/spin.style.ts`
- Create: `packages/components/src/spin/spin.tsx`
- Create: `packages/components/src/spin/index.ts`
- Create: `packages/components/src/spin/__tests__/spin.test.tsx`
- Create: `apps/docs/src/routes/components/spin.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing Spin tests**

Create tests covering standalone, nested content, delay, fullscreen, custom indicator:

```tsx
import { render, screen } from '@solidjs/testing-library'
import { vi, describe, expect, it } from 'vitest'
import { Spin } from '../spin'

describe('Spin', () => {
  it('renders standalone spinner by default', () => {
    render(() => <Spin />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('wraps content and marks it busy while spinning', () => {
    render(() => (
      <Spin spinning>
        <div>Content</div>
      </Spin>
    ))
    expect(screen.getByText('Content').parentElement).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('respects delay before showing spinner', async () => {
    vi.useFakeTimers()
    render(() => (
      <Spin spinning delay={100}>
        <div>Content</div>
      </Spin>
    ))
    expect(screen.queryByRole('status')).toBeNull()
    await vi.advanceTimersByTimeAsync(100)
    expect(screen.getByRole('status')).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('supports fullscreen and custom indicator', () => {
    const { container } = render(() => <Spin fullscreen indicator={<span>Loading custom</span>} />)
    expect(container.querySelector('.ads-spin-fullscreen')).toBeInTheDocument()
    expect(screen.getByText('Loading custom')).toBeInTheDocument()
  })
})
```

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- spin
```

Expected: FAIL because Spin does not exist yet.

- [ ] **Step 2: Add Spin implementation**

Create `interface.ts`, `spin.tsx`, `spin.style.ts`, and `index.ts` implementing the approved API. Use delay with `createEffect`, `setTimeout`, and `onCleanup`. Use prefix `${config.prefixCls()}-spin`.

- [ ] **Step 3: Add Spin docs and exports**

Create docs examples: Basic, Size, Tip, Nested, Delay, Fullscreen, Custom indicator. Export from root and add nav:

```ts
export * from './spin'
```

```ts
  { path: '/components/spin', label: 'Spin' },
```

- [ ] **Step 4: Verify and commit Spin**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- spin
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm exec oxfmt --check packages/components/src/spin apps/docs/src/routes/components/spin.tsx
```

Commit:

```bash
git add packages/components/src/spin packages/components/src/index.ts apps/docs/src/routes/components/spin.tsx apps/docs/src/site/nav.ts
git commit -m "feat(components): add spin"
```

---

### Task 2: Add Progress

**Files:**

- Create: `packages/components/src/progress/interface.ts`
- Create: `packages/components/src/progress/progress.style.ts`
- Create: `packages/components/src/progress/progress.tsx`
- Create: `packages/components/src/progress/index.ts`
- Create: `packages/components/src/progress/__tests__/progress.test.tsx`
- Create: `apps/docs/src/routes/components/progress.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing Progress tests**

Create tests covering clamp, default success, line width, circle SVG, format, ARIA:

```tsx
import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Progress } from '../progress'

describe('Progress', () => {
  it('clamps percent and exposes progressbar aria', () => {
    render(() => <Progress percent={150} />)
    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveAttribute('aria-valuenow', '100')
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('defaults to success when percent is 100', () => {
    const { container } = render(() => <Progress percent={100} />)
    expect(container.querySelector('.ads-progress-status-success')).toBeInTheDocument()
  })

  it('renders line width based on percent', () => {
    const { container } = render(() => <Progress percent={30} />)
    const bar = container.querySelector('.ads-progress-bg') as HTMLElement
    expect(bar.style.width).toBe('30%')
  })

  it('renders circle progress', () => {
    const { container } = render(() => <Progress type="circle" percent={25} />)
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('supports custom format and hidden info', () => {
    const { rerender } = render(() => (
      <Progress percent={40} format={(percent) => `${percent} done`} />
    ))
    expect(screen.getByText('40 done')).toBeInTheDocument()
    rerender(() => <Progress percent={40} showInfo={false} />)
    expect(screen.queryByText('40%')).toBeNull()
  })
})
```

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- progress
```

Expected: FAIL because Progress does not exist yet.

- [ ] **Step 2: Add Progress implementation**

Create interfaces and implementation for line/circle modes, clamped percent, derived status, SVG circle, custom format, and ARIA. Use prefix `${config.prefixCls()}-progress`.

- [ ] **Step 3: Add Progress docs and exports**

Create docs examples: Basic line, Circle, Status, Custom format, Stroke color, Hidden info. Export and nav:

```ts
export * from './progress'
```

```ts
  { path: '/components/progress', label: 'Progress' },
```

- [ ] **Step 4: Verify and commit Progress**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- progress
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm exec oxfmt --check packages/components/src/progress apps/docs/src/routes/components/progress.tsx
```

Commit:

```bash
git add packages/components/src/progress packages/components/src/index.ts apps/docs/src/routes/components/progress.tsx apps/docs/src/site/nav.ts
git commit -m "feat(components): add progress"
```

---

### Task 3: Add Skeleton

**Files:**

- Create: `packages/components/src/skeleton/interface.ts`
- Create: `packages/components/src/skeleton/skeleton.style.ts`
- Create: `packages/components/src/skeleton/skeleton.tsx`
- Create: `packages/components/src/skeleton/index.ts`
- Create: `packages/components/src/skeleton/__tests__/skeleton.test.tsx`
- Create: `apps/docs/src/routes/components/skeleton.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing Skeleton tests**

Create tests covering loading false, default skeleton, avatar/title/paragraph configs, active/round:

```tsx
import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Skeleton } from '../skeleton'

describe('Skeleton', () => {
  it('renders children when loading is false', () => {
    render(() => (
      <Skeleton loading={false}>
        <div>Loaded</div>
      </Skeleton>
    ))
    expect(screen.getByText('Loaded')).toBeInTheDocument()
  })

  it('renders default title and paragraph when loading', () => {
    const { container } = render(() => <Skeleton />)
    expect(container.querySelector('.ads-skeleton-title')).toBeInTheDocument()
    expect(container.querySelectorAll('.ads-skeleton-paragraph li')).toHaveLength(3)
  })

  it('supports avatar, title width, and paragraph rows', () => {
    const { container } = render(() => (
      <Skeleton
        avatar={{ size: 40, shape: 'square' }}
        title={{ width: '50%' }}
        paragraph={{ rows: 2 }}
      />
    ))
    expect(container.querySelector('.ads-skeleton-avatar')).toHaveStyle('width: 40px')
    expect(container.querySelector('.ads-skeleton-title')).toHaveStyle('width: 50%')
    expect(container.querySelectorAll('.ads-skeleton-paragraph li')).toHaveLength(2)
  })

  it('supports active and round classes', () => {
    const { container } = render(() => <Skeleton active round />)
    const root = container.querySelector('.ads-skeleton')
    expect(root?.className).toContain('ads-skeleton-active')
    expect(root?.className).toContain('ads-skeleton-round')
  })
})
```

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- skeleton
```

Expected: FAIL because Skeleton does not exist yet.

- [ ] **Step 2: Add Skeleton implementation**

Create interfaces and implementation for loading toggle, default skeleton, avatar/title/paragraph config, active/round classes. Use prefix `${config.prefixCls()}-skeleton`.

- [ ] **Step 3: Add Skeleton docs and exports**

Create docs examples: Basic, Active, Avatar, Custom rows, Loaded content, Round. Export and nav:

```ts
export * from './skeleton'
```

```ts
  { path: '/components/skeleton', label: 'Skeleton' },
```

- [ ] **Step 4: Verify and commit Skeleton**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- skeleton
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm exec oxfmt --check packages/components/src/skeleton apps/docs/src/routes/components/skeleton.tsx
```

Commit:

```bash
git add packages/components/src/skeleton packages/components/src/index.ts apps/docs/src/routes/components/skeleton.tsx apps/docs/src/site/nav.ts
git commit -m "feat(components): add skeleton"
```

---

### Task 4: Add Drawer

**Files:**

- Create: `packages/components/src/drawer/interface.ts`
- Create: `packages/components/src/drawer/drawer.style.ts`
- Create: `packages/components/src/drawer/drawer.tsx`
- Create: `packages/components/src/drawer/index.ts`
- Create: `packages/components/src/drawer/__tests__/drawer.test.tsx`
- Create: `apps/docs/src/routes/components/drawer.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing Drawer tests**

Create tests covering render, close/mask/Escape, destroyOnClose, placement sizing, afterOpenChange:

```tsx
import { fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Drawer } from '../drawer'

describe('Drawer', () => {
  it('renders open drawer with title and body', () => {
    render(() => (
      <Drawer open title="Title">
        Body
      </Drawer>
    ))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  it('calls onClose from close button, mask, and Escape', () => {
    const onClose = vi.fn()
    const { container } = render(() => (
      <Drawer open title="Title" onClose={onClose}>
        Body
      </Drawer>
    ))
    fireEvent.click(screen.getByRole('button', { name: 'close drawer' }))
    fireEvent.click(container.querySelector('.ads-drawer-mask')!)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('respects maskClosable and keyboard false', () => {
    const onClose = vi.fn()
    const { container } = render(() => (
      <Drawer open maskClosable={false} keyboard={false} onClose={onClose}>
        Body
      </Drawer>
    ))
    fireEvent.click(container.querySelector('.ads-drawer-mask')!)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('supports placement sizing and destroyOnClose', () => {
    function Demo() {
      const [open, setOpen] = createSignal(true)
      return (
        <>
          <button onClick={() => setOpen(false)}>Close</button>
          <Drawer open={open()} placement="bottom" height={240} destroyOnClose>
            Body
          </Drawer>
        </>
      )
    }
    render(() => <Demo />)
    expect(screen.getByRole('dialog')).toHaveStyle('height: 240px')
    fireEvent.click(screen.getByText('Close'))
    expect(screen.queryByText('Body')).toBeNull()
  })

  it('calls afterOpenChange when open changes', () => {
    const afterOpenChange = vi.fn()
    function Demo() {
      const [open, setOpen] = createSignal(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>Open</button>
          <Drawer open={open()} afterOpenChange={afterOpenChange}>
            Body
          </Drawer>
        </>
      )
    }
    render(() => <Demo />)
    fireEvent.click(screen.getByText('Open'))
    expect(afterOpenChange).toHaveBeenLastCalledWith(true)
  })
})
```

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- drawer
```

Expected: FAIL because Drawer does not exist yet.

- [ ] **Step 2: Add Drawer implementation**

Create interfaces and implementation using `InternalPortal`, `addDocumentKeydown`, `lockBodyScroll`, `unlockBodyScroll`, `createRenderEffect`, `onCleanup`, title IDs, mask, close button, placement classes, width/height style, destroyOnClose. Use prefix `${config.prefixCls()}-drawer`.

- [ ] **Step 3: Add Drawer docs and exports**

Create docs examples: Basic, Placement, Extra/Footer, No mask close, Destroy on close. Export and nav:

```ts
export * from './drawer'
```

```ts
  { path: '/components/drawer', label: 'Drawer' },
```

- [ ] **Step 4: Verify and commit Drawer**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- drawer
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm exec oxfmt --check packages/components/src/drawer apps/docs/src/routes/components/drawer.tsx
```

Commit:

```bash
git add packages/components/src/drawer packages/components/src/index.ts apps/docs/src/routes/components/drawer.tsx apps/docs/src/site/nav.ts
git commit -m "feat(components): add drawer"
```

---

### Task 5: Final verification and cleanup

**Files:**

- Modify only if verification reveals formatting, lint, type, test, or build issues.

- [ ] **Step 1: Run full lint**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: exits `0` without warnings for Phase 4 files.

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
git commit -m "chore: verify component expansion phase 4"
```

If no fixes were required and the working tree is clean, skip this commit.

---

## Self-Review

- Spec coverage: `Spin`, `Progress`, `Skeleton`, and `Drawer` each have implementation, tests, docs, exports, nav updates, and targeted verification tasks.
- Placeholder scan: No `TBD`, `TODO`, or deferred implementation instructions remain.
- Type consistency: Prop names match the Phase 4 design: `spinning`, `delay`, `fullscreen`, `percent`, `showInfo`, `avatar`, `paragraph`, `placement`, `destroyOnClose`, `afterOpenChange`.
