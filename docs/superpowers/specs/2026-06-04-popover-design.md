# Popover Component Design

## Goal

Implement a lightweight Ant Design-style `Popover` component for `@solid-ant-design/core`. The component should prioritize usable behavior, project consistency, and low implementation risk over full Ant Design parity.

## Scope

The first version supports:

- `title` and `content` regions.
- `trigger`: `hover`, `click`, or `focus`.
- `placement`: `top`, `bottom`, `left`, or `right`.
- Controlled and uncontrolled visibility through `open`, `defaultOpen`, and `onOpenChange`.
- Hover delays through `mouseEnterDelay` and `mouseLeaveDelay`.
- `overlayClass` and `overlayStyle`.
- Custom prefix support through `ConfigProvider`.
- Portal rendering into `document.body`.

Out of scope for this version:

- Arrow rendering.
- Auto-flip or overflow adjustment.
- Twelve Ant Design placements.
- `destroyOnHidden`, `fresh`, or full rc-trigger compatibility.

## API

```ts
export type PopoverTrigger = 'hover' | 'click' | 'focus'

export interface PopoverProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  title?: JSX.Element
  content?: JSX.Element
  placement?: TooltipPlacement
  trigger?: PopoverTrigger
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  mouseEnterDelay?: number
  mouseLeaveDelay?: number
  overlayClass?: string
  overlayStyle?: JSX.CSSProperties
}
```

The component reuses `TooltipPlacement` from `shared/placement` to keep the initial placement surface small and consistent with existing overlay code.

## Behavior

- Default `trigger` is `hover`.
- Default `placement` is `top`.
- The popup renders only when at least one of `title` or `content` is non-empty.
- In uncontrolled mode, `defaultOpen` initializes internal state.
- In controlled mode, `open` determines visibility and user interactions call `onOpenChange` without mutating internal state.
- `hover` opens after `mouseEnterDelay` seconds and closes after `mouseLeaveDelay` seconds. The default leave delay matches `Tooltip` at `0.1` seconds.
- `click` toggles visibility from the trigger. Pointer down outside the trigger and overlay closes it. Escape also closes it.
- `focus` opens on focus and closes on blur.
- Opening recalculates position from the trigger element.

## Architecture

Add a new `packages/components/src/popover` component folder:

- `interface.ts`: public types.
- `popover.tsx`: component implementation.
- `popover.style.ts`: CSS-in-JS registration.
- `index.ts`: public component export.
- `__tests__/popover.test.tsx`: behavior tests.

`Popover` follows the existing `Tooltip` implementation shape rather than extracting a shared hook in this change. This keeps regression risk low and avoids touching existing overlay components.

Shared dependencies:

- `useConfig` for prefix handling.
- `classNames` for class composition.
- `addDocumentKeydown` and `addDocumentPointerDown` for dismiss behavior.
- `getTooltipPosition` for the four supported placements.
- `InternalPortal` and `canUseDom` for browser-safe portal rendering.

## Styling

The default prefix is `ads-popover`. The trigger class is `ads-popover-trigger`.

The overlay uses fixed positioning and a card-like surface:

- White/background container from tokens.
- Text color from tokens.
- Border radius and shadow from Popover component token when available.
- Title uses stronger font weight.
- Content uses normal text styling and margin when title is present.
- `z-index` follows popover/popconfirm range and remains below tooltip if possible.

## Testing

Use Vitest and `@solidjs/testing-library`, matching `Tooltip` tests.

Required tests:

1. Hover opens and closes with delays and calls `onOpenChange`.
2. Click toggles open and closes on outside pointer down.
3. Focus opens and blur closes.
4. Controlled `open` renders the overlay and responds to signal changes.
5. Empty `title` and empty `content` suppress the overlay.
6. Custom `ConfigProvider` prefix changes trigger and overlay classes.
7. `overlayClass` and `overlayStyle` are applied to the overlay.

## Quality Review Notes

- Keep file names kebab-case per `AGENTS.md`.
- Avoid changing existing `Tooltip`, `Dropdown`, or `Popconfirm` behavior.
- Prefer existing project utilities over new abstractions.
- Keep implementation small enough to review directly.
- Run component test/typecheck/build verification after implementation.
