# ant-design-solid Feedback Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Ant Design-inspired `Alert`, `Message`, `Notification`, `Modal`, `Modal.confirm`, and `Popconfirm` components to `@solid-ant-design/core`.

**Architecture:** Add component token defaults in `@solid-ant-design/theme`, then build a small shared overlay foundation for portals, z-index allocation, document listeners, and body scroll locking. Each feedback component follows the existing folder pattern in `packages/components/src`, uses `ConfigProvider` prefix classes, registers token-driven styles with `useStyleRegister`, and includes docs and tests.

**Tech Stack:** TypeScript, SolidJS, Solid portals, Vite 8, pnpm 11, Vitest, jsdom, @solidjs/testing-library, oxlint, oxfmt.

---

## File Structure Map

### Theme package

- Modify `packages/theme/src/types.ts`: add token interfaces for `Alert`, `Message`, `Notification`, `Modal`, and `Popconfirm` and extend `ComponentTokenMap`.
- Modify `packages/theme/src/components.ts`: derive default component tokens from the global token.
- Modify `packages/theme/src/__tests__/theme.test.ts`: cover defaults and overrides for the new component tokens.

### Shared overlay helpers

- Create `packages/components/src/shared/portal.tsx`: internal browser-safe Solid portal wrapper.
- Create `packages/components/src/shared/z-index.ts`: deterministic z-index allocator and reset helper for tests.
- Create `packages/components/src/shared/overlay.ts`: document keydown listener helper, outside pointer helper, body scroll lock/unlock, and browser guard.
- Modify `packages/components/src/shared/events.ts`: reuse existing handler helper if needed; do not duplicate event invocation logic.

### Alert component

- Create `packages/components/src/alert/interface.ts`: `AlertType` and `AlertProps`.
- Create `packages/components/src/alert/alert.style.ts`: token-driven alert styles.
- Create `packages/components/src/alert/alert.tsx`: component implementation.
- Create `packages/components/src/alert/index.ts`: public exports.
- Create `packages/components/src/alert/__tests__/alert.test.tsx`: rendering, close, prefix, and style behavior tests.

### Message component

- Create `packages/components/src/message/interface.ts`: message args, handle, and instance types.
- Create `packages/components/src/message/message.style.ts`: singleton holder and notice styles.
- Create `packages/components/src/message/holder.tsx`: Solid holder renderer for notices.
- Create `packages/components/src/message/message.ts`: singleton imperative API.
- Create `packages/components/src/message/index.ts`: public exports.
- Create `packages/components/src/message/__tests__/message.test.tsx`: imperative creation, timers, key update, destroy tests.

### Notification component

- Create `packages/components/src/notification/interface.ts`: args, placement, handle, and instance types.
- Create `packages/components/src/notification/notification.style.ts`: placement and notice styles.
- Create `packages/components/src/notification/holder.tsx`: Solid holder renderer for notifications.
- Create `packages/components/src/notification/notification.ts`: singleton imperative API.
- Create `packages/components/src/notification/index.ts`: public exports.
- Create `packages/components/src/notification/__tests__/notification.test.tsx`: open, placement, timers, key update, close, destroy tests.

### Modal component

- Create `packages/components/src/modal/interface.ts`: component props, static method props, return type, and composite `ModalComponent` type.
- Create `packages/components/src/modal/modal.style.ts`: mask, wrap, dialog, footer, and confirm styles.
- Create `packages/components/src/modal/modal.tsx`: controlled component modal.
- Create `packages/components/src/modal/confirm.tsx`: confirm dialog renderer.
- Create `packages/components/src/modal/modal-method.ts`: imperative static methods and holder management.
- Create `packages/components/src/modal/index.ts`: public exports.
- Create `packages/components/src/modal/__tests__/modal.test.tsx`: component and imperative API tests.

### Popconfirm component

- Create `packages/components/src/popconfirm/interface.ts`: placement and props.
- Create `packages/components/src/popconfirm/popconfirm.style.ts`: popup, arrow, buttons, placement styles.
- Create `packages/components/src/popconfirm/popconfirm.tsx`: trigger, positioning, controlled/uncontrolled state.
- Create `packages/components/src/popconfirm/index.ts`: public exports.
- Create `packages/components/src/popconfirm/__tests__/popconfirm.test.tsx`: trigger, confirm, cancel, controlled, disabled tests.

### Root exports and docs app

- Modify `packages/components/src/index.ts`: export new component folders.
- Modify `apps/docs/src/site/nav.ts`: add feedback pages.
- Modify `apps/docs/src/app.tsx`: import and register feedback pages.
- Create `apps/docs/src/pages/alert-page.tsx`.
- Create `apps/docs/src/pages/message-page.tsx`.
- Create `apps/docs/src/pages/notification-page.tsx`.
- Create `apps/docs/src/pages/modal-page.tsx`.
- Create `apps/docs/src/pages/popconfirm-page.tsx`.

---

## Implementation Tasks

### Task 1: Add feedback component theme tokens

**Files:**

- Modify: `packages/theme/src/types.ts`
- Modify: `packages/theme/src/components.ts`
- Modify: `packages/theme/src/__tests__/theme.test.ts`

- [ ] **Step 1: Add failing token tests**

Append this test case to `packages/theme/src/__tests__/theme.test.ts`:

```ts
it('derives feedback component token defaults and applies overrides', () => {
  const token = mergeTheme({
    components: {
      Alert: { iconSize: 18 },
      Message: { noticeBorderRadius: 10 },
      Notification: { width: 420 },
      Modal: { titleFontSize: 18 },
      Popconfirm: { width: 240 },
    },
  })

  expect(getComponentToken('Alert', token).iconSize).toBe(18)
  expect(getComponentToken('Alert', token).borderRadius).toBe(token.borderRadius)
  expect(getComponentToken('Message', token).noticeBorderRadius).toBe(10)
  expect(getComponentToken('Message', token).contentBg).toBe(token.colorBgElevated)
  expect(getComponentToken('Notification', token).width).toBe(420)
  expect(getComponentToken('Notification', token).bg).toBe(token.colorBgElevated)
  expect(getComponentToken('Modal', token).titleFontSize).toBe(18)
  expect(getComponentToken('Modal', token).maskBg).toBe('rgba(0, 0, 0, 0.45)')
  expect(getComponentToken('Popconfirm', token).width).toBe(240)
  expect(getComponentToken('Popconfirm', token).bg).toBe(token.colorBgElevated)
})
```

- [ ] **Step 2: Run theme tests and verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/theme test
```

Expected: FAIL because the new component token names are not in `ComponentTokenMap`.

- [ ] **Step 3: Add token interfaces**

In `packages/theme/src/types.ts`, insert these interfaces after `SwitchComponentToken`:

```ts
export interface AlertComponentToken {
  padding: number
  borderRadius: number
  withDescriptionPadding: number
  iconSize: number
}

export interface MessageComponentToken {
  noticePadding: number
  noticeBorderRadius: number
  contentBg: string
  contentShadow: string
}

export interface NotificationComponentToken {
  width: number
  padding: number
  borderRadius: number
  bg: string
  boxShadow: string
}

export interface ModalComponentToken {
  contentBg: string
  headerBg: string
  titleColor: string
  titleFontSize: number
  borderRadius: number
  boxShadow: string
  maskBg: string
}

export interface PopconfirmComponentToken {
  width: number
  padding: number
  borderRadius: number
  bg: string
  boxShadow: string
}
```

Then extend `ComponentTokenMap` with these entries:

```ts
Alert: AlertComponentToken
Message: MessageComponentToken
Notification: NotificationComponentToken
Modal: ModalComponentToken
Popconfirm: PopconfirmComponentToken
```

- [ ] **Step 4: Add default token derivation**

In `packages/theme/src/components.ts`, add these entries to the `defaults` object after `Switch`:

```ts
    Alert: {
      padding: token.paddingSM,
      borderRadius: token.borderRadius,
      withDescriptionPadding: token.padding,
      iconSize: 16,
    },
    Message: {
      noticePadding: token.paddingSM,
      noticeBorderRadius: token.borderRadius,
      contentBg: token.colorBgElevated,
      contentShadow: token.boxShadow,
    },
    Notification: {
      width: 384,
      padding: token.padding,
      borderRadius: token.borderRadius,
      bg: token.colorBgElevated,
      boxShadow: token.boxShadow,
    },
    Modal: {
      contentBg: token.colorBgElevated,
      headerBg: token.colorBgElevated,
      titleColor: token.colorText,
      titleFontSize: token.fontSize + 2,
      borderRadius: token.borderRadius,
      boxShadow: token.boxShadow,
      maskBg: 'rgba(0, 0, 0, 0.45)',
    },
    Popconfirm: {
      width: 280,
      padding: token.padding,
      borderRadius: token.borderRadius,
      bg: token.colorBgElevated,
      boxShadow: token.boxShadow,
    },
