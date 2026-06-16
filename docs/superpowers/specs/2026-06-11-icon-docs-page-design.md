# Icon Docs Page Design

## Goal

Add a dedicated Icon documentation page to the docs app so every generated icon from
`@solid-ant-design/icons` appears in examples. The page should follow the shape of Ant Design's
official Icon page while using Solid and the local package names.

The new page route will be `/components/icon`, backed by
`apps/docs/src/pages/components/icon.mdx`.

## Scope

This change will:

- Add an Icon docs page with usage examples and API documentation.
- Show representative examples for basic icon usage, spinning icons, rotated icons, and two-tone
  color customization.
- Render a full categorized grid of all exported generated icon components.
- Group generated icons by public component suffix: `Outlined`, `Filled`, and `TwoTone`.
- Keep docs filenames kebab-case per `AGENTS.md`.
- Add focused tests for route discovery and icon list completeness.

This change will not:

- Add React compatibility.
- Add `createFromIconfontCN` or custom icon-font support.
- Change generated icon component implementation.
- Add copy-to-clipboard or search/filter interaction in the first version.

## Page Structure

`apps/docs/src/pages/components/icon.mdx` will contain:

1. `# Icon`
   - Brief description of `@solid-ant-design/icons`.
   - Import example using the Solid package:

   ```tsx pure
   import { SearchOutlined } from '@solid-ant-design/icons'
   ```

2. `### Basic usage`
   - A demo importing representative `Outlined`, `Filled`, and `TwoTone` components.
   - The demo should render real icon components and short labels.

3. `### Spin and rotate`
   - A demo for `spin` and `rotate` props.
   - Example icons can include `LoadingOutlined`, `SyncOutlined`, and `SmileOutlined`.

4. `### Two tone color`
   - A demo showing default and custom `twoToneColor` values.
   - Include both string and tuple forms.

5. `## All icons`
   - Three sections: `Outlined`, `Filled`, and `TwoTone`.
   - Each section renders a grid of every generated icon in that category.
   - Each grid cell shows the icon above its exported component name.

6. `## API`
   - Document common props:
     - `spin?: boolean`
     - `rotate?: number`
     - `twoToneColor?: string | [string, string]`
     - standard Solid SVG props
   - Document accessibility behavior:
     - decorative icons are `aria-hidden="true"` by default.
     - icons with `aria-label` or `aria-labelledby` are exposed semantically.

## Icon List Module

To keep the MDX page maintainable, add a docs-local module:

`apps/docs/src/pages/components/icon-list.tsx`

The module will:

- Import all generated icon components from `@solid-ant-design/icons`.
- Export typed metadata for each generated icon:

  ```ts
  type IconCategory = 'Outlined' | 'Filled' | 'TwoTone'

  type IconMeta = {
    name: string
    category: IconCategory
    component: Component<IconProps>
  }
  ```

- Export grouped arrays:
  - `outlinedIcons`
  - `filledIcons`
  - `twoToneIcons`
  - `allIcons`

The metadata should be generated or mechanically derived from the package exports so it does not
miss icons as the icon package changes. If an automated generation step is needed, prefer a small
script under `apps/docs/scripts/` or a test helper over manual copy-paste.

## Rendering Components

The docs page can define a small local grid component inside MDX or import it from a kebab-case
TSX file if the MDX becomes hard to read. The grid should:

- Use fixed cell dimensions so labels do not shift layout.
- Wrap long component names cleanly.
- Preserve the current docs theme colors through existing `docs-*` CSS variables/classes.
- Avoid nested cards; each icon tile is a repeated item, which is an acceptable card-like element.

## Testing Strategy

Implementation should follow TDD.

Add failing tests before implementation:

1. Route discovery:
   - Update `apps/docs/src/routes/index.test.ts` to assert `/components/icon` is discovered.

2. Icon metadata completeness:
   - Add a docs test for `icon-list.tsx`.
   - Compare metadata names against generated icon exports from `@solid-ant-design/icons`.
   - Exclude non-generated exports such as `Icon`, `IconProps`, and `TwoToneColor`.
   - Assert that all entries are categorized by suffix and that all three categories are non-empty.

3. Optional render smoke:
   - Render a small subset or the grid component and assert icon names and SVG elements appear.

## Verification

Because this adds TypeScript source files under `apps/`, run the repository verification commands
required by `AGENTS.md` after implementation:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

## Risks and Mitigations

### Large import surface

Importing every icon into a single docs page is intentionally large. This is acceptable for the
docs route because the user asked for all icons in examples. The module remains docs-local so
application consumers are unaffected.

### Manual list drift

A hand-maintained list can drift from generated exports. The icon metadata test will compare the
list against package exports so missing or stale icons fail quickly.

### MDX readability

The MDX page should remain mostly documentation and examples. If the full grid logic becomes noisy,
move rendering helpers into kebab-case TSX files next to the page.
