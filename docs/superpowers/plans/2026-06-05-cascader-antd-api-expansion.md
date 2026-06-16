# Cascader Ant Design API Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor Cascader and implement requested Ant Design API groups P1, P2, and P3 first four items while preserving existing single-select behavior.

**Architecture:** Split Cascader into pure path/search/selection utilities plus selector and dropdown render components. Keep `cascader.tsx` as orchestration for controlled state, portal positioning, form integration, search, lazy loading, and multiple selection.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, existing cssinjs style registration.

---

## File Structure

- Modify `packages/components/src/cascader/interface.ts`: extend public API types for search, lazy loading, multiple, tags, and visual props.
- Create `packages/components/src/cascader/types.ts`: internal selected-path and search config types.
- Create `packages/components/src/cascader/path-utils.ts`: path keying, flattening, lookup, leaf collection, and display strategy helpers.
- Create `packages/components/src/cascader/search-utils.ts`: normalize `showSearch` and compute search results.
- Create `packages/components/src/cascader/selection-utils.ts`: normalize/toggle multiple value paths and compute checked states.
- Create `packages/components/src/cascader/cascader-selector.tsx`: render selector, prefix, search input, clear icon, single display, and multiple tags.
- Create `packages/components/src/cascader/cascader-dropdown.tsx`: render columns, search results, checkbox/loading states, and option activation callbacks.
- Modify `packages/components/src/cascader/cascader.tsx`: orchestrate state, use utility modules and child components.
- Modify `packages/components/src/cascader/cascader.style.ts`: add styles/classes for new API.
- Modify `packages/components/src/cascader/__tests__/cascader.test.tsx`: TDD coverage for each behavior.
- Modify `apps/docs/src/pages/components/cascader.tsx`: document new APIs and demos.

## Commands

Use these commands during implementation:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

If the filtered test command is unsupported by package scripts, use:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test -- cascader
```

---

### Task 1: Public Types and Pure Path Utilities

**Files:**

- Modify: `packages/components/src/cascader/interface.ts`
- Create: `packages/components/src/cascader/types.ts`
- Create: `packages/components/src/cascader/path-utils.ts`
- Test: `packages/components/src/cascader/__tests__/cascader.test.tsx`

- [ ] **Step 1: Write failing tests for path display strategy helpers**

Add tests near the top of `cascader.test.tsx` or create a new `path-utils.test.ts` if preferred. The test should import helpers directly and verify path behavior:

```ts
import { describe, expect, it } from 'vitest'
import {
  SHOW_CHILD,
  SHOW_PARENT,
  collectSelectableLeafPaths,
  filterDisplayedPaths,
  findOptionPath,
  pathKey,
} from '../path-utils'
import type { CascaderOption } from '../interface'

const strategyOptions: CascaderOption[] = [
  {
    label: 'Parent',
    value: 'parent',
    children: [
      { label: 'Child A', value: 'a' },
      { label: 'Child B', value: 'b', disabled: true },
      { label: 'Child C', value: 'c' },
    ],
  },
]

describe('cascader path utils', () => {
  it('finds option paths by value path', () => {
    expect(findOptionPath(strategyOptions, ['parent', 'a']).map((option) => option.value)).toEqual([
      'parent',
      'a',
    ])
  })

  it('collects selectable leaf paths and ignores disabled leaves', () => {
    expect(
      collectSelectableLeafPaths(strategyOptions[0]).map((path) =>
        pathKey(path.map((option) => option.value)),
      ),
    ).toEqual(['parent\u0000a', 'parent\u0000c'])
  })

  it('filters displayed paths using SHOW_PARENT and SHOW_CHILD', () => {
    const parent = findOptionPath(strategyOptions, ['parent'])
    const childA = findOptionPath(strategyOptions, ['parent', 'a'])
    const childC = findOptionPath(strategyOptions, ['parent', 'c'])

    expect(
      filterDisplayedPaths([childA, childC], SHOW_CHILD, strategyOptions).map((path) =>
        pathKey(path.map((option) => option.value)),
      ),
    ).toEqual(['parent\u0000a', 'parent\u0000c'])
    expect(
      filterDisplayedPaths([childA, childC], SHOW_PARENT, strategyOptions).map((path) =>
        pathKey(path.map((option) => option.value)),
      ),
    ).toEqual(['parent'])
    expect(
      filterDisplayedPaths([parent, childA], SHOW_PARENT, strategyOptions).map((path) =>
        pathKey(path.map((option) => option.value)),
      ),
    ).toEqual(['parent'])
  })
})
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
```

Expected: FAIL because `path-utils` and exported constants do not exist.

- [ ] **Step 3: Implement public and internal types plus path utilities**

Update `interface.ts` with explicit new public types:

```ts
import type { JSX } from 'solid-js'
import type { OptionValue } from '../shared/options'

export type CascaderShowCheckedStrategy = 'SHOW_PARENT' | 'SHOW_CHILD'
export type CascaderSize = 'large' | 'middle' | 'small'
export type CascaderStatus = 'error' | 'warning'
export type CascaderVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'

