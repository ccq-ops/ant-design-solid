# ant-design-solid Form Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a standard usable form system and high-frequency Ant Design-inspired form controls to `@ant-design-solid/core`.

**Architecture:** Build a Solid-native `Form` store around signals, context, field registration, and synchronous validation. New controls (`Checkbox`, `Radio`, `Switch`, `Select`, `Input.TextArea`) follow the existing component folder pattern, consume theme tokens through `useToken`, register styles through `useStyleRegister`, and integrate with `Form.Item` through `valuePropName` and `trigger` injection.

**Tech Stack:** TypeScript, SolidJS, Vite 8, pnpm 11, Vitest, jsdom, @solidjs/testing-library, ESLint, Prettier.

---

## File Structure Map

### Theme package

- Modify `packages/theme/src/types.ts`: add component token interfaces for Form, Select, Checkbox, Radio, Switch.
- Modify `packages/theme/src/components.ts`: return default tokens for new component names.
- Modify `packages/theme/src/__tests__/theme.test.ts`: cover new token defaults and overrides.

### Components shared helpers

- Create `packages/components/src/shared/events.ts`: normalize Solid event-handler union invocation for internal component handlers.
- Create `packages/components/src/shared/options.ts`: shared option type and option normalization for Checkbox.Group, Radio.Group, and Select.

### Form package area

- Create `packages/components/src/form/interface.ts`: public Form types, rules, field data, FormInstance.
- Create `packages/components/src/form/context.tsx`: Form context and field item context.
- Create `packages/components/src/form/validation.ts`: synchronous rule validation helpers.
- Create `packages/components/src/form/store.ts`: create form instance/store.
- Create `packages/components/src/form/form.style.ts`: Form and Form.Item styles.
- Create `packages/components/src/form/Form.tsx`: root form component.
- Create `packages/components/src/form/FormItem.tsx`: field registration and child injection.
- Create `packages/components/src/form/index.ts`: public exports.
- Create `packages/components/src/form/__tests__/Form.test.tsx`: tests.

### Checkbox package area

- Create `packages/components/src/checkbox/interface.ts`.
- Create `packages/components/src/checkbox/checkbox.style.ts`.
- Create `packages/components/src/checkbox/Checkbox.tsx`.
- Create `packages/components/src/checkbox/CheckboxGroup.tsx`.
- Create `packages/components/src/checkbox/index.ts`.
- Create `packages/components/src/checkbox/__tests__/Checkbox.test.tsx`.

### Radio package area

- Create `packages/components/src/radio/interface.ts`.
- Create `packages/components/src/radio/radio.style.ts`.
- Create `packages/components/src/radio/Radio.tsx`.
- Create `packages/components/src/radio/RadioGroup.tsx`.
- Create `packages/components/src/radio/index.ts`.
- Create `packages/components/src/radio/__tests__/Radio.test.tsx`.

### Switch package area

- Create `packages/components/src/switch/interface.ts`.
- Create `packages/components/src/switch/switch.style.ts`.
- Create `packages/components/src/switch/Switch.tsx`.
- Create `packages/components/src/switch/index.ts`.
- Create `packages/components/src/switch/__tests__/Switch.test.tsx`.

### Select package area

- Create `packages/components/src/select/interface.ts`.
- Create `packages/components/src/select/select.style.ts`.
- Create `packages/components/src/select/Select.tsx`.
- Create `packages/components/src/select/index.ts`.
- Create `packages/components/src/select/__tests__/Select.test.tsx`.

### Input TextArea extension

- Modify `packages/components/src/input/interface.ts`: add `TextAreaProps`.
- Modify `packages/components/src/input/input.style.ts`: add textarea styles.
- Create `packages/components/src/input/TextArea.tsx`.
- Modify `packages/components/src/input/index.ts`: export `Input` with `TextArea` static member and `TextArea` named export.
- Create or extend `packages/components/src/input/__tests__/TextArea.test.tsx`.

### Root component exports

- Modify `packages/components/src/index.ts`: export form, checkbox, radio, switch, select, and updated input.

### Docs app

