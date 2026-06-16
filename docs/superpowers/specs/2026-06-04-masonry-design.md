# Masonry Component Design

## Goal

Add an Ant Design 6 compatible `Masonry` component to `@solid-ant-design/core` and document it in the local docs app.

The component lays out variable-height cards/items in balanced columns, supports responsive column and gutter values, and exposes the API shape used by Ant Design's Masonry component.

## Scope

Implement:

- `Masonry` component exported from `@solid-ant-design/core`.
- Kebab-case files under `packages/components/src/masonry/`.
- Component tests for distribution, responsive values, custom render hooks, class/style slots, and dynamic updates.
- Docs page at `apps/docs/src/routes/components/masonry.tsx`.
- Nav entry for `/components/masonry`.

Out of scope:

- Virtual scrolling.
- Drag-and-drop sorting.
- Browser image preloading utilities.
- Pixel-perfect parity with React internals.

## Public API

```ts
export type MasonryResponsiveValue<T> = T | Partial<Record<MasonryBreakpoint, T>>
export type MasonryItemKey = string | number

export interface MasonryItem<T = unknown> {
  key?: MasonryItemKey
  [key: string]: unknown
}

export interface MasonryLayoutInfo<T = MasonryItem> {
  columns: number
  columnHeights: number[]
  items: MasonryLayoutItem<T>[]
}

export interface MasonryProps<T extends MasonryItem = MasonryItem> {
  prefixCls?: string
  class?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties | string
  columns?: MasonryResponsiveValue<number>
  gutter?: MasonryResponsiveValue<number | string>
  items?: T[]
  itemRender?: (item: T, index: number) => JSX.Element
  children?: JSX.Element
  fresh?: boolean
  classNames?: { item?: string }
  styles?: { item?: JSX.CSSProperties | string }
  onLayoutChange?: (info: MasonryLayoutInfo<T>) => void
}
```

Defaults:

- `columns`: `4`
- `gutter`: `16`

Responsive values use Ant Design breakpoint names: `xs`, `sm`, `md`, `lg`, `xl`, `xxl`. The active value is the largest matching breakpoint, with a fallback to the primitive/default value.

## Architecture

`Masonry` is implemented as a focused Solid component with three parts:

1. Prop normalization and responsive value resolution.
2. Item normalization from either `items` plus `itemRender`, or direct `children`.
3. DOM measurement and balanced column assignment.

The rendered structure is:

```html
<div class="ads-masonry">
  <div class="ads-masonry-column">
    <div class="ads-masonry-item">...</div>
  </div>
</div>
```

Columns are CSS grid tracks. Each column is a vertical flex stack. Items are assigned to the currently shortest measured column, preserving deterministic first-render distribution before measurements by using round-robin assignment.

The component uses `ResizeObserver` when available to recompute item heights after size/content changes. If `fresh` is `true`, it recomputes layout whenever the item list changes even if keys are stable. Without DOM APIs, it falls back to deterministic round-robin rendering so server-like/test environments remain safe.

## Data Flow

- `items` mode: each input item becomes a layout item keyed by `item.key` or its index.
- `children` mode: Solid children are converted to an array and keyed by index.
- Column count and gutter are resolved from current window width and responsive props.
- Layout assignment updates a signal of column buckets.
- `onLayoutChange` receives the active column count, per-column measured heights, and assigned layout items after each layout pass.

## Styling

Add `masonry.style.ts` using existing `useStyleRegister` patterns. Styles cover:

- Root display grid and custom CSS variable for gutter.
- Column vertical stacking.
- Item width and box sizing.
- No opinionated card appearance; examples compose with `Card`.

## Docs Examples

Provide examples:

1. Basic cards.
2. Responsive columns and gutter.
3. Image/gallery-style variable heights.
4. Dynamic updates showing `fresh` relayout.

Include an API list describing core props.

## Testing

Use TDD for implementation. Tests should verify:

- Default render creates four columns and distributes items.
- Numeric `columns` and `gutter` produce expected structure/styles.
- Responsive object values resolve from window width.
- `itemRender` receives item and index.
- `classNames.item` and `styles.item` are applied.
- `onLayoutChange` is called with layout info.
- Children mode works when `items` is omitted.

## Verification

After implementation run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```
