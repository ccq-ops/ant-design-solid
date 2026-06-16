# Docs SolidBase Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `apps/docs` from a direct Vite SPA to a SolidBase/SolidStart static documentation app with SolidBase-style preview directives.

**Architecture:** `apps/docs` becomes a SolidStart app using `@kobalte/solidbase` for MDX, route metadata, and preview directives. A custom SolidBase theme under `apps/docs/src/solidbase-theme` preserves the Ant Design Solid docs shell and MDX table/preview styling. Existing MDX pages move from `src/pages` to `src/routes` so current URLs are preserved by SolidStart filesystem routing.

**Tech Stack:** SolidJS, SolidStart, SolidBase, Vite 8, Nitro, Tailwind CSS v4, MDX, Expressive Code, Vitest, @solidjs/testing-library, pnpm 11.

---

## Files

- Modify: `apps/docs/package.json` to add SolidStart/SolidBase/Nitro dependencies and update scripts.
- Modify: `apps/docs/vite.config.ts` to use `solidBase.plugin(...)`, `solidStart(...)`, `nitro(...)`, Tailwind, and existing aliases.
- Create: `apps/docs/src/app.tsx` as the SolidStart app root.
- Create: `apps/docs/src/entry-client.tsx` as the SolidStart client entry.
- Create: `apps/docs/src/entry-server.tsx` as the SolidStart server entry.
- Modify: `apps/docs/src/vite-env.d.ts` for SolidStart/MDX typing if needed.
- Create: `apps/docs/src/solidbase-theme/index.ts` to define the custom theme.
- Create: `apps/docs/src/solidbase-theme/Layout.tsx` for the docs shell. The capitalized filename is required because SolidBase loads `<componentsPath>/Layout`.
- Create: `apps/docs/src/solidbase-theme/mdx-components.tsx` for MDX components and preview exports.
- Create: `apps/docs/src/solidbase-theme/components/preview.tsx` for `Preview`, `PreviewStage`, and `PreviewPanel`.
- Create: `apps/docs/src/solidbase-theme/route-data.ts` for nav/sidebar config helpers if needed.
- Move: `apps/docs/src/pages/**/*.mdx` to `apps/docs/src/routes/**/*.mdx`.
- Delete: `apps/docs/plugins/mdx-demo-block-vite-plugin.ts`.
- Modify/Delete: `apps/docs/plugins/index.ts` depending on whether any plugin helper remains useful.
- Delete: `apps/docs/src/main.tsx`.
- Delete: `apps/docs/src/components/demo-block.tsx` after migration.
- Modify/Delete tests that target removed files: `apps/docs/src/components/demo-block.test.tsx`, `apps/docs/src/routes/index.test.ts`.
- Modify: runtime/layout tests under `apps/docs/src/**/*.test.tsx`.
- Create: `apps/docs/scripts/convert-demo-fences.mjs` if an automated conversion script is needed.

## Task 1: Verify Dependency Baseline And SolidStart Skeleton

**Files:**

- Modify: `apps/docs/package.json`
- Modify: `apps/docs/vite.config.ts`
- Create: `apps/docs/src/app.tsx`
- Create: `apps/docs/src/entry-client.tsx`
- Create: `apps/docs/src/entry-server.tsx`

- [ ] **Step 1: Update docs dependencies and scripts**

Edit `apps/docs/package.json` scripts and dependencies to include SolidBase/SolidStart. Start with the SolidBase-compatible prerelease used by SolidBase docs if `@solidjs/start@^2.0.0` is not available as stable.

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "test": "vitest run --passWithNoTests",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "lint": "oxlint src"
  },
  "dependencies": {
    "@solid-ant-design/core": "workspace:*",
    "@solid-ant-design/cssinjs": "workspace:*",
    "@kobalte/solidbase": "^0.6.3",
    "@solidjs/router": "^0.16.1",
    "@solidjs/start": "2.0.0-alpha.3",
    "dayjs": "^1.11.13",
    "nitro": "^3.0.0-beta.0",
    "solid-js": "latest"
  }
}
```

If `pnpm install` cannot resolve `@solidjs/start@2.0.0-alpha.3` or a compatible `nitro`, use the exact SolidBase docs dependency for `@solidjs/start`:

```json
"@solidjs/start": "https://pkg.pr.new/solidjs/solid-start/@solidjs/start@2080"
```

and the latest resolvable `nitro` prerelease from npm.

- [ ] **Step 2: Install and verify the dependency graph**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm install
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
```

