# Form antd Common API Parity Design

Date: 2026-06-06

## Summary

Upgrade the current lightweight `Form` implementation in `@solid-ant-design/core` to cover the common Ant Design Form API surface used in real business forms. The design keeps the public API close to Ant Design while using a Solid-native signal/store implementation internally.

The recommended implementation route is a staged rewrite of the Form core into focused modules, rather than continuing to grow the current single `store.ts` implementation. This makes nested `NamePath`, async validation, dependencies, `Form.List`, and field status APIs easier to reason about and test.

## Current Context

The repository currently has a lightweight form system under `packages/components/src/form`:

- `interface.ts` defines `FieldName = string`, flat `FormValues`, basic `Rule`, `FormProps`, `FormItemProps`, and `FormInstance`.
- `store.ts` owns flat values, registered field metadata, error signals, initial values, and callbacks.
- `form.tsx` renders a native `<form>`, provides context, and handles submit/reset.
- `form-item.tsx` registers fields, exposes a render-prop control, reads errors, and displays label/help/error state.
- `validation.ts` performs synchronous first-error validation.
- The current docs and tests cover basic submit, reset, synchronous validation, `valuePropName`, `trigger`, and render-prop controls.

The original Form component design intentionally excluded full Ant Design parity, including nested name paths, `Form.List`, dependencies, and async validators. This design supersedes that non-goal for a new parity-focused milestone.

## Goals

1. Support Ant Design-style nested field paths through `NamePath`.
2. Add field state APIs: errors, warnings, touched, validating, validated, and dirty.
3. Expand `FormInstance` with common Ant Design methods.
4. Add async validation and common `Rule` fields.
5. Enhance `Form.Item` with common binding, dependency, validation, and rendering props.
6. Add `Form.List` and `Form.ErrorList` for dynamic array fields.
7. Add Solid-native equivalents for common Form hooks.
8. Add common layout props and docs examples.
9. Preserve existing basic use cases and keep current examples working where possible.

## Non-goals

This milestone does not target exact 100% Ant Design parity. The following are explicitly deferred:

- Full `fields` controlled mode.
- `Form.Provider`.
- Complete `scrollToField` behavior with all scrolling edge cases.
- `feedbackIcons`.
- Complete semantic `classNames` and `styles` coverage.
- Pixel-perfect behavior for every Ant Design edge case.
- Directly importing or depending on React-oriented `rc-field-form`.

## Proposed Architecture

Refactor `packages/components/src/form` into smaller, testable modules:

```txt
packages/components/src/form/
  index.ts
  interface.ts
  name-path.ts
  value-util.ts
  field-store.ts
  validation.ts
  store.ts
  context.tsx
  form.tsx
  form-item.tsx
  form-list.tsx
  form-error-list.tsx
  use-watch.ts
  form.style.ts
  __tests__/
```

### Module Responsibilities

| File                  | Responsibility                                                                         |
| --------------------- | -------------------------------------------------------------------------------------- |
| `interface.ts`        | Public types: `NamePath`, `Rule`, `FieldData`, `FormInstance`, props, validation info. |
| `name-path.ts`        | Normalize, compare, serialize, and compose field paths.                                |
| `value-util.ts`       | Read, write, delete, clone, and merge nested form values.                              |
| `field-store.ts`      | Internal field entities, field states, watchers, and dependency notifications.         |
| `validation.ts`       | Async rule evaluation, warning support, validate config handling.                      |
| `store.ts`            | `createFormInstance`, `useForm`, callback wiring, and the public form instance.        |
| `context.tsx`         | Form context, Form.Item status context, and Form.List context.                         |
| `form.tsx`            | Root form component, layout context, submit/reset handling.                            |
| `form-item.tsx`       | Field registration, control binding, dependencies, status display.                     |
| `form-list.tsx`       | Array field management and stable list field keys.                                     |
| `form-error-list.tsx` | Error list rendering for `Form.List`.                                                  |
| `use-watch.ts`        | Solid-native field value watching.                                                     |
| `form.style.ts`       | Form layout, item, explain, warning, hidden, and no-style related styles.              |