```

- [ ] **Step 5: Run theme tests and verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/theme test
```

Expected: PASS.

- [ ] **Step 6: Commit theme token update**

```bash
git add packages/theme/src/types.ts packages/theme/src/components.ts packages/theme/src/__tests__/theme.test.ts
git commit -m "feat: add feedback component theme tokens"
```

### Task 2: Add shared overlay helpers

**Files:**

- Create: `packages/components/src/shared/portal.tsx`
- Create: `packages/components/src/shared/z-index.ts`
- Create: `packages/components/src/shared/overlay.ts`
- Create: `packages/components/src/shared/__tests__/overlay.test.tsx`

- [ ] **Step 1: Add failing shared helper tests**

Create `packages/components/src/shared/__tests__/overlay.test.tsx`:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { createSignal, onCleanup } from 'solid-js'
import { InternalPortal } from '../portal'
import { allocateZIndex, resetZIndexForTests } from '../z-index'
import { addDocumentKeydown, lockBodyScroll, unlockBodyScroll } from '../overlay'

describe('shared overlay helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    resetZIndexForTests()
  })

  it('allocates deterministic z-index values', () => {
    expect(allocateZIndex()).toBe(1000)
    expect(allocateZIndex()).toBe(1010)
  })

  it('renders portal content into document.body', () => {
    render(() => (
      <InternalPortal>
        <div data-testid="portal-child">Portal child</div>
      </InternalPortal>
    ))
    expect(document.body.querySelector('[data-testid="portal-child"]')).toHaveTextContent(
      'Portal child',
    )
  })

  it('adds and removes Escape keydown handlers', () => {
    const onEscape = vi.fn()
    const result = render(() => {
      const [enabled, setEnabled] = createSignal(true)
      const cleanup = addDocumentKeydown((event) => {
        if (event.key === 'Escape' && enabled()) onEscape()
      })
      onCleanup(cleanup)
      return <button onClick={() => setEnabled(false)}>disable</button>
    })

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onEscape).toHaveBeenCalledTimes(1)

    fireEvent.click(result.getByRole('button', { name: 'disable' }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onEscape).toHaveBeenCalledTimes(1)

    result.unmount()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onEscape).toHaveBeenCalledTimes(1)
  })

  it('locks and unlocks body scroll with nesting', () => {
    lockBodyScroll()
    lockBodyScroll()
    expect(document.body.style.overflow).toBe('hidden')

    unlockBodyScroll()
    expect(document.body.style.overflow).toBe('hidden')

    unlockBodyScroll()
    expect(document.body.style.overflow).toBe('')
  })
})
```

- [ ] **Step 2: Run shared helper tests and verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- shared/__tests__/overlay.test.tsx
```

Expected: FAIL because `portal.tsx`, `z-index.ts`, and `overlay.ts` do not exist.

- [ ] **Step 3: Implement portal helper**

Create `packages/components/src/shared/portal.tsx`:

```tsx
import { Portal } from 'solid-js/web'
import type { JSX } from 'solid-js'

export interface InternalPortalProps {
  children?: JSX.Element
}

export function canUseDom() {
  return typeof window !== 'undefined' && typeof document !== 'undefined' && Boolean(document.body)
}

export function InternalPortal(props: InternalPortalProps) {
  if (!canUseDom()) return <>{props.children}</>
  return <Portal mount={document.body}>{props.children}</Portal>
}
```

- [ ] **Step 4: Implement z-index helper**

Create `packages/components/src/shared/z-index.ts`:

```ts
const baseZIndex = 1000
const zIndexStep = 10
let currentZIndex = baseZIndex - zIndexStep

export function allocateZIndex() {
  currentZIndex += zIndexStep
  return currentZIndex
}

export function resetZIndexForTests() {
  currentZIndex = baseZIndex - zIndexStep
}
```

- [ ] **Step 5: Implement overlay helper**

Create `packages/components/src/shared/overlay.ts`:

```ts
import { canUseDom } from './portal'

let scrollLockCount = 0
let previousBodyOverflow = ''

export function addDocumentKeydown(handler: (event: KeyboardEvent) => void) {
  if (!canUseDom()) return () => {}
  document.addEventListener('keydown', handler)
  return () => document.removeEventListener('keydown', handler)
}

export function addDocumentPointerDown(handler: (event: PointerEvent) => void) {
  if (!canUseDom()) return () => {}
  document.addEventListener('pointerdown', handler)
  return () => document.removeEventListener('pointerdown', handler)
}

export function lockBodyScroll() {
  if (!canUseDom()) return
  if (scrollLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  scrollLockCount += 1
}

export function unlockBodyScroll() {
  if (!canUseDom() || scrollLockCount === 0) return
  scrollLockCount -= 1
  if (scrollLockCount === 0) document.body.style.overflow = previousBodyOverflow
}
```

- [ ] **Step 6: Run shared helper tests and verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- shared/__tests__/overlay.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit shared overlay helpers**

```bash
git add packages/components/src/shared/portal.tsx packages/components/src/shared/z-index.ts packages/components/src/shared/overlay.ts packages/components/src/shared/__tests__/overlay.test.tsx
git commit -m "feat: add shared overlay helpers"
```

### Task 3: Implement Alert

**Files:**

- Create: `packages/components/src/alert/interface.ts`
- Create: `packages/components/src/alert/alert.style.ts`
- Create: `packages/components/src/alert/alert.tsx`
- Create: `packages/components/src/alert/index.ts`
- Create: `packages/components/src/alert/__tests__/alert.test.tsx`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: Add failing Alert tests**

Create `packages/components/src/alert/__tests__/alert.test.tsx`:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { ConfigProvider } from '../../config-provider'
import { Alert } from '../index'

