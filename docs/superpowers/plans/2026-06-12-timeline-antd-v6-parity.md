# Timeline Ant Design v6 Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework Timeline to expose Ant Design v6 API only and render through an enhanced local Steps dot foundation.

**Architecture:** Extend Steps with reusable dot, semantic slot, item styling, variant, and internal semantic element support. Replace Timeline's custom list renderer with a Steps-backed normalization layer that maps Timeline v6 items into Steps items and applies Timeline-specific styling.

**Tech Stack:** SolidJS, TypeScript, `@solidjs/testing-library`, Vitest, local cssinjs style registration, `@solid-ant-design/icons`.

---

## File Structure

- Modify `packages/components/src/steps/interface.ts`: add dot type, variant, semantic maps, item class/style props, orientation alias, and internal element props.
- Modify `packages/components/src/steps/steps.tsx`: render semantic slots, dot mode, item styles/classes, and optional root/list item tags.
- Modify `packages/components/src/steps/steps.style.ts`: add dot, variant, and semantic-friendly styles without breaking existing Steps.
- Modify `packages/components/src/steps/__tests__/steps.test.tsx`: cover dot type and semantic class/style maps.
- Modify `packages/components/src/timeline/interface.ts`: replace old Timeline API with v6-only props.
- Modify `packages/components/src/timeline/timeline.tsx`: normalize Timeline v6 items into Steps items and render `Steps`.
- Modify `packages/components/src/timeline/timeline.style.ts`: style Timeline over the Steps semantic structure.
- Modify `packages/components/src/timeline/__tests__/timeline.test.tsx`: replace old API tests with v6 API tests.
- Modify `apps/docs/src/pages/components/timeline.mdx`: update demos and API tables to v6 names only.

---

### Task 1: Add Failing Steps Foundation Tests

**Files:**

- Modify: `packages/components/src/steps/__tests__/steps.test.tsx`

- [ ] **Step 1: Write failing tests for dot type and semantic maps**

Append these tests to `packages/components/src/steps/__tests__/steps.test.tsx`:

```tsx
it('renders dot steps with semantic classNames and styles', () => {
  const result = render(() => (
    <Steps
      type="dot"
      orientation="vertical"
      variant="filled"
      classNames={{
        root: 'custom-root',
        list: 'custom-list',
        item: 'custom-item',
        itemIcon: 'custom-icon',
        itemTitle: 'custom-title',
        itemContent: 'custom-content',
        itemRail: 'custom-rail',
        itemWrapper: 'custom-wrapper',
        itemSection: 'custom-section',
        itemHeader: 'custom-header',
      }}
      styles={{
        root: { width: '320px' },
        itemIcon: { color: 'rgb(255, 0, 0)' },
        itemTitle: { color: 'rgb(0, 0, 255)' },
      }}
      items={[
        {
          title: 'Queued',
          description: 'Waiting',
          className: 'first-step',
          style: { margin: '1px' },
          classNames: { itemContent: 'first-content' },
          styles: { itemContent: { color: 'rgb(0, 128, 0)' } },
        },
      ]}
    />
  ))

  const root = result.container.firstElementChild as HTMLElement
  const item = result.getByRole('listitem')
  const icon = result.container.querySelector('.ads-steps-item-icon') as HTMLElement
  const title = result.getByText('Queued')
  const content = result.container.querySelector('.ads-steps-item-content') as HTMLElement

  expect(root).toHaveClass('ads-steps-dot')
  expect(root).toHaveClass('ads-steps-vertical')
  expect(root).toHaveClass('ads-steps-variant-filled')
  expect(root).toHaveClass('custom-root')
  expect(root).toHaveStyle({ width: '320px' })
  expect(result.container.querySelector('.ads-steps-list')).toHaveClass('custom-list')
  expect(item).toHaveClass('custom-item')
  expect(item).toHaveClass('first-step')
  expect(item).toHaveStyle({ margin: '1px' })
  expect(icon).toHaveClass('custom-icon')
  expect(icon).toHaveStyle({ color: 'rgb(255, 0, 0)' })
  expect(title).toHaveClass('custom-title')
  expect(title).toHaveStyle({ color: 'rgb(0, 0, 255)' })
  expect(content).toHaveClass('custom-content')
  expect(content).toHaveClass('first-content')
  expect(content).toHaveStyle({ color: 'rgb(0, 128, 0)' })
  expect(result.container.querySelector('.ads-steps-item-rail')).toHaveClass('custom-rail')
  expect(result.container.querySelector('.ads-steps-item-wrapper')).toHaveClass('custom-wrapper')
  expect(result.container.querySelector('.ads-steps-item-section')).toHaveClass('custom-section')
  expect(result.container.querySelector('.ads-steps-item-header')).toHaveClass('custom-header')
})

it('can render ordered-list semantics for internal consumers', () => {
  const result = render(() => (
    <Steps rootComponent="ol" itemComponent="li" items={[{ title: 'One' }, { title: 'Two' }]} />
  ))

  expect(result.container.firstElementChild?.tagName).toBe('OL')
  expect(result.getAllByRole('listitem')).toHaveLength(2)
})
```

