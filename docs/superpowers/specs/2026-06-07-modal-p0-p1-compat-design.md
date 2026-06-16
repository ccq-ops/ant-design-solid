# Modal P0/P1 Ant Design Compatibility Design

## Goal

Bring the Solid Modal component closer to Ant Design Modal compatibility for the agreed P0 and P1 API scope, while keeping the implementation idiomatic to the existing `ant-design-solid` codebase.

## Scope

This work covers the following Modal capabilities:

### P0 API compatibility

- `okButtonProps`
- `cancelButtonProps`
- `okType`
- `closeIcon`
- `wrapClassName`
- `className`
- Static method config support for `centered`, `zIndex`, `style`, `footer`, `icon`, and `afterClose`
- `ModalFuncReturn.update(fn)` function-form updates

### P1 API compatibility

- `destroyOnHidden`
- `forceRender`
- `getContainer`
- `modalRender`
- `afterOpenChange`
- Object-form `mask`: `{ enabled?: boolean; blur?: boolean; closable?: boolean }`
- Object-form `closable`: `{ closeIcon?: JSX.Element; disabled?: boolean; onClose?: () => void; afterClose?: () => void }`
- `classNames` semantic DOM custom classes
- `styles` semantic DOM inline styles
- `loading` body state

## Non-goals

This batch intentionally does not implement:

- `Modal.useModal()`
- Hook modal `then` / await behavior
- Full focus trap or focus restoration
- `focusable`
- Responsive breakpoint `width`
- Exact CSS animation lifecycle timing
- Deprecated APIs: `destroyOnClose`, `focusTriggerAfterClose`, `autoFocusButton`

## Current constraints

The repository already has existing uncommitted `message` related changes. This Modal work must avoid modifying those files and should only touch Modal-related files and docs/tests required for the Modal compatibility work.

All new TypeScript file names must follow the repository kebab-case naming rules. This design does not require creating new TypeScript source files.

## Architecture

The implementation extends the existing Modal files instead of introducing a separate modal subsystem:

- `packages/components/src/modal/interface.ts` owns public types.
- `packages/components/src/modal/modal.tsx` owns regular `<Modal />` rendering, lifecycle, container, mask, close button, footer, semantic DOM classes/styles, and body loading state.
- `packages/components/src/modal/confirm.tsx` adapts static method configs to `ModalBase` and renders confirm-specific icon/content/footer behavior.
- `packages/components/src/modal/modal-method.ts` owns imperative static modal lifecycle, config update, and cleanup.
- `packages/components/src/modal/modal.style.ts` gets small style additions for hidden state, mask blur, loading body, and confirm icon layout.
- `packages/components/src/modal/__tests__/modal.test.tsx` captures compatibility behavior with test-first changes.

## Type design

`interface.ts` will add focused helper types:

- `ModalSemanticName`: semantic keys used by `classNames` and `styles`.
- `ModalClassNames`: `Partial<Record<ModalSemanticName, string>>`.
- `ModalStyles`: `Partial<Record<ModalSemanticName, JSX.CSSProperties>>`.
- `ModalMaskConfig`: `{ enabled?: boolean; blur?: boolean; closable?: boolean }`.
- `ModalClosableConfig`: `{ closeIcon?: JSX.Element; disabled?: boolean; onClose?: () => void; afterClose?: () => void }`.
- `ModalGetContainer`: `HTMLElement | (() => HTMLElement) | string | false`.
- `ModalFooterRender`: `(originNode: JSX.Element, extra: { OkBtn: () => JSX.Element; CancelBtn: () => JSX.Element }) => JSX.Element`.
- `ModalFuncUpdate`: object or function update shape for static modals.

`ModalProps` will retain existing Solid props (`class`, `classList`, `style`) and add antd-compatible aliases such as `className` and `wrapClassName`. `maskClosable` remains for backward compatibility, but object-form `mask.closable` takes precedence when present.

`ModalFuncProps` will be extended with the static method subset from the agreed P0/P1 scope. Static `onOk` and `onCancel` will accept an optional close function while preserving compatibility with existing zero-argument handlers.

## Regular Modal rendering behavior

### Visibility and lifecycle

The current implementation renders only when `open` is true. The new behavior will track whether the modal has ever opened:

- Render when `open` is true.
- Render when `forceRender` is true.
- Render after first open while `destroyOnHidden` is false.
- Do not render hidden content when `destroyOnHidden` is true and `open` is false.

Hidden-but-preserved modals use hidden styling rather than removing the content. Because this component currently has no animation system, `afterClose` and `afterOpenChange(false)` fire when the `open` prop transitions from true to false. `afterOpenChange(true)` fires when the modal transitions to open.

### Container

`getContainer` resolution supports:

- `HTMLElement`: portal into that node.
- `() => HTMLElement`: portal into the returned node.
- `string`: use `document.querySelector` and portal into the matching HTMLElement when found.
- `false`: render inline without `InternalPortal`.
- `undefined`: use existing default portal behavior.

### Mask

Mask rendering uses merged config:

- `mask={false}` and `mask={{ enabled: false }}` disable the mask element.
- `mask={{ blur: true }}` adds a blur class/style.
- Mask closability is resolved in order: `mask.closable`, then `maskClosable`, then default `true`.

### Close button

`closable` supports boolean and object forms:

- `false` hides the close button.
- `true` shows the close button with `closeIcon` or the default icon.
- Object form can override `closeIcon`, set `disabled`, and receive `onClose` / `afterClose` callbacks.

Clicking the close button calls the object `onClose` first when present. If disabled, it does not call Modal `onCancel`.

### Footer and buttons

Default footer buttons become internal `OkBtn` and `CancelBtn` components:

- `okType` controls the OK button `type`, defaulting to `primary`.
- `okButtonProps` and `cancelButtonProps` are spread onto their buttons.
- `confirmLoading` controls OK button loading and overrides `okButtonProps.loading` when true.
- Function-form `footer` receives the default footer node and `{ OkBtn, CancelBtn }`.
- `footer={null}` hides the footer.

### Semantic DOM customization

`classNames` and `styles` apply to these semantic keys:

- `root`
- `mask`
- `wrap`
- `modal`
- `content`
- `header`
- `title`
- `body`
- `footer`
- `close`

Existing `class` and new `className` both apply to the modal dialog node.

### Body loading

`loading={true}` renders a simple Modal-owned loading body placeholder with class `${prefixCls}-loading`. This avoids adding a dependency on a Skeleton component while making the API behavior observable and styleable.

### Modal render

`modalRender` wraps the modal dialog node after the dialog is built and before it is placed in the wrap.

## Static method behavior

`Modal.confirm/info/success/error/warning` continue returning `{ destroy, update }` and gain function-form update:

```ts
instance.update((prev) => ({ title: `${prev.title} updated` }))
```

Static modals pass supported config fields through to `ModalBase`:

- `centered`
- `zIndex`
- `style`
- `footer`
- `closeIcon`
- `okButtonProps`
- `cancelButtonProps`
- `okType`
- `afterClose`
- `getContainer`
- `mask`
- `wrapClassName`
- `className`
- `modalRender`
- `classNames`
- `styles`
- `destroyOnHidden`
- `forceRender`

`onOk` and `onCancel` receive the current close function. Promise handling remains compatible with existing tests: resolved promises close the modal; rejected promises keep it open and clear loading.

Static `icon` renders in a confirm-specific content layout when provided. If no icon is provided, existing type-specific classes remain the visual signal.

`afterClose` is called once when the static modal is destroyed, including manual `destroy()` and successful OK/cancel closure paths.

## Testing strategy

All implementation changes will be test-first. Tests will be added to `packages/components/src/modal/__tests__/modal.test.tsx` for these behaviors:

- Regular Modal button props, `okType`, `className`, and `wrapClassName`.
- Custom close icon and object-form `closable` disabled/onClose behavior.
- Object-form `mask` enabled, closable, and blur behavior.
- `getContainer` for HTMLElement, selector string, and `false` inline rendering.
- `destroyOnHidden` and `forceRender` lifecycle behavior.
- `modalRender` wrapping.
- `classNames` and `styles` semantic customization.
- `afterOpenChange` transitions.
- Static method config for centered, zIndex, style, footer, icon, afterClose.
- Static `update(fn)`.
- Static `onOk(close)` and `onCancel(close)`.
- Regular Modal `loading` body state.

## Verification

After implementation, run at minimum:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- modal
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

If the package filter command does not match the workspace package name, use the repository's existing package/test command discovered from `package.json`.