describe('Alert', () => {
  it('renders message and description', () => {
    const result = render(() => (
      <Alert type="success" message="Saved" description="Everything is safe" />
    ))
    expect(result.getByText('Saved')).toBeTruthy()
    expect(result.getByText('Everything is safe')).toBeTruthy()
    expect(result.container.querySelector('.ant-alert-success')).toBeTruthy()
    expect(result.container.querySelector('.ant-alert-with-description')).toBeTruthy()
  })

  it('renders action and icon when requested', () => {
    const result = render(() => (
      <Alert showIcon message="Warning" action={<button>Retry</button>} />
    ))
    expect(result.getByText('Retry')).toBeTruthy()
    expect(result.container.querySelector('.ant-alert-icon')).toBeTruthy()
  })

  it('closes and calls close callbacks', () => {
    const onClose = vi.fn()
    const afterClose = vi.fn()
    const result = render(() => (
      <Alert closable message="Close me" onClose={onClose} afterClose={afterClose} />
    ))

    fireEvent.click(result.getByRole('button', { name: 'close alert' }))

    expect(result.queryByText('Close me')).toBeNull()
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(afterClose).toHaveBeenCalledTimes(1)
  })

  it('supports ConfigProvider prefixCls', () => {
    const result = render(() => (
      <ConfigProvider prefixCls="custom">
        <Alert message="Prefixed" />
      </ConfigProvider>
    ))
    expect(result.container.querySelector('.custom-alert')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run Alert tests and verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- alert/__tests__/alert.test.tsx
```

Expected: FAIL because `Alert` does not exist.

- [ ] **Step 3: Add Alert types**

Create `packages/components/src/alert/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type AlertType = 'success' | 'info' | 'warning' | 'error'

export interface AlertProps {
  type?: AlertType
  message?: JSX.Element
  description?: JSX.Element
  closable?: boolean
  showIcon?: boolean
  action?: JSX.Element
  afterClose?: () => void
  onClose?: (event: MouseEvent) => void
  class?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties
}
```

- [ ] **Step 4: Add Alert styles**

Create `packages/components/src/alert/alert.style.ts`:

```ts
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useAlertStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Alert', prefixCls] }, () => {
    const t = token()
    const at = getComponentToken('Alert', t)
    return {
      [`.${prefixCls}`]: {
        'box-sizing': 'border-box',
        display: 'flex',
        gap: t.marginSM,
        width: '100%',
        padding: at.padding,
        color: t.colorText,
        'font-size': t.fontSize,
        'line-height': t.lineHeight,
        'border-radius': at.borderRadius,
        border: `${t.lineWidth}px solid ${t.colorBorderSecondary}`,
      },
      [`.${prefixCls}-with-description`]: { padding: at.withDescriptionPadding },
      [`.${prefixCls}-success`]: { background: '#f6ffed', borderColor: '#b7eb8f' },
      [`.${prefixCls}-info`]: { background: '#e6f4ff', borderColor: '#91caff' },
      [`.${prefixCls}-warning`]: { background: '#fffbe6', borderColor: '#ffe58f' },
      [`.${prefixCls}-error`]: { background: '#fff2f0', borderColor: '#ffccc7' },
      [`.${prefixCls}-icon`]: { 'font-size': at.iconSize, 'line-height': t.lineHeight },
      [`.${prefixCls}-content`]: { flex: 1, 'min-width': 0 },
      [`.${prefixCls}-message`]: { color: t.colorText },
      [`.${prefixCls}-description`]: { color: t.colorTextSecondary, 'margin-top': t.marginXS },
      [`.${prefixCls}-action`]: { 'margin-inline-start': t.marginSM },
      [`.${prefixCls}-close`]: {
        border: 0,
        padding: 0,
        background: 'transparent',
        color: t.colorTextSecondary,
        cursor: 'pointer',
      },
    }
  })
}
```

- [ ] **Step 5: Add Alert component and exports**

Create `packages/components/src/alert/alert.tsx`:

```tsx
import { Show, createSignal, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useAlertStyle } from './alert.style'
import type { AlertProps } from './interface'

const iconMap = {
  success: '✓',
  info: 'ℹ',
  warning: '!',
  error: '×',
}

export function Alert(props: AlertProps) {
  const [closed, setClosed] = createSignal(false)
  const [local, rest] = splitProps(props, [
    'type',
    'message',
    'description',
    'closable',
    'showIcon',
    'action',
    'afterClose',
    'onClose',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-alert`
  const [, hashId] = useAlertStyle(prefixCls())
  const type = () => local.type ?? 'info'

  const close = (event: MouseEvent) => {
    local.onClose?.(event)
    setClosed(true)
    local.afterClose?.()
  }

  return (
    <Show when={!closed()}>
      <div
        {...rest}
        role="alert"
        class={classNames(
          prefixCls(),
          `${prefixCls()}-${type()}`,
          local.description && `${prefixCls()}-with-description`,
          hashId(),
          local.class,
        )}
        classList={local.classList}
        style={local.style}
      >
        <Show when={local.showIcon}>
          <span class={`${prefixCls()}-icon`}>{iconMap[type()]}</span>
        </Show>
        <div class={`${prefixCls()}-content`}>
          <div class={`${prefixCls()}-message`}>{local.message}</div>
          <Show when={local.description}>
            <div class={`${prefixCls()}-description`}>{local.description}</div>
          </Show>
        </div>
        <Show when={local.action}>
          <div class={`${prefixCls()}-action`}>{local.action}</div>
        </Show>
        <Show when={local.closable}>
          <button
            type="button"
            class={`${prefixCls()}-close`}
            aria-label="close alert"
            onClick={close}
          >
            ×
          </button>
        </Show>
      </div>
    </Show>
  )
}
```

Create `packages/components/src/alert/index.ts`:

```ts
export * from './interface'
export * from './alert'
```

Append to `packages/components/src/index.ts`:

```ts
export * from './alert'
```

- [ ] **Step 6: Run Alert tests and verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- alert/__tests__/alert.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit Alert**

```bash
git add packages/components/src/alert packages/components/src/index.ts
git commit -m "feat: add alert component"
```

### Task 4: Implement Message

**Files:**

- Create: `packages/components/src/message/interface.ts`
- Create: `packages/components/src/message/message.style.ts`
- Create: `packages/components/src/message/holder.tsx`
- Create: `packages/components/src/message/message.ts`
- Create: `packages/components/src/message/index.ts`
- Create: `packages/components/src/message/__tests__/message.test.tsx`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: Add failing Message tests**

Create `packages/components/src/message/__tests__/message.test.tsx`:

```tsx
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { message } from '../index'

describe('message', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
    message.destroy()
  })

  afterEach(() => {
    message.destroy()
    vi.useRealTimers()
  })

  it('renders success content and auto closes', async () => {
    message.success('Saved', 1)
    expect(document.body).toHaveTextContent('Saved')
    expect(document.body.querySelector('.ant-message-notice-success')).toBeTruthy()

    vi.advanceTimersByTime(1000)
    await Promise.resolve()

    expect(document.body).not.toHaveTextContent('Saved')
  })

  it('keeps loading messages until closed by handle', () => {
    const handle = message.loading('Loading')
    vi.advanceTimersByTime(10000)
    expect(document.body).toHaveTextContent('Loading')

    handle.close()
    expect(document.body).not.toHaveTextContent('Loading')
  })

  it('updates existing keyed message', () => {
    message.open({ key: 'save', type: 'info', content: 'Saving', duration: 0 })
    message.open({ key: 'save', type: 'success', content: 'Saved', duration: 0 })

    expect(document.body).not.toHaveTextContent('Saving')
    expect(document.body).toHaveTextContent('Saved')
    expect(document.body.querySelectorAll('.ant-message-notice')).toHaveLength(1)
  })

  it('destroys one message or all messages', () => {
    message.open({ key: 'a', content: 'A', duration: 0 })
    message.open({ key: 'b', content: 'B', duration: 0 })

    message.destroy('a')
    expect(document.body).not.toHaveTextContent('A')
    expect(document.body).toHaveTextContent('B')

    message.destroy()
    expect(document.body).not.toHaveTextContent('B')
  })
})
```

- [ ] **Step 2: Run Message tests and verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- message/__tests__/message.test.tsx
```

Expected: FAIL because `message` does not exist.

- [ ] **Step 3: Add Message types**

Create `packages/components/src/message/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type MessageType = 'info' | 'success' | 'error' | 'warning' | 'loading'

export interface MessageArgs {
  key?: string
  type?: MessageType
  content: JSX.Element
  duration?: number
  onClose?: () => void
}

export interface MessageNotice extends MessageArgs {
  key: string
  type: MessageType
}

export interface MessageHandle {
  close: () => void
}

export interface MessageInstance {
  open: (args: MessageArgs) => MessageHandle
  info: (content: JSX.Element | MessageArgs, duration?: number) => MessageHandle
  success: (content: JSX.Element | MessageArgs, duration?: number) => MessageHandle
  error: (content: JSX.Element | MessageArgs, duration?: number) => MessageHandle
  warning: (content: JSX.Element | MessageArgs, duration?: number) => MessageHandle
  loading: (content: JSX.Element | MessageArgs, duration?: number) => MessageHandle
  destroy: (key?: string) => void
}
```

- [ ] **Step 4: Add Message styles**

Create `packages/components/src/message/message.style.ts`:

```ts
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useMessageStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Message', prefixCls] },
    () => {
      const t = token()
      const mt = getComponentToken('Message', t)
      return {
        [`.${prefixCls}`]: {
          position: 'fixed',
          top: 8,
          left: '50%',
          transform: 'translateX(-50%)',
          'z-index': 1000,
          'pointer-events': 'none',
        },
        [`.${prefixCls}-notice`]: {
          padding: `${t.paddingXS}px 0`,
          'text-align': 'center',
        },
        [`.${prefixCls}-notice-content`]: {
          display: 'inline-flex',
          'align-items': 'center',
          gap: t.marginXS,
          padding: mt.noticePadding,
          color: t.colorText,
          background: mt.contentBg,
          'border-radius': mt.noticeBorderRadius,
          'box-shadow': mt.contentShadow,
          'pointer-events': 'auto',
        },
        [`.${prefixCls}-icon-success`]: { color: t.colorSuccess },
        [`.${prefixCls}-icon-info`]: { color: t.colorInfo },
        [`.${prefixCls}-icon-error`]: { color: t.colorError },
        [`.${prefixCls}-icon-warning`]: { color: t.colorWarning },
        [`.${prefixCls}-icon-loading`]: { color: t.colorInfo },
      }
    },
  )
}
```

- [ ] **Step 5: Add Message holder**

Create `packages/components/src/message/holder.tsx`:

```tsx
import { For } from 'solid-js'
import { render } from 'solid-js/web'
import { ConfigProvider, useConfig } from '../config-provider'
import { InternalPortal } from '../shared/portal'
import { classNames } from '../shared/class-names'
import { useMessageStyle } from './message.style'
import type { Accessor } from 'solid-js'
import type { MessageNotice } from './interface'

export interface MessageHolderProps {
  notices: Accessor<MessageNotice[]>
}

const iconMap = {
  success: '✓',
  info: 'ℹ',
  error: '×',
  warning: '!',
  loading: '…',
}

function MessageHolder(props: MessageHolderProps) {
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-message`
  const [, hashId] = useMessageStyle(prefixCls())
  return (
    <InternalPortal>
      <div class={classNames(prefixCls(), hashId())}>
        <For each={props.notices()}>
          {(notice) => (
            <div
              class={classNames(`${prefixCls()}-notice`, `${prefixCls()}-notice-${notice.type}`)}
            >
              <div class={`${prefixCls()}-notice-content`}>
                <span class={`${prefixCls()}-icon-${notice.type}`}>{iconMap[notice.type]}</span>
                <span>{notice.content}</span>
              </div>
            </div>
          )}
        </For>
      </div>
    </InternalPortal>
  )
}

export function mountMessageHolder(props: MessageHolderProps) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const dispose = render(
    () => (
      <ConfigProvider>
        <MessageHolder {...props} />
      </ConfigProvider>
    ),
    container,
  )
  return () => {
    dispose()
    container.remove()
  }
}
```

- [ ] **Step 6: Add Message singleton API**

Create `packages/components/src/message/message.ts`:

```ts
import { createRoot, createSignal } from 'solid-js'
import { mountMessageHolder } from './holder'
import type { JSX } from 'solid-js'
import type {
  MessageArgs,
  MessageHandle,
  MessageInstance,
  MessageNotice,
  MessageType,
} from './interface'

let seed = 0
let disposeRoot: (() => void) | undefined
let setNotices:
  | ((updater: MessageNotice[] | ((value: MessageNotice[]) => MessageNotice[])) => MessageNotice[])
  | undefined
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function ensureHolder() {
  if (setNotices) return
  disposeRoot = createRoot((dispose) => {
    const [notices, nextNotices] = createSignal<MessageNotice[]>([])
    setNotices = nextNotices
    const unmount = mountMessageHolder({ notices })
    return () => {
      unmount()
      dispose()
    }
  })
}

function normalize(
  type: MessageType,
  content: JSX.Element | MessageArgs,
  duration?: number,
): MessageArgs {
  if (typeof content === 'object' && content !== null && 'content' in content) {
    return { type, ...content }
  }
  return { type, content, duration }
}

function remove(key: string) {
  const timer = timers.get(key)
  if (timer) clearTimeout(timer)
  timers.delete(key)
  setNotices?.((items) => items.filter((item) => item.key !== key))
}

function open(args: MessageArgs): MessageHandle {
  ensureHolder()
  const type = args.type ?? 'info'
  const key = args.key ?? `message-${++seed}`
  const notice: MessageNotice = { ...args, key, type }
  setNotices?.((items) => {
    const index = items.findIndex((item) => item.key === key)
    if (index === -1) return [...items, notice]
    const next = [...items]
    next[index] = notice
    return next
  })

  const oldTimer = timers.get(key)
  if (oldTimer) clearTimeout(oldTimer)
  timers.delete(key)

  const duration = args.duration ?? (type === 'loading' ? 0 : 3)
  if (duration > 0) {
    timers.set(
      key,
      setTimeout(() => {
        remove(key)
        args.onClose?.()
      }, duration * 1000),
    )
  }

  return { close: () => remove(key) }
}

export const message: MessageInstance = {
  open,
  info: (content, duration) => open(normalize('info', content, duration)),
  success: (content, duration) => open(normalize('success', content, duration)),
  error: (content, duration) => open(normalize('error', content, duration)),
  warning: (content, duration) => open(normalize('warning', content, duration)),
  loading: (content, duration) => open(normalize('loading', content, duration)),
  destroy: (key?: string) => {
    if (key) {
      remove(key)
      return
    }
    timers.forEach((timer) => clearTimeout(timer))
    timers.clear()
    setNotices?.([])
    disposeRoot?.()
    disposeRoot = undefined
    setNotices = undefined
  },
}
```

Create `packages/components/src/message/index.ts`:

```ts
export * from './interface'
export * from './message'
```

Append to `packages/components/src/index.ts`:

```ts
export * from './message'
```

- [ ] **Step 7: Run Message tests and verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- message/__tests__/message.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit Message**

```bash
git add packages/components/src/message packages/components/src/index.ts
git commit -m "feat: add message api"
```

### Task 5: Implement Notification

**Files:**

- Create: `packages/components/src/notification/interface.ts`
- Create: `packages/components/src/notification/notification.style.ts`
- Create: `packages/components/src/notification/holder.tsx`
- Create: `packages/components/src/notification/notification.ts`
- Create: `packages/components/src/notification/index.ts`
- Create: `packages/components/src/notification/__tests__/notification.test.tsx`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: Add failing Notification tests**

Create `packages/components/src/notification/__tests__/notification.test.tsx`:

```tsx
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { notification } from '../index'

describe('notification', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    document.body.innerHTML = ''
    notification.destroy()
  })

  afterEach(() => {
    notification.destroy()
    vi.useRealTimers()
  })

  it('renders notification and auto closes', async () => {
    notification.success({ message: 'Saved', description: 'Record saved', duration: 1 })
    expect(document.body).toHaveTextContent('Saved')
    expect(document.body).toHaveTextContent('Record saved')
    expect(document.body.querySelector('.ant-notification-notice-success')).toBeTruthy()

    vi.advanceTimersByTime(1000)
    await Promise.resolve()

    expect(document.body).not.toHaveTextContent('Saved')
  })

  it('applies placement classes', () => {
    notification.open({ message: 'Bottom', placement: 'bottomLeft', duration: 0 })
    expect(document.body.querySelector('.ant-notification-bottom-left')).toBeTruthy()
  })

  it('updates keyed notification', () => {
    notification.open({ key: 'job', message: 'Running', duration: 0 })
    notification.open({ key: 'job', message: 'Done', duration: 0 })
    expect(document.body).not.toHaveTextContent('Running')
    expect(document.body).toHaveTextContent('Done')
    expect(document.body.querySelectorAll('.ant-notification-notice')).toHaveLength(1)
  })

  it('closes with close button and destroy', () => {
    notification.open({ key: 'a', message: 'A', duration: 0 })
    notification.open({ key: 'b', message: 'B', duration: 0 })

    document.body.querySelector<HTMLButtonElement>('[aria-label="close notification"]')?.click()
    expect(document.body.querySelectorAll('.ant-notification-notice')).toHaveLength(1)

    notification.destroy()
    expect(document.body.querySelectorAll('.ant-notification-notice')).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run Notification tests and verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- notification/__tests__/notification.test.tsx
```

Expected: FAIL because `notification` does not exist.

- [ ] **Step 3: Add Notification types**

Create `packages/components/src/notification/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type NotificationType = 'success' | 'info' | 'warning' | 'error'
export type NotificationPlacement = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'

export interface NotificationArgs {
  key?: string
  type?: NotificationType
  message: JSX.Element
  description?: JSX.Element
  duration?: number
  placement?: NotificationPlacement
  onClose?: () => void
}

export interface NotificationNotice extends NotificationArgs {
  key: string
  type?: NotificationType
  placement: NotificationPlacement
}

export interface NotificationHandle {
  close: () => void
}

export interface NotificationInstance {
  open: (args: NotificationArgs) => NotificationHandle
  success: (args: NotificationArgs) => NotificationHandle
  info: (args: NotificationArgs) => NotificationHandle
  warning: (args: NotificationArgs) => NotificationHandle
  error: (args: NotificationArgs) => NotificationHandle
  destroy: (key?: string) => void
}
```

- [ ] **Step 4: Add Notification styles**

Create `packages/components/src/notification/notification.style.ts`:

```ts
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useNotificationStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Notification', prefixCls] },
    () => {
      const t = token()
      const nt = getComponentToken('Notification', t)
      const placementBase = { position: 'fixed', 'z-index': 1010 }
      return {
        [`.${prefixCls}-top-right`]: { ...placementBase, top: 24, right: 24 },
        [`.${prefixCls}-top-left`]: { ...placementBase, top: 24, left: 24 },
        [`.${prefixCls}-bottom-right`]: { ...placementBase, bottom: 24, right: 24 },
        [`.${prefixCls}-bottom-left`]: { ...placementBase, bottom: 24, left: 24 },
        [`.${prefixCls}-notice`]: {
          position: 'relative',
          width: nt.width,
          padding: nt.padding,
          'margin-bottom': t.margin,
          color: t.colorText,
          background: nt.bg,
          'border-radius': nt.borderRadius,
          'box-shadow': nt.boxShadow,
        },
        [`.${prefixCls}-notice-message`]: { 'font-weight': 600, 'padding-inline-end': 24 },
        [`.${prefixCls}-notice-description`]: {
          color: t.colorTextSecondary,
          'margin-top': t.marginXS,
        },
        [`.${prefixCls}-notice-close`]: {
          position: 'absolute',
          top: t.paddingSM,
          right: t.paddingSM,
          border: 0,
          background: 'transparent',
          cursor: 'pointer',
          color: t.colorTextSecondary,
        },
        [`.${prefixCls}-notice-success .${prefixCls}-notice-message`]: { color: t.colorSuccess },
        [`.${prefixCls}-notice-info .${prefixCls}-notice-message`]: { color: t.colorInfo },
        [`.${prefixCls}-notice-warning .${prefixCls}-notice-message`]: { color: t.colorWarning },
        [`.${prefixCls}-notice-error .${prefixCls}-notice-message`]: { color: t.colorError },
      }
    },
  )
}
```

- [ ] **Step 5: Add Notification holder and API**

Create `packages/components/src/notification/holder.tsx`:

```tsx
import { For } from 'solid-js'
import { render } from 'solid-js/web'
import { ConfigProvider, useConfig } from '../config-provider'
import { InternalPortal } from '../shared/portal'
import { classNames } from '../shared/class-names'
import { useNotificationStyle } from './notification.style'
import type { Accessor } from 'solid-js'
import type { NotificationNotice, NotificationPlacement } from './interface'

export interface NotificationHolderProps {
  notices: Accessor<NotificationNotice[]>
  close: (key: string) => void
}

const placements: NotificationPlacement[] = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
const classByPlacement: Record<NotificationPlacement, string> = {
  topLeft: 'top-left',
  topRight: 'top-right',
  bottomLeft: 'bottom-left',
  bottomRight: 'bottom-right',
}

function NotificationHolder(props: NotificationHolderProps) {
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-notification`
  const [, hashId] = useNotificationStyle(prefixCls())
  const byPlacement = (placement: NotificationPlacement) =>
    props.notices().filter((item) => item.placement === placement)
  return (
    <InternalPortal>
      <For each={placements}>
        {(placement) => (
          <div class={classNames(`${prefixCls()}-${classByPlacement[placement]}`, hashId())}>
            <For each={byPlacement(placement)}>
              {(notice) => (
                <div
                  class={classNames(
                    `${prefixCls()}-notice`,
                    notice.type && `${prefixCls()}-notice-${notice.type}`,
                  )}
                >
                  <button
                    type="button"
                    class={`${prefixCls()}-notice-close`}
                    aria-label="close notification"
                    onClick={() => props.close(notice.key)}
                  >
                    ×
                  </button>
                  <div class={`${prefixCls()}-notice-message`}>{notice.message}</div>
                  <div class={`${prefixCls()}-notice-description`}>{notice.description}</div>
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </InternalPortal>
  )
}

export function mountNotificationHolder(props: NotificationHolderProps) {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const dispose = render(
    () => (
      <ConfigProvider>
        <NotificationHolder {...props} />
      </ConfigProvider>
    ),
    container,
  )
  return () => {
    dispose()
    container.remove()
  }
}
```

Create `packages/components/src/notification/notification.ts`:

```ts
import { createRoot, createSignal } from 'solid-js'
import { mountNotificationHolder } from './holder'
import type {
  NotificationArgs,
  NotificationHandle,
  NotificationInstance,
  NotificationNotice,
  NotificationType,
} from './interface'

let seed = 0
let disposeRoot: (() => void) | undefined
let setNotices:
  | ((
      updater: NotificationNotice[] | ((value: NotificationNotice[]) => NotificationNotice[]),
    ) => NotificationNotice[])
  | undefined
const timers = new Map<string, ReturnType<typeof setTimeout>>()

function ensureHolder() {
  if (setNotices) return
  disposeRoot = createRoot((dispose) => {
    const [notices, nextNotices] = createSignal<NotificationNotice[]>([])
    setNotices = nextNotices
    const unmount = mountNotificationHolder({ notices, close: remove })
    return () => {
      unmount()
      dispose()
    }
  })
}

function remove(key: string) {
  const timer = timers.get(key)
  if (timer) clearTimeout(timer)
  timers.delete(key)
  setNotices?.((items) => items.filter((item) => item.key !== key))
}

function open(args: NotificationArgs): NotificationHandle {
  ensureHolder()
  const key = args.key ?? `notification-${++seed}`
  const notice: NotificationNotice = { ...args, key, placement: args.placement ?? 'topRight' }
  setNotices?.((items) => {
    const index = items.findIndex((item) => item.key === key)
    if (index === -1) return [...items, notice]
    const next = [...items]
    next[index] = notice
    return next
  })

  const oldTimer = timers.get(key)
  if (oldTimer) clearTimeout(oldTimer)
  timers.delete(key)

  const duration = args.duration ?? 4.5
  if (duration > 0) {
    timers.set(
      key,
      setTimeout(() => {
        remove(key)
        args.onClose?.()
      }, duration * 1000),
    )
  }

  return { close: () => remove(key) }
}

function typed(type: NotificationType, args: NotificationArgs) {
  return open({ ...args, type })
}

export const notification: NotificationInstance = {
  open,
  success: (args) => typed('success', args),
  info: (args) => typed('info', args),
  warning: (args) => typed('warning', args),
  error: (args) => typed('error', args),
  destroy: (key?: string) => {
    if (key) {
      remove(key)
      return
    }
    timers.forEach((timer) => clearTimeout(timer))
    timers.clear()
    setNotices?.([])
    disposeRoot?.()
    disposeRoot = undefined
    setNotices = undefined
  },
}
```

Create `packages/components/src/notification/index.ts`:

```ts
export * from './interface'
export * from './notification'
```

Append to `packages/components/src/index.ts`:

```ts
export * from './notification'
```

- [ ] **Step 6: Run Notification tests and verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- notification/__tests__/notification.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit Notification**

```bash
git add packages/components/src/notification packages/components/src/index.ts
git commit -m "feat: add notification api"
```

### Task 6: Implement Modal and Modal static methods

**Files:**

- Create: `packages/components/src/modal/interface.ts`
- Create: `packages/components/src/modal/modal.style.ts`
- Create: `packages/components/src/modal/modal.tsx`
- Create: `packages/components/src/modal/confirm.tsx`
- Create: `packages/components/src/modal/modal-method.ts`
- Create: `packages/components/src/modal/index.ts`
- Create: `packages/components/src/modal/__tests__/modal.test.tsx`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: Add failing Modal tests**

Create `packages/components/src/modal/__tests__/modal.test.tsx`:

```tsx
import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSignal } from 'solid-js'
import { Modal } from '../index'

describe('Modal', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
    Modal.destroyAll?.()
  })

  afterEach(() => {
    Modal.destroyAll?.()
  })

  it('renders title body and default footer when open', () => {
    const onOk = vi.fn()
    const onCancel = vi.fn()
    render(() => (
      <Modal open title="Title" onOk={onOk} onCancel={onCancel}>
        Body
      </Modal>
    ))

    expect(document.body).toHaveTextContent('Title')
    expect(document.body).toHaveTextContent('Body')

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>('.ant-modal-footer .ant-btn-primary')!,
    )
    expect(onOk).toHaveBeenCalledTimes(1)

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>(
        '.ant-modal-footer .ant-btn:not(.ant-btn-primary)',
      )!,
    )
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('respects maskClosable and keyboard', () => {
    const onCancel = vi.fn()
    render(() => (
      <Modal open title="Locked" maskClosable={false} keyboard={false} onCancel={onCancel}>
        Body
      </Modal>
    ))

    fireEvent.click(document.body.querySelector('.ant-modal-mask')!)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onCancel).not.toHaveBeenCalled()
  })

  it('locks body scroll while open', () => {
    const [open, setOpen] = createSignal(true)
    render(() => (
      <Modal open={open()} title="Scroll" afterClose={() => {}}>
        Body
      </Modal>
    ))
    expect(document.body.style.overflow).toBe('hidden')

    setOpen(false)
    expect(document.body.style.overflow).toBe('')
  })

  it('creates updates and destroys confirm modal', () => {
    const instance = Modal.confirm({ title: 'Confirm', content: 'Delete?' })
    expect(document.body).toHaveTextContent('Confirm')

    instance.update({ title: 'Updated' })
    expect(document.body).not.toHaveTextContent('Confirm')
    expect(document.body).toHaveTextContent('Updated')

    instance.destroy()
    expect(document.body).not.toHaveTextContent('Updated')
  })

  it('keeps confirm modal open while async onOk resolves', async () => {
    let resolve!: () => void
    const promise = new Promise<void>((next) => {
      resolve = next
    })
    Modal.confirm({ title: 'Async', onOk: () => promise })

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>('.ant-modal-footer .ant-btn-primary')!,
    )
    expect(document.body).toHaveTextContent('Async')

    resolve()
    await waitFor(() => expect(document.body).not.toHaveTextContent('Async'))
  })
})
```

- [ ] **Step 2: Run Modal tests and verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- modal/__tests__/modal.test.tsx
```

Expected: FAIL because `Modal` does not exist.

- [ ] **Step 3: Add Modal types**

Create `packages/components/src/modal/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export interface ModalProps {
  open?: boolean
  title?: JSX.Element
  footer?: JSX.Element | null
  okText?: JSX.Element
  cancelText?: JSX.Element
  confirmLoading?: boolean
  closable?: boolean
  mask?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  centered?: boolean
  width?: number | string
  zIndex?: number
  onOk?: () => void | Promise<void>
  onCancel?: () => void
  afterClose?: () => void
  children?: JSX.Element
  class?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties
}

export type ModalFuncType = 'info' | 'success' | 'error' | 'warning' | 'confirm'

export interface ModalFuncProps {
  type?: ModalFuncType
  title?: JSX.Element
  content?: JSX.Element
  okText?: JSX.Element
  cancelText?: JSX.Element
  closable?: boolean
  maskClosable?: boolean
  keyboard?: boolean
  width?: number | string
  onOk?: () => void | Promise<void>
  onCancel?: () => void
}

export interface ModalFuncReturn {
  destroy: () => void
  update: (config: Partial<ModalFuncProps>) => void
}

export interface ModalStaticMethods {
  confirm: (config: ModalFuncProps) => ModalFuncReturn
  info: (config: ModalFuncProps) => ModalFuncReturn
  success: (config: ModalFuncProps) => ModalFuncReturn
  error: (config: ModalFuncProps) => ModalFuncReturn
  warning: (config: ModalFuncProps) => ModalFuncReturn
  destroyAll: () => void
}

export type ModalComponent = ((props: ModalProps) => JSX.Element) & ModalStaticMethods
```

- [ ] **Step 4: Add Modal styles**

Create `packages/components/src/modal/modal.style.ts` with mask, wrap, content, header, body, footer, close, and confirm status styles:

```ts
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function useModalStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister({ theme: 'default', token: token(), path: ['Modal', prefixCls] }, () => {
    const t = token()
    const mt = getComponentToken('Modal', t)
    return {
      [`.${prefixCls}-root`]: { position: 'relative', 'z-index': 1000 },
      [`.${prefixCls}-mask`]: { position: 'fixed', inset: 0, background: mt.maskBg },
      [`.${prefixCls}-wrap`]: { position: 'fixed', inset: 0, overflow: 'auto', outline: 0 },
      [`.${prefixCls}-centered`]: {
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
      },
      [`.${prefixCls}`]: {
        position: 'relative',
        top: 100,
        margin: '0 auto',
        padding: `0 0 ${t.paddingLG}px`,
        width: 520,
      },
      [`.${prefixCls}-centered .${prefixCls}`]: { top: 0 },
      [`.${prefixCls}-content`]: {
        position: 'relative',
        background: mt.contentBg,
        'border-radius': mt.borderRadius,
        'box-shadow': mt.boxShadow,
      },
      [`.${prefixCls}-header`]: {
        padding: `${t.padding}px ${t.paddingLG}px`,
        background: mt.headerBg,
        'border-radius': `${mt.borderRadius}px ${mt.borderRadius}px 0 0`,
      },
      [`.${prefixCls}-title`]: {
        color: mt.titleColor,
        'font-size': mt.titleFontSize,
        'font-weight': 600,
      },
      [`.${prefixCls}-body`]: { padding: t.paddingLG, color: t.colorText },
      [`.${prefixCls}-footer`]: {
        display: 'flex',
        'justify-content': 'flex-end',
        gap: t.marginSM,
        padding: `${t.paddingSM}px ${t.paddingLG}px ${t.paddingLG}px`,
      },
      [`.${prefixCls}-close`]: {
        position: 'absolute',
        top: t.padding,
        right: t.padding,
        border: 0,
        background: 'transparent',
        cursor: 'pointer',
        color: t.colorTextSecondary,
      },
    }
  })
}
```

- [ ] **Step 5: Add controlled Modal component**

Create `packages/components/src/modal/modal.tsx`:

```tsx
import { Show, createEffect, onCleanup, splitProps } from 'solid-js'
import { Button } from '../button'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { addDocumentKeydown, lockBodyScroll, unlockBodyScroll } from '../shared/overlay'
import { InternalPortal } from '../shared/portal'
import { useModalStyle } from './modal.style'
import type { ModalProps } from './interface'

export function ModalBase(props: ModalProps) {
  const [local] = splitProps(props, [
    'open',
    'title',
    'footer',
    'okText',
    'cancelText',
    'confirmLoading',
    'closable',
    'mask',
    'maskClosable',
    'keyboard',
    'centered',
    'width',
    'zIndex',
    'onOk',
    'onCancel',
    'afterClose',
    'children',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-modal`
  const [, hashId] = useModalStyle(prefixCls())
  let locked = false

  createEffect(() => {
    if (local.open && !locked) {
      lockBodyScroll()
      locked = true
    }
    if (!local.open && locked) {
      unlockBodyScroll()
      locked = false
      local.afterClose?.()
    }
  })

  const cleanupKeydown = addDocumentKeydown((event) => {
    if (event.key === 'Escape' && local.open && (local.keyboard ?? true)) local.onCancel?.()
  })

  onCleanup(() => {
    cleanupKeydown()
    if (locked) unlockBodyScroll()
  })

  const widthStyle = () =>
    local.width === undefined
      ? undefined
      : typeof local.width === 'number'
        ? `${local.width}px`
        : local.width
  const rootStyle = () => ({ 'z-index': local.zIndex, ...(local.style ?? {}) })

  return (
    <Show when={local.open}>
      <InternalPortal>
        <div class={classNames(`${prefixCls()}-root`, hashId())} style={rootStyle()}>
          <Show when={local.mask ?? true}>
            <div
              class={`${prefixCls()}-mask`}
              onClick={() => {
                if (local.maskClosable ?? true) local.onCancel?.()
              }}
            />
          </Show>
          <div
            class={classNames(`${prefixCls()}-wrap`, local.centered && `${prefixCls()}-centered`)}
            role="dialog"
            aria-modal="true"
          >
            <div
              class={classNames(prefixCls(), local.class)}
              classList={local.classList}
              style={{ width: widthStyle() }}
            >
              <div class={`${prefixCls()}-content`}>
                <Show when={local.closable ?? true}>
                  <button
                    type="button"
                    class={`${prefixCls()}-close`}
                    aria-label="close modal"
                    onClick={() => local.onCancel?.()}
                  >
                    ×
                  </button>
                </Show>
                <Show when={local.title}>
                  <div class={`${prefixCls()}-header`}>
                    <div class={`${prefixCls()}-title`}>{local.title}</div>
                  </div>
                </Show>
                <div class={`${prefixCls()}-body`}>{local.children}</div>
                <Show when={local.footer !== null}>
                  <div class={`${prefixCls()}-footer`}>
                    {local.footer ?? (
                      <>
                        <Button onClick={() => local.onCancel?.()}>
                          {local.cancelText ?? 'Cancel'}
                        </Button>
                        <Button
                          type="primary"
                          loading={local.confirmLoading}
                          onClick={() => local.onOk?.()}
                        >
                          {local.okText ?? 'OK'}
                        </Button>
                      </>
                    )}
                  </div>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </InternalPortal>
    </Show>
  )
}
```

- [ ] **Step 6: Add confirm renderer and static methods**

Create `packages/components/src/modal/confirm.tsx`:

```tsx
import { createSignal } from 'solid-js'
import { ModalBase } from './modal'
import type { ModalFuncProps } from './interface'

