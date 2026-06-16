# Data Entry Phase 5 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tested and documented `InputNumber` and `Cascader` components to `@solid-ant-design/core`.

**Architecture:** Implement each component as an independent Solid module following the existing component folder pattern. `InputNumber` builds on local input semantics and form integration; `Cascader` follows the existing `Select` controlled/uncontrolled open/value pattern with hierarchical columns.

**Tech Stack:** SolidJS, TypeScript, Vitest, `@solidjs/testing-library`, `@solid-ant-design/cssinjs`, `@solid-ant-design/theme`, existing `ConfigProvider`, `Form.Item`, and `classNames` utilities, pnpm/corepack.

---

## File Structure

Create component source files:

```text
packages/components/src/input-number/index.ts
packages/components/src/input-number/interface.ts
packages/components/src/input-number/input-number.tsx
packages/components/src/input-number/input-number.style.ts
packages/components/src/input-number/__tests__/input-number.test.tsx
packages/components/src/cascader/index.ts
packages/components/src/cascader/interface.ts
packages/components/src/cascader/cascader.tsx
packages/components/src/cascader/cascader.style.ts
packages/components/src/cascader/__tests__/cascader.test.tsx
```

Create docs pages:

```text
apps/docs/src/routes/components/input-number.tsx
apps/docs/src/routes/components/cascader.tsx
```

Modify shared registries:

```text
packages/components/src/index.ts
apps/docs/src/site/nav.ts
```

Do not manually edit `apps/docs/src/site/routes.ts` unless route auto-discovery no longer works.

---

## Task 1: Add InputNumber

**Files:**

- Create: `packages/components/src/input-number/interface.ts`
- Create: `packages/components/src/input-number/input-number.style.ts`
- Create: `packages/components/src/input-number/input-number.tsx`
- Create: `packages/components/src/input-number/index.ts`
- Create: `packages/components/src/input-number/__tests__/input-number.test.tsx`
- Create: `apps/docs/src/routes/components/input-number.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing InputNumber tests**

Create `packages/components/src/input-number/__tests__/input-number.test.tsx`:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Form } from '../../form'
import { InputNumber } from '../index'

describe('InputNumber', () => {
  it('renders default value with spinbutton semantics', () => {
    const result = render(() => <InputNumber defaultValue={3} min={1} max={10} />)
    const input = result.getByRole('spinbutton')

    expect(input).toHaveValue('3')
    expect(input).toHaveAttribute('aria-valuemin', '1')
    expect(input).toHaveAttribute('aria-valuemax', '10')
    expect(input).toHaveAttribute('aria-valuenow', '3')
  })

  it('normalizes uncontrolled input on blur', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber defaultValue={1} onChange={onChange} />)
    const input = result.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(input, { target: { value: '12' } })
    expect(input).toHaveValue('12')
    fireEvent.blur(input)

    expect(onChange).toHaveBeenLastCalledWith(12)
    expect(input).toHaveValue('12')
  })

  it('controlled mode calls onChange without mutating by itself', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber value={5} onChange={onChange} />)
    const input = result.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(input, { target: { value: '8' } })
    fireEvent.blur(input)

    expect(onChange).toHaveBeenCalledWith(8)
    expect(input).toHaveValue('5')
  })

  it('updates when controlled signal changes', () => {
    const [value, setValue] = createSignal(2)
    const result = render(() => <InputNumber value={value()} />)

    expect(result.getByRole('spinbutton')).toHaveValue('2')
    setValue(9)
    expect(result.getByRole('spinbutton')).toHaveValue('9')
  })

  it('clamps by min and max', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber min={0} max={10} onChange={onChange} />)
    const input = result.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(input, { target: { value: '99' } })
    fireEvent.blur(input)

    expect(onChange).toHaveBeenLastCalledWith(10)
    expect(input).toHaveValue('10')
  })

  it('increments and decrements by step controls', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber defaultValue={2} step={0.5} onChange={onChange} />)

    fireEvent.click(result.getByRole('button', { name: 'increase value' }))
    expect(onChange).toHaveBeenLastCalledWith(2.5)
    expect(result.getByRole('spinbutton')).toHaveValue('2.5')

    fireEvent.click(result.getByRole('button', { name: 'decrease value' }))
    expect(onChange).toHaveBeenLastCalledWith(2)
    expect(result.getByRole('spinbutton')).toHaveValue('2')
  })

  it('supports keyboard increment and decrement', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber defaultValue={1} onChange={onChange} />)
    const input = result.getByRole('spinbutton')

    fireEvent.keyDown(input, { key: 'ArrowUp' })
    expect(onChange).toHaveBeenLastCalledWith(2)
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(onChange).toHaveBeenLastCalledWith(1)
  })

  it('rounds with precision', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber precision={2} onChange={onChange} />)
    const input = result.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(input, { target: { value: '1.236' } })
    fireEvent.blur(input)

    expect(onChange).toHaveBeenLastCalledWith(1.24)
    expect(input).toHaveValue('1.24')
  })

  it('supports formatter and parser', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <InputNumber
        defaultValue={1000}
        formatter={(value) => (value === undefined ? '' : `$ ${value}`)}
        parser={(display) => {
          const parsed = Number(display.replace(/[$,\s]/g, ''))
          return Number.isNaN(parsed) ? undefined : parsed
        }}
        onChange={onChange}
      />
    ))
    const input = result.getByRole('spinbutton') as HTMLInputElement

    expect(input).toHaveValue('$ 1000')
    fireEvent.input(input, { target: { value: '$ 1234' } })
    fireEvent.blur(input)

    expect(onChange).toHaveBeenLastCalledWith(1234)
    expect(input).toHaveValue('$ 1234')
  })

  it('disabled state prevents interactions', () => {
    const onChange = vi.fn()
    const result = render(() => <InputNumber defaultValue={4} disabled onChange={onChange} />)
    const input = result.getByRole('spinbutton')

    expect(input).toBeDisabled()
    fireEvent.keyDown(input, { key: 'ArrowUp' })
    fireEvent.click(result.getByRole('button', { name: 'increase value' }))
    expect(onChange).not.toHaveBeenCalled()
    expect(input).toHaveValue('4')
  })

  it('supports size, status, hidden controls, and custom prefix classes', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <InputNumber size="large" status="error" controls={false} class="extra-input-number" />
      </ConfigProvider>
    ))
    const root = result.container.firstElementChild as HTMLElement

    expect(root.className).toContain('custom-input-number')
    expect(root.className).toContain('custom-input-number-lg')
    expect(root.className).toContain('custom-input-number-status-error')
    expect(root.className).toContain('extra-input-number')
    expect(result.queryByRole('button', { name: 'increase value' })).toBeNull()
  })

  it('integrates with Form.Item value collection', async () => {
    const onFinish = vi.fn()
    const result = render(() => (
      <Form onFinish={onFinish}>
        <Form.Item name="amount">
          <InputNumber />
        </Form.Item>
        <button type="submit">Submit</button>
      </Form>
    ))
    const input = result.getByRole('spinbutton') as HTMLInputElement

    fireEvent.input(input, { target: { value: '7' } })
    fireEvent.blur(input)
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ amount: 7 })
  })
})
```