- Modify `apps/docs/src/site/nav.ts`: add Form, Select, Checkbox, Radio, Switch links.
- Modify `apps/docs/src/App.tsx`: register new routes.
- Create `apps/docs/src/pages/FormPage.tsx`.
- Create `apps/docs/src/pages/SelectPage.tsx`.
- Create `apps/docs/src/pages/CheckboxPage.tsx`.
- Create `apps/docs/src/pages/RadioPage.tsx`.
- Create `apps/docs/src/pages/SwitchPage.tsx`.
- Modify `apps/docs/src/pages/InputPage.tsx`: add TextArea demo.

---

## Implementation Tasks

### Task 1: Theme tokens for form controls

**Files:**
- Modify: `packages/theme/src/types.ts`
- Modify: `packages/theme/src/components.ts`
- Modify: `packages/theme/src/__tests__/theme.test.ts`

- [ ] **Step 1: Add failing theme token tests**

Append this test case to `packages/theme/src/__tests__/theme.test.ts`:

```ts
it('derives form component token defaults and applies overrides', () => {
  const token = mergeTheme({
    components: {
      Form: { labelColor: '#222222' },
      Select: { optionSelectedBg: '#e6f4ff' },
      Switch: { handleSize: 18 },
    },
  })

  expect(getComponentToken('Form', token).labelColor).toBe('#222222')
  expect(getComponentToken('Form', token).itemMarginBottom).toBe(24)
  expect(getComponentToken('Select', token).optionSelectedBg).toBe('#e6f4ff')
  expect(getComponentToken('Checkbox', token).size).toBe(16)
  expect(getComponentToken('Radio', token).dotSize).toBe(8)
  expect(getComponentToken('Switch', token).handleSize).toBe(18)
})
```

- [ ] **Step 2: Run theme tests and verify RED**

Run:

```bash
pnpm --filter @ant-design-solid/theme test
```

Expected: FAIL with TypeScript/runtime errors because `Form`, `Select`, `Checkbox`, `Radio`, and `Switch` tokens do not exist in `ComponentTokenMap`.

- [ ] **Step 3: Add token types**

In `packages/theme/src/types.ts`, add these interfaces after `GridComponentToken`:

```ts
export interface FormComponentToken {
  labelColor: string
  labelRequiredMarkColor: string
  itemMarginBottom: number
  verticalLabelPadding: number
  explainColor: string
}

export interface SelectComponentToken {
  optionHeight: number
  optionPadding: number
  optionSelectedBg: string
  optionActiveBg: string
  clearIconColor: string
}

export interface CheckboxComponentToken {
  size: number
  borderRadius: number
  checkColor: string
}

export interface RadioComponentToken {
  size: number
  dotSize: number
}

export interface SwitchComponentToken {
  trackHeight: number
  trackMinWidth: number
  handleSize: number
}
```

Then extend `ComponentTokenMap`:

```ts
export interface ComponentTokenMap {
  Button: ButtonComponentToken
  Input: InputComponentToken
  Space: SpaceComponentToken
  Typography: TypographyComponentToken
  Grid: GridComponentToken
  Form: FormComponentToken
  Select: SelectComponentToken
  Checkbox: CheckboxComponentToken
  Radio: RadioComponentToken
  Switch: SwitchComponentToken
}
```

- [ ] **Step 4: Add default token derivation**

In `packages/theme/src/components.ts`, add entries to the `defaults` object:

```ts
Form: {
  labelColor: token.colorText,
  labelRequiredMarkColor: token.colorError,
  itemMarginBottom: token.marginLG,
  verticalLabelPadding: token.paddingXS,
  explainColor: token.colorError,
},
Select: {
  optionHeight: token.controlHeight,
  optionPadding: token.paddingSM,
  optionSelectedBg: '#e6f4ff',
  optionActiveBg: token.colorFillAlter,
  clearIconColor: token.colorTextDisabled,
},
Checkbox: {
  size: 16,
  borderRadius: token.borderRadius / 2,
  checkColor: '#ffffff',
},
Radio: {
  size: 16,
  dotSize: 8,
},
Switch: {
  trackHeight: 22,
  trackMinWidth: 44,
  handleSize: 18,
},
```

- [ ] **Step 5: Run theme tests and verify GREEN**

Run:

```bash
pnpm --filter @ant-design-solid/theme test
```

