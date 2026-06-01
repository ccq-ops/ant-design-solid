# ant-design-solid Feedback Components Design

Date: 2026-06-01

## Summary

Add the next Ant Design-inspired feedback component batch to `ant-design-solid`:

- `Alert`
- `Message`
- `Notification`
- `Modal`
- `Modal.confirm`
- `Popconfirm`

This milestone should make the library more useful in real application flows by adding alerts, transient feedback, notifications, dialogs, and confirmation popups. The batch also introduces lightweight shared overlay infrastructure for portal rendering, z-index handling, and global imperative APIs.

The goal is a practical MVP that feels familiar to Ant Design users while staying Solid-native and avoiding full Ant Design parity in this iteration.

## Current Context

The repository already has:

- pnpm workspace packages for `@ant-design-solid/core`, `@ant-design-solid/theme`, `@ant-design-solid/cssinjs`, `@ant-design-solid/icons`, and docs.
- Core components: `ConfigProvider`, `Button`, `Input`, `Space`, `Typography`, and `Grid`.
- Form controls and form components: `Form`, `Select`, `Checkbox`, `Radio`, `Switch`, and `Input.TextArea`.
- Component folder conventions:
  - `interface.ts`
  - component implementation file
  - style registration file
  - `index.ts`
  - docs page in `apps/docs/src/pages/`
- File naming rule: all TypeScript source files under `apps/` and `packages/` must use lowercase kebab-case names, preserving conventional dot suffixes.

This milestone should follow the existing component architecture and naming rules.

## Goals

1. Add a feedback component batch that supports common business application flows.
2. Provide both component-style APIs and MVP imperative APIs where Ant Design users expect them.
3. Add shared overlay infrastructure without over-engineering a full floating UI system.
4. Extend theme component tokens for feedback and overlay components.
5. Add tests and docs pages for all new components.
6. Keep verification passing: lint, format check, typecheck, tests, and build.

## Non-goals

This milestone does not include:

- Full Ant Design feedback component parity.
- `App.useApp`.
- `message.useMessage` or `notification.useNotification`.
- Complex context holder APIs.
- Full focus trap implementation for `Modal`.
- Draggable modal support.
- Advanced motion choreography.
- Complex popup collision detection, flip, shift, or viewport overflow handling.
- Complex notification stacking layout customization beyond basic placement.
- SSR hydration of active global overlays.
- Built-in locale text system.

## Recommended Approach

Use a feedback component batch plus a lightweight overlay foundation.

Compared with a component-only approach, this better matches real Ant Design usage because `message`, `notification`, and `Modal.confirm` are typically called imperatively from event handlers or async flows.

Compared with full Ant Design parity, this keeps the scope controlled. The MVP will establish stable APIs, styling patterns, and infrastructure that can be expanded later.

## Shared Overlay Infrastructure

### Files

Add shared helpers under `packages/components/src/shared/`:

```txt
packages/components/src/shared/portal.tsx
packages/components/src/shared/z-index.ts
packages/components/src/shared/overlay.ts
```

### Portal

`Portal` renders children into `document.body` in browser environments.

Requirements:

- Use Solid's portal support where appropriate.
- Avoid crashing in non-browser environments.
- In non-browser environments, return children directly or no-op in a deterministic way.
- Keep the API internal unless a public `Portal` export becomes necessary later.

### z-index handling

Add a simple z-index allocator with a default base around `1000`.

Requirements:

- Modal, Message, Notification, and Popconfirm should use consistent z-index ordering.
- The helper should be deterministic enough for tests.
- The design should allow future ConfigProvider token integration.

### Overlay helpers

Add small shared utilities for common overlay behavior.

MVP responsibilities:

- ESC key handling helper.
- Outside click helper where needed.
- Body scroll lock helper for `Modal`.

The helpers should stay minimal and not become a full positioning library.

## Theme Tokens

Extend `ComponentTokenMap` in `@ant-design-solid/theme` for:

- `Alert`
- `Message`
- `Notification`
- `Modal`
- `Popconfirm`

