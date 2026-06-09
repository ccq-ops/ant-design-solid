# Table Antd Core API Design

## Scope

Implement the first compatibility slice for the Table component:

- Basic antd-compatible props: `className`, `locale.emptyText`, object-form `loading`, path-array `dataIndex`, `rowClassName`, `onHeaderRow`, column `className`, `onCell`, and `onHeaderCell`.
- High-frequency data operations: local pagination, sorting, filtering, and `onChange`.

Out of scope for this slice: `rowSelection`, `expandable`, tree data, fixed columns, sticky headers, virtual scrolling, `components`, `summary`, and JSX sugar members such as `Table.Column`.

## Architecture

Keep `Table` self-contained and follow the existing Solid component style. Add typed helper functions for value lookup, filtering, sorting, pagination normalization, and change notification inside the table module rather than introducing a new dependency.

`TableProps` will expose antd-like types while preserving current Solid aliases. Pagination will reuse the local `Pagination` component. Sorting and filtering will be controlled by internal signals unless controlled values are provided through column props.

## Data Flow

Input data flows through these stages:

1. `dataSource`
2. local filters from column `filters` / `onFilter`
3. local sorter from column `sorter`
4. pagination slice, unless `pagination={false}`
5. render rows

Table interactions call `onChange(pagination, filters, sorter, extra)`, where `extra.action` is `paginate`, `sort`, or `filter`, and `extra.currentDataSource` is the filtered and sorted data before pagination.

## Testing

Use TDD in `packages/components/src/table/__tests__/table.test.tsx`. Cover each new compatibility group with behavior tests:

- `dataIndex` array path, `className`, `locale.emptyText`, object `loading`.
- Header and cell prop hooks.
- Row class names.
- Pagination renders only current page and fires `onChange`.
- Sorting toggles by clicking sortable headers and fires `onChange`.
- Filtering through default filter UI changes visible rows and fires `onChange`.
