# Display Phase 7 Design

Date: 2026-06-03

## Goal

Expand `@solid-ant-design/core` with three practical Ant Design-style display components:

1. `Timeline`
2. `Result`
3. `Image`

The phase prioritizes small, useful MVP implementations that follow existing component patterns and avoid large, unrelated infrastructure changes.

## Existing Patterns To Follow

Each component uses the established folder layout:

```text
packages/components/src/<component>/
  index.ts
  interface.ts
  <component>.tsx
  <component>.style.ts
  __tests__/<component>.test.tsx
```

Each component gets a docs page:

```text
apps/docs/src/routes/components/<component>.tsx
```

Shared exports and docs navigation are updated in:

```text
packages/components/src/index.ts
apps/docs/src/site/nav.ts
```

Docs routes are auto-discovered by `apps/docs/src/site/routes.ts`; this file should not be edited. All TypeScript source filenames must remain lowercase kebab-case.

## Component Designs

### Timeline

`Timeline` renders chronological event items with optional positioning, pending state, reverse ordering, custom dots, and item colors.

#### Supported API

- `items?: TimelineItem[]`
- `mode?: 'left' | 'right' | 'alternate'`, default `'left'`
- `pending?: JSX.Element | boolean`
- `pendingDot?: JSX.Element`
- `reverse?: boolean`
- `prefixCls?: string`
- common wrapper `ol` HTML attributes where practical

```ts
interface TimelineItem {
  label?: JSX.Element
  children?: JSX.Element
  color?: 'blue' | 'red' | 'green' | 'gray' | string
  dot?: JSX.Element
  position?: 'left' | 'right'
}
```

#### Behavior

- Renders an ordered list of timeline entries.
- `reverse` reverses display order without mutating the source array.
- `pending=true` appends a pending item with text `Loading...`.
- `pending=<node>` appends a pending item with that node.
- `pendingDot` customizes the pending dot.
- `mode='alternate'` alternates item positions unless an item explicitly sets `position`.
- Known colors get semantic classes; custom colors are applied inline to the dot border/background.
- Uses `${config.prefixCls()}-timeline` by default and supports custom prefixing.

### Result

`Result` displays operation outcome feedback with status, title, subtitle, extra actions, and optional details.

#### Supported API

- `status?: 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500'`, default `'info'`
- `title?: JSX.Element`
- `subTitle?: JSX.Element`
- `icon?: JSX.Element`
- `extra?: JSX.Element`
- `prefixCls?: string`
- `children?: JSX.Element`
- common wrapper `div` HTML attributes where practical

#### Behavior

- Renders a status-specific icon when `icon` is not provided.
- Renders `title`, `subTitle`, `extra`, and `children` only when provided.
- Applies status class for visual styling.
- Uses `${config.prefixCls()}-result` by default and supports custom prefixing.

### Image

`Image` renders an image with optional placeholder, fallback-on-error, and a lightweight preview overlay.

#### Supported API

- `src?: string`
- `alt?: string`
- `width?: number | string`
- `height?: number | string`
- `fallback?: string`
- `placeholder?: JSX.Element | boolean`
- `preview?: boolean`, default `true`
- `prefixCls?: string`
- common wrapper `div` HTML attributes where practical
- image attributes through supported explicit props only for this MVP

#### Behavior

- Renders an image using `src`, `alt`, `width`, and `height`.
- Shows placeholder overlay until the image load event fires when `placeholder` is truthy.
- `placeholder=true` renders a default placeholder; a node renders custom placeholder content.
- On image error, switches to `fallback` when provided.
- When `preview !== false`, clicking the image opens a portal-backed preview overlay.
- Preview overlay shows the current image source, has a close button, and closes on backdrop click or Escape.
- Uses `${config.prefixCls()}-image` by default and supports custom prefixing.

## Styling Approach

Use the existing `@solid-ant-design/cssinjs` registration pattern and `useToken()`.

Class prefixes:

- `${prefix}-timeline`
- `${prefix}-result`
- `${prefix}-image`

Styles should align with existing token-driven components: compact spacing, token colors, clear disabled/error/status affordances, and simple responsive-friendly layout.

## Documentation

Add docs routes:

```text
apps/docs/src/routes/components/timeline.tsx
apps/docs/src/routes/components/result.tsx
apps/docs/src/routes/components/image.tsx
```

Docs navigation should place `Timeline` near data display components, `Result` near feedback components, and `Image` near display components.

## Testing

### Timeline Tests

- Renders basic items and labels.
- Supports `reverse` without mutating input.
- Supports `pending` and custom `pendingDot`.
- Supports `mode='alternate'` and item-level `position`.
- Supports semantic/custom colors and custom dots.
- Supports custom prefix and `ConfigProvider` prefix.

### Result Tests

- Renders default/info result content.
- Renders success/error/warning/http status classes.
- Supports custom icon.
- Renders title, subtitle, extra, and children.
- Supports custom prefix and `ConfigProvider` prefix.

### Image Tests

- Renders image attributes.
- Shows placeholder before load and hides it after load.
- Uses fallback after error.
- Opens and closes preview when enabled.
- Does not open preview when `preview=false`.
- Supports custom prefix and `ConfigProvider` prefix.

## Verification

Run after implementation:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```