The internal model should be Solid-native. Do not port React lifecycle assumptions from `rc-field-form`; use Solid signals, accessors, effects, and context.

## Public Type Model

### NamePath

Add Ant Design-style field paths:

```ts
export type NamePath = string | number | Array<string | number>
export type InternalNamePath = Array<string | number>
export type FieldName = NamePath
```

Rules:

- `getNamePath('user')` returns `['user']`.
- `getNamePath(0)` returns `[0]`.
- `getNamePath(['users', 0, 'name'])` returns `['users', 0, 'name']`.
- Internal map keys must be collision-safe. Do not use a simple dot join because `['a.b']` and `['a', 'b']` would collide.
- Use a stable escaped serialization helper, such as JSON-stringifying path segments, for map keys.

### FormValues

Continue exporting:

```ts
export type FormValues = Record<string, unknown>
```

Internally, values must support nested objects and arrays. Example:

```ts
form.setFieldValue(['user', 'email'], 'hello@example.com')
form.getFieldsValue(true)
// { user: { email: 'hello@example.com' } }
```

## Internal Store Model

The store should track values, field registrations, and field state separately:

```ts
interface FieldEntity {
  namePath: InternalNamePath
  key: string
  rules: Accessor<Rule[]>
  dependencies?: Accessor<NamePath[] | undefined>
  preserve?: Accessor<boolean | undefined>
  initialValue?: Accessor<unknown>
  validateTrigger?: Accessor<string | string[] | undefined>
  onStoreChange?: (info: StoreChangeInfo) => void
}

interface FieldState {
  namePath: InternalNamePath
  touched: boolean
  validating: boolean
  validated: boolean
  dirty: boolean
  errors: string[]
  warnings: string[]
}

interface FormStoreSnapshot {
  values: FormValues
  initialValues: FormValues
  fields: Map<string, FieldEntity>
  states: Map<string, FieldState>
}
```

Implementation may use signals and mutable maps internally, but public reads must return cloned or stable external values where appropriate.

### Store Update Flow

#### `setFieldValue(name, value)`

1. Normalize `name` into an internal path.
2. Write `value` into nested `values`.
3. Mark the field touched and dirty.
4. Reset that field's validation messages, matching Ant Design's common behavior for programmatic value updates.
5. Trigger `onValuesChange` with nested changed values and all values.
6. Notify watchers.
7. Notify affected fields: the changed field, fields depending on it, list descendants, and `shouldUpdate` items.

#### `setFieldsValue(values)`

1. Deep merge incoming values into current values.
2. Compute changed paths.
3. Reset validation messages for changed registered fields.
4. Trigger `onValuesChange` with the provided nested structure and all values.
5. Notify affected fields and watchers.

#### `setFields(fields)`

Allow setting field state directly:

- `value`
- `errors`
- `warnings`
- `touched`
- `validating`

If `value` is present, update the value store and notify value watchers.

#### `resetFields(names?)`

1. If names are provided, reset those paths; otherwise reset registered fields.
2. Field-level `initialValue` overrides missing form-level values for that field.
3. Reset errors, warnings, touched, validating, validated, and dirty state.
4. Notify affected fields and watchers.

## FormInstance API

Support this common subset:

```ts
export interface FormInstance {
  getFieldValue: (name: NamePath) => unknown
  getFieldsValue: (nameList?: true | NamePath[]) => FormValues
  getFieldError: (name: NamePath) => string[]
  getFieldsError: (nameList?: NamePath[]) => FieldError[]
  isFieldTouched: (name: NamePath) => boolean
  isFieldsTouched: (nameList?: NamePath[], allTouched?: boolean) => boolean
  isFieldValidating: (name: NamePath) => boolean

  setFieldValue: (name: NamePath, value: unknown) => void
  setFieldsValue: (values: FormValues) => void
  setFields: (fields: FieldData[]) => void

  resetFields: (names?: NamePath[]) => void
  validateFields: (names?: NamePath[], config?: ValidateConfig) => Promise<FormValues>
  submit: () => void

  scrollToField?: (name: NamePath, options?: ScrollOptions | { focus?: boolean }) => void
  getFieldInstance?: (name: NamePath) => unknown
}
```