export interface ConfirmDialogProps {
  config: ModalFuncProps
  close: () => void
}

export function ConfirmDialog(props: ConfirmDialogProps) {
  const [loading, setLoading] = createSignal(false)
  const type = () => props.config.type ?? 'confirm'
  const handleOk = async () => {
    const result = props.config.onOk?.()
    if (result && typeof (result as Promise<void>).then === 'function') {
      setLoading(true)
      try {
        await result
        props.close()
      } catch {
        setLoading(false)
      }
      return
    }
    props.close()
  }
  const handleCancel = () => {
    props.config.onCancel?.()
    props.close()
  }
  return (
    <ModalBase
      open
      title={props.config.title}
      width={props.config.width}
      closable={props.config.closable ?? false}
      maskClosable={props.config.maskClosable ?? false}
      keyboard={props.config.keyboard}
      confirmLoading={loading()}
      okText={props.config.okText}
      cancelText={props.config.cancelText}
      footer={type() === 'confirm' ? undefined : null}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      {props.config.content}
      {type() !== 'confirm' && (
        <div class="ant-modal-footer">
          <button type="button" class="ant-btn ant-btn-primary" onClick={handleOk}>
            {props.config.okText ?? 'OK'}
          </button>
        </div>
      )}
    </ModalBase>
  )
}
```

Create `packages/components/src/modal/modal-method.ts`:

```ts
import { createRoot, createSignal } from 'solid-js'
import { render } from 'solid-js/web'
import { ConfigProvider } from '../config-provider'
import { ConfirmDialog } from './confirm'
import type { ModalFuncProps, ModalFuncReturn, ModalFuncType } from './interface'

