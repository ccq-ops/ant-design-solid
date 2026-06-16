# Dark Mode Theme Adaptation Design

## Goal

Adapt ant-design-solid to support Ant Design-style dark mode through the theme system, so applications can enable dark mode by passing a dark theme algorithm to `ConfigProvider` instead of relying on per-component dark CSS classes.

## Scope

This design implements the selected scope: **theme algorithm-level adaptation plus cleanup of obvious hardcoded light colors**.

Included:

- Add a dark theme algorithm to `@solid-ant-design/theme`.
- Extend `ThemeConfig` to accept an Ant Design-style `algorithm` field.
- Preserve current light-theme behavior when no algorithm is supplied.
- Make nested `ConfigProvider` theme merging preserve and override algorithms predictably.
- Replace obvious hardcoded light backgrounds/borders in representative component styles or component tokens where they would visibly break dark mode.
- Update the docs app theme switch to use the new dark algorithm.
- Add tests for theme algorithm behavior, ConfigProvider inheritance, and representative component dark-mode token output.

Excluded:

- Pixel-perfect parity with every official Ant Design dark component style.
- Full Ant Design color palette generation internals.
- A second CSS stylesheet or global `.dark` class strategy.
- Reworking semantic fixed-color visual effects such as image masks, tooltip contrast text, carousel overlays, color picker black/white gradients, or layout dark header/sider colors.

## Architecture

The theme package remains the single source of design tokens. Components continue to call `useToken()` and `getComponentToken()` and should not need to know whether the active theme is light or dark.

The public API adds an algorithm field matching the Ant Design v5 mental model:

```ts
import { darkAlgorithm } from '@solid-ant-design/theme'

<ConfigProvider theme={{ algorithm: darkAlgorithm }}>
  <App />
</ConfigProvider>
```

`ThemeConfig` will support:

```ts
export type ThemeAlgorithm = (seed: SeedToken) => AliasToken

export interface ThemeConfig {
  algorithm?: ThemeAlgorithm | ThemeAlgorithm[]
  token?: Partial<SeedToken>
  components?: { [K in keyof ComponentTokenMap]?: Partial<ComponentTokenMap[K]> }
}
```

`mergeTheme(config)` will merge `defaultSeedToken` with `config.token`, then apply algorithms. If no algorithm is supplied, `defaultAlgorithm` is used. If a single algorithm is supplied, it is applied to the merged seed. If an array is supplied, algorithms are applied in order, with each algorithm receiving a seed-compatible token object. This keeps the API open for future compact or custom algorithms while requiring only dark mode now.

## Dark Algorithm

`darkAlgorithm(seed)` will derive a practical dark alias token set for the current simplified token system:

- `colorBgContainer`: dark container background.
- `colorBgElevated`: elevated dark surface.
- `colorText`: high-emphasis light text.
- `colorTextSecondary`: secondary light text.
- `colorTextDisabled`: disabled light text.
- `colorBorder`: dark border.
- `colorBorderSecondary`: weaker dark border.
- `colorFillAlter`: subtle dark hover/alternate fill.
- `boxShadow`: dark-mode-friendly shadow.
- primary hover/active colors remain derived through the existing primary color helpers.

The implementation intentionally does not add a complete color palette generator. It uses stable dark token values aligned with Ant Design's token-based design approach and the current package's simplified token model.

## Component Token and Style Cleanup

Most component styles already consume global tokens. The cleanup will focus on hardcoded light colors that produce incorrect light patches in dark mode:

- `Select` selected option background should use a component token derived from the active global token instead of fixed `#e6f4ff`.
- `Tree` selected node background should use a token-derived selected background.
- `Alert` status backgrounds and borders should move behind component tokens so light and dark algorithms can produce appropriate values.
- `Tag` status backgrounds and borders should move behind component tokens so light and dark algorithms can produce appropriate values.
- Dropdown-like popup shadows using hardcoded `rgba(0, 0, 0, 0.08)` should use `token.boxShadow` when the file already has token access and doing so is local and safe.
- The docs app should call `darkAlgorithm` rather than manually overriding a few seed tokens.

Semantic fixed colors remain unchanged where they represent effects rather than theme surfaces:

- White/black color picker gradients and checkerboards.
- Image preview masks.
- Tooltip white-on-dark defaults.
- Carousel overlay controls.
- Layout dark header/sider colors.

## ConfigProvider Behavior

Nested providers should merge themes as follows:

- `token`: parent token overrides merged with child token overrides; child wins by key.
- `components`: parent component overrides merged with child component overrides; child wins by component/key.
- `algorithm`: inherited from parent unless child explicitly supplies one; child wins when supplied.

This preserves existing behavior while making dark mode composable:

```tsx
<ConfigProvider theme={{ algorithm: darkAlgorithm }}>
  <ConfigProvider theme={{ token: { colorPrimary: '#722ed1' } }}>
    <App />
  </ConfigProvider>
</ConfigProvider>
```

The inner provider remains dark and only changes the primary color.

## Testing Strategy

Tests will be written before production changes.

Theme package tests:

- `darkAlgorithm` derives dark global tokens.
- `mergeTheme({ algorithm: darkAlgorithm })` returns dark alias tokens.
- `mergeTheme({ algorithm: darkAlgorithm, token: { colorPrimary: '#722ed1' } })` keeps token overrides and derives hover/active colors.
- Component token defaults for selected/status surfaces are dark-compatible when the dark algorithm is active.
- Existing component override behavior still works.

ConfigProvider tests:

- A child provider inherits the parent algorithm when the child only overrides token values.
- A child provider can override the parent algorithm.

Component style tests:

- Existing component tests remain valid.
- Representative style/token tests cover the components whose light hardcoding is removed.

Verification commands:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

## File Naming and Git Safety

No TypeScript file renames are planned. If a rename becomes necessary, it must follow the repository AGENTS.md rule: TypeScript filenames under `apps/` and `packages/` stay lowercase kebab-case, and case-only renames must use an intermediate path.

## Acceptance Criteria

- Consumers can import `darkAlgorithm` from `@solid-ant-design/theme`.
- Consumers can pass `theme={{ algorithm: darkAlgorithm }}` to `ConfigProvider`.
- Existing light-theme behavior remains unchanged without an algorithm.
- Nested providers preserve dark mode when children only override token values.
- Obvious hardcoded light surfaces in the selected cleanup set no longer appear in dark mode tokens/styles.
- Docs dark mode uses the official project theme API rather than ad hoc seed overrides.
- The required lint, format, typecheck, test, and build commands pass or any pre-existing failures are documented with exact output.