- [ ] **Step 2: Run InputNumber tests and verify they fail**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- input-number
```

Expected: FAIL because `packages/components/src/input-number` and `InputNumber` do not exist yet.

- [ ] **Step 3: Add InputNumber public types**

Create `packages/components/src/input-number/interface.ts`:

```ts
import type { ComponentSize } from '@solid-ant-design/theme'
import type { JSX } from 'solid-js'

export interface InputNumberProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'value' | 'defaultValue' | 'onChange' | 'prefix'
> {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  precision?: number
  placeholder?: string
  disabled?: boolean
  size?: ComponentSize
  status?: 'error' | 'warning'
  controls?: boolean
  formatter?: (value: number | undefined) => string
  parser?: (displayValue: string) => number | undefined
  onChange?: (value: number | undefined) => void
}
```

- [ ] **Step 4: Add InputNumber styles**

Create `packages/components/src/input-number/input-number.style.ts`:

```ts
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

export function useInputNumberStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['InputNumber', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          display: 'inline-flex',
          'align-items': 'stretch',
          width: 120,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
          background: t.colorBgContainer,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          transition: `border-color ${t.motionDurationMid} ${t.motionEaseInOut}`,
          '&:hover': { 'border-color': t.colorPrimaryHover },
        },
        [`.${prefixCls}-focused`]: {
          'border-color': t.colorPrimary,
          'box-shadow': `0 0 0 2px ${t.colorPrimaryBg}`,
        },
        [`.${prefixCls}-disabled`]: {
          color: t.colorTextDisabled,
          background: t.colorBgContainerDisabled,
          cursor: 'not-allowed',
          '&:hover': { 'border-color': t.colorBorder },
        },
        [`.${prefixCls}-status-error`]: {
          'border-color': t.colorError,
        },
        [`.${prefixCls}-status-warning`]: {
          'border-color': t.colorWarning,
        },
        [`.${prefixCls}-input`]: {
          flex: '1 1 auto',
          width: '100%',
          minWidth: 0,
          padding: `${t.paddingXXS}px ${t.paddingXS}px`,
          color: 'inherit',
          'font-size': 'inherit',
          'font-family': 'inherit',
          'line-height': t.lineHeight,
          background: 'transparent',
          border: 0,
          outline: 0,
          appearance: 'textfield',
        },
        [`.${prefixCls}-input::-webkit-outer-spin-button, .${prefixCls}-input::-webkit-inner-spin-button`]:
          {
            margin: 0,
            appearance: 'none',
          },
        [`.${prefixCls}-controls`]: {
          display: 'inline-flex',
          'flex-direction': 'column',
          width: 22,
          borderLeft: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        },
        [`.${prefixCls}-handler`]: {
          flex: '1 1 0',
          display: 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          padding: 0,
          color: t.colorTextTertiary,
          'font-size': 10,
          'line-height': 1,
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
          '&:hover': { color: t.colorPrimary },
          '&:disabled': {
            color: t.colorTextDisabled,
            cursor: 'not-allowed',
          },
        },
        [`.${prefixCls}-handler-up`]: {
          borderBottom: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        },
        [`.${prefixCls}-sm`]: {
          width: 100,
          'font-size': `${t.fontSizeSM}px`,
        },
        [`.${prefixCls}-sm .${prefixCls}-input`]: {
          padding: `1px ${t.paddingXS}px`,
        },
        [`.${prefixCls}-lg`]: {
          width: 140,
          'font-size': `${t.fontSizeLG}px`,
        },
        [`.${prefixCls}-lg .${prefixCls}-input`]: {
          padding: `${t.paddingXS}px ${t.paddingSM}px`,
        },
      }
    },
  )
}
```

- [ ] **Step 5: Add InputNumber implementation**

Create `packages/components/src/input-number/input-number.tsx`:

```tsx
import { Show, createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/class-names'
import type { InputNumberProps } from './interface'
import { useInputNumberStyle } from './input-number.style'

function isFiniteNumber(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function clamp(value: number, min: number | undefined, max: number | undefined): number {
  let next = value
  if (min !== undefined) next = Math.max(min, next)
  if (max !== undefined) next = Math.min(max, next)
  return next
}

function roundByPrecision(value: number, precision: number | undefined): number {
  if (precision === undefined || precision < 0) return value
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

function defaultParser(displayValue: string): number | undefined {
  if (displayValue.trim() === '') return undefined
  const parsed = Number(displayValue)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function InputNumber(props: InputNumberProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'min',
    'max',
    'step',
    'precision',
    'placeholder',
    'disabled',
    'size',
    'status',
    'controls',
    'formatter',
    'parser',
    'onChange',
    'onInput',
    'onBlur',
    'onFocus',
    'onKeyDown',
    'class',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => `${config.prefixCls()}-input-number`
  const [, hashId] = useInputNumberStyle(prefixCls())
  const [innerValue, setInnerValue] = createSignal<number | undefined>(local.defaultValue)
  const [displayValue, setDisplayValue] = createSignal('')
  const [focused, setFocused] = createSignal(false)
  const step = () => local.step ?? 1
  const controls = () => local.controls !== false
  const disabled = () => Boolean(local.disabled)
  const size = () => local.size ?? config.componentSize()

  const mergedValue = createMemo<number | undefined>(() => {
    if (formItem?.valuePropName() === 'value') return formItem.value() as number | undefined
    if ('value' in props) return local.value
    return innerValue()
  })

  function formatValue(value: number | undefined): string {
    if (local.formatter) return local.formatter(value)
    return value === undefined ? '' : String(value)
  }

  createEffect(() => {
    if (!focused()) setDisplayValue(formatValue(mergedValue()))
  })

  function parseDisplay(value: string): number | undefined {
    return local.parser ? local.parser(value) : defaultParser(value)
  }

  function normalize(value: number | undefined): number | undefined {
    if (!isFiniteNumber(value)) return undefined
    return roundByPrecision(clamp(value, local.min, local.max), local.precision)
  }

  function updateValue(nextValue: number | undefined): void {
    const normalized = normalize(nextValue)
    if (!('value' in props) && formItem?.valuePropName() !== 'value') setInnerValue(normalized)
    setDisplayValue(formatValue(normalized))
    local.onChange?.(normalized)
    if (formItem?.valuePropName() === 'value') formItem.setFieldValueFromControl(normalized)
  }

  function stepValue(direction: 1 | -1): void {
    if (disabled()) return
    const base = mergedValue() ?? 0
    updateValue(base + step() * direction)
  }

  return (
    <span
      class={classNames(
        prefixCls(),
        focused() && `${prefixCls()}-focused`,
        disabled() && `${prefixCls()}-disabled`,
        size() === 'small' && `${prefixCls()}-sm`,
        size() === 'large' && `${prefixCls()}-lg`,
        local.status && `${prefixCls()}-status-${local.status}`,
        hashId(),
        local.class,
      )}
    >
      <input
        {...rest}
        role="spinbutton"
        type="text"
        class={`${prefixCls()}-input`}
        value={displayValue()}
        placeholder={local.placeholder}
        disabled={disabled()}
        aria-disabled={disabled() ? 'true' : undefined}
        aria-valuemin={local.min}
        aria-valuemax={local.max}
        aria-valuenow={mergedValue()}
        onInput={(event) => {
          setDisplayValue(event.currentTarget.value)
          ;(local.onInput as JSX.EventHandler<HTMLInputElement, InputEvent> | undefined)?.(event)
        }}
        onFocus={(event) => {
          setFocused(true)
          ;(local.onFocus as JSX.EventHandler<HTMLInputElement, FocusEvent> | undefined)?.(event)
        }}
        onBlur={(event) => {
          setFocused(false)
          updateValue(parseDisplay(event.currentTarget.value))
          ;(local.onBlur as JSX.EventHandler<HTMLInputElement, FocusEvent> | undefined)?.(event)
        }}
        onKeyDown={(event) => {
          ;(local.onKeyDown as JSX.EventHandler<HTMLInputElement, KeyboardEvent> | undefined)?.(
            event,
          )
          if (event.key === 'ArrowUp') {
            event.preventDefault()
            stepValue(1)
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            stepValue(-1)
          }
        }}
      />
      <Show when={controls()}>
        <span class={`${prefixCls()}-controls`}>
          <button
            type="button"
            aria-label="increase value"
            class={classNames(`${prefixCls()}-handler`, `${prefixCls()}-handler-up`)}
            disabled={disabled()}
            onClick={() => stepValue(1)}
          >
            ▲
          </button>
          <button
            type="button"
            aria-label="decrease value"
            class={classNames(`${prefixCls()}-handler`, `${prefixCls()}-handler-down`)}
            disabled={disabled()}
            onClick={() => stepValue(-1)}
          >
            ▼
          </button>
        </span>
      </Show>
    </span>
  )
}
```

- [ ] **Step 6: Add InputNumber exports**

Create `packages/components/src/input-number/index.ts`:

```ts
export * from './input-number'
export * from './interface'
```

Modify `packages/components/src/index.ts` and insert after `export * from './input'`:

```ts
export * from './input-number'
```

- [ ] **Step 7: Add InputNumber docs page and nav**

Create `apps/docs/src/routes/components/input-number.tsx`:

```tsx
import { createSignal } from 'solid-js'
import { Form, InputNumber, Space } from '@solid-ant-design/core'
import { DemoBlock } from '../../site/demo-block'

export default function InputNumberPage() {
  const [value, setValue] = createSignal<number | undefined>(3)

  return (
    <div class="doc-page">
      <h1>InputNumber</h1>
      <p>Enter numeric values with optional controls, bounds, precision, and formatting.</p>

      <DemoBlock title="Basic">
        <InputNumber defaultValue={3} />
      </DemoBlock>

      <DemoBlock title="Min, max, and step">
        <InputNumber min={0} max={10} step={0.5} defaultValue={2} />
      </DemoBlock>

      <DemoBlock title="Controlled">
        <Space>
          <InputNumber value={value()} onChange={setValue} />
          <span>Value: {value() ?? 'empty'}</span>
        </Space>
      </DemoBlock>

      <DemoBlock title="Precision">
        <InputNumber precision={2} defaultValue={1.236} />
      </DemoBlock>

      <DemoBlock title="Formatter and parser">
        <InputNumber
          defaultValue={1000}
          formatter={(nextValue) => (nextValue === undefined ? '' : `$ ${nextValue}`)}
          parser={(displayValue) => {
            const parsed = Number(displayValue.replace(/[$,\s]/g, ''))
            return Number.isNaN(parsed) ? undefined : parsed
          }}
        />
      </DemoBlock>

      <DemoBlock title="Sizes and statuses">
        <Space>
          <InputNumber size="small" defaultValue={1} />
          <InputNumber defaultValue={2} status="warning" />
          <InputNumber size="large" defaultValue={3} status="error" />
        </Space>
      </DemoBlock>

      <DemoBlock title="Disabled and no controls">
        <Space>
          <InputNumber defaultValue={4} disabled />
          <InputNumber defaultValue={5} controls={false} />
        </Space>
      </DemoBlock>

      <DemoBlock title="Form usage">
        <Form onFinish={(values) => console.log(values)}>
          <Form.Item name="amount" label="Amount">
            <InputNumber min={0} />
          </Form.Item>
          <button type="submit">Submit</button>
        </Form>
      </DemoBlock>
    </div>
  )
}
```

Modify `apps/docs/src/site/nav.ts` and insert after the Input item:

```ts
  { path: '/components/input-number', label: 'InputNumber' },
```

- [ ] **Step 8: Verify and commit InputNumber**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- input-number
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm exec oxfmt --check packages/components/src/input-number apps/docs/src/routes/components/input-number.tsx packages/components/src/index.ts apps/docs/src/site/nav.ts
```

Expected: all commands pass.

Commit:

```bash
git add packages/components/src/input-number packages/components/src/index.ts apps/docs/src/routes/components/input-number.tsx apps/docs/src/site/nav.ts
git commit -m "feat(components): add input number"
```

---

## Task 2: Add Cascader

**Files:**

- Create: `packages/components/src/cascader/interface.ts`
- Create: `packages/components/src/cascader/cascader.style.ts`
- Create: `packages/components/src/cascader/cascader.tsx`
- Create: `packages/components/src/cascader/index.ts`
- Create: `packages/components/src/cascader/__tests__/cascader.test.tsx`
- Create: `apps/docs/src/routes/components/cascader.tsx`
- Modify: `packages/components/src/index.ts`
- Modify: `apps/docs/src/site/nav.ts`

- [ ] **Step 1: Write failing Cascader tests**

Create `packages/components/src/cascader/__tests__/cascader.test.tsx`:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { createSignal } from 'solid-js'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Form } from '../../form'
import { Cascader } from '../index'
import type { CascaderOption } from '../interface'

const options: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [{ value: 'xihu', label: 'West Lake' }],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      { value: 'nanjing', label: 'Nanjing' },
      { value: 'suzhou', label: 'Suzhou', disabled: true },
    ],
  },
]

