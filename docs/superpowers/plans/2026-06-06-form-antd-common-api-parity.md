# Form antd Common API Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade `@ant-design-solid/core` Form from a flat synchronous MVP into a Solid-native implementation covering common Ant Design Form APIs: `NamePath`, nested values, field state APIs, async validation, enhanced `Form.Item`, hooks, `Form.List`, `Form.ErrorList`, and common layout props.

**Architecture:** Refactor Form into focused modules: `name-path.ts` and `value-util.ts` for path/value mechanics, `field-store.ts` and `store.ts` for state and public `FormInstance`, `validation.ts` for async rule evaluation, and component files for `Form`, `Form.Item`, `Form.List`, `Form.ErrorList`, and hooks. Preserve existing render-prop and context-based Solid binding while aligning public APIs with Ant Design where practical.

**Tech Stack:** TypeScript, SolidJS, Vitest, @solidjs/testing-library, jsdom, Vite, pnpm 11, oxlint, oxfmt.

---

## File Structure Map

### Existing files to modify

- `packages/components/src/form/interface.ts`: expand public Form types, `NamePath`, `Rule`, field state, `FormInstance`, and props.
- `packages/components/src/form/validation.ts`: replace synchronous validator with async rule pipeline.
- `packages/components/src/form/store.ts`: rebuild around nested values, field entities, field states, watchers, and expanded FormInstance methods.
- `packages/components/src/form/context.tsx`: add layout, item status, and list contexts.
- `packages/components/src/form/form.tsx`: support layout props, `onFieldsChange`, validation trigger defaults, and updated callbacks.
- `packages/components/src/form/form-item.tsx`: support `NamePath`, enhanced binding props, status context, dependencies, validation trigger, `noStyle`, `hidden`, and list path composition.
- `packages/components/src/form/form.style.ts`: add classes for layout, warning, validating, hidden, and no-style states.
- `packages/components/src/form/index.ts`: export and attach `Form.List`, `Form.ErrorList`, `Form.useForm`, `Form.useFormInstance`, `Form.useWatch`, and `Form.Item.useStatus`.
- `packages/components/src/form/__tests__/form.test.tsx`: adjust old expectations for `getFieldError` and keep existing regression coverage passing.
- `apps/docs/src/pages/components/form.tsx`: update API tables and demos after implementation phases.

### New files to create

- `packages/components/src/form/name-path.ts`: normalize, serialize, compare, and compose form field paths.
- `packages/components/src/form/value-util.ts`: clone, get, set, delete, merge, and flatten nested values.
- `packages/components/src/form/field-store.ts`: internal field entity/state utilities used by `store.ts`.
- `packages/components/src/form/use-watch.ts`: Solid-native `useWatch` implementation.
- `packages/components/src/form/form-list.tsx`: `Form.List` implementation.
- `packages/components/src/form/form-error-list.tsx`: `Form.ErrorList` implementation.
- `packages/components/src/form/__tests__/name-path.test.ts`: unit tests for path helpers.
- `packages/components/src/form/__tests__/value-util.test.ts`: unit tests for nested value helpers.
- `packages/components/src/form/__tests__/form-instance.test.tsx`: FormInstance API and nested value tests.
- `packages/components/src/form/__tests__/validation.test.ts`: async validation and rule tests.
- `packages/components/src/form/__tests__/form-item-advanced.test.tsx`: enhanced Form.Item tests.
- `packages/components/src/form/__tests__/form-list.test.tsx`: dynamic list tests.
- `packages/components/src/form/__tests__/form-hooks.test.tsx`: hook tests.

## Execution Notes

- Respect `AGENTS.md`: all new TypeScript filenames are lowercase kebab-case.
- Use TDD for each task: write focused failing tests first, run the targeted test, implement, rerun.
- Commit after each task using the commit message shown in the task.
- Use targeted commands during development:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/name-path.test.ts
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
```

- Run full verification at the end:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

---

## Task 1: Add NamePath Utilities

**Files:**

- Create: `packages/components/src/form/name-path.ts`
- Create: `packages/components/src/form/__tests__/name-path.test.ts`
- Modify: `packages/components/src/form/interface.ts`

- [ ] **Step 1: Add failing NamePath tests**

Create `packages/components/src/form/__tests__/name-path.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  containsNamePath,
  getNamePath,
  isSameNamePath,
  matchNamePath,
  serializeNamePath,
} from '../name-path'

describe('form name-path utilities', () => {
  it('normalizes string, number, and array names', () => {
    expect(getNamePath('user')).toEqual(['user'])
    expect(getNamePath(0)).toEqual([0])
    expect(getNamePath(['users', 0, 'name'])).toEqual(['users', 0, 'name'])
  })

  it('serializes paths without dot-join collisions', () => {
    expect(serializeNamePath(['a.b'])).not.toBe(serializeNamePath(['a', 'b']))
    expect(serializeNamePath(['users', 0, 'name'])).toBe('["users",0,"name"]')
  })

  it('compares exact paths', () => {
    expect(isSameNamePath(['user', 'email'], ['user', 'email'])).toBe(true)
    expect(isSameNamePath(['user', 'email'], ['user'])).toBe(false)
    expect(isSameNamePath(['0'], [0])).toBe(false)
  })

  it('detects parent-child path relationships', () => {
    expect(containsNamePath(['user'], ['user', 'email'])).toBe(true)
    expect(containsNamePath(['user', 'email'], ['user'])).toBe(false)
    expect(containsNamePath(['users', 0], ['users', 0, 'name'])).toBe(true)
    expect(containsNamePath(['users', 1], ['users', 0, 'name'])).toBe(false)
  })

  it('matches paths exactly or recursively', () => {
    expect(matchNamePath(['user'], ['user', 'email'], false)).toBe(false)
    expect(matchNamePath(['user'], ['user', 'email'], true)).toBe(true)
    expect(matchNamePath(['user', 'email'], ['user', 'email'], false)).toBe(true)
  })
})
```

- [ ] **Step 2: Run the targeted test and verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/name-path.test.ts
```

Expected: FAIL because `../name-path` does not exist.

- [ ] **Step 3: Add NamePath types**

In `packages/components/src/form/interface.ts`, replace the current `FieldName` type line with:

```ts
export type NamePath = string | number | Array<string | number>
export type InternalNamePath = Array<string | number>
export type FieldName = NamePath
```

Keep the rest of the file unchanged for this task.

- [ ] **Step 4: Implement NamePath utilities**

Create `packages/components/src/form/name-path.ts`:

```ts
import type { InternalNamePath, NamePath } from './interface'

export function getNamePath(name: NamePath): InternalNamePath {
  return Array.isArray(name) ? [...name] : [name]
}

export function serializeNamePath(name: NamePath): string {
  return JSON.stringify(getNamePath(name))
}

export function isSameNamePath(first: NamePath, second: NamePath): boolean {
  const firstPath = getNamePath(first)
  const secondPath = getNamePath(second)
  if (firstPath.length !== secondPath.length) return false
  return firstPath.every((segment, index) => segment === secondPath[index])
}

export function containsNamePath(parent: NamePath, child: NamePath): boolean {
  const parentPath = getNamePath(parent)
  const childPath = getNamePath(child)
  if (parentPath.length > childPath.length) return false
  return parentPath.every((segment, index) => segment === childPath[index])
}

export function matchNamePath(base: NamePath, target: NamePath, recursive = false): boolean {
  return recursive ? containsNamePath(base, target) : isSameNamePath(base, target)
}

export function composeNamePath(prefix: NamePath | undefined, name: NamePath): InternalNamePath {
  return prefix === undefined ? getNamePath(name) : [...getNamePath(prefix), ...getNamePath(name)]
}
```

- [ ] **Step 5: Run the targeted test and verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/name-path.test.ts
```

Expected: PASS.

- [ ] **Step 7: Run typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
```

Expected: PASS. If TypeScript reports existing `FieldName` string-only assumptions, leave them for Task 3 unless this task introduced the error.

- [ ] **Step 8: Commit**

```bash
git add packages/components/src/form/interface.ts packages/components/src/form/name-path.ts packages/components/src/form/__tests__/name-path.test.ts
git commit -m "feat(form): add name path utilities"
```

---

## Task 2: Add Nested Value Utilities

**Files:**

- Create: `packages/components/src/form/value-util.ts`
- Create: `packages/components/src/form/__tests__/value-util.test.ts`

- [ ] **Step 1: Add failing nested value tests**

Create `packages/components/src/form/__tests__/value-util.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  cloneFormValues,
  deleteValue,
  flattenValuePaths,
  getValue,
  mergeValues,
  setValue,
} from '../value-util'

describe('form value utilities', () => {
  it('gets nested object and array values', () => {
    const values = { user: { email: 'a@example.com' }, users: [{ name: 'Ada' }] }

    expect(getValue(values, ['user', 'email'])).toBe('a@example.com')
    expect(getValue(values, ['users', 0, 'name'])).toBe('Ada')
    expect(getValue(values, ['missing'])).toBeUndefined()
  })

  it('sets nested object values immutably', () => {
    const original = { user: { email: 'old@example.com' } }
    const next = setValue(original, ['user', 'email'], 'new@example.com')

    expect(next).toEqual({ user: { email: 'new@example.com' } })
    expect(original).toEqual({ user: { email: 'old@example.com' } })
  })

  it('creates arrays for numeric path segments', () => {
    expect(setValue({}, ['users', 0, 'name'], 'Ada')).toEqual({ users: [{ name: 'Ada' }] })
  })

  it('deletes nested values immutably', () => {
    const original = { user: { email: 'a@example.com', name: 'Ada' } }
    const next = deleteValue(original, ['user', 'email'])

    expect(next).toEqual({ user: { name: 'Ada' } })
    expect(original).toEqual({ user: { email: 'a@example.com', name: 'Ada' } })
  })

  it('deep merges values', () => {
    expect(mergeValues({ user: { email: 'a@example.com' } }, { user: { name: 'Ada' } })).toEqual({
      user: { email: 'a@example.com', name: 'Ada' },
    })
  })

  it('clones values so public reads cannot mutate store state', () => {
    const values = { user: { email: 'a@example.com' } }
    const clone = cloneFormValues(values)
    ;(clone.user as { email: string }).email = 'changed@example.com'

    expect(values.user.email).toBe('a@example.com')
  })

  it('flattens nested values to field paths', () => {
    expect(
      flattenValuePaths({ user: { email: 'a@example.com' }, users: [{ name: 'Ada' }] }),
    ).toEqual([
      ['user', 'email'],
      ['users', 0, 'name'],
    ])
  })
})
```

