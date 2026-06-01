# ant-design-solid MVP Design

Date: 2026-06-01

## Summary

Build `ant-design-solid`, an Ant Design-inspired component library implemented with SolidJS. The first milestone is a monorepo MVP that establishes the engineering foundation, documentation site, theme system, Solid-native CSS-in-JS runtime, and a small set of core components.

The MVP prioritizes stable architecture and repeatable component patterns over full Ant Design feature parity.

## Confirmed Scope

- Repository name: `ant-design-solid`
- Package manager: pnpm 11
- Build tool: Vite 8
- Runtime/framework: SolidJS
- Node requirement: `>=22`
- Documentation site: Vite + SolidJS custom app
- Styling approach: Solid-native CSS-in-JS
- First components:
  - `ConfigProvider`
  - `Button`
  - `Input`
  - `Space`
  - `Typography`
  - `Grid` (`Row`, `Col`)

## Version Assumptions

The project targets current 2026 tooling:

- Vite 8 was announced by the Vite team on 2026-03-12 and ships Rolldown as its unified bundler.
- pnpm 11 was announced by the pnpm team on 2026-04-28 and requires Node.js 22 or newer.

These assumptions drive the `engines.node >=22` constraint and the Vite 8-based package/app build setup.

## Goals

1. Create a pnpm workspace monorepo suitable for publishing multiple packages.
2. Implement a SolidJS component library with Ant Design-like design language and APIs.
3. Implement a Solid-native CSS-in-JS foundation with token-driven styling.
4. Provide a docs site that uses the real workspace components.
5. Establish tests, type checking, linting, formatting, and build scripts.

## Non-goals for MVP

- Full Ant Design component parity.
- Pixel-perfect React antd implementation cloning.
- React compatibility APIs such as React refs or ReactNode-specific typing.
- Full SSR style extraction, although APIs should be shaped to support it later.
- Complete responsive breakpoint observer for Grid.
- Complex Typography features such as editable/copyable/expandable text.
- Input subcomponents such as `TextArea`, `Password`, and `Search`.

## Monorepo Architecture

```txt
ant-design-solid/
  apps/
    docs/
  packages/
    components/
    cssinjs/
    theme/
    icons/
  docs/
    superpowers/specs/
  scripts/
  package.json
  pnpm-workspace.yaml
  tsconfig.base.json
  eslint.config.js
  prettier.config.js
  vitest.config.ts
```

### Packages

#### `@ant-design-solid/core`

The main user-facing component package. It exports:

- `ConfigProvider`
- `Button`
- `Input`
- `Space`
- `Typography`
- `Row`
- `Col`
- Related prop and token types

It depends on `@ant-design-solid/theme` and `@ant-design-solid/cssinjs`.

#### `@ant-design-solid/cssinjs`

A Solid-native CSS-in-JS runtime. It is an independent package because SSR extraction, custom caches, style ordering, and advanced theme integrations should be available to advanced users later.

#### `@ant-design-solid/theme`

The token and theme algorithm package. It owns seed tokens, alias token derivation, default component token derivation, and shared token types. It should not depend on components.

#### `@ant-design-solid/icons`

Reserved for icon support. MVP can keep this minimal or empty, but the package boundary should exist if icons are needed by documentation or component examples.

#### `@ant-design-solid/docs`

The Vite + SolidJS documentation app. It imports packages through workspace dependencies and acts as a dogfooding app.

## Theme System

The theme model follows the Ant Design v5 idea of layered tokens:

```txt
Seed Token
  -> algorithm
Alias Token
  -> component derivation
Component Token
```

### Theme package exports

`@ant-design-solid/theme` should provide:

- `defaultSeedToken`
- `defaultAlgorithm(seed)`
- `getComponentToken(componentName, token)`
- `SeedToken`
- `AliasToken`
- `GlobalToken`
- `ComponentTokenMap`

### Token responsibilities

Seed tokens include foundational choices:

- primary color
- success/warning/error/info colors
- border radius
- font sizes
- spacing scale
- motion durations/easing
- shadow values

Alias tokens include derived semantic values:

- `colorPrimaryHover`
- `colorPrimaryActive`
- `colorText`
- `colorTextSecondary`
- `colorBorder`
- `colorBgContainer`
- `controlHeight`
- `lineWidth`

Component tokens refine global tokens for component-specific styling, for example:

- Button padding, height, border radius, font weight
- Input active border color, hover border color, clear icon color
- Space gap presets
- Typography title margins and weights
- Grid gutter behavior

## ConfigProvider

`ConfigProvider` is the root configuration entry for component behavior and theme.

Example:

```tsx
<ConfigProvider
  prefixCls="ads"
  theme={{
    token: { colorPrimary: '#1677ff' },
    components: {
      Button: { borderRadius: 8 },
    },
  }}
>
  <App />
</ConfigProvider>
```

### Context values

The provider should expose:

- `prefixCls`
- `theme`
- `mergedToken`
- `hashId`
- `componentSize`
- `direction` (reserved for RTL support)

Nested providers should merge with parent context rather than replace it wholesale.

### Public helpers

The component package should export:

- `ConfigProvider`
- `useConfig`
- `useToken`

## CSS-in-JS Runtime

`@ant-design-solid/cssinjs` should be built around Solid context, memoization, and effects. It should not copy React lifecycle assumptions.

### Public API

```tsx
<StyleProvider hashPriority="low">
  <App />
</StyleProvider>
```

```ts
const [wrapSSR, hashId] = useStyleRegister(
  {
    theme,
    token,
    path: ['Button', prefixCls],
  },
  () => ({
    [`.${prefixCls}-btn`]: {
      borderRadius: token.borderRadius,
      color: token.colorText,
    },
  }),
)
```

### MVP behavior

- Generate stable hashes from `theme + token + path`.
- Cache registered styles to avoid duplicate style tags.
- Insert browser styles as `<style data-ant-design-solid="...">`.
- Produce a hash class similar to `css-dev-only-do-not-override-xxxx` in development.
- Return a `wrapSSR(children)` function that initially returns `children`.
- Expose `extractStyle(cache)` as a real function in MVP. It should return serialized styles from the active cache when available, and return an empty string when no server-side cache has collected styles.

### Internal concerns

- Style serialization must be deterministic.
- Style registration should be idempotent.
- The runtime should support custom cache injection through `StyleProvider`.
- Style priority should be represented in the API even if only basic insertion ordering is implemented in MVP.

## Component API Strategy

The library should feel familiar to Ant Design users without forcing React-only concepts into SolidJS.

### Preserve Ant Design conventions

- Prop names such as `type`, `size`, `status`, `danger`, and `block`
- `ConfigProvider`
- Token naming style
- 24-column grid
- Familiar component names and visual hierarchy

### Solid-specific choices

- JSX children are Solid children.
- Events follow Solid DOM semantics, such as `onInput` and `onChange`.
- Types should use Solid JSX types, not React types.
- React refs and ReactNode-specific behavior are out of scope.

## MVP Components

Each component should follow a consistent file structure:

```txt
Button/
  index.ts
  Button.tsx
  button.style.ts
  interface.ts
  __tests__/
    Button.test.tsx
```

The package entry should export components and types:

```ts
export { Button } from './Button'
export type { ButtonProps } from './Button'
```

### ConfigProvider

Responsibilities:

- Global prefix class name
- Theme token overrides
- Component token overrides
- Global component size
- Direction reserved for future RTL support
- Nested provider merging

### Button

Example usage:

```tsx
<Button type="primary">Primary</Button>
<Button type="default" danger loading block size="large" />
```

Props:

- `type`: `default | primary | dashed | text | link`
- `size`: `small | middle | large`
- `htmlType`: `button | submit | reset`
- `disabled`
- `loading`
- `danger`
- `block`
- `class`
- `style`
- `onClick`

### Input

Example usage:

```tsx
<Input placeholder="请输入" />
<Input status="error" prefix={<SearchIcon />} suffix="RMB" allowClear />
```

Props:

- `value`
- `defaultValue`
- `placeholder`
- `size`
- `disabled`
- `status`: `error | warning`
- `prefix`
- `suffix`
- `allowClear`
- `onInput`
- `onChange`

MVP excludes `TextArea`, `Password`, and `Search`, but the directory structure can leave room for them later.

### Space

Example usage:

```tsx
<Space size="middle" direction="horizontal" wrap>
  <Button />
  <Button />
</Space>
```

Props:

- `size`: `small | middle | large | number | [number, number]`
- `direction`: `horizontal | vertical`
- `align`
- `wrap`
- `split`

### Typography

Example usage:

```tsx
<Typography.Title level={2}>Title</Typography.Title>
<Typography.Text type="secondary">Text</Typography.Text>
<Typography.Paragraph ellipsis>Paragraph</Typography.Paragraph>
```

MVP behavior:

- Semantic title levels
- Text type styling
- Paragraph base spacing
- Basic `ellipsis`

MVP excludes editable, copyable, and expandable behavior.

### Grid

Example usage:

```tsx
<Row gutter={[16, 24]}>
  <Col span={12}>A</Col>
  <Col span={12}>B</Col>
</Row>
```

Props:

- `Row`: `gutter`, `align`, `justify`, `wrap`
- `Col`: `span`, `offset`, `order`, `push`, `pull`

Behavior:

- 24-column layout
- Horizontal and vertical gutter support
- Responsive prop types reserved
- Breakpoint observer not required in MVP

## Documentation Site

`apps/docs` should be a custom Vite + SolidJS app.

### Pages

```txt
/
/docs/getting-started
/docs/theming
/components/button
/components/input
/components/space
/components/typography
/components/grid
/components/config-provider
```

### Layout

- Top navigation with logo, Docs, Components, an external repository link slot, and theme switch entry.
- Left navigation with Getting Started, Theming, and component links.
- Main content with explanations, live demos, code snippets, and API tables.
- Right anchor navigation can be added later.

### Dogfooding rule

All docs examples must import from the workspace component package rather than local mocks.

## Scripts and Developer Experience

Root scripts:

```json
{
  "scripts": {
    "dev": "pnpm --filter @ant-design-solid/docs dev",
    "build": "pnpm -r build",
    "test": "pnpm -r test",
    "typecheck": "pnpm -r typecheck",
    "lint": "pnpm -r lint",
    "format": "prettier --write ."
  }
}
```

Package responsibilities:

- `packages/components`: Vite library build and TypeScript declarations.
- `packages/cssinjs`: Vite library build and TypeScript declarations.
- `packages/theme`: Vite library build and TypeScript declarations.
- `apps/docs`: Vite app build.

## Testing Strategy

### Theme

- Seed token defaults.
- Alias token derivation.
- Component token override merging.

### CSS-in-JS

- Stable hash generation.
- Style serialization determinism.
- Duplicate registration deduplication.
- Browser style injection behavior.

### Components

- Button base rendering.
- Button type/size/danger/block/loading states.
- Input controlled and uncontrolled behavior.
- Input prefix/suffix/allowClear behavior.
- Space gap calculation.
- Typography semantic tag rendering.
- Row/Col 24-grid class/style generation.

### Docs

Docs do not need dedicated unit tests in MVP, but `pnpm build` must build the docs app successfully.

## Verification Commands

The completed MVP should support:

```bash
pnpm install
pnpm dev
pnpm build
pnpm test
pnpm typecheck
pnpm lint
```

Network access may be required for dependency installation. If dependency installation is blocked by sandbox restrictions, request approval rather than working around the package manager.

## Risks and Mitigations

### CSS-in-JS runtime scope creep

Risk: Recreating all Ant Design CSS-in-JS behavior can make the MVP too large.

Mitigation: Implement only deterministic hashing, caching, injection, and token-based style registration first. Keep SSR extraction and advanced priority handling as API-compatible extension points.

### Ant Design API over-compatibility

Risk: Trying to exactly copy React antd can create awkward Solid APIs.

Mitigation: Preserve familiar names and visual behavior while using Solid-native event and type semantics.

### Documentation framework complexity

Risk: Adding MDX or a full docs framework too early can delay component work.

Mitigation: Start with a custom Vite + SolidJS docs app and hand-written pages. Add MDX later only if needed.

### Tooling freshness

Risk: Vite 8 and pnpm 11 are new enough that ecosystem plugins may still be catching up.

Mitigation: Keep Vite config simple, minimize plugin surface, and use official Solid/Vite integration paths where possible.

## Acceptance Criteria

The MVP is accepted when:

1. The monorepo installs with pnpm 11 on Node.js 22 or newer.
2. The docs app starts with `pnpm dev`.
3. `@ant-design-solid/core` exports all MVP components.
4. Components use token-driven CSS-in-JS styles.
5. Theme overrides through `ConfigProvider` affect rendered component styles.
6. The docs site demonstrates every MVP component.
7. Build, test, typecheck, and lint scripts exist and are expected to pass.
