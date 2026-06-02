# ant-design-solid Data Display Components Design

Date: 2026-06-02

## Summary

Add the next Ant Design-inspired data display component batch to `ant-design-solid`:

- `Table`
- `Tag`
- `Badge`

This batch focuses on common business UI needs after the existing foundation, form, and feedback components. The goal is a practical MVP that is useful in application pages while preserving the repository's existing component architecture, token-driven styling, documentation pattern, and verification standards.

## Current Context

The repository already includes:

- A pnpm monorepo with packages for `@ant-design-solid/core`, `@ant-design-solid/theme`, `@ant-design-solid/cssinjs`, and `@ant-design-solid/icons`.
- A SolidJS docs app under `apps/docs` using file routes.
- Existing component batches:
  - Foundation/layout/display: `ConfigProvider`, `Button`, `Input`, `Space`, `Typography`, `Grid`.
  - Form components: `Form`, `Select`, `Checkbox`, `Radio`, `Switch`, `Input.TextArea`.
  - Feedback components: `Alert`, `Message`, `Notification`, `Modal`, `Modal.confirm`, `Popconfirm`.
- Component conventions under `packages/components/src/<component>/`:
  - `interface.ts`
  - component implementation file
  - style registration file
  - `index.ts`
  - colocated tests under `__tests__/`
- Docs pages under `apps/docs/src/routes/components/` and navigation in `apps/docs/src/site/nav.ts`.
- A repository rule that TypeScript source files under `apps/` and `packages/` must use lowercase kebab-case file names.

This batch should follow those conventions and avoid introducing a new architecture.

## Goals

1. Add MVP data display components that cover common business pages.
2. Keep APIs familiar to Ant Design users while staying Solid-native.
3. Extend the theme package with component tokens for `Table`, `Tag`, and `Badge`.
4. Add tests for rendering, key props, event callbacks, prefix classes, and style registration.
5. Add docs pages and nav entries for the new components.
6. Keep verification passing: lint, format check, typecheck, tests, and build.

## Non-goals

This milestone does not include:

- Full Ant Design Table parity.
- Table pagination UI.
- Table sorting or filtering logic.
- Row selection.
- Expandable rows.
- Fixed columns or fixed header.
- Virtual scrolling.
- Tree data.
- Editable table cells.
- Tag icons or preset semantic icon sets.
- Badge ribbon.
- Pixel-perfect Ant Design styling.

## Recommended Approach

Use a focused business MVP batch:

- Implement a simple, typed `Table` for static tabular display.
- Implement lightweight `Tag` and `Badge` components that are broadly useful in table cells and detail pages.
- Add theme tokens and docs for all three.

This approach avoids over-investing in complex Table features before the rest of the component library has enough data display primitives. It also creates a useful combination: `Table` rows can demonstrate `Tag` and `Badge` inside cells.

## Architecture

### File Structure

Add these files:

```txt
packages/components/src/table/interface.ts
packages/components/src/table/table.style.ts
packages/components/src/table/table.tsx
packages/components/src/table/index.ts
packages/components/src/table/__tests__/table.test.tsx

packages/components/src/tag/interface.ts
packages/components/src/tag/tag.style.ts
packages/components/src/tag/tag.tsx
packages/components/src/tag/index.ts
packages/components/src/tag/__tests__/tag.test.tsx

packages/components/src/badge/interface.ts
packages/components/src/badge/badge.style.ts
packages/components/src/badge/badge.tsx
packages/components/src/badge/index.ts
packages/components/src/badge/__tests__/badge.test.tsx

apps/docs/src/routes/components/table.tsx
apps/docs/src/routes/components/tag.tsx
apps/docs/src/routes/components/badge.tsx
```

Modify:

```txt
packages/components/src/index.ts
packages/theme/src/types.ts
packages/theme/src/components.ts
packages/theme/src/__tests__/theme.test.ts
apps/docs/src/site/nav.ts
```

All new TypeScript file names must be lowercase kebab-case.

## Theme Tokens

Extend `ComponentTokenMap` with `Table`, `Tag`, and `Badge`.

### Table token responsibilities

Suggested tokens:

- `headerBg`
- `headerColor`
- `rowHoverBg`
- `borderColor`
- `cellPadding`
- `cellPaddingSm`
- `cellPaddingLg`
- `borderRadius`
- `emptyColor`

### Tag token responsibilities

Suggested tokens:

- `defaultBg`
- `defaultColor`
- `borderColor`
- `borderRadius`
- `paddingInline`
- `fontSize`
- `lineHeight`
- `closeIconColor`

### Badge token responsibilities

Suggested tokens:

- `indicatorHeight`
- `indicatorHeightSm`
- `dotSize`
- `textFontSize`
- `textFontSizeSm`
- `colorBg`
- `colorText`
- `statusSize`

Token defaults should derive from existing global tokens where possible and support component-level overrides through `ConfigProvider`.

## Table Design

### Public API

`@ant-design-solid/core` exports:

- `Table`
- `TableProps`
- `TableColumn`
- related table types

### Props

`Table<T>` supports:

- `columns: TableColumn<T>[]`
- `dataSource?: T[]`
- `rowKey?: keyof T | ((record: T, index: number) => string | number)`
- `loading?: boolean`
- `emptyText?: JSX.Element | string`
- `size?: 'small' | 'middle' | 'large'`
- `bordered?: boolean`
- `showHeader?: boolean`
- `onRow?: (record: T, index: number) => JSX.HTMLAttributes<HTMLTableRowElement>`
- `class?: string`
- `classList?: Record<string, boolean | undefined>`
- `style?: JSX.CSSProperties | string`

### Columns

`TableColumn<T>` supports:

- `title?: JSX.Element | string`
- `dataIndex?: keyof T | string`
- `key?: string`
- `render?: (value: unknown, record: T, index: number) => JSX.Element`
- `width?: number | string`
- `align?: 'left' | 'center' | 'right'`
- `class?: string`
- `classList?: Record<string, boolean | undefined>`

`dataIndex` is a direct property lookup only. Dotted paths such as `user.name` are treated as literal keys, not nested paths.

### Rendering Behavior

- Render a semantic `<table>` wrapped in a root div.
- Render `<thead>` unless `showHeader={false}`.
- Render one `<tr>` per record.
- Use `rowKey` when provided; otherwise fall back to `record.key`, then array index.
- Render `loading` as a simple overlay or loading row, based on the existing style pattern.
- Render an empty row when `dataSource` is empty.
- Apply size, bordered, and prefix classes consistently.

### Error Handling

- Missing `columns` should render an empty table structure without throwing.
- Missing `dataSource` should behave like an empty array.
- If `render` returns `undefined` or `null`, render an empty cell.

## Tag Design

### Public API

`@ant-design-solid/core` exports:

- `Tag`
- `TagProps`

### Props

`Tag` supports:

- `children?: JSX.Element`
- `color?: string`
- `closable?: boolean`
- `onClose?: (event: MouseEvent) => void`
- `bordered?: boolean`
- `class?: string`
- `classList?: Record<string, boolean | undefined>`
- `style?: JSX.CSSProperties | string`

### Rendering Behavior

- Render a compact inline element.
- Apply preset-like styling for common semantic colors if easy to support through CSS variables.
- For arbitrary `color`, use it as the tag background cue while preserving readable text where practical.
- If `closable`, render a button-like close affordance and call `onClose` when clicked.
- Do not automatically remove the tag from the DOM; visibility remains controlled by the parent.

## Badge Design

### Public API

`@ant-design-solid/core` exports:

- `Badge`
- `BadgeProps`
- `BadgeStatus`

### Props

`Badge` supports:

- `count?: number | string`
- `dot?: boolean`
- `status?: 'success' | 'processing' | 'default' | 'error' | 'warning'`
- `text?: JSX.Element | string`
- `overflowCount?: number`
- `showZero?: boolean`
- `children?: JSX.Element`
- `class?: string`
- `classList?: Record<string, boolean | undefined>`
- `style?: JSX.CSSProperties | string`

### Rendering Behavior

- With `children`, render a wrapper around children and position the badge indicator at the top-right.
- Without `children` and with `status`, render status dot plus optional text inline.
- `dot` renders a small dot instead of numeric content.
- Numeric `count` greater than `overflowCount` renders `${overflowCount}+`.
- `count={0}` hides the badge unless `showZero` is true.
- `status='processing'` may use a simple pulse animation if consistent with existing motion tokens.

## Docs

Add component pages:

- `Table`: basic usage, bordered/size, custom render with `Tag` and `Badge`, loading/empty states.
- `Tag`: basic tags, colors, closable tags, bordered variant.
- `Badge`: count, overflow count, dot, status, badge with children.

Update navigation near existing component entries. A reasonable order is:

- Table
- Tag
- Badge

near other display components, before feedback components.

## Testing

### Table tests

Cover:

- Renders headers and rows.
- Reads values through `dataIndex`.
- Uses `render` for custom cells.
- Supports `rowKey` as string key and function.
- Supports `showHeader={false}`.
- Renders empty text when no data.
- Applies prefix, bordered, and size classes.
- Invokes row event handlers returned from `onRow`.

### Tag tests

Cover:

- Renders children.
- Applies prefix and color classes/styles.
- Renders close button when `closable`.
- Calls `onClose` on close click.
- Applies bordered state.

### Badge tests

Cover:

- Renders count.
- Handles `overflowCount`.
- Hides zero by default and shows zero with `showZero`.
- Renders dot mode.
- Renders status and text.
- Renders wrapped children mode.
- Applies prefix classes.

### Theme tests

Cover:

- Default component tokens exist for `Table`, `Tag`, and `Badge`.
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

### Table scope creep

Risk: Table can quickly grow into a large subsystem.

Mitigation: Keep this milestone focused on static rendering and explicit non-goals. Add only API shapes that are directly implemented.

### Generic typing complexity

Risk: Solid JSX plus generic component types can become awkward.

Mitigation: Prefer simple exported generic types and avoid clever inference if it hurts maintainability.

### Arbitrary Tag color readability

Risk: Arbitrary background colors can produce poor contrast.

Mitigation: Use arbitrary `color` as a visual cue with conservative text/border styling rather than attempting full contrast calculation.

### Badge layout edge cases

Risk: Positioned badge indicators can be hard to align for all child sizes.

Mitigation: Implement a simple top-right absolute indicator that works for common inline-block children and document it as MVP behavior.