- [ ] **Step 2: Run the targeted test and verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/value-util.test.ts
```

Expected: FAIL because `../value-util` does not exist.

- [ ] **Step 3: Implement nested value utilities**

Create `packages/components/src/form/value-util.ts`:

```ts
import { getNamePath } from './name-path'
import type { FormValues, InternalNamePath, NamePath } from './interface'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item)) as T
  if (isPlainObject(value)) {
    const next: Record<string, unknown> = {}
    for (const key of Object.keys(value)) next[key] = cloneValue(value[key])
    return next as T
  }
  return value
}

function createContainer(
  nextSegment: string | number | undefined,
): unknown[] | Record<string, unknown> {
  return typeof nextSegment === 'number' ? [] : {}
}

function cloneContainer(value: unknown, nextSegment: string | number | undefined) {
  if (Array.isArray(value)) return [...value]
  if (isPlainObject(value)) return { ...value }
  return createContainer(nextSegment)
}

export function cloneFormValues(values: FormValues): FormValues {
  return cloneValue(values)
}

export function getValue(values: FormValues, name: NamePath): unknown {
  let current: unknown = values
  for (const segment of getNamePath(name)) {
    if (current == null || typeof current !== 'object') return undefined
    current = (current as Record<string | number, unknown>)[segment]
  }
  return current
}

export function setValue(values: FormValues, name: NamePath, value: unknown): FormValues {
  const path = getNamePath(name)
  if (path.length === 0) return cloneValue(value) as FormValues

  const root = cloneContainer(values, path[0]) as Record<string | number, unknown>
  let current = root

  for (let index = 0; index < path.length; index += 1) {
    const segment = path[index]
    const isLast = index === path.length - 1
    if (isLast) {
      current[segment] = cloneValue(value)
    } else {
      const nextSegment = path[index + 1]
      const nextValue = cloneContainer(current[segment], nextSegment)
      current[segment] = nextValue
      current = nextValue as Record<string | number, unknown>
    }
  }

  return root as FormValues
}

export function deleteValue(values: FormValues, name: NamePath): FormValues {
  const path = getNamePath(name)
  if (path.length === 0) return {}

  const root = cloneContainer(values, path[0]) as Record<string | number, unknown>
  let current: Record<string | number, unknown> = root

  for (let index = 0; index < path.length - 1; index += 1) {
    const segment = path[index]
    const nextSegment = path[index + 1]
    const nextValue = cloneContainer(current[segment], nextSegment)
    current[segment] = nextValue
    current = nextValue as Record<string | number, unknown>
  }

  delete current[path[path.length - 1]]
  return root as FormValues
}

export function mergeValues(current: FormValues, patch: FormValues): FormValues {
  const next = cloneFormValues(current)

  for (const key of Object.keys(patch)) {
    const currentValue = next[key]
    const patchValue = patch[key]
    if (isPlainObject(currentValue) && isPlainObject(patchValue)) {
      next[key] = mergeValues(currentValue, patchValue)
    } else {
      next[key] = cloneValue(patchValue)
    }
  }

  return next
}

export function flattenValuePaths(
  values: unknown,
  prefix: InternalNamePath = [],
): InternalNamePath[] {
  if (Array.isArray(values)) {
    return values.flatMap((item, index) => flattenValuePaths(item, [...prefix, index]))
  }
  if (isPlainObject(values)) {
    return Object.keys(values).flatMap((key) => flattenValuePaths(values[key], [...prefix, key]))
  }
  return prefix.length > 0 ? [prefix] : []
}

export function pickValues(values: FormValues, names: NamePath[]): FormValues {
  return names.reduce<FormValues>((picked, name) => {
    const value = getValue(values, name)
    return value === undefined ? picked : setValue(picked, name, value)
  }, {})
}
```

- [ ] **Step 4: Run the targeted test and verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/value-util.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run form helper tests together**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/name-path.test.ts packages/components/src/form/__tests__/value-util.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/components/src/form/value-util.ts packages/components/src/form/__tests__/value-util.test.ts
git commit -m "feat(form): add nested value utilities"
```

---

## Task 3: Expand FormInstance Core State APIs

**Files:**

- Modify: `packages/components/src/form/interface.ts`
- Create: `packages/components/src/form/field-store.ts`
- Modify: `packages/components/src/form/store.ts`
- Modify: `packages/components/src/form/form-item.tsx`
- Modify: `packages/components/src/form/__tests__/form.test.tsx`
- Create: `packages/components/src/form/__tests__/form-instance.test.tsx`

- [ ] **Step 1: Add failing FormInstance tests**

Create `packages/components/src/form/__tests__/form-instance.test.tsx`:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Input } from '../../input'
import { Form, useForm } from '../index'

describe('FormInstance core parity APIs', () => {
  it('stores nested values by NamePath', () => {
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ user: { email: 'seed@example.com' } }}>
        <Form.Item name={['user', 'email']}>
          <Input />
        </Form.Item>
      </Form>
    ))

    expect(form.getFieldValue(['user', 'email'])).toBe('seed@example.com')

    form.setFieldValue(['user', 'email'], 'next@example.com')

    expect(form.getFieldValue(['user', 'email'])).toBe('next@example.com')
    expect(form.getFieldsValue(true)).toEqual({ user: { email: 'next@example.com' } })
  })

  it('returns registered values by default and selected values by name list', () => {
    const [form] = useForm()
    render(() => (
      <Form
        form={form}
        initialValues={{ user: { email: 'a@example.com', name: 'Ada' }, hidden: 'x' }}
      >
        <Form.Item name={['user', 'email']}>
          <Input />
        </Form.Item>
      </Form>
    ))

    expect(form.getFieldsValue()).toEqual({ user: { email: 'a@example.com' } })
    expect(form.getFieldsValue([['user', 'name']])).toEqual({ user: { name: 'Ada' } })
    expect(form.getFieldsValue(true)).toEqual({
      user: { email: 'a@example.com', name: 'Ada' },
      hidden: 'x',
    })
  })

  it('sets field state through setFields', () => {
    const [form] = useForm()
    render(() => (
      <Form form={form}>
        <Form.Item name="username">
          <Input />
        </Form.Item>
      </Form>
    ))

    form.setFields([
      {
        name: 'username',
        value: 'Ada',
        errors: ['Broken'],
        warnings: ['Careful'],
        touched: true,
        validating: true,
      },
    ])

    expect(form.getFieldValue('username')).toBe('Ada')
    expect(form.getFieldError('username')).toEqual(['Broken'])
    expect(form.getFieldsError()).toEqual([
      { name: ['username'], errors: ['Broken'], warnings: ['Careful'] },
    ])
    expect(form.isFieldTouched('username')).toBe(true)
    expect(form.isFieldsTouched(['username'], true)).toBe(true)
    expect(form.isFieldValidating('username')).toBe(true)
  })

  it('fires onFieldsChange when values and field states change', () => {
    const onFieldsChange = vi.fn()
    const [form] = useForm()
    render(() => (
      <Form form={form} onFieldsChange={onFieldsChange}>
        <Form.Item name="username">
          <Input />
        </Form.Item>
      </Form>
    ))

    form.setFieldValue('username', 'Ada')

    expect(onFieldsChange).toHaveBeenCalledWith(
      [expect.objectContaining({ name: ['username'], value: 'Ada', touched: true })],
      [expect.objectContaining({ name: ['username'], value: 'Ada', touched: true })],
    )
  })

  it('resets nested fields to initial values and clears state', () => {
    const [form] = useForm()
    render(() => (
      <Form form={form} initialValues={{ user: { email: 'seed@example.com' } }}>
        <Form.Item name={['user', 'email']}>
          <Input />
        </Form.Item>
      </Form>
    ))

    form.setFields([
      { name: ['user', 'email'], value: 'changed@example.com', errors: ['Bad'], touched: true },
    ])
    form.resetFields([['user', 'email']])

    expect(form.getFieldValue(['user', 'email'])).toBe('seed@example.com')
    expect(form.getFieldError(['user', 'email'])).toEqual([])
    expect(form.isFieldTouched(['user', 'email'])).toBe(false)
  })
})
```

- [ ] **Step 2: Run the targeted test and verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/form-instance.test.tsx
```

Expected: FAIL because `FormInstance` does not support nested values, `setFields`, or field state methods.

- [ ] **Step 3: Expand public interfaces**

Replace the relevant type definitions in `packages/components/src/form/interface.ts` with this complete block, preserving the import line:

```ts
export type NamePath = string | number | Array<string | number>
export type InternalNamePath = Array<string | number>
export type FieldName = NamePath
export type FieldValue = unknown
export type FormValues = Record<string, FieldValue>
export type ValidateStatus = 'success' | 'warning' | 'error' | 'validating'

export interface ValidateConfig {
  validateOnly?: boolean
  recursive?: boolean
  dirty?: boolean
}

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
  name: InternalNamePath
  errors: string[]
  warnings?: string[]
}

export interface FieldData extends FieldError {
  value?: FieldValue
  touched?: boolean
  validating?: boolean
}

export interface ValidateErrorInfo {
  values: FormValues
  errorFields: FieldError[]
  outOfDate: boolean
}

export interface FieldMeta {
  name: FieldName
  rules: Rule[]
  initialValue?: FieldValue
  preserve?: boolean
  dependencies?: NamePath[]
  validateTrigger?: string | string[]
}

export interface FormInstance {
  getFieldValue: (name: FieldName) => FieldValue
  setFieldValue: (name: FieldName, value: FieldValue) => void
  getFieldsValue: (nameList?: true | FieldName[]) => FormValues
  setFieldsValue: (values: FormValues) => void
  setFields: (fields: FieldData[]) => void
  resetFields: (names?: FieldName[]) => void
  validateFields: (names?: FieldName[], config?: ValidateConfig) => Promise<FormValues>
  submit: () => void
  registerField: (meta: FieldMeta) => () => void
  getFieldError: (name: FieldName) => string[]
  getFieldsError: (nameList?: FieldName[]) => FieldError[]
  getFieldErrorAccessor: (name: FieldName) => Accessor<string[]>
  isFieldTouched: (name: FieldName) => boolean
  isFieldsTouched: (nameList?: FieldName[], allTouched?: boolean) => boolean
  isFieldValidating: (name: FieldName) => boolean
}
```

Keep the existing `FormItemControl`, `FormProps`, and `FormItemProps` below this block, then add to `FormProps`:

```ts
onFieldsChange?: (changedFields: FieldData[], allFields: FieldData[]) => void
```

- [ ] **Step 4: Add field store helpers**

Create `packages/components/src/form/field-store.ts`:

```ts
import { createSignal, type Accessor } from 'solid-js'
import { getNamePath, serializeNamePath } from './name-path'
import { getValue } from './value-util'
import type { FieldData, FieldMeta, FieldName, FormValues, InternalNamePath } from './interface'

export interface FieldState {
  name: InternalNamePath
  touched: boolean
  validating: boolean
  validated: boolean
  dirty: boolean
  errors: string[]
  warnings: string[]
}

export interface FieldRecord {
  meta: FieldMeta
  state: FieldState
  errors: Accessor<string[]>
  setErrors: (errors: string[]) => void
}

export function createFieldState(name: FieldName): FieldState {
  return {
    name: getNamePath(name),
    touched: false,
    validating: false,
    validated: false,
    dirty: false,
    errors: [],
    warnings: [],
  }
}

export function createFieldRecord(meta: FieldMeta): FieldRecord {
  const [errors, setErrorsSignal] = createSignal<string[]>([])
  const state = createFieldState(meta.name)
  const setErrors = (nextErrors: string[]) => {
    state.errors = [...nextErrors]
    setErrorsSignal([...nextErrors])
  }
  return { meta, state, errors, setErrors }
}

export function fieldRecordToData(record: FieldRecord, values: FormValues): FieldData {
  return {
    name: [...record.state.name],
    value: getValue(values, record.state.name),
    errors: [...record.state.errors],
    warnings: [...record.state.warnings],
    touched: record.state.touched,
    validating: record.state.validating,
  }
}

export function getFieldKey(name: FieldName): string {
  return serializeNamePath(name)
}
```

- [ ] **Step 5: Rebuild store core APIs**

Replace `packages/components/src/form/store.ts` with this implementation:

```ts
import { batch, createRoot, untrack, type Accessor } from 'solid-js'
import { createFieldRecord, fieldRecordToData, getFieldKey, type FieldRecord } from './field-store'
import { getNamePath, matchNamePath } from './name-path'
import {
  cloneFormValues,
  flattenValuePaths,
  getValue,
  mergeValues,
  pickValues,
  setValue,
} from './value-util'
import { validateValue } from './validation'
import type {
  FieldData,
  FieldError,
  FieldMeta,
  FieldName,
  FieldValue,
  FormInstance,
  FormValues,
  ValidateConfig,
  ValidateErrorInfo,
} from './interface'

interface CreateFormOptions {
  initialValues?: FormValues
  onFinish?: (values: FormValues) => void
  onFinishFailed?: (errorInfo: ValidateErrorInfo) => void
  onValuesChange?: (changedValues: FormValues, allValues: FormValues) => void
  onFieldsChange?: (changedFields: FieldData[], allFields: FieldData[]) => void
}

interface InternalFormInstance extends FormInstance {
  setInitialValues?: (values?: FormValues) => void
  setCallbacks?: (callbacks: Omit<CreateFormOptions, 'initialValues'>) => void
}

function toErrorFields(records: FieldRecord[]): FieldError[] {
  return records
    .filter((record) => record.state.errors.length > 0)
    .map((record) => ({
      name: [...record.state.name],
      errors: [...record.state.errors],
      warnings: [...record.state.warnings],
    }))
}

export function createFormInstance(options: CreateFormOptions = {}): FormInstance {
  return createRoot(() => {
    let formInitialValues = cloneFormValues(options.initialValues ?? {})
    let currentValues = cloneFormValues(formInitialValues)
    let callbacks: Omit<CreateFormOptions, 'initialValues'> = {
      onFinish: options.onFinish,
      onFinishFailed: options.onFinishFailed,
      onValuesChange: options.onValuesChange,
      onFieldsChange: options.onFieldsChange,
    }
    const fields = new Map<string, FieldRecord>()

    function getRegisteredRecords(nameList?: FieldName[]): FieldRecord[] {
      const records = Array.from(fields.values())
      if (!nameList) return records
      return records.filter((record) =>
        nameList.some((name) => matchNamePath(name, record.state.name, false)),
      )
    }

    function getAllFieldData(): FieldData[] {
      return Array.from(fields.values()).map((record) => fieldRecordToData(record, currentValues))
    }

    function notifyFieldsChange(changedRecords: FieldRecord[]) {
      if (changedRecords.length === 0) return
      callbacks.onFieldsChange?.(
        changedRecords.map((record) => fieldRecordToData(record, currentValues)),
        getAllFieldData(),
      )
    }

    function clearRecordValidation(record: FieldRecord) {
      record.setErrors([])
      record.state.warnings = []
      record.state.validating = false
    }

    function setFieldValueInternal(
      name: FieldName,
      value: FieldValue,
      touch: boolean,
    ): FieldRecord | undefined {
      currentValues = setValue(currentValues, name, value)
      const record = fields.get(getFieldKey(name))
      if (record) {
        if (touch) record.state.touched = true
        record.state.dirty = true
        clearRecordValidation(record)
      }
      return record
    }

    async function validateFieldNames(
      names: FieldName[],
      config: ValidateConfig = {},
    ): Promise<{
      values: FormValues
      errorFields: FieldError[]
      outOfDate: boolean
    }> {
      const records = getRegisteredRecords(names)
      for (const record of records) {
        if (config.dirty && !record.state.dirty && !record.state.validated) continue
        const errors = validateValue(
          record.state.name.join('.'),
          getValue(currentValues, record.state.name),
          currentValues,
          record.meta.rules,
        )
        record.state.validated = true
        if (!config.validateOnly) record.setErrors(errors)
      }
      return {
        values: cloneFormValues(currentValues),
        errorFields: toErrorFields(records),
        outOfDate: false,
      }
    }

    const form: InternalFormInstance = {
      getFieldValue(name) {
        return getValue(currentValues, name)
      },
      setFieldValue(name, value) {
        batch(() => {
          const record = setFieldValueInternal(name, value, true)
          const changedValues = setValue({}, name, value)
          callbacks.onValuesChange?.(changedValues, cloneFormValues(currentValues))
          if (record) notifyFieldsChange([record])
        })
      },
      getFieldsValue(nameList) {
        if (nameList === true) return cloneFormValues(currentValues)
        if (Array.isArray(nameList)) return pickValues(currentValues, nameList)
        return pickValues(
          currentValues,
          Array.from(fields.values()).map((record) => record.state.name),
        )
      },
      setFieldsValue(nextValues) {
        batch(() => {
          currentValues = mergeValues(currentValues, nextValues)
          const changedPaths = flattenValuePaths(nextValues)
          const changedRecords = Array.from(fields.values()).filter((record) =>
            changedPaths.some((path) => matchNamePath(path, record.state.name, false)),
          )
          for (const record of changedRecords) {
            record.state.dirty = true
            clearRecordValidation(record)
          }
          callbacks.onValuesChange?.(cloneFormValues(nextValues), cloneFormValues(currentValues))
          notifyFieldsChange(changedRecords)
        })
      },
      setFields(nextFields) {
        batch(() => {
          const changedRecords: FieldRecord[] = []
          for (const field of nextFields) {
            const key = getFieldKey(field.name)
            let record = fields.get(key)
            if (!record) {
              record = createFieldRecord({ name: field.name, rules: [] })
              fields.set(key, record)
            }
            if ('value' in field) currentValues = setValue(currentValues, field.name, field.value)
            if (field.errors) record.setErrors(field.errors)
            if (field.warnings) record.state.warnings = [...field.warnings]
            if (field.touched !== undefined) record.state.touched = field.touched
            if (field.validating !== undefined) record.state.validating = field.validating
            if ('value' in field) record.state.dirty = true
            changedRecords.push(record)
          }
          notifyFieldsChange(changedRecords)
        })
      },
      resetFields(names) {
        const targetRecords = getRegisteredRecords(names)
        batch(() => {
          for (const record of targetRecords) {
            const itemInitialValue = record.meta.initialValue
            const initialValue =
              itemInitialValue !== undefined
                ? itemInitialValue
                : getValue(formInitialValues, record.state.name)
            currentValues = setValue(currentValues, record.state.name, initialValue)
            record.state.touched = false
            record.state.validating = false
            record.state.validated = false
            record.state.dirty = false
            record.state.warnings = []
            record.setErrors([])
          }
          notifyFieldsChange(targetRecords)
        })
      },
      async validateFields(names, config) {
        const targetNames = names ?? Array.from(fields.values()).map((record) => record.state.name)
        const result = await validateFieldNames(targetNames, config)
        if (result.errorFields.length > 0) throw result
        return result.values
      },
      submit() {
        const targetNames = Array.from(fields.values()).map((record) => record.state.name)
        void validateFieldNames(targetNames).then((result) => {
          if (result.errorFields.length > 0) callbacks.onFinishFailed?.(result)
          else callbacks.onFinish?.(result.values)
        })
      },
      registerField(meta) {
        const key = getFieldKey(meta.name)
        const existing = fields.get(key)
        const record = existing ?? createFieldRecord(meta)
        record.meta = meta
        fields.set(key, record)
        if (
          meta.initialValue !== undefined &&
          untrack(() => getValue(currentValues, meta.name)) === undefined
        ) {
          currentValues = setValue(currentValues, meta.name, meta.initialValue)
        }
        return () => {
          if (fields.get(key) === record) fields.delete(key)
        }
      },
      getFieldError(name) {
        return [...(fields.get(getFieldKey(name))?.state.errors ?? [])]
      },
      getFieldsError(nameList) {
        return getRegisteredRecords(nameList).map((record) => ({
          name: [...record.state.name],
          errors: [...record.state.errors],
          warnings: [...record.state.warnings],
        }))
      },
      getFieldErrorAccessor(name) {
        const key = getFieldKey(name)
        let record = fields.get(key)
        if (!record) {
          record = createFieldRecord({ name, rules: [] })
          fields.set(key, record)
        }
        return record.errors
      },
      isFieldTouched(name) {
        return fields.get(getFieldKey(name))?.state.touched ?? false
      },
      isFieldsTouched(nameList, allTouched = false) {
        const records = getRegisteredRecords(nameList)
        if (records.length === 0) return false
        return allTouched
          ? records.every((record) => record.state.touched)
          : records.some((record) => record.state.touched)
      },
      isFieldValidating(name) {
        return fields.get(getFieldKey(name))?.state.validating ?? false
      },
      setInitialValues(nextInitialValues) {
        formInitialValues = cloneFormValues(nextInitialValues ?? {})
        currentValues = mergeValues(formInitialValues, currentValues)
      },
      setCallbacks(nextCallbacks) {
        callbacks = nextCallbacks
      },
    }

    return form
  })
}

export function useForm(form?: FormInstance): [FormInstance] {
  return [form ?? createFormInstance()]
}

export function setFormInitialValues(form: FormInstance, initialValues?: FormValues): void {
  ;(form as InternalFormInstance).setInitialValues?.(initialValues)
}

export function setFormCallbacks(
  form: FormInstance,
  callbacks: Omit<CreateFormOptions, 'initialValues'>,
): void {
  ;(form as InternalFormInstance).setCallbacks?.(callbacks)
}
```