describe('Cascader', () => {
  it('renders placeholder and opens options', () => {
    const result = render(() => <Cascader options={options} placeholder="Please select" />)

    expect(result.getByText('Please select')).toBeInTheDocument()
    fireEvent.click(result.getByRole('combobox'))

    expect(result.getByRole('menuitem', { name: 'Zhejiang' })).toBeInTheDocument()
    expect(result.getByRole('menuitem', { name: 'Jiangsu' })).toBeInTheDocument()
  })

  it('selects a leaf path in uncontrolled mode', () => {
    const onChange = vi.fn()
    const result = render(() => <Cascader options={options} onChange={onChange} />)

    fireEvent.click(result.getByRole('combobox'))
    fireEvent.click(result.getByRole('menuitem', { name: 'Zhejiang' }))
    fireEvent.click(result.getByRole('menuitem', { name: 'Hangzhou' }))
    fireEvent.click(result.getByRole('menuitem', { name: 'West Lake' }))

    expect(onChange).toHaveBeenLastCalledWith(
      ['zhejiang', 'hangzhou', 'xihu'],
      [options[0], options[0].children?.[0], options[0].children?.[0].children?.[0]],
    )
    expect(result.getByText('Zhejiang / Hangzhou / West Lake')).toBeInTheDocument()
    expect(result.queryByRole('menu')).toBeNull()
  })

  it('controlled value mode reflects external value and only calls onChange', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Cascader options={options} value={['jiangsu', 'nanjing']} onChange={onChange} />
    ))

    expect(result.getByText('Jiangsu / Nanjing')).toBeInTheDocument()
    fireEvent.click(result.getByRole('combobox'))
    fireEvent.click(result.getByRole('menuitem', { name: 'Zhejiang' }))
    fireEvent.click(result.getByRole('menuitem', { name: 'Hangzhou' }))
    fireEvent.click(result.getByRole('menuitem', { name: 'West Lake' }))

    expect(onChange).toHaveBeenCalledWith(
      ['zhejiang', 'hangzhou', 'xihu'],
      [options[0], options[0].children?.[0], options[0].children?.[0].children?.[0]],
    )
    expect(result.getByText('Jiangsu / Nanjing')).toBeInTheDocument()
  })

  it('controlled open mode calls onOpenChange without changing by itself', () => {
    const onOpenChange = vi.fn()
    const result = render(() => (
      <Cascader options={options} open={false} onOpenChange={onOpenChange} />
    ))

    fireEvent.click(result.getByRole('combobox'))

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(result.queryByRole('menu')).toBeNull()
  })

  it('changeOnSelect selects an intermediate node', () => {
    const onChange = vi.fn()
    const result = render(() => <Cascader options={options} changeOnSelect onChange={onChange} />)

    fireEvent.click(result.getByRole('combobox'))
    fireEvent.click(result.getByRole('menuitem', { name: 'Zhejiang' }))

    expect(onChange).toHaveBeenLastCalledWith(['zhejiang'], [options[0]])
    expect(result.getByText('Zhejiang')).toBeInTheDocument()
  })

  it('does not select disabled options', () => {
    const onChange = vi.fn()
    const result = render(() => <Cascader options={options} onChange={onChange} />)

    fireEvent.click(result.getByRole('combobox'))
    fireEvent.click(result.getByRole('menuitem', { name: 'Jiangsu' }))
    fireEvent.click(result.getByRole('menuitem', { name: 'Suzhou' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(result.queryByText('Jiangsu / Suzhou')).toBeNull()
  })

  it('allowClear clears value', () => {
    const onChange = vi.fn()
    const result = render(() => (
      <Cascader
        options={options}
        defaultValue={['jiangsu', 'nanjing']}
        allowClear
        onChange={onChange}
      />
    ))

    fireEvent.click(result.getByRole('button', { name: 'clear selection' }))

    expect(onChange).toHaveBeenLastCalledWith([], [])
    expect(result.queryByText('Jiangsu / Nanjing')).toBeNull()
  })

  it('supports displayRender', () => {
    const result = render(() => (
      <Cascader
        options={options}
        defaultValue={['jiangsu', 'nanjing']}
        displayRender={(labels) => <strong>{labels.join(' > ')}</strong>}
      />
    ))

    expect(result.getByText('Jiangsu > Nanjing')).toBeInTheDocument()
  })

  it('expands on hover when expandTrigger is hover', () => {
    const result = render(() => <Cascader options={options} expandTrigger="hover" />)

    fireEvent.click(result.getByRole('combobox'))
    fireEvent.pointerEnter(result.getByRole('menuitem', { name: 'Zhejiang' }))

    expect(result.getByRole('menuitem', { name: 'Hangzhou' })).toBeInTheDocument()
  })

  it('Escape closes the dropdown', () => {
    const result = render(() => <Cascader options={options} defaultOpen />)

    expect(result.getByRole('menu')).toBeInTheDocument()
    fireEvent.keyDown(result.getByRole('combobox'), { key: 'Escape' })
    expect(result.queryByRole('menu')).toBeNull()
  })

  it('uses custom prefix classes', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Cascader options={options} class="extra-cascader" />
      </ConfigProvider>
    ))
    const root = result.container.firstElementChild as HTMLElement

    expect(root.className).toContain('custom-cascader')
    expect(root.className).toContain('extra-cascader')
  })

  it('integrates with Form.Item value collection', () => {
    const onFinish = vi.fn()
    const result = render(() => (
      <Form onFinish={onFinish}>
        <Form.Item name="city">
          <Cascader options={options} />
        </Form.Item>
        <button type="submit">Submit</button>
      </Form>
    ))

    fireEvent.click(result.getByRole('combobox'))
    fireEvent.click(result.getByRole('menuitem', { name: 'Jiangsu' }))
    fireEvent.click(result.getByRole('menuitem', { name: 'Nanjing' }))
    fireEvent.click(result.getByRole('button', { name: 'Submit' }))

    expect(onFinish).toHaveBeenCalledWith({ city: ['jiangsu', 'nanjing'] })
  })
})
```

- [ ] **Step 2: Run Cascader tests and verify they fail**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
```

