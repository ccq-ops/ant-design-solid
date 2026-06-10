# Table Grouped Columns Design

## Scope

Implement grouped column support for the existing Table `columns` API:

- `TableColumn<T>.children?: TableColumn<T>[]`
- Multi-row `<thead>` generation for nested column groups.
- Group header `colSpan` based on visible leaf columns.
- Leaf header `rowSpan` so non-group columns fill the header depth.
- Body, summary, empty state, selection, expandable rows, sorting, filtering, and cell merging all operate against visible leaf columns.

Out of scope for this slice: JSX `Table.Column` / `Table.ColumnGroup` static members, fixed columns, sticky columns, tree data, and grouped footer logic.

## Behavior

Column processing builds two derived structures from `local.columns`: visible leaf columns for body rendering and header rows for `<thead>`. Hidden columns and static responsive filtering apply before span calculation. A group with no visible leaf descendants is omitted.

Internal expand and selection columns are rendered as header cells in the first header row with `rowSpan` equal to total header depth. Body rows keep those internal cells before visible leaf data cells. `renderColumnCount()` uses internal columns plus visible leaf columns, so empty cells, expanded rows, and summary colspan remain correct.

Sorter and filter controls are only rendered on leaf columns. If a parent column defines sorter/filter props, those props are ignored in this slice because antd group headers are structural rather than data cells.

## Testing

Add tests in `packages/components/src/table/__tests__/table.test.tsx` for:

- Nested headers render multiple `<thead>` rows.
- Group headers receive correct `colSpan`.
- Leaf headers receive correct `rowSpan`.
- Body rows render only leaf columns.
- Hidden children are omitted from group colSpan and body.
- Selection and expandable internal headers span all header rows.
- Sorting on a leaf column inside a group still works.

## Documentation

Update `apps/docs/src/pages/components/table.mdx` with a grouped columns example and add `children` to the `TableColumn` API table.
