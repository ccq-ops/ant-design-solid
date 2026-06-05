# Cascader Ant Design API Expansion Design

## Goal

Expand `packages/components/src/cascader` to support the requested Ant Design Cascader API groups:

- P1: `showSearch`, `loadData`, `Option.isLeaf`, `loadingIcon`
- P2: `multiple`, `showCheckedStrategy`, `tagRender`, `removeIcon`, `maxTagCount`, `maxTagPlaceholder`, `maxTagTextLength`, `autoClearSearchValue`
- P3 first four: `size`, `status`, `variant`, `prefix`

The implementation should preserve existing single-select behavior and tests while restructuring the component for maintainability.

## Architecture

Use an aggressive refactor that splits Cascader into pure logic utilities and focused render components.

Planned files:

- `packages/components/src/cascader/interface.ts`: public API types.
- `packages/components/src/cascader/types.ts`: internal normalized types and utility type aliases.
- `packages/components/src/cascader/path-utils.ts`: path lookup, path flattening, path keys, descendant and ancestor helpers, display strategy helpers.
- `packages/components/src/cascader/search-utils.ts`: showSearch option normalization and search result computation.
- `packages/components/src/cascader/selection-utils.ts`: single and multiple selection normalization, cascading selection, checked and indeterminate state.
- `packages/components/src/cascader/cascader-selector.tsx`: selector surface, prefix, placeholder, selected text, search input, clear button, and multiple tags.
- `packages/components/src/cascader/cascader-dropdown.tsx`: option columns, search results, checkbox state, loading state, and option activation.
- `packages/components/src/cascader/cascader.tsx`: controlled/uncontrolled state orchestration, form integration, lazy loading, portal positioning, and event wiring.
- `packages/components/src/cascader/cascader.style.ts`: styles for search, multiple, tags, loading, size, status, variant, and prefix.

File names must remain kebab-case.

## Public API

### Options

`CascaderOption` gains:

- `isLeaf?: boolean`: marks a lazy node as a leaf or non-leaf when children are not present.
- `loading?: boolean`: allows consumers to mark an option as loading.

Existing fields remain:

- `label: JSX.Element`
- `value: OptionValue`
- `disabled?: boolean`
- `children?: CascaderOption[]`

### Search

Add:

```ts
showSearch?: boolean | CascaderShowSearch
searchValue?: string
onSearch?: (search: string) => void
autoClearSearchValue?: boolean
```

`CascaderShowSearch` supports:

- `filter?: (inputValue: string, path: CascaderOption[]) => boolean`
- `limit?: number | false`
- `matchInputWidth?: boolean`
- `render?: (inputValue: string, path: CascaderOption[]) => JSX.Element`
- `sort?: (a: CascaderOption[], b: CascaderOption[], inputValue: string) => number`
- `searchValue?: string`
- `onSearch?: (search: string) => void`
- `autoClearSearchValue?: boolean`
- `searchIcon?: JSX.Element`

Search renders flat matching paths. Selecting a search result selects that whole path in single mode or toggles it in multiple mode. Search does not trigger lazy loading.

### Lazy Loading

Add:

```ts
loadData?: (selectedOptions: CascaderOption[]) => void | Promise<void>
loadingIcon?: JSX.Element
```

When an enabled option has no children and `isLeaf === false`, activation calls `loadData(selectedOptions)`. If the return value is a promise, the component tracks that path as loading until the promise settles. The dropdown shows `loadingIcon` or a default loading indicator for loading paths.

### Multiple Selection

Add:

```ts
multiple?: boolean
showCheckedStrategy?: CascaderShowCheckedStrategy
tagRender?: (label: JSX.Element, onClose: () => void, value: OptionValue[]) => JSX.Element
removeIcon?: JSX.Element
maxTagCount?: number | 'responsive'
maxTagPlaceholder?: JSX.Element | ((omittedValues: CascaderSelectedPath[]) => JSX.Element)
maxTagTextLength?: number
autoClearSearchValue?: boolean
```

Expose static constants:

```ts
Cascader.SHOW_PARENT
Cascader.SHOW_CHILD
```

Multiple mode value is `OptionValue[][]`; single mode value remains `OptionValue[]`. `onChange` accepts both shapes through a union signature.

Multiple behavior:

- Items render checkbox affordances.
- Selecting a leaf toggles that path.
- Selecting a parent cascades to selectable leaf descendants.
- Toggling a parent off removes selectable descendant leaf paths.
- Parent checkbox state supports checked and indeterminate.
- Popup stays open after selection.
- `changeOnSelect` allows non-leaf paths to be selected as paths as well as expanded.
- Disabled options and their disabled descendants are ignored by cascade operations.

`showCheckedStrategy` affects tag display:

- `SHOW_PARENT`: display a parent path when all selectable descendant leaves are selected.
- `SHOW_CHILD`: display selected leaf paths.

### Visual API

Add:

```ts
size?: 'large' | 'middle' | 'small'
status?: 'error' | 'warning'
variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
prefix?: JSX.Element
```

Classes should follow the existing prefix style:

- `${prefixCls()}-large`, `${prefixCls()}-middle`, `${prefixCls()}-small`
- `${prefixCls()}-status-error`, `${prefixCls()}-status-warning`
- `${prefixCls()}-outlined`, `${prefixCls()}-borderless`, `${prefixCls()}-filled`, `${prefixCls()}-underlined`
- `${prefixCls()}-prefix`

Default size is `middle`; default variant is `outlined`.

## Compatibility

Existing single-select tests must keep passing. Existing props keep their current runtime behavior unless explicitly extended:

- `value`, `defaultValue`, `onChange`, `open`, `defaultOpen`, `placeholder`, `disabled`, `allowClear`, `changeOnSelect`, `expandTrigger`, `displayRender`, `getPopupContainer`, `prefixCls`, `zIndex`, and `onOpenChange` remain supported.
- `allowClear` may be extended to accept `{ clearIcon?: JSX.Element }` because clear icon customization shares logic with tags.
- `fieldNames`, `popupRender`, `placement`, `classNames`, `styles`, and other P0/P4 APIs are intentionally outside this implementation.

## Error Handling

- Promise rejection from `loadData` clears internal loading state and does not crash the component.
- Search over empty options returns an empty result list.
- Controlled `searchValue` uses callbacks without mutating internal search state.
- Invalid controlled values that do not map to option paths render no selected label/tag for those paths.

## Testing

Use TDD. Extend `packages/components/src/cascader/__tests__/cascader.test.tsx` and add focused utility tests if useful.

Required coverage:

1. Existing single-select behavior remains green.
2. Search filters paths and supports custom `filter`, `sort`, `limit`, `render`, controlled `searchValue`, and `onSearch`.
3. Lazy nodes call `loadData`, display `loadingIcon` while pending, and clear loading after settlement.
4. Multiple selection toggles leaf paths and parent cascade selection.
5. Multiple parent checkbox exposes checked and indeterminate state.
6. `changeOnSelect` allows intermediate paths in multiple mode.
7. `tagRender`, `removeIcon`, `maxTagCount`, `maxTagPlaceholder`, and `maxTagTextLength` affect rendered tags.
8. `autoClearSearchValue` clears or preserves search text as configured.
9. `showCheckedStrategy` changes displayed tags.
10. `size`, `status`, `variant`, and `prefix` render expected classes and DOM.

## Documentation

Update the Cascader docs page API table and examples to include the new props and at least one example each for search, lazy loading, multiple, and visual variants.
