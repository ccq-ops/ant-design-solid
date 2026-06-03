# Data Entry Phase 6 Design

Date: 2026-06-03

## Goal

Expand `@ant-design-solid/core` with three practical Ant Design-style data entry components:

1. `AutoComplete`
2. `TreeSelect`
3. `Transfer`

This phase continues the recent data-entry work after `InputNumber` and `Cascader`. The goal is useful MVP behavior that follows existing repository patterns rather than full Ant Design parity.

## Existing Patterns To Follow

Each component uses the established component folder layout:

```text
packages/components/src/<component>/
  index.ts
  interface.ts
  <component>.tsx
  <component>.style.ts
  __tests__/<component>.test.tsx
```

Each component gets a docs page:

```text
apps/docs/src/routes/components/<component>.tsx
```

Shared exports and docs navigation are updated in:

```text
packages/components/src/index.ts
apps/docs/src/site/nav.ts
```

Docs routes are auto-discovered by `apps/docs/src/site/routes.ts`; this file should not be edited. All TypeScript source filenames must remain lowercase kebab-case.

## Component Designs

### AutoComplete

`AutoComplete` combines text input with selectable suggestions.

#### Supported API

- `value?: string`
- `defaultValue?: string`
- `open?: boolean`
- `defaultOpen?: boolean`
- `options?: AutoCompleteOption[]`
- `placeholder?: string`
- `disabled?: boolean`
- `allowClear?: boolean`
- `filterOption?: boolean | ((inputValue: string, option: AutoCompleteOption) => boolean)`, default `true`
- `prefixCls?: string`
- `onChange?: (value: string) => void`
- `onSelect?: (value: string, option: AutoCompleteOption) => void`
- `onOpenChange?: (open: boolean) => void`
- common wrapper `div` HTML attributes where practical

```ts
interface AutoCompleteOption {
  label?: JSX.Element
  value: string
  disabled?: boolean
}
```

#### Behavior

- Supports controlled and uncontrolled text value modes.
- Supports controlled and uncontrolled open modes.
- Typing updates the value and opens the dropdown when there are enabled matching options.
- `filterOption=true` performs case-insensitive substring matching against option value and string labels.
- `filterOption=false` shows all options.
- Function `filterOption` delegates matching to the user function.
- Selecting an enabled option commits its value, calls `onSelect`, calls `onChange`, and closes the dropdown.
- Disabled options render but cannot be selected.
- `allowClear` clears the value, calls `onChange('')`, and keeps the control usable.
- `Escape` closes the dropdown.
- `Enter` selects the first enabled visible option while open.
- Integrates with existing `Form.Item` through value and `onChange` semantics.
- Uses `${config.prefixCls()}-auto-complete` by default and supports custom prefixing.

### TreeSelect

`TreeSelect` selects a value from hierarchical tree data.

#### Supported API

- `treeData?: TreeSelectNode[]`
- `value?: OptionValue`
- `defaultValue?: OptionValue`
- `open?: boolean`
- `defaultOpen?: boolean`
- `placeholder?: JSX.Element`
- `disabled?: boolean`
- `allowClear?: boolean`
- `defaultExpandedKeys?: OptionValue[]`
- `prefixCls?: string`
- `onChange?: (value: OptionValue | undefined, node: TreeSelectNode | undefined) => void`
- `onOpenChange?: (open: boolean) => void`
- common wrapper `div` HTML attributes where practical

```ts
interface TreeSelectNode {
  title: JSX.Element
  value: OptionValue
  disabled?: boolean
  children?: TreeSelectNode[]
}
```

#### Behavior

- Supports controlled and uncontrolled value modes.
- Supports controlled and uncontrolled open modes.
- Renders selected node title in the selector; otherwise renders `placeholder`.
- Opening the dropdown renders visible tree nodes.
- Nodes with children can be expanded/collapsed through an expand button.
- `defaultExpandedKeys` controls initial expanded nodes.
- Selecting an enabled node commits its value and node, calls `onChange`, and closes the dropdown.
- Disabled nodes cannot be selected, but their expand button remains usable when they have children.
- `allowClear` clears the selected value and calls `onChange(undefined, undefined)`.
- `Escape` closes the dropdown.
- `Enter` while open selects the first enabled visible node.
- Integrates with existing `Form.Item` through value and `onChange` semantics.
- Uses `${config.prefixCls()}-tree-select` by default and supports custom prefixing.

