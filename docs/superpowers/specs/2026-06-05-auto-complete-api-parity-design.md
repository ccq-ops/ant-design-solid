# AutoComplete API Parity Design

Date: 2026-06-05
Repository: `ant-design-solid`
Component: `packages/components/src/auto-complete`

## Scope

Implement the first four API parity groups for `AutoComplete`, compared with Ant Design's AutoComplete API:

1. Basic compatibility: `size`, `status`, `variant`, `onClear`, and object-form `allowClear`.
2. Search behavior: `showSearch`, `showSearch.onSearch`, `showSearch.filterOption`, while keeping top-level `filterOption` as legacy compatibility.
3. Popup capabilities: `notFoundContent`, `popupMatchSelectWidth`, `popupRender`, and `onPopupScroll`.
4. Keyboard interaction: `defaultActiveFirstOption`, `backfill`, `onInputKeyDown`, `ArrowUp` / `ArrowDown` navigation, `Enter` selection, and `Escape` close.

Explicitly out of scope for this change:

- custom input via `children`
- semantic `classNames` / `styles`
- imperative `focus()` / `blur()` methods
- virtual scrolling

## Current State

`AutoCompleteProps` currently supports the core controlled/uncontrolled value and open state, options, placeholder, disabled, boolean `allowClear`, legacy `filterOption`, popup container, and selection/open/value callbacks.

The implementation renders a root div, a selector div, an input, optional clear button, and a portal-hosted dropdown. Filtering, opening, selecting, clearing, and popup positioning are local to `auto-complete.tsx`.

## Recommended Approach

Use progressive enhancement of the existing `AutoComplete` implementation.

This keeps the change localized to `auto-complete` files, preserves current behavior for existing users, and avoids a larger Select-like abstraction that would touch unrelated components.

## Public API Design

Add these types to `interface.ts`:

```ts
export interface AutoCompleteAllowClear {
  clearIcon?: JSX.Element
}

export interface AutoCompleteShowSearch {
  filterOption?: boolean | ((inputValue: string, option: AutoCompleteOption) => boolean)
  onSearch?: (value: string) => void
}
```

Extend `AutoCompleteProps` with:

```ts
size?: 'small' | 'middle' | 'large'
status?: 'error' | 'warning'
variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
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

Keep the existing top-level `filterOption` prop as a legacy compatibility prop.

## Behavior Design

### Search and Filtering

- `showSearch.filterOption` has priority over top-level `filterOption`.
- If neither is provided, default filtering uses option value and text label.
- `filterOption={false}` or `showSearch={{ filterOption: false }}` disables filtering and shows all options.
- `showSearch.onSearch` fires when the user types into the input.
- Programmatic selection and clear should not call `showSearch.onSearch`; they should continue to call `onChange` as appropriate.

### Clear Button

- `allowClear={true}` keeps the existing close-circle icon.
- `allowClear={{ clearIcon }}` renders the provided icon.
- Clicking clear sets the value to an empty string, closes the dropdown, calls `onChange('')`, and calls `onClear()`.

### Popup Rendering

- `notFoundContent` renders inside the dropdown when the dropdown is open and filtering produces no options.
- If there are no options and no `notFoundContent`, the dropdown remains closed, matching Ant Design's empty-options behavior.
- `popupRender(originNode)` wraps or replaces the default dropdown node.
- `onPopupScroll` is attached to the default dropdown root.

### Popup Width

- `popupMatchSelectWidth` defaults to `true`.
- `true` or `undefined`: dropdown width equals selector width.
- `false`: dropdown does not force width.
- `number`: dropdown width is the maximum of selector width and the provided number.

### Keyboard Interaction

- `defaultActiveFirstOption` defaults to `true`.
- When dropdown opens and enabled options exist, active option becomes the first enabled option unless `defaultActiveFirstOption={false}`.
- `ArrowDown` opens the dropdown if closed, then moves active option to the next enabled option, wrapping at the end.
- `ArrowUp` opens the dropdown if closed, then moves active option to the previous enabled option, wrapping at the beginning.
- `Enter` selects the active option when the dropdown is open and an active enabled option exists.
- `Escape` closes the dropdown.
- `onInputKeyDown` is called for input keydown events before internal keyboard handling.
- Existing `onKeyDown` inherited from HTML attributes remains supported and is called before internal keyboard handling.
- With `backfill={true}`, keyboard navigation updates the displayed input value to the active option value. This follows the existing controlled/uncontrolled value path, so `onChange` fires when the backfilled value is applied.

## Styling Design

Add root class modifiers:

- `${prefixCls}-small`
- `${prefixCls}-middle`
- `${prefixCls}-large`
- `${prefixCls}-status-error`
- `${prefixCls}-status-warning`
- `${prefixCls}-outlined`
- `${prefixCls}-borderless`
- `${prefixCls}-filled`
- `${prefixCls}-underlined`

Add item modifier:

- `${prefixCls}-item-active`

Update `auto-complete.style.ts` for size, status, variant, active item, and empty content styling. Keep styles token-based and consistent with existing component style patterns.

## Testing Plan

Use TDD. Add failing tests before production changes in `packages/components/src/auto-complete/__tests__/auto-complete.test.tsx`.

Test behaviors:

1. `size`, `status`, and `variant` output their modifier classes.
2. `allowClear={{ clearIcon }}` renders a custom clear icon and clicking clear calls `onClear`.
3. `showSearch.onSearch` fires on user input.
4. `showSearch.filterOption` takes priority over top-level `filterOption`.
5. `notFoundContent` appears when no filtered options match.
6. `popupRender` wraps the dropdown.
7. `onPopupScroll` fires when the dropdown scrolls.
8. `ArrowDown`, `ArrowUp`, and `Enter` navigate and select enabled options.
9. `backfill` updates the input value while navigating by keyboard.
10. `defaultActiveFirstOption={false}` prevents Enter from selecting the first option immediately after opening.

## Verification

After implementation, run the repository verification commands required by `AGENTS.md`:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```