Expected first run: install may pass, typecheck may fail because SolidStart files do not exist yet. If install fails, fix dependency versions before touching app code.

- [ ] **Step 3: Replace Vite plugin setup with SolidBase/SolidStart skeleton**

Replace `apps/docs/vite.config.ts` with a SolidStart/SolidBase config that keeps existing aliases:

```ts
import { fileURLToPath, URL } from 'node:url'
import { createSolidBase } from '@kobalte/solidbase/config'
import { solidStart } from '@solidjs/start/config'
import { nitro } from 'nitro/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { antDesignSolidTheme } from './src/solidbase-theme'

const solidBase = createSolidBase(antDesignSolidTheme)

export default defineConfig({
  oxc: { jsx: 'preserve' },
  plugins: [
    solidBase.plugin({
      title: 'Ant Design Solid',
      description: 'SolidJS implementation of Ant Design components.',
      lang: 'en',
      lastUpdated: false,
      markdown: {
        expressiveCode: {
          languageSwitcher: false,
        },
      },
      themeConfig: {
        nav: [
          { text: 'Components', link: '/components/button' },
          { text: 'Docs', link: '/docs/getting-started' },
        ],
      },
    }),
    solidStart(solidBase.startConfig({ ssr: true })),
    nitro({ prerender: { crawlLinks: true } }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@solid-ant-design/core': fileURLToPath(
        new URL('../../packages/components/src', import.meta.url),
      ),
      '@solid-ant-design/cssinjs': fileURLToPath(
        new URL('../../packages/cssinjs/src', import.meta.url),
      ),
      '@solid-ant-design/theme': fileURLToPath(
        new URL('../../packages/theme/src', import.meta.url),
      ),
      '@solid-ant-design/icons': fileURLToPath(
        new URL('../../packages/icons/src', import.meta.url),
      ),
      'solid-motionone': fileURLToPath(
        new URL(
          '../../packages/components/node_modules/solid-motionone/dist/index.js',
          import.meta.url,
        ),
      ),
    },
  },
  server: { port: 5173 },
})
```

- [ ] **Step 4: Add minimal SolidStart entries**

Create `apps/docs/src/app.tsx`:

```tsx
import { SolidBaseRoot } from '@kobalte/solidbase/client'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'

export default function App() {
  return (
    <Router root={SolidBaseRoot}>
      <FileRoutes />
    </Router>
  )
}
```

Create `apps/docs/src/entry-client.tsx`:

```tsx
// @refresh reload
import { mount, StartClient } from '@solidjs/start/client'

mount(() => <StartClient />, document.getElementById('app')!)
```

Create `apps/docs/src/entry-server.tsx`:

```tsx
import { getHtmlProps } from '@kobalte/solidbase/server'
// @refresh reload
import { createHandler, StartServer } from '@solidjs/start/server'
import './main.css'

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html {...getHtmlProps()}>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/vite.svg" />
          {assets}
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
))
```

