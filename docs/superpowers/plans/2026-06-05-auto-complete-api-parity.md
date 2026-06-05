# AutoComplete API Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Ant Design AutoComplete API parity groups 1-4 to the Solid `AutoComplete` component.

**Architecture:** Progressively enhance the existing `packages/components/src/auto-complete` implementation. Keep the root/input/dropdown structure, add typed props in `interface.ts`, extend state and event handling in `auto-complete.tsx`, and add token-based modifier styles in `auto-complete.style.ts`.

**Tech Stack:** SolidJS, TypeScript, Vitest, `@solidjs/testing-library`, repository scripts via `corepack pnpm`.

---

## File Structure

- Modify `packages/components/src/auto-complete/interface.ts`
  - Add new public API types and props.
  - Keep top-level `filterOption` for compatibility.
- Modify `packages/components/src/auto-complete/auto-complete.tsx`
  - Add API behavior: custom clear icon, search config, popup empty/render/scroll/width, keyboard active option and backfill.
- Modify `packages/components/src/auto-complete/auto-complete.style.ts`
  - Add size, status, variant, active item, and empty styles.
- Modify `packages/components/src/auto-complete/__tests__/auto-complete.test.tsx`
  - Add TDD tests for each new behavior.

## Implementation Tasks

### Task 1: Public API types and root modifier classes

**Files:**
- Modify: `packages/components/src/auto-complete/interface.ts`
- Modify: `packages/components/src/auto-complete/auto-complete.tsx`
- Modify: `packages/components/src/auto-complete/auto-complete.style.ts`
- Test: `packages/components/src/auto-complete/__tests__/auto-complete.test.tsx`

- [ ] **Step 1: Write the failing test**

Append this test inside `describe('AutoComplete', () => { ... })`:

```tsx
  it('applies size status and variant modifier classes', () => {
    const result = render(() => (
      <AutoComplete
        size="large"
        status="error"
        variant="filled"
        options={[{ value: 'alpha', label: 'Alpha' }]}
      />
    ))

    const root = result.container.querySelector('.ads-auto-complete') as HTMLElement
    expect(root).toHaveClass('ads-auto-complete-large')
    expect(root).toHaveClass('ads-auto-complete-status-error')
    expect(root).toHaveClass('ads-auto-complete-filled')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- auto-complete.test.tsx -t "applies size status and variant modifier classes"
```

Expected: FAIL because `size`, `status`, and `variant` props are not typed and/or classes are missing.

- [ ] **Step 3: Add public API types**

In `interface.ts`, add these exported types after `AutoCompleteOption`:

```ts
export type AutoCompleteSize = 'small' | 'middle' | 'large'
export type AutoCompleteStatus = 'error' | 'warning'
export type AutoCompleteVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'

export interface AutoCompleteAllowClear {
  clearIcon?: JSX.Element
}

export interface AutoCompleteShowSearch {
  filterOption?: boolean | ((inputValue: string, option: AutoCompleteOption) => boolean)
  onSearch?: (value: string) => void
}
```

Extend `AutoCompleteProps` with these properties:

```ts
  size?: AutoCompleteSize
  status?: AutoCompleteStatus
  variant?: AutoCompleteVariant
  allowClear?: boolean | AutoCompleteAllowClear
  showSearch?: true | AutoCompleteShowSearch
  defaultActiveFirstOption?: boolean
  backfill?: boolean
  notFoundContent?: JSX.Element
  popupMatchSelectWidth?: boolean | number
  popupRender?: (originNode: JSX.Element) => JSX.Element
  onClear?: () => void
  onInputKeyDown?: (event: KeyboardEvent) => void
  onPopupScroll?: (event: UIEvent) => void
```

Replace the existing `allowClear?: boolean` line with the new object-capable type.

- [ ] **Step 4: Add prop splitting and root classes**

In `auto-complete.tsx`, add these names to the `splitProps` local list:

```ts
    'size',
    'status',
    'variant',
    'showSearch',
    'defaultActiveFirstOption',
    'backfill',
    'notFoundContent',
    'popupMatchSelectWidth',
    'popupRender',
    'onClear',
    'onInputKeyDown',
    'onPopupScroll',
```

In the root `class={classNames(...)}` call, add:

```ts
        local.size && `${prefixCls()}-${local.size}`,
        local.status && `${prefixCls()}-status-${local.status}`,
        `${prefixCls()}-${local.variant ?? 'outlined'}`,
```

- [ ] **Step 5: Add minimal styles for modifiers**

In `auto-complete.style.ts`, add these style entries:

```ts
        [`.${prefixCls}-small .${prefixCls}-selector`]: {
          height: `${t.controlHeightSM}px`,
        },
        [`.${prefixCls}-large .${prefixCls}-selector`]: {
          height: `${t.controlHeightLG}px`,
        },
        [`.${prefixCls}-status-error .${prefixCls}-selector`]: {
          'border-color': t.colorError,
        },
        [`.${prefixCls}-status-warning .${prefixCls}-selector`]: {
          'border-color': t.colorWarning,
        },
        [`.${prefixCls}-borderless .${prefixCls}-selector`]: {
          borderColor: 'transparent',
        },
        [`.${prefixCls}-filled .${prefixCls}-selector`]: {
          background: t.colorFillAlter,
        },
        [`.${prefixCls}-underlined .${prefixCls}-selector`]: {
          borderTopColor: 'transparent',
          borderInlineEndColor: 'transparent',
          borderInlineStartColor: 'transparent',
          borderRadius: '0',
        },
```

- [ ] **Step 6: Run test to verify it passes**