### Intentional Compatibility Note

The current implementation returns an `Accessor<string[]>` from `getFieldError`. The parity design changes `getFieldError` to return `string[]`, matching Ant Design.

To preserve a reactive advanced escape hatch, add an internal or public helper with a distinct name:

```ts
getFieldErrorAccessor?: (name: NamePath) => Accessor<string[]>
```

`Form.Item` and `Form.Item.useStatus` should use reactive status context instead of depending on the public `getFieldError` return type.

## Validation Design

Upgrade validation to async-first rules:

```ts
export type Rule = RuleConfig | ((form: FormInstance) => RuleConfig)

export interface RuleConfig {
  required?: boolean
  type?: string
  enum?: unknown[]
  len?: number
  min?: number
  max?: number
  pattern?: RegExp
  whitespace?: boolean
  transform?: (value: unknown) => unknown
  message?: JSX.Element
  warningOnly?: boolean
  validateTrigger?: string | string[]
  validator?: (rule: RuleConfig, value: unknown) => void | string | Promise<void>
  fields?: Record<string, Rule>
  defaultField?: Rule
}

export interface ValidateConfig {
  validateOnly?: boolean
  recursive?: boolean
  dirty?: boolean
}
```

### Rule Behavior

- Validation always runs through an async pipeline.
- `required` fails for `undefined`, `null`, empty string, or empty array.
- `whitespace` fails for whitespace-only strings when enabled.
- `type` supports common values first: `string`, `number`, `boolean`, `array`, `object`, `email`, `url`, `enum`.
- `enum` requires the transformed value to match one of the configured values.
- `min`, `max`, and `len` apply to string length, array length, or numeric value.
- `pattern` applies to strings.
- `transform` maps a value before the rule checks it.
- `validator` may return `void`, return a string error, throw, reject, or resolve.
- `warningOnly` stores a warning and does not block submit.

### Validation Options

- `validateFirst: true` stops after the first error for a field.
- `validateFirst: 'parallel'` runs rules in parallel and reports the first failure.
- Default behavior runs sequentially and collects rule errors.
- `validateOnly` validates without updating UI errors or warnings.
- `dirty` validates only fields that are touched or previously validated.
- `recursive` validates descendant fields when a parent path is supplied.

### Async Race Handling

Each field should maintain a validation sequence id. When async validation resolves, only the latest sequence may update field state. Older results are ignored to prevent stale errors.

## Form.Item Design

Expand `FormItemProps` with common Ant Design props:

```ts
export interface FormItemProps {
  name?: NamePath
  label?: JSX.Element
  rules?: Rule[]
  dependencies?: NamePath[]
  shouldUpdate?: boolean | ((prevValues: FormValues, nextValues: FormValues) => boolean)

  getValueFromEvent?: (...args: unknown[]) => unknown
  getValueProps?: (value: unknown) => Record<string, unknown>
  normalize?: (value: unknown, prevValue: unknown, prevValues: FormValues) => unknown

  validateTrigger?: string | string[]
  validateFirst?: boolean | 'parallel'
  validateDebounce?: number

  valuePropName?: string
  trigger?: string
  initialValue?: unknown
  preserve?: boolean

  noStyle?: boolean
  hidden?: boolean
  help?: JSX.Element
  extra?: JSX.Element
  validateStatus?: ValidateStatus
  required?: boolean

  labelCol?: unknown
  wrapperCol?: unknown
  labelAlign?: 'left' | 'right'
  colon?: boolean
  tooltip?: JSX.Element

  children?: JSX.Element | ((control: FormItemControl) => JSX.Element)
}
```

`labelCol` and `wrapperCol` can be typed to the repository's Grid/Col prop model once that type is available and stable.

### Field Binding Flow

1. Read the current field value from the form.
2. Generate child value props:
   - Use `getValueProps(value)` when present.
   - Otherwise use `{ [valuePropName]: value }`.
