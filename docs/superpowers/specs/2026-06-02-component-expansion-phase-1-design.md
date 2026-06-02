# Component Expansion Phase 1 Design

Date: 2026-06-02

## Goal

Expand `@ant-design-solid/core` with the first batch of common Ant Design-style components while preserving the repository's existing component structure, styling approach, documentation pattern, and kebab-case file naming rules.

This phase implements six relatively low-to-medium complexity components:

1. `Divider`
2. `Card`
3. `Avatar`
4. `Empty`
5. `Breadcrumb`
6. `Rate`

The remaining requested groups will be handled in later phases:

- Phase 2: `Pagination`, `Steps`, `Slider`
- Phase 3: `DatePicker`, `TimePicker`, `Upload`

## Existing Patterns To Follow

Each component should follow the current package layout:

```text
packages/components/src/<component>/
  index.ts
  interface.ts
  <component>.tsx
  <component>.style.ts
```

Each component should also get a docs route:

```text
apps/docs/src/routes/components/<component>.tsx
```

Shared exports and docs navigation should be updated in:

```text
packages/components/src/index.ts
apps/docs/src/site/nav.ts
```

All new TypeScript source filenames must be lowercase kebab-case, including conventional suffixes.

## Component Designs

### Divider

`Divider` provides visual separation between content blocks.

Supported API:

- `type`: `'horizontal' | 'vertical'`, default `'horizontal'`
- `orientation`: `'left' | 'center' | 'right'`, default `'center'`
- `dashed`: boolean
- `plain`: boolean
- `children`: optional label content for horizontal dividers
- standard HTML attributes where practical

Behavior:

- Horizontal divider renders as a full-width separator.
- If children are provided, the text is centered/left/right according to `orientation`.
- Vertical divider renders inline and ignores text orientation.
- `dashed` switches the border style to dashed.
- `plain` reduces label emphasis.

### Card

`Card` provides a bordered content container.

Supported API:

- `title`: JSX content
- `extra`: JSX content aligned opposite title
- `cover`: JSX content displayed above the body
- `actions`: JSX content array displayed in a footer action bar
- `bordered`: boolean, default true
- `hoverable`: boolean
- `size`: `'default' | 'small'`, default `'default'`
- `children`: body content

Behavior:

- Header renders only when `title` or `extra` exists.
- Cover renders before header/body.
- Actions render only when a non-empty action list exists.
- `hoverable` adds a subtle elevated hover treatment.
- `small` reduces padding and header height.

### Avatar

`Avatar` displays a user, icon, or short text identity marker.

Supported API:

- `size`: `'small' | 'default' | 'large' | number`, default `'default'`
- `shape`: `'circle' | 'square'`, default `'circle'`
- `src`: string image URL
- `alt`: image alt text
- `icon`: JSX content
- `children`: text fallback
- `gap`: number, reserved for text scaling calculation when implemented

`Avatar.Group` should support:

- `children`: avatars
- `maxCount`: optional visible avatar limit
- `maxStyle`: style for overflow avatar
- `size`: inherited avatar size
- `shape`: inherited avatar shape

Behavior:

- Priority is `src`, then `icon`, then `children`.
- Image load failure falls back to icon/text by hiding the failed image.
- Numeric size produces inline dimensions.
- Group overlaps avatars and shows `+N` overflow when `maxCount` is set.

### Empty

`Empty` displays an empty-state illustration and description.

Supported API:

- `image`: JSX content or string URL
- `imageStyle`: inline style for image wrapper
- `description`: JSX content, default text `No Data`
- `children`: optional action area

Behavior:

- Default image is a lightweight CSS/SVG-style placeholder built locally; no external asset dependency.
- If `image` is a string, render an `img`.
- If `image` is JSX, render it directly.
- `children` renders below the description for actions such as buttons.

### Breadcrumb

`Breadcrumb` provides hierarchical navigation.

Supported API:

- `items`: array of `{ title, href?, onClick?, separator? }`
- `separator`: JSX content, default `/`
- `children`: optional manual item composition

`Breadcrumb.Item` should support:

- `href`
- `onClick`
- `children`

Behavior:

- Prefer `items` for simple usage.
- Render links when `href` is present; otherwise render text/button-like clickable span when `onClick` exists.
- The last item is marked as current with `aria-current="page"` when appropriate.
- Per-item separator overrides the global separator.

### Rate

`Rate` provides star-based rating input.

Supported API:

- `value`: controlled numeric value
- `defaultValue`: uncontrolled initial value
- `count`: number, default 5
- `allowHalf`: boolean
- `allowClear`: boolean, default true
- `disabled`: boolean
- `character`: JSX content or function receiving index
- `tooltips`: string array
- `onChange`: callback with next value
- `onHoverChange`: callback with hover value

Behavior:

- Controlled mode follows `value`; uncontrolled mode stores internal state.
- Clicking the current value clears it to `0` when `allowClear` is true.
- `allowHalf` supports half-step selection based on pointer position within each item.
- Keyboard support includes arrow keys for increment/decrement and Home/End for min/max.
- Disabled state prevents pointer and keyboard changes.

## Styling Approach

Use the same CSS-in-JS registration pattern as existing components. Styles should be token-aware where existing theme tokens are available and should use stable `ant-` prefixed class names consistent with the rest of the package.

Component styles should cover:

- Base layout and spacing
- Size variants
- Disabled/interactive states where applicable
- Hover/focus states for interactive components
- Basic accessibility-visible focus styles

## Documentation

Each new docs page should include:

- Basic usage
- Key variants
- Controlled/uncontrolled examples when applicable
- A concise API overview in prose or table-like markup matching existing docs style

Docs navigation should place the new pages near related existing components:

- `Divider`, `Card`, `Avatar`, `Empty` near display/basic components
- `Breadcrumb` near navigation components
- `Rate` near data-entry components

## Testing and Verification

At minimum, implementation should include tests for behavior-heavy components where practical, especially:

- `Avatar` fallback and group overflow
- `Breadcrumb` items rendering/current item
- `Rate` controlled/uncontrolled behavior, clear behavior, half selection, disabled behavior, and keyboard behavior

Final verification commands after implementation:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

## Out of Scope For Phase 1

- `Pagination`, `Steps`, `Slider`
- `DatePicker`, `TimePicker`, `Upload`
- Full parity with every Ant Design prop
- Remote image assets
- Locale systems beyond default English copy
- Advanced date/time parsing or upload transport logic