Expected: PASS.

- [ ] **Step 6: Commit theme token update**

```bash
git add packages/theme/src/types.ts packages/theme/src/components.ts packages/theme/src/__tests__/theme.test.ts
git commit -m "feat: add form component theme tokens"
```

### Task 2: Shared form-control helpers

**Files:**
- Create: `packages/components/src/shared/events.ts`
- Create: `packages/components/src/shared/options.ts`

- [ ] **Step 1: Create shared event invocation helper**

Create `packages/components/src/shared/events.ts`:

```ts
import type { JSX } from 'solid-js'

export function callHandler<TElement extends Element, TEvent extends Event>(
  handler: JSX.EventHandlerUnion<TElement, TEvent> | undefined,
  event: TEvent & { currentTarget: TElement; target: Element },
): void {
  if (typeof handler === 'function') {
    handler(event)
  }
}
```

- [ ] **Step 2: Create shared options helper**

Create `packages/components/src/shared/options.ts`:

```ts
import type { JSX } from 'solid-js'

export type OptionValue = string | number | boolean

export interface LabeledOption {
  label: JSX.Element
  value: OptionValue
  disabled?: boolean
}

export type OptionInput = OptionValue | LabeledOption

export function normalizeOptions(options: OptionInput[] = []): LabeledOption[] {
  return options.map((option) => {
    if (typeof option === 'object') return option
    return { label: String(option), value: option }
  })
}
```

- [ ] **Step 3: Typecheck helper files**

Run:

```bash
pnpm --filter @ant-design-solid/core typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit shared helpers**

```bash
git add packages/components/src/shared/events.ts packages/components/src/shared/options.ts
git commit -m "feat: add form control shared helpers"
```

### Task 3: Form core store, validation, and context

**Files:**
- Create: `packages/components/src/form/interface.ts`
- Create: `packages/components/src/form/validation.ts`
- Create: `packages/components/src/form/store.ts`
- Create: `packages/components/src/form/context.tsx`
- Create: `packages/components/src/form/Form.tsx`
- Create: `packages/components/src/form/FormItem.tsx`
- Create: `packages/components/src/form/form.style.ts`
- Create: `packages/components/src/form/index.ts`
- Create: `packages/components/src/form/__tests__/Form.test.tsx`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: Write failing Form tests**

Create `packages/components/src/form/__tests__/Form.test.tsx`:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { Input } from '../../input'
import { Form, useForm } from '../index'

function RequiredForm(props: { onFinish?: (values: Record<string, unknown>) => void; onFinishFailed?: (info: unknown) => void }) {
  return (
    <Form initialValues={{ username: 'seed' }} onFinish={props.onFinish} onFinishFailed={props.onFinishFailed}>
      <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Username is required' }]}>
        <Input placeholder="username" />
      </Form.Item>
      <Button htmlType="submit">Submit</Button>
    </Form>
  )
}

describe('Form', () => {
  it('submits valid values', () => {
    const onFinish = vi.fn()
    const result = render(() => <RequiredForm onFinish={onFinish} />)

    fireEvent.input(result.getByPlaceholderText('username'), { target: { value: 'solid' } })
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ username: 'solid' })
  })

  it('blocks submit and displays rule errors', async () => {
    const onFinish = vi.fn()
    const onFinishFailed = vi.fn()
    const result = render(() => <RequiredForm onFinish={onFinish} onFinishFailed={onFinishFailed} />)

    fireEvent.input(result.getByPlaceholderText('username'), { target: { value: '' } })
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).not.toHaveBeenCalled()
    expect(onFinishFailed).toHaveBeenCalledOnce()
    expect(await result.findByText('Username is required')).toBeInTheDocument()
  })

  it('supports form instance value APIs', async () => {
    const [form] = useForm()
    const result = render(() => (
      <Form form={form} initialValues={{ username: 'seed' }}>
        <Form.Item name="username">
          <Input placeholder="username" />
        </Form.Item>
      </Form>
    ))

    expect(form.getFieldValue('username')).toBe('seed')
    form.setFieldValue('username', 'changed')
    expect((result.getByPlaceholderText('username') as HTMLInputElement).value).toBe('changed')

    form.setFieldsValue({ username: 'bulk' })
    expect(form.getFieldsValue()).toEqual({ username: 'bulk' })

    form.resetFields()
    expect(form.getFieldValue('username')).toBe('seed')

    await expect(form.validateFields()).resolves.toEqual({ username: 'seed' })
  })
})
```