Run the same focused test command. Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/components/src/auto-complete/interface.ts packages/components/src/auto-complete/auto-complete.tsx packages/components/src/auto-complete/auto-complete.style.ts packages/components/src/auto-complete/__tests__/auto-complete.test.tsx
git commit -m "feat: add auto complete visual api props"
```

### Task 2: Object allowClear and onClear

**Files:**
- Modify: `packages/components/src/auto-complete/auto-complete.tsx`
- Test: `packages/components/src/auto-complete/__tests__/auto-complete.test.tsx`

- [ ] **Step 1: Write the failing test**

Append inside the describe block:

```tsx
  it('supports object allowClear with custom icon and onClear callback', () => {
    const onChange = vi.fn()
    const onClear = vi.fn()
    const result = render(() => (
      <AutoComplete
        defaultValue="alpha"
        allowClear={{ clearIcon: <span data-testid="custom-clear">clear</span> }}
        options={options}
        onChange={onChange}
        onClear={onClear}
      />
    ))

    expect(result.getByTestId('custom-clear')).toBeTruthy()

    fireEvent.click(result.getByRole('button', { name: 'clear autocomplete' }))

    expect((result.getByRole('combobox') as HTMLInputElement).value).toBe('')
    expect(onChange).toHaveBeenLastCalledWith('')
    expect(onClear).toHaveBeenCalledTimes(1)
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- auto-complete.test.tsx -t "supports object allowClear"
```

Expected: FAIL because object `allowClear` is truthy but custom `clearIcon` and `onClear` are not implemented.

- [ ] **Step 3: Add helpers for clear support**

In `auto-complete.tsx`, add these helpers near `disabled`:

```ts
  const allowClear = () => Boolean(local.allowClear)
  const clearIcon = () =>
    typeof local.allowClear === 'object' && local.allowClear.clearIcon
      ? local.allowClear.clearIcon
      : <CloseCircleFilled />
```

- [ ] **Step 4: Update clear behavior and rendering**

In `clearValue`, after `setOpen(false)`, add:

```ts
    local.onClear?.()
```

Replace:

```tsx
        <Show when={local.allowClear && !disabled() && value()}>
```

with:

```tsx
        <Show when={allowClear() && !disabled() && value()}>
```

Replace:

```tsx
            <CloseCircleFilled />
```

with:

```tsx
            {clearIcon()}
```

- [ ] **Step 5: Run test to verify it passes**

Run the same focused test command. Expected: PASS.

- [ ] **Step 6: Run existing clear test**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- auto-complete.test.tsx -t "supports filterOption=false"
```

Expected: PASS, confirming boolean `allowClear` still works.

- [ ] **Step 7: Commit**

```bash
git add packages/components/src/auto-complete/auto-complete.tsx packages/components/src/auto-complete/__tests__/auto-complete.test.tsx
git commit -m "feat: support auto complete custom clear"
```

### Task 3: showSearch and filter priority

**Files:**
- Modify: `packages/components/src/auto-complete/auto-complete.tsx`
- Test: `packages/components/src/auto-complete/__tests__/auto-complete.test.tsx`

- [ ] **Step 1: Write the failing tests**

Append inside the describe block:

```tsx
  it('calls showSearch.onSearch when the user types', () => {
    const onSearch = vi.fn()
    const result = render(() => (
      <AutoComplete options={options} showSearch={{ onSearch }} />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.input(combobox, { target: { value: 'alp' } })

    expect(onSearch).toHaveBeenCalledWith('alp')
  })

  it('uses showSearch.filterOption before legacy filterOption', () => {
    const legacyFilter = vi.fn(() => false)
    const searchFilter = vi.fn((inputValue: string, option: { value: string }) =>
      option.value.includes(inputValue),
    )
    const result = render(() => (
      <AutoComplete
        options={options}
        filterOption={legacyFilter}
        showSearch={{ filterOption: searchFilter }}
      />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.input(combobox, { target: { value: 'alp' } })

    expect(screen.getByRole('option', { name: 'Alpha' })).toBeTruthy()
    expect(screen.queryByRole('option', { name: 'Beta' })).toBeNull()
    expect(searchFilter).toHaveBeenCalled()
    expect(legacyFilter).not.toHaveBeenCalled()
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- auto-complete.test.tsx -t "showSearch"
```

Expected: FAIL because `onSearch` is not called and `showSearch.filterOption` is not used.

- [ ] **Step 3: Add search config helpers**

In `auto-complete.tsx`, add near `value`:

```ts
  const showSearchConfig = () => (typeof local.showSearch === 'object' ? local.showSearch : undefined)
  const mergedFilterOption = () => showSearchConfig()?.filterOption ?? local.filterOption
```

Update `filteredOptions` so:

```ts
    const filter = local.filterOption
```

becomes:

```ts
    const filter = mergedFilterOption()
```

- [ ] **Step 4: Call onSearch during user input**

In `handleInput`, store the value and call search:

```ts
    const nextValue = event.currentTarget.value
    changeValue(nextValue)
    showSearchConfig()?.onSearch?.(nextValue)
    if (!disabled()) setOpen(true)
```

- [ ] **Step 5: Run tests to verify they pass**

Run the same focused test command. Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/components/src/auto-complete/auto-complete.tsx packages/components/src/auto-complete/__tests__/auto-complete.test.tsx
git commit -m "feat: add auto complete show search config"
```

### Task 4: notFoundContent, popupRender, popupMatchSelectWidth, and popup scroll

**Files:**
- Modify: `packages/components/src/auto-complete/auto-complete.tsx`
- Modify: `packages/components/src/auto-complete/auto-complete.style.ts`
- Test: `packages/components/src/auto-complete/__tests__/auto-complete.test.tsx`

- [ ] **Step 1: Write the failing tests**

Append inside the describe block:

```tsx
  it('renders notFoundContent when no filtered options match', () => {
    const result = render(() => (
      <AutoComplete options={options} notFoundContent={<span>No matches</span>} />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.input(combobox, { target: { value: 'zzz' } })

    expect(screen.getByRole('listbox')).toBeTruthy()
    expect(screen.getByText('No matches')).toBeTruthy()
  })

  it('wraps dropdown with popupRender and calls onPopupScroll', () => {
    const onPopupScroll = vi.fn()
    const result = render(() => (
      <AutoComplete
        options={options}
        popupRender={(originNode) => <section data-testid="popup-wrapper">{originNode}</section>}
        onPopupScroll={onPopupScroll}
      />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.input(combobox, { target: { value: 'a' } })

    expect(screen.getByTestId('popup-wrapper')).toBeTruthy()
    fireEvent.scroll(screen.getByRole('listbox'))
    expect(onPopupScroll).toHaveBeenCalledTimes(1)
  })
```

Add this top-level test after the existing portal positioning test:

```tsx
it('supports popupMatchSelectWidth options', () => {
  const result = render(() => (
    <AutoComplete
      popupMatchSelectWidth={250}
      zIndex={1310}
      options={[{ value: 'one', label: 'One' }]}
    />
  ))
  const selector = result.container.querySelector('.ads-auto-complete-selector') as HTMLElement
  const input = result.getByRole('combobox') as HTMLInputElement
  const rectSpy = vi.spyOn(selector, 'getBoundingClientRect').mockReturnValue({
    top: 10,
    bottom: 42,
    left: 20,
    right: 220,
    width: 200,
    height: 32,
    x: 20,
    y: 10,
    toJSON: () => ({}),
  } as DOMRect)

  fireEvent.input(input, { target: { value: 'o' } })

  expect((screen.getByRole('listbox') as HTMLElement).style.width).toBe('250px')
  rectSpy.mockRestore()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- auto-complete.test.tsx -t "notFoundContent|popupRender|popupMatchSelectWidth"
```

Expected: FAIL because these popup APIs are not implemented.

- [ ] **Step 3: Add popup visibility and width helpers**

In `auto-complete.tsx`, add:

```ts
  const hasNotFoundContent = () => local.notFoundContent !== undefined && local.notFoundContent !== null
  const hasPopupContent = () => filteredOptions().length > 0 || hasNotFoundContent()
```

Update `setOpen`:

```ts
    const normalizedOpen = nextOpen && hasPopupContent()
```

Update `updateDropdownPosition` width calculation:

```ts
    const matchWidth = local.popupMatchSelectWidth ?? true
    const width =
      typeof matchWidth === 'number'
        ? `${Math.max(rect.width, matchWidth)}px`
        : matchWidth === false
          ? undefined
          : `${rect.width}px`
    setDropdownPosition({
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      ...(width ? { width } : {}),
      'z-index': `${dropdownZIndex}`,
    })
```

- [ ] **Step 4: Add popup render node**

Before `return`, add:

```tsx
  const dropdownNode = () => (
    <div
      role="listbox"
      ref={(element) => {
        dropdownRef = element
      }}
      class={`${prefixCls()}-dropdown`}
      style={dropdownPosition()}
      onScroll={(event) => local.onPopupScroll?.(event)}
    >
      <Show
        when={filteredOptions().length > 0}
        fallback={<div class={`${prefixCls()}-empty`}>{local.notFoundContent}</div>}
      >
        <For each={filteredOptions()}>
          {(option) => (
            <div
              role="option"
              aria-disabled={Boolean(option.disabled)}
              class={classNames(
                `${prefixCls()}-item`,
                option.disabled && `${prefixCls()}-item-disabled`,
              )}
              onClick={() => selectOption(option)}
            >
              {option.label ?? option.value}
            </div>
          )}
        </For>
      </Show>
    </div>
  )

  const renderedDropdownNode = () => {
    const node = dropdownNode()
    return local.popupRender ? local.popupRender(node) : node
  }
```

Then replace the existing hard-coded dropdown `<div role="listbox">...</div>` inside `InternalPortal` with:

```tsx
          {renderedDropdownNode()}
```

- [ ] **Step 5: Add empty style**

In `auto-complete.style.ts`, add:

```ts
        [`.${prefixCls}-empty`]: {
          padding: `${t.paddingXS}px ${t.paddingSM}px`,
          color: t.colorTextDisabled,
        },
```

- [ ] **Step 6: Run tests to verify they pass**

Run the same focused test command. Expected: PASS.

- [ ] **Step 7: Run portal positioning regression test**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- auto-complete.test.tsx -t "renders dropdown in a portal"
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/components/src/auto-complete/auto-complete.tsx packages/components/src/auto-complete/auto-complete.style.ts packages/components/src/auto-complete/__tests__/auto-complete.test.tsx
git commit -m "feat: add auto complete popup customization"
```

### Task 5: Keyboard active option, navigation, backfill, and onInputKeyDown

**Files:**
- Modify: `packages/components/src/auto-complete/auto-complete.tsx`
- Modify: `packages/components/src/auto-complete/auto-complete.style.ts`
- Test: `packages/components/src/auto-complete/__tests__/auto-complete.test.tsx`

- [ ] **Step 1: Write the failing tests**

Append inside the describe block:

```tsx
  it('navigates enabled options with arrow keys and selects the active option with enter', () => {
    const onSelect = vi.fn()
    const result = render(() => <AutoComplete options={options} filterOption={false} onSelect={onSelect} />)
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.focus(combobox)
    fireEvent.keyDown(combobox, { key: 'ArrowDown' })
    fireEvent.keyDown(combobox, { key: 'ArrowDown' })
    fireEvent.keyDown(combobox, { key: 'Enter' })

    expect(combobox.value).toBe('beta')
    expect(onSelect).toHaveBeenCalledWith('beta', { label: 'Beta', value: 'beta' })
  })

  it('supports backfill while navigating with the keyboard', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <AutoComplete options={options} filterOption={false} backfill onChange={onChange} />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.focus(combobox)
    fireEvent.keyDown(combobox, { key: 'ArrowDown' })
    fireEvent.keyDown(combobox, { key: 'ArrowDown' })

    expect(combobox.value).toBe('beta')
    expect(onChange).toHaveBeenLastCalledWith('beta')
  })

  it('does not select the first option on enter when defaultActiveFirstOption is false', () => {
    const onSelect = vi.fn()
    const result = render(() => (
      <AutoComplete
        options={options}
        filterOption={false}
        defaultActiveFirstOption={false}
        onSelect={onSelect}
      />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.focus(combobox)
    fireEvent.keyDown(combobox, { key: 'Enter' })

    expect(onSelect).not.toHaveBeenCalled()
    expect(combobox.value).toBe('')
  })

  it('calls onInputKeyDown before internal keyboard handling', () => {
    const onInputKeyDown = vi.fn()
    const result = render(() => (
      <AutoComplete options={options} filterOption={false} onInputKeyDown={onInputKeyDown} />
    ))
    const combobox = result.getByRole('combobox') as HTMLInputElement

    fireEvent.focus(combobox)
    fireEvent.keyDown(combobox, { key: 'ArrowDown' })

    expect(onInputKeyDown).toHaveBeenCalledTimes(1)
  })
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- auto-complete.test.tsx -t "navigates enabled options|backfill|defaultActiveFirstOption|onInputKeyDown"
```

Expected: FAIL because active option navigation, backfill, and `onInputKeyDown` are not fully implemented.

- [ ] **Step 3: Add active state helpers**

In `auto-complete.tsx`, add after `inputFocused` state:

```ts
  const [activeValue, setActiveValue] = createSignal<string | undefined>()
```

Add helpers before `setOpen`:

```ts
  const defaultActiveFirstOption = () => local.defaultActiveFirstOption ?? true
  const activeOption = () => enabledOptions().find((option) => option.value === activeValue())

  function setDefaultActiveOption(): void {
    if (!defaultActiveFirstOption()) {
      setActiveValue(undefined)
      return
    }
    setActiveValue(enabledOptions()[0]?.value)
  }

  function moveActiveOption(offset: 1 | -1): void {
    const options = enabledOptions()
    if (options.length === 0) {
      setActiveValue(undefined)
      return
    }
    const currentIndex = options.findIndex((option) => option.value === activeValue())
    const nextIndex = currentIndex === -1 ? (offset === 1 ? 0 : options.length - 1) : (currentIndex + offset + options.length) % options.length
    const nextOption = options[nextIndex]
    setActiveValue(nextOption.value)
    if (local.backfill) changeValue(nextOption.value)
  }
```

- [ ] **Step 4: Keep active option synced when opening and filtering**

In `setOpen`, after `if (normalizedOpen) updateDropdownPosition()`, add:

```ts
    if (normalizedOpen) setDefaultActiveOption()
    else setActiveValue(undefined)
```

Add a `createEffect` after the popup listener effects:

```ts
  createEffect(() => {
    if (!open()) return
    if (activeOption()) return
    setDefaultActiveOption()
  })
```

- [ ] **Step 5: Update keyboard handling**

In input `onKeyDown`, after the existing inherited `onKeyDown` call, add:

```ts
            local.onInputKeyDown?.(event)
```

Replace the current Enter/Escape keyboard handling with:

```ts
            if (event.key === 'Escape') {
              setOpen(false)
              return
            }
            if (event.key === 'ArrowDown') {
              event.preventDefault()
              if (!open()) setOpen(true)
              moveActiveOption(1)
              return
            }
            if (event.key === 'ArrowUp') {
              event.preventDefault()
              if (!open()) setOpen(true)
              moveActiveOption(-1)
              return
            }
            if (event.key === 'Enter' && open()) {
              const option = activeOption()
              if (option) selectOption(option)
            }
```

- [ ] **Step 6: Mark active option in DOM**

In option rendering, add:

```ts
                    option.value === activeValue() && `${prefixCls()}-item-active`,
```

inside the `class={classNames(...)}` call for each option.

Also add:

```tsx
                  aria-selected={option.value === activeValue()}
```

- [ ] **Step 7: Add active style**

In `auto-complete.style.ts`, add:

```ts
        [`.${prefixCls}-item-active`]: { background: t.colorFillAlter },
```

- [ ] **Step 8: Run tests to verify they pass**

Run the same focused test command. Expected: PASS.

- [ ] **Step 9: Run existing keyboard regression test**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- auto-complete.test.tsx -t "supports filterOption=false"
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add packages/components/src/auto-complete/auto-complete.tsx packages/components/src/auto-complete/auto-complete.style.ts packages/components/src/auto-complete/__tests__/auto-complete.test.tsx
git commit -m "feat: add auto complete keyboard navigation"
```

### Task 6: Full verification and docs sanity

**Files:**
- Possibly modify: `apps/docs/src/pages/components/auto-complete.tsx` only if a type or lint issue requires it.

- [ ] **Step 1: Run auto-complete test file**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- auto-complete.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run required lint**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: exit code 0.

- [ ] **Step 3: Run required format check**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: exit code 0.

- [ ] **Step 4: Run required typecheck**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: exit code 0.

- [ ] **Step 5: Run required tests**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: exit code 0.

- [ ] **Step 6: Run required build**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: exit code 0.

- [ ] **Step 7: Commit any verification fixes**

If any formatting or type fixes were needed:

```bash
git add packages/components/src/auto-complete apps/docs/src/pages/components/auto-complete.tsx
git commit -m "chore: verify auto complete api parity"
```

If no files changed, do not create an empty commit.

## Self-Review

Spec coverage:

- Basic compatibility: Task 1 and Task 2.
- Search behavior: Task 3.
- Popup capabilities: Task 4.
- Keyboard interaction: Task 5.
- Full repository verification: Task 6.

Placeholder scan: no placeholder implementation steps are left. Each task includes exact files, code snippets, commands, expected failures, expected passes, and commit commands.

Type consistency: prop names match the design spec: `size`, `status`, `variant`, `allowClear`, `showSearch`, `defaultActiveFirstOption`, `backfill`, `notFoundContent`, `popupMatchSelectWidth`, `popupRender`, `onClear`, `onInputKeyDown`, and `onPopupScroll`.