3. When the configured `trigger` fires:
   - Use `getValueFromEvent(...args)` when present.
   - Otherwise infer from `event.currentTarget` or `event.target` using `valuePropName`.
   - Run `normalize(nextValue, previousValue, previousValues)` when present.
   - Call `form.setFieldValue(name, normalizedValue)`.
   - If the trigger matches `validateTrigger`, validate the field.
4. Update dependent fields and `shouldUpdate` subscribers.

### Solid-specific Binding Strategy

Solid cannot rely on React `cloneElement` semantics. Keep the current render-prop control API as the most reliable binding mechanism:

```tsx
<Form.Item name="username">
  {(control) => <Input value={control.value()} onChange={control.onChange} />}
</Form.Item>
```

Internal components that already know about `Form.Item` can continue using `useFormItemControl()` for automatic integration. Any child prop injection should be best-effort and should not replace the render-prop and context-based path.

### Status Rendering

- Explicit `validateStatus` overrides derived state.
- Errors produce `error` status.
- Warnings produce `warning` status when there are no errors.
- `validating` status is shown while async validation is pending.
- `help` overrides generated error display.
- `extra` renders in addition to help/error text.

### `noStyle` and `hidden`

- `noStyle` registers and controls a field without rendering the styled `.ant-form-item` wrapper.
- `hidden` keeps field registration and validation but hides the visual output.
- `noStyle` fields may inherit parent Form.Item status through context when appropriate.

## Form Hooks

### Static Form Members

Attach common members to `Form`:

```ts
export const Form = Object.assign(FormRoot, {
  Item: FormItem,
  List: FormList,
  ErrorList: FormErrorList,
  useForm,
  useFormInstance,
  useWatch,
})
```

Continue named exports for existing consumers:

```ts
export { useForm, createFormInstance, useFormItemControl }
```

### `Form.useFormInstance`

```ts
function useFormInstance(): FormInstance
```

Reads the nearest form context. If no context exists, throw a clear development error.

### `Form.useWatch`

Solid-native signature:

```ts
function useWatch(
  namePath: NamePath | ((values: FormValues) => unknown),
  formOrOptions?: FormInstance | WatchOptions,
): Accessor<unknown>
```

`useWatch` should return an `Accessor`, not a raw value, because that matches Solid usage:

```tsx
const username = Form.useWatch('username', form)
createEffect(() => console.log(username()))
```

Support selector functions and `preserve` watch options:

```ts
export interface WatchOptions {
  form?: FormInstance
  preserve?: boolean
}
```

### `Form.Item.useStatus`

Attach `useStatus` to `Form.Item`:

```ts
function useStatus(): {
  status: Accessor<ValidateStatus | undefined>
  errors: Accessor<JSX.Element[]>
  warnings: Accessor<JSX.Element[]>
}
```

It reads the nearest item status context.

## Form.List Design

Add dynamic array field support:

```tsx
<Form.List name="users" initialValue={[{ name: '' }]}>
  {(fields, operation, meta) => (
    <>
      {fields.map((field) => (
        <Form.Item name={[field.name, 'name']}>
          <Input />
        </Form.Item>
      ))}
      <Button onClick={() => operation.add()}>Add</Button>
      <Form.ErrorList errors={meta.errors} />
    </>
  )}
</Form.List>
```

Types:

```ts
export interface FormListField {
  key: number
  name: number
  fieldKey: number
}

export interface FormListOperation {
  add: (defaultValue?: unknown, insertIndex?: number) => void
  remove: (index: number | number[]) => void
  move: (from: number, to: number) => void
}

export interface FormListMeta {
  errors: JSX.Element[]
  warnings: JSX.Element[]
}
```

### List Behavior

- `Form.List name` points to an array value.
- The list keeps stable internal keys separate from array indexes.
- `add`, `remove`, and `move` update the array value and key mapping together.
- Child `Form.Item` paths are composed with the parent list path through List context.
  - Parent list: `['users']`
  - Child item: `[0, 'name']`
  - Final field path: `['users', 0, 'name']`
