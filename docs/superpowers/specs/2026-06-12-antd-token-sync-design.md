# Antd Token Sync Design

## Goal

Synchronize the local `@solid-ant-design/theme` token system with Ant Design `6.4.4` so local components can consume the same seed, map, and alias token names and defaults.

## Scope

- Use Ant Design `6.4.4` as the source version.
- Expand global token support from the current small seed/alias subset to Ant Design's seed, map, and alias model.
- Preserve the existing `mergeTheme`, `defaultAlgorithm`, `darkAlgorithm`, `defaultSeedToken`, and `getComponentToken` API shape.
- Keep component-token implementation focused on local consumers. Add compatibility fields for declared local component tokens and allow broader component overrides through types.
- Avoid importing React Ant Design at runtime. Use the same low-level color packages that Ant Design uses for deterministic palette and color math.

## Architecture

`packages/theme/src/default-seed-token.ts` owns Ant Design's default seed values. `packages/theme/src/algorithm.ts` derives map and alias tokens from a seed with local copies of Ant Design's deterministic theme helpers. `packages/theme/src/types.ts` exposes permissive token types with known fields plus string-index compatibility so components can adopt additional Ant Design token names incrementally.

Component token defaults remain in `packages/theme/src/components.ts`; this keeps the change scoped to theme behavior without forcing all component styles to migrate in one change.

## Testing

Theme tests compare local output against Ant Design `6.4.4` reference values for representative seed, map, alias, dark, and override tokens. Existing component-token tests continue to protect current Solid component behavior.
