# Docs SolidBase Migration Design

## Goal

Migrate `apps/docs` from the current plain Vite SPA documentation site to a SolidBase site running on SolidStart, while preserving the existing public documentation URLs and converting examples from the custom `DemoBlock` auto-transform format to SolidBase-style preview directives.

The migration targets a static documentation build. Vite remains the underlying build tool through SolidStart/Vinxi, but the docs app no longer uses `vite`/`vite build` as its direct runtime entrypoint.

## Current State

The docs app currently uses:

- `apps/docs/vite.config.ts` with `vite-plugin-solid`, `@mdx-js/rollup`, Tailwind, and a custom `demoBlockMdxPlugin`.
- `apps/docs/src/main.tsx` as the SPA browser entry.
- `@solidjs/router` with routes generated from `import.meta.glob` in `apps/docs/src/routes/index.ts`.
- `apps/docs/src/components/layout.tsx` for header, sidebar, and theme toggle.
- `apps/docs/src/components/demo-block.tsx` for preview/code rendering and Shiki highlighting.
- MDX pages under `apps/docs/src/pages/**/*.mdx`, where `tsx` code fences with `export default DemoName` are automatically converted to `<DemoBlock />`.

There are many MDX component pages, so the demo conversion must be automated and then spot-checked.

## Target Architecture

`apps/docs` becomes a SolidStart/SolidBase app:

- Add `@solidjs/start` and `@kobalte/solidbase` as docs dependencies.
- Replace direct Vite scripts with SolidStart-compatible scripts.
- Configure SolidBase through `createSolidBase(...)` and SolidStart config.
- Use SolidBase's MDX pipeline, including preview directives and Expressive Code.
- Preserve the Ant Design Solid visual shell through a custom SolidBase theme or theme extension rather than adopting the default SolidBase look wholesale.

The target should keep:

- Current docs branding: "Ant Design Solid".
- Current route URLs such as `/`, `/components/button`, and `/docs/getting-started`.
- Existing workspace aliases for package source imports.
- Current Tailwind and docs CSS variables where practical.
- Existing dark/light docs theme behavior if it can be kept without fighting SolidBase.

## Routing

The custom `import.meta.glob` route registry will be replaced with SolidStart filesystem routing plus SolidBase route/sidebar configuration.

Requirements:

- Preserve existing public URLs.
- Keep the home page at `/`.
- Keep component pages under `/components/<component-name>`.
- Keep guide pages under `/docs/<page-name>`.
- Recreate top navigation and sidebar ordering from the current generated route groups, with component pages grouped under `components` and docs pages under `docs`.

Implementation can either move MDX files into SolidStart route files or add route wrappers that import the existing content, whichever produces the least fragile migration.

## Theme And Layout

Use a custom SolidBase theme for the Ant Design Solid docs shell.

The theme should provide:

- A layout component equivalent to the current header/sidebar/main structure.
- A component mapping for MDX tables and preview components.
- Preview components styled to fit the current docs visual language.
- A way to wrap page content in `StyleProvider` from `@ant-design-solid/cssinjs`.
- A docs theme provider or equivalent dark/light mode integration.

The migration should avoid broad visual redesign. Styling changes should be limited to what is needed for SolidBase/SolidStart integration and the preview directive.

## Demo And Code Examples

The custom `demoBlockMdxPlugin` will be removed.

Demo examples should use SolidBase-style preview directives. The executable demo code should live in MDX ESM scope, and the directive panel should show the same source code for readers:

````mdx
import { Button } from '@ant-design-solid/core'

function Demo1() {
  return <Button type="primary">Primary</Button>
}

### Basic

:::preview
<Demo1 />

---

```tsx
import { Button } from '@ant-design-solid/core'

function Demo1() {
  return <Button type="primary">Primary</Button>
}
```
:::
````

The exact final syntax must be validated against SolidBase/SolidStart MDX behavior before the full conversion. It must satisfy all of these:

- The preview stage renders the live Solid component.
- The panel shows the source code with SolidBase/Expressive Code styling.
- The executable demo code is available to MDX.
- Plain documentation code fences marked `pure` remain non-preview code blocks.

The implementation should include a conversion script or mechanical transform for existing pages, then manually review edge cases:

- `tsx pure` fences.
- Demos with multiple local helper components.
- Demos with side effects such as `message`, modal APIs, or overlays.
- Demos that use fragments or multiple root JSX siblings.
- Documentation pages that contain code samples but no executable demo.

## Removed Or Replaced Code

The migration should remove or retire:

- `apps/docs/plugins/mdx-demo-block-vite-plugin.ts`.
- The custom `DemoBlock` component if no longer used after preview migration.
- Shiki-specific code in `DemoBlock`, because SolidBase uses Expressive Code for code rendering.
- Route tests that only validate the old `import.meta.glob` route registry.

The migration should keep or adapt:

- Markdown table styling.
- Layout tests covering nav/sidebar behavior.
- Runtime tests for pages that catch component/demo rendering regressions.

## Testing Strategy

Use test-first changes for behavior touched during implementation.

Focused tests should cover:

- SolidBase preview directive renders a preview stage and panel for a representative MDX page.
- Plain/pure code fences remain code examples, not live previews.
- The docs shell renders top navigation and sidebar links for SolidStart routes.
- Representative migrated pages render without runtime errors.
- Dark/light theme toggle still changes the document theme state if retained.

Verification commands after migration:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Because this migration changes the docs app framework, e2e smoke coverage should also be considered for at least the home page and one component page.

## Risks And Mitigations

SolidBase is designed for SolidStart, so the migration should not attempt to keep the old direct Vite entrypoint. The accepted direction is a complete SolidBase/SolidStart docs app.

The largest risk is mechanical MDX conversion across many pages. Mitigate it with a repeatable conversion script, focused tests, and manual review of the transformed examples.

Another risk is dependency churn from SolidBase and SolidStart. Keep new dependencies scoped to `apps/docs/package.json` when possible and avoid modifying package library builds unless required.

Visual regressions are likely if the default SolidBase theme is used directly. Mitigate by providing an Ant Design Solid custom theme that reuses existing docs layout and CSS.

## Success Criteria

The migration is complete when:

- `apps/docs` builds and runs as a SolidBase/SolidStart docs site.
- Existing public docs URLs still work.
- Demo examples use SolidBase preview directive syntax rather than the old custom `DemoBlock` transform.
- At least one representative migrated component page renders live demos and source panels correctly.
- The old custom demo block plugin is no longer part of the docs build.
- Required lint, formatting, typecheck, test, and build commands pass.