- [ ] **Step 2: Run Steps tests and verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- src/steps/__tests__/steps.test.tsx
```

Expected: FAIL because `type="dot"`, `orientation`, semantic props, item class/style props, and internal semantic element props are not implemented.

---

### Task 2: Implement Steps Foundation

**Files:**

- Modify: `packages/components/src/steps/interface.ts`
- Modify: `packages/components/src/steps/steps.tsx`
- Modify: `packages/components/src/steps/steps.style.ts`

- [ ] **Step 1: Update Steps interfaces**

In `packages/components/src/steps/interface.ts`, replace the current type and interface declarations with:

```ts
import type { JSX } from 'solid-js'

export type StepsStatus = 'wait' | 'process' | 'finish' | 'error'
export type StepsDirection = 'horizontal' | 'vertical'
export type StepsSize = 'default' | 'small'
export type StepsType = 'default' | 'navigation' | 'dot'
export type StepsVariant = 'outlined' | 'filled'
export type StepsSemanticKey =
  | 'root'
  | 'list'
  | 'item'
  | 'itemTitle'
  | 'itemIcon'
  | 'itemContent'
  | 'itemRail'
  | 'itemWrapper'
  | 'itemSection'
  | 'itemHeader'
export type StepsSemanticClassNames = Partial<Record<StepsSemanticKey, string>>
export type StepsSemanticStyles = Partial<Record<StepsSemanticKey, JSX.CSSProperties>>
export type StepsRootComponent = 'div' | 'ol'
export type StepsItemComponent = 'div' | 'li'

export interface StepItem {
  title?: JSX.Element
  description?: JSX.Element
  status?: StepsStatus
  icon?: JSX.Element
  disabled?: boolean
  class?: string
  className?: string
  style?: JSX.CSSProperties
  classNames?: Omit<StepsSemanticClassNames, 'root' | 'list'>
  styles?: Omit<StepsSemanticStyles, 'root' | 'list'>
}

export interface StepsProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'onChange'> {
  items?: StepItem[]
  current?: number
  status?: StepsStatus
  direction?: StepsDirection
  orientation?: StepsDirection
  size?: StepsSize
  type?: StepsType
  variant?: StepsVariant
  classNames?: StepsSemanticClassNames
  styles?: StepsSemanticStyles
  rootComponent?: StepsRootComponent
  itemComponent?: StepsItemComponent
  onChange?: (current: number) => void
}
```

- [ ] **Step 2: Update Steps rendering**

In `packages/components/src/steps/steps.tsx`, implement these behaviors:

- Split new props: `orientation`, `variant`, `className`, `classNames`, `styles`, `rootComponent`, `itemComponent`.
- Derive `direction` from `orientation ?? direction ?? 'horizontal'`.
- Derive `variant` from prop or `'outlined'`.
- Apply both `class` and `className` to the root.
- Apply `local.classNames?.root` and `local.styles?.root` to root.
- Render root as `Dynamic component={local.rootComponent ?? 'div'}`.
- Render list as `ol` for normal div roots and as `div` for `rootComponent="ol"` to avoid nested lists; apply `${prefixCls()}-list`.
- Render item as `Dynamic component={local.itemComponent ?? 'li'}`.
- Add semantic wrappers/classes:
  - `${prefixCls()}-item-rail`
  - `${prefixCls()}-item-wrapper`
  - `${prefixCls()}-item-section`
  - `${prefixCls()}-item-header`
  - `${prefixCls()}-item-icon`
  - `${prefixCls()}-item-content`
  - `${prefixCls()}-item-title`
  - `${prefixCls()}-item-description`
- In dot mode, default icon content should be an empty span-like dot unless `item.icon` exists.
- Merge global semantic classes/styles with item semantic classes/styles, with item values appended and item styles overriding global slot styles.

- [ ] **Step 3: Update Steps styles**

In `packages/components/src/steps/steps.style.ts`, add styles for:

- `.${prefixCls}-dot`.
- `.${prefixCls}-variant-outlined`.
- `.${prefixCls}-variant-filled`.
- `.${prefixCls}-item-rail` as the old tail element replacement.
- `.${prefixCls}-item-wrapper`, `item-section`, and `item-header`.
- Dot mode icon size around `10px`, with filled variant using primary background and outlined variant using container background.

Keep existing class names such as `ads-steps-item-tail` compatible by either preserving aliases or updating tests that use only public behavior.

- [ ] **Step 4: Run Steps tests and verify pass**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- src/steps/__tests__/steps.test.tsx
```