- [ ] **Step 6: Update Form callbacks wiring**

In `packages/components/src/form/form.tsx`, add `onFieldsChange` to the `splitProps` list and callback object:

```ts
const [local, rest] = splitProps(props, [
  'form',
  'initialValues',
  'onFinish',
  'onFinishFailed',
  'onValuesChange',
  'onFieldsChange',
  'children',
  'class',
  'onSubmit',
  'onReset',
])
```

and:

```ts
setFormCallbacks(form(), {
  onFinish: local.onFinish,
  onFinishFailed: local.onFinishFailed,
  onValuesChange: local.onValuesChange,
  onFieldsChange: local.onFieldsChange,
})
```

- [ ] **Step 7: Update Form.Item error access**

In `packages/components/src/form/form-item.tsx`, replace:

```ts
const errors = () => (props.name && form ? form.getFieldError(props.name)() : [])
```

with:

```ts
const errors = () => (props.name && form ? form.getFieldErrorAccessor(props.name)() : [])
```

Keep the rest of `form-item.tsx` unchanged for this task.

- [ ] **Step 8: Update old tests for `getFieldError`**

In `packages/components/src/form/__tests__/form.test.tsx`, replace calls of this form:

```ts
form.getFieldError('a')()
```

with:

```ts
form.getFieldError('a')
```

There should be no remaining `getFieldError(... )()` calls after this step.

- [ ] **Step 9: Run targeted tests and verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/form-instance.test.tsx packages/components/src/form/__tests__/form.test.tsx
```

Expected: PASS.

- [ ] **Step 10: Run typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
```

Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add packages/components/src/form/interface.ts packages/components/src/form/field-store.ts packages/components/src/form/store.ts packages/components/src/form/form.tsx packages/components/src/form/form-item.tsx packages/components/src/form/__tests__/form.test.tsx packages/components/src/form/__tests__/form-instance.test.tsx
git commit -m "feat(form): expand form instance state APIs"
```

---

## Task 4: Implement Async Validation v2

**Files:**

- Modify: `packages/components/src/form/validation.ts`
- Modify: `packages/components/src/form/store.ts`
- Create: `packages/components/src/form/__tests__/validation.test.ts`

- [ ] **Step 1: Add failing validation tests**

Create `packages/components/src/form/__tests__/validation.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { validateValue } from '../validation'

describe('form validation v2', () => {
  it('validates common rule fields', async () => {
    await expect(
      validateValue('email', 'bad', {}, [{ type: 'email', message: 'Invalid email' }]),
    ).resolves.toEqual({ errors: ['Invalid email'], warnings: [] })
    await expect(
      validateValue('name', '   ', {}, [{ whitespace: true, message: 'No blanks' }]),
    ).resolves.toEqual({ errors: ['No blanks'], warnings: [] })
    await expect(
      validateValue('role', 'guest', {}, [{ type: 'enum', enum: ['admin'], message: 'Nope' }]),
    ).resolves.toEqual({ errors: ['Nope'], warnings: [] })
  })

  it('supports transform before validation', async () => {
    await expect(
      validateValue('name', ' Ada ', {}, [
        { transform: (value) => String(value).trim(), len: 3, message: 'Must be three' },
      ]),
    ).resolves.toEqual({ errors: [], warnings: [] })
  })

  it('supports async validators', async () => {
    await expect(
      validateValue('username', 'taken', {}, [
        {
          async validator(_, value) {
            if (value === 'taken') throw new Error('Taken')
          },
        },
      ]),
    ).resolves.toEqual({ errors: ['Taken'], warnings: [] })
  })

  it('stores warningOnly failures as warnings', async () => {
    await expect(
      validateValue('age', 16, {}, [{ min: 18, warningOnly: true, message: 'Young' }]),
    ).resolves.toEqual({
      errors: [],
      warnings: ['Young'],
    })
  })

  it('stops on the first error when validateFirst is true', async () => {
    await expect(
      validateValue(
        'name',
        '',
        {},
        [
          { required: true, message: 'Required' },
          { min: 3, message: 'Too short' },
        ],
        { validateFirst: true },
      ),
    ).resolves.toEqual({ errors: ['Required'], warnings: [] })
  })
})
```

- [ ] **Step 2: Run validation tests and verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/validation.test.ts
```

Expected: FAIL because `validateValue` still returns `string[]` synchronously.

- [ ] **Step 3: Expand Rule types for async validation**

In `packages/components/src/form/interface.ts`, replace the current `Rule` interface with:

```ts
export interface RuleConfig {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'enum'
  enum?: FieldValue[]
  min?: number
  max?: number
  len?: number
  pattern?: RegExp
  whitespace?: boolean
  transform?: (value: FieldValue) => FieldValue
  message?: JSX.Element
  warningOnly?: boolean
  validateTrigger?: string | string[]
  validator?: (rule: RuleConfig, value: FieldValue) => string | void | Promise<void>
}

export type Rule = RuleConfig | ((form: FormInstance) => RuleConfig)
```

- [ ] **Step 4: Replace validation implementation**

Replace `packages/components/src/form/validation.ts` with:

```ts
import type { FieldValue, FormInstance, FormValues, Rule, RuleConfig } from './interface'

export interface ValidateValueOptions {
  form?: FormInstance
  validateFirst?: boolean | 'parallel'
}

export interface ValidateValueResult {
  errors: string[]
  warnings: string[]
}

function isEmpty(value: FieldValue): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

function getLength(value: FieldValue): number | undefined {
  if (typeof value === 'string' || Array.isArray(value)) return value.length
  return undefined
}

function isObject(value: FieldValue): boolean {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isEmail(value: FieldValue): boolean {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isUrl(value: FieldValue): boolean {
  if (typeof value !== 'string') return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function messageOf(name: string, rule: RuleConfig, fallback: string): string {
  if (typeof rule.message === 'string') return rule.message
  return fallback.replace('${name}', name)
}

function resolveRule(rule: Rule, form?: FormInstance): RuleConfig {
  return typeof rule === 'function' ? rule(form as FormInstance) : rule
}

async function validateRule(
  name: string,
  rawValue: FieldValue,
  values: FormValues,
  rule: RuleConfig,
): Promise<string | undefined> {
  const value = rule.transform ? rule.transform(rawValue) : rawValue

  if (rule.required && isEmpty(value)) return messageOf(name, rule, `${name} is required`)
  if (isEmpty(value)) return undefined

  if (rule.whitespace && typeof value === 'string' && value.trim() === '')
    return messageOf(name, rule, `${name} cannot be blank`)

  if (rule.type === 'array' && !Array.isArray(value))
    return messageOf(name, rule, `${name} is not an array`)
  if (rule.type === 'object' && !isObject(value))
    return messageOf(name, rule, `${name} is not an object`)
  if (rule.type === 'email' && !isEmail(value))
    return messageOf(name, rule, `${name} is not a valid email`)
  if (rule.type === 'url' && !isUrl(value))
    return messageOf(name, rule, `${name} is not a valid url`)
  if (rule.type === 'enum' && rule.enum && !rule.enum.includes(value))
    return messageOf(name, rule, `${name} is not in enum`)
  if (
    rule.type &&
    !['array', 'object', 'email', 'url', 'enum'].includes(rule.type) &&
    typeof value !== rule.type
  ) {
    return messageOf(name, rule, `${name} is not a valid ${rule.type}`)
  }

  if (typeof value === 'number') {
    if (rule.len !== undefined && value !== rule.len)
      return messageOf(name, rule, `${name} must equal ${rule.len}`)
    if (rule.min !== undefined && value < rule.min)
      return messageOf(name, rule, `${name} must be at least ${rule.min}`)
    if (rule.max !== undefined && value > rule.max)
      return messageOf(name, rule, `${name} must be at most ${rule.max}`)
  }

  const length = getLength(value)
  if (length !== undefined) {
    if (rule.len !== undefined && length !== rule.len)
      return messageOf(name, rule, `${name} must be ${rule.len} characters`)
    if (rule.min !== undefined && length < rule.min)
      return messageOf(name, rule, `${name} must be at least ${rule.min} characters`)
    if (rule.max !== undefined && length > rule.max)
      return messageOf(name, rule, `${name} must be at most ${rule.max} characters`)
  }

  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value))
    return messageOf(name, rule, `${name} format is invalid`)

  if (rule.validator) {
    try {
      const result = await rule.validator(rule, value)
      if (typeof result === 'string') return result
    } catch (error) {
      return error instanceof Error ? error.message : String(error)
    }
  }

  return undefined
}

export async function validateValue(
  name: string,
  value: FieldValue,
  values: FormValues,
  rules: Rule[] = [],
  options: ValidateValueOptions = {},
): Promise<ValidateValueResult> {
  const resolvedRules = rules.map((rule) => resolveRule(rule, options.form))
  const errors: string[] = []
  const warnings: string[] = []

  if (options.validateFirst === 'parallel') {
    const results = await Promise.all(
      resolvedRules.map((rule) => validateRule(name, value, values, rule)),
    )
    const firstIndex = results.findIndex(Boolean)
    if (firstIndex >= 0) {
      const rule = resolvedRules[firstIndex]
      ;(rule.warningOnly ? warnings : errors).push(results[firstIndex] as string)
    }
    return { errors, warnings }
  }

  for (const rule of resolvedRules) {
    const error = await validateRule(name, value, values, rule)
    if (!error) continue
    ;(rule.warningOnly ? warnings : errors).push(error)
    if (options.validateFirst && !rule.warningOnly) break
  }

  return { errors, warnings }
}
```

- [ ] **Step 5: Update store validation calls for async result**

In `packages/components/src/form/store.ts`, replace the body of `validateFieldNames` with async-aware logic:

```ts
async function validateFieldNames(
  names: FieldName[],
  config: ValidateConfig = {},
): Promise<{
  values: FormValues
  errorFields: FieldError[]
  outOfDate: boolean
}> {
  const records = getRegisteredRecords(names)
  for (const record of records) {
    if (config.dirty && !record.state.dirty && !record.state.validated) continue
    record.state.validating = true
    const result = await validateValue(
      record.state.name.join('.'),
      getValue(currentValues, record.state.name),
      currentValues,
      record.meta.rules,
      { form },
    )
    record.state.validating = false
    record.state.validated = true
    if (!config.validateOnly) {
      record.setErrors(result.errors)
      record.state.warnings = result.warnings
    }
  }
  return {
    values: cloneFormValues(currentValues),
    errorFields: toErrorFields(records),
    outOfDate: false,
  }
}
```

- [ ] **Step 6: Run validation and existing form tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/validation.test.ts packages/components/src/form/__tests__/form.test.tsx packages/components/src/form/__tests__/form-instance.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Run typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add packages/components/src/form/interface.ts packages/components/src/form/validation.ts packages/components/src/form/store.ts packages/components/src/form/__tests__/validation.test.ts
git commit -m "feat(form): add async validation rules"
```

---

## Task 5: Add Form.Item Advanced Binding and Status APIs

**Files:**

- Modify: `packages/components/src/form/interface.ts`
- Modify: `packages/components/src/form/context.tsx`
- Modify: `packages/components/src/form/form-item.tsx`
- Modify: `packages/components/src/form/index.ts`
- Create: `packages/components/src/form/__tests__/form-item-advanced.test.tsx`

- [ ] **Step 1: Add failing Form.Item advanced tests**

Create `packages/components/src/form/__tests__/form-item-advanced.test.tsx`:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { Input } from '../../input'
import { Form, useForm } from '../index'

function StatusProbe() {
  const status = Form.Item.useStatus()
  return (
    <span data-testid="status">
      {status.status() ?? 'none'}:{status.errors().join('|')}:{status.warnings().join('|')}
    </span>
  )
}

describe('Form.Item advanced APIs', () => {
  it('uses getValueFromEvent and normalize before storing value', () => {
    const [form] = useForm()
    const getValueFromEvent = vi.fn((event: Event) => (event.target as HTMLInputElement).value)
    render(() => (
      <Form form={form}>
        <Form.Item
          name="username"
          getValueFromEvent={getValueFromEvent}
          normalize={(value) => String(value).trim().toUpperCase()}
        >
          <Input placeholder="username" />
        </Form.Item>
      </Form>
    ))

    fireEvent.input(document.querySelector('input') as HTMLInputElement, {
      target: { value: ' ada ' },
    })

    expect(getValueFromEvent).toHaveBeenCalled()
    expect(form.getFieldValue('username')).toBe('ADA')
  })

  it('uses getValueProps for render-prop controls', () => {
    render(() => (
      <Form initialValues={{ username: 'Ada' }}>
        <Form.Item name="username" getValueProps={(value) => ({ display: `User:${value}` })}>
          {(control) => <span data-testid="value-props">{control.valueProps().display}</span>}
        </Form.Item>
      </Form>
    ))

    expect(document.querySelector('[data-testid="value-props"]')).toHaveTextContent('User:Ada')
  })

  it('validates on configured trigger', async () => {
    const [form] = useForm()
    render(() => (
      <Form form={form}>
        <Form.Item
          name="username"
          validateTrigger="onBlur"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Input placeholder="username" />
        </Form.Item>
      </Form>
    ))

    fireEvent.input(document.querySelector('input') as HTMLInputElement, { target: { value: '' } })
    expect(form.getFieldError('username')).toEqual([])

    fireEvent.blur(document.querySelector('input') as HTMLInputElement)
    await Promise.resolve()

    expect(form.getFieldError('username')).toEqual(['Required'])
  })

  it('exposes Form.Item.useStatus', async () => {
    const [form] = useForm()
    render(() => (
      <Form form={form}>
        <Form.Item name="username" rules={[{ required: true, message: 'Required' }]}>
          <StatusProbe />
        </Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))

    form.submit()
    await Promise.resolve()

    expect(document.querySelector('[data-testid="status"]')).toHaveTextContent('error:Required:')
  })
})
```

- [ ] **Step 2: Run targeted test and verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/form-item-advanced.test.tsx
```

Expected: FAIL because advanced props and `Form.Item.useStatus` are not implemented.

- [ ] **Step 3: Extend `FormItemControl` and `FormItemProps`**

In `packages/components/src/form/interface.ts`, add this property to `FormItemControl`:

```ts
valueProps: Accessor<Record<string, unknown>>
```

Add these optional props to `FormItemProps`:

```ts
dependencies?: NamePath[]
getValueFromEvent?: (...args: unknown[]) => FieldValue
getValueProps?: (value: FieldValue) => Record<string, unknown>
normalize?: (value: FieldValue, prevValue: FieldValue, prevValues: FormValues) => FieldValue
validateTrigger?: string | string[]
validateFirst?: boolean | 'parallel'
validateDebounce?: number
preserve?: boolean
noStyle?: boolean
hidden?: boolean
extra?: JSX.Element
```

- [ ] **Step 4: Add item status context**

In `packages/components/src/form/context.tsx`, add:

```tsx
import type { Accessor, JSX } from 'solid-js'
import type { FormInstance, FormItemControl, ValidateStatus } from './interface'
```

If the file already imports `JSX` or `Accessor`, merge imports so there is only one import from `solid-js`.

Then add below `FormItemContext`:

```tsx
export interface FormItemStatusContextValue {
  status: Accessor<ValidateStatus | undefined>
  errors: Accessor<JSX.Element[]>
  warnings: Accessor<JSX.Element[]>
}