### Transfer

`Transfer` moves items between source and target lists.

#### Supported API

- `dataSource?: TransferItem[]`
- `targetKeys?: string[]`
- `defaultTargetKeys?: string[]`
- `selectedKeys?: string[]`
- `defaultSelectedKeys?: string[]`
- `disabled?: boolean`
- `showSearch?: boolean`
- `titles?: [JSX.Element, JSX.Element]`
- `operations?: [JSX.Element, JSX.Element]`
- `filterOption?: (inputValue: string, item: TransferItem) => boolean`
- `prefixCls?: string`
- `onChange?: (targetKeys: string[], direction: TransferDirection, moveKeys: string[]) => void`
- `onSelectChange?: (sourceSelectedKeys: string[], targetSelectedKeys: string[]) => void`
- common wrapper `div` HTML attributes where practical

```ts
interface TransferItem {
  key: string
  title: JSX.Element
  description?: JSX.Element
  disabled?: boolean
}

type TransferDirection = 'left' | 'right'
```

#### Behavior

- Supports controlled and uncontrolled target keys.
- Supports controlled and uncontrolled selected keys.
- Source list contains items whose key is not in target keys; target list contains selected target keys in data-source order.
- Clicking an enabled item toggles its selected state in its current list and calls `onSelectChange`.
- Move-right transfers selected enabled source keys into target keys and clears those selected keys.
- Move-left removes selected enabled target keys from target keys and clears those selected keys.
- Move operations call `onChange(nextTargetKeys, direction, moveKeys)`.
- `showSearch` renders source and target search inputs.
- Search filters each panel independently. Default search matches string title text and description text.
- Disabled Transfer prevents selection and moving.
- Disabled items render but cannot be selected or moved.
- Uses `${config.prefixCls()}-transfer` by default and supports custom prefixing.

## Styling Approach

Use the existing `@ant-design-solid/cssinjs` registration pattern and `useToken()`.

Class prefixes:

- `${prefix}-auto-complete`
- `${prefix}-tree-select`
- `${prefix}-transfer`

Styles should align visually with existing `Select`, `Cascader`, `Input`, and list-like components: bordered selectors, compact dropdowns, disabled state, selected state, and token-derived spacing/colors.

## Documentation

Add docs routes:

```text
apps/docs/src/routes/components/auto-complete.tsx
apps/docs/src/routes/components/tree-select.tsx
apps/docs/src/routes/components/transfer.tsx
```

Docs navigation should place these near data-entry controls: after `Cascader` for `AutoComplete`/`TreeSelect`, and after `Upload` for `Transfer`.

## Testing

### AutoComplete Tests

- Renders placeholder and filters options while typing.
- Selects an option and calls `onSelect`/`onChange`.
- Supports controlled value and controlled open.
- Supports `filterOption=false`, disabled options, clear, keyboard Enter/Escape.
- Supports custom prefix and `ConfigProvider` prefix.
- Integrates with `Form.Item` value semantics.

### TreeSelect Tests

- Renders placeholder and opens tree dropdown.
- Expands nested nodes and selects a child.
- Supports `defaultExpandedKeys`.
- Supports controlled value and controlled open.
- Supports disabled nodes, clear, keyboard Enter/Escape.
- Supports custom prefix and `ConfigProvider` prefix.
- Integrates with `Form.Item` value semantics.

### Transfer Tests

- Renders source/target panels and default titles.
- Selects source items and moves them right.
- Selects target items and moves them left.
- Supports controlled target keys and selected keys.
- Supports search and custom titles/operations.
- Ignores disabled component/item interactions.
- Supports custom prefix and `ConfigProvider` prefix.

## Verification

Run after implementation:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```