Token derivation should use existing global tokens where possible.

Suggested token responsibilities:

### Alert

- `padding`
- `borderRadius`
- `withDescriptionPadding`
- `iconSize`

### Message

- `noticePadding`
- `noticeBorderRadius`
- `contentBg`
- `contentShadow`

### Notification

- `width`
- `padding`
- `borderRadius`
- `bg`
- `boxShadow`

### Modal

- `contentBg`
- `headerBg`
- `titleColor`
- `titleFontSize`
- `borderRadius`
- `boxShadow`
- `maskBg`

### Popconfirm

- `width`
- `padding`
- `borderRadius`
- `bg`
- `boxShadow`

## Alert

### Files

```txt
packages/components/src/alert/alert.tsx
packages/components/src/alert/alert.style.ts
packages/components/src/alert/interface.ts
packages/components/src/alert/index.ts
```

### Public API

```ts
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

### Behavior

- Default `type` is `info`.
- Render Ant Design-like status styles for success, info, warning, and error.
- Render icon area when `showIcon` is true.
- Render close button when `closable` is true.
- Closing hides the alert and calls `onClose`, then `afterClose`.
- `description` switches the alert into a larger layout.
- `action` renders at the end of the alert content.

## Message

### Files

```txt
packages/components/src/message/holder.tsx
packages/components/src/message/message.ts
packages/components/src/message/message.style.ts
packages/components/src/message/interface.ts
packages/components/src/message/index.ts
```

### Public API

```ts
export type MessageType = 'info' | 'success' | 'error' | 'warning' | 'loading'

export interface MessageArgs {
  key?: string
  type?: MessageType
  content: JSX.Element
  duration?: number
  onClose?: () => void
}

export interface MessageInstance {
  open(args: MessageArgs): MessageHandle
  info(content: JSX.Element | MessageArgs, duration?: number): MessageHandle
  success(content: JSX.Element | MessageArgs, duration?: number): MessageHandle
  error(content: JSX.Element | MessageArgs, duration?: number): MessageHandle
  warning(content: JSX.Element | MessageArgs, duration?: number): MessageHandle
  loading(content: JSX.Element | MessageArgs, duration?: number): MessageHandle
  destroy(key?: string): void
}

export interface MessageHandle {
  close: () => void
}
```

### Behavior

- Export a default singleton `message` object.
- Render messages through a global holder mounted with `Portal`.
- Default placement is top center.
- Default duration is 3 seconds for non-loading messages.
- `loading` persists by default unless a duration is provided.
- `key` updates an existing message instead of creating a duplicate.
- `destroy()` removes all messages.
- `destroy(key)` removes one message.
- Each method returns a handle with `close()`.

## Notification

### Files

```txt
packages/components/src/notification/holder.tsx
packages/components/src/notification/notification.ts
packages/components/src/notification/notification.style.ts
packages/components/src/notification/interface.ts
packages/components/src/notification/index.ts
```

### Public API

```ts
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

export interface NotificationInstance {
  open(args: NotificationArgs): NotificationHandle
  success(args: NotificationArgs): NotificationHandle
  info(args: NotificationArgs): NotificationHandle
  warning(args: NotificationArgs): NotificationHandle
  error(args: NotificationArgs): NotificationHandle
  destroy(key?: string): void
}

