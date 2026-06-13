# Breadcrumb Antd V6 Parity Design

## Goal

Bring `Breadcrumb` close to antd v6 capability while keeping the public API idiomatic for Solid.

## API Shape

The component keeps existing `items`, `separator`, `children`, and `Breadcrumb.Item` support. It adds antd v6 features with Solid naming:

- `rootClass` instead of `rootClassName`.
- `class` instead of `className`.
- item `class` instead of item `className`.
- `classNames` and `styles` semantic slots for `root`, `item`, and `separator`.
- `params`, `routes`, `itemRender`, and `dropdownIcon`.
- item `key`, `path`, `breadcrumbName`, `menu`, `dropdownProps`, `style`, `children`, `data-*`, and aria attributes.
- separator items through `{ type: 'separator', separator }`.
- `Breadcrumb.Separator` for legacy manual composition.

`routes`, `breadcrumbName`, `Breadcrumb.Separator`, and item `children` are compatibility APIs. New examples should prefer `items`, `title`, item `menu`, and the top-level `separator`.

## Rendering Behavior

Data items render through a normalized item list. `routes` maps into the same shape as `items`. If an item has `path`, Breadcrumb replaces `:param` segments using `params`, accumulates previous paths, and uses `#/{joinedPaths}` as the generated link. Explicit `href` is used when no generated path applies.

`itemRender(route, params, routes, paths)` overrides the default label rendering. The default render uses `title`, falling back to `breadcrumbName`, and replaces dynamic title params for string labels.

Items with `menu` wrap their link content in this library's `Dropdown`. Menu item `path` values become links relative to the breadcrumb item href. `dropdownProps` and `dropdownIcon` are passed through in Solid-compatible shape.

Manual children continue to work. `Breadcrumb.Item` receives the parent separator unless it is the last item. `Breadcrumb.Separator` renders a separator node and is mostly for legacy parity.

## Styling And Tokens

Breadcrumb style should align with antd component tokens:

- `itemColor`
- `lastItemColor`
- `iconFontSize`
- `linkColor`
- `linkHoverColor`
- `separatorColor`
- `separatorMargin`

The style hook derives defaults from global tokens when component-specific values are not present. Semantic `classNames` and `styles` are merged onto the root nav, each item, and each separator.

## Docs

The docs page should follow antd example coverage using Solid syntax: basic usage, with icon, separator, dropdown menu, independent separator item, configured separator, separator as string, and custom item rendering. The API tables should document the Solid names and note the legacy compatibility APIs.

## Testing

Tests should cover the added behavior directly:

- `path` and `params` generate accumulated hrefs.
- `itemRender` receives route, params, routes, and paths.
- `menu`, `dropdownProps`, and `dropdownIcon` render a dropdown trigger.
- separator items and `Breadcrumb.Separator` render separators.
- semantic `classNames` and `styles` apply to root, item, and separator.
- legacy `routes` and `breadcrumbName` still render.
