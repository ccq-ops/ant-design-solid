# Component Expansion Phase 4 Design

Date: 2026-06-02

## Goal

Expand `@ant-design-solid/core` with feedback and loading components:

1. `Spin`
2. `Progress`
3. `Skeleton`
4. `Drawer`

This phase focuses on practical Ant Design-style core subsets that fit the repository's current component architecture.

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

### Spin

`Spin` displays a loading indicator, optionally wrapping content with a loading overlay.

Supported API:

- `spinning`: boolean, default `true`
- `size`: `'small' | 'default' | 'large'`, default `'default'`
- `tip`: JSX content below the indicator
- `delay`: milliseconds before spinner becomes visible
- `fullscreen`: renders a fixed viewport overlay
- `indicator`: custom indicator JSX
- `children`: optional content to wrap
- standard `div` HTML attributes where practical

Behavior:

- Without `children`, renders only the spinner indicator.
- With `children`, renders children and an overlay when spinning.
- `delay` prevents the spinner from appearing until the delay elapses.
- `fullscreen` renders a fixed overlay with high z-index.
- Uses `role="status"` and `aria-live="polite"` for the indicator.
- Wrapped content receives `aria-busy` while spinning.

### Progress

`Progress` displays line or circle progress.

Supported API:

- `type`: `'line' | 'circle'`, default `'line'`
- `percent`: number, default `0`
- `status`: `'normal' | 'success' | 'exception' | 'active'`
- `showInfo`: boolean, default `true`
- `strokeWidth`: number
- `strokeColor`: string
- `trailColor`: string
- `format`: callback `(percent) => JSX.Element`
- standard `div` HTML attributes where practical

Behavior:

- Percent is clamped between `0` and `100`.
- If `status` is omitted and percent is `100`, status is `success`.
- Line mode renders a trail and a bar whose width matches percent.
- Circle mode renders an SVG circle using stroke dash offset.
- Info text defaults to `xx%` or success/error symbol by status.
- `format` overrides info rendering.
- Uses `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`.

### Skeleton

`Skeleton` displays placeholder content while loading.

Supported API:

- `active`: boolean shimmer animation
- `loading`: boolean, default `true`
- `avatar`: boolean or config object
- `title`: boolean or config object
- `paragraph`: boolean or config object
- `round`: boolean
- `children`: content shown when `loading=false`
- standard `div` HTML attributes where practical

Avatar config:

- `size`: `'small' | 'default' | 'large' | number`
- `shape`: `'circle' | 'square'`

Title config:

- `width`: number or string

Paragraph config:

- `rows`: number, default `3`
- `width`: number/string or array of number/string

Behavior:

- `loading=false` renders children directly.
- `loading=true` renders skeleton blocks.
- Defaults render title and paragraph when no specific sections are provided.
- Avatar renders when `avatar` is truthy.
- `active` adds shimmer animation.
- `round` applies rounded corners to placeholder blocks.

### Drawer

`Drawer` displays a slide-out panel using the existing modal/overlay patterns.

Supported API:

- `open`: boolean
- `title`: JSX content
- `placement`: `'left' | 'right' | 'top' | 'bottom'`, default `'right'`
- `width`: number or string, default `378`
- `height`: number or string, default `378`
- `closable`: boolean, default `true`
- `mask`: boolean, default `true`
- `maskClosable`: boolean, default `true`
- `keyboard`: boolean, default `true`
- `destroyOnClose`: boolean
- `extra`: JSX content in header
- `footer`: JSX content
- `zIndex`: number
- `onClose`: callback
- `afterOpenChange`: callback `(open) => void`
- `children`: drawer body
- standard `div` HTML attributes where practical

Behavior:

- Renders into `InternalPortal` when open, or while content is retained.
- Locks body scroll while open and unlocks on close/unmount.
- Mask click closes when `maskClosable` is true.
- Escape closes when `keyboard` is true.
- `destroyOnClose` removes children after close.
- `placement` controls side and width/height sizing.
- Uses `role="dialog"`, `aria-modal="true"`, and title labelling when title exists.
- Calls `afterOpenChange(true)` after opening and `afterOpenChange(false)` after closing.

## Styling Approach

Use the existing `@ant-design-solid/cssinjs` registration pattern and tokens from `useToken()`. Use stable class names through `config.prefixCls()`:

- `ant-spin`
- `ant-progress`
- `ant-skeleton`
- `ant-drawer`

CSS values that are unitless in CSS, such as line-height ratios, font-weight, opacity, flex, and z-index, should be strings when necessary to avoid the local serializer appending `px`. Numeric lengths should use explicit `px` strings.

## Documentation

Each new docs page should include:

- Basic usage
- Main variants
- Disabled/hidden/loaded state where applicable
- Controlled examples where applicable
- Concise API notes matching existing docs style

Docs navigation should place these components near feedback components:

- `Spin`, `Progress`, `Skeleton` near `Alert`, `Message`, `Notification`
- `Drawer` near `Modal` and `Popconfirm`

## Testing and Verification

Add tests for behavior-heavy paths:

- `Spin`: standalone, wrapped content, delay, fullscreen, custom indicator.
- `Progress`: percent clamp, success default at 100, line width, circle SVG, custom format, ARIA.
- `Skeleton`: loading false children, default skeleton, avatar/title/paragraph configs, active/round classes.
- `Drawer`: open render, close button, mask close, Escape close, destroyOnClose, placement sizing, scroll lock cleanup, afterOpenChange.

Final verification commands:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

## Out of Scope For Phase 4

- Drawer animation lifecycle beyond open/closed rendering
- Drawer push mode
- Nested drawer stack management beyond Escape top-most behavior if implemented
- Progress dashboard/steps variants
- Skeleton.Input/Button/Image subcomponents
- Global Spin configuration
