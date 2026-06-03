# Data Entry Phase 5 Design

Date: 2026-06-03

## Goal

Expand `@ant-design-solid/core` with two practical Ant Design-style data entry components:

1. `InputNumber`
2. `Cascader`

This phase prioritizes high-value form controls that fit the repository's current architecture without taking on the larger complexity of `Transfer` or `TreeSelect` yet.

## Existing Patterns To Follow

Each component uses the existing component folder layout:

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

Docs routes are auto-discovered by `apps/docs/src/site/routes.ts`; this file should not be edited unless route discovery stops working.

All new TypeScript source filenames must be lowercase kebab-case.

## Component Designs

### InputNumber

`InputNumber` provides numeric text entry with optional increment/decrement controls.

#### File Structure

```text
packages/components/src/input-number/index.ts
packages/components/src/input-number/interface.ts
packages/components/src/input-number/input-number.tsx
packages/components/src/input-number/input-number.style.ts
packages/components/src/input-number/__tests__/input-number.test.tsx
apps/docs/src/routes/components/input-number.tsx
```

#### Supported API

- `value?: number`
- `defaultValue?: number`
- `min?: number`
- `max?: number`
- `step?: number`, default `1`
- `precision?: number`
- `placeholder?: string`
- `disabled?: boolean`
- `size?: ComponentSize`
- `status?: 'error' | 'warning'`
- `controls?: boolean`, default `true`
- `formatter?: (value: number | undefined) => string`
- `parser?: (displayValue: string) => number | undefined`
- `onChange?: (value: number | undefined) => void`
- common input HTML attributes where practical

#### Behavior

- Supports controlled and uncontrolled value modes.
- Keeps a temporary display string while the user types so partial numeric input does not immediately collapse.
- On blur, normalizes the display string to `number | undefined` using `parser`, clamp, and precision rules.
- Increment/decrement controls adjust by `step`.
- `ArrowUp` and `ArrowDown` also increment and decrement.
- Values are clamped to `min` and `max` when committed through blur or controls.
- `precision` rounds committed values to the requested decimal places.
- `formatter` controls the rendered display value after commit or when controlled value changes.
- `parser` converts the display string to a number before commit; invalid parse results become `undefined`.
- `disabled` prevents typing, keyboard changes, and control button changes.
- Integrates with existing `Form.Item` through value and `onChange` semantics.
- Uses `${config.prefixCls()}-input-number` by default and supports custom prefixing through `ConfigProvider`.

#### Accessibility

- Renders an input with `role="spinbutton"`.
- Sets `aria-valuemin`, `aria-valuemax`, and `aria-valuenow` when values are available.
- Control buttons have descriptive labels: `increase value` and `decrease value`.
- Disabled state maps to native disabled and `aria-disabled` where relevant.

### Cascader

`Cascader` selects a value path from hierarchical options.

#### File Structure

```text
packages/components/src/cascader/index.ts
packages/components/src/cascader/interface.ts
packages/components/src/cascader/cascader.tsx
packages/components/src/cascader/cascader.style.ts
packages/components/src/cascader/__tests__/cascader.test.tsx
apps/docs/src/routes/components/cascader.tsx
```

#### Supported API

```ts
interface CascaderOption {
  label: JSX.Element
  value: OptionValue
  disabled?: boolean
  children?: CascaderOption[]
}
```

- `options?: CascaderOption[]`
- `value?: OptionValue[]`
- `defaultValue?: OptionValue[]`
- `open?: boolean`
- `defaultOpen?: boolean`
- `placeholder?: JSX.Element`
- `disabled?: boolean`
- `allowClear?: boolean`
- `changeOnSelect?: boolean`
- `expandTrigger?: 'click' | 'hover'`, default `click`
- `displayRender?: (labels: JSX.Element[], selectedOptions: CascaderOption[]) => JSX.Element`
- `onChange?: (value: OptionValue[], selectedOptions: CascaderOption[]) => void`
- `onOpenChange?: (open: boolean) => void`
- common div HTML attributes where practical

