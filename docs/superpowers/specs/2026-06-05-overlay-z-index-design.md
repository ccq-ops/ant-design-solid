# Overlay Portal and Z-Index Design

## Context

The current component package has a small `shared/z-index.ts` allocator, but many overlay components still use fixed CSS z-index values. Some popup components, such as `Select`, `TreeSelect`, and `TimePicker`, render their dropdowns inline under the trigger. Inline dropdowns can be hidden by ancestor stacking contexts or clipped by ancestor overflow, regardless of how large their z-index is.

Ant Design solves this class of problem with two coordinated mechanisms: popup containers that default to `document.body`, and contextual z-index calculation for nested overlays. This design adapts that behavior to Solid and this repository's existing component structure.

## Goals

- Prevent popup layers from being clipped or covered by ancestor block/stacking contexts by default.
- Provide predictable z-index ordering for nested overlays, such as `Popover` containing `Select`.
- Preserve existing public behavior unless a new prop is needed for overlay control.
- Keep the implementation small and reusable across current and future popup components.

## Non-goals

- Implement full rc-trigger/rc-align behavior.
- Add flip/shift collision handling for viewport overflow.
- Redesign visual styles or interaction models beyond what is needed for portal mounting and z-index.

## Architecture

### Shared popup container support

Add popup container support to `ConfigProvider`:

```ts
getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
```

Resolution order for a component popup is:

1. component-level `getPopupContainer`, if present;
2. `ConfigProvider` `getPopupContainer`, if present;
3. `document.body`.

The default body container avoids most ancestor stacking-context and `overflow: hidden` clipping problems. If a user chooses a local container, that container's stacking and clipping behavior is intentionally respected.

### InternalPortal enhancement

Extend `InternalPortal` so it can mount into a supplied container while retaining the current `document.body` default. It should remain safe during SSR by rendering nothing when DOM is unavailable.

### Z-index context

Replace the global increment-only allocator with an Ant Design style model:

- base popup z-index: `1000`;
- container overlay offset: `100`;
- consumer popup offset: `50`;
- container overlay types include `Popover`, `Popconfirm`, `Tooltip`, `ColorPicker`, and later `Modal`, `Drawer`, `Tour`, `FloatButton`;
- consumer popup types include `SelectLike`, `Dropdown`, `DatePicker`, `Menu`, and `ImagePreview`.

`useZIndex(componentType, customZIndex?)` returns:

```ts
[zIndexForStyle, contextZIndex]
```

Rules:

- Explicit `customZIndex` wins and becomes both the rendered z-index and child context.
- Container overlays without a parent use `base + 100`.
- Container overlays with a parent use `parent + 100` or a compatible parent-based offset.
- Consumer overlays use `parent + 50` when inside a parent overlay, and default to `base + 50` when standalone.
- Container overlays provide `contextZIndex` to descendants with `ZIndexContext.Provider`.

This ensures a `Select` opened inside a `Popover` appears above the popover body, rather than competing with it.

## Component changes

### Portal-based overlays already using body

Update these components to use `useZIndex` and the enhanced `InternalPortal`:

- `Tooltip`
- `Popover`
- `Popconfirm`
- `Dropdown`
- `ColorPicker`

Their overlay style should merge in the computed `z-index`, while user-supplied overlay/popup style remains able to override only when explicitly intended by prop order.

### Inline select-like popups

Update these components to render popup panels through `InternalPortal` by default:

- `Select`
- `TreeSelect`
- `TimePicker`

Their dropdowns should use fixed positioning calculated from the trigger's `getBoundingClientRect()`:

- `top`: trigger bottom + 4px;
- `left`: trigger left;
- `width`: trigger width;
- `position`: `fixed`.

This keeps visual placement equivalent to the current inline dropdown while escaping ancestor stacking and clipping contexts.

## Public API

Add optional popup-control props where appropriate:

```ts
zIndex?: number
getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
```

`zIndex` is useful for explicit integration with application-level layers. `getPopupContainer` mirrors Ant Design behavior and lets consumers opt into local mounting when needed.

For components that already have a popup style prop, that prop remains supported.

## Data flow

1. Component renders trigger and stores trigger element ref.
2. Opening a popup updates its fixed position from the trigger rect.
3. Component resolves popup container from props/config/default body.
4. Component computes z-index with `useZIndex`.
5. Popup renders through `InternalPortal` into the resolved container.
6. Container overlays provide their context z-index to descendants.

## Testing

Add or update tests for:

- `ConfigProvider` exposes `getPopupContainer` through context.
- `InternalPortal` mounts into a custom container.
- `Select`, `TreeSelect`, and `TimePicker` dropdowns render under `document.body` by default and use fixed positioning.
- Component-level `getPopupContainer` overrides the config-level container.
- Nested overlays place consumer dropdowns above their parent overlay.
- Explicit `zIndex` overrides the computed value.

## Risks and mitigations

- **Position updates after scroll/resize:** Initial implementation calculates on open and render effects. Existing behavior also has limited dynamic repositioning. Future work can add scroll/resize listeners if needed.
- **Tests depending on inline dropdown structure:** Update tests to query `document.body` where appropriate.
- **Custom popup container can still clip:** This is expected because the user explicitly chose that container.

## Acceptance criteria

- Popup components no longer rely on scattered hardcoded z-index values.
- Select-like dropdowns are not children of their trigger root by default.
- Nested popups have deterministic ordering via z-index context.
- All changed TypeScript file names remain lowercase kebab-case.
- Lint, format check, typecheck, tests, and build pass.