- Nested lists should work through recursive List context composition.
- `Form.Item initialValue` under `Form.List` should not be the preferred path; list `initialValue` or form `initialValues` should own initial array values.

## Form.ErrorList Design

Add a small component:

```ts
export interface FormErrorListProps {
  errors?: JSX.Element[]
  warnings?: JSX.Element[]
}
```

Render errors and warnings with form explain classes. It is primarily for `Form.List` rules but can be generally useful.

## Layout Design

Add common layout props to `FormProps`:

```ts
export interface FormProps extends JSX.FormHTMLAttributes<HTMLFormElement> {
  form?: FormInstance
  initialValues?: FormValues
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelAlign?: 'left' | 'right'
  labelCol?: unknown
  wrapperCol?: unknown
  colon?: boolean
  requiredMark?: boolean | 'optional'
  validateTrigger?: string | string[]
  onFinish?: (values: FormValues) => void
  onFinishFailed?: (errorInfo: ValidateErrorInfo) => void
  onValuesChange?: (changedValues: FormValues, allValues: FormValues) => void
  onFieldsChange?: (changedFields: FieldData[], allFields: FieldData[]) => void
  children?: JSX.Element
}
```

CSS classes:

- `${prefixCls}-horizontal`
- `${prefixCls}-vertical`
- `${prefixCls}-inline`
- `${prefixCls}-item-no-style`
- `${prefixCls}-item-hidden`
- `${prefixCls}-item-has-error`
- `${prefixCls}-item-has-warning`
- `${prefixCls}-item-is-validating`

`requiredMark` behavior:

- `true`: show required mark for required fields.
- `false`: hide required marks.
- `'optional'`: show optional text for non-required fields.

## Compatibility and Migration

1. Keep string field names working. A string is simply a one-segment `NamePath`.
2. Keep current exports: `Form`, `FormItem`, `useForm`, `createFormInstance`, `useFormItemControl`, and existing type names.
3. Keep current render-prop `FormItemControl` shape where possible:
   - `value: Accessor<unknown>`
   - `valuePropName: Accessor<string>`
   - `trigger: Accessor<string>`
   - `onChange(nextOrEvent)`
   - `setFieldValueFromControl(nextOrEvent)`
   - `errors: Accessor<string[]>`
   - `status: Accessor<ValidateStatus | undefined>`
4. Change `getFieldError` to Ant Design's non-reactive return type, and add a separate reactive helper if needed.
5. Existing docs examples should continue to work with minimal edits.
6. Tests that currently call `form.getFieldError('a')()` should be updated to `form.getFieldError('a')` or to the new reactive helper depending on intent.

## Testing Strategy

### Unit Tests: `name-path.ts` and `value-util.ts`

- Normalize string, number, and array paths.
- Serialize paths without collision.
- Compare exact paths.
- Check parent/child path relationships.
- Get nested object and array values.
- Set nested object and array values.
- Delete nested values.
- Deep merge values.

### Unit Tests: FormInstance

- Nested `getFieldValue` and `setFieldValue`.
- `getFieldsValue()` only returns registered fields.
- `getFieldsValue(true)` returns all values.
- `getFieldsValue(nameList)` returns selected nested values.
- `setFields` sets value, errors, warnings, touched, and validating.
- `getFieldsError` returns selected errors.
- `isFieldTouched` and `isFieldsTouched` work with `allTouched`.
- `isFieldValidating` reflects async validation state.
- `resetFields` handles nested fields and item-level initial values.

### Unit Tests: Validation

- `required`, `type`, `enum`, `len`, `min`, `max`, `pattern`, `whitespace`.
- `transform` before validation.
- Async validator resolve, reject, throw, and returned string.
- `warningOnly` does not block submit.
- `validateFirst` sequential and parallel behavior.
- `validateOnly` does not update UI state.
- `dirty` validates only dirty fields.
- `recursive` validates descendants.
- Stale async validations do not overwrite newer results.

### Component Tests: Form.Item

