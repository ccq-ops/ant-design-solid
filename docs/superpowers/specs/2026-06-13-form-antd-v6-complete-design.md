# Form Ant Design v6 Complete Parity Design

Date: 2026-06-13

## Summary

Upgrade `@solid-ant-design/core` Form from its current common Ant Design subset to a Solid-native implementation of the remaining Ant Design v6 Form API surface. This spec supersedes the earlier Form parity specs that explicitly deferred `fields`, `Form.Provider`, `feedbackIcons`, semantic `classNames/styles`, and full docs parity.

The implementation should preserve the existing self-contained Solid form store. It should not introduce `rc-field-form` or a React compatibility layer. Public APIs should match Ant Design v6 concepts while using Solid conventions such as `class`, `JSX.Element`, signals, accessors, context, and render functions.

## Current Context

The Form implementation lives under `packages/components/src/form`:

- `interface.ts` defines public types for `NamePath`, `Rule`, `FormInstance`, `FormProps`, `FormItemProps`, list types, and status types.
- `store.ts` owns nested values, field records, validation state, form callbacks, subscriptions, field instances, and public form methods.
- `form.tsx` renders a native `<form>` and provides form and layout context.
- `form-item.tsx` registers fields, exposes a `FormItemControl`, handles value extraction, validation triggers, label rendering, and explain text.
- `form-list.tsx` implements array fields with stable keys and list operations.
- `form-error-list.tsx` renders list errors and warnings.
- `use-watch.ts` returns a Solid accessor for watched form values.
- `form.style.ts` maps Form styles to theme tokens.

The docs page is `apps/docs/src/pages/components/form.mdx`. It already contains many Form examples and an API table, but it does not document the remaining Ant Design v6 parity API.

The theme token definitions for Form are currently narrow:

- `labelColor`
- `labelRequiredMarkColor`
- `itemMarginBottom`
- `verticalLabelPadding`
- `explainColor`

## Goals

1. Add the missing Ant Design v6 Form root APIs:
   - `classNames`
   - `styles`
   - `disabled`
   - `component`
   - `fields`
   - `feedbackIcons`
   - `labelWrap`
   - `name`
   - `preserve`
   - `scrollToFirstError`
   - `size`
   - `tooltip`
   - `validateMessages`
   - `variant`
   - `clearOnDestroy`
2. Add the missing Ant Design v6 `Form.Item` APIs:
   - `hasFeedback`
   - `htmlFor`
   - `messageVariables`
   - `layout`
   - `classNames`
   - `styles`
3. Extend existing API shapes:
   - `requiredMark` supports a render function.
   - `tooltip` supports object form with custom icon.
   - `label={null}` preserves label alignment space.
   - `Rule.message` supports `JSX.Element`.
   - Rule `type` supports a wider async-validator-like set.
4. Add `Form.Provider` with:
   - `onFormChange`
   - `onFormFinish`
5. Add Ant Design v6 `getFieldsValue` overloads:
   - `getFieldsValue(nameList?: true | NamePath[], filterFunc?: FilterFunc)`
   - `getFieldsValue({ strict?: boolean; filter?: FilterFunc })`
6. Correct `Form.useWatch` `preserve` semantics while keeping the Solid return type as `Accessor<unknown>`.
7. Add Form-level `disabled`, `size`, and `variant` propagation for controls that already integrate with Form.
8. Expand Form component tokens to better align with Ant Design's Form token naming and defaults while keeping existing token names backward compatible.
9. Update Form docs examples and API tables to match the new API surface using Solid syntax.

## Non-Goals

- Do not port React `rc-field-form`.
- Do not implement exact React ref forwarding semantics. Solid refs should follow this repository's conventions.
- Do not update unrelated components that have no current Form integration.
- Do not rename existing TypeScript files unless required by the change.
- Do not use React prop spelling in public Solid examples; use `class`, not `className`.

## Solid API Adaptation Rules

The public surface should stay recognizable to Ant Design users, but implementation and examples must be Solid-native:

- Use `class` in examples and JSX output.
- Use `JSX.Element` and `JSX.CSSProperties` instead of React node and CSS types.
- `Form.useWatch` returns an accessor.
- `Form.Item.useStatus` continues to return accessors for `status`, `errors`, and `warnings`.
- Semantic `classNames` and `styles` follow existing repository patterns:

```ts
export type SemanticInfo<P> = { props: P }
export type SemanticClassNamesConfig<P, T> = T | ((info: SemanticInfo<P>) => T)
export type SemanticStylesConfig<P, T> = T | ((info: SemanticInfo<P>) => T)
```