- [ ] **Step 2: Run Form tests and verify RED**

Run:

```bash
pnpm --filter @ant-design-solid/core test -- src/form/__tests__/Form.test.tsx
```

Expected: FAIL because `../index` and Form APIs do not exist.

- [ ] **Step 3: Implement public Form types**

Create `packages/components/src/form/interface.ts` with these exported types:

```ts
import type { Accessor, JSX } from 'solid-js'

export type FieldName = string
export type FieldValue = unknown
export type FormValues = Record<string, FieldValue>
export type ValidateStatus = 'success' | 'warning' | 'error' | 'validating'

export interface Rule {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'array'
  min?: number
  max?: number
  len?: number
  pattern?: RegExp
  message?: string
  validator?: (value: FieldValue, values: FormValues) => string | void
}

export interface FieldError {
  name: FieldName
  errors: string[]
}

export interface ValidateErrorInfo {
  values: FormValues
  errorFields: FieldError[]
}

export interface FieldMeta {
  name: FieldName
  rules: Rule[]
  initialValue?: FieldValue
}

export interface FormInstance {
  getFieldValue: (name: FieldName) => FieldValue
  setFieldValue: (name: FieldName, value: FieldValue) => void
  getFieldsValue: () => FormValues
  setFieldsValue: (values: FormValues) => void
  resetFields: (names?: FieldName[]) => void
  validateFields: (names?: FieldName[]) => Promise<FormValues>
  submit: () => void
  registerField: (meta: FieldMeta) => () => void
  getFieldError: (name: FieldName) => Accessor<string[]>
}

export interface FormProps extends JSX.FormHTMLAttributes<HTMLFormElement> {
  form?: FormInstance
  initialValues?: FormValues
  onFinish?: (values: FormValues) => void
  onFinishFailed?: (errorInfo: ValidateErrorInfo) => void
  onValuesChange?: (changedValues: FormValues, allValues: FormValues) => void
  children?: JSX.Element
}

export interface FormItemProps {
  label?: JSX.Element
  name?: FieldName
  rules?: Rule[]
  required?: boolean
  help?: JSX.Element
  validateStatus?: ValidateStatus
  valuePropName?: string
  trigger?: string
  initialValue?: FieldValue
  children?: JSX.Element
}
```

- [ ] **Step 4: Implement synchronous validation**

Create `packages/components/src/form/validation.ts`:

```ts
import type { FieldValue, FormValues, Rule } from './interface'

function isEmpty(value: FieldValue): boolean {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
}

function getLength(value: FieldValue): number | undefined {
  if (typeof value === 'string' || Array.isArray(value)) return value.length
  return undefined
}

export function validateValue(name: string, value: FieldValue, values: FormValues, rules: Rule[] = []): string[] {
  for (const rule of rules) {
    if (rule.required && isEmpty(value)) return [rule.message ?? `${name} is required`]
    if (isEmpty(value)) continue

    if (rule.type === 'array' && !Array.isArray(value)) return [rule.message ?? `${name} is not an array`]
    if (rule.type && rule.type !== 'array' && typeof value !== rule.type) return [rule.message ?? `${name} is not a valid ${rule.type}`]

    if (typeof value === 'number') {
      if (rule.len !== undefined && value !== rule.len) return [rule.message ?? `${name} must equal ${rule.len}`]
      if (rule.min !== undefined && value < rule.min) return [rule.message ?? `${name} must be at least ${rule.min}`]
      if (rule.max !== undefined && value > rule.max) return [rule.message ?? `${name} must be at most ${rule.max}`]
    }

    const length = getLength(value)
    if (length !== undefined) {
      if (rule.len !== undefined && length !== rule.len) return [rule.message ?? `${name} must be ${rule.len} characters`]
      if (rule.min !== undefined && length < rule.min) return [rule.message ?? `${name} must be at least ${rule.min} characters`]
      if (rule.max !== undefined && length > rule.max) return [rule.message ?? `${name} must be at most ${rule.max} characters`]
    }

    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) return [rule.message ?? `${name} format is invalid`]

    const customError = rule.validator?.(value, values)
    if (customError) return [customError]
  }

  return []
}
```

