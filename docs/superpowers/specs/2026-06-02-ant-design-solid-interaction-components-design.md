# ant-design-solid Interaction Components Design

Date: 2026-06-02

## Summary

Add the next Ant Design-inspired interaction component batch to `ant-design-solid`:

- `Tabs`
- `Tooltip`
- `Dropdown`

This batch adds common navigation and lightweight overlay interactions. It should reuse existing component conventions, token-driven styling, and shared overlay helpers where possible. The goal is a practical MVP that supports common application UI flows without implementing full Ant Design parity.

## Current Context

The repository already includes:

- Core package `@ant-design-solid/core` with foundation, form, feedback, and data display components.
- Existing overlay infrastructure under `packages/components/src/shared/`:
  - `portal.tsx`
  - `overlay.ts`
  - `z-index.ts`
- Component conventions under `packages/components/src/<component>/`:
  - `interface.ts`
  - component implementation file
  - style registration file
  - `index.ts`
  - colocated tests under `__tests__/`
- Docs routes under `apps/docs/src/routes/components/` and navigation in `apps/docs/src/site/nav.ts`.
- File naming rule: all TypeScript source files under `apps/` and `packages/` must use lowercase kebab-case file names.

This milestone should follow existing patterns and avoid introducing a full floating UI system.

## Goals

1. Add `Tabs`, `Tooltip`, and `Dropdown` as MVP interaction components.
2. Keep APIs familiar to Ant Design users while staying Solid-native.
3. Reuse shared portal/z-index/overlay helpers for floating components.
4. Add a small shared placement helper only if needed for repeated tooltip/dropdown positioning.
5. Extend the theme package with component tokens for `Tabs`, `Tooltip`, and `Dropdown`.
6. Add docs pages and nav entries for all three components.
7. Keep verification passing: lint, format check, typecheck, tests, and build.

## Non-goals

This milestone does not include:

- Full Ant Design Tabs parity.
- Editable-card tabs.
- Overflow tabs with a more menu.
- Vertical `left` or `right` tabs.
- Complex animated ink bar measurement.
- Full floating UI collision detection.
- Automatic flip/shift for tooltip or dropdown.
- Tooltip trigger arrays.
- Dropdown nested submenus.
- Dropdown selectable menu state.
- Dropdown context menu trigger.
- Dropdown arrow.
- Pixel-perfect Ant Design styling.

## Recommended Approach

Use a focused interaction MVP batch:

- Implement `Tabs` as a local state/navigation component with controlled and uncontrolled modes.
- Implement `Tooltip` and `Dropdown` as lightweight portal-based overlays with fixed placement based on trigger bounding rect.
- Add a small shared placement helper for top/bottom/left/right and corner-aligned dropdown placements if both overlay components need the same math.

This approach keeps the scope controlled while establishing reusable primitives for future popover-style components.

## Architecture

### File Structure

Add these files:

```txt
packages/components/src/tabs/interface.ts
packages/components/src/tabs/tabs.style.ts
packages/components/src/tabs/tabs.tsx
packages/components/src/tabs/index.ts
packages/components/src/tabs/__tests__/tabs.test.tsx

packages/components/src/tooltip/interface.ts
packages/components/src/tooltip/tooltip.style.ts
packages/components/src/tooltip/tooltip.tsx
packages/components/src/tooltip/index.ts
packages/components/src/tooltip/__tests__/tooltip.test.tsx

packages/components/src/dropdown/interface.ts
packages/components/src/dropdown/dropdown.style.ts
packages/components/src/dropdown/dropdown.tsx
packages/components/src/dropdown/index.ts
packages/components/src/dropdown/__tests__/dropdown.test.tsx
```

Optionally add:

```txt
packages/components/src/shared/placement.ts
packages/components/src/shared/__tests__/placement.test.ts
```

Modify:

```txt
packages/components/src/index.ts
packages/theme/src/types.ts
packages/theme/src/components.ts
packages/theme/src/__tests__/theme.test.ts
apps/docs/src/site/nav.ts
apps/docs/src/routes/components/tabs.tsx
apps/docs/src/routes/components/tooltip.tsx
apps/docs/src/routes/components/dropdown.tsx
```

