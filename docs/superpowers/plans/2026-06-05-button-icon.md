# Button Icon Ant Design Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Ant Design-aligned `icon` and `iconPosition` support to the Solid Button component using `@solid-ant-design/icons`.

**Architecture:** Button will derive one rendered icon from `loading` or `icon`, with loading taking precedence, and place it before or after children based on `iconPosition`. Button styles will add directional icon spacing while preserving the existing `.ads-btn-icon` wrapper.

**Tech Stack:** SolidJS, TypeScript, `@solidjs/testing-library`, Vitest, `@solid-ant-design/icons`, cssinjs style objects.

---

## File Structure

- Modify `packages/components/src/button/__tests__/button.test.tsx`: add behavior tests for icon, end icon position, and loading precedence.
- Modify `packages/components/src/button/interface.ts`: add `icon` and `iconPosition` props.
- Modify `packages/components/src/button/button.tsx`: split the new props, derive icon content, render directional icon wrappers.
- Modify `packages/components/src/button/button.style.ts`: add start/end spacing selectors for `.ads-btn-icon`.

### Task 1: Add failing Button icon behavior tests

**Files:**

- Modify: `packages/components/src/button/__tests__/button.test.tsx`

- [ ] **Step 1: Import SearchOutlined**

Add this import near the top of the test file:

```ts
import { SearchOutlined } from '@solid-ant-design/icons'
```

- [ ] **Step 2: Add tests for icon API behavior**

Append these tests inside the existing `describe('Button', () => { ... })` block:

```tsx
it('renders an icon from the icons package before children by default', () => {
  const result = render(() => <Button icon={<SearchOutlined />}>Search</Button>)
  const button = result.getByRole('button')
  const iconWrapper = button.querySelector('.ads-btn-icon')

  expect(iconWrapper).not.toBeNull()
  expect(iconWrapper?.className).toContain('ads-btn-icon-start')
  expect(iconWrapper?.querySelector('svg')).not.toBeNull()
  expect(button.firstElementChild).toBe(iconWrapper)
  expect(button).toHaveTextContent('Search')
})

it('renders the icon after children when iconPosition is end', () => {
  const result = render(() => (
    <Button icon={<SearchOutlined />} iconPosition="end">
      Search
    </Button>
  ))
  const button = result.getByRole('button')
  const iconWrapper = button.querySelector('.ads-btn-icon')

  expect(iconWrapper).not.toBeNull()
  expect(iconWrapper?.className).toContain('ads-btn-icon-end')
  expect(button.lastElementChild).toBe(iconWrapper)
})

it('uses the loading icon instead of a custom icon while loading', () => {
  const result = render(() => (
    <Button icon={<SearchOutlined data-testid="search-icon" />} loading>
      Search
    </Button>
  ))
  const button = result.getByRole('button')
  const iconWrapper = button.querySelector('.ads-btn-icon')

  expect(iconWrapper).not.toBeNull()
  expect(iconWrapper?.querySelector('svg')).not.toBeNull()
  expect(result.queryByTestId('search-icon')).toBeNull()
  expect(button.className).toContain('ads-btn-loading')
})
```

- [ ] **Step 3: Run the Button test and verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- button.test.tsx
```

Expected: FAIL because `icon` and `iconPosition` are not implemented, so `.ads-btn-icon` is absent for non-loading icon tests and the custom icon still is not part of the API.

### Task 2: Implement Button icon props and rendering

**Files:**

- Modify: `packages/components/src/button/interface.ts`
- Modify: `packages/components/src/button/button.tsx`

- [ ] **Step 1: Add prop types**

In `packages/components/src/button/interface.ts`, add this type:

```ts
export type ButtonIconPosition = 'start' | 'end'
```

Add these fields to `ButtonProps`:

```ts
  icon?: JSX.Element
  iconPosition?: ButtonIconPosition
```

- [ ] **Step 2: Split new props in Button**

In `packages/components/src/button/button.tsx`, include these names in `splitProps`:

```ts
    'icon',
    'iconPosition',
```

- [ ] **Step 3: Add derived icon helpers before the return**

Add these helpers after `disabled`:

```tsx
const iconPosition = () => local.iconPosition ?? 'start'
const iconNode = () => (local.loading ? <LoadingOutlined /> : local.icon)
const renderIcon = () => (
  <Show when={iconNode()}>
    {(icon) => (
      <span class={classNames(`${prefixCls()}-icon`, `${prefixCls()}-icon-${iconPosition()}`)}>
        {icon()}
      </span>
    )}
  </Show>
)
```

- [ ] **Step 4: Replace the existing loading-only icon render**

Replace:

```tsx
;<Show when={local.loading}>
  <span class={`${prefixCls()}-icon`}>
    <LoadingOutlined />
  </span>
</Show>
{
  local.children
}
```

With:

```tsx
;<Show when={iconPosition() === 'start'}>{renderIcon()}</Show>
{
  local.children
}
;<Show when={iconPosition() === 'end'}>{renderIcon()}</Show>
```

- [ ] **Step 5: Run the Button test and verify GREEN for behavior**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- button.test.tsx
```

Expected: PASS for the Button test file.

### Task 3: Add directional icon spacing styles

**Files:**

- Modify: `packages/components/src/button/button.style.ts`

- [ ] **Step 1: Update icon style selectors**

Replace:

```ts
      [`.${prefixCls}-icon`]: { display: 'inline-flex', 'margin-inline-end': 8 },
```

With:

```ts
      [`.${prefixCls}-icon`]: { display: 'inline-flex' },
      [`.${prefixCls}-icon-start`]: { 'margin-inline-end': 8 },
      [`.${prefixCls}-icon-end`]: { 'margin-inline-start': 8 },
```

- [ ] **Step 2: Run the Button test after styling change**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- button.test.tsx
```

Expected: PASS for the Button test file.

### Task 4: Full verification

**Files:**

- No code changes.

- [ ] **Step 1: Run repository verification commands requested by AGENTS.md**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: Each command exits 0. If unrelated pre-existing failures appear, record the failing command and the relevant output.
