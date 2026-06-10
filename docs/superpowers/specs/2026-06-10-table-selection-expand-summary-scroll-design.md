# Table Selection Expand Summary Scroll Design

## Scope

Implement the second antd Table compatibility slice:

- `rowSelection`: checkbox/radio selection column, controlled and uncontrolled selected keys, default selected keys, select all checkbox, disabled row controls via `getCheckboxProps`, `onChange`, and `onSelect`.
- `expandable`: expanded content row, controlled and uncontrolled expanded row keys, default expanded keys, default expand all rows, custom expanded row class name, `expandRowByClick`, `rowExpandable`, `onExpand`, and `onExpandedRowsChange`.
- `summary`: render a `<tfoot>` summary row from the currently rendered page data.
- `scroll`: basic `scroll.x` and `scroll.y` wrapper behavior without fixed columns or virtual scrolling.

Out of scope for this slice: fixed columns, sticky header, virtual list, `components` override, grouped headers, JSX `Table.Column`, and tree indentation.

## Architecture

Keep the existing native table renderer and inject internal selection/expand columns at render time. Selection and expansion state live in local signals unless controlled props are provided. Filtering, sorting, and pagination remain the data pipeline; selection callbacks receive records resolved from the full data set, while summary receives the current rendered page data.

## Rendering

Selection and expand controls are rendered as first columns. Expanded content renders as an extra row immediately after the parent data row with a single cell spanning all rendered columns. Summary renders in `<tfoot>` after body rows. Basic scroll wraps the table in `.ads-table-container` with overflow styles and keeps pagination outside that scroll container.

## Testing

Add behavior tests in `packages/components/src/table/__tests__/table.test.tsx` for:

- checkbox selection, select all, disabled checkbox props, and callbacks.
- radio selection.
- default expanded rows, controlled expanded rows, row click expansion, and callbacks.
- summary receiving current page data.
- `scroll.x/y` applying a scroll container and table min-width / max-height styles.