export interface CascaderOption {
  label: JSX.Element
  value: OptionValue
  disabled?: boolean
  children?: CascaderOption[]
  isLeaf?: boolean
  loading?: boolean
}

export interface CascaderShowSearch {
  filter?: (inputValue: string, path: CascaderOption[]) => boolean
  limit?: number | false
  matchInputWidth?: boolean
  render?: (inputValue: string, path: CascaderOption[]) => JSX.Element
  sort?: (a: CascaderOption[], b: CascaderOption[], inputValue: string) => number
  searchValue?: string
  onSearch?: (search: string) => void
  autoClearSearchValue?: boolean
  searchIcon?: JSX.Element
}

export interface CascaderSelectedPath {
  value: OptionValue[]
  options: CascaderOption[]
  label: JSX.Element
}

export interface CascaderProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onInput'
> {
  options?: CascaderOption[]
  value?: OptionValue[] | OptionValue[][]
  defaultValue?: OptionValue[] | OptionValue[][]
  open?: boolean
  defaultOpen?: boolean
  placeholder?: JSX.Element
  disabled?: boolean
  allowClear?: boolean | { clearIcon?: JSX.Element }
  changeOnSelect?: boolean
  expandTrigger?: 'click' | 'hover'
  displayRender?: (labels: JSX.Element[], selectedOptions: CascaderOption[]) => JSX.Element
  prefixCls?: string
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
  onChange?: (
    value: OptionValue[] | OptionValue[][],
    selectedOptions: CascaderOption[] | CascaderOption[][],
  ) => void
  onOpenChange?: (open: boolean) => void
  showSearch?: boolean | CascaderShowSearch
  searchValue?: string
  onSearch?: (search: string) => void
  loadData?: (selectedOptions: CascaderOption[]) => void | Promise<void>
  loadingIcon?: JSX.Element
  multiple?: boolean
  showCheckedStrategy?: CascaderShowCheckedStrategy
  tagRender?: (label: JSX.Element, onClose: () => void, value: OptionValue[]) => JSX.Element
  removeIcon?: JSX.Element
  maxTagCount?: number | 'responsive'
  maxTagPlaceholder?: JSX.Element | ((omittedValues: CascaderSelectedPath[]) => JSX.Element)
  maxTagTextLength?: number
  autoClearSearchValue?: boolean
  size?: CascaderSize
  status?: CascaderStatus
  variant?: CascaderVariant
  prefix?: JSX.Element
}
```

Create `types.ts`:

```ts
import type { JSX } from 'solid-js'
import type { OptionValue } from '../shared/options'
import type { CascaderOption, CascaderShowSearch } from './interface'

export interface CascaderPathEntity {
  value: OptionValue[]
  options: CascaderOption[]
  key: string
  label: JSX.Element
}

export interface NormalizedShowSearch {
  enabled: boolean
  filter: (inputValue: string, path: CascaderOption[]) => boolean
  limit: number | false
  matchInputWidth: boolean
  render?: (inputValue: string, path: CascaderOption[]) => JSX.Element
  sort?: (a: CascaderOption[], b: CascaderOption[], inputValue: string) => number
  searchValue?: string
  onSearch?: (search: string) => void
  autoClearSearchValue?: boolean
  searchIcon?: JSX.Element
}

export type ShowSearchInput = boolean | CascaderShowSearch | undefined
```

Create `path-utils.ts`:

```ts
import type { JSX } from 'solid-js'
import type { OptionValue } from '../shared/options'
import type { CascaderOption, CascaderShowCheckedStrategy } from './interface'
import type { CascaderPathEntity } from './types'

export const SHOW_PARENT = 'SHOW_PARENT' satisfies CascaderShowCheckedStrategy
export const SHOW_CHILD = 'SHOW_CHILD' satisfies CascaderShowCheckedStrategy

export function pathKey(valuePath: OptionValue[]): string {
  return valuePath.map(String).join('\u0000')
}

export function valuePathFromOptions(options: CascaderOption[]): OptionValue[] {
  return options.map((option) => option.value)
}

