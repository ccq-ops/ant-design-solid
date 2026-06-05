# Button Icon Ant Design Alignment Design

## Goal

Align `Button` icon support with Ant Design by accepting icons from `@ant-design-solid/icons` through the `icon` prop and supporting `iconPosition`.

## Scope

- Add `icon?: JSX.Element` to `ButtonProps`.
- Add `iconPosition?: 'start' | 'end'` to `ButtonProps`, defaulting to `'start'`.
- Continue using `LoadingOutlined` from `@ant-design-solid/icons` for loading state.
- When `loading` is true, the loading icon replaces the custom icon.
- Render the icon before children for `start`, after children for `end`.
- Preserve disabled-on-loading behavior and existing button classes.

## Architecture

`packages/components/src/button/button.tsx` remains responsible for Button rendering. It will derive a single `iconNode` from `loading` and `icon`, then render it through a small local helper that applies Ant Design-like wrapper classes.

`packages/components/src/button/button.style.ts` will keep the current `.ads-btn-icon` selector and add directional spacing classes for start and end placement.

## Testing

Update `packages/components/src/button/__tests__/button.test.tsx` to cover:

- Rendering a `SearchOutlined` icon from `@ant-design-solid/icons` using the `icon` prop.
- Rendering the icon after children when `iconPosition="end"`.
- Showing `LoadingOutlined` instead of the custom icon when `loading` is true.
