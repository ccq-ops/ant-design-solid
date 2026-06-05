# Cascader antd P1/P2/P3 API Design

## Goal

Expand `packages/components/src/cascader` to cover the requested antd Cascader API gaps:

- P1: `showSearch`, `loadData`, `Option.isLeaf`, `loadingIcon`.
- P2: `multiple`, `showCheckedStrategy`, `tagRender`, `removeIcon`, `maxTagCount`, `maxTagPlaceholder`, `maxTagTextLength`, `autoClearSearchValue`.
- P3 first four: `size`, `status`, `variant`, `prefix`.

The implementation must preserve existing single-select behavior and existing tests.

## Current Context

The current Cascader implementation lives in:

- `packages/components/src/cascader/interface.ts`
- `packages/components/src/cascader/cascader.tsx`
- `packages/components/src/cascader/cascader.style.ts`
- `packages/components/src/cascader/__tests__/cascader.test.tsx`

It currently supports a single selected path, controlled/uncontrolled `value`, controlled/uncontrolled `open`, `allowClear`, `changeOnSelect`, `expandTrigger`, `displayRender`, `getPopupContainer`, Form integration, and portal positioning.

## API Surface

### Option API

Extend `CascaderOption` with:

```ts
isLeaf?: boolean
loading?: boolean
```

`isLeaf: false` marks an option without `children` as expandable and eligible for `loadData`.

### Value API

Single select remains:

```ts
value?: OptionValue[]
defaultValue?: OptionValue[]
onChange?: (value: OptionValue[], selectedOptions: CascaderOption[]) => void
```

When `multiple` is true, the component accepts and emits:

```ts
value?: OptionValue[][]
defaultValue?: OptionValue[][]
onChange?: (value: OptionValue[][], selectedOptions: CascaderOption[][]) => void
```

The TypeScript type will be a union/flexible type so existing single-select consumers continue compiling.

### Search API

Add:

```ts
showSearch?: boolean | CascaderShowSearchConfig
autoClearSearchValue?: boolean
```

`CascaderShowSearchConfig` supports:

```ts
autoClearSearchValue?: boolean
filter?: (inputValue: string, path: CascaderOption[]) => boolean
limit?: number | false
matchInputWidth?: boolean
render?: (inputValue: string, path: CascaderOption[]) => JSX.Element
sort?: (a: CascaderOption[], b: CascaderOption[], inputValue: string) => number
searchValue?: string
onSearch?: (search: string) => void
```

Search behavior:

- Search is enabled when `showSearch` is truthy.
- Searching flattens currently loaded local options into selectable paths.
- Default filter matches option labels by string inclusion, case-insensitive.
- Default limit is 50.
- `limit={false}` disables limiting.
- Controlled `searchValue` is honored when provided through the showSearch config.
- `onSearch` fires when the search input changes.
- In single mode, selecting a search result commits the path and closes the popup.
- In multiple mode, selecting a search result toggles that path and keeps the popup open.
- Search does not call `loadData` for unloaded branches.

### Lazy Loading API

Add:

```ts
loadData?: (selectedOptions: CascaderOption[]) => void | Promise<void>
loadingIcon?: JSX.Element
```

Behavior:

- When activating an option with no children and `isLeaf === false`, call `loadData(selectedOptions)` instead of selecting it as a leaf.
- If `loadData` returns a Promise, maintain internal loading state keyed by selected value path until it settles.
- While loading, render `loadingIcon` when provided; otherwise render a simple fallback loading marker.
- If users set `option.loading`, it is also reflected in the UI.

### Multiple API

Add:

```ts
multiple?: boolean
showCheckedStrategy?: typeof Cascader.SHOW_PARENT | typeof Cascader.SHOW_CHILD
tagRender?: (props: CascaderTagRenderProps) => JSX.Element
removeIcon?: JSX.Element
maxTagCount?: number | 'responsive'
maxTagPlaceholder?: JSX.Element | ((omittedValues: CascaderSelectedPath[]) => JSX.Element)
maxTagTextLength?: number
```

`responsive` will be accepted for type/API compatibility, but initially behaves like no numeric limit because real responsive measurement is out of scope.

Multi-select behavior is path-level, as approved:

- Clicking a selectable path toggles that exact path.
- Selecting a parent does not automatically select children.
- There is no checkbox half-selected parent/child cascade model.
- `changeOnSelect` allows non-leaf paths to be toggled.
- Without `changeOnSelect`, only leaf paths are selectable.
- Popup remains open after toggling in multiple mode.

`showCheckedStrategy` affects displayed tags only:

- `SHOW_PARENT`: if a selected parent path and selected child paths both exist, display the parent and omit descendant tags.
- `SHOW_CHILD`: display deepest selected paths; if a selected path has a selected descendant, omit the ancestor.

### Visual API

Add:

```ts
size?: 'large' | 'middle' | 'medium' | 'small'
status?: 'error' | 'warning'
variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
prefix?: JSX.Element
```

Behavior:

- `medium` is accepted as an alias of `middle` for compatibility with the earlier comparison notes.
- Classes are added for each visual state:
  - `${prefixCls}-lg`, `${prefixCls}-sm`, `${prefixCls}-middle`
  - `${prefixCls}-status-error`, `${prefixCls}-status-warning`
  - `${prefixCls}-${variant}`
- `prefix` renders before selected text/search input/tags inside the selector.

## Architecture

Use a focused helper module to keep `cascader.tsx` understandable:

- `interface.ts`: public types and constants-related types.
- `utils.ts`: pure path utilities for equality, serialization, flattening, search filtering, display strategy, and text conversion.
- `cascader.tsx`: state management, event handling, rendering.
- `cascader.style.ts`: CSS for search input, multi tags, loading icon, size/status/variant/prefix states.

This keeps complex path manipulation testable without DOM coupling.

## Error Handling and Edge Cases

- Invalid controlled value paths are ignored for display, matching current behavior.
- `loadData` rejection clears internal loading state and does not commit selection.
- `allowClear` clears `[]` in single mode and `[]` in multiple mode; the shape is distinguishable by `multiple` and `onChange` typing.
- Disabled options cannot be selected, toggled, or lazy-loaded.
- Search result selection respects disabled options by excluding disabled terminal paths.
- Existing Form integration continues using `value` and `onChange` triggers; in multiple mode Form stores `OptionValue[][]`.

## Testing

Extend `packages/components/src/cascader/__tests__/cascader.test.tsx` using TDD. Required coverage:

1. Search filters paths with default filter.
2. Search supports custom `filter`, `sort`, `limit`, and `render`.
3. Controlled `searchValue` and `onSearch` work.
4. Lazy `loadData` triggers for `isLeaf: false` and shows loading icon for Promise results.
5. Multiple mode toggles path values and emits `OptionValue[][]`.
6. Multiple mode keeps popup open after selection.
7. `showCheckedStrategy` changes displayed tags.
8. `tagRender`, `removeIcon`, `maxTagCount`, `maxTagPlaceholder`, and `maxTagTextLength` affect tag display/removal.
9. `autoClearSearchValue` clears search after multi-select by default and preserves it when disabled.
10. `size`, `status`, `variant`, and `prefix` render expected classes/content.
11. Existing single-select tests remain green.

## Verification

After implementation, run the repository-required commands from AGENTS.md:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```
