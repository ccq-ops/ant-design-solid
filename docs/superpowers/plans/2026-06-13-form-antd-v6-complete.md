# Form Ant Design v6 Complete Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the remaining Ant Design v6 Form API surface in `@ant-design-solid/core` while preserving Solid-native APIs and examples.

**Architecture:** Extend the existing Solid Form store and contexts in place. Add missing root APIs, item APIs, provider linkage, controlled fields, advanced `getFieldsValue`, validation message templating, Form-level control defaults, token alignment, and docs examples in small tested slices.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, cssinjs, `@ant-design-solid/theme`, `@ant-design-solid/icons`.

---

## File Structure

- Modify `packages/components/src/form/interface.ts`: public Form, Item, Provider, feedback, semantic, validation, and `getFieldsValue` types.
- Modify `packages/components/src/form/context.tsx`: Form layout/config context, provider registry context, item status/control context additions.
- Modify `packages/components/src/form/store.ts`: controlled `fields`, form mount/clear lifecycle, provider callback hooks, advanced `getFieldsValue`, field meta filtering.
- Modify `packages/components/src/form/form.tsx`: root props, semantic root styling, `component`, `scrollToFirstError`, provider registration, `clearOnDestroy`.
- Modify `packages/components/src/form/form-item.tsx`: item semantic slots, `htmlFor`, `layout`, `labelWrap`, `messageVariables`, `hasFeedback`, tooltip object support, required mark function.
- Modify `packages/components/src/form/form.style.ts`: new token usage, label wrap, feedback icon, inline margin, extra color.
- Modify `packages/components/src/form/use-watch.ts`: registered-field default watch and `preserve` behavior.
- Modify `packages/components/src/form/validation.ts`: message templates, JSX messages, expanded rule types.
- Modify `packages/components/src/form/index.ts`: export `Form.Provider`, new types.
- Modify Form-integrated controls: `input`, `input-number`, `select`, `auto-complete`, `cascader`, `tree-select`, `mentions`, `checkbox`, `radio`, `switch` files that already call `useFormItemControl`.
- Modify `packages/theme/src/types.ts`, `packages/theme/src/components.ts`, `packages/theme/src/__tests__/theme.test.ts`: Form token expansion.
- Modify `apps/docs/src/pages/components/form.mdx`: examples and API docs.
- Add focused tests under `packages/components/src/form/__tests__/`.

---

### Task 1: Add Root API and Provider Failing Tests

**Files:**

- Create: `packages/components/src/form/__tests__/form-root-api.test.tsx`
- Create: `packages/components/src/form/__tests__/form-provider.test.tsx`

- [ ] **Step 1: Write failing root API tests**

Add `packages/components/src/form/__tests__/form-root-api.test.tsx`:

```tsx
import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { createSignal, Show } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { Input } from '../../input'
import { Form, useForm } from '../index'

describe('Form root v6 APIs', () => {
  it('applies semantic root class and style with Solid class prop', () => {
    const result = render(() => (
      <Form
        aria-label="semantic"
        class="outer-form"
        classNames={{ root: 'semantic-root' }}
        styles={{ root: { color: 'rgb(1, 2, 3)' } }}
      />
    ))

    const form = result.getByLabelText('semantic')
    expect(form).toHaveClass('outer-form')
    expect(form).toHaveClass('semantic-root')
    expect(form).toHaveStyle({ color: 'rgb(1, 2, 3)' })
  })

  it('renders no form element when component is false', () => {
    const result = render(() => (
      <Form component={false}>
        <Form.Item name="username">
          <Input placeholder="username" />
        </Form.Item>
      </Form>
    ))

    expect(result.container.querySelector('form')).toBeNull()
    expect(result.getByPlaceholderText('username')).toBeInTheDocument()
  })

  it('renders a custom root element when component is provided', () => {
    const result = render(() => (
      <Form component="section" aria-label="custom-root">
        <Form.Item name="username">
          <Input />
        </Form.Item>
      </Form>
    ))

    expect(result.getByLabelText('custom-root').tagName).toBe('SECTION')
  })

  it('scrolls and focuses the first error field on failed submit', async () => {
    const scrollIntoView = vi.fn()
    const focus = vi.fn()
    Element.prototype.scrollIntoView = scrollIntoView
    HTMLInputElement.prototype.focus = focus

    const result = render(() => (
      <Form scrollToFirstError={{ focus: true }} onFinishFailed={() => undefined}>
        <Form.Item name="username" rules={[{ required: true, message: 'Required' }]}>
          <Input placeholder="username" />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(result.getByText('Required')).toBeInTheDocument())
    expect(scrollIntoView).toHaveBeenCalled()
    expect(focus).toHaveBeenCalled()
  })

  it('clears form values when clearOnDestroy unmounts the final owner', () => {
    const [visible, setVisible] = createSignal(true)
    const [form] = useForm()

    render(() => (
      <>
        <Show when={visible()}>
          <Form form={form} clearOnDestroy initialValues={{ username: 'Ada' }}>
            <Form.Item name="username">
              <Input />
            </Form.Item>
          </Form>
        </Show>
        <button type="button" onClick={() => setVisible(false)}>
          Hide
        </button>
      </>
    ))

    expect(form.getFieldsValue(true)).toEqual({ username: 'Ada' })
    setVisible(false)
    expect(form.getFieldsValue(true)).toEqual({})
  })
})
```