Expected: FAIL because `packages/components/src/cascader` and `Cascader` do not exist yet.

- [ ] **Step 3: Add Cascader public types**

Create `packages/components/src/cascader/interface.ts`:

```ts
import type { JSX } from 'solid-js'
import type { OptionValue } from '../shared/options'

export interface CascaderOption {
  label: JSX.Element
  value: OptionValue
  disabled?: boolean
  children?: CascaderOption[]
}

export type CascaderExpandTrigger = 'click' | 'hover'

export interface CascaderProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options?: CascaderOption[]
  value?: OptionValue[]
  defaultValue?: OptionValue[]
  open?: boolean
  defaultOpen?: boolean
  placeholder?: JSX.Element
  disabled?: boolean
  allowClear?: boolean
  changeOnSelect?: boolean
  expandTrigger?: CascaderExpandTrigger
  displayRender?: (labels: JSX.Element[], selectedOptions: CascaderOption[]) => JSX.Element
  onChange?: (value: OptionValue[], selectedOptions: CascaderOption[]) => void
  onOpenChange?: (open: boolean) => void
}
```

- [ ] **Step 4: Add Cascader styles**

Create `packages/components/src/cascader/cascader.style.ts`:

```ts
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { useToken } from '../config-provider'

export function useCascaderStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Cascader', prefixCls] },
    () => {
      const t = token()
      return {
        [`.${prefixCls}`]: {
          position: 'relative',
          display: 'inline-block',
          minWidth: 180,
          color: t.colorText,
          'font-size': `${t.fontSize}px`,
          'font-family': t.fontFamily,
        },
        [`.${prefixCls}-selector`]: {
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          minHeight: 32,
          padding: `${t.paddingXXS}px ${t.paddingSM}px`,
          background: t.colorBgContainer,
          border: `${t.lineWidth}px solid ${t.colorBorder}`,
          'border-radius': `${t.borderRadius}px`,
          cursor: 'pointer',
          transition: `border-color ${t.motionDurationMid} ${t.motionEaseInOut}`,
          '&:hover': { 'border-color': t.colorPrimaryHover },
        },
        [`.${prefixCls}-open .${prefixCls}-selector`]: {
          'border-color': t.colorPrimary,
          'box-shadow': `0 0 0 2px ${t.colorPrimaryBg}`,
        },
        [`.${prefixCls}-disabled .${prefixCls}-selector`]: {
          color: t.colorTextDisabled,
          background: t.colorBgContainerDisabled,
          cursor: 'not-allowed',
          '&:hover': { 'border-color': t.colorBorder },
        },
        [`.${prefixCls}-placeholder`]: {
          color: t.colorTextPlaceholder,
        },
        [`.${prefixCls}-selection-item`]: {
          overflow: 'hidden',
          'text-overflow': 'ellipsis',
          'white-space': 'nowrap',
        },
        [`.${prefixCls}-clear`]: {
          marginLeft: `${t.marginXS}px`,
          color: t.colorTextTertiary,
          background: 'transparent',
          border: 0,
          cursor: 'pointer',
          '&:hover': { color: t.colorText },
        },
        [`.${prefixCls}-arrow`]: {
          marginLeft: `${t.marginXS}px`,
          color: t.colorTextTertiary,
          'font-size': 10,
        },
        [`.${prefixCls}-dropdown`]: {
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          'z-index': '1050',
          display: 'flex',
          background: t.colorBgElevated,
          border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
          'border-radius': `${t.borderRadius}px`,
          'box-shadow': t.boxShadowSecondary,
        },
        [`.${prefixCls}-menu`]: {
          minWidth: 120,
          maxHeight: 240,
          margin: 0,
          padding: `${t.paddingXS}px 0`,
          overflow: 'auto',
          'list-style': 'none',
          borderRight: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
        },
        [`.${prefixCls}-menu:last-child`]: {
          borderRight: 0,
        },
        [`.${prefixCls}-menu-item`]: {
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'space-between',
          gap: `${t.marginSM}px`,
          padding: `${t.paddingXXS}px ${t.paddingSM}px`,
          color: t.colorText,
          cursor: 'pointer',
          'white-space': 'nowrap',
          '&:hover': { background: t.colorFillTertiary },
        },
        [`.${prefixCls}-menu-item-active`]: {
          background: t.colorFillSecondary,
        },
        [`.${prefixCls}-menu-item-selected`]: {
          color: t.colorPrimary,
          'font-weight': '600',
          background: t.colorPrimaryBg,
        },
        [`.${prefixCls}-menu-item-disabled`]: {
          color: t.colorTextDisabled,
          cursor: 'not-allowed',
          '&:hover': { background: 'transparent' },
        },
        [`.${prefixCls}-menu-item-expand-icon`]: {
          color: t.colorTextTertiary,
          'font-size': 10,
        },
      }
    },
  )
}
```