Expected: PASS.

---

### Task 3: Add Failing Timeline v6 API Tests

**Files:**

- Replace: `packages/components/src/timeline/__tests__/timeline.test.tsx`

- [ ] **Step 1: Replace Timeline tests with v6-only expectations**

Replace the file content with:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Timeline } from '../index'

describe('Timeline', () => {
  it('renders v6 title and content items through ordered-list semantics', () => {
    const result = render(() => (
      <Timeline
        items={[
          { title: '2026-06-01', content: 'Create account' },
          { title: '2026-06-02', content: 'Verify email' },
        ]}
      />
    ))

    expect(result.container.firstElementChild?.tagName).toBe('OL')
    expect(result.container.firstElementChild).toHaveClass('ads-timeline')
    expect(result.getAllByRole('listitem')).toHaveLength(2)
    expect(result.getByText('2026-06-01')).toHaveClass('ads-timeline-item-title')
    expect(result.getByText('Create account')).toHaveClass('ads-timeline-item-content')
  })

  it('supports start end and alternate placement modes', () => {
    const start = render(() => <Timeline mode="start" items={[{ content: 'Start' }]} />)
    const end = render(() => <Timeline mode="end" items={[{ content: 'End' }]} />)
    const alternate = render(() => (
      <Timeline
        mode="alternate"
        items={[{ content: 'One' }, { content: 'Two' }, { content: 'Three', placement: 'end' }]}
      />
    ))

    expect(start.container.querySelector('.ads-timeline-item')).toHaveClass(
      'ads-timeline-item-placement-start',
    )
    expect(end.container.querySelector('.ads-timeline-item')).toHaveClass(
      'ads-timeline-item-placement-end',
    )
    const items = alternate.container.querySelectorAll('.ads-timeline-item')
    expect(items[0]).toHaveClass('ads-timeline-item-placement-start')
    expect(items[1]).toHaveClass('ads-timeline-item-placement-end')
    expect(items[2]).toHaveClass('ads-timeline-item-placement-end')
  })

  it('supports orientation variant and titleSpan', () => {
    const result = render(() => (
      <Timeline
        orientation="horizontal"
        variant="filled"
        titleSpan={160}
        items={[{ title: 'Launch', content: 'Ready' }]}
      />
    ))

    const root = result.container.firstElementChild as HTMLElement
    expect(root).toHaveClass('ads-timeline-horizontal')
    expect(root).toHaveClass('ads-timeline-variant-filled')
    expect(root.style.getPropertyValue('--ads-timeline-title-span')).toBe('160px')
  })

  it('supports color custom icon loading and reverse', () => {
    const result = render(() => (
      <Timeline
        reverse
        items={[
          { content: 'First', color: 'green' },
          { content: 'Second', icon: <span data-testid="custom-icon">I</span> },
          { content: 'Third', loading: true, color: '#722ed1' },
        ]}
      />
    ))

    const contents = Array.from(
      result.container.querySelectorAll('.ads-timeline-item-content'),
    ).map((node) => node.textContent)
    expect(contents).toEqual(['Third', 'Second', 'First'])
    expect(result.container.querySelector('.ads-timeline-item-color-green')).toBeInTheDocument()
    expect(result.getByTestId('custom-icon')).toBeInTheDocument()
    expect(result.container.querySelector('.ads-timeline-item-loading')).toBeInTheDocument()
    expect(
      (result.container.querySelector('.ads-timeline-item') as HTMLElement).style.getPropertyValue(
        '--ads-timeline-item-icon-color',
      ),
    ).toBe('#722ed1')
  })

  it('supports root and item semantic classNames and styles', () => {
    const result = render(() => (
      <Timeline
        rootClassName="root-extra"
        className="class-name-extra"
        class="class-extra"
        classNames={{
          root: 'semantic-root',
          item: 'semantic-item',
          itemIcon: 'semantic-icon',
          itemTitle: 'semantic-title',
          itemContent: 'semantic-content',
          itemRail: 'semantic-rail',
          itemWrapper: 'semantic-wrapper',
          itemSection: 'semantic-section',
          itemHeader: 'semantic-header',
        }}
        styles={{
          root: { width: '480px' },
          itemIcon: { color: 'rgb(255, 0, 0)' },
        }}
        items={[
          {
            title: 'Styled',
            content: 'Content',
            className: 'item-extra',
            style: { margin: '2px' },
            classNames: { itemContent: 'item-content-extra' },
            styles: { itemContent: { color: 'rgb(0, 128, 0)' } },
          },
        ]}
      />
    ))

    const root = result.container.firstElementChild as HTMLElement
    const item = result.getByRole('listitem')
    const content = result.getByText('Content')

    expect(root).toHaveClass('root-extra')
    expect(root).toHaveClass('class-name-extra')
    expect(root).toHaveClass('class-extra')
    expect(root).toHaveClass('semantic-root')
    expect(root).toHaveStyle({ width: '480px' })
    expect(item).toHaveClass('semantic-item')
    expect(item).toHaveClass('item-extra')
    expect(item).toHaveStyle({ margin: '2px' })
    expect(result.container.querySelector('.ads-timeline-item-icon')).toHaveClass('semantic-icon')
    expect(result.container.querySelector('.ads-timeline-item-icon')).toHaveStyle({
      color: 'rgb(255, 0, 0)',
    })
    expect(result.getByText('Styled')).toHaveClass('semantic-title')
    expect(content).toHaveClass('semantic-content')
    expect(content).toHaveClass('item-content-extra')
    expect(content).toHaveStyle({ color: 'rgb(0, 128, 0)' })
    expect(result.container.querySelector('.ads-timeline-item-rail')).toHaveClass('semantic-rail')
    expect(result.container.querySelector('.ads-timeline-item-wrapper')).toHaveClass(
      'semantic-wrapper',
    )
    expect(result.container.querySelector('.ads-timeline-item-section')).toHaveClass(
      'semantic-section',
    )
    expect(result.container.querySelector('.ads-timeline-item-header')).toHaveClass(
      'semantic-header',
    )
  })

  it('supports custom prefixCls and ConfigProvider prefixing', () => {
    const custom = render(() => (
      <Timeline prefixCls="custom-timeline" items={[{ content: 'Custom' }]} />
    ))
    expect(custom.container.querySelector('.custom-timeline')).toBeTruthy()

    const configured = render(() => (
      <ConfigProvider prefixCls="corp">
        <Timeline items={[{ content: 'Configured' }]} />
      </ConfigProvider>
    ))
    expect(configured.container.querySelector('.corp-timeline')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run Timeline tests and verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- src/timeline/__tests__/timeline.test.tsx
```

Expected: FAIL because Timeline still exposes and renders the old API shape.

---

### Task 4: Implement Timeline v6 API

**Files:**

- Modify: `packages/components/src/timeline/interface.ts`
- Modify: `packages/components/src/timeline/timeline.tsx`
- Modify: `packages/components/src/timeline/timeline.style.ts`

- [ ] **Step 1: Replace Timeline interfaces**

In `packages/components/src/timeline/interface.ts`, replace old types with:

```ts
import type { JSX } from 'solid-js'

export type TimelineMode = 'start' | 'alternate' | 'end'
export type TimelineOrientation = 'vertical' | 'horizontal'
export type TimelineVariant = 'outlined' | 'filled'
export type TimelinePlacement = 'start' | 'end'
export type TimelineColor = 'blue' | 'red' | 'green' | 'gray' | string
export type TimelineSemanticKey =
  | 'root'
  | 'list'
  | 'item'
  | 'itemTitle'
  | 'itemIcon'
  | 'itemContent'
  | 'itemRail'
  | 'itemWrapper'
  | 'itemSection'
  | 'itemHeader'
export type TimelineSemanticClassNames = Partial<Record<TimelineSemanticKey, string>>
export type TimelineSemanticStyles = Partial<Record<TimelineSemanticKey, JSX.CSSProperties>>

export interface TimelineItem {
  key?: string | number
  title?: JSX.Element
  content?: JSX.Element
  color?: TimelineColor
  icon?: JSX.Element
  placement?: TimelinePlacement
  loading?: boolean
  class?: string
  className?: string
  style?: JSX.CSSProperties
  classNames?: Omit<TimelineSemanticClassNames, 'root' | 'list'>
  styles?: Omit<TimelineSemanticStyles, 'root' | 'list'>
}

export interface TimelineProps extends Omit<JSX.OlHTMLAttributes<HTMLOListElement>, 'children'> {
  items?: TimelineItem[]
  mode?: TimelineMode
  orientation?: TimelineOrientation
  variant?: TimelineVariant
  titleSpan?: number | string
  reverse?: boolean
  prefixCls?: string
  rootClassName?: string
  className?: string
  classNames?: TimelineSemanticClassNames
  styles?: TimelineSemanticStyles
}
```

- [ ] **Step 2: Replace Timeline implementation**

In `packages/components/src/timeline/timeline.tsx`:

- Import `Steps` and `StepItem`.
- Normalize `mode` to `local.mode ?? 'start'`.
- Normalize `orientation` to `local.orientation ?? 'vertical'`.
- Normalize `variant` to `local.variant ?? 'outlined'`.
- Convert each Timeline item to a Steps item:
  - `title` maps to `title`.
  - `content` maps to `description`.
  - `icon` maps to `icon`.
  - `loading` sets `status: 'process'` and default loading icon if no icon exists.
  - `placement` class is computed from item placement, alternating index, or mode.
  - Preset colors add `${prefixCls()}-item-color-${color}`.
  - Custom color sets `--${prefixCls()}-item-icon-color`.
  - `classNames` keys map from Timeline class prefixes to Steps semantic slots by passing through the enhanced Steps API.
- Reverse after normalization when `reverse` is true.
- Render:
  - `<Steps rootComponent="ol" itemComponent="li" type="dot" ... />`
  - `prefixCls` should be passed or supported so root classes are Timeline classes, not Steps classes. If Steps cannot use a custom prefix, add `prefixCls?: string` to Steps as part of Task 2.
  - `classNames` and `styles` should pass root/list/item semantic classes.
  - `style` should merge root style, `styles.root`, and `titleSpan` CSS variable.

- [ ] **Step 3: Update Timeline styles**

In `packages/components/src/timeline/timeline.style.ts`, rewrite styles for the Steps-backed structure:

- Root `.${prefixCls}` base styles.
- `.${prefixCls}-vertical` and `.${prefixCls}-horizontal`.
- `.${prefixCls}-variant-outlined` and `.${prefixCls}-variant-filled`.
- `.${prefixCls}-layout-alternate`.
- `.${prefixCls}-item-placement-start` and `.${prefixCls}-item-placement-end`.
- `.${prefixCls}-item-title`, `item-content`, `item-icon`, `item-rail`, `item-wrapper`, `item-section`, `item-header`.
- Color classes `item-color-blue`, `item-color-red`, `item-color-green`, `item-color-gray`.
- Custom color CSS variable fallback `--${prefixCls}-item-icon-color`.
- Loading class animation or static process styling.

- [ ] **Step 4: Run targeted Timeline and Steps tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- src/steps/__tests__/steps.test.tsx src/timeline/__tests__/timeline.test.tsx
```

Expected: PASS.

---

### Task 5: Update Timeline Docs

**Files:**

- Modify: `apps/docs/src/pages/components/timeline.mdx`

- [ ] **Step 1: Update demos**

Rewrite demos to use these v6-only props:

- Basic: `items={[{ title: '2026-06-01', content: 'Create account' }]}`
- Alternate: `mode="alternate"`.
- Horizontal: `orientation="horizontal"`.
- Loading: item `{ loading: true, content: 'Deploying' }`.
- Variant/title span: `variant="filled"` and `titleSpan={160}`.
- Custom icon/color: `icon` and `color`.
- Semantic styles: `classNames` and `styles`.

- [ ] **Step 2: Update API tables**

Timeline table should list:

- `items`
- `mode`
- `orientation`
- `variant`
- `titleSpan`
- `reverse`
- `rootClassName`
- `classNames`
- `styles`
- `prefixCls`

TimelineItem table should list:

- `key`
- `title`
- `content`
- `color`
- `icon`
- `placement`
- `loading`
- `className`
- `style`
- `classNames`
- `styles`

Do not include `pending`, `pendingDot`, `label`, `children`, `dot`, `position`, `left`, or `right` as valid Timeline API.

- [ ] **Step 3: Check docs for removed API names**

Run:

```bash
rg -n "pending|pendingDot|label|children|dot|position|'left'|'right'" apps/docs/src/pages/components/timeline.mdx packages/components/src/timeline
```

Expected: no matches for removed API names except incidental words that are not documenting removed Timeline API. If there are incidental matches, inspect and keep only valid non-API text.

---

### Task 6: Final Verification

**Files:**

- All modified files

- [ ] **Step 1: Run focused tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- src/steps/__tests__/steps.test.tsx src/timeline/__tests__/timeline.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: PASS.

- [ ] **Step 3: Run format check**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: PASS.

- [ ] **Step 4: Run full test suite if time allows**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: PASS.

- [ ] **Step 5: Summarize changed API surface**

Report that Timeline now uses v6-only API names and that old API names were removed from public Timeline types and docs.