export function valuesEqual(a: OptionValue[], b: OptionValue[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

export function findOptionPath(
  options: CascaderOption[],
  valuePath: OptionValue[] = [],
): CascaderOption[] {
  const selectedOptions: CascaderOption[] = []
  let currentOptions = options

  for (const value of valuePath) {
    const option = currentOptions.find((item) => item.value === value)
    if (!option) break
    selectedOptions.push(option)
    currentOptions = option.children ?? []
  }

  return selectedOptions.length === valuePath.length ? selectedOptions : []
}

export function buildColumns(
  options: CascaderOption[],
  activeValuePath: OptionValue[],
): CascaderOption[][] {
  const columns: CascaderOption[][] = [options]
  let currentOptions = options

  for (const value of activeValuePath) {
    const option = currentOptions.find((item) => item.value === value)
    if (!option || option.disabled || !option.children?.length) break
    columns.push(option.children)
    currentOptions = option.children
  }

  return columns
}

export function optionHasChildren(option: CascaderOption): boolean {
  return Boolean(option.children?.length)
}

export function optionCanLoad(option: CascaderOption): boolean {
  return option.isLeaf === false && !option.children?.length
}

export function isSelectablePath(path: CascaderOption[], changeOnSelect: boolean): boolean {
  const last = path[path.length - 1]
  if (!last || last.disabled) return false
  return changeOnSelect || !last.children?.length || last.isLeaf === true
}

export function flattenOptionPaths(
  options: CascaderOption[],
  parent: CascaderOption[] = [],
): CascaderOption[][] {
  const paths: CascaderOption[][] = []
  for (const option of options) {
    const path = [...parent, option]
    paths.push(path)
    if (option.children?.length) paths.push(...flattenOptionPaths(option.children, path))
  }
  return paths
}

export function collectSelectableLeafPaths(option: CascaderOption): CascaderOption[][] {
  if (option.disabled) return []
  if (!option.children?.length) return [[option]]

  return option.children.flatMap((child) =>
    collectSelectableLeafPaths(child).map((path) => [option, ...path]),
  )
}

export function isAncestorValuePath(ancestor: OptionValue[], descendant: OptionValue[]): boolean {
  return (
    ancestor.length < descendant.length &&
    ancestor.every((value, index) => value === descendant[index])
  )
}

export function createPathEntity(path: CascaderOption[], label: JSX.Element): CascaderPathEntity {
  const value = valuePathFromOptions(path)
  return { value, options: path, key: pathKey(value), label }
}

function allSelectableLeavesSelected(
  parentPath: CascaderOption[],
  selectedKeys: Set<string>,
): boolean {
  const parent = parentPath[parentPath.length - 1]
  if (!parent) return false
  const leafPaths = collectSelectableLeafPaths(parent).map((leafPath) => [
    ...parentPath.slice(0, -1),
    ...leafPath,
  ])
  return (
    leafPaths.length > 0 &&
    leafPaths.every((path) => selectedKeys.has(pathKey(valuePathFromOptions(path))))
  )
}

export function filterDisplayedPaths(
  selectedPaths: CascaderOption[][],
  strategy: CascaderShowCheckedStrategy,
  rootOptions: CascaderOption[],
): CascaderOption[][] {
  if (strategy === SHOW_CHILD) {
    return selectedPaths.filter((path) => !path[path.length - 1]?.children?.length)
  }

  const selectedKeys = new Set(selectedPaths.map((path) => pathKey(valuePathFromOptions(path))))
  const allPaths = flattenOptionPaths(rootOptions)
  const display: CascaderOption[][] = []
  const hiddenKeys = new Set<string>()

  for (const path of allPaths) {
    const key = pathKey(valuePathFromOptions(path))
    if (hiddenKeys.has(key)) continue
    const selectedDirectly = selectedKeys.has(key)
    const selectedByChildren = allSelectableLeavesSelected(path, selectedKeys)
    if (!selectedDirectly && !selectedByChildren) continue

    display.push(path)
    for (const selectedPath of selectedPaths) {
      const selectedKey = pathKey(valuePathFromOptions(selectedPath))
      if (isAncestorValuePath(valuePathFromOptions(path), valuePathFromOptions(selectedPath))) {
        hiddenKeys.add(selectedKey)
      }
    }
  }

  return display
}
```

- [ ] **Step 4: Run tests and verify pass for utility tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
```

Expected: newly added path utility tests pass. Existing Cascader tests may fail at typecheck later only if imports conflict; fix import conflicts immediately.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/cascader/interface.ts packages/components/src/cascader/types.ts packages/components/src/cascader/path-utils.ts packages/components/src/cascader/__tests__/cascader.test.tsx
git commit -m "feat(cascader): add api types and path utilities"
```

---

### Task 2: Search Utilities and Single-Mode Search UI

**Files:**

- Create: `packages/components/src/cascader/search-utils.ts`
- Create: `packages/components/src/cascader/cascader-selector.tsx`
- Create: `packages/components/src/cascader/cascader-dropdown.tsx`
- Modify: `packages/components/src/cascader/cascader.tsx`
- Modify: `packages/components/src/cascader/cascader.style.ts`
- Test: `packages/components/src/cascader/__tests__/cascader.test.tsx`

- [ ] **Step 1: Write failing tests for search behavior**

Add tests:

```tsx
it('filters paths with showSearch and selects a search result', () => {
  const onChange = vi.fn()
  const result = render(() => <Cascader showSearch options={options} onChange={onChange} />)

  fireEvent.click(result.getByRole('combobox'))
  const input = screen.getByRole('textbox')
  fireEvent.input(input, { target: { value: 'west' } })

  expect(screen.getByRole('option', { name: 'Zhejiang / Hangzhou / West Lake' })).toBeTruthy()
  expect(screen.queryByRole('menuitem', { name: 'Jiangsu' })).toBeNull()

  fireEvent.click(screen.getByRole('option', { name: 'Zhejiang / Hangzhou / West Lake' }))

  expect(result.getByRole('combobox')).toHaveTextContent('Zhejiang / Hangzhou / West Lake')
  expect(onChange).toHaveBeenCalledWith(
    ['zhejiang', 'hangzhou', 'west-lake'],
    [options[0], options[0].children?.[0], options[0].children?.[0].children?.[0]],
  )
})

it('supports custom showSearch filter sort limit and render', () => {
  render(() => (
    <Cascader
      showSearch={{
        filter: (input, path) => path.some((option) => String(option.value).includes(input)),
        sort: (a, b) => String(b[b.length - 1].label).localeCompare(String(a[a.length - 1].label)),
        limit: 1,
        render: (_input, path) => <span>Result: {path[path.length - 1].label}</span>,
      }}
      options={options}
    />
  ))

  fireEvent.click(screen.getByRole('combobox'))
  fireEvent.input(screen.getByRole('textbox'), { target: { value: 'n' } })

  expect(screen.getByRole('option')).toHaveTextContent('Result: Ningbo')
  expect(screen.queryByText('Result: Nanjing')).toBeNull()
})

it('supports controlled searchValue and onSearch', () => {
  const [search, setSearch] = createSignal('west')
  const onSearch = vi.fn((next: string) => setSearch(next))
  render(() => <Cascader showSearch searchValue={search()} onSearch={onSearch} options={options} />)

  fireEvent.click(screen.getByRole('combobox'))
  expect(screen.getByRole('textbox')).toHaveValue('west')
  expect(screen.getByRole('option', { name: 'Zhejiang / Hangzhou / West Lake' })).toBeTruthy()

  fireEvent.input(screen.getByRole('textbox'), { target: { value: 'nan' } })

  expect(onSearch).toHaveBeenCalledWith('nan')
  expect(screen.getByRole('option', { name: 'Jiangsu / Nanjing' })).toBeTruthy()
})
```

- [ ] **Step 2: Run search tests and verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
```

Expected: FAIL because textbox/search result UI is not implemented.

- [ ] **Step 3: Implement `search-utils.ts`**

Create:

```ts
import type { JSX } from 'solid-js'
import type { CascaderOption } from './interface'
import { flattenOptionPaths } from './path-utils'
import type { NormalizedShowSearch, ShowSearchInput } from './types'

function defaultFilter(inputValue: string, path: CascaderOption[]): boolean {
  const normalized = inputValue.trim().toLowerCase()
  if (!normalized) return true
  return path.some((option) => String(option.label).toLowerCase().includes(normalized))
}

export function normalizeShowSearch(showSearch: ShowSearchInput): NormalizedShowSearch {
  if (!showSearch) {
    return {
      enabled: false,
      filter: defaultFilter,
      limit: 50,
      matchInputWidth: true,
    }
  }

  if (showSearch === true) {
    return {
      enabled: true,
      filter: defaultFilter,
      limit: 50,
      matchInputWidth: true,
    }
  }

  return {
    enabled: true,
    filter: showSearch.filter ?? defaultFilter,
    limit: showSearch.limit ?? 50,
    matchInputWidth: showSearch.matchInputWidth ?? true,
    render: showSearch.render,
    sort: showSearch.sort,
    searchValue: showSearch.searchValue,
    onSearch: showSearch.onSearch,
    autoClearSearchValue: showSearch.autoClearSearchValue,
    searchIcon: showSearch.searchIcon,
  }
}

export interface SearchResult {
  path: CascaderOption[]
  label: JSX.Element
}

export function pathLabel(path: CascaderOption[]): string {
  return path.map((option) => String(option.label)).join(' / ')
}

export function getSearchResults(
  options: CascaderOption[],
  inputValue: string,
  config: NormalizedShowSearch,
): SearchResult[] {
  if (!config.enabled) return []
  let paths = flattenOptionPaths(options).filter((path) => {
    const last = path[path.length - 1]
    return Boolean(last && !last.disabled && (!last.children?.length || last.isLeaf === true))
  })
  paths = paths.filter((path) => config.filter(inputValue, path))
  if (config.sort) paths = [...paths].sort((a, b) => config.sort!(a, b, inputValue))
  if (config.limit !== false) paths = paths.slice(0, config.limit)

  return paths.map((path) => ({
    path,
    label: config.render ? config.render(inputValue, path) : pathLabel(path),
  }))
}
```

- [ ] **Step 4: Extract selector/dropdown components and wire single search minimally**

Move current JSX into `cascader-selector.tsx` and `cascader-dropdown.tsx` while preserving current class names. The selector props must include `searchEnabled`, `searchValue`, `onSearchInput`, `prefix`, `allowClear`, `clearIcon`, and current display.

`cascader-selector.tsx` should render an `<input role="textbox">` when open and search is enabled. Use `onInput={(event) => props.onSearchInput(event.currentTarget.value)}`.

`cascader-dropdown.tsx` should render search results as:

```tsx
<ul role="listbox" class={`${prefixCls}-search-list`}>
  <For each={searchResults}>
    {(result) => (
      <li
        role="option"
        class={`${prefixCls}-search-item`}
        onClick={() => onSearchSelect(result.path)}
      >
        {result.label}
      </li>
    )}
  </For>
</ul>
```

In `cascader.tsx`, compute normalized search config, search state, and search results. Selecting a result should call existing single selection path logic and close popup.

- [ ] **Step 5: Run tests and verify search tests pass**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
```

Expected: all existing and new search tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/components/src/cascader/search-utils.ts packages/components/src/cascader/cascader-selector.tsx packages/components/src/cascader/cascader-dropdown.tsx packages/components/src/cascader/cascader.tsx packages/components/src/cascader/cascader.style.ts packages/components/src/cascader/__tests__/cascader.test.tsx
git commit -m "feat(cascader): add searchable single selection"
```

---

### Task 3: Lazy Loading

**Files:**

- Modify: `packages/components/src/cascader/cascader.tsx`
- Modify: `packages/components/src/cascader/cascader-dropdown.tsx`
- Modify: `packages/components/src/cascader/cascader.style.ts`
- Test: `packages/components/src/cascader/__tests__/cascader.test.tsx`

- [ ] **Step 1: Write failing lazy loading tests**

Add:

```tsx
it('calls loadData for non-leaf lazy options and shows loading icon while pending', async () => {
  let resolveLoad!: () => void
  const loadData = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        resolveLoad = resolve
      }),
  )
  const lazyOptions: CascaderOption[] = [{ label: 'Lazy', value: 'lazy', isLeaf: false }]

  render(() => (
    <Cascader options={lazyOptions} loadData={loadData} loadingIcon={<span>Loading...</span>} />
  ))

  fireEvent.click(screen.getByRole('combobox'))
  fireEvent.click(screen.getByRole('menuitem', { name: /Lazy/ }))

  expect(loadData).toHaveBeenCalledWith([lazyOptions[0]])
  expect(screen.getByText('Loading...')).toBeTruthy()

  resolveLoad()
  await Promise.resolve()

  expect(screen.queryByText('Loading...')).toBeNull()
})
```

- [ ] **Step 2: Run and verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
```

Expected: FAIL because `loadData` behavior is absent.

- [ ] **Step 3: Implement lazy loading orchestration**

In `cascader.tsx`:

- Maintain `loadingKeys = createSignal<Set<string>>(new Set())`.
- When activating an option, if `optionCanLoad(option)` and `local.loadData` exists:
  - Build selected option path.
  - Set active path.
  - Call `loadData(path)`.
  - If return is promise, add path key before await and remove in `finally`.
  - Do not call `onChange` for lazy parent unless `changeOnSelect` allows it.

Pass `isPathLoading(path)` and `loadingIcon` into dropdown.

In `cascader-dropdown.tsx`, show loading icon when path is loading or option.loading is true.

- [ ] **Step 4: Run and verify pass**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
```

Expected: lazy loading test and existing tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/cascader/cascader.tsx packages/components/src/cascader/cascader-dropdown.tsx packages/components/src/cascader/cascader.style.ts packages/components/src/cascader/__tests__/cascader.test.tsx
git commit -m "feat(cascader): support lazy loading options"
```

---

### Task 4: Multiple Selection Core and Checkbox Cascade

**Files:**

- Create: `packages/components/src/cascader/selection-utils.ts`
- Modify: `packages/components/src/cascader/cascader.tsx`
- Modify: `packages/components/src/cascader/cascader-dropdown.tsx`
- Modify: `packages/components/src/cascader/cascader.style.ts`
- Modify: `packages/components/src/cascader/index.ts`
- Test: `packages/components/src/cascader/__tests__/cascader.test.tsx`

- [ ] **Step 1: Write failing multiple tests**

Add:

```tsx
it('supports multiple leaf selection and deselection', () => {
  const onChange = vi.fn()
  render(() => <Cascader multiple options={options} onChange={onChange} />)

  fireEvent.click(screen.getByRole('combobox'))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Zhejiang' }))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Hangzhou' }))
  fireEvent.click(screen.getByRole('menuitem', { name: 'West Lake' }))

  expect(onChange).toHaveBeenLastCalledWith(
    [['zhejiang', 'hangzhou', 'west-lake']],
    [[options[0], options[0].children?.[0], options[0].children?.[0].children?.[0]]],
  )
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'true')

  fireEvent.click(screen.getByRole('menuitem', { name: 'West Lake' }))
  expect(onChange).toHaveBeenLastCalledWith([], [])
})

