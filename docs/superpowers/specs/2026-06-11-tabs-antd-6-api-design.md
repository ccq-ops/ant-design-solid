# Tabs Antd 6 API Design

## Goal

Align `Tabs` with the non-deprecated Ant Design 6 Tabs API while preserving Solid conventions in this repository.

The implementation must support the current antd 6 public API surface for Tabs and TabItem behavior, except APIs that antd marks as deprecated. Solid-facing class props use `class`, not React's `className`.

## Scope

Implement these antd 6 Tabs-level APIs:

- `activeKey`
- `defaultActiveKey`
- `items`
- `onChange`
- `type`: `'line' | 'card' | 'editable-card'`
- `size`
- `tabPlacement`: `'top' | 'end' | 'bottom' | 'start'`
- `destroyOnHidden`
- `animated`
- `centered`
- `indicator`
- `more`
- `renderTabBar`
- `tabBarExtraContent`
- `tabBarGutter`
- `tabBarStyle`
- `onEdit`
- `onTabClick`
- `onTabScroll`
- `addIcon`
- `removeIcon`
- `hideAdd`
- `classNames`
- `styles`

Implement these TabItem APIs:

- `key`
- `label`
- `children`
- `disabled`
- `icon`
- `forceRender`
- `destroyOnHidden`
- `closable`
- `closeIcon`
- `class`
- `style`

Do not add antd deprecated compatibility APIs that are not already present. In particular, do not add `popupClassName`. Existing `tabPosition` and `destroyInactiveTabPane` can remain as local backward-compatible aliases, but docs and new tests should focus on `tabPlacement` and `destroyOnHidden`.

## API Conventions

This project is Solid-first. Root classes are passed with `class`, and TabItem pane classes are passed with `class`.

`className` is not part of the new Tabs alignment API. If antd examples use `className`, the Solid equivalent in this project is `class`.

Semantic APIs follow the existing repository pattern used by components such as Drawer and Tree:

```ts
type TabsSemanticSlot = 'root' | 'item' | 'remove' | 'indicator' | 'content' | 'header' | 'popup'

type TabsSemanticClassNames =
  | Partial<Record<TabsSemanticSlot, string>>
  | ((info: { props: TabsProps }) => Partial<Record<TabsSemanticSlot, string>>)

type TabsSemanticStyles =
  | Partial<Record<TabsSemanticSlot, JSX.CSSProperties>>
  | ((info: { props: TabsProps }) => Partial<Record<TabsSemanticSlot, JSX.CSSProperties>>)
```

The `popup` slot applies to the overflow menu popup created by `more`.

## Architecture

Keep the component implemented natively in Solid. Do not port `rc-tabs`.

The existing single-file implementation should be split by responsibility:

- `packages/components/src/tabs/interface.ts`: public types for Tabs, TabItem, semantic slots, renderTabBar props, more props, editable callbacks, indicator config, animation config, and placement.
- `packages/components/src/tabs/tabs.tsx`: public component entry, controlled/uncontrolled active key, item normalization, placement resolution, event dispatch, and overall layout.
- `packages/components/src/tabs/tab-nav-list.tsx`: tab bar rendering, add/remove controls, extra content, keyboard navigation, indicator, centered/gutter styling, overflow trigger, and `onTabScroll`.
- `packages/components/src/tabs/tab-panel-list.tsx`: pane rendering lifecycle for `forceRender`, `destroyOnHidden`, item-level destroy behavior, hidden state, and pane class/style.
- `packages/components/src/tabs/tabs-utils.ts`: shared helpers for placement mapping, semantic class/style resolution, default active key, tab ids, event payloads, and closable normalization.
- `packages/components/src/tabs/tabs.style.ts`: styles for line/card/editable-card, top/bottom/start/end placement, centered tabs, add/remove buttons, indicator alignment/size, overflow trigger/menu, extra content, and hidden panes.

This split keeps behavior units small enough to test and makes future parity work easier to reason about.

## Behavior Details

### Active Key

`Tabs` remains controlled when `activeKey` is provided and uncontrolled otherwise.

`defaultActiveKey` chooses the initial uncontrolled key. If it does not match an enabled item, use the first enabled item. If every item is disabled, keep the first item active to preserve current behavior.

When the current uncontrolled active key disappears from `items`, pick the first available enabled item. If none are enabled, pick the first item.

### Events

`onTabClick(key, event)` fires when an enabled tab is clicked or keyboard-activated, including when it is already active.

`onChange(activeKey)` fires only when the active key changes.

For controlled Tabs, internal state does not change until `activeKey` changes from the caller.

`onEdit(eventOrKey, action)` follows antd semantics:

- Add action: call `onEdit(event, 'add')`.
- Remove action: call `onEdit(targetKey, 'remove')`.

Remove clicks must not also activate the tab.

### Placement

`tabPlacement` is the primary API:

- `top`: tab bar above content.
- `bottom`: tab bar below content.
- `start`: tab bar before content in LTR.
- `end`: tab bar after content in LTR.

The project does not currently expose full RTL direction handling for Tabs. If direction support exists through `ConfigProvider` when implemented, `start` and `end` should map according to direction. Otherwise they map to left and right in LTR.

Existing `tabPosition` may continue to work internally for current consumers, but it is not documented as an antd 6 parity target.

### Pane Lifecycle

Default behavior should match antd's visible behavior:

- Active pane is rendered.
- Inactive pane renders after it has become active once.
- `forceRender` renders that item's pane immediately.
- Global `destroyOnHidden` removes inactive panes.
- Item `destroyOnHidden` removes that inactive pane even when the global flag is false.

The existing `destroyInactiveTabPane` alias can map to `destroyOnHidden` internally for backwards compatibility, but tests for new behavior should use `destroyOnHidden`.

