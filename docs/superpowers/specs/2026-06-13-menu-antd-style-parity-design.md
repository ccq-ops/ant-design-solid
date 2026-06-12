# Menu Ant Design Style Parity Design

## Goal

Make the Solid `Menu` component visually closer to Ant Design v6 while keeping the existing Solid API and local token system. The work focuses on spacing, selected states, horizontal navigation behavior, popup elevation, dark mode, groups, dividers, danger items, and inline collapsed layout.

## Scope

Primary file:

- `packages/components/src/menu/menu.style.ts`

Supporting files:

- `packages/components/src/menu/menu.tsx` only if a class hook is needed for style accuracy.
- `packages/components/src/menu/__tests__/menu.test.tsx` for style regression tests that assert generated CSS contains important antd-like selectors.
- `apps/docs/src/pages/components/menu.mdx` only if examples need minor wording or class changes after style updates.

Do not touch unrelated button or modal changes already present in the worktree.

## Visual Targets

The implementation should move toward these Ant Design menu characteristics:

- Default vertical and inline menu items use about 40px height, 8px radius, and stable 4px vertical rhythm.
- Inline collapsed menu uses an antd-like width around 80px and centers icons.
- Inline and vertical selected items use primary text, a light selected background, and an inline active bar on the end edge.
- Horizontal menu acts like top navigation: transparent item background, fixed nav height around 46px, hover/selected text color changes, and a 2px bottom active bar for selected entries.
- Popup submenus look elevated: min width, white/elevated background, radius, shadow, padding, and no browser-list feel.
- Group titles use muted color, small font, and consistent padding/line height.
- Dividers have controlled margins and dashed variants.
- Danger items have danger text and selected/hover treatment.
- Dark theme should style root, popup, item hover, selected, disabled, group title, divider, and active bars coherently.

## Constraints

- Do not import Ant Design CSS or add a new dependency.
- Do not add React-style `className` or `popupClassName`.
- Use existing `AliasToken` fields only.
- Keep existing semantic `classNames` / `styles` API working.
- Avoid brittle pixel-perfect tests. Use tests to assert important CSS selectors and representative values exist.

## Test Strategy

Add tests that inspect injected style text after rendering a Menu. These should verify:

- The stylesheet contains `ads-menu-inline-collapsed` width `80px`.
- The stylesheet contains horizontal selected active-bar selectors.
- The stylesheet contains submenu popup min-width and box-shadow selectors.
- The stylesheet contains inline/vertical selected active-bar selectors.
- The stylesheet contains dark theme selected/hover selectors.

Run the existing Menu behavior tests to ensure style changes do not break rendering or behavior.

## Non-Goals

- Pixel-perfect screenshots against antd.
- Full rc-menu overflow measurement.
- Adding component-token infrastructure equivalent to antd's internal `ComponentToken`.