- [ ] **Step 2: Write failing provider tests**

Add `packages/components/src/form/__tests__/form-provider.test.tsx`:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { Input } from '../../input'
import { Form } from '../index'

describe('Form.Provider', () => {
  it('notifies named form field changes with changed fields and forms map', () => {
    const onFormChange = vi.fn()
    const result = render(() => (
      <Form.Provider onFormChange={onFormChange}>
        <Form name="profile">
          <Form.Item name="username">
            <Input placeholder="username" />
          </Form.Item>
        </Form>
      </Form.Provider>
    ))

    fireEvent.input(result.getByPlaceholderText('username'), { target: { value: 'Ada' } })

    expect(onFormChange).toHaveBeenCalledWith(
      'profile',
      expect.objectContaining({
        changedFields: [expect.objectContaining({ name: ['username'], value: 'Ada' })],
        forms: expect.objectContaining({ profile: expect.any(Object) }),
      }),
    )
  })

  it('notifies named form finish with submitted values and forms map', () => {
    const onFormFinish = vi.fn()
    const result = render(() => (
      <Form.Provider onFormFinish={onFormFinish}>
        <Form name="profile" initialValues={{ username: 'Ada' }}>
          <Form.Item name="username">
            <Input />
          </Form.Item>
          <Button htmlType="submit">Submit</Button>
        </Form>
      </Form.Provider>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFormFinish).toHaveBeenCalledWith(
      'profile',
      expect.objectContaining({
        values: { username: 'Ada' },
        forms: expect.objectContaining({ profile: expect.any(Object) }),
      }),
    )
  })
})
```

- [ ] **Step 3: Run tests to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- form-root-api form-provider
```

Expected: FAIL because `classNames`, `styles`, `component`, `clearOnDestroy`, `Form.Provider`, and `scrollToFirstError` are not implemented.

---

### Task 2: Implement Root API, Provider, and Store Lifecycle

**Files:**

- Modify: `packages/components/src/form/interface.ts`
- Modify: `packages/components/src/form/context.tsx`
- Modify: `packages/components/src/form/store.ts`
- Modify: `packages/components/src/form/form.tsx`
- Modify: `packages/components/src/form/index.ts`

- [ ] **Step 1: Add root/provider public types**

Add the types described in the design spec to `interface.ts`: `SemanticInfo`, semantic config types, `FormSemanticSlot`, `FeedbackIcons`, `FormTooltipProps`, `FormProviderProps`, `FormVariant`, `FilterFunc`, `GetFieldsValueConfig`, and new `FormProps` fields.

- [ ] **Step 2: Add provider registry context**

In `context.tsx`, add a context that stores named forms:

```ts
export interface FormProviderContextValue {
  registerForm: (name: string, form: FormInstance) => () => void
  triggerFormChange: (name: string, changedFields: FieldData[]) => void
  triggerFormFinish: (name: string, values: FormValues) => void
}
```

Provide `useFormProviderContext()` returning the optional context value.

- [ ] **Step 3: Add internal store helpers**

In `store.ts`, add internal methods on `InternalFormInstance`:

```ts
setControlledFields?: (fields: FieldData[]) => void
destroy?: () => void
registerFormOwner?: () => () => void
setProviderCallbacks?: (callbacks: {
  name?: string
  onFieldsChange?: (changedFields: FieldData[]) => void
  onFinish?: (values: FormValues) => void
}) => void
```

Implement owner count so `destroy()` only clears values when the final owner unmounts.

- [ ] **Step 4: Implement controlled field sync**

Implement `setControlledFields(fields)` by updating value/errors/warnings/touched/validating for each provided field, notifying field subscribers, and not firing `onValuesChange`.

- [ ] **Step 5: Implement `FormProvider`**

Create `FormProvider` in `context.tsx` or a new `form-provider.tsx` if the file becomes too large. The provider should keep a local forms record and call callbacks with a shallow-cloned forms map.

- [ ] **Step 6: Update `FormRoot`**

In `form.tsx`, split and use new props:

- `classNames`
- `styles`
- `component`
- `fields`
- `name`
- `clearOnDestroy`
- `scrollToFirstError`
- `disabled`
- `size`
- `variant`
- `feedbackIcons`
- `labelWrap`
- `tooltip`
- `preserve`
- `validateMessages`

Register named forms with provider context, wire provider change/finish callbacks into the store, apply controlled `fields` in an effect, and clean up owner/destroy on unmount.

- [ ] **Step 7: Export provider**

Update `index.ts` so `Form.Provider` exists and `FormProvider`/new types are exported.

- [ ] **Step 8: Run tests to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- form-root-api form-provider
```

Expected: PASS.

---

### Task 3: Add Advanced Store and Watch Failing Tests

**Files:**

- Create: `packages/components/src/form/__tests__/form-controlled-fields.test.tsx`
- Create: `packages/components/src/form/__tests__/form-instance-advanced.test.tsx`
- Modify: `packages/components/src/form/__tests__/form-hooks.test.tsx`

- [ ] **Step 1: Add controlled fields tests**

Add `form-controlled-fields.test.tsx`:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Input } from '../../input'
import { Form } from '../index'
import type { FieldData } from '../index'

describe('Form controlled fields', () => {
  it('hydrates field values and errors from fields prop', () => {
    const [fields, setFields] = createSignal<FieldData[]>([
      { name: 'username', value: 'Ada', errors: ['Broken'], touched: true },
    ])

    const result = render(() => (
      <>
        <Form fields={fields()}>
          <Form.Item name="username">
            <Input placeholder="username" />
          </Form.Item>
        </Form>
        <button
          type="button"
          onClick={() => setFields([{ name: 'username', value: 'Grace', errors: [] }])}
        >
          Update
        </button>
      </>
    ))

    expect(result.getByPlaceholderText('username')).toHaveValue('Ada')
    expect(result.getByText('Broken')).toBeInTheDocument()
    fireEvent.click(result.getByRole('button', { name: 'Update' }))
    expect(result.getByPlaceholderText('username')).toHaveValue('Grace')
    expect(result.queryByText('Broken')).not.toBeInTheDocument()
  })

  it('emits onFieldsChange when users edit controlled fields', () => {
    const onFieldsChange = vi.fn()
    const result = render(() => (
      <Form fields={[{ name: 'username', value: 'Ada' }]} onFieldsChange={onFieldsChange}>
        <Form.Item name="username">
          <Input placeholder="username" />
        </Form.Item>
      </Form>
    ))

    fireEvent.input(result.getByPlaceholderText('username'), { target: { value: 'Grace' } })

    expect(onFieldsChange).toHaveBeenCalledWith(
      [expect.objectContaining({ name: ['username'], value: 'Grace' })],
      [expect.objectContaining({ name: ['username'], value: 'Grace' })],
    )
  })
})
```

- [ ] **Step 2: Add advanced `getFieldsValue` tests**

Add `form-instance-advanced.test.tsx`:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Input } from '../../input'
import { Form, useForm } from '../index'

