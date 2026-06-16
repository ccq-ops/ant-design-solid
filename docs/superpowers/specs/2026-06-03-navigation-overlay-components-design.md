# Navigation Overlay Components Design

Date: 2026-06-03

## Goal

Expand `@solid-ant-design/core` with a focused Navigation/Overlay batch:

1. `Affix`
2. `Anchor`
3. `FloatButton` with `FloatButton.Group` and `FloatButton.BackTop`

The batch fills common Ant Design-style scroll/navigation affordances while preserving existing repository patterns: colocated component files, token-driven CSS-in-JS, Solid-native behavior, docs routes, behavior tests, root exports, and kebab-case TypeScript filenames.

## Existing Patterns To Follow

Each component uses this package layout:

```text
packages/components/src/<component>/
  index.ts
  interface.ts
  <component>.tsx
  <component>.style.ts
  __tests__/<component>.test.tsx
```

Docs pages live under:

```text
apps/docs/src/routes/components/<component>.tsx
```

Shared registries are updated in:

```text
packages/components/src/index.ts
apps/docs/src/site/nav.ts
```

Do not manually edit `apps/docs/src/site/routes.ts`; docs routes are auto-discovered. All TypeScript filenames must remain lowercase kebab-case.

## Component Designs

### Affix

`Affix` fixes content relative to a scroll container after crossing a top or bottom offset.

Supported API:

- `offsetTop`: number, default `0` when neither offset is provided
- `offsetBottom`: number
- `target`: callback returning `Window | HTMLElement | undefined | null`
- `onChange`: callback `(affixed: boolean) => void`
- `children`: content
- standard `div` HTML attributes where practical

Behavior:

- Defaults to listening to `window` scroll and resize.
- `target` can provide a custom scroll container.
- When using top mode, the element becomes fixed when its placeholder top is less than or equal to `offsetTop` relative to the target viewport.
- When using bottom mode, the element becomes fixed when its placeholder bottom is greater than or equal to target viewport bottom minus `offsetBottom`.
- A placeholder wrapper keeps layout space stable while fixed.
- Fixed content uses inline `position`, dimensions, and offset styles calculated from the placeholder.
- `onChange` fires only when affixed state changes.
- The component cleans up listeners on unmount.

Out of scope:

- Boundary elements that stop affix inside a parent container.
- Transform/zoom edge cases.
- Multiple nested scroll target coordination beyond the supplied target.

### Anchor

`Anchor` provides page-section navigation and active-link tracking.

Supported API:

- `items`: nested array of `{ key?, href, title, children? }`
- `affix`: boolean, default `true`
- `offsetTop`: number, passed to internal `Affix`
- `targetOffset`: number, default `0`
- `getContainer`: callback returning `Window | HTMLElement | undefined | null`
- `bounds`: number, default `5`
- `onClick`: callback `(event, link) => void`
- `onChange`: callback `(currentActiveLink) => void`
- standard `div` HTML attributes where practical

Behavior:

- Renders nested item lists from the `items` API.
- Clicking a link prevents the default jump, calls `onClick`, finds the target element by hash, and scrolls the container to that element.
- Scroll handling computes the current active link as the last target whose top is within `targetOffset + bounds` of the viewport top.
- Active link changes update classes and call `onChange`.
- `affix=true` wraps the navigation in `Affix`; `affix=false` renders the anchor directly.
- Link elements expose `aria-current="true"` when active.

Out of scope:

- Children composition API.
- History/hash management customization.
- Horizontal anchor direction.
- Ink indicator animation beyond a simple active class.

### FloatButton

`FloatButton` renders floating quick-action buttons, grouped floating buttons, and a back-to-top variant.

Supported `FloatButton` API:

- `type`: `'default' | 'primary'`, default `'default'`
- `shape`: `'circle' | 'square'`, default `'circle'`
- `icon`: JSX content
- `description`: JSX content
- `tooltip`: string, exposed through `title`
- `href`: link URL; renders an anchor when provided
- `target`: anchor target
- `onClick`: click callback
- standard button/anchor attributes where practical

Supported `FloatButton.Group` API:

- `shape`: inherited button shape
- `children`: grouped buttons
- standard `div` attributes where practical

Supported `FloatButton.BackTop` API:

- `visibilityHeight`: number, default `400`
- `target`: callback returning `Window | HTMLElement | undefined | null`
- `duration`: number, accepted for API compatibility; implementation uses native smooth scrolling when available
- `onClick`: click callback
- `children`: optional custom button content
- standard button attributes where practical

Behavior:

- `FloatButton` is fixed at the lower right by default.
- Link mode renders `<a>`; action mode renders `<button type="button">`.
- `FloatButton.Group` stacks buttons vertically in a fixed container.
- `BackTop` listens to the scroll target and only appears once scroll top reaches `visibilityHeight`.
- Clicking `BackTop` calls `onClick` and scrolls the target to top using `scrollTo({ top: 0, behavior: 'smooth' })` when available, with a direct fallback for test/legacy environments.
- Listeners are cleaned up on unmount.

Out of scope:

- Open/close-triggered expandable FloatButton groups.
- Badge integration.
- Tooltip portal positioning; `tooltip` uses native `title` in this batch.
- Custom BackTop easing over `duration`.

## Styling Approach

Use `@solid-ant-design/cssinjs` style registration and `useToken()`. Class names come from `config.prefixCls()` and follow existing stable `ant-`/custom-prefix patterns:

- `${prefix}-affix`
- `${prefix}-anchor`
- `${prefix}-float-button`

Styles cover layout, fixed positioning, active/hover/focus states, disabled-like states where applicable, and token-aware color/border/shadow values. Numeric CSS values that should not receive `px` from the serializer must be strings.

## Documentation

Each docs page includes practical examples:

- `Affix`: top affix, bottom affix, custom offset.
- `Anchor`: basic nested anchors and non-affixed mode.
- `FloatButton`: basic action, link button, group, and back-to-top.

Docs navigation places these components near navigation/overlay components around `Menu`, `Layout`, and `Breadcrumb`.

## Testing and Verification

Behavior tests should cover:

- `Affix`: default render, top threshold, bottom threshold, `onChange` transition behavior, custom prefix.
- `Anchor`: nested item rendering, click callback and target scrolling, active-link updates on scroll, non-affixed mode, custom prefix.
- `FloatButton`: button/link rendering, group rendering, click callback, BackTop visibility threshold, BackTop scroll-to-top, custom prefix.

Final verification commands:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```