const instances = new Set<ModalFuncReturn>()

function openConfirm(config: ModalFuncProps): ModalFuncReturn {
  const container = document.createElement('div')
  document.body.appendChild(container)
  let disposeRoot: (() => void) | undefined
  let setConfig!: (value: ModalFuncProps) => ModalFuncProps

  const destroy = () => {
    disposeRoot?.()
    container.remove()
    instances.delete(instance)
  }

  disposeRoot = createRoot((dispose) => {
    const [current, nextConfig] = createSignal(config)
    setConfig = nextConfig
    const disposeRender = render(() => <ConfigProvider><ConfirmDialog config={current()} close={destroy} /></ConfigProvider>, container)
    return () => {
      disposeRender()
      dispose()
    }
  })

  const instance: ModalFuncReturn = {
    destroy,
    update: (next) => setConfig({ ...config, ...next }),
  }
  instances.add(instance)
  return instance
}

function typed(type: ModalFuncType, config: ModalFuncProps) {
  return openConfirm({ ...config, type })
}

export const modalStaticMethods = {
  confirm: (config: ModalFuncProps) => typed('confirm', config),
  info: (config: ModalFuncProps) => typed('info', config),
  success: (config: ModalFuncProps) => typed('success', config),
  error: (config: ModalFuncProps) => typed('error', config),
  warning: (config: ModalFuncProps) => typed('warning', config),
  destroyAll: () => {
    Array.from(instances).forEach((instance) => instance.destroy())
  },
}
```

Create `packages/components/src/modal/index.ts`:

```ts
import { ModalBase } from './modal'
import { modalStaticMethods } from './modal-method'
import type { ModalComponent } from './interface'