- `component` accepts a Solid component, an intrinsic element name, or `false`. `false` should render no root DOM element while still providing contexts and callbacks.

## Public Types

### Semantic Slots

Add stable semantic slots for Form:

```ts
export type FormSemanticSlot = 'root'

export type FormItemSemanticSlot =
  | 'root'
  | 'label'
  | 'content'
  | 'help'
  | 'helpItem'
  | 'extra'
  | 'feedbackIcon'
```

Root Form slots intentionally start with `root` only because the Form root owns only the outer element. Form.Item owns label, content, help, and extra DOM slots.

### Required Mark

Extend:

```ts
export type RequiredMark =
  | boolean
  | 'optional'
  | ((label: JSX.Element, info: { required: boolean }) => JSX.Element)
```

### Tooltip

Add:

```ts
export interface FormTooltipProps {
  title?: JSX.Element
  icon?: JSX.Element
}

export type FormTooltip = JSX.Element | FormTooltipProps
```

If the tooltip value is an object, render `icon` when provided. Otherwise render a default help indicator using existing icon assets if one exists in `@solid-ant-design/icons`; if no suitable icon exists, render the title directly in the tooltip slot without inventing a new SVG.

### Feedback Icons

Add:

```ts
export type FeedbackIconRender = (info: {
  status: ValidateStatus
  errors: JSX.Element[]
  warnings: JSX.Element[]
}) => Partial<Record<ValidateStatus, JSX.Element>>

export type FeedbackIcons = Partial<Record<ValidateStatus, JSX.Element>> | FeedbackIconRender

export type FormItemHasFeedback = boolean | { icons?: FeedbackIcons }
```

Resolution order:

1. `Form.Item hasFeedback={{ icons }}`
2. `Form feedbackIcons`
3. default icons from the icon package

### Form Root Props

Extend `FormProps` with:

```ts
classNames?: SemanticClassNamesConfig<FormProps, Partial<Record<FormSemanticSlot, string>>>
styles?: SemanticStylesConfig<FormProps, Partial<Record<FormSemanticSlot, JSX.CSSProperties>>>
disabled?: boolean
component?: keyof JSX.IntrinsicElements | ((props: JSX.HTMLAttributes<HTMLElement>) => JSX.Element) | false
fields?: FieldData[]
feedbackIcons?: FeedbackIcons
labelWrap?: boolean
name?: string
preserve?: boolean
scrollToFirstError?: boolean | ScrollIntoViewOptions | { focus?: boolean }
size?: ComponentSize
tooltip?: FormTooltipProps
validateMessages?: ValidateMessages
variant?: 'outlined' | 'borderless' | 'filled' | 'underlined'
clearOnDestroy?: boolean
```

`size` uses the theme package `ComponentSize`. It maps `middle` to Ant Design's default-sized controls.

### Form.Item Props

Extend `FormItemProps` with:

```ts
classNames?: SemanticClassNamesConfig<FormItemProps, Partial<Record<FormItemSemanticSlot, string>>>
styles?: SemanticStylesConfig<FormItemProps, Partial<Record<FormItemSemanticSlot, JSX.CSSProperties>>>
hasFeedback?: FormItemHasFeedback
htmlFor?: string
messageVariables?: Record<string, string>
layout?: 'horizontal' | 'vertical'
```

`layout` only accepts `horizontal` or `vertical`, matching Ant Design's item-level API.

### Form Provider

Add:

```ts
export interface FormProviderProps {
  onFormChange?: (
    name: string,
    info: { changedFields: FieldData[]; forms: Record<string, FormInstance> },
  ) => void
  onFormFinish?: (
    name: string,
    info: { values: FormValues; forms: Record<string, FormInstance> },
  ) => void
  children?: JSX.Element
}
```

Export it as:

```ts
Form.Provider = FormProvider
export { FormProvider }
```

### GetFieldsValue

Add:

```ts
export type FilterFunc = (meta: { touched: boolean; validating: boolean }) => boolean

export interface GetFieldsValueConfig {
  strict?: boolean
  filter?: FilterFunc
}
```

The overloads should be:

```ts
getFieldsValue(): FormValues
getFieldsValue(nameList: true): FormValues
getFieldsValue(nameList: NamePath[], filterFunc?: FilterFunc): FormValues
getFieldsValue(config: GetFieldsValueConfig): FormValues
```

`strict: true` returns only registered item paths. Without `strict`, selected parent/list values may include unregistered nested values if they are present in the store.

