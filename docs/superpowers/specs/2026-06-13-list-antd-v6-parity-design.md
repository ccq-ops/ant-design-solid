# List Ant Design v6 Parity Design

## Goal

Bring the Solid `List` component up to Ant Design v6 List API parity while preserving Solid prop naming and local component patterns.

## Scope

The implementation will extend `packages/components/src/list` only, plus tests and docs. React-only prop names are adapted to Solid conventions: `className` remains `class`, `rootClassName` becomes `rootClass`, and semantic DOM customization uses `classNames` and `styles`.

## API Additions

`List` will support `itemLayout`, `loading` as `boolean | SpinProps`, `loadMore`, `locale.emptyText`, `pagination`, `grid`, `rowKey`, `prefixCls`, and `rootClass`. Existing `emptyText` remains as a compatibility alias and has lower priority than `locale.emptyText`.

`List.Item` will support semantic `classNames` and `styles` for `actions` and `extra`. `List.Item.Meta` keeps its existing public API.

## Behavior

Pagination slices `dataSource` before rendering and displays a local `Pagination` component at `top`, `bottom`, or `both`. Grid mode renders items in wrappers with column widths computed from `column` and responsive breakpoints. Vertical layout adds list and item classes and places actions inside the main content before extra content. Loading wraps list content in local `Spin`, allowing full `SpinProps`.

## Testing

Tests cover pagination slicing and callbacks, load more, locale empty text, SpinProps loading, vertical item layout, grid wrappers, row keys, semantic item class/style hooks, and prefix/root class behavior.
