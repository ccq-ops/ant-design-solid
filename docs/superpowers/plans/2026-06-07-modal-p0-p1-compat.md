# Modal P0/P1 Compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the agreed P0/P1 Ant Design compatibility APIs for the Solid Modal component.

**Architecture:** Extend the existing Modal subsystem in place. Public API types live in `interface.ts`, regular modal behavior lives in `modal.tsx`, static method dialog adaptation lives in `confirm.tsx`, imperative lifecycle lives in `modal-method.ts`, and targeted style support lives in `modal.style.ts`.

**Tech Stack:** SolidJS, TypeScript, Vitest, `@solidjs/testing-library`, existing `Button`, `InternalPortal`, and Modal style system.

---

## File structure

- Modify: `packages/components/src/modal/interface.ts`
  - Add P0/P1 public types and extend `ModalProps`, `ModalFuncProps`, and `ModalFuncReturn`.
- Modify: `packages/components/src/modal/modal.tsx`
  - Implement regular Modal P0/P1 behavior.
- Modify: `packages/components/src/modal/confirm.tsx`
  - Pass static method config into `ModalBase`, render static icon/content/footer, and support close callback handlers.
- Modify: `packages/components/src/modal/modal-method.ts`
  - Support function-form `update`, pass close lifecycle to static dialogs, and guarantee static `afterClose` once.
- Modify: `packages/components/src/modal/modal.style.ts`
  - Add hidden, mask blur, loading, and confirm icon layout styles.
- Modify: `packages/components/src/modal/__tests__/modal.test.tsx`
  - Add failing tests before each behavior implementation.

## Commands

