# Component Expansion Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Phase 1 components `Divider`, `Card`, `Avatar`, `Empty`, `Breadcrumb`, and `Rate` to `@ant-design-solid/core` with docs, exports, tests, and verification.

**Architecture:** Each component follows the existing package convention: `interface.ts`, `<component>.tsx`, `<component>.style.ts`, and `index.ts` under `packages/components/src/<component>/`. Components use `useConfig()`, token-aware `useStyleRegister()`, and `classNames()` like existing components. Behavior-heavy components receive Vitest tests colocated in each component folder using kebab-case `*.test.tsx` filenames.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, @ant-design-solid/cssinjs, @ant-design-solid/theme, pnpm/corepack.

---

## File Structure

Create component source files:

```text
packages/components/src/divider/index.ts
packages/components/src/divider/interface.ts
packages/components/src/divider/divider.tsx
packages/components/src/divider/divider.style.ts
packages/components/src/card/index.ts
packages/components/src/card/interface.ts
packages/components/src/card/card.tsx
packages/components/src/card/card.style.ts
packages/components/src/avatar/index.ts
packages/components/src/avatar/interface.ts
packages/components/src/avatar/avatar.tsx
packages/components/src/avatar/avatar.style.ts
packages/components/src/avatar/avatar.test.tsx
packages/components/src/empty/index.ts
packages/components/src/empty/interface.ts
packages/components/src/empty/empty.tsx
packages/components/src/empty/empty.style.ts
packages/components/src/breadcrumb/index.ts
packages/components/src/breadcrumb/interface.ts
packages/components/src/breadcrumb/breadcrumb.tsx
packages/components/src/breadcrumb/breadcrumb.style.ts
packages/components/src/breadcrumb/breadcrumb.test.tsx
packages/components/src/rate/index.ts
packages/components/src/rate/interface.ts
packages/components/src/rate/rate.tsx
packages/components/src/rate/rate.style.ts
packages/components/src/rate/rate.test.tsx
```

Create docs pages:

```text
apps/docs/src/routes/components/divider.tsx
apps/docs/src/routes/components/card.tsx
apps/docs/src/routes/components/avatar.tsx
apps/docs/src/routes/components/empty.tsx
apps/docs/src/routes/components/breadcrumb.tsx
apps/docs/src/routes/components/rate.tsx
```

Modify shared registry files:

```text
packages/components/src/index.ts
apps/docs/src/site/nav.ts
apps/docs/src/site/routes.ts
```

Run verification:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- --runInBand
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

---

### Task 1: Add Divider

**Files:**
- Create: `packages/components/src/divider/interface.ts`
- Create: `packages/components/src/divider/divider.style.ts`
- Create: `packages/components/src/divider/divider.tsx`
- Create: `packages/components/src/divider/index.ts`
- Create: `apps/docs/src/routes/components/divider.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`
- Modify: `apps/docs/src/site/routes.ts`

- [ ] **Step 1: Inspect docs route convention**

Run:

```bash
sed -n '1,220p' apps/docs/src/site/routes.ts
sed -n '1,180p' packages/components/src/space/space.tsx
sed -n '1,180p' packages/components/src/space/space.style.ts
```

Expected: route file exports lazy component route entries, and component source uses `useConfig`, `classNames`, and a `use<Component>Style` hook.

- [ ] **Step 2: Add Divider implementation**

Create `packages/components/src/divider/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type DividerType = 'horizontal' | 'vertical'
export type DividerOrientation = 'left' | 'center' | 'right'

export interface DividerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  type?: DividerType
  orientation?: DividerOrientation
  dashed?: boolean
  plain?: boolean
  children?: JSX.Element
}
```

Create `packages/components/src/divider/divider.style.ts`:

```ts
import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { useToken } from '../config-provider'

export function useDividerStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Divider', prefixCls] }, () => {
    const t = token()
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        margin: 0,
        padding: 0,
        color: t.colorText,
        'font-size': `${t.fontSize}px`,
        'font-family': t.fontFamily,
        'line-height': t.lineHeight,
        'border-block-start': `${t.lineWidth}px solid ${t.colorSplit}`,
      },
      [`.${prefixCls}-horizontal`]: {
        display: 'flex',
        clear: 'both',
        width: '100%',
        'min-width': '100%',
        margin: `${t.marginLG}px 0`,
        '&::before, &::after': {
          position: 'relative',
          width: '50%',
          'border-block-start': `${t.lineWidth}px solid transparent`,
          'border-block-start-color': 'inherit',
          transform: 'translateY(50%)',
          content: '""',
        },
      },
      [`.${prefixCls}-horizontal.${prefixCls}-with-text`]: {
        display: 'flex',
        'align-items': 'center',
        margin: `${t.marginLG}px 0`,
        color: t.colorTextHeading,
        'font-weight': 500,
        'font-size': `${t.fontSizeLG}px`,
        'white-space': 'nowrap',
        'text-align': 'center',
        border: 0,
      },
      [`.${prefixCls}-inner-text`]: { display: 'inline-block', padding: `0 ${t.padding}px` },
      [`.${prefixCls}-with-text-left::before`]: { width: '5%' },
      [`.${prefixCls}-with-text-left::after`]: { width: '95%' },
      [`.${prefixCls}-with-text-right::before`]: { width: '95%' },
      [`.${prefixCls}-with-text-right::after`]: { width: '5%' },
      [`.${prefixCls}-plain.${prefixCls}-with-text`]: {
        color: t.colorText,
        'font-weight': 400,
        'font-size': `${t.fontSize}px`,
      },
      [`.${prefixCls}-vertical`]: {
        position: 'relative',
        top: '-0.06em',
        display: 'inline-block',
        height: '0.9em',
        margin: `0 ${t.marginXS}px`,
        'vertical-align': 'middle',
        'border-block-start': 0,
        'border-inline-start': `${t.lineWidth}px solid ${t.colorSplit}`,
      },
      [`.${prefixCls}-dashed`]: {
        'border-block-start-style': 'dashed',
        '&::before, &::after': { 'border-block-start-style': 'dashed' },
      },
      [`.${prefixCls}-vertical.${prefixCls}-dashed`]: { 'border-inline-start-style': 'dashed' },
    }
  })
}
```

Create `packages/components/src/divider/divider.tsx`:

```tsx
import { Show, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useDividerStyle } from './divider.style'
import type { DividerProps } from './interface'

export function Divider(props: DividerProps) {
  const [local, rest] = splitProps(props, [
    'type',
    'orientation',
    'dashed',
    'plain',
    'children',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-divider`
  const [, hashId] = useDividerStyle(prefixCls())
  const type = () => local.type ?? 'horizontal'
  const orientation = () => local.orientation ?? 'center'
  const hasText = () => type() === 'horizontal' && local.children !== undefined && local.children !== null

  return (
    <div
      {...rest}
      role={type() === 'vertical' ? 'separator' : undefined}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${type()}`,
        hasText() && `${prefixCls()}-with-text`,
        hasText() && `${prefixCls()}-with-text-${orientation()}`,
        local.dashed && `${prefixCls()}-dashed`,
        local.plain && `${prefixCls()}-plain`,
        hashId(),
        local.class,
      )}
    >
      <Show when={hasText()}>
        <span class={`${prefixCls()}-inner-text`}>{local.children}</span>
      </Show>
    </div>
  )
}
```

Create `packages/components/src/divider/index.ts`:

```ts
export * from './divider'
export * from './interface'
```

- [ ] **Step 3: Add Divider docs and exports**

Create `apps/docs/src/routes/components/divider.tsx`:

```tsx
import { Divider, Space } from '@ant-design-solid/core'
import { DemoBlock } from '../../site/demo-block'

export default function DividerPage() {
  return (
    <>
      <h1>Divider</h1>
      <DemoBlock title="Basic" code={`Text\n<Divider />\nText`}>
        <div>
          Text
          <Divider />
          Text
        </div>
      </DemoBlock>
      <DemoBlock title="With text" code={`<Divider orientation="left">Left</Divider>`}>
        <div>
          <Divider orientation="left">Left</Divider>
          <Divider>Center</Divider>
          <Divider orientation="right">Right</Divider>
        </div>
      </DemoBlock>
      <DemoBlock title="Variants" code={`<Divider dashed />\n<Divider plain>Plain</Divider>`}>
        <div>
          <Divider dashed />
          <Divider plain>Plain Text</Divider>
        </div>
      </DemoBlock>
      <DemoBlock title="Vertical" code={`A <Divider type="vertical" /> B`}>
        <Space>
          <span>A</span>
          <Divider type="vertical" />
          <span>B</span>
          <Divider type="vertical" dashed />
          <span>C</span>
        </Space>
      </DemoBlock>
    </>
  )
}
```

Modify `packages/components/src/index.ts` by appending:

```ts
export * from './divider'
```

Modify `apps/docs/src/site/nav.ts` by inserting near display/basic components:

```ts
  { path: '/components/divider', label: 'Divider' },
```

Modify `apps/docs/src/site/routes.ts` by adding a lazy route entry matching existing route style:

```ts
  {
    path: '/components/divider',
    component: lazy(() => import('../routes/components/divider')),
  },
```

- [ ] **Step 4: Verify Divider**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
```

Expected: both commands exit `0`.

- [ ] **Step 5: Commit Divider**

Run:

```bash
git add packages/components/src/divider packages/components/src/index.ts apps/docs/src/routes/components/divider.tsx apps/docs/src/site/nav.ts apps/docs/src/site/routes.ts
git commit -m "feat(components): add divider"
```

Expected: commit succeeds.

---

### Task 2: Add Card

**Files:**
- Create: `packages/components/src/card/interface.ts`
- Create: `packages/components/src/card/card.style.ts`
- Create: `packages/components/src/card/card.tsx`
- Create: `packages/components/src/card/index.ts`
- Create: `apps/docs/src/routes/components/card.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`
- Modify: `apps/docs/src/site/routes.ts`

- [ ] **Step 1: Add Card implementation**

Create `packages/components/src/card/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type CardSize = 'default' | 'small'

export interface CardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  title?: JSX.Element
  extra?: JSX.Element
  cover?: JSX.Element
  actions?: JSX.Element[]
  bordered?: boolean
  hoverable?: boolean
  size?: CardSize
  children?: JSX.Element
}
```

Create `packages/components/src/card/card.style.ts` with classes for `.ant-card`, header, body, cover, actions, bordered false, hoverable, and small size. Use token values `colorBgContainer`, `colorBorderSecondary`, `borderRadiusLG`, `boxShadowTertiary`, `padding`, `paddingSM`, `margin`, `fontSize`, `colorText`, and `colorTextHeading`.

Create `packages/components/src/card/card.tsx`:

```tsx
import { For, Show, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useCardStyle } from './card.style'
import type { CardProps } from './interface'