- [ ] **Step 5: Implement Form store**

Create `packages/components/src/form/store.ts` with a signal-backed `createFormInstance` and `useForm`:

```ts
import { createRoot, createSignal, type Accessor } from 'solid-js'
import type { FieldError, FieldMeta, FieldName, FieldValue, FormInstance, FormValues, ValidateErrorInfo } from './interface'
import { validateValue } from './validation'

interface CreateFormOptions {
  initialValues?: FormValues
  onFinish?: (values: FormValues) => void
  onFinishFailed?: (errorInfo: ValidateErrorInfo) => void
  onValuesChange?: (changedValues: FormValues, allValues: FormValues) => void
}

export function createFormInstance(options: CreateFormOptions = {}): FormInstance {
  return createRoot(() => {
    const initialValues = { ...(options.initialValues ?? {}) }
    const [values, setValues] = createSignal<FormValues>({ ...initialValues })
    const fields = new Map<FieldName, FieldMeta>()
    const errorSignals = new Map<FieldName, [Accessor<string[]>, (errors: string[]) => void]>()

    function ensureErrorSignal(name: FieldName) {
      let pair = errorSignals.get(name)
      if (!pair) {
        pair = createSignal<string[]>([])
        errorSignals.set(name, pair)
      }
      return pair
    }

    function setFieldValue(name: FieldName, value: FieldValue): void {
      setValues((current) => {
        const next = { ...current, [name]: value }
        options.onValuesChange?.({ [name]: value }, next)
        return next
      })
    }

    function validateFieldNames(names: FieldName[]): { values: FormValues; errorFields: FieldError[] } {
      const currentValues = values()
      const errorFields: FieldError[] = []
      for (const name of names) {
        const meta = fields.get(name)
        const errors = validateValue(name, currentValues[name], currentValues, meta?.rules ?? [])
        ensureErrorSignal(name)[1](errors)
        if (errors.length > 0) errorFields.push({ name, errors })
      }
      return { values: currentValues, errorFields }
    }

    const form: FormInstance = {
      getFieldValue(name) {
        return values()[name]
      },
      setFieldValue,
      getFieldsValue() {
        return { ...values() }
      },
      setFieldsValue(nextValues) {
        setValues((current) => {
          const next = { ...current, ...nextValues }
          options.onValuesChange?.(nextValues, next)
          return next
        })
      },
      resetFields(names) {
        const targetNames = names ?? Array.from(fields.keys())
        setValues((current) => {
          const next = { ...current }
          for (const name of targetNames) next[name] = initialValues[name]
          return next
        })
        for (const name of targetNames) ensureErrorSignal(name)[1]([])
      },
      async validateFields(names) {
        const targetNames = names ?? Array.from(fields.keys())
        const result = validateFieldNames(targetNames)
        if (result.errorFields.length > 0) throw result
        return result.values
      },
      submit() {
        const result = validateFieldNames(Array.from(fields.keys()))
        if (result.errorFields.length > 0) options.onFinishFailed?.(result)
        else options.onFinish?.(result.values)
      },
      registerField(meta) {
        fields.set(meta.name, meta)
        if (meta.initialValue !== undefined && values()[meta.name] === undefined) setFieldValue(meta.name, meta.initialValue)
        ensureErrorSignal(meta.name)
        return () => fields.delete(meta.name)
      },
      getFieldError(name) {
        return ensureErrorSignal(name)[0]
      },
    }

    return form
  })
}

export function useForm(form?: FormInstance): [FormInstance] {
  return [form ?? createFormInstance()]
}
```

- [ ] **Step 6: Implement contexts, Form, Form.Item, styles, and exports**

Create `packages/components/src/form/context.tsx`:

```tsx
import { createContext, useContext } from 'solid-js'
import type { FormInstance } from './interface'

export const FormContext = createContext<FormInstance>()
export function useFormContext(): FormInstance | undefined {
  return useContext(FormContext)
}
```

Create `packages/components/src/form/form.style.ts`:

```ts
import { useStyleRegister } from '@ant-design-solid/cssinjs'
import { getComponentToken } from '@ant-design-solid/theme'
import { useToken } from '../config-provider'

export function useFormStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Form', prefixCls] }, () => {
    const formToken = getComponentToken('Form', token())
    return {
      [`.${prefixCls}`]: { 'font-family': token().fontFamily, 'font-size': token().fontSize, color: token().colorText },
      [`.${prefixCls}-item`]: { 'margin-bottom': formToken.itemMarginBottom },
      [`.${prefixCls}-item-label`]: { color: formToken.labelColor, 'margin-bottom': formToken.verticalLabelPadding },
      [`.${prefixCls}-item-required`]: { color: formToken.labelRequiredMarkColor, 'margin-inline-end': 4 },
      [`.${prefixCls}-item-explain-error`]: { color: formToken.explainColor, 'font-size': 12, 'margin-top': 4 },
    }
  })
}
```

Create `Form.tsx`, `FormItem.tsx`, and `index.ts` using the exact APIs from `interface.ts`. `FormItem` must clone a single JSX child only when `name` exists, inject the current form value into `valuePropName`, and wrap `trigger` to call the child handler and then `form.setFieldValue(name, nextValue)`. Extract `nextValue` from `event.currentTarget.checked` for `checked`, otherwise from `event.currentTarget.value`; if the control calls `onChange(value)` directly, accept that value.

Modify `packages/components/src/index.ts`:

```ts
export * from './config-provider'
export * from './button'
export * from './input'
export * from './space'
export * from './typography'
export * from './grid'
export * from './form'
```

- [ ] **Step 7: Run Form tests and verify GREEN**

Run:

```bash
pnpm --filter @ant-design-solid/core test -- src/form/__tests__/Form.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit Form core**

```bash
git add packages/components/src/form packages/components/src/index.ts
git commit -m "feat: add form core"
```

### Task 4: Checkbox and Checkbox.Group

**Files:**
- Create: `packages/components/src/checkbox/interface.ts`
- Create: `packages/components/src/checkbox/checkbox.style.ts`
- Create: `packages/components/src/checkbox/Checkbox.tsx`
- Create: `packages/components/src/checkbox/CheckboxGroup.tsx`
- Create: `packages/components/src/checkbox/index.ts`
- Create: `packages/components/src/checkbox/__tests__/Checkbox.test.tsx`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: Write failing Checkbox tests**

Create `packages/components/src/checkbox/__tests__/Checkbox.test.tsx` with tests for checked/defaultChecked/disabled, group array updates, custom prefix, and Form integration.

- [ ] **Step 2: Run Checkbox tests and verify RED**

```bash
pnpm --filter @ant-design-solid/core test -- src/checkbox/__tests__/Checkbox.test.tsx
```

Expected: FAIL because Checkbox exports do not exist.

- [ ] **Step 3: Implement Checkbox files**

Implement:

- `CheckboxProps` with `checked`, `defaultChecked`, `disabled`, `indeterminate`, `onChange`, `children`.
- `CheckboxGroupProps` with `value`, `defaultValue`, `options`, `disabled`, `onChange`.
- `Checkbox` as a labeled input wrapper with `ads-checkbox`, `ads-checkbox-checked`, `ads-checkbox-disabled`, `ads-checkbox-indeterminate` classes.
- `Checkbox.Group` as `Object.assign(Checkbox, { Group: CheckboxGroup })`.
- Form integration through normal `checked` + `onChange` semantics.

- [ ] **Step 4: Export Checkbox**

Modify `packages/components/src/index.ts`:

```ts
export * from './checkbox'
```

- [ ] **Step 5: Run Checkbox tests and verify GREEN**

```bash
pnpm --filter @ant-design-solid/core test -- src/checkbox/__tests__/Checkbox.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit Checkbox**

```bash
git add packages/components/src/checkbox packages/components/src/index.ts
git commit -m "feat: add checkbox component"
```

### Task 5: Radio and Radio.Group