- [ ] **Step 5: Add Cascader implementation**

Create `packages/components/src/cascader/cascader.tsx`:

```tsx
import { For, Show, createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form'
import { classNames } from '../shared/class-names'
import type { OptionValue } from '../shared/options'
import type { CascaderOption, CascaderProps } from './interface'
import { useCascaderStyle } from './cascader.style'

function samePath(a: OptionValue[] | undefined, b: OptionValue[] | undefined): boolean {
  if (!a || !b || a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

function findPath(options: CascaderOption[], values: OptionValue[] | undefined): CascaderOption[] {
  if (!values?.length) return []
  const path: CascaderOption[] = []
  let currentOptions = options
  for (const value of values) {
    const option = currentOptions.find((item) => item.value === value)
    if (!option) return []
    path.push(option)
    currentOptions = option.children ?? []
  }
  return path
}

function pathValues(path: CascaderOption[]): OptionValue[] {
  return path.map((option) => option.value)
}

function labelsToText(labels: JSX.Element[]): string {
  return labels.map((label) => String(label)).join(' / ')
}

export function Cascader(props: CascaderProps) {
  const [local, rest] = splitProps(props, [
    'options',
    'value',
    'defaultValue',
    'open',
    'defaultOpen',
    'placeholder',
    'disabled',
    'allowClear',
    'changeOnSelect',
    'expandTrigger',
    'displayRender',
    'onChange',
    'onOpenChange',
    'class',
    'style',
    'onKeyDown',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => `${config.prefixCls()}-cascader`
  const [, hashId] = useCascaderStyle(prefixCls())
  const [innerValue, setInnerValue] = createSignal<OptionValue[]>(local.defaultValue ?? [])
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [activePath, setActivePath] = createSignal<CascaderOption[]>([])

  const disabled = () => Boolean(local.disabled)
  const options = () => local.options ?? []
  const expandTrigger = () => local.expandTrigger ?? 'click'
  const value = createMemo<OptionValue[]>(() => {
    if (formItem?.valuePropName() === 'value') return (formItem.value() as OptionValue[]) ?? []
    if ('value' in props) return local.value ?? []
    return innerValue()
  })
  const open = () => (local.open !== undefined ? Boolean(local.open) : innerOpen())
  const selectedOptions = createMemo(() => findPath(options(), value()))

  createEffect(() => {
    if (!open()) return
    const selected = selectedOptions()
    if (selected.length) setActivePath(selected.filter((option) => option.children?.length))
  })

  function setOpen(nextOpen: boolean): void {
    if (disabled()) return
    if (local.open === undefined) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  function commit(path: CascaderOption[]): void {
    const nextValue = pathValues(path)
    if (!('value' in props) && formItem?.valuePropName() !== 'value') setInnerValue(nextValue)
    local.onChange?.(nextValue, path)
    if (formItem?.valuePropName() === 'value') formItem.setFieldValueFromControl(nextValue)
  }

  function clear(event: MouseEvent): void {
    event.stopPropagation()
    if (disabled()) return
    setActivePath([])
    if (!('value' in props) && formItem?.valuePropName() !== 'value') setInnerValue([])
    local.onChange?.([], [])
    if (formItem?.valuePropName() === 'value') formItem.setFieldValueFromControl([])
  }

  function activate(option: CascaderOption, depth: number): CascaderOption[] {
    const nextPath = [...activePath().slice(0, depth), option]
    setActivePath(option.children?.length ? nextPath : nextPath.slice(0, depth))
    return nextPath
  }

  function selectOption(option: CascaderOption, depth: number): void {
    if (option.disabled) return
    const nextPath = activate(option, depth)
    const hasChildren = Boolean(option.children?.length)
    if (local.changeOnSelect || !hasChildren) commit(nextPath)
    if (!hasChildren) setOpen(false)
  }

  function columns(): CascaderOption[][] {
    const result: CascaderOption[][] = [options()]
    for (const option of activePath()) {
      if (option.children?.length) result.push(option.children)
    }
    return result
  }

  function isActive(option: CascaderOption, depth: number): boolean {
    return activePath()[depth]?.value === option.value
  }

  function isSelected(option: CascaderOption, depth: number): boolean {
    return selectedOptions()[depth]?.value === option.value
  }

  function selectFirstEnabled(): void {
    const currentColumn = columns()[columns().length - 1] ?? []
    const first = currentColumn.find((option) => !option.disabled)
    if (first) selectOption(first, columns().length - 1)
  }

  const display = () => {
    const selected = selectedOptions()
    if (!selected.length) return local.placeholder
    const labels = selected.map((option) => option.label)
    return local.displayRender ? local.displayRender(labels, selected) : labelsToText(labels)
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        open() && `${prefixCls()}-open`,
        disabled() && `${prefixCls()}-disabled`,
        hashId(),
        local.class,
      )}
      style={local.style}
    >
      <div
        role="combobox"
        tabindex={disabled() ? undefined : 0}
        aria-expanded={open()}
        aria-disabled={disabled() ? 'true' : undefined}
        class={`${prefixCls()}-selector`}
        onClick={() => setOpen(!open())}
        onKeyDown={(event) => {
          ;(local.onKeyDown as JSX.EventHandler<HTMLDivElement, KeyboardEvent> | undefined)?.(event)
          if (event.key === 'Escape') setOpen(false)
          if (event.key === 'Enter' && open()) selectFirstEnabled()
        }}
      >
        <span
          class={
            selectedOptions().length
              ? `${prefixCls()}-selection-item`
              : `${prefixCls()}-placeholder`
          }
        >
          {display()}
        </span>
        <Show when={local.allowClear && !disabled() && selectedOptions().length}>
          <button
            type="button"
            aria-label="clear selection"
            class={`${prefixCls()}-clear`}
            onClick={clear}
          >
            ×
          </button>
        </Show>
        <span class={`${prefixCls()}-arrow`}>⌄</span>
      </div>
      <Show when={open()}>
        <div class={`${prefixCls()}-dropdown`}>
          <For each={columns()}>
            {(column, depth) => (
              <ul role="menu" class={`${prefixCls()}-menu`}>
                <For each={column}>
                  {(option) => (
                    <li
                      role="menuitem"
                      aria-selected={isSelected(option, depth()) ? 'true' : undefined}
                      aria-disabled={option.disabled ? 'true' : undefined}
                      class={classNames(
                        `${prefixCls()}-menu-item`,
                        isActive(option, depth()) && `${prefixCls()}-menu-item-active`,
                        isSelected(option, depth()) && `${prefixCls()}-menu-item-selected`,
                        option.disabled && `${prefixCls()}-menu-item-disabled`,
                      )}
                      onClick={() => selectOption(option, depth())}
                      onPointerEnter={() => {
                        if (
                          expandTrigger() === 'hover' &&
                          !option.disabled &&
                          option.children?.length
                        )
                          activate(option, depth())
                      }}
                    >
                      <span>{option.label}</span>
                      <Show when={option.children?.length}>
                        <span class={`${prefixCls()}-menu-item-expand-icon`}>›</span>
                      </Show>
                    </li>
                  )}
                </For>
              </ul>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
```