### Editable Card

When `type="editable-card"`:

- Render an add button unless `hideAdd` is true.
- Use `addIcon` when provided, otherwise use the project's plus icon.
- Render remove buttons for closable items.
- Item `closable` defaults to `true` for editable-card.
- `closable={false}` hides that item's remove button.
- Item `closeIcon` overrides the global `removeIcon` for that item.
- `closeIcon={false}` or `closeIcon={null}` hides the remove button for that item.
- Removing the active tab only dispatches `onEdit`; the parent owns item removal and active-key updates.

### Tab Labels and Icons

Tab headers render `icon` before `label` when `icon` is provided. Disabled items are focus-skipped and cannot be activated.

### Tab Bar Customization

`tabBarExtraContent` supports either a node or `{ left?: JSX.Element; right?: JSX.Element }`.

If a node is provided, treat it as right-side extra content.

`tabBarGutter` applies spacing between tab items.

`tabBarStyle` applies to the header/tab bar element.

`centered` centers the tab list within the header.

`indicator` supports:

```ts
{
  size?: number | ((origin: number) => number)
  align?: 'start' | 'center' | 'end'
}
```

The indicator should be implemented as a DOM element rather than only as `::after`, so semantic class/style slots can target it.

### Render Tab Bar

`renderTabBar` receives the computed tab bar props and a default tab bar component. It can return a replacement Solid element.

The design should expose a Solid-native signature, not React's exact class-component type:

```ts
type RenderTabBar = (
  props: TabsDefaultTabBarProps,
  DefaultTabBar: (props: TabsDefaultTabBarProps) => JSX.Element,
) => JSX.Element
```

The props object must include the active key, items, placement, editable config, extra content, styles, semantic class names, and event callbacks needed to recreate the default bar.

### Overflow and More Menu

Implement a responsive overflow menu using existing Solid utilities and repository components where practical.

The target is antd-compatible API and user-visible behavior, not a line-by-line port of the `rc-tabs` visible-range algorithm.

Behavior requirements:

- When tabs do not fit the header, move trailing hidden tabs into a "more" popup.
- `more.icon` customizes the trigger icon.
- `more.trigger` supports at least `'hover'` and `'click'` if the existing Dropdown supports them.
- Other dropdown-like options can be typed conservatively around the project's existing `DropdownProps` rather than importing rc types.
- Selecting a hidden tab from the menu activates it through the same `onTabClick` and `onChange` flow as visible tabs.
- `onTabScroll({ direction })` fires when the tab list scrolls horizontally or vertically. It should report `'left' | 'right' | 'top' | 'bottom'`.

The overflow implementation may use `ResizeObserver` and measured tab widths/heights. In tests, expose behavior through deterministic layout mocks rather than depending on browser layout in jsdom.

## Styling

Styles should preserve the current visual baseline while extending states:

- Root classes: `${prefixCls}`, `${prefixCls}-${placement}`, `${prefixCls}-${type}`, `${prefixCls}-${size}`.
- For placement, use `top`, `bottom`, `start`, `end`.
- Add layout classes for nav/header/content, tab list, operations, add button, remove button, indicator, extra content, and popup.
- Use existing theme tokens through `getComponentToken('Tabs', token)`.
- Keep keyboard focus visible.
- Ensure editable-card remove/add controls have stable dimensions.
- Ensure long labels truncate rather than resizing controls unexpectedly.

## Documentation

Update `apps/docs/src/pages/components/tabs.mdx` to document only non-deprecated antd 6 parity APIs plus the Solid naming note for `class`.

Add demos for:

- Basic items
- Placement
- Editable card
- Extra content
- Customized indicator
- Destroy on hidden and force render
- Semantic `classNames` / `styles`
- Overflow / more when many tabs are present

Do not document `popupClassName`, `tabPosition`, or `destroyInactiveTabPane` as parity APIs.

## Testing Strategy

Use TDD for implementation. Each feature group starts with a failing test in `packages/components/src/tabs/__tests__/tabs.test.tsx`, then minimal implementation, then refactor.

Required coverage:

- Existing behavior remains green.
- `destroyOnHidden` global and item-level behavior.
- `forceRender` renders inactive panes before activation.
- `onTabClick` fires for active and inactive enabled tabs and includes the event.
- `onChange` fires only when active key changes.
- `tabPlacement` applies placement classes and DOM order.
- `type="editable-card"` renders add/remove controls and calls `onEdit`.
- `hideAdd`, `addIcon`, `removeIcon`, item `closable`, and item `closeIcon`.
- `icon` renders before label.
- `tabBarExtraContent`, `tabBarGutter`, `tabBarStyle`, `centered`, and `indicator`.
- `classNames` and `styles` object and function forms for every semantic slot.
- `renderTabBar` receives default props and can replace the bar.
- Overflow hidden tabs appear in the more menu and menu selection activates the tab.
- `onTabScroll` reports direction.
- Solid `class` is merged onto the root, and item `class` applies to panes.

Run the repository verification commands from `AGENTS.md` after implementation:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

## Risks

Overflow behavior is the largest risk because jsdom does not compute layout. The implementation should isolate measurement logic so tests can mock dimensions deterministically.

`renderTabBar` needs a Solid-native API shape. It should be documented as semantically aligned with antd 6 but not a byte-for-byte React type clone.

`animated` can initially be represented through classes and styles for ink-bar/pane transitions. It should not introduce a full motion dependency unless needed for existing project patterns.

## Out of Scope

- Deprecated antd APIs that are not already present.
- A direct port of `rc-tabs`.
- Pixel-perfect reproduction of rc-tabs overflow internals.
- React-style `className` support for the new Tabs API.
