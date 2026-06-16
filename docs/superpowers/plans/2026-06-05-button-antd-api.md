# Button Antd API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `@solid-ant-design/core` Button to cover the requested antd Button APIs except semantic `classNames` / `styles`.

**Architecture:** Keep the public Button API in `packages/components/src/button/interface.ts` and behavior in `button.tsx`. Add an internal normalized state for `type`/`color`/`variant`, link-vs-button rendering, icon placement, loading object support, and simple Chinese auto-space handling; keep styling class-driven in `button.style.ts`.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, existing cssinjs style registration.

---

## File Structure

- Modify `packages/components/src/button/interface.ts`: add new public Button prop types and widen loading.
- Modify `packages/components/src/button/button.tsx`: normalize new props, support `<a>` rendering, delayed/custom loading, `iconPlacement`, `autoInsertSpace`, and new classes.
- Modify `packages/components/src/button/button.style.ts`: add classes for shape, ghost, variants, colors, and disabled anchor behavior.
- Modify `packages/components/src/button/index.ts`: export new prop-related types.
- Modify `packages/components/src/button/__tests__/button.test.tsx`: add failing behavior tests before implementation.

## Task 1: Add failing tests for link rendering, shape, ghost, placement, auto-space, loading object, and color/variant

**Files:**

- Modify: `packages/components/src/button/__tests__/button.test.tsx`

- [ ] **Step 1: Append failing tests**

Add these tests inside the existing `describe('Button', () => { ... })` block:

```tsx
it('renders an anchor when href is provided and prevents clicks while disabled', () => {
  const onClick = vi.fn()
  const result = render(() => (
    <Button href="https://example.com" target="_blank" disabled onClick={onClick}>
      Link
    </Button>
  ))
  const link = result.getByRole('link') as HTMLAnchorElement

  expect(link.tagName).toBe('A')
  expect(link.getAttribute('href')).toBe('https://example.com')
  expect(link.getAttribute('target')).toBe('_blank')
  expect(link.className).toContain('ads-btn-disabled')

  fireEvent.click(link)
  expect(onClick).not.toHaveBeenCalled()
})

it('supports shape and ghost classes', () => {
  const circle = render(() => <Button shape="circle" ghost />).getByRole('button')
  expect(circle.className).toContain('ads-btn-circle')
  expect(circle.className).toContain('ads-btn-background-ghost')

  const round = render(() => <Button shape="round" />).getByRole('button')
  expect(round.className).toContain('ads-btn-round')
})

it('prefers iconPlacement over legacy iconPosition', () => {
  const result = render(() => (
    <Button icon={<SearchOutlined />} iconPosition="start" iconPlacement="end">
      Search
    </Button>
  ))
  const button = result.getByRole('button')
  const iconWrapper = button.querySelector('.ads-btn-icon')

  expect(iconWrapper?.className).toContain('ads-btn-icon-end')
  expect(button.lastElementChild).toBe(iconWrapper)
})

it('auto inserts a space between two Chinese characters by default', () => {
  const spaced = render(() => <Button>按钮</Button>).getByRole('button')
  expect(spaced).toHaveTextContent('按 钮')

  const compact = render(() => <Button autoInsertSpace={false}>按钮</Button>).getByRole('button')
  expect(compact).toHaveTextContent('按钮')
})

it('supports custom loading icon and delayed loading', async () => {
  vi.useFakeTimers()
  const result = render(() => (
    <Button loading={{ delay: 100, icon: <span data-testid="custom-loading">loading</span> }}>
      Save
    </Button>
  ))
  const button = result.getByRole('button') as HTMLButtonElement

  expect(button.disabled).toBe(false)
  expect(button.className).not.toContain('ads-btn-loading')
  expect(result.queryByTestId('custom-loading')).toBeNull()

  await vi.advanceTimersByTimeAsync(100)

  expect(button.disabled).toBe(true)
  expect(button.className).toContain('ads-btn-loading')
  expect(result.getByTestId('custom-loading')).toBeInTheDocument()
  vi.useRealTimers()
})

it('adds normalized color and variant classes and lets explicit props override type mapping', () => {
  const primary = render(() => <Button type="primary">Primary</Button>).getByRole('button')
  expect(primary.className).toContain('ads-btn-color-primary')
  expect(primary.className).toContain('ads-btn-variant-solid')

  const overridden = render(() => (
    <Button type="primary" color="danger" variant="outlined">
      Danger
    </Button>
  )).getByRole('button')
  expect(overridden.className).toContain('ads-btn-color-danger')
  expect(overridden.className).toContain('ads-btn-variant-outlined')
  expect(overridden.className).not.toContain('ads-btn-variant-solid')

  const preset = render(() => (
    <Button color="blue" variant="filled">
      Blue
    </Button>
  )).getByRole('button')
  expect(preset.className).toContain('ads-btn-color-blue')
  expect(preset.className).toContain('ads-btn-variant-filled')
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- button.test.tsx
```

Expected: FAIL with TypeScript/runtime expectations because props/classes/anchor/loading object behavior are not implemented.

## Task 2: Implement new Button prop types and exports

**Files:**

- Modify: `packages/components/src/button/interface.ts`
- Modify: `packages/components/src/button/index.ts`

- [ ] **Step 1: Update `interface.ts` types**

Replace Button-specific types with definitions equivalent to:

```ts
export type ButtonType = 'default' | 'primary' | 'dashed' | 'text' | 'link'
export type ButtonHTMLType = 'button' | 'submit' | 'reset'
export type ButtonShape = 'default' | 'circle' | 'round'
export type ButtonIconPosition = 'start' | 'end'
export type ButtonVariant = 'outlined' | 'dashed' | 'solid' | 'filled' | 'text' | 'link'
export type ButtonPresetColor =
  | 'blue'
  | 'purple'
  | 'cyan'
  | 'green'
  | 'magenta'
  | 'pink'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'volcano'
  | 'geekblue'
  | 'lime'
  | 'gold'
export type ButtonColor = 'default' | 'primary' | 'danger' | ButtonPresetColor
export interface ButtonLoadingConfig {
  delay?: number
  icon?: JSX.Element
}
export type ButtonLoading = boolean | ButtonLoadingConfig
```

Update `ButtonProps` to include:

```ts
  loading?: ButtonLoading
  ghost?: boolean
  href?: string
  target?: string
  shape?: ButtonShape
  color?: ButtonColor
  variant?: ButtonVariant
  iconPlacement?: ButtonIconPosition
  autoInsertSpace?: boolean
```

Keep existing props and legacy `iconPosition`.

- [ ] **Step 2: Export new types from `index.ts`**

Export all new Button types:

```ts
export type {
  ButtonColor,
  ButtonHTMLType,
  ButtonIconPosition,
  ButtonLoading,
  ButtonLoadingConfig,
  ButtonPresetColor,
  ButtonProps,
  ButtonShape,
  ButtonType,
  ButtonVariant,
} from './interface'
```

- [ ] **Step 3: Run tests to verify type errors move to behavior failures**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- button.test.tsx
```

Expected: still FAIL because implementation/classes are missing.

## Task 3: Implement Button behavior

**Files:**

- Modify: `packages/components/src/button/button.tsx`

- [ ] **Step 1: Add helpers in `button.tsx`**

Add helper functions for loading normalization, type mapping, and Chinese auto spacing:

```ts
const presetColors = new Set([...])
function isLoadingObject(loading: ButtonLoading | undefined): loading is ButtonLoadingConfig { ... }
function getTypeColor(type?: ButtonType): ButtonColor { ... }
function getTypeVariant(type?: ButtonType): ButtonVariant { ... }
function spaceChildren(children: JSX.Element, autoInsertSpace: boolean): JSX.Element { ... }
```

- [ ] **Step 2: Extend `splitProps` local keys**

Include new keys: `ghost`, `href`, `target`, `shape`, `color`, `variant`, `iconPlacement`, `autoInsertSpace`.

- [ ] **Step 3: Implement delayed/custom loading**

Use Solid `createSignal`, `createEffect`, and `onCleanup` so:

- boolean `true` enters loading immediately;
- boolean `false` exits loading;
- object with `delay` enters loading after delay;
- object with `icon` uses the custom icon while loading.

- [ ] **Step 4: Implement normalized classes and icon placement**

Compute:

```ts
const mergedColor = () => local.color ?? getTypeColor(local.type)
const mergedVariant = () => local.variant ?? getTypeVariant(local.type)
const iconPlacement = () => local.iconPlacement ?? local.iconPosition ?? 'start'
```

Add classes:

- legacy `${prefixCls()}-${local.type ?? 'default'}`
- `${prefixCls()}-color-${mergedColor()}`
- `${prefixCls()}-variant-${mergedVariant()}`
- shape classes when not default
- ghost class
- disabled class for anchor disabled/loading

- [ ] **Step 5: Render anchor when `href` exists**

Return `<a>` when `href` exists, otherwise `<button>`. Preserve children and icons in both branches. For disabled/loading anchors, prevent click and omit effective href or call `event.preventDefault()`.

- [ ] **Step 6: Run tests to verify behavior passes or exposes style-only gaps**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- button.test.tsx
```

Expected: tests should pass or fail only for class/style names not yet added.

## Task 4: Implement Button styles for new classes

**Files:**

- Modify: `packages/components/src/button/button.style.ts`

- [ ] **Step 1: Add base anchor compatibility**

In base `.${prefixCls}` add text decoration, inline-flex alignment, justify-content, gap-safe behavior, and disabled anchor class:

```ts
'&.${prefixCls}-disabled': {
  color: t.colorTextDisabled,
  cursor: 'not-allowed',
  background: t.colorFillAlter,
  borderColor: t.colorBorder,
  'pointer-events': 'none',
}
```

- [ ] **Step 2: Add shape classes**

Add:

```ts
[`.${prefixCls}-circle`]: { width: t.controlHeight, 'border-radius': '50%', padding: 0 }
[`.${prefixCls}-round`]: { 'border-radius': t.controlHeight }
```

Include small/large circle overrides.

- [ ] **Step 3: Add variant classes**

Add styles for:

- `variant-solid`
- `variant-outlined`
- `variant-dashed`
- `variant-filled`
- `variant-text`
- `variant-link`

- [ ] **Step 4: Add color classes**

Add styles for:

- `color-primary`
- `color-danger`
- `color-default`
- preset colors using simple color map.

- [ ] **Step 5: Add ghost class**

Add transparent background and inverted-ish border/text behavior:

```ts
[`.${prefixCls}-background-ghost`]: { background: 'transparent' }
```

- [ ] **Step 6: Run tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- button.test.tsx
```

Expected: PASS.

## Task 5: Final verification

**Files:**

- No new files expected beyond the plan.

- [ ] **Step 1: Run lint**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: PASS.

- [ ] **Step 2: Run format check**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: PASS.

- [ ] **Step 3: Run typecheck**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: PASS.

- [ ] **Step 4: Run tests**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: PASS.

- [ ] **Step 5: Run build**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: PASS.
