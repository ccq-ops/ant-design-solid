# Timeline Ant Design v6 Parity Design

## Goal

Rework `Timeline` to match Ant Design v6's public API and internal structure as closely as this Solid codebase allows, with no support for the repository's old Timeline API names.

## Scope

This change covers `packages/components/src/timeline`, the local `Steps` foundation it will use, tests, and the Timeline docs page. The public Timeline API should use Ant Design v6 names only:

- `Timeline` props: `items`, `mode`, `orientation`, `variant`, `titleSpan`, `classNames`, `styles`, `rootClassName`, `reverse`, `prefixCls`, `class`, `className`, `style`.
- `Timeline` item props: `key`, `title`, `content`, `icon`, `placement`, `loading`, `color`, `className`, `class`, `style`, `classNames`, `styles`.

The old local Timeline API is intentionally removed:

- Remove `pending` and `pendingDot`.
- Remove item `label`, `children`, `dot`, and `position`.
- Remove `mode="left"` and `mode="right"`.
- Remove docs and tests that present those names as valid Timeline API.

## Architecture

`Timeline` becomes a wrapper over `Steps`, matching Ant Design v6's shape: Timeline normalizes item data, computes placement and color metadata, then renders `Steps` with an internal dot mode and `ol > li` semantics. `Steps` remains a public Steps component, but gains a small set of generic capabilities needed by Timeline: dot rendering, semantic slot class/style maps, item class/style maps, variants, orientation aliasing, and optional root/list item element tags.

The internal data flow is:

1. `Timeline` accepts v6 Timeline props and item props.
2. It maps each item into a Steps item with `title`, `description`/`content`, `icon`, `status`, `className`, `style`, `classNames`, and `styles`.
3. It computes item placement from `item.placement ?? mode`, alternating when `mode="alternate"`.
4. It applies Timeline classes to Steps semantic slots, preserving `ads-timeline-*` class names for Timeline CSS and tests.
5. It reverses the normalized item list when `reverse` is true.
6. `Steps` renders the list as `ol > li` when requested by Timeline.

## Timeline API Behavior

`mode` accepts `start`, `alternate`, and `end`, defaulting to `start`. `orientation` accepts `vertical` and `horizontal`, defaulting to `vertical`. `variant` accepts `outlined` and `filled`, defaulting to `outlined`. `titleSpan` is applied only when the layout is not alternate and should control the title area width or spacing through a CSS custom property.

Each item uses `title` for the side title/label and `content` for the main content. `icon` customizes the dot. `loading` sets the item status to `process` and renders a loading indicator when no icon is provided. `placement` accepts `start` or `end` and overrides the component mode for that item.

`classNames` and `styles` support semantic keys aligned with the Timeline-over-Steps structure:

- root
- list
- item
- itemTitle
- itemIcon
- itemContent
- itemRail
- itemWrapper
- itemSection
- itemHeader

Item-level `classNames` and `styles` use the same item semantic keys except `root` and `list`.

## Steps Foundation Changes

`Steps` will add:

- `variant?: 'outlined' | 'filled'`.
- `orientation?: 'horizontal' | 'vertical'` as an alias for `direction`.
- `type?: 'default' | 'navigation' | 'dot'`.
- `classNames` and `styles` semantic maps.
- Item-level `class`, `className`, `style`, `classNames`, and `styles`.
- Internal `rootComponent?: 'div' | 'ol'` and `itemComponent?: 'div' | 'li'` props.
- Internal `listClass` and `listStyle` hooks if needed for Timeline root/list semantic classes.

The existing public Steps behavior and tests must continue to pass.

## Styling

Timeline styles move toward the v6 Steps-based structure while keeping Timeline-specific class names:

- Root receives `ads-timeline`, `ads-timeline-vertical` or `ads-timeline-horizontal`, variant class, and optional layout class.
- Items receive `ads-timeline-item`, placement classes, status classes through Steps, and color classes for preset colors.
- Custom colors use inline CSS variables or inline styles scoped to the item icon.
- Horizontal orientation uses flex row layout.
- Vertical orientation uses a rail down the center of icon positions.
- Filled variant fills dots; outlined variant keeps filled background out of the dot by default.

## Testing

Add failing tests before implementation for:

- v6 item fields `title`, `content`, `icon`, `placement`, `loading`.
- `mode` values `start`, `end`, and `alternate`.
- `orientation`, `variant`, and `titleSpan`.
- root and item semantic `classNames` and `styles`.
- `reverse` order.
- Timeline rendering through `ol > li` semantics.
- removal of old API from docs and types where practical.

Keep Steps tests green and add Steps tests for dot type and semantic maps.

## Documentation

Update `apps/docs/src/pages/components/timeline.mdx` to show only v6 Timeline API names. Demos should cover basic items, alternate placement, horizontal orientation, loading item, variant/titleSpan, custom icon/color, and semantic class/style maps. Deprecated old names should not appear as valid usage.

## Verification

Run targeted tests while implementing:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- src/steps/__tests__/steps.test.tsx src/timeline/__tests__/timeline.test.tsx
```

After the feature is complete, run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```