describe('FormInstance advanced getFieldsValue', () => {
  it('filters fields by touched and validating meta', () => {
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ a: 'A', b: 'B' }}>
        <Form.Item name="a">
          <Input />
        </Form.Item>
        <Form.Item name="b">
          <Input />
        </Form.Item>
      </Form>
    ))

    form.setFields([
      { name: 'a', touched: true },
      { name: 'b', validating: true },
    ])

    expect(form.getFieldsValue({ filter: (meta) => meta.touched })).toEqual({ a: 'A' })
    expect(form.getFieldsValue(['a', 'b'], (meta) => meta.validating)).toEqual({ b: 'B' })
  })

  it('strict mode returns only registered field paths', () => {
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ user: { name: 'Ada', hidden: 'secret' } }}>
        <Form.Item name={['user', 'name']}>
          <Input />
        </Form.Item>
      </Form>
    ))

    expect(form.getFieldsValue({ strict: true })).toEqual({ user: { name: 'Ada' } })
    expect(form.getFieldsValue(true)).toEqual({ user: { name: 'Ada', hidden: 'secret' } })
  })
})
```

- [ ] **Step 3: Add `useWatch` preserve tests**

Append to `form-hooks.test.tsx`:

```tsx
it('Form.useWatch ignores unregistered values by default and observes them with preserve', () => {
  const [form] = useForm()

  function DefaultWatch() {
    const value = Form.useWatch('age', form)
    return <span data-testid="default-watch">{String(value() ?? '')}</span>
  }

  function PreserveWatch() {
    const value = Form.useWatch('age', { form, preserve: true })
    return <span data-testid="preserve-watch">{String(value() ?? '')}</span>
  }

  const result = render(() => (
    <>
      <Form form={form}>
        <Form.Item name="name">
          <Input />
        </Form.Item>
      </Form>
      <DefaultWatch />
      <PreserveWatch />
    </>
  ))

  form.setFieldValue('age', 18)

  expect(result.getByTestId('default-watch')).toHaveTextContent(/^$/)
  expect(result.getByTestId('preserve-watch')).toHaveTextContent('18')
})
```

- [ ] **Step 4: Run tests to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- form-controlled-fields form-instance-advanced form-hooks
```