export const FormItemStatusContext = createContext<FormItemStatusContextValue>()
export function useFormItemStatus(): FormItemStatusContextValue {
  const status = useContext(FormItemStatusContext)
  if (!status) {
    return {
      status: () => undefined,
      errors: () => [],
      warnings: () => [],
    }
  }
  return status
}
```

- [ ] **Step 5: Update Form.Item implementation**

In `packages/components/src/form/form-item.tsx`, import `FormItemStatusContext`:

```ts
import { FormItemContext, FormItemStatusContext, useFormContext } from './context'
```

Add helpers near `getValueFromControl`:

```ts
function toArray(value: string | string[] | undefined): string[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function isTriggerMatched(
  triggerName: string,
  validateTrigger: string | string[] | undefined,
): boolean {
  const triggers = toArray(validateTrigger ?? triggerName)
  return triggers.includes(triggerName)
}
```

Inside `FormItem`, add:

```ts
const valueProps = () => {
  const itemControl = control()
  if (!itemControl) return {}
  const value = itemControl.value()
  return props.getValueProps ? props.getValueProps(value) : { [valuePropName()]: value }
}
const statusContext = {
  status: mergedStatus,
  errors: () => errors() as JSX.Element[],
  warnings: () => [],
}
```

Update the control creation so it includes normalized value handling and `valueProps`:

```ts
      valueProps,
      onChange: (nextOrEvent) => {
        const previousValue = form.getFieldValue(name)
        const previousValues = form.getFieldsValue(true)
        const rawValue = props.getValueFromEvent
          ? props.getValueFromEvent(nextOrEvent)
          : getValueFromControl(valuePropName(), nextOrEvent)
        const nextValue = props.normalize ? props.normalize(rawValue, previousValue, previousValues) : rawValue
        form.setFieldValue(name, nextValue)
        if (isTriggerMatched(trigger(), props.validateTrigger)) void form.validateFields([name])
      },
      setFieldValueFromControl: (nextOrEvent) => {
        const rawValue = props.getValueFromEvent
          ? props.getValueFromEvent(nextOrEvent)
          : getValueFromControl(valuePropName(), nextOrEvent)
        form.setFieldValue(name, rawValue)
      },
```

Wrap the content provider with status context:

```tsx
<FormItemStatusContext.Provider value={statusContext}>
  <FormItemContext.Provider value={control()}>{content()}</FormItemContext.Provider>
</FormItemStatusContext.Provider>
```

For `noStyle`, return only the providers and content:

```tsx
if (props.noStyle) {
  return (
    <FormItemStatusContext.Provider value={statusContext}>
      <FormItemContext.Provider value={control()}>{content()}</FormItemContext.Provider>
    </FormItemStatusContext.Provider>
  )
}
```

For `hidden`, add a hidden class and `style={{ display: 'none' }}` to the root div when `props.hidden` is true.

- [ ] **Step 6: Attach `Form.Item.useStatus`**

In `packages/components/src/form/index.ts`, replace the Form export with:

```ts
import { useFormItemStatus } from './context'

export const FormItemWithStatus = Object.assign(FormItem, { useStatus: useFormItemStatus })
export const Form = Object.assign(FormRoot, { Item: FormItemWithStatus })
export { FormItemWithStatus as FormItem }
```

Keep existing exports below, and also export `useFormItemStatus` from context if useful:

```ts
export { useFormItemControl, useFormItemStatus } from './context'
```

- [ ] **Step 7: Run targeted tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/form-item-advanced.test.tsx packages/components/src/form/__tests__/form.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Run typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add packages/components/src/form/interface.ts packages/components/src/form/context.tsx packages/components/src/form/form-item.tsx packages/components/src/form/index.ts packages/components/src/form/__tests__/form-item-advanced.test.tsx
git commit -m "feat(form): add advanced item binding APIs"
```

---

## Task 6: Add Form.useFormInstance and Form.useWatch

**Files:**

- Modify: `packages/components/src/form/context.tsx`
- Create: `packages/components/src/form/use-watch.ts`
- Modify: `packages/components/src/form/store.ts`
- Modify: `packages/components/src/form/index.ts`
- Create: `packages/components/src/form/__tests__/form-hooks.test.tsx`

- [ ] **Step 1: Add failing hook tests**

Create `packages/components/src/form/__tests__/form-hooks.test.tsx`:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Input } from '../../input'
import { Form } from '../index'

function InstanceProbe() {
  const form = Form.useFormInstance()
  return <button onClick={() => form.setFieldValue('username', 'Ada')}>Fill</button>
}

function WatchProbe() {
  const username = Form.useWatch('username')
  return <span data-testid="watch">{String(username() ?? '')}</span>
}

function SelectorProbe() {
  const label = Form.useWatch((values) => `${values.first ?? ''}-${values.last ?? ''}`)
  return <span data-testid="selector">{String(label())}</span>
}

describe('Form hooks', () => {
  it('Form.useFormInstance returns the parent form', () => {
    render(() => (
      <Form>
        <Form.Item name="username">
          <Input placeholder="username" />
        </Form.Item>
        <InstanceProbe />
      </Form>
    ))

    fireEvent.click(document.querySelector('button') as HTMLButtonElement)

    expect(document.querySelector('input')).toHaveValue('Ada')
  })

  it('Form.useWatch reacts to field changes', () => {
    render(() => (
      <Form>
        <Form.Item name="username">
          <Input placeholder="username" />
        </Form.Item>
        <WatchProbe />
      </Form>
    ))

    fireEvent.input(document.querySelector('input') as HTMLInputElement, {
      target: { value: 'Ada' },
    })

    expect(document.querySelector('[data-testid="watch"]')).toHaveTextContent('Ada')
  })

  it('Form.useWatch supports selector functions', () => {
    render(() => (
      <Form>
        <Form.Item name="first">
          <Input placeholder="first" />
        </Form.Item>
        <Form.Item name="last">
          <Input placeholder="last" />
        </Form.Item>
        <SelectorProbe />
      </Form>
    ))

    const inputs = document.querySelectorAll('input')
    fireEvent.input(inputs[0], { target: { value: 'Ada' } })
    fireEvent.input(inputs[1], { target: { value: 'Lovelace' } })

    expect(document.querySelector('[data-testid="selector"]')).toHaveTextContent('Ada-Lovelace')
  })
})
```

- [ ] **Step 2: Run hook tests and verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/form-hooks.test.tsx
```

Expected: FAIL because the static hooks are not implemented.

- [ ] **Step 3: Add `useFormInstance` context helper**

In `packages/components/src/form/context.tsx`, add:

```ts
export function useFormInstance(): FormInstance {
  const form = useFormContext()
  if (!form) throw new Error('Form.useFormInstance must be used under a Form component')
  return form
}
```

- [ ] **Step 4: Add watcher API to FormInstance type**

In `packages/components/src/form/interface.ts`, add to `FormInstance`:

```ts
subscribe: (listener: () => void) => () => void
```

- [ ] **Step 5: Implement `subscribe` in store**

In `packages/components/src/form/store.ts`, add near `fields`:

```ts
const subscribers = new Set<() => void>()

function notifySubscribers() {
  for (const subscriber of subscribers) subscriber()
}
```

Call `notifySubscribers()` after value-changing operations in `setFieldValue`, `setFieldsValue`, `setFields`, and `resetFields`.

Add this method to the public `form` object:

```ts
      subscribe(listener) {
        subscribers.add(listener)
        return () => subscribers.delete(listener)
      },
```

- [ ] **Step 6: Implement `use-watch.ts`**

Create `packages/components/src/form/use-watch.ts`:

```ts
import { createSignal, onCleanup } from 'solid-js'
import { useFormInstance } from './context'
import { getValue } from './value-util'
import type { Accessor } from 'solid-js'
import type { FormInstance, FormValues, NamePath } from './interface'

export interface WatchOptions {
  form?: FormInstance
  preserve?: boolean
}

function isFormInstance(value: unknown): value is FormInstance {
  return Boolean(value) && typeof value === 'object' && 'getFieldsValue' in value
}

export function useWatch(
  namePathOrSelector: NamePath | ((values: FormValues) => unknown),
  formOrOptions?: FormInstance | WatchOptions,
): Accessor<unknown> {
  const contextForm = useFormInstance()
  const form = isFormInstance(formOrOptions) ? formOrOptions : (formOrOptions?.form ?? contextForm)
  const read = () => {
    const values = form.getFieldsValue(true)
    return typeof namePathOrSelector === 'function'
      ? namePathOrSelector(values)
      : getValue(values, namePathOrSelector)
  }
  const [value, setValue] = createSignal(read(), { equals: false })
  const unsubscribe = form.subscribe(() => setValue(() => read()))
  onCleanup(unsubscribe)
  return value
}
```

- [ ] **Step 7: Attach static hooks**

In `packages/components/src/form/index.ts`, import:

```ts
import { useFormInstance } from './context'
import { useWatch } from './use-watch'
```

Change the Form object assignment to include hooks:

```ts
export const Form = Object.assign(FormRoot, {
  Item: FormItemWithStatus,
  useForm,
  useFormInstance,
  useWatch,
})
```

Export hooks:

```ts
export { useFormItemControl, useFormItemStatus, useFormInstance } from './context'
export { useWatch }
```

- [ ] **Step 8: Run hook tests and regression tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/form-hooks.test.tsx packages/components/src/form/__tests__/form.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Run typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add packages/components/src/form/context.tsx packages/components/src/form/interface.ts packages/components/src/form/store.ts packages/components/src/form/use-watch.ts packages/components/src/form/index.ts packages/components/src/form/__tests__/form-hooks.test.tsx
git commit -m "feat(form): add form hooks"
```

---

## Task 7: Add Form.List and Form.ErrorList

**Files:**

- Modify: `packages/components/src/form/interface.ts`
- Modify: `packages/components/src/form/context.tsx`
- Create: `packages/components/src/form/form-list.tsx`
- Create: `packages/components/src/form/form-error-list.tsx`
- Modify: `packages/components/src/form/form-item.tsx`
- Modify: `packages/components/src/form/index.ts`
- Create: `packages/components/src/form/__tests__/form-list.test.tsx`

- [ ] **Step 1: Add failing Form.List tests**

Create `packages/components/src/form/__tests__/form-list.test.tsx`:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { For } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../../button'
import { Input } from '../../input'
import { Form } from '../index'

describe('Form.List', () => {
  it('submits nested array values', () => {
    const onFinish = vi.fn()
    const result = render(() => (
      <Form onFinish={onFinish} initialValues={{ users: [{ name: 'Ada' }] }}>
        <Form.List name="users">
          {(fields) => (
            <For each={fields()}>
              {(field) => (
                <Form.Item name={[field.name, 'name']}>
                  <Input aria-label={`user-${field.name}`} />
                </Form.Item>
              )}
            </For>
          )}
        </Form.List>
        <Button htmlType="submit">Submit</Button>
      </Form>
    ))

    fireEvent.input(result.getByLabelText('user-0'), { target: { value: 'Grace' } })
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ users: [{ name: 'Grace' }] })
  })

  it('adds, removes, and moves fields', () => {
    const result = render(() => (
      <Form initialValues={{ users: [{ name: 'Ada' }] }}>
        <Form.List name="users">
          {(fields, operation) => (
            <>
              <For each={fields()}>
                {(field) => (
                  <span data-testid="field">
                    {field.name}:{field.key}
                  </span>
                )}
              </For>
              <button onClick={() => operation.add({ name: 'Grace' })}>Add</button>
              <button onClick={() => operation.remove(0)}>Remove</button>
              <button onClick={() => operation.move(1, 0)}>Move</button>
            </>
          )}
        </Form.List>
      </Form>
    ))

    fireEvent.click(result.getByText('Add'))
    expect(result.getAllByTestId('field')).toHaveLength(2)

    fireEvent.click(result.getByText('Move'))
    expect(result.getAllByTestId('field')[0]).toHaveTextContent('0:')

    fireEvent.click(result.getByText('Remove'))
    expect(result.getAllByTestId('field')).toHaveLength(1)
  })

  it('renders Form.ErrorList messages', () => {
    const result = render(() => <Form.ErrorList errors={['Broken']} warnings={['Careful']} />)

    expect(result.getByText('Broken')).toBeInTheDocument()
    expect(result.getByText('Careful')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run list tests and verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/form-list.test.tsx
```