All new TypeScript file names must be lowercase kebab-case.

## Theme Tokens

Extend `ComponentTokenMap` with `Tabs`, `Tooltip`, and `Dropdown`.

### Tabs token responsibilities

Suggested tokens:

- `itemColor`
- `itemSelectedColor`
- `itemHoverColor`
- `itemDisabledColor`
- `inkBarColor`
- `cardBg`
- `cardBorderColor`
- `horizontalItemPadding`
- `horizontalItemPaddingSm`
- `horizontalItemPaddingLg`

### Tooltip token responsibilities

Suggested tokens:

- `bg`
- `color`
- `borderRadius`
- `paddingBlock`
- `paddingInline`
- `boxShadow`
- `maxWidth`

### Dropdown token responsibilities

Suggested tokens:

- `bg`
- `boxShadow`
- `borderRadius`
- `itemColor`
- `itemHoverBg`
- `itemDisabledColor`
- `itemPaddingBlock`
- `itemPaddingInline`
- `minWidth`

Token defaults should derive from existing global tokens where possible and support component-level overrides through `ConfigProvider`.

## Tabs Design

### Public API

`@ant-design-solid/core` exports:

- `Tabs`
- `TabsProps`
- `TabsItem`
- related tab types

### Props

`Tabs` supports:

- `items: TabsItem[]`
- `activeKey?: string`
- `defaultActiveKey?: string`
- `onChange?: (activeKey: string) => void`
- `type?: 'line' | 'card'`
- `size?: 'small' | 'middle' | 'large'`
- `tabPosition?: 'top' | 'bottom'`
- `destroyInactiveTabPane?: boolean`
- `class?: string`
- `classList?: Record<string, boolean | undefined>`
- `style?: JSX.CSSProperties | string`

### Items

`TabsItem` supports:

- `key: string`
- `label: JSX.Element | string`
- `children?: JSX.Element`
- `disabled?: boolean`

### Rendering Behavior

- Render a root element with a tab nav and content area.
- Use `activeKey` in controlled mode.
- Use internal state initialized from `defaultActiveKey`, then first non-disabled item, then first item.
- Clicking a disabled tab does nothing.
- Clicking an enabled inactive tab updates uncontrolled state and calls `onChange`.
- `tabPosition='bottom'` renders content before nav.
- `destroyInactiveTabPane` renders only the active pane; otherwise panes remain mounted and inactive panes are hidden.
- `type='card'` applies card-style tab classes.

## Tooltip Design

### Public API

`@ant-design-solid/core` exports:

- `Tooltip`
- `TooltipProps`
- `TooltipPlacement`
- `TooltipTrigger`

### Props

`Tooltip` supports:

- `title?: JSX.Element | string`
- `placement?: 'top' | 'bottom' | 'left' | 'right'`
- `trigger?: 'hover' | 'click' | 'focus'`
- `open?: boolean`
- `defaultOpen?: boolean`
- `onOpenChange?: (open: boolean) => void`
- `mouseEnterDelay?: number`
- `mouseLeaveDelay?: number`
- `children: JSX.Element`
- `class?: string`
- `overlayClass?: string`
- `overlayStyle?: JSX.CSSProperties | string`

### Rendering Behavior

- Render a trigger wrapper around children.
- Render overlay through internal `Portal` when open and `title` is not empty.
- Use fixed positioning based on trigger rect.
- Apply placement class and simple transform offset.
- Controlled `open` wins over internal state.
- Hover trigger respects enter/leave delays in seconds.
- Click trigger toggles open and closes on outside pointer/escape where existing helpers support it.
- Focus trigger opens on focus and closes on blur.
- Empty `title` suppresses overlay.

## Dropdown Design

### Public API

`@ant-design-solid/core` exports:

- `Dropdown`
- `DropdownProps`
- `DropdownMenuProps`
- `DropdownMenuItem`
- `DropdownPlacement`

### Props

`Dropdown` supports:

- `menu: { items: DropdownMenuItem[]; onClick?: (info: DropdownMenuClickInfo) => void }`
- `trigger?: 'hover' | 'click'`
- `placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'`
- `open?: boolean`
- `defaultOpen?: boolean`
- `onOpenChange?: (open: boolean) => void`
- `children: JSX.Element`
- `class?: string`
- `overlayClass?: string`
- `overlayStyle?: JSX.CSSProperties | string`

### Menu Items

`DropdownMenuItem` supports:

- `key: string`
- `label?: JSX.Element | string`
- `disabled?: boolean`
- `type?: 'item' | 'divider'`

`DropdownMenuClickInfo` includes:

- `key: string`
- `domEvent: MouseEvent`

### Rendering Behavior

- Render a trigger wrapper around children.
- Render overlay through internal `Portal` when open.
- Position overlay with fixed coordinates based on trigger rect and requested placement.
- Hover trigger opens on pointer enter and closes on pointer leave.
- Click trigger toggles open and closes on outside pointer/escape where existing helpers support it.
- Divider items render separators and are not clickable.
- Disabled items render disabled styling and do not call menu `onClick`.
- Clicking an enabled item calls `menu.onClick` and closes the dropdown.

## Shared Placement Helper

If repeated positioning code would otherwise be duplicated, add `packages/components/src/shared/placement.ts`.

Responsibilities:

- Accept a trigger `DOMRect`, overlay size if available, placement, and offset.
- Return `{ top, left, transformOrigin }` or CSS properties for fixed-position overlays.
- Support Tooltip placements: `top`, `bottom`, `left`, `right`.
- Support Dropdown placements: `bottomLeft`, `bottomRight`, `topLeft`, `topRight`.

Non-responsibilities:

- No viewport collision detection.
- No flip/shift.
- No scroll parent tracking beyond recalculating from `getBoundingClientRect` when opening.

## Docs

Add component pages:

- `Tabs`: basic, card type, disabled tab, bottom tabs, destroy inactive pane.
- `Tooltip`: hover, click, focus, placement examples.
- `Dropdown`: click trigger, hover trigger, disabled item, divider, placement examples.

Update navigation to include:

- `Tabs`
- `Tooltip`
- `Dropdown`

near other interaction/overlay components.

## Testing

### Tabs tests

Cover:

- Renders labels and active pane.
- Uncontrolled tab switching calls `onChange` and updates active pane.
- Controlled mode calls `onChange` without changing active pane by itself.
- Disabled tab does not activate.
- `destroyInactiveTabPane` removes inactive pane from DOM.
- `tabPosition='bottom'`, `type='card'`, and size classes apply.
- Custom prefix from `ConfigProvider` applies.

### Tooltip tests

Cover:

- Hover opens and closes overlay.
- Click toggles overlay.
- Focus opens and blur closes overlay.
- Controlled `open` renders overlay.
- Empty title suppresses overlay.
- Placement and custom prefix classes apply.
- `onOpenChange` is called.

### Dropdown tests

Cover:

- Click trigger opens overlay.
- Hover trigger opens and closes overlay.
- Clicking enabled item calls `menu.onClick` and closes overlay.
- Disabled item does not call `menu.onClick`.
- Divider renders separator and is not clickable.
- Controlled `open` renders overlay.
- Placement and custom prefix classes apply.

### Theme tests

Cover:

- Default component tokens exist for `Tabs`, `Tooltip`, and `Dropdown`.
- Component token overrides merge correctly.

## Verification

After implementation, run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

## Risks and Mitigations

### Overlay behavior complexity

Risk: Tooltip and Dropdown can expand into a full floating UI system.

Mitigation: Keep this milestone to fixed placement, no collision detection, and simple trigger behavior.

### Trigger child event composition

Risk: Wrapping children can interfere with child events or layout.

Mitigation: Use a wrapper element and document MVP behavior. Avoid cloning/rewriting arbitrary child props in this milestone.

### Timer flakiness in Tooltip tests

Risk: Hover delays can make tests flaky.

Mitigation: Use fake timers for delay tests or set delays to zero in most tests.

### Tabs controlled/uncontrolled ambiguity

Risk: Controlled and uncontrolled state may diverge.

Mitigation: Treat `activeKey` as source of truth when present. Internal state only updates in uncontrolled mode.