- [ ] **Step 5: Run typecheck to verify the skeleton failure is limited**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
```

Expected: may fail only because `./src/solidbase-theme` does not exist. If dependency or SolidStart entry imports fail, fix before continuing.

- [ ] **Step 6: Commit skeleton**

```bash
git add apps/docs/package.json pnpm-lock.yaml apps/docs/vite.config.ts apps/docs/src/app.tsx apps/docs/src/entry-client.tsx apps/docs/src/entry-server.tsx
git commit -m "build(docs): add solidbase solidstart skeleton"
```

## Task 2: Implement Custom SolidBase Theme Shell

**Files:**

- Create: `apps/docs/src/solidbase-theme/index.ts`
- Create: `apps/docs/src/solidbase-theme/Layout.tsx`
- Create: `apps/docs/src/solidbase-theme/mdx-components.tsx`
- Create: `apps/docs/src/solidbase-theme/components/preview.tsx`
- Modify: `apps/docs/src/main.css`
- Modify: `apps/docs/src/components/layout.test.tsx`
- Modify: `apps/docs/src/components/theme-context.tsx` if SolidStart SSR needs guards

- [ ] **Step 1: Write failing tests for theme preview components**

Create or replace `apps/docs/src/solidbase-theme/components/preview.test.tsx`:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { Preview, PreviewPanel, PreviewStage } from './preview'

describe('SolidBase preview components', () => {
  it('renders preview stage and panel landmarks used by migrated demos', () => {
    const result = render(() => (
      <Preview>
        <PreviewStage>
          <button type="button">Live demo</button>
        </PreviewStage>
        <PreviewPanel>
          <pre>source</pre>
        </PreviewPanel>
      </Preview>
    ))

    expect(result.container.querySelector('[data-preview-root]')).toBeInTheDocument()
    expect(result.container.querySelector('[data-preview-stage]')).toContainElement(
      result.getByRole('button', { name: 'Live demo' }),
    )
    expect(result.container.querySelector('[data-preview-panel]')).toHaveTextContent('source')
  })
})
```

- [ ] **Step 2: Run test and verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- --run src/solidbase-theme/components/preview.test.tsx
```

Expected: FAIL because `./preview` does not exist.

- [ ] **Step 3: Add custom theme exports**

Create `apps/docs/src/solidbase-theme/index.ts`:

```ts
import { defineTheme } from '@kobalte/solidbase/config'

export type AntDesignSolidThemeConfig = {
  nav?: Array<{ text: string; link: string }>
}

export const antDesignSolidTheme = defineTheme<AntDesignSolidThemeConfig>({
  componentsPath: new URL('./', import.meta.url).href,
})
```

- [ ] **Step 4: Add preview components**

Create `apps/docs/src/solidbase-theme/components/preview.tsx`:

```tsx
import type { ParentProps } from 'solid-js'

export function Preview(props: ParentProps) {
  return (
    <section class="docs-border my-4 overflow-hidden rounded-lg border" data-preview-root>
      {props.children}
    </section>
  )
}

export function PreviewStage(props: ParentProps) {
  return (
    <div class="docs-demo-preview px-4 py-4" data-preview-stage>
      <div class="docs-text-tertiary mb-2 text-[11px] font-medium uppercase tracking-wide">
        Example
      </div>
      <div class="min-h-0 overflow-x-auto">{props.children}</div>
    </div>
  )
}

export function PreviewPanel(props: ParentProps) {
  return (
    <div class="docs-border docs-surface-subtle border-t" data-preview-panel>
      {props.children}
    </div>
  )
}
```

- [ ] **Step 5: Add MDX component map**

Create `apps/docs/src/solidbase-theme/mdx-components.tsx`:

```tsx
import type { ComponentProps, JSX } from 'solid-js'
import { splitProps } from 'solid-js'
import { Preview, PreviewPanel, PreviewStage } from './components/preview'

type TableProps = JSX.HTMLAttributes<HTMLTableElement>

export function table(props: TableProps) {
  const [local, others] = splitProps(props, ['class'])

  return (
    <div class="docs-table-scroll" data-mdx-table-scroll>
      <table {...others} class={['docs-markdown-table', local.class].filter(Boolean).join(' ')} />
    </div>
  )
}

export function a(props: ComponentProps<'a'> & { 'data-auto-heading'?: '' }) {
  const outbound = () => (props.href ?? '').includes('//')

  return (
    <a
      target={outbound() ? '_blank' : undefined}
      rel={outbound() ? 'noopener noreferrer' : undefined}
      {...props}
    />
  )
}

export { Preview, PreviewPanel, PreviewStage }
```

- [ ] **Step 6: Add SolidBase layout**

Create `apps/docs/src/solidbase-theme/Layout.tsx`:

```tsx
import { MoonOutlined, SunOutlined } from '@solid-ant-design/icons'
import { A, useLocation } from '@solidjs/router'
import { StyleProvider } from '@solid-ant-design/cssinjs'
import { For, Show, createMemo, type JSX } from 'solid-js'
import { DocsThemeProvider, useDocsTheme } from '../components/theme-context'