- [ ] **Step 6: Add Cascader exports**

Create `packages/components/src/cascader/index.ts`:

```ts
export * from './cascader'
export * from './interface'
```

Modify `packages/components/src/index.ts` and insert near `Select`:

```ts
export * from './cascader'
```

- [ ] **Step 7: Add Cascader docs page and nav**

Create `apps/docs/src/routes/components/cascader.tsx`:

```tsx
import { Form, Cascader, Space } from '@solid-ant-design/core'
import { DemoBlock } from '../../site/demo-block'
import type { CascaderOption } from '@solid-ant-design/core'

const options: CascaderOption[] = [
  {
    value: 'zhejiang',
    label: 'Zhejiang',
    children: [
      {
        value: 'hangzhou',
        label: 'Hangzhou',
        children: [{ value: 'xihu', label: 'West Lake' }],
      },
    ],
  },
  {
    value: 'jiangsu',
    label: 'Jiangsu',
    children: [
      { value: 'nanjing', label: 'Nanjing' },
      { value: 'suzhou', label: 'Suzhou', disabled: true },
    ],
  },
]

export default function CascaderPage() {
  return (
    <div class="doc-page">
      <h1>Cascader</h1>
      <p>Select a value path from hierarchical options.</p>

      <DemoBlock title="Basic">
        <Cascader options={options} placeholder="Please select" />
      </DemoBlock>

      <DemoBlock title="Default value and allow clear">
        <Cascader options={options} defaultValue={['jiangsu', 'nanjing']} allowClear />
      </DemoBlock>

      <DemoBlock title="Change on select">
        <Cascader options={options} changeOnSelect placeholder="Select any level" />
      </DemoBlock>

      <DemoBlock title="Hover expand">
        <Cascader options={options} expandTrigger="hover" placeholder="Hover to expand" />
      </DemoBlock>

      <DemoBlock title="Disabled">
        <Space>
          <Cascader options={options} disabled placeholder="Disabled" />
          <Cascader options={options} placeholder="Suzhou is disabled" />
        </Space>
      </DemoBlock>

      <DemoBlock title="Custom display render">
        <Cascader
          options={options}
          defaultValue={['zhejiang', 'hangzhou', 'xihu']}
          displayRender={(labels) => <strong>{labels.join(' > ')}</strong>}
        />
      </DemoBlock>

      <DemoBlock title="Form usage">
        <Form onFinish={(values) => console.log(values)}>
          <Form.Item name="city" label="City">
            <Cascader options={options} placeholder="Select city" />
          </Form.Item>
          <button type="submit">Submit</button>
        </Form>
      </DemoBlock>
    </div>
  )
}
```

Modify `apps/docs/src/site/nav.ts` and insert near Select:

```ts
  { path: '/components/cascader', label: 'Cascader' },
```

- [ ] **Step 8: Verify and commit Cascader**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- cascader
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm exec oxfmt --check packages/components/src/cascader apps/docs/src/routes/components/cascader.tsx packages/components/src/index.ts apps/docs/src/site/nav.ts
```

Expected: all commands pass.

Commit:

```bash
git add packages/components/src/cascader packages/components/src/index.ts apps/docs/src/routes/components/cascader.tsx apps/docs/src/site/nav.ts
git commit -m "feat(components): add cascader"
```

---

## Task 3: Full verification

**Files:**

- Verify all repository files touched by Tasks 1 and 2.

- [ ] **Step 1: Run lint**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: PASS.

- [ ] **Step 2: Run format check**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: PASS.

- [ ] **Step 3: Run recursive typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: PASS.

- [ ] **Step 4: Run recursive tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: PASS.

- [ ] **Step 5: Run recursive build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: PASS.

- [ ] **Step 6: Inspect final status**

Run:

```bash
git status --short
```

Expected: only intentional uncommitted plan/status changes remain, or a clean working tree if all component commits were made.