export * from './interface'
export const Modal = Object.assign(ModalBase, modalStaticMethods) as ModalComponent
```

Append to `packages/components/src/index.ts`:

```ts
export * from './modal'
```

- [ ] **Step 7: Run Modal tests and verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- modal/__tests__/modal.test.tsx
```

Expected: PASS.

- [ ] **Step 8: Commit Modal**

```bash
git add packages/components/src/modal packages/components/src/index.ts
git commit -m "feat: add modal component and methods"
```

### Task 7: Implement Popconfirm

**Files:**

- Create: `packages/components/src/popconfirm/interface.ts`
- Create: `packages/components/src/popconfirm/popconfirm.style.ts`
- Create: `packages/components/src/popconfirm/popconfirm.tsx`
- Create: `packages/components/src/popconfirm/index.ts`
- Create: `packages/components/src/popconfirm/__tests__/popconfirm.test.tsx`
- Modify: `packages/components/src/index.ts`

- [ ] **Step 1: Add failing Popconfirm tests**

Create `packages/components/src/popconfirm/__tests__/popconfirm.test.tsx`:

```tsx
import { fireEvent, render, waitFor } from '@solidjs/testing-library'
import { describe, expect, it, vi } from 'vitest'
import { createSignal } from 'solid-js'
import { Button } from '../../button'
import { Popconfirm } from '../index'

describe('Popconfirm', () => {
  it('opens from trigger and confirms', () => {
    const onConfirm = vi.fn()
    const result = render(() => (
      <Popconfirm title="Delete?" onConfirm={onConfirm}>
        <Button>Delete</Button>
      </Popconfirm>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Delete' }))
    expect(document.body).toHaveTextContent('Delete?')

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>('.ant-popconfirm-buttons .ant-btn-primary')!,
    )
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(document.body).not.toHaveTextContent('Delete?')
  })

  it('cancels and closes', () => {
    const onCancel = vi.fn()
    const result = render(() => (
      <Popconfirm title="Cancel?" onCancel={onCancel}>
        <Button>Open</Button>
      </Popconfirm>
    ))

    fireEvent.click(result.getByRole('button', { name: 'Open' }))
    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>(
        '.ant-popconfirm-buttons .ant-btn:not(.ant-btn-primary)',
      )!,
    )

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(document.body).not.toHaveTextContent('Cancel?')
  })

  it('supports controlled open', () => {
    const [open, setOpen] = createSignal(true)
    render(() => (
      <Popconfirm open={open()} onOpenChange={setOpen} title="Controlled">
        <Button>Trigger</Button>
      </Popconfirm>
    ))
    expect(document.body).toHaveTextContent('Controlled')

    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>(
        '.ant-popconfirm-buttons .ant-btn:not(.ant-btn-primary)',
      )!,
    )
    expect(open()).toBe(false)
  })

  it('does not open when disabled', () => {
    const result = render(() => (
      <Popconfirm disabled title="Disabled">
        <Button>Trigger</Button>
      </Popconfirm>
    ))
    fireEvent.click(result.getByRole('button', { name: 'Trigger' }))
    expect(document.body).not.toHaveTextContent('Disabled')
  })

  it('keeps open when async confirm rejects', async () => {
    const result = render(() => (
      <Popconfirm title="Async" onConfirm={() => Promise.reject(new Error('fail'))}>
        <Button>Trigger</Button>
      </Popconfirm>
    ))
    fireEvent.click(result.getByRole('button', { name: 'Trigger' }))
    fireEvent.click(
      document.body.querySelector<HTMLButtonElement>('.ant-popconfirm-buttons .ant-btn-primary')!,
    )
    await waitFor(() => expect(document.body).toHaveTextContent('Async'))
  })
})
```