## Store Design

### Field Registration

Extend field metadata to include:

- `preserve`
- `messageVariables`
- `validateTrigger`
- `validateFirst`
- dependencies
- item-level `initialValue`

Form root should provide a default `preserve` value. Field-level `preserve` overrides it.

When a field unregisters:

- Keep its value if effective preserve is `true`.
- Delete its value if effective preserve is `false`.
- Notify subscribers and provider change listeners when deletion changes values.

### Controlled Fields

`fields` is a controlled field state entry point.

Implementation behavior:

1. When `Form fields` changes identity, call an internal `setControlledFields(fields)`.
2. For each `FieldData`, update value, errors, warnings, touched, and validating if those keys exist.
3. Do not trigger `onValuesChange` for controlled `fields` synchronization.
4. Do trigger field subscribers so UI reflects externally controlled state.
5. User edits still call `onFieldsChange` and `onValuesChange`; the parent is responsible for feeding new `fields` back if it wants fully controlled behavior.

### Clear On Destroy

When `clearOnDestroy` is true, cleanup of `FormRoot` should clear all values and field state owned by the form instance. This must not clear a custom form instance while another mounted Form still owns that same instance. Track mount ownership with a simple internal form mount count.

### Provider Events

Provider maintains a registry of named child forms.

- `Form name` registers the form instance on mount and unregisters on cleanup.
- `onFormChange` fires after named form field state changes.
- `onFormFinish` fires after named form submit succeeds.
- Unnamed forms do not fire provider events.

### Scroll To First Error

`scrollToFirstError` runs inside the submit failure path after `onFinishFailed`. If the first error field has a registered field instance, call `scrollToField(firstName, options)`.

If `scrollToFirstError` is `true`, use `{ block: 'nearest' }`.

If an object includes `{ focus: true }`, pass that through to `scrollToField`.

## Rendering Design

### Root Component

`FormRoot` should split the new props and compute semantic props.

Root class should include:

- `${prefixCls()}`
- `${prefixCls()}-${layout}`
- size modifier when size is `small` or `large`
- disabled modifier when disabled
- variant modifier when provided
- hash id
- `class`
- semantic `root` class

Root style should merge:

1. `styles.root`
2. `style`

`component={false}` should skip native form submit/reset behavior because there is no form element. Users can call `form.submit()`.

For native form rendering, continue preventing default submit/reset and call the form instance methods.

### Form.Item

Form.Item should:

- Register field metadata as today.
- Read item-level layout or form-level layout.
- Render label space when `label` is `null`.
- Apply `htmlFor` to the label.
- Apply `labelWrap` as a class and style behavior.
- Render Form-level `tooltip` default when item tooltip is not provided.
- Render required mark using boolean, optional, or function rules.
- Render feedback icon when `hasFeedback` is enabled and status exists.
- Apply semantic classes/styles to root, label, content, help, helpItem, extra, and feedbackIcon slots.

`noStyle` should still skip DOM wrappers and only provide contexts.

### Disabled, Size, Variant Propagation

Extend `FormItemControl` or a nearby context with:

```ts
disabled: Accessor<boolean | undefined>
size: Accessor<ComponentSize | undefined>
variant: Accessor<FormVariant | undefined>
```

Controls that already call `useFormItemControl()` should read these defaults only when their own prop is undefined.

Target controls for this milestone:

- `Input`
- `Input.TextArea`
- `Input.Password`
- `Input.Search`
- `Input.OTP`
- `InputNumber`
- `Select`
- `AutoComplete`
- `Cascader`
- `TreeSelect`
- `Mentions`
- `Checkbox`
- `Checkbox.Group`
- `Radio`
- `Radio.Group`
- `Switch`

If one of these controls lacks a compatible `variant` prop, only apply `disabled` and `size`.

## Validation Messages

Add `ValidateMessages` with common template keys:

```ts
export interface ValidateMessages {
  default?: string
  required?: string
  enum?: string
  whitespace?: string
  date?: {
    format?: string
    parse?: string
    invalid?: string
  }
  types?: Record<string, string>
  string?: {
    len?: string
    min?: string
    max?: string
    range?: string
  }
  number?: {
    len?: string
    min?: string
    max?: string
    range?: string
  }
  array?: {
    len?: string
    min?: string
    max?: string
    range?: string
  }
  pattern?: {
    mismatch?: string
  }
}
```

Message resolution order:

1. Rule `message`
2. Form `validateMessages`
3. built-in default message

Template variables:

- `name`
- `label`
- `min`
- `max`
- `len`
- `enum`
- `pattern`
- item `messageVariables`

Support escaping `\\${name}` so it renders as `${name}`.

## Theme Token Design

Extend `FormComponentToken` while preserving existing token keys:

```ts
labelColor: string
labelFontSize: number
labelHeight: number
labelRequiredMarkColor: string
labelColonMarginInlineStart: number
labelColonMarginInlineEnd: number
itemMarginBottom: number
inlineItemMarginBottom: number
verticalLabelPadding: number
verticalLabelMargin: number
extraColor: string
explainColor: string
feedbackIconSize: number
feedbackIconMarginInlineStart: number
```

Default values should derive from alias tokens:

- `labelColor = colorText`
- `labelFontSize = fontSize`
- `labelHeight = controlHeight`
- `labelRequiredMarkColor = colorError`
- `labelColonMarginInlineStart = marginXXS / 2`
- `labelColonMarginInlineEnd = marginXS`
- `itemMarginBottom = marginLG`
- `inlineItemMarginBottom = 0`
- `verticalLabelPadding = paddingXS`
- `verticalLabelMargin = 0`
- `extraColor = colorTextDescription`
- `explainColor = colorError`
- `feedbackIconSize = fontSize`
- `feedbackIconMarginInlineStart = marginXS`

Update `form.style.ts` to use these tokens for label height, colon spacing, inline margin, extra text color, feedback icon sizing, and label wrap.

## Docs Design

Update `apps/docs/src/pages/components/form.mdx`:

- Keep existing examples that remain useful.
- Add examples for:
  - form-level disabled
  - form variants
  - size
  - semantic `classNames/styles`
  - `validateMessages` and `messageVariables`
  - `Form.Provider`
  - controlled `fields`
  - `scrollToFirstError`
  - `clearOnDestroy`
  - feedback icons
- Use Solid syntax:
  - `class`, not `className`
  - signals/accessors for reactive state
  - `For` for lists
- Update API tables for `Form`, `Form.Item`, `Form.List`, `Form.ErrorList`, `Form.Provider`, hooks, `FormInstance`, `Rule`, `ValidateMessages`, `WatchOptions`, and design tokens.

## Testing Plan

Add focused tests before implementation:

- `form-provider.test.tsx`
  - named forms register with provider
  - `onFormChange` receives changed fields and forms map
  - `onFormFinish` receives submitted values and forms map
- `form-root-api.test.tsx`
  - `component={false}` renders no form element
  - custom component renders and submits through native submit handling when possible
  - `clearOnDestroy` clears values after unmount
  - `scrollToFirstError` scrolls and focuses first invalid field
  - semantic `classNames/styles` apply to root
- `form-controlled-fields.test.tsx`
  - external `fields` set value and errors
  - user edits emit `onFieldsChange`
- `form-item-api.test.tsx`
  - `htmlFor` applies to label
  - `label={null}` preserves label element
  - `layout="vertical"` overrides form layout
  - `messageVariables` interpolate messages
  - `hasFeedback` renders status icon
  - item semantic slots apply class/style
- `form-instance-advanced.test.tsx`
  - `getFieldsValue({ filter })`
  - `getFieldsValue({ strict: true })`
  - `getFieldsValue(nameList, filterFunc)`
- `form-hooks.test.tsx`
  - `useWatch` default ignores unregistered fields when preserve is false
  - `useWatch` tracks unregistered fields when preserve is true
- Component integration tests for Form-level disabled/size/variant on controls already using Form context.
- Theme tests for new Form tokens.

Run the repository verification required by AGENTS.md after implementation:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

## Risks

- The full requested parity is broad and touches shared form behavior plus many data-entry controls. Implement in small, independently tested slices.
- Controlled `fields` can conflict with internal store updates if synchronization triggers normal value callbacks. Keep controlled synchronization callback-free.
- `disabled/size/variant` propagation may uncover inconsistent prop names across controls. Restrict this milestone to controls that already integrate with Form.
- Template validation messages require careful escaping and non-string message handling.
- Existing user changes are present in the working tree. Implementation must avoid reverting unrelated changes and must inspect any touched files before editing.

## Acceptance Criteria

- All missing Ant Design v6 Form APIs listed in Goals are exposed in public types.
- Runtime behavior is covered by focused tests for each API group.
- Form examples and API docs demonstrate the new APIs using Solid syntax.
- Form design tokens are expanded and tested.
- Existing Form tests continue to pass.
- Required repository verification commands pass or any pre-existing unrelated failures are documented with evidence.
