# Table Display Cell API Design

## Scope

Implement the next antd-compatible Table slice:

- `title(currentPageData)` and `footer(currentPageData)` table sections.
- `tableLayout` forwarded to the native table style.
- Column `hidden`, `responsive`, `ellipsis`, and `rowScope`.
- Render return shape `{ children, props }` for body cells, including `colSpan` and `rowSpan`.

Out of scope for this slice: grouped headers, JSX `Table.Column`, fixed columns, sticky header, virtual scrolling, custom `components`, and responsive media-query subscriptions.

## Behavior

`title` renders above the scroll container and receives the current page data. `footer` renders below the scroll container and above pagination, also receiving the current page data. `tableLayout` sets the native `table-layout` style. If any visible column has `ellipsis`, the table defaults to `fixed` layout unless `tableLayout` is explicitly provided.

Visible columns exclude `hidden` columns. `responsive` is treated as a static compatibility filter for this slice: when provided, a column is included only when the list contains `xs`, which is the test/default breakpoint in this non-browser-responsive implementation. This avoids introducing a viewport observer before the component has shared breakpoint infrastructure.

`ellipsis` adds an ellipsis class to header and body cells. Object-form ellipsis supports `showTitle`; when `showTitle` is not false and text content is primitive, the body cell receives a `title` attribute. `rowScope` applies `scope` to body cells so row-header columns can be marked as `row` or `rowgroup`.

When `column.render` returns `{ children, props }`, Table renders `children` as the cell content and merges `props` into the body cell props after `onCell`. `colSpan` or `rowSpan` equal to `0` suppresses that cell.

## Testing

Add tests in `packages/components/src/table/__tests__/table.test.tsx` for:

- title and footer receiving current page data.
- table layout defaulting from ellipsis and honoring explicit `tableLayout`.
- hidden and responsive column filtering.
- ellipsis classes/title behavior and rowScope.
- render-return cell props, `colSpan`, `rowSpan`, and zero-span suppression.

## Documentation

Update `apps/docs/src/pages/components/table.mdx` with examples for title/footer, column display controls, and merged cells. Extend the Table and TableColumn API tables with the new props and render return type.