export interface NotificationHandle {
  close: () => void
}
```

### Behavior

- Export a default singleton `notification` object.
- Render notifications through global holders mounted with `Portal`.
- Default placement is `topRight`.
- Support `topLeft`, `topRight`, `bottomLeft`, and `bottomRight`.
- Default duration is 4.5 seconds.
- Support `key` updates.
- Render a close button.
- `destroy()` removes all notifications.
- `destroy(key)` removes one notification.

## Modal

### Files

```txt
packages/components/src/modal/modal.tsx
packages/components/src/modal/confirm.tsx
packages/components/src/modal/modal-method.ts
packages/components/src/modal/modal.style.ts
packages/components/src/modal/interface.ts
packages/components/src/modal/index.ts
```

### Component API

```ts
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
```

### Component behavior

- Render into a portal when open.
- Render mask by default.
- Render title, body, and footer regions.
- Default footer contains Cancel and OK buttons.
- `footer={null}` hides the footer.
- `onOk` runs when OK is clicked.
- `onCancel` runs for cancel button, close icon, mask close, or ESC close.
- `confirmLoading` applies loading state to OK button.
- `maskClosable` defaults to true.
- `keyboard` defaults to true.
- `centered` vertically centers the dialog when true.
- Lock body scroll while at least one modal is open.

### Imperative API

```ts
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
```

`Modal` should expose static methods:

```ts
Modal.confirm(config)
Modal.info(config)
Modal.success(config)
Modal.error(config)
Modal.warning(config)
```

Imperative modal requirements:

- Each method creates a mounted confirm dialog through a portal-backed holder.
- `confirm` shows both OK and Cancel buttons by default.
- Info/success/error/warning dialogs may show only OK by default.
- The returned object supports `destroy()` and `update(config)`.
- Async `onOk` may keep the modal open until the promise resolves. If it rejects, keep the modal open and clear loading.

## Popconfirm

### Files

```txt
packages/components/src/popconfirm/popconfirm.tsx
packages/components/src/popconfirm/popconfirm.style.ts
packages/components/src/popconfirm/interface.ts
packages/components/src/popconfirm/index.ts
```

### Public API

```ts
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

### Behavior

- Click the child trigger to open by default.
- Support controlled and uncontrolled `open`.
- Default placement is `top`.
- Position the popup near the trigger with simple `getBoundingClientRect` math.
- Do not implement complex flip or overflow correction in this milestone.
- Confirm closes the popup after `onConfirm` completes.
- If `onConfirm` returns a rejected promise, keep the popup open.
- Cancel closes the popup and calls `onCancel`.
- `disabled` prevents opening.

## Styling and Class Naming

All components should use the configured `prefixCls` from `ConfigProvider`.

Default classes should follow the existing convention:

- `${prefixCls}-alert`
- `${prefixCls}-message`
- `${prefixCls}-notification`
- `${prefixCls}-modal`
- `${prefixCls}-popconfirm`

Styles should be registered with `useStyleRegister` and component tokens.

## Documentation

Add docs pages:

```txt
apps/docs/src/pages/alert-page.tsx
apps/docs/src/pages/message-page.tsx
apps/docs/src/pages/notification-page.tsx
apps/docs/src/pages/modal-page.tsx
apps/docs/src/pages/popconfirm-page.tsx
```

Update:

- `apps/docs/src/site/nav.ts`
- `apps/docs/src/app.tsx`
- `packages/components/src/index.ts`

Each page should include basic usage and at least one interactive example.

## Testing Strategy

### Theme tests

- Verify new component token defaults.
- Verify component token overrides.

### Alert tests

- Renders message and description.
- Applies type classes.
- Closes when close button is clicked.
- Calls `onClose` and `afterClose`.

### Message tests

- `message.success` renders content.
- Auto-close works with fake timers.
- `loading` persists by default.
- `key` updates existing message.
- `destroy(key)` and `destroy()` remove messages.

### Notification tests

- `notification.open` renders message and description.
- Placement class is applied.
- Auto-close works with fake timers.
- `key` updates existing notification.
- Close button removes notification.

### Modal tests

- Component modal renders title, body, and footer when open.
- OK and Cancel callbacks run.
- Mask click respects `maskClosable`.
- ESC respects `keyboard`.
- `Modal.confirm` creates, updates, and destroys a dialog.
- Async `onOk` loading behavior is covered.

### Popconfirm tests

- Trigger click opens popup.
- Confirm and cancel callbacks run.
- Controlled open works.
- Disabled trigger does not open.

## Verification

After implementation, run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Because this milestone adds new TypeScript source files, all new filenames under `apps/` and `packages/` must be lowercase kebab-case.
