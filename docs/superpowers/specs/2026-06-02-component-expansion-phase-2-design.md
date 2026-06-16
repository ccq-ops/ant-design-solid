# Component Expansion Phase 2 Design

Date: 2026-06-02

## Goal

Expand `@solid-ant-design/core` with the second batch of common Ant Design-style components:

1. `Pagination`
2. `Steps`
3. `Slider`

This phase follows the existing component structure, CSS-in-JS styling pattern, docs route pattern, tests pattern, and kebab-case filename rules. It builds on Phase 1, which added `Divider`, `Card`, `Avatar`, `Empty`, `Breadcrumb`, and `Rate`.

## Existing Patterns To Follow

Each component should use the current component layout:

```text
packages/components/src/<component>/
  index.ts
  interface.ts
  <component>.tsx
  <component>.style.ts
```

Behavior-heavy components should include tests under:

```text
packages/components/src/<component>/__tests__/<component>.test.tsx
```

Each component should get a docs page:

```text
apps/docs/src/routes/components/<component>.tsx
```

Docs routes are auto-discovered by `apps/docs/src/site/routes.ts` through `import.meta.glob`, so this phase should not manually edit `routes.ts` unless the route system changes.

Shared exports and docs navigation should be updated in:

```text
packages/components/src/index.ts
apps/docs/src/site/nav.ts
```

All new TypeScript source filenames must be lowercase kebab-case.

## Component Designs

### Pagination

`Pagination` provides page navigation for long lists.

Supported API:

- `current`: controlled current page
- `defaultCurrent`: uncontrolled initial page, default `1`
- `pageSize`: controlled page size
- `defaultPageSize`: uncontrolled initial page size, default `10`
- `total`: total item count, default `0`
- `disabled`: disables all controls
- `simple`: simplified previous/input/next mode
- `showSizeChanger`: shows page-size selector
- `pageSizeOptions`: string or number options, default `[10, 20, 50, 100]`
- `showQuickJumper`: shows quick-jump input in full mode
- `hideOnSinglePage`: hides pagination when there is only one page
- `showTotal`: callback `(total, range) => JSX.Element`
- `onChange`: callback `(page, pageSize) => void`
- `onShowSizeChange`: callback `(current, size) => void`
- standard `nav` HTML attributes where practical

Behavior:

- Page count is `Math.ceil(total / pageSize)`, with at least one page when visible.
- Current page is clamped between `1` and page count.
- Previous/next buttons are disabled at boundaries.
- Full mode renders numbered page buttons with compact ellipsis when page count is large.
- Simple mode renders previous button, current-page input, total page count, and next button.
- Page-size changes keep the current page within the new page count.
- Quick jumper commits on Enter or blur.
- `hideOnSinglePage` returns no UI when page count is `1` or less.
- Uses `aria-current="page"` on the active page button and `aria-label` on controls.

### Steps

`Steps` displays progress through a sequence.

Supported API:

- `items`: array of step items
- `current`: current step index, default `0`
- `status`: global current status, default `'process'`
- `direction`: `'horizontal' | 'vertical'`, default `'horizontal'`
- `size`: `'default' | 'small'`, default `'default'`
- `type`: `'default' | 'navigation'`, default `'default'`
- `onChange`: callback `(current) => void`
- standard `div` HTML attributes where practical

Each step item supports:

- `title`: JSX content
- `description`: JSX content
- `status`: `'wait' | 'process' | 'finish' | 'error'`
- `icon`: JSX content
- `disabled`: boolean

Behavior:

- Item status defaults from position relative to `current`: before current is `finish`, current is global `status`, after current is `wait`.
- Item `status` overrides derived status.
- Renders with ordered-list semantics.
- Current item uses `aria-current="step"`.
- `type="navigation"` renders clickable step buttons for non-disabled steps and calls `onChange`.
- Disabled items are not clickable and expose disabled state.
- Horizontal and vertical directions have distinct layouts.
- Small size reduces icon and text spacing.

### Slider

`Slider` provides single-value or range numeric selection.

Supported API:

- `value`: controlled value, number or `[number, number]` in range mode
- `defaultValue`: uncontrolled initial value
- `min`: minimum value, default `0`
- `max`: maximum value, default `100`
- `step`: increment size, default `1`
- `disabled`: disables pointer and keyboard interaction
- `range`: boolean range mode
- `marks`: record of numeric position to JSX label or `{ label, style }`
- `vertical`: vertical orientation
- `tooltipVisible`: controls value tooltip visibility
- `onChange`: callback with next value
- `onAfterChange`: callback after committed pointer/key interaction
- standard `div` HTML attributes where practical

Behavior:

- Values are clamped to `[min, max]` and snapped to `step` when `step` is positive.
- Single mode renders one handle and one included track from min to value.
- Range mode renders two handles and included track between values.
- Clicking the rail moves the nearest handle in range mode or the only handle in single mode.
- Dragging a handle updates value continuously and calls `onAfterChange` on pointer release.
- Keyboard supports Arrow keys, PageUp/PageDown, Home, and End.
- Disabled state prevents pointer and keyboard updates.
- Marks render at the corresponding percentage with optional custom style.
- Handles expose `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and orientation when vertical.

## Styling Approach

Use the existing `@solid-ant-design/cssinjs` style registration pattern and theme tokens from `useToken()`. New styles should use stable `ant-` prefixed class names through `config.prefixCls()`.

CSS values that are unitless in CSS, such as opacity, flex, line-height ratios, and z-index, should be strings when needed to avoid the local serializer appending `px` unexpectedly.

## Documentation

Each new docs page should include:

- Basic usage
- Controlled/uncontrolled examples when applicable
- Disabled state
- Main variants
- Concise API notes following the existing docs style

Docs navigation should place:

- `Pagination` near navigation/data display components
- `Steps` near navigation components
- `Slider` near data-entry components

## Testing and Verification

Add tests for behavior-heavy paths:

- `Pagination`: controlled/uncontrolled page changes, boundaries, simple mode, size changer, quick jumper, `hideOnSinglePage`.
- `Steps`: derived status, item override status, navigation click, disabled item, current aria state.
- `Slider`: single-value changes, range changes, disabled behavior, keyboard behavior, marks, controlled mode, pointer commit behavior.

Final verification commands:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

## Out of Scope For Phase 2

- `DatePicker`, `TimePicker`, `Upload`
- Full Ant Design pagination item rendering customization
- Responsive pagination collapse behavior
- Advanced step sub-title/progress-dot variants
- Slider tooltip portal positioning
- Slider reverse mode
- Slider draggable track