Expected: new tests FAIL because controlled fields, advanced `getFieldsValue`, and `useWatch` preserve semantics are incomplete.

---

### Task 4: Implement Controlled Fields, Advanced getFieldsValue, and Watch Semantics

**Files:**

- Modify: `packages/components/src/form/interface.ts`
- Modify: `packages/components/src/form/store.ts`
- Modify: `packages/components/src/form/use-watch.ts`

- [ ] **Step 1: Add overload types**

Update `FormInstance.getFieldsValue` overloads in `interface.ts` with `FilterFunc` and `GetFieldsValueConfig`.

- [ ] **Step 2: Implement filtering helper**

In `store.ts`, add a helper that turns registered records into `FieldData` meta and filters by `touched`/`validating` for both config and name-list overloads.

- [ ] **Step 3: Implement strict mode**

For `{ strict: true }`, return values only for registered field records. For default config without strict, preserve current default behavior.

- [ ] **Step 4: Finish controlled fields**

Complete `setControlledFields` from Task 2 if any test cases still fail: update signals for unregistered fields, preserve visible value updates, and clear errors when incoming `errors: []` is supplied.

- [ ] **Step 5: Fix `useWatch`**

Change `use-watch.ts` so name-path watches use `form.getFieldsValue()` by default and `form.getFieldsValue(true)` only when `preserve` is true. Selector watches should keep using all values because selectors may intentionally read arbitrary values.

- [ ] **Step 6: Run tests to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- form-controlled-fields form-instance-advanced form-hooks
```

Expected: PASS.

---

### Task 5: Add Form.Item API and Validation Message Failing Tests

**Files:**

- Create: `packages/components/src/form/__tests__/form-item-api.test.tsx`
- Modify: `packages/components/src/form/__tests__/validation.test.ts`

- [ ] **Step 1: Add Form.Item API tests**

Add `form-item-api.test.tsx`:

```tsx
import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Button } from '../../button'
import { Input } from '../../input'
import { Form } from '../index'