it('cascades parent selection to selectable leaf descendants and marks parent checked', () => {
  const onChange = vi.fn()
  render(() => <Cascader multiple options={options} onChange={onChange} />)

  fireEvent.click(screen.getByRole('combobox'))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Zhejiang' }))

  expect(onChange).toHaveBeenLastCalledWith(
    [['zhejiang', 'hangzhou', 'west-lake']],
    [[options[0], options[0].children?.[0], options[0].children?.[0].children?.[0]]],
  )
  expect(screen.getByRole('menuitem', { name: 'Zhejiang' })).toHaveAttribute('aria-checked', 'true')
})

it('marks parent indeterminate when only some descendants are selected', () => {
  render(() => (
    <Cascader multiple value={[['zhejiang', 'hangzhou', 'west-lake']]} options={options} />
  ))

  fireEvent.click(screen.getByRole('combobox'))

  expect(screen.getByRole('menuitem', { name: 'Zhejiang' })).toHaveAttribute(
    'data-indeterminate',
    'true',
  )
})
```

- [ ] **Step 2: Run and verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
```

Expected: FAIL because multiple mode is absent.

- [ ] **Step 3: Implement selection utilities**

Create `selection-utils.ts`:

```ts
import type { OptionValue } from '../shared/options'
import type { CascaderOption } from './interface'
import {
  collectSelectableLeafPaths,
  findOptionPath,
  pathKey,
  valuePathFromOptions,
} from './path-utils'

export function isMultipleValue(
  value: OptionValue[] | OptionValue[][] | undefined,
): value is OptionValue[][] {
  return Array.isArray(value?.[0])
}

export function normalizeMultipleValue(
  value: OptionValue[] | OptionValue[][] | undefined,
): OptionValue[][] {
  if (!value) return []
  return isMultipleValue(value) ? value : []
}

export function normalizeSingleValue(
  value: OptionValue[] | OptionValue[][] | undefined,
): OptionValue[] {
  if (!value || isMultipleValue(value)) return []
  return value
}

export function selectedOptionPaths(
  options: CascaderOption[],
  valuePaths: OptionValue[][],
): CascaderOption[][] {
  return valuePaths.map((path) => findOptionPath(options, path)).filter((path) => path.length > 0)
}

export function togglePathInMultipleValue(
  current: OptionValue[][],
  optionPath: CascaderOption[],
  changeOnSelect: boolean,
): OptionValue[][] {
  const target = optionPath[optionPath.length - 1]
  if (!target || target.disabled) return current

  const targetPaths =
    target.children?.length && !changeOnSelect
      ? collectSelectableLeafPaths(target).map((path) => [...optionPath.slice(0, -1), ...path])
      : [optionPath]

  const currentMap = new Map(current.map((path) => [pathKey(path), path]))
  const targetKeys = targetPaths.map((path) => pathKey(valuePathFromOptions(path)))
  const allSelected = targetKeys.length > 0 && targetKeys.every((key) => currentMap.has(key))

  for (const targetPath of targetPaths) {
    const valuePath = valuePathFromOptions(targetPath)
    const key = pathKey(valuePath)
    if (allSelected) currentMap.delete(key)
    else currentMap.set(key, valuePath)
  }

  return Array.from(currentMap.values())
}

export function getPathCheckState(
  selectedValuePaths: OptionValue[][],
  optionPath: CascaderOption[],
): { checked: boolean; indeterminate: boolean } {
  const selectedKeys = new Set(selectedValuePaths.map(pathKey))
  const ownKey = pathKey(valuePathFromOptions(optionPath))
  if (selectedKeys.has(ownKey)) return { checked: true, indeterminate: false }

  const target = optionPath[optionPath.length - 1]
  if (!target?.children?.length) return { checked: false, indeterminate: false }

  const leafPaths = collectSelectableLeafPaths(target).map((path) => [
    ...optionPath.slice(0, -1),
    ...path,
  ])
  const leafKeys = leafPaths.map((path) => pathKey(valuePathFromOptions(path)))
  const checkedCount = leafKeys.filter((key) => selectedKeys.has(key)).length

  return {
    checked: leafKeys.length > 0 && checkedCount === leafKeys.length,
    indeterminate: checkedCount > 0 && checkedCount < leafKeys.length,
  }
}
```