Expected: FAIL because `Form.List` and `Form.ErrorList` are not implemented.

- [ ] **Step 3: Add Form.List types**

In `packages/components/src/form/interface.ts`, add:

```ts
export interface FormListField {
  key: number
  name: number
  fieldKey: number
}

export interface FormListOperation {
  add: (defaultValue?: FieldValue, insertIndex?: number) => void
  remove: (index: number | number[]) => void
  move: (from: number, to: number) => void
}

export interface FormListMeta {
  errors: JSX.Element[]
  warnings: JSX.Element[]
}

export interface FormListProps {
  name: NamePath
  initialValue?: FieldValue[]
  children: (
    fields: Accessor<FormListField[]>,
    operation: FormListOperation,
    meta: FormListMeta,
  ) => JSX.Element
}

export interface FormErrorListProps {
  errors?: JSX.Element[]
  warnings?: JSX.Element[]
}
```

- [ ] **Step 4: Add list context**

In `packages/components/src/form/context.tsx`, import `NamePath` and add:

```ts
export const FormListContext = createContext<NamePath>()
export function useFormListPrefix(): NamePath | undefined {
  return useContext(FormListContext)
}
```

- [ ] **Step 5: Implement Form.ErrorList**

Create `packages/components/src/form/form-error-list.tsx`:

```tsx
import { For, Show } from 'solid-js'
import { useConfig } from '../config-provider'
import type { FormErrorListProps } from './interface'

export function FormErrorList(props: FormErrorListProps) {
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-form`
  const errors = () => props.errors ?? []
  const warnings = () => props.warnings ?? []

  return (
    <Show when={errors().length > 0 || warnings().length > 0}>
      <div class={`${prefixCls()}-item-explain`}>
        <For each={errors()}>
          {(error) => <div class={`${prefixCls()}-item-explain-error`}>{error}</div>}
        </For>
        <For each={warnings()}>
          {(warning) => <div class={`${prefixCls()}-item-explain-warning`}>{warning}</div>}
        </For>
      </div>
    </Show>
  )
}
```

- [ ] **Step 6: Implement Form.List**

Create `packages/components/src/form/form-list.tsx`:

```tsx
import { createMemo, createSignal } from 'solid-js'
import { FormListContext, useFormContext, useFormListPrefix } from './context'
import { composeNamePath } from './name-path'
import type { FieldValue, FormListField, FormListOperation, FormListProps } from './interface'

let nextListKey = 0

function normalizeArray(value: FieldValue): FieldValue[] {
  return Array.isArray(value) ? value : []
}

export function FormList(props: FormListProps) {
  const form = useFormContext()
  const parentPrefix = useFormListPrefix()
  const listName = createMemo(() => composeNamePath(parentPrefix, props.name))
  const initial = () => normalizeArray(form?.getFieldValue(listName()) ?? props.initialValue ?? [])
  const [keys, setKeys] = createSignal<number[]>(initial().map(() => nextListKey++))

  if (form && props.initialValue && form.getFieldValue(listName()) === undefined) {
    form.setFieldValue(listName(), props.initialValue)
  }

  const fields = createMemo<FormListField[]>(() =>
    keys().map((key, index) => ({ key, name: index, fieldKey: key })),
  )

  const operation: FormListOperation = {
    add(defaultValue, insertIndex) {
      if (!form) return
      const values = [...normalizeArray(form.getFieldValue(listName()))]
      const index = insertIndex ?? values.length
      values.splice(index, 0, defaultValue)
      form.setFieldValue(listName(), values)
      setKeys((current) => {
        const next = [...current]
        next.splice(index, 0, nextListKey++)
        return next
      })
    },
    remove(index) {
      if (!form) return
      const indexes = Array.isArray(index) ? [...index].sort((a, b) => b - a) : [index]
      const values = [...normalizeArray(form.getFieldValue(listName()))]
      for (const item of indexes) values.splice(item, 1)
      form.setFieldValue(listName(), values)
      setKeys((current) => {
        const next = [...current]
        for (const item of indexes) next.splice(item, 1)
        return next
      })
    },
    move(from, to) {
      if (!form || from === to) return
      const values = [...normalizeArray(form.getFieldValue(listName()))]
      const [value] = values.splice(from, 1)
      values.splice(to, 0, value)
      form.setFieldValue(listName(), values)
      setKeys((current) => {
        const next = [...current]
        const [key] = next.splice(from, 1)
        next.splice(to, 0, key)
        return next
      })
    },
  }

  return (
    <FormListContext.Provider value={listName()}>
      {props.children(fields, operation, { errors: [], warnings: [] })}
    </FormListContext.Provider>
  )
}
```

- [ ] **Step 7: Compose list prefix in Form.Item**

In `packages/components/src/form/form-item.tsx`, import:

```ts
import { composeNamePath } from './name-path'
```

and `useFormListPrefix` from context.

Inside `FormItem`, add:

```ts
const listPrefix = useFormListPrefix()
const fieldName = () =>
  props.name === undefined ? undefined : composeNamePath(listPrefix, props.name)
```

Replace uses of `props.name` as a field name with `fieldName()` in registration, error reads, and control creation. For display-only checks, use `fieldName()`.

- [ ] **Step 8: Attach static List and ErrorList**

In `packages/components/src/form/index.ts`, import:

```ts
import { FormList } from './form-list'
import { FormErrorList } from './form-error-list'
```

Add to `Form` assignment:

```ts
  List: FormList,
  ErrorList: FormErrorList,
```

Export named components and types:

```ts
export { FormList, FormErrorList }
```

Add `FormListField`, `FormListOperation`, `FormListProps`, `FormErrorListProps`, and `FormListMeta` to the type export block.

- [ ] **Step 9: Run list and regression tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/form-list.test.tsx packages/components/src/form/__tests__/form.test.tsx packages/components/src/form/__tests__/form-instance.test.tsx
```

Expected: PASS.

- [ ] **Step 10: Run typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
```

Expected: PASS.

- [ ] **Step 11: Commit**

```bash
git add packages/components/src/form/interface.ts packages/components/src/form/context.tsx packages/components/src/form/form-list.tsx packages/components/src/form/form-error-list.tsx packages/components/src/form/form-item.tsx packages/components/src/form/index.ts packages/components/src/form/__tests__/form-list.test.tsx
git commit -m "feat(form): add dynamic list fields"
```

---

## Task 8: Add Layout Props and Form Styles

**Files:**

- Modify: `packages/components/src/form/interface.ts`
- Modify: `packages/components/src/form/context.tsx`
- Modify: `packages/components/src/form/form.tsx`
- Modify: `packages/components/src/form/form-item.tsx`
- Modify: `packages/components/src/form/form.style.ts`
- Create: `packages/components/src/form/__tests__/form-layout.test.tsx`

- [ ] **Step 1: Add failing layout tests**

Create `packages/components/src/form/__tests__/form-layout.test.tsx`:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Input } from '../../input'
import { Form } from '../index'

describe('Form layout props', () => {
  it('applies form layout classes', () => {
    const result = render(() => <Form layout="vertical" aria-label="profile" />)
    expect(result.getByLabelText('profile')).toHaveClass('ant-form-vertical')
  })

  it('renders required mark according to required rules', () => {
    const result = render(() => (
      <Form requiredMark>
        <Form.Item label="Username" name="username" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    ))

    expect(result.getByText('*')).toBeInTheDocument()
  })

  it('hides required mark when disabled at Form level', () => {
    const result = render(() => (
      <Form requiredMark={false}>
        <Form.Item label="Username" name="username" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    ))

    expect(result.queryByText('*')).not.toBeInTheDocument()
  })

  it('shows optional label for non-required fields', () => {
    const result = render(() => (
      <Form requiredMark="optional">
        <Form.Item label="Nickname" name="nickname">
          <Input />
        </Form.Item>
      </Form>
    ))

    expect(result.getByText('(optional)')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run layout tests and verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/form-layout.test.tsx
```

Expected: FAIL because layout props and required mark context are not implemented.

- [ ] **Step 3: Add layout types**

In `packages/components/src/form/interface.ts`, add:

```ts
export type FormLayout = 'horizontal' | 'vertical' | 'inline'
export type RequiredMark = boolean | 'optional'

export interface FormLayoutContextValue {
  layout: FormLayout
  requiredMark: RequiredMark
  colon: boolean
  labelAlign: 'left' | 'right'
}
```

