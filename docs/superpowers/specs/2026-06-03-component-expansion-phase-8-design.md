# Component Expansion Phase 8 Design

Date: 2026-06-03

## Goal

Expand `@ant-design-solid/core` with three additional Ant Design-style components that are useful, self-contained, and low-risk:

1. `Flex`
2. `Segmented`
3. `QRCode`

This phase prioritizes pragmatic MVP behavior, colocated tests, docs pages, and consistent prefix/style patterns. It avoids heavy third-party dependencies and avoids deep infrastructure changes.

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

### Flex

`Flex` is a lightweight wrapper around CSS flexbox with Ant Design-like props for direction, wrapping, alignment, gaps, and semantic element selection.

#### Supported API

- `vertical?: boolean`
- `wrap?: boolean | 'nowrap' | 'wrap' | 'wrap-reverse'`
- `justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'`
- `align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'`
- `gap?: 'small' | 'middle' | 'large' | number | [number, number]`, default `'middle'`
- `component?: keyof JSX.IntrinsicElements`, default `'div'`
- `prefixCls?: string`
- common wrapper HTML attributes where practical

#### Behavior

- Renders the requested HTML element through Solid's `Dynamic`.
- Applies `${config.prefixCls()}-flex` by default and supports custom `prefixCls`.
- `vertical` maps to `flex-direction: column`; otherwise direction is row.
- `wrap=true` maps to `flex-wrap: wrap`; string values map directly.
- `gap` uses the same small/middle/large token values as `Space`; number maps to both row and column gap; tuple maps to `[columnGap, rowGap]`.
- `justify` and `align` map to inline styles.
- User-provided `style` is merged after computed styles so callers can override computed values.

### Segmented

`Segmented` renders a single-select segmented control with controlled/uncontrolled value, disabled states, and keyboard navigation.

#### Supported API

- `options: SegmentedOption[]`
- `value?: string | number`
- `defaultValue?: string | number`
- `disabled?: boolean`
- `block?: boolean`
- `size?: 'small' | 'middle' | 'large'`
- `prefixCls?: string`
- `onChange?: (value: string | number) => void`
- common wrapper `div` HTML attributes where practical

```ts
export type SegmentedOption =
  | string
  | number
  | {
      label: JSX.Element
      value: string | number
      disabled?: boolean
      icon?: JSX.Element
      class?: string
    }
```

#### Behavior

- Normalizes primitive options into `{ label, value }` objects.
- Default selected value is `defaultValue` when valid, otherwise the first enabled option.
- Controlled `value` wins over internal state.
- Clicking an enabled option selects it and calls `onChange` only when the selected value changes.
- Disabled root or disabled option prevents selection.
- Renders `role="radiogroup"` on the root and `role="radio"` buttons for options.
- Arrow keys move to the next/previous enabled option; Home/End select first/last enabled option.
- Applies size, block, checked, and disabled classes.
- Uses `${config.prefixCls()}-segmented` by default and supports custom `prefixCls`.

### QRCode

`QRCode` renders a deterministic SVG QR-style matrix for a text value. The MVP focuses on a stable visual component without external QR encoding dependencies.

#### Supported API

- `value: string`
- `size?: number`, default `160`
- `color?: string`, default token text color
- `bgColor?: string`, default token container background
- `bordered?: boolean`, default `true`
- `icon?: string`
- `iconSize?: number`, default `size / 4`
- `status?: 'active' | 'expired' | 'loading'`, default `'active'`
- `statusRender?: (info: { status: QRCodeStatus }) => JSX.Element`
- `prefixCls?: string`
- common wrapper `div` HTML attributes where practical

#### Behavior

- Renders a square wrapper with inline width/height based on `size`.
- Renders an SVG matrix generated deterministically from `value`.
- Preserves three finder squares to make the output QR-like and visually scannable in layout demos, while not claiming standards-compliant QR encoding for arbitrary scanners.
- `status='loading'` overlays text `Loading...` by default.
- `status='expired'` overlays text `Expired` by default.
- `statusRender` customizes status overlay content.
- `icon` renders centered over the matrix with `iconSize`.
- `bordered=false` removes the bordered class.
- Uses `${config.prefixCls()}-qrcode` by default and supports custom `prefixCls`.

## Styling Approach

Use the existing `@ant-design-solid/cssinjs` registration pattern and `useToken()`.

Class prefixes:

- `${prefix}-flex`
- `${prefix}-segmented`
- `${prefix}-qrcode`

The new styles should use global tokens directly rather than adding new theme component token types in this phase. This keeps the phase small and avoids changing theme public types for MVP components.

## Documentation

Add docs routes:

```text
apps/docs/src/routes/components/flex.tsx
apps/docs/src/routes/components/segmented.tsx
apps/docs/src/routes/components/qrcode.tsx
```

Docs navigation should place `Flex` near layout components, `Segmented` near data entry components, and `QRCode` near display components.

## Testing

### Flex Tests

- Renders children and default classes.
- Supports vertical, wrap, justify, align, and numeric/tuple gaps.
- Supports semantic `component` prop.
- Merges caller style after computed style.
- Supports custom prefix and `ConfigProvider` prefix.

### Segmented Tests

- Renders primitive and object options.
- Selects first enabled option by default.
- Supports uncontrolled click selection and `onChange`.
- Supports controlled `value`.
- Prevents root-disabled and option-disabled selection.
- Supports keyboard Arrow/Home/End selection.
- Supports block, size, custom prefix, and `ConfigProvider` prefix.

### QRCode Tests

- Renders deterministic SVG matrix for a value.
- Applies size, color, background, and bordered classes.
- Supports `bordered=false`.
- Renders centered icon.
- Shows default loading and expired overlays.
- Supports custom `statusRender`.
- Supports custom prefix and `ConfigProvider` prefix.

## Verification

Run after implementation:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 COREPACK_ENABLE_PROJECT_SPEC=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 COREPACK_ENABLE_PROJECT_SPEC=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 COREPACK_ENABLE_PROJECT_SPEC=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 COREPACK_ENABLE_PROJECT_SPEC=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 COREPACK_ENABLE_PROJECT_SPEC=0 corepack pnpm -r build
```