**Files:**
- Create: `packages/components/src/radio/interface.ts`
- Create: `packages/components/src/radio/radio.style.ts`
- Create: `packages/components/src/radio/Radio.tsx`
- Create: `packages/components/src/radio/RadioGroup.tsx`
- Create: `packages/components/src/radio/index.ts`
- Create: `packages/components/src/radio/__tests__/Radio.test.tsx`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: Write failing Radio tests**

Create tests for standalone Radio, Radio.Group value updates, disabled, `optionType="button"`, custom prefix, and Form integration.

- [ ] **Step 2: Run Radio tests and verify RED**

```bash
pnpm --filter @ant-design-solid/core test -- src/radio/__tests__/Radio.test.tsx
```

Expected: FAIL because Radio exports do not exist.

- [ ] **Step 3: Implement Radio files**

Implement Radio and Radio.Group with `value`, controlled/uncontrolled state, `onChange(value)` for group, and Ant Design-like classes.

- [ ] **Step 4: Export Radio**

Modify `packages/components/src/index.ts`:

```ts
export * from './radio'
```

- [ ] **Step 5: Run Radio tests and verify GREEN**

```bash
pnpm --filter @ant-design-solid/core test -- src/radio/__tests__/Radio.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit Radio**

```bash
git add packages/components/src/radio packages/components/src/index.ts
git commit -m "feat: add radio component"
```

### Task 6: Switch

**Files:**
- Create: `packages/components/src/switch/interface.ts`
- Create: `packages/components/src/switch/switch.style.ts`
- Create: `packages/components/src/switch/Switch.tsx`
- Create: `packages/components/src/switch/index.ts`
- Create: `packages/components/src/switch/__tests__/Switch.test.tsx`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: Write failing Switch tests**

Create tests for controlled/uncontrolled checked state, disabled/loading no-op click, checkedChildren/unCheckedChildren, size class, and Form integration.

- [ ] **Step 2: Run Switch tests and verify RED**

```bash
pnpm --filter @ant-design-solid/core test -- src/switch/__tests__/Switch.test.tsx
```

Expected: FAIL because Switch exports do not exist.

- [ ] **Step 3: Implement Switch files**

Implement a button with `role="switch"`, `aria-checked`, controlled/uncontrolled `checked`, `onChange(nextChecked, event)`, and prefix classes.

- [ ] **Step 4: Export Switch**

Modify `packages/components/src/index.ts`:

```ts
export * from './switch'
```

- [ ] **Step 5: Run Switch tests and verify GREEN**

```bash
pnpm --filter @ant-design-solid/core test -- src/switch/__tests__/Switch.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit Switch**

```bash
git add packages/components/src/switch packages/components/src/index.ts
git commit -m "feat: add switch component"
```

### Task 7: Select

**Files:**
- Create: `packages/components/src/select/interface.ts`
- Create: `packages/components/src/select/select.style.ts`
- Create: `packages/components/src/select/Select.tsx`
- Create: `packages/components/src/select/index.ts`
- Create: `packages/components/src/select/__tests__/Select.test.tsx`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: Write failing Select tests**

Create tests for placeholder rendering, open/close, option selection, allowClear, disabled, keyboard Escape, custom prefix, and Form integration.

- [ ] **Step 2: Run Select tests and verify RED**

```bash
pnpm --filter @ant-design-solid/core test -- src/select/__tests__/Select.test.tsx
```

Expected: FAIL because Select exports do not exist.

- [ ] **Step 3: Implement Select files**

Implement single-select only:

- selector button with `role="combobox"`
- dropdown with `role="listbox"`
- options with `role="option"`
- controlled/uncontrolled `value`
- controlled/uncontrolled `open`
- `onChange(value, option)`
- `onOpenChange(open)`
- `allowClear`
- `Escape` closes dropdown
- `Enter` selects the first enabled option when open and no active-index implementation is present

- [ ] **Step 4: Export Select**

Modify `packages/components/src/index.ts`:

```ts
export * from './select'
```

- [ ] **Step 5: Run Select tests and verify GREEN**