- `getValueFromEvent` transforms event arguments.
- `getValueProps` controls child props.
- `normalize` sees next value, previous value, and previous values.
- `validateTrigger` controls when validation runs.
- `dependencies` revalidates dependent fields.
- `shouldUpdate` render areas update as expected.
- `noStyle` registers without wrapper markup.
- `hidden` hides while preserving collection and validation.
- `preserve` keeps or removes values on unmount based on prop.
- `extra`, warning status, validating status, and help priority render correctly.

### Component Tests: Form.List and ErrorList

- `initialValue` initializes array fields.
- `add` appends and inserts values.
- `remove` handles one index and multiple indexes.
- `move` reorders values and field keys.
- Nested item submit shape matches expected array values.
- List-level validation errors render with `Form.ErrorList`.
- Nested list contexts compose paths correctly.

### Hook Tests

- `Form.useFormInstance` returns the parent form.
- `Form.useWatch` watches a field path.
- `Form.useWatch` selector watches derived values.
- `Form.useWatch` supports preserve option.
- `Form.Item.useStatus` returns reactive status, errors, and warnings.

### Regression Tests

- Current basic form submission works.
- Current required validation works.
- Current `valuePropName="checked"` examples work.
- Current `trigger="onBlur"` behavior works.
- Current `initialValues`, `initialValue`, `resetFields`, `setFieldsValue`, and render-prop custom controls work.

## Implementation Phases

### Phase 1: Core v2

Deliver the internal foundation without large UI changes.

Scope:

- `NamePath` and path utilities.
- Nested value utilities.
- Field state model.
- Expanded FormInstance methods:
  - `getFieldsError`
  - `setFields`
  - `isFieldTouched`
  - `isFieldsTouched`
  - `isFieldValidating`
  - `getFieldsValue(true | nameList?)`
- Preserve existing submit, reset, initial value, and value change behavior.

Exit criteria:

- Existing Form tests pass after expected API adjustments.
- New nested path and FormInstance tests pass.

### Phase 2: Validation v2 and Form.Item Enhancements

Scope:

- Async validation pipeline.
- `warningOnly`.
- `validateFirst`.
- `validateTrigger`.
- `validateOnly`, `dirty`, and `recursive`.
- `dependencies`.
- `getValueFromEvent`.
- `getValueProps`.
- `normalize`.
- `Form.useFormInstance`.
- `Form.useWatch`.
- `Form.Item.useStatus`.

Exit criteria:

- Async validation and stale-result tests pass.
- Dependency and watch examples work in docs or demos.

### Phase 3: Dynamic Fields

Scope:

- `Form.List`.
- `Form.ErrorList`.
- `add`, `remove`, and `move` operations.
- List path context composition.
- `preserve`.
- `noStyle`.
- `hidden`.
- `shouldUpdate`.

Exit criteria:

- Dynamic list tests pass.
- Nested array submit shape matches Ant Design-style expectations.

### Phase 4: Layout, Docs, and Polish

Scope:

- `layout`.
- `labelCol`.
- `wrapperCol`.
- `labelAlign`.
- `colon`.
- `requiredMark`.
- `onFieldsChange`.
- API docs table expansion.
- Demos for nested form, async validation, dependencies, dynamic list, useWatch, and layout variants.

Exit criteria:

- Docs page documents implemented APIs accurately.
- Visual layout examples are usable and consistent with the component library style.

## Risks and Mitigations

| Risk                                                      | Mitigation                                                                                    |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Solid does not support React-style child cloning cleanly. | Keep render-prop and context-based binding as first-class integration paths.                  |
| Store complexity grows quickly.                           | Keep name path, value utilities, field store, validation, and list logic in separate modules. |
| `getFieldError` return type change breaks tests/users.    | Document the parity change and provide a distinct reactive helper for advanced users.         |
| Async validation races produce stale errors.              | Track per-field validation sequence ids and ignore old results.                               |
| `Form.List` key/index behavior is error-prone.            | Keep stable list keys separate from array indexes and test add/remove/move thoroughly.        |
| Scope is too large for one implementation batch.          | Implement in four phases with tests and docs at each phase.                                   |

## Verification

After implementation phases that modify TypeScript files, run the repository verification commands required by `AGENTS.md`:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```