type NavItem = {
  path: string
  label: string
}

const topNavItems: NavItem[] = [
  { path: '/components/button', label: 'Components' },
  { path: '/docs/getting-started', label: 'Docs' },
]

const sideNavGroups: Record<string, NavItem[]> = {
  components: [
    { path: '/components/button', label: 'Button' },
    { path: '/components/config-provider', label: 'Config Provider' },
  ],
  docs: [
    { path: '/docs/getting-started', label: 'Getting Started' },
    { path: '/docs/theming', label: 'Theming' },
  ],
}

const sidebarLinkClass =
  'flex justify-center rounded-lg px-3 py-2 text-center transition-colors hover:bg-blue-50 hover:text-blue-600'
const sidebarActiveLinkClass = 'bg-blue-50 text-blue-600 font-medium'

function groupFromPath(pathname: string) {
  return pathname.split('/').filter(Boolean).at(0)
}

function DocsLayoutContent(props: { children?: JSX.Element }) {
  const location = useLocation()
  const docsTheme = useDocsTheme()
  const sidebarItems = createMemo(() => {
    const group = groupFromPath(location.pathname)

    return group ? (sideNavGroups[group] ?? []) : []
  })
  const showSidebar = createMemo(() => location.pathname !== '/')

  return (
    <div class="min-h-screen">
      <header class="docs-border docs-surface sticky top-0 z-10 flex h-16 items-center justify-between border-b px-8 backdrop-blur">
        <A class="text-lg font-bold text-blue-600" href="/">
          Ant Design Solid
        </A>
        <nav class="docs-text-secondary flex items-center gap-6">
          <For each={topNavItems}>
            {(item) => (
              <A class="transition-colors hover:text-blue-600" href={item.path}>
                {item.label}
              </A>
            )}
          </For>
          <a
            class="transition-colors hover:text-blue-600"
            href="https://github.com/ant-design-solid/ant-design-solid"
          >
            GitHub
          </a>
          <button
            type="button"
            class="docs-border inline-flex h-8 w-8 items-center justify-center rounded-full border text-base leading-none transition-colors hover:border-blue-600 hover:text-blue-600"
            aria-label={
              docsTheme.mode() === 'light' ? 'Switch to dark theme' : 'Switch to light theme'
            }
            onClick={docsTheme.toggleTheme}
          >
            {docsTheme.mode() === 'light' ? (
              <MoonOutlined class="block" />
            ) : (
              <SunOutlined class="block" />
            )}
          </button>
        </nav>
      </header>
      <div
        class={
          showSidebar()
            ? 'grid min-h-[calc(100vh-4rem)] grid-cols-[260px_minmax(0,1fr)]'
            : 'min-h-[calc(100vh-4rem)]'
        }
      >
        <Show when={showSidebar()}>
          <aside class="docs-border sticky top-16 flex h-[calc(100vh-4rem)] flex-col gap-2 overflow-y-auto border-r p-6">
            <For each={sidebarItems()}>
              {(item) => (
                <A
                  href={item.path}
                  class={sidebarLinkClass}
                  activeClass={sidebarActiveLinkClass}
                  end
                >
                  {item.label}
                </A>
              )}
            </For>
          </aside>
        </Show>
        <main class="mx-auto w-full max-w-[1100px] px-14 py-10">{props.children}</main>
      </div>
    </div>
  )
}

export default function Layout(props: { children?: JSX.Element }) {
  return (
    <StyleProvider>
      <DocsThemeProvider>
        <DocsLayoutContent>{props.children}</DocsLayoutContent>
      </DocsThemeProvider>
    </StyleProvider>
  )
}
```

After Task 3 moves all routes, replace the hardcoded component sidebar with generated or full static nav items.

- [ ] **Step 7: Run preview and skeleton tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- --run src/solidbase-theme/components/preview.test.tsx
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
```

Expected: preview test passes; typecheck may still fail because routes are not migrated.

- [ ] **Step 8: Commit theme shell**

```bash
git add apps/docs/src/solidbase-theme apps/docs/src/main.css apps/docs/src/components/theme-context.tsx
git commit -m "feat(docs): add ant design solid solidbase theme"
```