- [ ] **Step 2: Run Popconfirm tests and verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- popconfirm/__tests__/popconfirm.test.tsx
```

Expected: FAIL because `Popconfirm` does not exist.

- [ ] **Step 3: Add Popconfirm types and styles**

Create `packages/components/src/popconfirm/interface.ts`:

```ts
import type { JSX } from 'solid-js'

export type PopconfirmPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface PopconfirmProps {
  title?: JSX.Element
  description?: JSX.Element
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  placement?: PopconfirmPlacement
  okText?: JSX.Element
  cancelText?: JSX.Element
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  onOpenChange?: (open: boolean) => void
  children: JSX.Element
}
```

Create `packages/components/src/popconfirm/popconfirm.style.ts`:

```ts
import { useStyleRegister } from '@solid-ant-design/cssinjs'
import { getComponentToken } from '@solid-ant-design/theme'
import { useToken } from '../config-provider'

export function usePopconfirmStyle(prefixCls: string) {
  const token = useToken()
  return useStyleRegister(
    { theme: 'default', token: token(), path: ['Popconfirm', prefixCls] },
    () => {
      const t = token()
      const pt = getComponentToken('Popconfirm', t)
      return {
        [`.${prefixCls}`]: {
          position: 'fixed',
          width: pt.width,
          padding: pt.padding,
          color: t.colorText,
          background: pt.bg,
          'border-radius': pt.borderRadius,
          'box-shadow': pt.boxShadow,
          'z-index': 1030,
        },
        [`.${prefixCls}-title`]: { 'font-weight': 600 },
        [`.${prefixCls}-description`]: { color: t.colorTextSecondary, 'margin-top': t.marginXS },
        [`.${prefixCls}-buttons`]: {
          display: 'flex',
          'justify-content': 'flex-end',
          gap: t.marginSM,
          'margin-top': t.margin,
        },
      }
    },
  )
}
```

- [ ] **Step 4: Add Popconfirm component and exports**

Create `packages/components/src/popconfirm/popconfirm.tsx`:

```tsx
import { Show, createMemo, createSignal } from 'solid-js'
import { Button } from '../button'
import { useConfig } from '../config-provider'
import { InternalPortal } from '../shared/portal'
import { classNames } from '../shared/class-names'
import { usePopconfirmStyle } from './popconfirm.style'
import type { PopconfirmProps } from './interface'

