# Data Display Components Design

Date: 2026-06-02

## Summary

Implement three Ant Design Solid data-display components: `Statistic`, `Descriptions`, and `List`. The goal is to expand common data presentation coverage while following the existing package conventions for component source files, tests, documentation routes, style registration, and public exports.

## Scope

### Included

- `Statistic` for compact metric display.
- `Descriptions` for label-value detail blocks.
- `List` for simple structured list rendering.
- Unit tests for each component.
- Documentation/demo route for each component.
- Public exports and docs navigation/route updates.

### Excluded

- Virtual scrolling.
- Built-in remote data fetching.
- Built-in pagination logic for `List`.
- Complex responsive breakpoint objects for `Descriptions.column`.
- Advanced formatter pipelines for `Statistic` beyond precision, prefix, suffix, and style.

These exclusions keep the batch focused enough to implement and verify in one pass.

## Repository Conventions

Each component will use the current component layout:

```text
packages/components/src/<component>/
  __tests__/<component>.test.tsx
  <component>.tsx
  <component>.style.ts
  interface.ts
  index.ts
```

All new TypeScript file names must be lowercase kebab-case. Dot suffixes such as `.test.tsx` are allowed when each segment remains lowercase kebab-case.

Docs routes will be added under:

```text
apps/docs/src/routes/components/<component>.tsx
```

The following files will be updated:

- `packages/components/src/index.ts`
- `apps/docs/src/site/nav.ts`
- `apps/docs/src/site/routes.ts`

## Component Designs

### Statistic

`Statistic` renders a title and a formatted value. The component is intentionally presentational and does not manage timers or async loading beyond a visual loading state.

Supported props:

- `title?: JSX.Element`
- `value?: string | number`
- `precision?: number`
- `prefix?: JSX.Element`
- `suffix?: JSX.Element`
- `loading?: boolean`
- `valueStyle?: JSX.CSSProperties`
- `class?: string`
- `className?: string`
- `style?: JSX.CSSProperties | string`

Formatting rules:

- Numeric values use `precision` when provided.
- Non-numeric values render as-is.
- Prefix and suffix render around the formatted value.
- Loading state replaces the content with a lightweight skeleton-like block.

### Descriptions

`Descriptions` renders label-value pairs in a table-like layout. It supports both an `items` API and `Descriptions.Item` children.

Supported props:

- `title?: JSX.Element`
- `extra?: JSX.Element`
- `bordered?: boolean`
- `column?: number`
- `size?: 'default' | 'middle' | 'small'`
- `layout?: 'horizontal' | 'vertical'`
- `items?: DescriptionsItemType[]`
- `children?: JSX.Element`
- `class?: string`
- `className?: string`
- `style?: JSX.CSSProperties | string`

`Descriptions.Item` props:

- `label?: JSX.Element`
- `children?: JSX.Element`
- `span?: number`
- `class?: string`
- `className?: string`
- `style?: JSX.CSSProperties | string`

Rendering rules:

- `items` and children are normalized into the same internal item list.
- `items` are preferred when both `items` and children are supplied.
- `column` defaults to `3`.
- `span` defaults to `1` and is clamped to the current column count.
- Horizontal layout renders label and content side by side.
- Vertical layout renders labels in one row and values in the next row.
- Bordered mode adds table-like borders; unbordered mode uses lighter spacing.

### List

`List` renders a collection with optional header, footer, loading, empty, and item metadata support.

Supported props:

- `dataSource?: T[]`
- `renderItem?: (item: T, index: number) => JSX.Element`
- `header?: JSX.Element`
- `footer?: JSX.Element`
- `bordered?: boolean`
- `split?: boolean`
- `size?: 'default' | 'large' | 'small'`
- `loading?: boolean`
- `emptyText?: JSX.Element`
- `children?: JSX.Element`
- `class?: string`
- `className?: string`
- `style?: JSX.CSSProperties | string`

`List.Item` props:

- `actions?: JSX.Element[]`
- `extra?: JSX.Element`
- `children?: JSX.Element`
- `class?: string`
- `className?: string`
- `style?: JSX.CSSProperties | string`

`List.Item.Meta` props:

- `avatar?: JSX.Element`
- `title?: JSX.Element`
- `description?: JSX.Element`
- `class?: string`
- `className?: string`
- `style?: JSX.CSSProperties | string`

Rendering rules:

- If `loading` is true, render a loading placeholder inside the list body.
- If `dataSource` is empty and no children are present, render `emptyText` or a default empty message.
- If `dataSource` and `renderItem` are provided, render each item through `renderItem`.
- If children are provided without `dataSource`, render children directly.
- `split` defaults to true and controls item separators.

## Styling

Each component will use the existing css-in-js style registration pattern found in nearby components. Styles should use Ant-like class names under the project prefix from `ConfigProvider`, including:

- `<prefix>-statistic`
- `<prefix>-descriptions`
- `<prefix>-list`

Styles should cover base layout, size variants, bordered/split variants, loading/empty states, and item/meta sub-elements. Keep styles self-contained and avoid global selectors beyond component class scopes.

## Testing

Add unit tests for each component covering:

- Basic render.
- Key props and variants.
- Items/dataSource APIs.
- Children APIs.
- Static subcomponents (`Descriptions.Item`, `List.Item`, `List.Item.Meta`).
- Class/style merging where applicable.
- Loading and empty states.

Run the repository verification commands after implementation:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

## Documentation

Each docs page will include concise demos:

- `Statistic`: basic, precision/prefix/suffix, loading.
- `Descriptions`: basic, bordered, vertical layout.
- `List`: dataSource/renderItem, item meta/actions, loading/empty.

Docs navigation should place the new components in the data-display section alongside existing components such as Table, Tag, Badge, Avatar, and Empty.