## Task 3: Move Routes And Preserve URLs

**Files:**

- Move: `apps/docs/src/pages/**/*.mdx` to `apps/docs/src/routes/**/*.mdx`
- Delete: `apps/docs/src/main.tsx`
- Modify: `apps/docs/src/solidbase-theme/Layout.tsx`
- Delete: `apps/docs/src/routes/index.ts`
- Delete/Modify: `apps/docs/src/routes/index.test.ts`

- [ ] **Step 1: Move MDX files to SolidStart routes**

Run:

```bash
mkdir -p apps/docs/src/routes
cp -R apps/docs/src/pages/. apps/docs/src/routes/
```

Then remove `apps/docs/src/pages` after tests are updated:

```bash
rm -rf apps/docs/src/pages
```

Expected mapping:

- `apps/docs/src/pages/index.mdx` -> `apps/docs/src/routes/index.mdx`
- `apps/docs/src/pages/components/button.mdx` -> `apps/docs/src/routes/components/button.mdx`
- `apps/docs/src/pages/docs/getting-started.mdx` -> `apps/docs/src/routes/docs/getting-started.mdx`

- [ ] **Step 2: Remove old SPA route and entry files**

Delete:

```bash
rm apps/docs/src/main.tsx
rm apps/docs/src/routes/index.ts
rm apps/docs/src/routes/index.test.ts
```

If `apps/docs/src/routes/index.test.ts` conflicts with the new route file name, ensure the test file is removed before copying route content.

- [ ] **Step 3: Generate full sidebar items**

- [ ] **Step 3: Generate full sidebar items**

Update `apps/docs/src/solidbase-theme/Layout.tsx` so `sideNavGroups.components` includes all component routes currently listed under `apps/docs/src/routes/components/*.mdx`, sorted by label, and `sideNavGroups.docs` includes:

```ts
docs: [
  { path: '/docs/getting-started', label: 'Getting Started' },
  { path: '/docs/theming', label: 'Theming' },
]
```

Use kebab-case route paths and humanized labels.

- [ ] **Step 4: Update tests that import moved pages**

For runtime tests such as `apps/docs/src/routes/components/progress-runtime.test.tsx`, update imports from `../../pages/...` or `./progress.mdx` based on their new location. Tests should import from `apps/docs/src/routes/...`.

If test files lived under `src/pages`, move them beside the new route file or into `src/routes`.

- [ ] **Step 5: Run route smoke tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- --run src/solidbase-theme src/routes
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
```

Expected: tests may fail due to old demo fence syntax. Typecheck should not fail because of missing old route registry imports.

- [ ] **Step 6: Commit route migration**

```bash
git add apps/docs/src
git commit -m "refactor(docs): move pages to solidstart routes"
```

## Task 4: Convert Demo Fences To SolidBase Preview Directives

**Files:**

- Create: `apps/docs/scripts/convert-demo-fences.mjs`
- Modify: `apps/docs/src/routes/**/*.mdx`
- Delete: `apps/docs/plugins/mdx-demo-block-vite-plugin.ts`
- Modify/Delete: `apps/docs/plugins/index.ts`
- Delete: `apps/docs/src/components/demo-block.tsx`
- Delete: `apps/docs/src/components/demo-block.test.tsx`

- [ ] **Step 1: Create conversion script**

Create `apps/docs/scripts/convert-demo-fences.mjs` that:

- Scans `apps/docs/src/routes/**/*.mdx`.
- Finds ` ```tsx ... ``` ` blocks.
- Leaves blocks with meta `pure` unchanged except removing `pure` only if SolidBase does not support it.
- Converts only blocks containing exactly one `export default DemoName` to preview form.
- Preserves imports, helper declarations, types, constants, and the default export in the executable demo module.
- Generates unique local demo identifiers from file path plus fence index when a page reuses names such as `Demo`.
- Leaves non-demo code fences unchanged.

Use Node file APIs and conservative parsing; fail loudly if a candidate demo block has no identifier default export. Before changing all pages, test the conversion on one copied page and verify SolidBase MDX accepts the chosen syntax.

- [ ] **Step 2: Run conversion script**

Run:

```bash
node apps/docs/scripts/convert-demo-fences.mjs
```

Expected: MDX files are modified; no script errors.

- [ ] **Step 3: Inspect representative conversions**

Inspect:

```bash
sed -n '1,120p' apps/docs/src/routes/components/button.mdx
sed -n '1,120p' apps/docs/src/routes/components/qrcode.mdx
sed -n '1,120p' apps/docs/src/routes/docs/getting-started.mdx
```

Expected:

- Button and QRCode demos use `:::preview`.
- `getting-started.mdx` still contains a plain code block for installation/config usage.

- [ ] **Step 4: Remove retired custom plugin and component**

Delete:

```bash
rm apps/docs/plugins/mdx-demo-block-vite-plugin.ts
rm apps/docs/src/components/demo-block.tsx
rm apps/docs/src/components/demo-block.test.tsx
```

If `apps/docs/plugins/index.ts` only existed to compose old Vite plugins, delete it. If still imported, update imports to remove it.

- [ ] **Step 5: Run MDX transform tests/typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- --run src/routes/components/progress-runtime.test.tsx src/routes/components/qrcode-runtime.test.tsx
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
```