export function Popconfirm(props: PopconfirmProps) {
  const [innerOpen, setInnerOpen] = createSignal(props.defaultOpen ?? false)
  const [trigger, setTrigger] = createSignal<HTMLElement>()
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-popconfirm`
  const [, hashId] = usePopconfirmStyle(prefixCls())
  const mergedOpen = () => props.open ?? innerOpen()
  const placement = () => props.placement ?? 'top'
  const setOpen = (next: boolean) => {
    if (props.open === undefined) setInnerOpen(next)
    props.onOpenChange?.(next)
  }
  const position = createMemo(() => {
    const rect = trigger()?.getBoundingClientRect()
    if (!rect) return { top: '0px', left: '0px' }
    if (placement() === 'bottom') return { top: `${rect.bottom + 8}px`, left: `${rect.left}px` }
    if (placement() === 'left') return { top: `${rect.top}px`, left: `${rect.left - 288}px` }
    if (placement() === 'right') return { top: `${rect.top}px`, left: `${rect.right + 8}px` }
    return { top: `${rect.top - 8}px`, left: `${rect.left}px`, transform: 'translateY(-100%)' }
  })
  const confirm = async () => {
    try {
      await props.onConfirm?.()
      setOpen(false)
    } catch {
      setOpen(true)
    }
  }
  const cancel = () => {
    props.onCancel?.()
    setOpen(false)
  }
  return (
    <>
      <span
        ref={setTrigger}
        onClick={() => {
          if (!props.disabled) setOpen(!mergedOpen())
        }}
      >
        {props.children}
      </span>
      <Show when={mergedOpen()}>
        <InternalPortal>
          <div
            class={classNames(prefixCls(), `${prefixCls()}-${placement()}`, hashId())}
            style={position()}
          >
            <div class={`${prefixCls()}-title`}>{props.title}</div>
            <Show when={props.description}>
              <div class={`${prefixCls()}-description`}>{props.description}</div>
            </Show>
            <div class={`${prefixCls()}-buttons`}>
              <Button size="small" onClick={cancel}>
                {props.cancelText ?? 'Cancel'}
              </Button>
              <Button size="small" type="primary" onClick={confirm}>
                {props.okText ?? 'OK'}
              </Button>
            </div>
          </div>
        </InternalPortal>
      </Show>
    </>
  )
}
```

Create `packages/components/src/popconfirm/index.ts`:

```ts
export * from './interface'
export * from './popconfirm'
```

Append to `packages/components/src/index.ts`:

```ts
export * from './popconfirm'
```

- [ ] **Step 5: Run Popconfirm tests and verify GREEN**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- popconfirm/__tests__/popconfirm.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit Popconfirm**

```bash
git add packages/components/src/popconfirm packages/components/src/index.ts
git commit -m "feat: add popconfirm component"
```

### Task 8: Add docs pages and navigation

**Files:**

- Modify: `apps/docs/src/site/nav.ts`
- Modify: `apps/docs/src/app.tsx`
- Create: `apps/docs/src/pages/alert-page.tsx`
- Create: `apps/docs/src/pages/message-page.tsx`
- Create: `apps/docs/src/pages/notification-page.tsx`
- Create: `apps/docs/src/pages/modal-page.tsx`
- Create: `apps/docs/src/pages/popconfirm-page.tsx`

- [ ] **Step 1: Add docs pages**

Create `apps/docs/src/pages/alert-page.tsx`:

```tsx
import { Alert, Space } from '@solid-ant-design/core'
import { DemoBlock } from '../site/demo-block'

export function AlertPage() {
  return (
    <>
      <h1>Alert</h1>
      <DemoBlock title="Basic" code={`<Alert message="Success" type="success" showIcon />`}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Alert message="Success" type="success" showIcon />
          <Alert message="Info" type="info" showIcon />
          <Alert message="Warning" type="warning" showIcon />
          <Alert message="Error" type="error" showIcon />
        </Space>
      </DemoBlock>
      <DemoBlock
        title="Closable"
        code={`<Alert closable message="Closable" description="More detail" />`}
      >
        <Alert closable message="Closable" description="More detail" />
      </DemoBlock>
    </>
  )
}
```

Create `apps/docs/src/pages/message-page.tsx`:

```tsx
import { Button, Space, message } from '@solid-ant-design/core'
import { DemoBlock } from '../site/demo-block'

export function MessagePage() {
  return (
    <>
      <h1>Message</h1>
      <DemoBlock title="Basic" code={`message.success('Saved')`}>
        <Space>
          <Button onClick={() => message.success('Saved')}>Success</Button>
          <Button onClick={() => message.error('Failed')}>Error</Button>
          <Button onClick={() => message.loading('Loading', 2)}>Loading</Button>
        </Space>
      </DemoBlock>
    </>
  )
}
```

Create `apps/docs/src/pages/notification-page.tsx`:

```tsx
import { Button, Space, notification } from '@solid-ant-design/core'
import { DemoBlock } from '../site/demo-block'

export function NotificationPage() {
  return (
    <>
      <h1>Notification</h1>
      <DemoBlock
        title="Basic"
        code={`notification.success({ message: 'Done', description: 'Task finished' })`}
      >
        <Space>
          <Button
            onClick={() => notification.success({ message: 'Done', description: 'Task finished' })}
          >
            Success
          </Button>
          <Button
            onClick={() => notification.open({ message: 'Bottom left', placement: 'bottomLeft' })}
          >
            Bottom left
          </Button>
        </Space>
      </DemoBlock>
    </>
  )
}
```

Create `apps/docs/src/pages/modal-page.tsx`:

```tsx
import { Button, Modal, Space } from '@solid-ant-design/core'
import { createSignal } from 'solid-js'
import { DemoBlock } from '../site/demo-block'

export function ModalPage() {
  const [open, setOpen] = createSignal(false)
  return (
    <>
      <h1>Modal</h1>
      <DemoBlock title="Basic" code={`<Modal open={open()} title="Basic modal">Content</Modal>`}>
        <Space>
          <Button type="primary" onClick={() => setOpen(true)}>
            Open modal
          </Button>
          <Button onClick={() => Modal.confirm({ title: 'Confirm', content: 'Are you sure?' })}>
            Confirm
          </Button>
        </Space>
        <Modal
          open={open()}
          title="Basic modal"
          onOk={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        >
          Content
        </Modal>
      </DemoBlock>
    </>
  )
}
```

Create `apps/docs/src/pages/popconfirm-page.tsx`:

```tsx
import { Button, Popconfirm, message } from '@solid-ant-design/core'
import { DemoBlock } from '../site/demo-block'

export function PopconfirmPage() {
  return (
    <>
      <h1>Popconfirm</h1>
      <DemoBlock
        title="Basic"
        code={`<Popconfirm title="Delete?" onConfirm={remove}><Button danger>Delete</Button></Popconfirm>`}
      >
        <Popconfirm
          title="Delete?"
          description="This action cannot be undone."
          onConfirm={() => message.success('Deleted')}
        >
          <Button danger>Delete</Button>
        </Popconfirm>
      </DemoBlock>
    </>
  )
}
```

- [ ] **Step 2: Register docs navigation and routes**

In `apps/docs/src/site/nav.ts`, add these entries after `Switch`:

```ts
  { path: '/components/alert', label: 'Alert' },
  { path: '/components/message', label: 'Message' },
  { path: '/components/notification', label: 'Notification' },
  { path: '/components/modal', label: 'Modal' },
  { path: '/components/popconfirm', label: 'Popconfirm' },
```

In `apps/docs/src/app.tsx`, add imports:

```ts
import { AlertPage } from './pages/alert-page'
import { MessagePage } from './pages/message-page'
import { NotificationPage } from './pages/notification-page'
import { ModalPage } from './pages/modal-page'
import { PopconfirmPage } from './pages/popconfirm-page'
```

Add route entries:

```ts
  '/components/alert': AlertPage,
  '/components/message': MessagePage,
  '/components/notification': NotificationPage,
  '/components/modal': ModalPage,
  '/components/popconfirm': PopconfirmPage,
```

- [ ] **Step 3: Run docs typecheck and build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs build
```

Expected: PASS.

- [ ] **Step 4: Commit docs**

```bash
git add apps/docs/src/site/nav.ts apps/docs/src/app.tsx apps/docs/src/pages/alert-page.tsx apps/docs/src/pages/message-page.tsx apps/docs/src/pages/notification-page.tsx apps/docs/src/pages/modal-page.tsx apps/docs/src/pages/popconfirm-page.tsx
git commit -m "docs: add feedback component pages"
```

### Task 9: Run full verification and fix integration issues

**Files:**

- Modify only files changed in Tasks 1-8 if verification reports specific failures.

- [ ] **Step 1: Run lint**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: PASS. If it fails, fix the exact reported lint violations and rerun the command until it passes.

- [ ] **Step 2: Run format check**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: PASS. If it fails, run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format
```

Then rerun:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: PASS.

- [ ] **Step 3: Run recursive typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: PASS. If it fails, fix the exact TypeScript errors and rerun the command until it passes.

- [ ] **Step 4: Run recursive tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: PASS. If it fails, fix the exact failing tests and rerun the command until it passes.

- [ ] **Step 5: Run recursive build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: PASS. If it fails, fix the exact build errors and rerun the command until it passes.

- [ ] **Step 6: Check TypeScript source file names**

Run:

```bash
find apps packages -type f \( -name '*.ts' -o -name '*.tsx' \) | grep -E '/[^/]*[A-Z_][^/]*\.tsx?$' || true
```

Expected: no output. If any file path is printed, rename it using `git mv` with a temporary intermediate path when changing only case.

- [ ] **Step 7: Commit verification fixes**

If Steps 1-6 required fixes, commit them:

```bash
git add apps packages
git commit -m "chore: fix feedback component integration"
```

If there were no fixes, do not create an empty commit.
