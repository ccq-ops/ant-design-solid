# TreeSelect Antd v6 Parity Design

## Goal

Rebuild `TreeSelect` around the existing `Tree` component and align its public API with antd v6 TreeSelect while preserving Solid conventions. The component should expose an antd-compatible surface, but use Solid names where React-specific names conflict with the framework, especially `class` instead of `className` in documentation.

## Scope

This work replaces the current lightweight TreeSelect design. Backward compatibility with the current internal implementation is not required beyond props that naturally overlap with antd TreeSelect, such as `treeData`, `value`, `defaultValue`, `open`, `defaultOpen`, `allowClear`, `getPopupContainer`, `onChange`, and `onOpenChange`.

The implementation should support:

- Single selection, multiple selection, and checkable tree selection.
- `TreeSelect.SHOW_ALL`, `TreeSelect.SHOW_PARENT`, and `TreeSelect.SHOW_CHILD`.
- `labelInValue`, including forced label output for `treeCheckStrictly`.
- Search through `showSearch` boolean/object form and the deprecated top-level search props.
- Tree expansion control through `treeExpandedKeys`, `treeDefaultExpandedKeys`, `treeDefaultExpandAll`, `treeExpandAction`, and `onTreeExpand`.
- Data schema mapping through `fieldNames` and `treeDataSimpleMode`.
- Node display customization through `treeTitleRender`, `treeNodeLabelProp`, `treeIcon`, `treeLine`, and `switcherIcon`.
- Popup customization through `popupRender`, `popupMatchSelectWidth`, `placement`, `notFoundContent`, `listHeight`, `virtual`, `onPopupScroll`, and deprecated popup prop aliases.
- Selector customization through `allowClear`, `prefix`, `suffixIcon`, `showArrow`, `size`, `status`, `variant`, `bordered`, `maxTagCount`, `maxTagPlaceholder`, `maxTagTextLength`, and `tagRender`.
- Semantic `classNames` and `styles`.
- `focus()` and `blur()` through `ref`.
- `TreeSelect.TreeNode` for antd API parity, implemented through the existing Tree node data collection pattern or an equivalent marker.

## API Shape

Type names should mirror the existing project style and antd concepts:

- `TreeSelectProps`
- `TreeSelectNode`
- `TreeSelectFieldNames`
- `TreeSelectValue`
- `TreeSelectLabeledValue`
- `TreeSelectSearchConfig`
- `TreeSelectRef`
- `TreeSelectChangeExtra`
- `TreeSelectSelectExtra`
- `TreeSelectSemanticClassNames`
- `TreeSelectSemanticStyles`

Solid-specific adjustments:

- Use `JSX.Element` for renderable values.
- Use `JSX.CSSProperties` for style objects.
- Document `class` as the root class prop. `classNames` remains the semantic slot API because that is the antd API name.
- Keep `className` out of docs examples. If inherited through broad DOM typing, it should not be the recommended path.
- Deprecated antd props remain accepted when practical and map to the current replacement props.

The main value model should accept raw values, arrays, labeled values, and arrays of labeled values. Raw values use the repository's `OptionValue` type.

`onChange` should follow antd semantics:

```ts
onChange?: (
  value: TreeSelectValue,
  label: JSX.Element | JSX.Element[] | undefined,
  extra: TreeSelectChangeExtra,
) => void
```

For Solid ergonomics, the `extra` object should include the selected node data and trigger metadata in a typed structure. It does not need to clone every rc-tree-select internal field, but it must expose enough information for common use: `triggerValue`, `triggerNode`, `selected`, `checked`, `checkedNodes`, `halfCheckedKeys`, and `allCheckedNodes` where applicable.

## Architecture

TreeSelect is a select-like wrapper that owns value state, search state, popup state, tag rendering, and output formatting. It renders the existing `Tree` component in its popup. It should not maintain a separate recursive tree renderer.

The TreeSelect-specific logic should be split into focused helper modules instead of growing `tree-select.tsx` into a large monolith:

- `interface.ts`: public types and constants.
- `tree-data-utils.ts`: field name mapping, simple mode conversion, flattening, node lookup, key/value helpers.
- `value-utils.ts`: single/multiple/checkable normalization, label output, checked strategy filtering, `labelInValue`.
- `search-utils.ts`: `showSearch` normalization and tree filtering.
- `tree-select.tsx`: component shell, controlled/uncontrolled state, event wiring, rendering.
- `tree-select.style.ts`: styles for selector, popup, tree integration, tags, variants, sizes, statuses, and semantic slots.