- [ ] **Step 4: Wire multiple state and checkbox UI**

In `cascader.tsx`:

- Use `normalizeSingleValue` for single mode and `normalizeMultipleValue` for multiple mode.
- Add separate internal default handling for multiple values.
- In multiple activation, call `togglePathInMultipleValue`, compute `selectedOptionPaths`, and call `onChange(nextValuePaths, nextSelectedOptionPaths)`.
- Do not close popup after multiple selection.
- Assign `Cascader.SHOW_PARENT = SHOW_PARENT` and `Cascader.SHOW_CHILD = SHOW_CHILD` before export or by casting function object.

In `cascader-dropdown.tsx`:

- Render checkbox span for multiple mode.
- Add `aria-checked` and `data-indeterminate` on menuitem.

- [ ] **Step 5: Run and verify pass**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
```

Expected: multiple core tests pass with existing tests.

- [ ] **Step 6: Commit**

```bash
git add packages/components/src/cascader/selection-utils.ts packages/components/src/cascader/cascader.tsx packages/components/src/cascader/cascader-dropdown.tsx packages/components/src/cascader/cascader.style.ts packages/components/src/cascader/index.ts packages/components/src/cascader/__tests__/cascader.test.tsx
git commit -m "feat(cascader): add multiple cascade selection"
```

---

### Task 5: Multiple Tags and Display Strategy

**Files:**

- Modify: `packages/components/src/cascader/cascader-selector.tsx`
- Modify: `packages/components/src/cascader/cascader.tsx`
- Modify: `packages/components/src/cascader/cascader.style.ts`
- Test: `packages/components/src/cascader/__tests__/cascader.test.tsx`

- [ ] **Step 1: Write failing tag tests**

Add:

```tsx
it('renders multiple tags with tagRender and removeIcon', () => {
  const onChange = vi.fn()
  render(() => (
    <Cascader
      multiple
      value={[
        ['zhejiang', 'hangzhou', 'west-lake'],
        ['jiangsu', 'nanjing'],
      ]}
      options={options}
      onChange={onChange}
      removeIcon={<span>remove</span>}
      tagRender={(label, onClose) => (
        <button type="button" onClick={onClose}>
          Custom {label}
        </button>
      )}
    />
  ))

  expect(
    screen.getByRole('button', { name: 'Custom Zhejiang / Hangzhou / West Lake' }),
  ).toBeTruthy()
  fireEvent.click(screen.getByRole('button', { name: 'Custom Zhejiang / Hangzhou / West Lake' }))

  expect(onChange).toHaveBeenCalledWith(
    [['jiangsu', 'nanjing']],
    [[options[1], options[1].children?.[0]]],
  )
})

