# ant-design-solid Form Components Design

Date: 2026-06-01

## Summary

Add the next batch of Ant Design-inspired form components to `ant-design-solid`. This milestone expands the MVP component library from basic display/layout components into a standard usable form system.

The batch includes:

- `Form`
- `Form.Item`
- `Select`
- `Checkbox`
- `Checkbox.Group`
- `Radio`
- `Radio.Group`
- `Switch`
- `Input.TextArea`

The target is a standard form implementation: field registration, form state, synchronous validation, submit/reset APIs, and component integration through `Form.Item`. It should be powerful enough for common forms while avoiding complex Ant Design parity features that would make the batch too large.

## Current Context

The repository already has:

- pnpm workspace packages for `@solid-ant-design/core`, `@solid-ant-design/theme`, `@solid-ant-design/cssinjs`, `@solid-ant-design/icons`, and docs.
- Core components: `ConfigProvider`, `Button`, `Input`, `Space`, `Typography`, and `Grid`.
- Component patterns based on:
  - `interface.ts`
  - component implementation file
  - style registration file
  - `index.ts`
  - colocated tests
- A docs app with one page per existing component.

This milestone should follow those patterns instead of introducing a new component architecture.

## Goals

1. Implement a standard form state system for SolidJS.
2. Add high-frequency form controls that work both independently and inside `Form.Item`.
3. Extend theme component tokens for the new controls.
4. Add docs pages and examples for the new components.
5. Maintain current verification standards: tests, typecheck, build, and lint must pass.

## Non-goals

This milestone does not include:

- Full Ant Design form parity.
- `Form.List`.
- Nested array name paths.
- `dependencies` or dynamic dependent validation.
- Asynchronous validators.
- Complex preserve/unmount behavior.
- `DatePicker`, `Upload`, `Cascader`, or `TreeSelect`.
- Select search, multi-select, remote loading, or virtual scrolling.
- Pixel-perfect Ant Design styling.

## Form Architecture

### Public API

`@solid-ant-design/core` should export:

- `Form`
- `Form.Item`
- `useForm`
- `FormInstance`
- `FormProps`
- `FormItemProps`
- `Rule`
- related field value and error types

### Form responsibilities

`Form` owns a `FormInstance` and provides it through Solid context.

It supports:

- `form?: FormInstance`
- `initialValues?: Record<string, unknown>`
- `onFinish?: (values: Record<string, unknown>) => void`
- `onFinishFailed?: (errorInfo: ValidateErrorInfo) => void`
- `onValuesChange?: (changedValues, allValues) => void`
- `children`

`Form` renders a native `<form>` element by default and intercepts submit/reset events.

### Form instance

The form instance supports:

- `getFieldValue(name: string): unknown`
- `setFieldValue(name: string, value: unknown): void`
- `getFieldsValue(): Record<string, unknown>`
- `setFieldsValue(values: Record<string, unknown>): void`
- `resetFields(names?: string[]): void`
- `validateFields(names?: string[]): Promise<Record<string, unknown>>`
- `submit(): void`

The MVP uses string field names only. Dotted names such as `user.email` are treated as literal string keys, not nested paths.

### Field registration

`Form.Item name` registers a field with the parent form.

Each registered field stores:

- `name`
- `rules`
- `initialValue`
- current `errors`
- touched state
- validate status

`Form.Item` unregisters when disposed. Since complex preserve behavior is out of scope, unregistering removes the field metadata but does not need to implement advanced Ant Design preserve semantics.

### Form.Item rendering

`Form.Item` supports:

- `label`
- `name`
- `rules`
- `required`
- `help`
- `validateStatus`
- `valuePropName`
- `trigger`
- `initialValue`
- `children`

If `name` is present and the child is a supported form control, `Form.Item` injects:

- the field value through `valuePropName`
- a trigger handler through `trigger`
- status classes for styling

Default integration rules:

- `Checkbox` and `Switch`: `valuePropName = 'checked'`, `trigger = 'onChange'`
- Other controls: `valuePropName = 'value'`, `trigger = 'onChange'`

`Form.Item` displays validation errors under the control. Explicit `help` overrides the displayed help text. Explicit `validateStatus` overrides the derived status class.

### Validation

Validation is synchronous for this milestone. `validateFields` returns a promise for API ergonomics and future compatibility, but rules are evaluated immediately.

Supported rule fields:

- `required`
- `type: 'string' | 'number' | 'boolean' | 'array'`
- `min`
- `max`
- `len`
- `pattern`
- `message`
- `validator: (value, values) => string | void`

Validation behavior:

- Empty values fail `required`.
- `min`, `max`, and `len` apply to strings and arrays by length, and to numbers by numeric value.
- `pattern` applies to string values.
- Custom `validator` returns a string to indicate an error or `void` for success.
- The first failing rule determines the field error message.