#### Behavior

- Supports controlled and uncontrolled value modes.
- Supports controlled and uncontrolled open modes.
- Renders selected path labels in the selector; otherwise renders `placeholder`.
- Opening the dropdown shows one menu column per active path depth.
- Selecting a non-leaf option expands the next column.
- Selecting a leaf option commits the full value path and closes the dropdown.
- When `changeOnSelect` is true, selecting any enabled option commits the current path; leaf selection still closes the dropdown.
- `expandTrigger="hover"` expands non-leaf options on pointer enter; click remains supported for selection and accessibility.
- Disabled options cannot expand or be selected.
- `allowClear` clears the selected path and selected options.
- `displayRender` customizes the selected display; otherwise labels are joined with `/`.
- Integrates with existing `Form.Item` through value and `onChange` semantics.
- Uses `${config.prefixCls()}-cascader` by default and supports custom prefixing through `ConfigProvider`.

#### Accessibility

- Selector uses `role="combobox"`, `aria-expanded`, and `aria-disabled`.
- Dropdown menus use `role="menu"` and options use `role="menuitem"`.
- Selected options expose `aria-selected`.
- `Escape` closes the dropdown.
- `Enter` while open selects the first enabled option in the current column as a basic keyboard path; richer roving focus is out of scope for this phase.

## Styling Approach

Use the existing `@ant-design-solid/cssinjs` registration pattern and tokens from `useToken()`.

Class prefixes:

- `ads-input-number` by default through `${prefixCls}-input-number`
- `ads-cascader` by default through `${prefixCls}-cascader`

Styling should align with current `Input` and `Select` components:

- Similar border, background, hover, disabled, size, and status treatment.
- `InputNumber` controls are inline buttons inside the affix wrapper.
- `Cascader` dropdown columns are compact bordered lists with active and selected states.

CSS numeric length values should use explicit `px` strings where needed. Unitless values such as opacity, z-index, flex, font-weight, and line-height should be strings when required by the local serializer.

## Documentation

Add docs routes:

```text
apps/docs/src/routes/components/input-number.tsx
apps/docs/src/routes/components/cascader.tsx
```

`InputNumber` docs should include:

- Basic usage
- Min/max/step
- Precision
- Formatter/parser
- Sizes and statuses
- Disabled and hidden controls
- Form usage note

`Cascader` docs should include:

- Basic usage
- Default value
- Change on select
- Hover expand
- Disabled option
- Custom display render
- Allow clear

Docs navigation should place these near form controls:

- `InputNumber` after `Input`
- `Cascader` near `Select`

## Testing

### InputNumber Tests

Cover:

- Rendering default value.
- Uncontrolled typing and blur normalization.
- Controlled mode calls `onChange` without changing value by itself.
- `min` and `max` clamping.
- Step controls.
- Keyboard `ArrowUp` and `ArrowDown`.
- `precision` rounding.
- `formatter` and `parser`.
- Disabled state prevents interactions.
- Size, status, and custom prefix classes.
- Basic `Form.Item` integration.

### Cascader Tests

Cover:

- Rendering placeholder and opening options.
- Uncontrolled leaf selection.
- Controlled value mode.
- Controlled open mode.
- `changeOnSelect` selecting an intermediate node.
- Disabled options cannot be selected.
- `allowClear` clears value.
- `displayRender` customizes selected text.
- `expandTrigger="hover"` expands on pointer enter.
- Escape closes the dropdown.
- Custom prefix classes.
- Basic `Form.Item` integration.

## Verification

After implementation, run the repository-required verification commands:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Focused commands may be used during development:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- input-number
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- cascader
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
```

## Out of Scope For Phase 5

- `Transfer`
- `TreeSelect`
- Multiple selection Cascader
- Cascader async loading
- Cascader search/filtering
- Full roving-focus keyboard navigation for Cascader
- InputNumber string-mode arbitrary precision arithmetic
- Locale-specific number formatting beyond user-provided `formatter` and `parser`