Add to `FormProps`:

```ts
layout?: FormLayout
labelAlign?: 'left' | 'right'
colon?: boolean
requiredMark?: RequiredMark
```

- [ ] **Step 4: Add layout context**

In `packages/components/src/form/context.tsx`, add:

```ts
import type { FormLayoutContextValue } from './interface'
```

Then add:

```ts
export const FormLayoutContext = createContext<FormLayoutContextValue>({
  layout: 'horizontal',
  requiredMark: true,
  colon: true,
  labelAlign: 'right',
})
export function useFormLayoutContext(): FormLayoutContextValue {
  return useContext(FormLayoutContext)
}
```

- [ ] **Step 5: Update Form root layout classes and provider**

In `packages/components/src/form/form.tsx`, split these props:

```ts
'layout',
'labelAlign',
'colon',
'requiredMark',
```

Create layout context before return:

```ts
const layoutContext = () => ({
  layout: local.layout ?? 'horizontal',
  requiredMark: local.requiredMark ?? true,
  colon: local.colon ?? true,
  labelAlign: local.labelAlign ?? 'right',
})
```

Wrap the native form in `FormLayoutContext.Provider` and add layout class:

```tsx
<FormLayoutContext.Provider value={layoutContext()}>
  <form
    {...rest}
    class={classNames(prefixCls(), `${prefixCls()}-${layoutContext().layout}`, hashId(), local.class)}
```

- [ ] **Step 6: Update Form.Item required mark rendering**

In `packages/components/src/form/form-item.tsx`, import and use layout context:

```ts
import { useFormLayoutContext } from './context'
```

Inside `FormItem`:

```ts
const layout = useFormLayoutContext()
const isRequired = () =>
  props.required || rules().some((rule) => typeof rule !== 'function' && rule.required)
const showRequiredMark = () => layout.requiredMark === true && isRequired()
const showOptionalMark = () => layout.requiredMark === 'optional' && !isRequired()
```

Replace required mark rendering with:

```tsx
<Show when={showRequiredMark()}>
  <span class={`${prefixCls()}-item-required`}>*</span>
</Show>
<Show when={showOptionalMark()}>
  <span class={`${prefixCls()}-item-optional`}>(optional)</span>
</Show>
```

Add label alignment class to root:

```ts
;`${prefixCls()}-item-label-${layout.labelAlign}`
```

- [ ] **Step 7: Extend styles**

In `packages/components/src/form/form.style.ts`, add style entries inside the returned object:

```ts
[`.${prefixCls}-vertical .${prefixCls}-item`]: {
  display: 'block',
},
[`.${prefixCls}-horizontal .${prefixCls}-item`]: {
  display: 'flex',
  gap: 12,
},
[`.${prefixCls}-inline`]: {
  display: 'flex',
  'flex-wrap': 'wrap',
  gap: 12,
},
[`.${prefixCls}-item-explain-warning`]: {
  color: token().colorWarning,
  'font-size': 12,
  'margin-top': 4,
},
[`.${prefixCls}-item-hidden`]: {
  display: 'none',
},
[`.${prefixCls}-item-optional`]: {
  color: token().colorTextSecondary,
  'font-size': 12,
  'margin-inline-start': 4,
},
```

- [ ] **Step 8: Run layout and regression tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/form/__tests__/form-layout.test.tsx packages/components/src/form/__tests__/form.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Run typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
```

Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add packages/components/src/form/interface.ts packages/components/src/form/context.tsx packages/components/src/form/form.tsx packages/components/src/form/form-item.tsx packages/components/src/form/form.style.ts packages/components/src/form/__tests__/form-layout.test.tsx
git commit -m "feat(form): add common layout props"
```

---

## Task 9: Update Docs Form Page

**Files:**

- Modify: `apps/docs/src/pages/components/form.tsx`

- [ ] **Step 1: Add API rows for new Form APIs**

In `apps/docs/src/pages/components/form.tsx`, extend `formRows` with these entries after `initialValues`:

```ts
  {
    property: 'layout',
    description: 'Form layout mode.',
    type: "'horizontal' | 'vertical' | 'inline'",
    defaultValue: "'horizontal'",
  },
  {
    property: 'requiredMark',
    description: 'Required mark display style for Form.Item labels.',
    type: "boolean | 'optional'",
    defaultValue: 'true',
  },
  {
    property: 'onFieldsChange',
    description: 'Called when registered field values or field state change.',
    type: '(changedFields: FieldData[], allFields: FieldData[]) => void',
  },
```

- [ ] **Step 2: Add API rows for new Form.Item APIs**

Extend `formItemRows` with these entries after `trigger`:

```ts
  {
    property: 'validateTrigger',
    description: 'Event name or names that trigger validation.',
    type: 'string | string[]',
    defaultValue: "'onChange'",
  },
  {
    property: 'getValueFromEvent',
    description: 'Customize how a field value is extracted from control events.',
    type: '(...args: unknown[]) => unknown',
  },
  {
    property: 'getValueProps',
    description: 'Customize props derived from the current field value.',
    type: '(value: unknown) => Record<string, unknown>',
  },
  {
    property: 'normalize',
    description: 'Normalize a value before storing it in the form.',
    type: '(value, prevValue, prevValues) => unknown',
  },
  {
    property: 'noStyle',
    description: 'Register a field without rendering the styled Form.Item wrapper.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'hidden',
    description: 'Hide the field while still collecting and validating its value.',
    type: 'boolean',
    defaultValue: 'false',
  },
```

- [ ] **Step 3: Add API rows for new FormInstance APIs**

Extend `formInstanceRows` with:

```ts
  {
    property: 'getFieldsError',
    description: 'Returns error and warning state for registered fields.',
    type: '(names?: NamePath[]) => FieldError[]',
  },
  {
    property: 'setFields',
    description: 'Sets field values or field state such as errors and touched.',
    type: '(fields: FieldData[]) => void',
  },
  {
    property: 'isFieldTouched',
    description: 'Checks whether a field has been touched.',
    type: '(name: NamePath) => boolean',
  },
  {
    property: 'isFieldsTouched',
    description: 'Checks whether any or all fields have been touched.',
    type: '(names?: NamePath[], allTouched?: boolean) => boolean',
  },
```

- [ ] **Step 4: Add demos for nested fields, useWatch, and Form.List**

Before the API section, add three `DemoBlock`s:

```tsx
      <DemoBlock
        title="Nested fields"
        code={`<Form initialValues={{ user: { email: 'hello@example.com' } }} onFinish={console.log}>
  <Form.Item label="Email" name={['user', 'email']} rules={[{ type: 'email' }]}>
    <Input />
  </Form.Item>
</Form>`}
      >
        <Form initialValues={{ user: { email: 'hello@example.com' } }} onFinish={(values) => message.success(JSON.stringify(values))}>
          <Space direction="vertical" class="w-90">
            <Form.Item label="Email" name={['user', 'email']} rules={[{ type: 'email', message: 'Enter an email' }]}>
              <Input />
            </Form.Item>
            <Button htmlType="submit">Submit nested</Button>
          </Space>
        </Form>
      </DemoBlock>

      <DemoBlock
        title="Watch fields"
        code={`const watched = Form.useWatch('username')
<span>{watched()}</span>`}
      >
        <Form>
          <Space direction="vertical" class="w-90">
            <Form.Item label="Username" name="username">
              <Input />
            </Form.Item>
            <WatchedUsername />
          </Space>
        </Form>
      </DemoBlock>

      <DemoBlock
        title="Dynamic list"
        code={`<Form.List name="users">
  {(fields, operation) => fields().map((field) => (
    <Form.Item name={[field.name, 'name']}><Input /></Form.Item>
  ))}
</Form.List>`}
      >
        <Form initialValues={{ users: [{ name: 'Ada' }] }} onFinish={(values) => message.success(JSON.stringify(values))}>
          <Form.List name="users">
            {(fields, operation) => (
              <Space direction="vertical">
                <For each={fields()}>
                  {(field) => (
                    <Form.Item label={`User ${field.name + 1}`} name={[field.name, 'name']}>
                      <Input />
                    </Form.Item>
                  )}
                </For>
                <Space>
                  <Button onClick={() => operation.add({ name: '' })}>Add user</Button>
                  <Button htmlType="submit">Submit list</Button>
                </Space>
              </Space>
            )}
          </Form.List>
        </Form>
      </DemoBlock>
```

Also import `For` from `solid-js` at the top:

```ts
import { For, createSignal } from 'solid-js'
```

Add this local component above `export default function FormPage()`:

```tsx
function WatchedUsername() {
  const username = Form.useWatch('username')
  return <span>Watched: {String(username() ?? '')}</span>
}
```

- [ ] **Step 5: Run docs typecheck/build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/docs/src/pages/components/form.tsx
git commit -m "docs(form): document common antd APIs"
```

---

## Task 10: Final Verification and Cleanup

**Files:**

- Modify only files required by verification failures.

- [ ] **Step 1: Run oxfmt write on changed files**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format
```

Expected: command completes successfully and formats files.

- [ ] **Step 2: Run lint**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: PASS. If lint fails, fix the exact reported files and rerun this command.

- [ ] **Step 3: Run format check**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: PASS.

- [ ] **Step 4: Run recursive typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: PASS.

- [ ] **Step 5: Run recursive tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: PASS.

- [ ] **Step 6: Run recursive build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: PASS.

- [ ] **Step 7: Inspect git status**

Run:

```bash
git status --short
```

Expected: only intentional changes are shown, or no changes if all fixes were committed.

- [ ] **Step 8: Commit final cleanup if needed**

If verification fixes changed files, commit them:

```bash
git add .
git commit -m "chore(form): verify common api parity"
```

If there are no changes, skip this commit.