it('supports maxTagCount maxTagPlaceholder and maxTagTextLength', () => {
  render(() => (
    <Cascader
      multiple
      value={[
        ['zhejiang', 'hangzhou', 'west-lake'],
        ['jiangsu', 'nanjing'],
      ]}
      options={options}
      maxTagCount={1}
      maxTagTextLength={8}
      maxTagPlaceholder={(omitted) => <span>+{omitted.length} more</span>}
    />
  ))

  expect(screen.getByText('Zhejiang…')).toBeTruthy()
  expect(screen.getByText('+1 more')).toBeTruthy()
  expect(screen.queryByText('Jiangsu / Nanjing')).toBeNull()
})

it('uses showCheckedStrategy to display parent or child tags', () => {
  const value = [['zhejiang', 'hangzhou', 'west-lake']]
  const parent = render(() => (
    <Cascader multiple value={value} options={options} showCheckedStrategy={Cascader.SHOW_PARENT} />
  ))
  expect(parent.getByText('Zhejiang')).toBeTruthy()
  cleanup()

  const child = render(() => (
    <Cascader multiple value={value} options={options} showCheckedStrategy={Cascader.SHOW_CHILD} />
  ))
  expect(child.getByText('Zhejiang / Hangzhou / West Lake')).toBeTruthy()
})
```

- [ ] **Step 2: Run and verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
```

