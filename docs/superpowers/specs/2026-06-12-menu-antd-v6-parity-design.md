# Menu Ant Design v6 Parity Design

## Goal

Bring `Menu` close to Ant Design v6 API parity while keeping Solid conventions: use `class` instead of `className`, use Solid `JSX.Element` types, keep data-driven `items`, and add compound component syntax through `Menu.Item`, `Menu.SubMenu`, `Menu.Divider`, and `Menu.ItemGroup`.

## Scope

This work updates:

- `packages/components/src/menu/interface.ts`
- `packages/components/src/menu/menu.tsx`
- `packages/components/src/menu/menu.style.ts`
- `packages/components/src/menu/index.ts`
- `packages/components/src/menu/__tests__/menu.test.tsx`
- `apps/docs/src/pages/components/menu.mdx`

The component should support both `items` and JSX compound children. `items` remains the preferred Solid docs path because it is easier to type and serialize, but JSX compound components should be available for API parity and ergonomics.

## Public API

Top-level `MenuProps` should include:

- Existing props: `items`, `mode`, `selectedKeys`, `defaultSelectedKeys`, `openKeys`, `defaultOpenKeys`, `inlineCollapsed`, `zIndex`, `getPopupContainer`, `onClick`, `onSelect`, `onOpenChange`.
- Ant Design v6 parity props adapted for Solid: `classNames`, `styles`, `expandIcon`, `forceSubMenuRender`, `inlineIndent`, `multiple`, `overflowedIndicator`, `selectable`, `subMenuCloseDelay`, `subMenuOpenDelay`, `tooltip`, `theme`, `triggerSubMenuAction`, `onDeselect`, `popupRender`.

Item types should include:

- `MenuItemType`: `key`, `label`, `icon`, `disabled`, `danger`, `extra`, `title`, `class`, `style`, `children` is not allowed.
- `SubMenuType`: `key`, `label`, `icon`, `disabled`, `children`, `popupClass`, `popupOffset`, `theme`, `onTitleClick`, `popupRender`, `class`, `style`.
- `MenuItemGroupType`: `type: 'group'`, optional `key`, `label`, optional `children`, `class`, `style`.
- `MenuDividerType`: `type: 'divider'`, optional `key`, `dashed`, `class`, `style`.
- `MenuItem` should allow `null` so conditional item arrays mirror antd `ItemType[]`.

Compound components should be attached to `Menu`:

- `Menu.Item`
- `Menu.SubMenu`
- `Menu.Divider`
- `Menu.ItemGroup`

Compound component props should use Solid names: `class`, `style`, and `children`.

## Architecture

Use one internal normalized item tree. `items` and compound `children` both normalize into this structure, and all rendering and behavior uses the normalized tree. This avoids separate paths for selection, submenu open state, popup rendering, and styles.

`menu.tsx` can stay as the main component file, but helper functions should keep responsibilities clear:

- Type guards and key helpers.
- Child normalization for compound components.
- Selection and deselection logic.
- Submenu trigger logic with click and hover timers.
- Popup positioning and rendering.
- Semantic class/style lookup.

No React-style `className` API should be added. Where antd uses `popupClassName`, use `popupClass`; docs can mention that this is the Solid-style equivalent.

## Behavior

Selection:

- Default `selectable` is `true`.
- When `selectable={false}`, item clicks still call `onClick` but do not update selected keys and do not call `onSelect` or `onDeselect`.
- Default selection is single-select.
- With `multiple`, clicking an unselected item appends the key and calls `onSelect`.
- With `multiple`, clicking a selected item removes the key and calls `onDeselect`.
- Controlled `selectedKeys` should call callbacks without mutating internal selection.

Submenus:

- Default `triggerSubMenuAction` is `hover` to match antd.
- Click trigger toggles on submenu title click.
- Hover trigger opens after `subMenuOpenDelay` seconds and closes after `subMenuCloseDelay` seconds.
- Keyboard activation should keep click-like behavior for accessibility.
- `onTitleClick` should fire before open state changes.
- `forceSubMenuRender` keeps submenu lists mounted while hidden.

Rendering:

- `expandIcon` customizes the submenu arrow. It can be a node or a function receiving submenu info.
- `inlineIndent` controls nested inline item indentation.
- `popupOffset` adjusts popup `left` and `top`.
- `popupRender` can wrap or replace submenu popup content. Submenu-level `popupRender` takes precedence over menu-level `popupRender`.
- `theme` adds light/dark classes at menu and submenu level.
- `danger`, `extra`, `title`, and divider `dashed` render visible class/state changes.
- `tooltip` should support collapsed item title rendering in a Solid-friendly, lightweight way. If a full Tooltip component is available and easy to use, use it; otherwise set a native `title` in collapsed inline mode and document this as the supported behavior.

Horizontal overflow:

- Expose `overflowedIndicator` and render it in horizontal mode when a future overflow implementation needs it.
- Full rc-menu-style width measurement and dynamic overflow redistribution is not required for this pass unless it can be added safely without a large layout engine.

## Semantic Classes And Styles

Add semantic customization with Solid names:

- `classNames?: Partial<Record<MenuSemanticName, string>> | ((info: { props: MenuProps }) => Partial<Record<MenuSemanticName, string>>)`
- `styles?: Partial<Record<MenuSemanticName, JSX.CSSProperties>> | ((info: { props: MenuProps }) => Partial<Record<MenuSemanticName, JSX.CSSProperties>>)`

Supported semantic names should cover practical DOM targets:

- `root`
- `item`
- `itemIcon`
- `itemContent`
- `itemExtra`
- `submenu`
- `submenuTitle`
- `submenuArrow`
- `submenuList`
- `submenuPopup`
- `group`
- `groupTitle`
- `groupList`
- `divider`

These names should be documented and tested on representative elements.

## Docs

Update `apps/docs/src/pages/components/menu.mdx`:

- Add demos for compound components.
- Add demos for multiple selection and deselection.
- Add demos for click and hover submenu behavior.
- Add demos for custom expand icon and popup render.
- Add demos for danger, extra, title, dashed divider, and themes.
- Add demos for semantic `classNames` and `styles`.
- Update API tables for `Menu`, `MenuItem`, `SubMenu`, `MenuItemGroup`, `MenuDivider`, and compound components.
- Use `class`, `popupClass`, and Solid `JSX.Element` terminology.

## Testing

Use test-first implementation. Focused tests should cover:

- `selectable={false}` still emits `onClick` but not select callbacks.
- `multiple` appends selected keys and deselects selected keys.
- Controlled selected keys do not mutate DOM selection until props change.
- `triggerSubMenuAction="click"` toggles on click.
- Hover trigger honors open and close delays with fake timers.
- `onTitleClick` receives key and event.
- `expandIcon`, `inlineIndent`, `popupOffset`, `popupRender`, and `forceSubMenuRender`.
- Item `danger`, `extra`, `title`; divider `dashed`; submenu `popupClass`; theme classes.
- Compound component children normalize into the same behavior as `items`.
- Semantic `classNames` and `styles` attach to expected elements.

After implementation, run the repository verification commands listed in `AGENTS.md` if time allows. At minimum, run the Menu test file and relevant typecheck/build commands, and report any command that cannot complete.

## Non-Goals

- Exact pixel-for-pixel rc-menu horizontal overflow measurement is not required.
- React `className` compatibility is not added.
- Deprecated internal antd props are not added.
- The component should not introduce a new runtime dependency unless the existing codebase already depends on it.