The wrapper maps TreeSelect props to Tree props:

- `treeData` -> normalized `Tree` data with `key` derived from value.
- `treeDefaultExpandedKeys` -> Tree `defaultExpandedKeys`.
- `treeExpandedKeys` -> Tree `expandedKeys`.
- `treeDefaultExpandAll` -> Tree `defaultExpandAll`.
- `treeExpandAction` -> Tree `expandAction`.
- `loadData` -> Tree `loadData`.
- `treeLoadedKeys` -> Tree `loadedKeys`.
- `treeCheckable` -> Tree `checkable`.
- `treeCheckStrictly` -> Tree `checkStrictly`.
- `treeIcon` -> Tree `showIcon`.
- `treeLine` -> Tree `showLine`.
- `switcherIcon` -> Tree `switcherIcon`.
- `treeTitleRender` -> Tree `titleRender`.
- `onTreeExpand` -> Tree `onExpand`.

## Data Flow

On each render, TreeSelect normalizes incoming tree data into a stable internal shape that contains:

- Original node data.
- Display title.
- Selection label.
- Value.
- Tree key.
- Parent key.
- Children.
- Disabled, selectable, checkable, disableCheckbox, and leaf flags.

Value state is controlled when `value` is present and uncontrolled otherwise. Form integration should match existing Select and Cascader behavior through `useFormItemControl`.

Selection flow:

1. Tree emits `onSelect` or `onCheck`.
2. TreeSelect computes the next normalized value according to mode.
3. TreeSelect formats output according to `labelInValue` and `treeCheckStrictly`.
4. TreeSelect calls `onSelect` for select gestures.
5. TreeSelect calls `onChange` when the public value changes.
6. In single non-checkable mode, the popup closes after selection.
7. In multiple or checkable mode, the popup remains open.

Search flow:

1. Selector shows an input when search is enabled and the popup is open, or when the component is in multiple/checkable mode and antd behavior expects searchable tags.
2. Search text is controlled by `searchValue` when provided, otherwise internal.
3. `filterTreeNode` controls matching. If omitted, the field named by `treeNodeFilterProp` is used, defaulting to `value`.
4. Filtering should keep matching nodes and ancestors needed to display the path.
5. `loadData` should not automatically run only because search filters a node.

## Error Handling And Edge Cases

Disabled TreeSelect cannot open or change value. Disabled nodes cannot be selected. Nodes with `selectable: false` can expand but not select. Nodes with `disableCheckbox` cannot be checked when checkable.

Duplicate values are unsupported, matching antd's uniqueness requirement. The implementation should use the first matching value for lookup and avoid throwing during render.

`treeDataSimpleMode` converts flat data into nested tree data. The default simple mode keys are `id`, `pId`, and `rootPId`; object form can override them.

`popupMatchSelectWidth={false}` should avoid forcing popup width. A numeric value should set popup width to that pixel value. The default should match the selector width.

Deprecated popup prop aliases should be merged with replacement props in the same precedence style used by existing `Select`: replacement props win when both are provided.

## Documentation

Update `apps/docs/src/pages/components/tree-select.mdx` with expanded examples:

- Basic single select.
- Multiple selection.
- Checkable tree.
- Check strategy.
- Search.
- Async loading.
- Controlled open/value/search.
- `fieldNames`.
- `treeDataSimpleMode`.
- Custom title, suffix icon, switcher icon, prefix, and clear icon.
- Size, status, and variant.
- Popup render and semantic `classNames/styles`.
- `labelInValue`.

Update the API tables to list antd v6-compatible props and mark deprecated aliases. The examples should use `class`, not `className`.

## Testing

Tests should be written before implementation changes for each capability group. Coverage must include:

- Single selection and close behavior.
- Controlled and uncontrolled value.
- `labelInValue`.
- Multiple mode tags, tag removal, and max tag behavior.
- `treeCheckable`, `treeCheckStrictly`, and all show checked strategies.
- Search matching, controlled search, search callbacks, and no-result content.
- Expansion props and `onTreeExpand`.
- `fieldNames`, `treeDataSimpleMode`, `treeTitleRender`, and `treeNodeLabelProp`.
- Popup placement, width matching, popup render, semantic classes/styles, and deprecated aliases.
- `allowClear` object form, `prefix`, `suffixIcon`, sizes, statuses, variants, and `bordered`.
- `loadData` and `treeLoadedKeys` mapping.
- `focus()` and `blur()` ref methods.
- Form integration.

Verification after implementation should run the component test file first, then the repository-required checks:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- tree-select
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```
