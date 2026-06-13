# Descriptions Antd v6 Parity Design

## Goal

Bring the Solid `Descriptions` component to current Ant Design v6 API behavior while keeping Solid-friendly prop names and removing deprecated React compatibility props.

## API Scope

`Descriptions` will support `title`, `extra`, `bordered`, `column`, `size`, `layout`, `items`, `children`, `colon`, `classNames`, and `styles`. The `column` prop will accept a number or a breakpoint map. `size` will use Ant Design v6 names: `large`, `medium`, and `small`, with `large` as the default.

`Descriptions.Item` and `items[]` entries will support `key`, `label`, `children`, `span`, `class`, `style`, `classNames`, and `styles`. `span` will accept a number, `filled`, or a breakpoint map. React compatibility and deprecated props are intentionally excluded: `className`, `rootClassName`, `prefixCls`, `labelStyle`, and `contentStyle`.

The semantic styling API keeps the Ant Design `classNames` and `styles` names because these target named internal slots rather than React DOM `className`. Slots are `root`, `header`, `title`, `extra`, `label`, and `content` at component level, and `label` / `content` at item level.

## Behavior

Rows will follow Ant Design span behavior. Numeric spans fill rows up to the resolved `column`; overflow is clipped to the remaining row width and warns in development. `span="filled"` fills the rest of the current row and starts the next row. A partial final row expands its last item to fill the row.

Responsive `column` and `span` will use the repository's existing breakpoint utilities. On server or test environments without active screens, breakpoint maps resolve to their smallest available fallback.

`colon` defaults to `true`. It applies to horizontal, non-bordered label cells. Bordered and vertical layouts continue to suppress the generated colon, matching Ant Design behavior.

## Styling And Tokens

Descriptions will get a dedicated component token interface instead of `ComponentTokenBase`. Defaults will be derived from alias tokens and mirror Ant Design concepts: label background, title margin, item padding, colon margins, and bordered cell padding for large, medium, and small sizes.

The style sheet will use those component tokens and keep existing class prefix behavior through ConfigProvider.

## Docs And Tests

Tests will cover the new API before implementation: colon behavior, semantic class/style props, responsive column/span resolution, filled spans, final-row fill, Solid `class` support, and size class names.

The docs page will be refreshed to show Ant Design-style examples and an updated Solid API table. Deprecated React compatibility props will not be documented.