Expected: FAIL because tags and strategy display are not implemented.

- [ ] **Step 3: Implement tag rendering**

In `cascader.tsx`, compute displayed selected paths:

- Convert multiple value paths to option paths with `selectedOptionPaths`.
- Apply `filterDisplayedPaths` with `local.showCheckedStrategy ?? SHOW_PARENT`.
- Convert to labels using `displayRender` fallback path label.
- Apply max tag count. Treat `'responsive'` as no limit for now because full responsive measurement is out of scope.

In `cascader-selector.tsx`:

- Render tags when `multiple`.
- Default tag markup should include a close button using `removeIcon`.
- If `tagRender` exists, call it with label, close callback, and value path.
- Apply `maxTagTextLength` to string labels by truncating to `${text.slice(0, max)}…`.

- [ ] **Step 4: Run and verify pass**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
```

Expected: tag tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/cascader/cascader-selector.tsx packages/components/src/cascader/cascader.tsx packages/components/src/cascader/cascader.style.ts packages/components/src/cascader/__tests__/cascader.test.tsx
git commit -m "feat(cascader): render multiple selection tags"
```

---

### Task 6: Multiple Search Auto-Clear and changeOnSelect Intermediate Paths

**Files:**

- Modify: `packages/components/src/cascader/cascader.tsx`
- Modify: `packages/components/src/cascader/selection-utils.ts`
- Test: `packages/components/src/cascader/__tests__/cascader.test.tsx`

- [ ] **Step 1: Write failing tests**

Add:

```tsx
it('clears multiple search after selection by default and preserves it when disabled', () => {
  const keep = render(() => (
    <Cascader multiple showSearch={{ autoClearSearchValue: false }} options={options} />
  ))

  fireEvent.click(keep.getByRole('combobox'))
  fireEvent.input(screen.getByRole('textbox'), { target: { value: 'west' } })
  fireEvent.click(screen.getByRole('option', { name: 'Zhejiang / Hangzhou / West Lake' }))
  expect(screen.getByRole('textbox')).toHaveValue('west')
  cleanup()

  const clear = render(() => <Cascader multiple showSearch options={options} />)
  fireEvent.click(clear.getByRole('combobox'))
  fireEvent.input(screen.getByRole('textbox'), { target: { value: 'west' } })
  fireEvent.click(screen.getByRole('option', { name: 'Zhejiang / Hangzhou / West Lake' }))
  expect(screen.getByRole('textbox')).toHaveValue('')
})

it('supports multiple changeOnSelect for intermediate paths', () => {
  const onChange = vi.fn()
  render(() => <Cascader multiple changeOnSelect options={options} onChange={onChange} />)

  fireEvent.click(screen.getByRole('combobox'))
  fireEvent.click(screen.getByRole('menuitem', { name: 'Zhejiang' }))

  expect(onChange).toHaveBeenLastCalledWith([['zhejiang']], [[options[0]]])
})
```