export function Card(props: CardProps) {
  const [local, rest] = splitProps(props, [
    'title',
    'extra',
    'cover',
    'actions',
    'bordered',
    'hoverable',
    'size',
    'children',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-card`
  const [, hashId] = useCardStyle(prefixCls())
  const bordered = () => local.bordered ?? true
  const hasHeader = () => local.title !== undefined || local.extra !== undefined
  const actions = () => local.actions ?? []

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        !bordered() && `${prefixCls()}-borderless`,
        local.hoverable && `${prefixCls()}-hoverable`,
        local.size === 'small' && `${prefixCls()}-small`,
        hashId(),
        local.class,
      )}
    >
      <Show when={local.cover !== undefined}>
        <div class={`${prefixCls()}-cover`}>{local.cover}</div>
      </Show>
      <Show when={hasHeader()}>
        <div class={`${prefixCls()}-head`}>
          <div class={`${prefixCls()}-head-wrapper`}>
            <Show when={local.title !== undefined}>
              <div class={`${prefixCls()}-head-title`}>{local.title}</div>
            </Show>
            <Show when={local.extra !== undefined}>
              <div class={`${prefixCls()}-extra`}>{local.extra}</div>
            </Show>
          </div>
        </div>
      </Show>
      <div class={`${prefixCls()}-body`}>{local.children}</div>
      <Show when={actions().length > 0}>
        <ul class={`${prefixCls()}-actions`}>
          <For each={actions()}>{(action) => <li><span>{action}</span></li>}</For>
        </ul>
      </Show>
    </div>
  )
}
```

Create `packages/components/src/card/index.ts`:

```ts
export * from './card'
export * from './interface'
```

- [ ] **Step 2: Add Card docs and exports**

Create `apps/docs/src/routes/components/card.tsx` with examples for basic card, title/extra, cover/actions, hoverable, small, and borderless. Use `Button`, `Card`, and `Space` imports from `@ant-design-solid/core`.

Modify component exports and docs route/nav with:

```ts
export * from './card'
```

```ts
  { path: '/components/card', label: 'Card' },
```

```ts
  {
    path: '/components/card',
    component: lazy(() => import('../routes/components/card')),
  },
```

- [ ] **Step 3: Verify and commit Card**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
git add packages/components/src/card packages/components/src/index.ts apps/docs/src/routes/components/card.tsx apps/docs/src/site/nav.ts apps/docs/src/site/routes.ts
git commit -m "feat(components): add card"
```

Expected: typecheck passes and commit succeeds.

---

### Task 3: Add Avatar with tests

**Files:**
- Create: `packages/components/src/avatar/interface.ts`
- Create: `packages/components/src/avatar/avatar.style.ts`
- Create: `packages/components/src/avatar/avatar.tsx`
- Create: `packages/components/src/avatar/index.ts`
- Create: `packages/components/src/avatar/avatar.test.tsx`
- Create: `apps/docs/src/routes/components/avatar.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`
- Modify: `apps/docs/src/site/routes.ts`

- [ ] **Step 1: Write Avatar failing tests**

Create `packages/components/src/avatar/avatar.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Avatar } from './avatar'

describe('Avatar', () => {
  it('renders text fallback', () => {
    render(() => <Avatar>U</Avatar>)
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('falls back to children when image errors', () => {
    render(() => <Avatar src="/missing.png">AB</Avatar>)
    const image = screen.getByRole('img')
    fireEvent.error(image)
    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('renders overflow count in group', () => {
    render(() => (
      <Avatar.Group maxCount={2}>
        <Avatar>A</Avatar>
        <Avatar>B</Avatar>
        <Avatar>C</Avatar>
      </Avatar.Group>
    ))
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('B')).toBeInTheDocument()
    expect(screen.queryByText('C')).not.toBeInTheDocument()
    expect(screen.getByText('+1')).toBeInTheDocument()
  })
})
```

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- avatar.test.tsx
```

Expected: FAIL because `./avatar` does not exist yet.

- [ ] **Step 2: Add Avatar implementation**

Create `packages/components/src/avatar/interface.ts` defining `AvatarSize`, `AvatarShape`, `AvatarProps`, `AvatarGroupProps`, and `AvatarComponent` with `Group` static property.

Create `packages/components/src/avatar/avatar.style.ts` with classes for base avatar, image, icon/string, sizes small/default/large, square, group wrapper, grouped overlap, and overflow avatar.

Create `packages/components/src/avatar/avatar.tsx` with `AvatarRoot`, `AvatarGroup`, and `export const Avatar = AvatarRoot as AvatarComponent`. Implementation must use `children(() => local.children)` so group can count children with `toArray()`, maintain an image error signal, derive inherited group size/shape through context, and render `+N` overflow when `maxCount` hides avatars.

Create `packages/components/src/avatar/index.ts`:

```ts
export * from './avatar'
export * from './interface'
```

- [ ] **Step 3: Run Avatar tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- avatar.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Add Avatar docs, exports, and commit**

Create `apps/docs/src/routes/components/avatar.tsx` with examples for sizes, shapes, image fallback, icon/text, and group overflow.

Modify registries with:

```ts
export * from './avatar'
```

```ts
  { path: '/components/avatar', label: 'Avatar' },
```

```ts
  {
    path: '/components/avatar',
    component: lazy(() => import('../routes/components/avatar')),
  },
```

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
git add packages/components/src/avatar packages/components/src/index.ts apps/docs/src/routes/components/avatar.tsx apps/docs/src/site/nav.ts apps/docs/src/site/routes.ts
git commit -m "feat(components): add avatar"
```

Expected: tests and typecheck pass; commit succeeds.

---

### Task 4: Add Empty

**Files:**
- Create: `packages/components/src/empty/interface.ts`
- Create: `packages/components/src/empty/empty.style.ts`
- Create: `packages/components/src/empty/empty.tsx`
- Create: `packages/components/src/empty/index.ts`
- Create: `apps/docs/src/routes/components/empty.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`
- Modify: `apps/docs/src/site/routes.ts`

- [ ] **Step 1: Add Empty implementation**

Create `packages/components/src/empty/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export interface EmptyProps extends JSX.HTMLAttributes<HTMLDivElement> {
  image?: JSX.Element | string
  imageStyle?: JSX.CSSProperties
  description?: JSX.Element
  children?: JSX.Element
}
```

Create `packages/components/src/empty/empty.style.ts` with base centered layout, image wrapper, inline SVG sizing, description typography, and footer spacing.

Create `packages/components/src/empty/empty.tsx` rendering a local default SVG placeholder when `image` is undefined, `img` when `typeof image === 'string'`, JSX otherwise, default description `No Data`, and children footer.

Create `packages/components/src/empty/index.ts`:

```ts
export * from './empty'
export * from './interface'
```

- [ ] **Step 2: Add Empty docs, exports, and commit**

Create docs for default empty state, custom image, and action button.

Modify registries with:

```ts
export * from './empty'
```

```ts
  { path: '/components/empty', label: 'Empty' },
```

```ts
  {
    path: '/components/empty',
    component: lazy(() => import('../routes/components/empty')),
  },
```

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
git add packages/components/src/empty packages/components/src/index.ts apps/docs/src/routes/components/empty.tsx apps/docs/src/site/nav.ts apps/docs/src/site/routes.ts
git commit -m "feat(components): add empty"
```

Expected: typecheck passes and commit succeeds.

---

### Task 5: Add Breadcrumb with tests

**Files:**
- Create: `packages/components/src/breadcrumb/interface.ts`
- Create: `packages/components/src/breadcrumb/breadcrumb.style.ts`
- Create: `packages/components/src/breadcrumb/breadcrumb.tsx`
- Create: `packages/components/src/breadcrumb/index.ts`
- Create: `packages/components/src/breadcrumb/breadcrumb.test.tsx`
- Create: `apps/docs/src/routes/components/breadcrumb.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`
- Modify: `apps/docs/src/site/routes.ts`

- [ ] **Step 1: Write Breadcrumb failing tests**

Create `packages/components/src/breadcrumb/breadcrumb.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Breadcrumb } from './breadcrumb'

describe('Breadcrumb', () => {
  it('renders items and marks the last item as current', () => {
    render(() => <Breadcrumb items={[{ title: 'Home', href: '/' }, { title: 'List' }]} />)
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByText('List')).toHaveAttribute('aria-current', 'page')
  })

  it('calls item onClick', () => {
    const onClick = vi.fn()
    render(() => <Breadcrumb items={[{ title: 'Home', onClick }, { title: 'Current' }]} />)
    fireEvent.click(screen.getByText('Home'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('supports manual item composition', () => {
    render(() => (
      <Breadcrumb separator=">">
        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
        <Breadcrumb.Item>Page</Breadcrumb.Item>
      </Breadcrumb>
    ))
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByText('Page')).toBeInTheDocument()
  })
})
```

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- breadcrumb.test.tsx
```

Expected: FAIL because `./breadcrumb` does not exist yet.

- [ ] **Step 2: Add Breadcrumb implementation**

Create `packages/components/src/breadcrumb/interface.ts` with `BreadcrumbItemType`, `BreadcrumbProps`, `BreadcrumbItemProps`, and `BreadcrumbComponent` containing static `Item`.

Create `packages/components/src/breadcrumb/breadcrumb.style.ts` with nav/ol/li layout, separator color, link hover, current item color, and clickable item button reset.

Create `packages/components/src/breadcrumb/breadcrumb.tsx` exporting `Breadcrumb` with an `items` path and a manual children path. Use `<nav aria-label="breadcrumb">`, ordered list semantics, `aria-current="page"` on the last text item, anchor for `href`, and `<span role="button" tabIndex={0}>` for click-only items with Enter/Space keyboard activation.

Create `packages/components/src/breadcrumb/index.ts`:

```ts
export * from './breadcrumb'
export * from './interface'
```

- [ ] **Step 3: Run Breadcrumb tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- breadcrumb.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Add Breadcrumb docs, exports, and commit**

Create docs for basic items, custom separator, clickable item, and manual composition.

Modify registries with:

```ts
export * from './breadcrumb'
```

```ts
  { path: '/components/breadcrumb', label: 'Breadcrumb' },
```

```ts
  {
    path: '/components/breadcrumb',
    component: lazy(() => import('../routes/components/breadcrumb')),
  },
```

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
git add packages/components/src/breadcrumb packages/components/src/index.ts apps/docs/src/routes/components/breadcrumb.tsx apps/docs/src/site/nav.ts apps/docs/src/site/routes.ts
git commit -m "feat(components): add breadcrumb"
```

Expected: tests and typecheck pass; commit succeeds.

---

### Task 6: Add Rate with tests

**Files:**
- Create: `packages/components/src/rate/interface.ts`
- Create: `packages/components/src/rate/rate.style.ts`
- Create: `packages/components/src/rate/rate.tsx`
- Create: `packages/components/src/rate/index.ts`
- Create: `packages/components/src/rate/rate.test.tsx`
- Create: `apps/docs/src/routes/components/rate.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`
- Modify: `apps/docs/src/site/routes.ts`

- [ ] **Step 1: Write Rate failing tests**

Create `packages/components/src/rate/rate.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Rate } from './rate'

describe('Rate', () => {
  it('supports uncontrolled changes and clear', () => {
    const onChange = vi.fn()
    render(() => <Rate defaultValue={2} onChange={onChange} />)
    const radios = screen.getAllByRole('radio')
    fireEvent.click(radios[3])
    expect(onChange).toHaveBeenLastCalledWith(4)
    fireEvent.click(radios[3])
    expect(onChange).toHaveBeenLastCalledWith(0)
  })

  it('supports controlled value', () => {
    function Demo() {
      const [value, setValue] = createSignal(1)
      return <Rate value={value()} onChange={setValue} />
    }
    render(() => <Demo />)
    const radios = screen.getAllByRole('radio')
    fireEvent.click(radios[4])
    expect(radios[4]).toHaveAttribute('aria-checked', 'true')
  })

  it('does not change when disabled', () => {
    const onChange = vi.fn()
    render(() => <Rate disabled defaultValue={2} onChange={onChange} />)
    fireEvent.click(screen.getAllByRole('radio')[4])
    expect(onChange).not.toHaveBeenCalled()
  })

  it('supports keyboard increment', () => {
    const onChange = vi.fn()
    render(() => <Rate defaultValue={2} onChange={onChange} />)
    const group = screen.getByRole('radiogroup')
    fireEvent.keyDown(group, { key: 'ArrowRight' })
    expect(onChange).toHaveBeenLastCalledWith(3)
  })
})
```

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- rate.test.tsx
```

Expected: FAIL because `./rate` does not exist yet.

- [ ] **Step 2: Add Rate implementation**

Create `packages/components/src/rate/interface.ts` defining `RateProps` with controlled/uncontrolled value, count, allowHalf, allowClear, disabled, character, tooltips, `onChange`, and `onHoverChange`.

Create `packages/components/src/rate/rate.style.ts` with base inline-flex list, item button reset, full/half/zero states, disabled cursor, focus outline, and star color transitions.

Create `packages/components/src/rate/rate.tsx` implementing value state, hover state, `getItemValue(index, event)` for half selection based on item bounding rect, click-to-clear, keyboard Home/End/ArrowLeft/ArrowDown/ArrowRight/ArrowUp handling, `role="radiogroup"`, per item `role="radio"`, `aria-checked`, and `aria-label`.

Create `packages/components/src/rate/index.ts`:

```ts
export * from './rate'
export * from './interface'
```

- [ ] **Step 3: Run Rate tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- rate.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Add Rate docs, exports, and commit**

Create docs for basic, half, clear disabled via `allowClear={false}`, controlled, custom character, and disabled examples.

Modify registries with:

```ts
export * from './rate'
```

```ts
  { path: '/components/rate', label: 'Rate' },
```

```ts
  {
    path: '/components/rate',
    component: lazy(() => import('../routes/components/rate')),
  },
```

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- rate.test.tsx
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
git add packages/components/src/rate packages/components/src/index.ts apps/docs/src/routes/components/rate.tsx apps/docs/src/site/nav.ts apps/docs/src/site/routes.ts
git commit -m "feat(components): add rate"
```

Expected: tests and typecheck pass; commit succeeds.

---

### Task 7: Final verification and cleanup

**Files:**
- Modify only if verification reveals formatting or type issues.

- [ ] **Step 1: Run full lint**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: exits `0`.

- [ ] **Step 2: Run format check**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: exits `0`. If it fails only due to formatting, run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format`, inspect the diff, and commit the formatting changes.

- [ ] **Step 3: Run typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: exits `0`.

- [ ] **Step 4: Run tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: exits `0`.

- [ ] **Step 5: Run build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: exits `0`.

- [ ] **Step 6: Commit verification fixes if needed**

If any fixes were required, run:

```bash
git add .
git commit -m "chore: verify component expansion phase 1"
```

Expected: commit succeeds. If no fixes were required and working tree is clean, skip this commit.

---

## Self-Review

- Spec coverage: `Divider`, `Card`, `Avatar`, `Empty`, `Breadcrumb`, and `Rate` are each represented by a source task, docs task, export/nav/route updates, and verification. Behavior-heavy components have explicit tests.
- Placeholder scan: The plan avoids `TBD` and deferred requirements. Implementation steps name concrete files, APIs, commands, and expected outcomes.
- Type consistency: Component prop names match the approved design: `orientation`, `dashed`, `plain`, `title`, `extra`, `cover`, `actions`, `maxCount`, `imageStyle`, `items`, `separator`, `allowHalf`, `allowClear`, `character`, and `tooltips`.