```bash
pnpm --filter @ant-design-solid/core test -- src/select/__tests__/Select.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit Select**

```bash
git add packages/components/src/select packages/components/src/index.ts
git commit -m "feat: add select component"
```

### Task 8: Input.TextArea

**Files:**
- Modify: `packages/components/src/input/interface.ts`
- Modify: `packages/components/src/input/input.style.ts`
- Create: `packages/components/src/input/TextArea.tsx`
- Modify: `packages/components/src/input/index.ts`
- Create: `packages/components/src/input/__tests__/TextArea.test.tsx`

- [ ] **Step 1: Write failing TextArea tests**

Create tests for `rows`, `defaultValue`, `showCount`, `maxLength`, `disabled`, and `Input.TextArea` static usage.

- [ ] **Step 2: Run TextArea tests and verify RED**

```bash
pnpm --filter @ant-design-solid/core test -- src/input/__tests__/TextArea.test.tsx
```

Expected: FAIL because `Input.TextArea` does not exist.

- [ ] **Step 3: Implement TextArea**

Add `TextAreaProps`, create `TextArea.tsx`, and export both `TextArea` and `Input.TextArea`. Reuse `Input` token styles with `ads-input-textarea` class.

- [ ] **Step 4: Run TextArea tests and verify GREEN**

```bash
pnpm --filter @ant-design-solid/core test -- src/input/__tests__/TextArea.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit TextArea**

```bash
git add packages/components/src/input
git commit -m "feat: add input textarea"
```

### Task 9: Docs pages for form controls

**Files:**
- Modify: `apps/docs/src/site/nav.ts`
- Modify: `apps/docs/src/App.tsx`
- Create: `apps/docs/src/pages/FormPage.tsx`
- Create: `apps/docs/src/pages/SelectPage.tsx`
- Create: `apps/docs/src/pages/CheckboxPage.tsx`
- Create: `apps/docs/src/pages/RadioPage.tsx`
- Create: `apps/docs/src/pages/SwitchPage.tsx`
- Modify: `apps/docs/src/pages/InputPage.tsx`

- [ ] **Step 1: Add docs pages**

Create one docs page per new component. Each page must include basic usage, disabled state where relevant, and a Form integration example.

- [ ] **Step 2: Update routes and navigation**

Add routes:

```ts
'/components/form': FormPage,
'/components/select': SelectPage,
'/components/checkbox': CheckboxPage,
'/components/radio': RadioPage,
'/components/switch': SwitchPage,
```

Add nav entries after Input or before Button based on current docs order.

- [ ] **Step 3: Add TextArea demo to InputPage**

Add a `DemoBlock` using:

```tsx
<Input.TextArea rows={4} showCount maxLength={100} defaultValue="Solid form components" />
```

- [ ] **Step 4: Typecheck docs**

```bash
pnpm --filter @ant-design-solid/docs typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit docs**

```bash
git add apps/docs
git commit -m "docs: add form component pages"
```

### Task 10: Full verification and cleanup

**Files:**
- Modify only files required by failures.

- [ ] **Step 1: Run all tests**

```bash
pnpm test
```

Expected: all package tests pass.

- [ ] **Step 2: Run typecheck**

```bash
pnpm typecheck
```

Expected: all packages typecheck.

- [ ] **Step 3: Run build**

```bash
pnpm build
```

Expected: all packages and docs build.

- [ ] **Step 4: Run lint**

```bash
pnpm lint
```

Expected: no lint errors.

- [ ] **Step 5: Commit final verification fixes**

If verification required changes:

```bash
git add .
git commit -m "chore: verify form components"
```

If no files changed, do not create an empty commit.

---

## Plan Self-Review

### Spec coverage

- Form core: Task 3.
- Synchronous validation: Task 3.
- Checkbox and Checkbox.Group: Task 4.
- Radio and Radio.Group: Task 5.
- Switch: Task 6.
- Select single-select MVP: Task 7.
- Input.TextArea: Task 8.
- Theme tokens: Task 1.
- Docs pages and Input docs update: Task 9.
- Full verification: Task 10.

### Placeholder scan

No TBD or TODO placeholders remain. Some implementation steps describe file responsibilities rather than embedding full final code because the implementation must preserve existing code style and may require small adjustments discovered by TDD. Each step gives exact files, APIs, behavior, commands, and expected results.

### Type consistency

The plan consistently uses `FormInstance`, `Rule`, `ValidateErrorInfo`, `valuePropName`, `trigger`, `checked`, `value`, `onChange`, and the component names from the approved spec.