describe('Form.Item v6 APIs', () => {
  it('applies htmlFor and renders a label placeholder when label is null', () => {
    const result = render(() => (
      <Form>
        <Form.Item label="Username" htmlFor="username-input">
          <Input id="username-input" />
        </Form.Item>
        <Form.Item label={null}>
          <Input placeholder="aligned" />
        </Form.Item>
      </Form>
    ))

    expect(result.getByText('Username').closest('label')).toHaveAttribute('for', 'username-input')
    expect(result.getByPlaceholderText('aligned').closest('.ads-form-item')).toBeInTheDocument()
  })

  it('overrides item layout and applies semantic slots', () => {
    const result = render(() => (
      <Form layout="horizontal">
        <Form.Item
          layout="vertical"
          label="Username"
          classNames={{
            root: 'item-root',
            label: 'item-label',
            content: 'item-content',
            extra: 'item-extra',
          }}
          styles={{ content: { color: 'rgb(4, 5, 6)' } }}
          extra="Extra"
        >
          <Input />
        </Form.Item>
      </Form>
    ))

    expect(result.getByText('Username').closest('.ads-form-item')).toHaveClass(
      'ads-form-item-vertical',
    )
    expect(result.getByText('Username').closest('.ads-form-item')).toHaveClass('item-root')
    expect(result.getByText('Username').closest('label')).toHaveClass('item-label')
    expect(result.getByText('Extra')).toHaveClass('item-extra')
  })

  it('interpolates validateMessages and messageVariables', async () => {
    const result = render(() => (
      <Form validateMessages={{ required: '${label} needs ${another}' }}>
        <Form.Item
          label="Username"
          name="username"
          messageVariables={{ another: 'attention' }}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(result.getByText('Username needs attention')).toBeInTheDocument())
  })

  it('renders feedback icon when hasFeedback is enabled', async () => {
    const result = render(() => (
      <Form feedbackIcons={{ error: <span data-testid="form-error-icon">E</span> }}>
        <Form.Item name="username" hasFeedback rules={[{ required: true, message: 'Required' }]}>
          <Input />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    await waitFor(() => expect(result.getByTestId('form-error-icon')).toBeInTheDocument())
  })

  it('renders function requiredMark output', () => {
    const result = render(() => (
      <Form
        requiredMark={(label, info) => (
          <span data-testid="mark">{info.required ? 'R' : label}</span>
        )}
      >
        <Form.Item label="Username" name="username" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    ))

    expect(result.getByTestId('mark')).toHaveTextContent('R')
  })
})
```

- [ ] **Step 2: Add validation message tests**

Append to `validation.test.ts`:

```ts
it('uses validate message templates with custom variables and escaped placeholders', async () => {
  const result = await validateValue('username', '', {}, [{ required: true }], {
    validateMessages: { required: '${label} is required, \\${label} stays literal' },
    messageVariables: { label: 'User name' },
  })

  expect(result.errors).toEqual(['User name is required, ${label} stays literal'])
})
```

- [ ] **Step 3: Run tests to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- form-item-api validation
```

Expected: FAIL because item v6 APIs and validation message templating are incomplete.

---

### Task 6: Implement Form.Item APIs and Validation Messages

**Files:**

- Modify: `packages/components/src/form/interface.ts`
- Modify: `packages/components/src/form/context.tsx`
- Modify: `packages/components/src/form/form.tsx`
- Modify: `packages/components/src/form/form-item.tsx`
- Modify: `packages/components/src/form/validation.ts`
- Modify: `packages/components/src/form/form.style.ts`

- [ ] **Step 1: Extend item and validation types**

Add `FormItemSemanticSlot`, `FormItemHasFeedback`, `FeedbackIcons`, `ValidateMessages`, `FormTooltip`, and `Rule.message: string | JSX.Element`.

- [ ] **Step 2: Pass validation config through field meta**

Add `messageVariables`, `label`, and `validateMessages` to validation calls so default messages can be resolved without hard-coded messages in every rule.

- [ ] **Step 3: Implement template resolution**

In `validation.ts`, add `formatValidateMessage(template, variables)` with escaped placeholder handling. Use it when a rule omits `message`.

- [ ] **Step 4: Implement Form.Item rendering APIs**

Update `form-item.tsx` to render:

- `htmlFor`
- `label={null}` placeholder label wrapper
- item-level `layout`
- item semantic class/style slots
- `hasFeedback` icon span
- tooltip object shape
- required mark function result

- [ ] **Step 5: Update Form styles**

Add styles for:

- `.ads-form-item-vertical`
- `.ads-form-item-label-wrap`
- `.ads-form-item-feedback-icon`
- semantic help item spacing

- [ ] **Step 6: Run tests to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- form-item-api validation form-layout form-item-advanced
```

Expected: PASS.

---

### Task 7: Add Form-Level Control Default Failing Tests

**Files:**

- Create: `packages/components/src/form/__tests__/form-control-context.test.tsx`

- [ ] **Step 1: Add tests for integrated controls**

Add `form-control-context.test.tsx`:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Checkbox } from '../../checkbox'
import { Input } from '../../input'
import { InputNumber } from '../../input-number'
import { Radio } from '../../radio'
import { Select } from '../../select'
import { Switch } from '../../switch'
import { Form } from '../index'

describe('Form control defaults', () => {
  it('passes disabled, size, and variant to Form-integrated input controls', () => {
    const result = render(() => (
      <Form disabled size="large" variant="filled">
        <Form.Item name="username">
          <Input placeholder="username" />
        </Form.Item>
        <Form.Item name="amount">
          <InputNumber placeholder="amount" />
        </Form.Item>
        <Form.Item name="choice">
          <Select options={[{ label: 'A', value: 'a' }]} />
        </Form.Item>
      </Form>
    ))

    expect(result.getByPlaceholderText('username')).toBeDisabled()
    expect(result.getByPlaceholderText('username').closest('.ads-input-affix-wrapper')).toHaveClass(
      'ads-input-lg',
    )
    expect(result.getByPlaceholderText('username').closest('.ads-input-affix-wrapper')).toHaveClass(
      'ads-input-variant-filled',
    )
  })

  it('passes disabled and size to boolean controls without overriding explicit props', () => {
    const result = render(() => (
      <Form disabled size="small">
        <Form.Item name="agree" valuePropName="checked">
          <Checkbox>Agree</Checkbox>
        </Form.Item>
        <Form.Item name="enabled" valuePropName="checked">
          <Switch disabled={false} />
        </Form.Item>
        <Form.Item name="kind">
          <Radio.Group options={[{ label: 'A', value: 'a' }]} />
        </Form.Item>
      </Form>
    ))

    expect(result.getByLabelText('Agree')).toBeDisabled()
    expect(result.getByRole('switch')).not.toBeDisabled()
  })
})
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- form-control-context
```

Expected: FAIL because Form-level control defaults are not propagated.

---

### Task 8: Implement Form-Level Control Defaults

**Files:**

- Modify: `packages/components/src/form/interface.ts`
- Modify: `packages/components/src/form/form-item.tsx`
- Modify: `packages/components/src/input/input.tsx`
- Modify: `packages/components/src/input/text-area.tsx`
- Modify: `packages/components/src/input/search.tsx`
- Modify: `packages/components/src/input/password.tsx`
- Modify: `packages/components/src/input/otp.tsx`
- Modify: `packages/components/src/input-number/input-number.tsx`
- Modify: `packages/components/src/select/select.tsx`
- Modify: `packages/components/src/auto-complete/auto-complete.tsx`
- Modify: `packages/components/src/cascader/cascader.tsx`
- Modify: `packages/components/src/tree-select/tree-select.tsx`
- Modify: `packages/components/src/mentions/mentions.tsx`
- Modify: `packages/components/src/checkbox/checkbox.tsx`
- Modify: `packages/components/src/checkbox/checkbox-group.tsx`
- Modify: `packages/components/src/radio/radio.tsx`
- Modify: `packages/components/src/radio/radio-group.tsx`
- Modify: `packages/components/src/switch/switch.tsx`

- [ ] **Step 1: Extend `FormItemControl`**

Add accessors:

```ts
disabled: Accessor<boolean | undefined>
size: Accessor<ComponentSize | undefined>
variant: Accessor<FormVariant | undefined>
```

- [ ] **Step 2: Provide defaults from Form.Item**

In `form-item.tsx`, read root Form defaults from layout/config context and expose them through `FormItemControl`.

- [ ] **Step 3: Update controls**

In each targeted control, resolve props like:

```ts
const disabled = () => local.disabled ?? formItem?.disabled?.() ?? false
const size = () => local.size ?? formItem?.size?.() ?? config.componentSize()
const variant = () => local.variant ?? formItem?.variant?.() ?? 'outlined'
```

Only add `variant` when the control already supports a compatible variant prop.

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- form-control-context checkbox radio switch input input-number select auto-complete cascader tree-select mentions
```

Expected: PASS or any unrelated existing failures documented with exact failing test names.

---

### Task 9: Add Form Token Failing Tests

**Files:**

- Modify: `packages/theme/src/__tests__/theme.test.ts`

- [ ] **Step 1: Add token assertions**

Append assertions near existing Form token tests:

```ts
expect(getComponentToken('Form', token).labelFontSize).toBe(token.fontSize)
expect(getComponentToken('Form', token).labelHeight).toBe(token.controlHeight)
expect(getComponentToken('Form', token).labelColonMarginInlineStart).toBe(token.marginXXS / 2)
expect(getComponentToken('Form', token).labelColonMarginInlineEnd).toBe(token.marginXS)
expect(getComponentToken('Form', token).inlineItemMarginBottom).toBe(0)
expect(getComponentToken('Form', token).extraColor).toBe(token.colorTextDescription)
expect(getComponentToken('Form', token).feedbackIconSize).toBe(token.fontSize)
expect(getComponentToken('Form', token).feedbackIconMarginInlineStart).toBe(token.marginXS)
```

- [ ] **Step 2: Run tests to verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/theme test
```

Expected: FAIL because the new Form tokens are not in the token type/default map.

---

### Task 10: Implement Form Tokens and Style Alignment

**Files:**

- Modify: `packages/theme/src/types.ts`
- Modify: `packages/theme/src/components.ts`
- Modify: `packages/components/src/form/form.style.ts`

- [ ] **Step 1: Extend token type**

Add the new token fields to `FormComponentToken` while retaining existing fields.

- [ ] **Step 2: Add defaults**

Update `getComponentToken('Form', token)` defaults with the values from the design spec.

- [ ] **Step 3: Consume tokens in Form CSS**

Update `form.style.ts` to use:

- `labelFontSize`
- `labelHeight`
- `labelColonMarginInlineStart`
- `labelColonMarginInlineEnd`
- `inlineItemMarginBottom`
- `extraColor`
- `feedbackIconSize`
- `feedbackIconMarginInlineStart`

- [ ] **Step 4: Run tests to verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/theme test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- form-layout form-item-api
```

Expected: PASS.

---

### Task 11: Update Form Docs and API Tables

**Files:**

- Modify: `apps/docs/src/pages/components/form.mdx`

- [ ] **Step 1: Add examples**

Add or update examples for:

- form-level disabled
- size
- variants
- semantic `classNames/styles`
- `validateMessages` and `messageVariables`
- `Form.Provider`
- controlled `fields`
- `scrollToFirstError`
- `clearOnDestroy`
- feedback icons

Use Solid syntax with `class`, signals, accessors, and `For` where needed.

- [ ] **Step 2: Update API sections**

Update tables for:

- `Form`
- `Form.Item`
- `Form.List`
- `Form.ErrorList`
- `Form.Provider`
- hooks
- `FormInstance`
- `Rule`
- `ValidateMessages`
- `WatchOptions`
- design tokens

- [ ] **Step 3: Run docs/type checks**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: PASS. If `format:check` fails only because new docs need formatting, run `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format` and re-run `format:check`.

---

### Task 12: Full Verification

**Files:**

- No file edits expected.

- [ ] **Step 1: Run focused Form test suite**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- form
```

Expected: PASS.

- [ ] **Step 2: Run required repository verification**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: PASS, or document exact pre-existing unrelated failures with command output and affected files.

- [ ] **Step 3: Review working tree**

Run:

```bash
git status --short
git diff --stat
```

Expected: only files intentionally changed for Form parity, docs, and Form token alignment are present. Do not revert unrelated Input changes that were already in the working tree.