`onFinish` runs only when all requested fields pass validation. `onFinishFailed` receives field errors and current values when validation fails.

## New Controls

### Checkbox

`Checkbox` supports:

- `checked`
- `defaultChecked`
- `disabled`
- `indeterminate`
- `onChange`
- `children`

It renders with Ant Design-like prefix classes and supports custom `prefixCls` through `ConfigProvider`.

`Checkbox.Group` supports:

- `value`
- `defaultValue`
- `options`
- `disabled`
- `onChange`

Group values are arrays of option values.

### Radio

`Radio` supports:

- `checked`
- `defaultChecked`
- `disabled`
- `value`
- `onChange`
- `children`

`Radio.Group` supports:

- `value`
- `defaultValue`
- `options`
- `disabled`
- `optionType?: 'default' | 'button'`
- `onChange`

The group stores a single selected option value.

### Switch

`Switch` supports:

- `checked`
- `defaultChecked`
- `disabled`
- `loading`
- `checkedChildren`
- `unCheckedChildren`
- `size`
- `onChange`

It behaves like a boolean form control and uses `checked` as its form value prop.

### Select

`Select` MVP supports single selection.

Props:

- `value`
- `defaultValue`
- `options`
- `placeholder`
- `disabled`
- `allowClear`
- `open`
- `defaultOpen`
- `onChange`
- `onOpenChange`

Behavior:

- Clicking the selector opens/closes the dropdown.
- Clicking an option selects it and closes the dropdown.
- `allowClear` clears the selected value.
- `Enter` selects the active option when open.
- `Escape` closes the dropdown.

Out of scope for this milestone:

- multiple mode
- tags mode
- search
- async loading
- option groups
- virtual scrolling

### Input.TextArea

Extend the existing `Input` export with:

```tsx
<Input.TextArea rows={4} showCount maxLength={100} />
```

`TextArea` supports:

- `value`
- `defaultValue`
- `placeholder`
- `disabled`
- `rows`
- `autoSize?: boolean | { minRows?: number; maxRows?: number }`
- `showCount`
- `maxLength`
- `onInput`
- `onChange`

`autoSize` is intentionally simple and predictable. It maps to rows/minRows/maxRows behavior rather than measuring scroll height dynamically.

## Theme and Styling

Extend `@solid-ant-design/theme` component tokens for:

- `Form`
- `Select`
- `Checkbox`
- `Radio`
- `Switch`
- `TextArea` where needed, or reuse `Input` tokens if sufficient

Styles must use the existing `@solid-ant-design/cssinjs` runtime and ConfigProvider token context.

Each component should expose Ant Design-like classes using the configured prefix:

- `ads-form`
- `ads-form-item`
- `ads-select`
- `ads-checkbox`
- `ads-radio`
- `ads-switch`
- `ads-input-textarea`

## Documentation

Add docs pages:

- `/components/form`
- `/components/select`
- `/components/checkbox`
- `/components/radio`
- `/components/switch`

Update docs navigation.

Update `InputPage` with a `TextArea` section instead of creating a separate TextArea page.

Each docs page should include:

- Basic usage.
- Disabled state where relevant.
- Form integration example.
- A short props summary or table.

## Testing Strategy

Add tests under the component folders.

Required test coverage:

- `Form` submits valid values.
- `Form` blocks submit and displays errors for failed rules.
- `Form` supports `setFieldValue`, `setFieldsValue`, `resetFields`, and `validateFields`.
- `Checkbox` controlled and uncontrolled behavior.
- `Checkbox.Group` array value updates.
- `Radio.Group` selected value updates.
- `Switch` checked state and disabled/loading behavior.
- `Select` opens, selects an option, closes, and clears.
- `Input.TextArea` renders rows, maxLength, and showCount.
- New controls work with custom `prefixCls` where practical.
- New controls can be controlled by `Form.Item` and included in submitted values.

## File Organization

Follow the existing component pattern:

```txt
packages/components/src/<component>/
  interface.ts
  <Component>.tsx
  <component>.style.ts
  index.ts
  __tests__/
```

`Form` may add focused helper files if needed, such as:

- `store.ts`
- `validation.ts`
- `context.tsx`

Shared helpers can be placed under `packages/components/src/shared/` only when reused by more than one component.

## Verification

The implementation is complete only when these commands pass from the repository root:

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm lint
```

## Spec Self-Review

- Placeholder scan: no placeholders or TODOs remain.
- Scope check: the work is focused on standard form components and explicitly excludes advanced Ant Design parity features.
- Consistency check: the form integration protocol is used consistently across controls.
- Ambiguity check: field names are explicitly string-only for this milestone, validation is explicitly synchronous, and Select is explicitly single-select only.