If exact runtime test files do not exist after route moves, run the closest moved runtime tests for `progress`, `form`, and `time-picker`.

- [ ] **Step 6: Commit demo migration**

```bash
git add apps/docs
git commit -m "refactor(docs): convert demos to solidbase previews"
```

## Task 5: Update Tests For SolidBase/SolidStart

**Files:**

- Modify: `apps/docs/src/solidbase-theme/Layout.test.tsx`
- Modify: `apps/docs/src/components/theme-context.test.tsx`
- Modify: `apps/docs/src/routes/**/*.test.tsx`
- Modify: `apps/docs/src/__tests__/*.test.ts`
- Modify: `e2e/*.test.ts` only if selectors changed.

- [ ] **Step 1: Replace old layout tests**

Move or rewrite `apps/docs/src/components/layout.test.tsx` as `apps/docs/src/solidbase-theme/Layout.test.tsx`. Test:

- Header brand link renders.
- Top nav contains Components and Docs.
- Sidebar appears on `/components/button`.
- Theme toggle button renders.

- [ ] **Step 2: Add MDX preview integration test**

Create `apps/docs/src/routes/components/button-preview.test.tsx`:

```tsx
import { render, waitFor } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import ButtonPage from './button.mdx'

describe('Button docs previews', () => {
  it('renders SolidBase preview stage and source panel', async () => {
    const result = render(() => <ButtonPage />)

    await waitFor(() => {
      expect(result.container.querySelector('[data-preview-stage]')).not.toBeNull()
      expect(result.container.querySelector('[data-preview-panel]')).not.toBeNull()
    })
  })
})
```

- [ ] **Step 3: Update CSS tests**

Update `apps/docs/src/__tests__/main-css.test.ts` and `dark-hardcoded-colors.test.ts` so they no longer expect `DemoBlock` selectors, and instead expect preview selectors or docs semantic classes.

- [ ] **Step 4: Run docs tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test
```

Expected: all docs tests pass.

- [ ] **Step 5: Commit tests**

```bash
git add apps/docs/src e2e
git commit -m "test(docs): update tests for solidbase migration"
```

## Task 6: Full Verification And Build

**Files:**

- Potential small fixes from verification.

- [ ] **Step 1: Run docs dev build checks**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs build
```

Expected: all pass. Fix failures before continuing.

- [ ] **Step 2: Run repository verification**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: all pass. If full repo build is too slow or blocked by unrelated failures, capture exact failures and fix migration-related failures.

- [ ] **Step 3: Optional smoke serve**

If build passes, run a local preview/dev server long enough to inspect generated pages:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs dev -- --host 127.0.0.1
```

Open `/`, `/components/button`, and `/docs/getting-started` with Playwright or curl. Stop the server after inspection.

- [ ] **Step 4: Final commit**

Commit any verification fixes:

```bash
git add apps/docs pnpm-lock.yaml e2e
git commit -m "fix(docs): complete solidbase migration verification"
```

If there are no changes after Task 5, skip this commit.