Use the modal test file for each red/green cycle:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm vitest run packages/components/src/modal/__tests__/modal.test.tsx
```

If this command does not match the repo setup, inspect `package.json` and use the equivalent Vitest run command for this exact test file.

## Task 1: Extend Modal API types

**Files:**
- Modify: `packages/components/src/modal/interface.ts`
- Test: `packages/components/src/modal/__tests__/modal.test.tsx`

- [ ] **Step 1: Write failing type/usage tests**

Append this test near the end of `packages/components/src/modal/__tests__/modal.test.tsx`:

```tsx
  it('accepts P0 and P1 modal api props at runtime', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const afterOpenChange = vi.fn()

    render(() => (
      <Modal
        open
        title="Compat"
        className="compat-modal"
        wrapClassName="compat-wrap"
        okType="default"
        okButtonProps={{ danger: true, class: 'ok-extra' }}
        cancelButtonProps={{ disabled: true, class: 'cancel-extra' }}
        closeIcon={<span data-testid="custom-close">x</span>}
        mask={{ enabled: true, blur: true, closable: false }}
        closable={{ closeIcon: <span data-testid="object-close">close</span> }}
        classNames={{ body: 'compat-body' }}
        styles={{ body: { color: 'red' } }}
        getContainer={container}
        modalRender={(node) => <section data-testid="modal-render">{node}</section>}
        forceRender
        destroyOnHidden={false}
        afterOpenChange={afterOpenChange}
        loading
      >
        Body
      </Modal>
    ))

    expect(container).toHaveTextContent('Compat')
    expect(container.querySelector('.compat-modal')).toBeTruthy()
    expect(container.querySelector('.compat-wrap')).toBeTruthy()
    expect(container.querySelector('.compat-body')).toBeTruthy()
    expect(container.querySelector<HTMLElement>('.compat-body')!.style.color).toBe('red')
    expect(container.querySelector('[data-testid="modal-render"]')).toBeTruthy()
    expect(container.querySelector('[data-testid="object-close"]')).toBeTruthy()
    expect(container.querySelector('.ads-modal-mask-blur')).toBeTruthy()
    expect(container.querySelector('.ads-modal-loading')).toBeTruthy()
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm vitest run packages/components/src/modal/__tests__/modal.test.tsx
```

Expected: TypeScript/runtime failure because new props like `okButtonProps`, object `mask`, object `closable`, `classNames`, `styles`, `getContainer`, `modalRender`, `forceRender`, `destroyOnHidden`, `afterOpenChange`, and `loading` are not implemented.

- [ ] **Step 3: Extend `interface.ts`**

Update `packages/components/src/modal/interface.ts` to define the public shapes:

```ts
import type { JSX } from 'solid-js'
import type { ButtonProps, ButtonType } from '../button'

export type ModalSemanticName =
  | 'root'
  | 'mask'
  | 'wrap'
  | 'modal'
  | 'content'
  | 'header'
  | 'title'
  | 'body'
  | 'footer'
  | 'close'

export type ModalClassNames = Partial<Record<ModalSemanticName, string>>
export type ModalStyles = Partial<Record<ModalSemanticName, JSX.CSSProperties>>

export interface ModalMaskConfig {
  enabled?: boolean
  blur?: boolean
  closable?: boolean
}

export interface ModalClosableConfig {
  closeIcon?: JSX.Element
  disabled?: boolean
  onClose?: () => void
  afterClose?: () => void
}

export type ModalGetContainer = HTMLElement | (() => HTMLElement | undefined) | string | false

export interface ModalFooterRenderExtra {
  OkBtn: () => JSX.Element
  CancelBtn: () => JSX.Element
}

export type ModalFooterRender = (
  originNode: JSX.Element,
  extra: ModalFooterRenderExtra,
) => JSX.Element

export type ModalFooter = JSX.Element | ModalFooterRender | null

export interface ModalProps {
  open?: boolean
  title?: JSX.Element
  footer?: ModalFooter
  okText?: JSX.Element
  cancelText?: JSX.Element
  confirmLoading?: boolean
  closable?: boolean | ModalClosableConfig
  closeIcon?: JSX.Element
  mask?: boolean | ModalMaskConfig
  maskClosable?: boolean
  keyboard?: boolean
  centered?: boolean
  width?: number | string
  zIndex?: number
  okType?: ButtonType
  okButtonProps?: ButtonProps
  cancelButtonProps?: ButtonProps
  destroyOnHidden?: boolean
  forceRender?: boolean
  getContainer?: ModalGetContainer
  modalRender?: (node: JSX.Element) => JSX.Element
  afterOpenChange?: (open: boolean) => void
  loading?: boolean
  className?: string
  wrapClassName?: string
  classNames?: ModalClassNames
  styles?: ModalStyles
  onOk?: () => void | Promise<void>
  onCancel?: () => void
  afterClose?: () => void
  children?: JSX.Element
  class?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties
  'aria-label'?: string
  'aria-labelledby'?: string
}

export type ModalFuncType = 'info' | 'success' | 'error' | 'warning' | 'confirm'
export type ModalFuncClose = () => void

export interface ModalFuncProps {
  type?: ModalFuncType
  title?: JSX.Element
  content?: JSX.Element
  okText?: JSX.Element
  cancelText?: JSX.Element
  closable?: boolean | ModalClosableConfig
  closeIcon?: JSX.Element
  mask?: boolean | ModalMaskConfig
  maskClosable?: boolean
  keyboard?: boolean
  centered?: boolean
  width?: number | string
  zIndex?: number
  style?: JSX.CSSProperties
  className?: string
  wrapClassName?: string
  classNames?: ModalClassNames
  styles?: ModalStyles
  okType?: ButtonType
  okButtonProps?: ButtonProps
  cancelButtonProps?: ButtonProps
  footer?: ModalFooter
  icon?: JSX.Element
  afterClose?: () => void
  getContainer?: ModalGetContainer
  modalRender?: (node: JSX.Element) => JSX.Element
  destroyOnHidden?: boolean
  forceRender?: boolean
  onOk?: (close?: ModalFuncClose) => void | Promise<void>
  onCancel?: (close?: ModalFuncClose) => void | Promise<void>
}

export type ModalFuncUpdate =
  | Partial<ModalFuncProps>
  | ((prevConfig: ModalFuncProps) => Partial<ModalFuncProps>)

export interface ModalFuncReturn {
  destroy: () => void
  update: (config: ModalFuncUpdate) => void
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

- [ ] **Step 4: Run test to verify it still fails at runtime**

Run the modal test command. Expected: the new test still fails because runtime behavior is missing.

## Task 2: Implement regular Modal P0/P1 rendering

**Files:**
- Modify: `packages/components/src/modal/modal.tsx`
- Modify: `packages/components/src/modal/modal.style.ts`
- Test: `packages/components/src/modal/__tests__/modal.test.tsx`

- [ ] **Step 1: Add focused failing tests**

Add these tests to `modal.test.tsx`:

```tsx
  it('applies button props okType className and wrapClassName', () => {
    render(() => (
      <Modal
        open
        title="Buttons"
        className="dialog-class"
        wrapClassName="wrap-class"
        okType="default"
        okButtonProps={{ danger: true, class: 'ok-extra' }}
        cancelButtonProps={{ disabled: true, class: 'cancel-extra' }}
      >
        Body
      </Modal>
    ))

    expect(document.body.querySelector('.dialog-class')).toBeTruthy()
    expect(document.body.querySelector('.wrap-class')).toBeTruthy()
    expect(document.body.querySelector('.ok-extra')).toBeTruthy()
    expect(document.body.querySelector('.ok-extra')!.className).not.toContain('ads-btn-primary')
    expect(document.body.querySelector('.ok-extra')!.className).toContain('ads-btn-dangerous')
    expect(document.body.querySelector<HTMLButtonElement>('.cancel-extra')!.disabled).toBe(true)
  })

  it('supports object closable custom icon and disabled close', () => {
    const onClose = vi.fn()
    const onCancel = vi.fn()
    render(() => (
      <Modal
        open
        title="Close"
        closable={{
          closeIcon: <span data-testid="close-icon">custom</span>,
          disabled: true,
          onClose,
        }}
        onCancel={onCancel}
      >
        Body
      </Modal>
    ))

    fireEvent.click(document.body.querySelector<HTMLButtonElement>('.ads-modal-close')!)

    expect(document.body.querySelector('[data-testid="close-icon"]')).toBeTruthy()
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('supports object mask visibility blur and closable precedence', () => {
    const onCancel = vi.fn()
    render(() => (
      <Modal open title="Mask" mask={{ enabled: true, blur: true, closable: false }} onCancel={onCancel}>
        Body
      </Modal>
    ))

    expect(document.body.querySelector('.ads-modal-mask')).toBeTruthy()
    expect(document.body.querySelector('.ads-modal-mask-blur')).toBeTruthy()
    fireEvent.click(document.body.querySelector('.ads-modal-wrap')!)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('supports getContainer selector and false inline rendering', () => {
    const host = document.createElement('div')
    host.id = 'modal-host'
    document.body.appendChild(host)

    const inline = render(() => (
      <div data-testid="inline-root">
        <Modal open title="Inline" getContainer={false}>
          Inline body
        </Modal>
      </div>
    ))
    render(() => (
      <Modal open title="Hosted" getContainer="#modal-host">
        Hosted body
      </Modal>
    ))

    expect(host).toHaveTextContent('Hosted')
    expect(inline.container).toHaveTextContent('Inline')
  })

  it('preserves hidden content by default and destroys it with destroyOnHidden', () => {
    const [open, setOpen] = createSignal(true)
    const preserved = render(() => (
      <Modal open={open()} title="Preserved">
        Preserved body
      </Modal>
    ))

    setOpen(false)
    expect(document.body).toHaveTextContent('Preserved body')

    preserved.unmount()
    const [destroyOpen, setDestroyOpen] = createSignal(true)
    render(() => (
      <Modal open={destroyOpen()} destroyOnHidden title="Destroyed">
        Destroyed body
      </Modal>
    ))

    setDestroyOpen(false)
    expect(document.body).not.toHaveTextContent('Destroyed body')
  })

  it('supports forceRender modalRender classNames styles loading and afterOpenChange', () => {
    const [open, setOpen] = createSignal(false)
    const afterOpenChange = vi.fn()
    render(() => (
      <Modal
        open={open()}
        forceRender
        title="Advanced"
        classNames={{ body: 'semantic-body' }}
        styles={{ body: { color: 'blue' } }}
        modalRender={(node) => <section data-testid="wrapped-modal">{node}</section>}
        loading
        afterOpenChange={afterOpenChange}
      >
        Advanced body
      </Modal>
    ))

    expect(document.body).toHaveTextContent('Advanced')
    expect(document.body.querySelector('[data-testid="wrapped-modal"]')).toBeTruthy()
    expect(document.body.querySelector('.semantic-body')).toBeTruthy()
    expect(document.body.querySelector<HTMLElement>('.semantic-body')!.style.color).toBe('blue')
    expect(document.body.querySelector('.ads-modal-loading')).toBeTruthy()

    setOpen(true)
    expect(afterOpenChange).toHaveBeenCalledWith(true)
    setOpen(false)
    expect(afterOpenChange).toHaveBeenCalledWith(false)
  })
```

- [ ] **Step 2: Run test to verify failures**

Run the modal test command. Expected: failures for missing runtime behavior.

- [ ] **Step 3: Implement helper functions in `modal.tsx`**

Add helpers near the top of `modal.tsx`:

```tsx
function isMaskConfig(mask: ModalProps['mask']): mask is ModalMaskConfig {
  return typeof mask === 'object' && mask !== null
}

function isClosableConfig(closable: ModalProps['closable']): closable is ModalClosableConfig {
  return typeof closable === 'object' && closable !== null
}

function isFooterRender(footer: ModalProps['footer']): footer is ModalFooterRender {
  return typeof footer === 'function'
}

function resolveGetContainer(getContainer: ModalProps['getContainer']): HTMLElement | undefined | false {
  if (!canUseDom()) return undefined
  if (getContainer === false) return false
  if (typeof getContainer === 'string') return document.querySelector<HTMLElement>(getContainer) ?? undefined
  if (typeof getContainer === 'function') return getContainer()
  return getContainer
}
```

Update imports to include `createMemo`, `createSignal`, `JSX`, and the new types.

- [ ] **Step 4: Implement rendering behavior in `ModalBase`**

Change `splitProps` to include all new props. Add memos for mask/closable/render state, create `OkBtn`, `CancelBtn`, and `defaultFooter`, and render with optional inline portal. The final behavior must satisfy the tests above while preserving existing tests.

Key implementation requirements:

```tsx
const [hasRendered, setHasRendered] = createSignal(Boolean(local.open || local.forceRender))
createRenderEffect(() => {
  if (local.open || local.forceRender) setHasRendered(true)
})
const shouldRender = () => Boolean(local.open || local.forceRender || (hasRendered() && !local.destroyOnHidden))
const hiddenStyle = () => (local.open ? undefined : { display: 'none' })
const maskEnabled = () => (isMaskConfig(local.mask) ? local.mask.enabled !== false : local.mask !== false)
const maskClosable = () => isMaskConfig(local.mask) && local.mask.closable !== undefined ? local.mask.closable : (local.maskClosable ?? true)
const closeIcon = () => isClosableConfig(local.closable) ? (local.closable.closeIcon ?? local.closeIcon ?? <CloseOutlined />) : (local.closeIcon ?? <CloseOutlined />)
```

The root element style must merge z-index, hidden display, semantic root style, and `local.style`.

The modal dialog class must include `local.class`, `local.className`, and `classNames.modal`.

The wrap class must include `wrapClassName` and `classNames.wrap`.

The body must render either a loading placeholder or children:

```tsx
<Show when={!local.loading} fallback={<div class={`${prefixCls()}-loading`}>Loading...</div>}>
  {local.children}
</Show>
```

- [ ] **Step 5: Implement style additions**

In `modal.style.ts`, add:

```ts
[`.${prefixCls()}-hidden`]: { display: 'none' },
[`.${prefixCls()}-mask-blur`]: { 'backdrop-filter': 'blur(2px)' },
[`.${prefixCls()}-loading`]: { color: t.colorTextSecondary, padding: t.paddingLG, 'text-align': 'center' },
[`.${prefixCls()}-confirm-body`]: { display: 'flex', gap: t.marginSM },
[`.${prefixCls()}-confirm-icon`]: { 'font-size': t.fontSizeLG, 'line-height': 1 },
[`.${prefixCls()}-confirm-message`]: { flex: 1 },
```

- [ ] **Step 6: Run modal tests to verify green**

Run the modal test command. Expected: all modal tests pass.

## Task 3: Implement static method P0/P1 config compatibility

**Files:**
- Modify: `packages/components/src/modal/confirm.tsx`
- Modify: `packages/components/src/modal/modal-method.ts`
- Test: `packages/components/src/modal/__tests__/modal.test.tsx`

- [ ] **Step 1: Add failing static method tests**

Add these tests:

```tsx
  it('passes static method visual and layout config to ModalBase', () => {
    const afterClose = vi.fn()
    const instance = Modal.confirm({
      title: 'Static config',
      content: 'Static body',
      centered: true,
      zIndex: 1555,
      style: { top: '12px' },
      className: 'static-dialog',
      wrapClassName: 'static-wrap',
      okType: 'default',
      okButtonProps: { class: 'static-ok' },
      cancelButtonProps: { class: 'static-cancel' },
      closeIcon: <span data-testid="static-close">close</span>,
      closable: true,
      icon: <span data-testid="static-icon">!</span>,
      footer: <button type="button">custom footer</button>,
      afterClose,
    })

    expect(document.body.querySelector('.static-dialog')).toBeTruthy()
    expect(document.body.querySelector('.static-wrap')).toBeTruthy()
    expect(document.body.querySelector<HTMLElement>('.ads-modal-root')!.style.zIndex).toBe('1555')
    expect(document.body.querySelector<HTMLElement>('.ads-modal-root')!.style.top).toBe('12px')
    expect(document.body.querySelector('[data-testid="static-close"]')).toBeTruthy()
    expect(document.body.querySelector('[data-testid="static-icon"]')).toBeTruthy()
    expect(document.body).toHaveTextContent('custom footer')

    instance.destroy()
    expect(afterClose).toHaveBeenCalledTimes(1)
  })

  it('supports static update function form', () => {
    const instance = Modal.info({ title: 'Before', content: 'Body' })

    instance.update((prev) => ({ title: `${prev.title} After`, content: 'Updated body' }))

    expect(document.body).toHaveTextContent('Before After')
    expect(document.body).toHaveTextContent('Updated body')
    instance.destroy()
  })

  it('passes close function to static onOk and onCancel handlers', () => {
    const onOk = vi.fn((close?: () => void) => close?.())
    Modal.confirm({ title: 'Close from ok', onOk })

    fireEvent.click(document.body.querySelector<HTMLButtonElement>('.ads-modal-footer .ads-btn-primary')!)
    expect(onOk).toHaveBeenCalledTimes(1)
    expect(document.body).not.toHaveTextContent('Close from ok')

    const onCancel = vi.fn((close?: () => void) => close?.())
    Modal.confirm({ title: 'Close from cancel', onCancel })
    fireEvent.click(document.body.querySelector<HTMLButtonElement>('.ads-modal-footer .ads-btn:not(.ads-btn-primary)')!)
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(document.body).not.toHaveTextContent('Close from cancel')
  })
```

- [ ] **Step 2: Run test to verify failures**

Run the modal test command. Expected: static config tests fail.

- [ ] **Step 3: Update `ConfirmDialog`**

In `confirm.tsx`:

- Pass config fields through to `ModalBase`.
- Render icon + content layout.
- Call `props.config.onOk?.(props.close)` and `props.config.onCancel?.(props.close)`.
- Avoid double-destroy errors by relying on idempotent `destroy`.
- Preserve existing promise loading behavior.

The confirm body should be:

```tsx
<div class={`${prefixCls()}-confirm-body`}>
  <Show when={props.config.icon}>
    {(icon) => <span class={`${prefixCls()}-confirm-icon`}>{icon()}</span>}
  </Show>
  <div class={`${prefixCls()}-confirm-message`}>
    <div class={`${prefixCls()}-confirm-content`}>{props.config.content}</div>
  </div>
</div>
```

- [ ] **Step 4: Update `modal-method.ts`**

- Import `ModalFuncUpdate`.
- Change `update` to accept object or function:

```ts
const patch = typeof next === 'function' ? next(currentConfig) : next
currentConfig = { ...currentConfig, ...patch }
```

- Ensure `afterClose` runs once on destroy:

```ts
const afterClose = currentConfig.afterClose
...
afterClose?.()
```

Read `currentConfig.afterClose` at destroy time so updates can change it.

- [ ] **Step 5: Run modal tests to verify green**

Run the modal test command. Expected: all modal tests pass.

## Task 4: Update docs table for Modal P0/P1 APIs

**Files:**
- Modify: `apps/docs/src/pages/components/modal.tsx`

- [ ] **Step 1: Add documentation rows**

Update `modalRows` to include rows for:

```ts
okType
okButtonProps
cancelButtonProps
closeIcon
className
wrapClassName
classNames
styles
destroyOnHidden
forceRender
getContainer
modalRender
afterOpenChange
loading
```

Update `modalFuncRows` to include rows for:

```ts
centered
zIndex
style
className
wrapClassName
okType
okButtonProps
cancelButtonProps
footer
icon
afterClose
getContainer
modalRender
classNames
styles
destroyOnHidden
forceRender
```

- [ ] **Step 2: Run format check for docs file**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: pass or show formatting differences only in files touched by this task. If formatting fails, run the repo formatter command from `package.json` or manually adjust formatting, then rerun `format:check`.

## Task 5: Full verification

**Files:**
- No new code unless fixing verification failures.

- [ ] **Step 1: Run modal tests**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm vitest run packages/components/src/modal/__tests__/modal.test.tsx
```

Expected: pass.

- [ ] **Step 2: Run lint**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: pass. If failures are only in pre-existing unrelated message files, record them and do not modify unrelated files without explicit approval.

- [ ] **Step 3: Run format check**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: pass. If failures are only in pre-existing unrelated message files, record them and do not modify unrelated files without explicit approval.

- [ ] **Step 4: Run typecheck**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: pass. If failures are only in pre-existing unrelated message files, record them and do not modify unrelated files without explicit approval.

- [ ] **Step 5: Run all tests**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: pass. If failures are only in pre-existing unrelated message files, record them and do not modify unrelated files without explicit approval.

- [ ] **Step 6: Run build**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: pass. If failures are only in pre-existing unrelated message files, record them and do not modify unrelated files without explicit approval.

## Self-review

- Spec coverage: This plan covers all P0/P1 API items from the design spec and explicitly excludes P2/non-goal items.
- Placeholder scan: No placeholder tasks remain; each task names files, test code, implementation direction, commands, and expected results.
- Type consistency: `ModalFooter`, `ModalMaskConfig`, `ModalClosableConfig`, `ModalGetContainer`, and `ModalFuncUpdate` are introduced in Task 1 and reused consistently in later tasks.