- [ ] **Step 2: Run and verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
```

Expected: FAIL if auto-clear or changeOnSelect intermediate behavior is incomplete.

- [ ] **Step 3: Implement behavior**

In `cascader.tsx`:

- For multiple search result selection, call multiple toggle and keep popup open.
- Compute auto-clear as `local.autoClearSearchValue ?? normalizedShowSearch.autoClearSearchValue ?? true` in multiple mode.
- Clear uncontrolled search state and call search callbacks with empty string when auto-clear is true.

In `selection-utils.ts`, ensure `togglePathInMultipleValue` uses `[optionPath]` for parent paths when `changeOnSelect` is true.

- [ ] **Step 4: Run and verify pass**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
```

Expected: tests pass.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/cascader/cascader.tsx packages/components/src/cascader/selection-utils.ts packages/components/src/cascader/__tests__/cascader.test.tsx
git commit -m "feat(cascader): complete multiple search behavior"
```

---

### Task 7: Size, Status, Variant, and Prefix

**Files:**

- Modify: `packages/components/src/cascader/cascader.tsx`
- Modify: `packages/components/src/cascader/cascader-selector.tsx`
- Modify: `packages/components/src/cascader/cascader.style.ts`
- Test: `packages/components/src/cascader/__tests__/cascader.test.tsx`

- [ ] **Step 1: Write failing visual API test**

Add:

```tsx
it('supports size status variant and prefix visual props', () => {
  const result = render(() => (
    <Cascader
      size="large"
      status="error"
      variant="filled"
      prefix={<span data-testid="prefix">Area</span>}
      options={options}
    />
  ))

  const root = result.container.querySelector('.ads-cascader')!
  expect(root).toHaveClass('ads-cascader-large')
  expect(root).toHaveClass('ads-cascader-status-error')
  expect(root).toHaveClass('ads-cascader-filled')
  expect(result.getByTestId('prefix')).toBeTruthy()
})
```

- [ ] **Step 2: Run and verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
```

Expected: FAIL because classes/prefix are absent.

- [ ] **Step 3: Implement visual API**

In root class list in `cascader.tsx`, add:

```ts
;`${prefixCls()}-${local.size ?? 'middle'}``${prefixCls()}-${local.variant ?? 'outlined'}`
local.status && `${prefixCls()}-status-${local.status}`
```

Pass `prefix` to selector and render:

```tsx
<Show when={props.prefix}>
  <span class={`${props.prefixCls}-prefix`}>{props.prefix}</span>
</Show>
```

In styles, add selectors for sizes, status border colors, and variants.

- [ ] **Step 4: Run and verify pass**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
```

Expected: visual test passes.

- [ ] **Step 5: Commit**

```bash
git add packages/components/src/cascader/cascader.tsx packages/components/src/cascader/cascader-selector.tsx packages/components/src/cascader/cascader.style.ts packages/components/src/cascader/__tests__/cascader.test.tsx
git commit -m "feat(cascader): add visual selector props"
```

---

### Task 8: Docs and Final Verification

**Files:**

- Modify: `apps/docs/src/pages/components/cascader.tsx`

- [ ] **Step 1: Update docs API table and examples**

Add rows for:

- `showSearch`
- `searchValue`
- `onSearch`
- `loadData`
- `loadingIcon`
- `multiple`
- `showCheckedStrategy`
- `tagRender`
- `removeIcon`
- `maxTagCount`
- `maxTagPlaceholder`
- `maxTagTextLength`
- `autoClearSearchValue`
- `size`
- `status`
- `variant`
- `prefix`
- `CascaderOption.isLeaf`
- `CascaderOption.loading`

Add demos for searchable, lazy, multiple, and visual props.

- [ ] **Step 2: Run focused tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
```

Expected: PASS.

- [ ] **Step 3: Run repository verification**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: all PASS.

- [ ] **Step 4: Commit docs and verification fixes**

```bash
git add apps/docs/src/pages/components/cascader.tsx
git commit -m "docs: update cascader api examples"
```

If verification required code fixes, include those files in the commit with message:

```bash
git add <fixed-files>
git commit -m "fix(cascader): resolve verification issues"
```

---

## Self-Review

Spec coverage:

- P1 is covered by Tasks 2 and 3.
- P2 is covered by Tasks 4, 5, and 6.
- P3 first four items are covered by Task 7.
- Docs and final verification are covered by Task 8.

No intentional placeholders remain. `maxTagCount="responsive"` is explicitly treated as no limit in this implementation because responsive measurement is not part of the approved scope details. All new files use kebab-case file names.
