# Solid Icons Library Design

## Goal

`packages/icons` will become a SolidJS icon package backed by `@ant-design/icons-svg`, with an API that matches Ant Design's React icon package naming style.

Consumers should be able to write:

```tsx
import { SearchOutlined, CloseCircleFilled, LoadingOutlined } from '@ant-design-solid/icons'

<SearchOutlined />
<CloseCircleFilled class="danger" />
<LoadingOutlined spin />
```

## Scope

This change will:

- Add `@ant-design/icons-svg` as a dependency of `@ant-design-solid/icons`.
- Export the full icon set from `@ant-design/icons-svg` as Solid components.
- Use Ant Design component names such as `SearchOutlined`, `CloseCircleFilled`, and `AccountBookTwoTone`.
- Preserve repository filename rules by generating kebab-case TypeScript files.
- Provide a reusable low-level `Icon` renderer and shared icon prop types.
- Add tests for rendering, prop forwarding, spin, rotate, two-tone color handling, and package exports.

This change will not add React compatibility or depend on `@ant-design/icons`.

## Public API

The package root will export:

- `Icon`: low-level renderer for an `IconDefinition` from `@ant-design/icons-svg`.
- `IconProps`: common props accepted by generated icon components.
- One named Solid component for every icon definition exported by `@ant-design/icons-svg`.

`IconProps` will extend Solid SVG props and add AntD-style icon options:

```ts
import type { JSX } from 'solid-js'

export interface IconProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  spin?: boolean
  rotate?: number
  twoToneColor?: string | [primaryColor: string, secondaryColor: string]
}
```

Generated icon components will have this shape:

```tsx
export function SearchOutlined(props: IconProps) {
  return <Icon icon={SearchOutlinedSvg} {...props} />
}
```

## Architecture

### `src/components/icon.tsx`

The common renderer will:

- Accept an `IconDefinition` from `@ant-design/icons-svg`.
- Resolve `definition.icon` into an abstract SVG node.
  - Static icon definitions are used directly.
  - Function icon definitions, used by two-tone icons, are called with primary and secondary colors.
- Recursively render abstract nodes into Solid JSX.
- Apply default SVG attributes:
  - `width="1em"`
  - `height="1em"`
  - `fill="currentColor"`
  - `aria-hidden="true"` when no accessible label is provided
  - `focusable="false"` unless overridden
- Forward all standard SVG props to the root `<svg>`.
- Support `spin` by adding a stable class name and inline animation style.
- Support `rotate` by composing a root transform style.

### `src/icons/*.tsx`

A generated file will exist for each icon. Examples:

- `src/icons/search-outlined.tsx`
- `src/icons/close-circle-filled.tsx`
- `src/icons/account-book-two-tone.tsx`

Each file will import one icon definition from `@ant-design/icons-svg/es/asn/<Name>` and export one Solid component with the original AntD component name.

This keeps source filenames kebab-case while preserving PascalCase public component names.

### `src/index.tsx`

The package entry will:

- Export shared renderer and types.
- Export every generated icon component.

The generated exports will be deterministic and sorted by icon component name.

### `scripts/generate-icons.mjs`

The generator will:

- Read `node_modules/@ant-design/icons-svg/es/asn` or the package type declarations to discover icon names.
- Convert icon component names to kebab-case filenames.
- Generate one component file per icon.
- Generate the package barrel export list.
- Avoid PascalCase, camelCase, snake_case, or uppercase TypeScript filenames.

The generated files are committed so consumers do not need to run generation before using the package.

## Data Flow

1. A consumer imports `SearchOutlined` from `@ant-design-solid/icons`.
2. `SearchOutlined` wraps the imported `SearchOutlined` icon definition from `@ant-design/icons-svg`.
3. The generated component calls the shared `Icon` renderer.
4. `Icon` converts the icon definition's abstract SVG tree into Solid SVG elements.
5. User props are merged onto the root SVG element.

## Two-Tone Color Handling

For two-tone definitions whose `icon` property is a function, the renderer will use:

- `twoToneColor` string: primary color = provided string, secondary color = a derived light fallback.
- `twoToneColor` tuple: primary and secondary colors from the tuple.
- no `twoToneColor`: Ant Design-compatible defaults of `#1677ff` and `#e6f4ff`.

The fallback derivation should be deterministic and simple. If exact Ant Design color derivation is not already available in this package, the first implementation may use the Ant Design default secondary color for string input and can be refined later.

## Testing Strategy

Implementation will follow TDD:

1. Add failing tests for the desired public behavior.
2. Verify each test fails for the expected reason.
3. Implement the minimal code needed to pass.
4. Refactor only after tests are green.

Tests will cover:

- `SearchOutlined` renders an SVG from `@ant-design/icons-svg` data.
- Root SVG defaults include `width`, `height`, `fill`, and `viewBox`.
- Standard SVG props such as `class`, `style`, `aria-label`, and event handlers pass through.
- `spin` applies a stable spinning representation.
- `rotate` applies a rotation transform.
- `AccountBookTwoTone` supports `twoToneColor`.
- The package root exports representative icons from each theme: outlined, filled, and two-tone.

## Build and Verification

After implementation, run the repository verification commands required by `AGENTS.md`:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

## Risks and Mitigations

### Large generated source set

Full icon export creates many files. The generator makes output deterministic, and each file remains small and easy to tree-shake.

### Bundle size

The package root will export all icons, but each generated component imports only its own SVG definition. Consumers should still get tree-shaking with modern bundlers.

### CJS and ESM interop

Generated files will import from the ESM path under `@ant-design/icons-svg/es/asn`. Vite will build both ES and CJS package outputs.

### Filename rules

All generated TypeScript files under `packages/icons/src` will be kebab-case. Public component names remain PascalCase because the rule applies to filenames, not exported identifiers.
