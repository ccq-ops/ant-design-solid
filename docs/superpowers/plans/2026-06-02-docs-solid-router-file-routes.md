# Docs Solid Router File Routes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the docs app's manual pathname switch with `@solidjs/router` and convention-based routes generated from files under `apps/docs/src/routes`.

**Architecture:** The docs app remains a Vite SPA. `apps/docs/src/site/routes.ts` converts `import.meta.glob` modules into `RouteDefinition[]`; `App` mounts `<Router root={Layout}>{routes}</Router>`. Docs pages live under `apps/docs/src/routes/**` where file paths define URL paths.

**Tech Stack:** SolidJS, `@solidjs/router`, Vite `import.meta.glob`, Vitest, TypeScript.

---

## File Structure

- Modify `apps/docs/package.json`: add `@solidjs/router` dependency.
- Modify lockfile after installing dependency.
- Create `apps/docs/src/site/routes.ts`: pure route generation helpers and exported Vite-glob route definitions.
- Create `apps/docs/src/site/routes.test.ts`: tests for file path to URL mapping and route object creation.
- Modify `apps/docs/src/app.tsx`: replace manual `window.location.pathname` routing with `@solidjs/router`.
- Modify `apps/docs/src/site/layout.tsx`: use router `A` links and router children typing.
- Rename/create files under `apps/docs/src/routes/**`: route convention files for existing pages.
- Remove `apps/docs/src/pages/**` once route files replace them.

## Tasks

### Task 1: Add route generation tests

**Files:**

- Create: `apps/docs/src/site/routes.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import { createRoutesFromModules, routePathFromFilePath } from './routes'

function Page() {
  return null
}

describe('routePathFromFilePath', () => {
  it('maps index files to their parent route path', () => {
    expect(routePathFromFilePath('./routes/index.tsx')).toBe('/')
    expect(routePathFromFilePath('./routes/docs/index.tsx')).toBe('/docs')
  })

  it('maps nested route files to kebab-case URL paths', () => {
    expect(routePathFromFilePath('./routes/docs/getting-started.tsx')).toBe('/docs/getting-started')
    expect(routePathFromFilePath('./routes/components/config-provider.tsx')).toBe(
      '/components/config-provider',
    )
  })
})

describe('createRoutesFromModules', () => {
  it('creates sorted lazy route definitions from route modules', () => {
    const routes = createRoutesFromModules({
      './routes/components/button.tsx': () => Promise.resolve({ default: Page }),
      './routes/index.tsx': () => Promise.resolve({ default: Page }),
      './routes/docs/getting-started.tsx': () => Promise.resolve({ default: Page }),
    })

    expect(routes.map((route) => route.path)).toEqual([
      '/',
      '/components/button',
      '/docs/getting-started',
    ])
    expect(routes.every((route) => typeof route.component === 'function')).toBe(true)
  })
})
```

- [ ] **Step 2: Run the docs test and verify RED**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- src/site/routes.test.ts`

Expected: FAIL because `./routes` cannot be resolved from the test.

### Task 2: Implement route generation helper

**Files:**

- Create: `apps/docs/src/site/routes.ts`

- [ ] **Step 1: Write minimal implementation**

```ts
import { lazy } from 'solid-js'
import type { Component } from 'solid-js'
import type { RouteDefinition } from '@solidjs/router'

type RouteModule = { default: Component }
type RouteImporter = () => Promise<RouteModule>

export function routePathFromFilePath(filePath: string) {
  const withoutPrefix = filePath.replace(/^\.\/routes\//, '')
  const withoutExtension = withoutPrefix.replace(/\.tsx$/, '')
  const segments = withoutExtension.split('/')

  if (segments.at(-1) === 'index') {
    segments.pop()
  }

  return `/${segments.join('/')}` || '/'
}

export function createRoutesFromModules(modules: Record<string, RouteImporter>): RouteDefinition[] {
  return Object.entries(modules)
    .map(([filePath, importer]) => ({
      path: routePathFromFilePath(filePath),
      component: lazy(importer),
    }))
    .sort((a, b) => String(a.path).localeCompare(String(b.path)))
}

export const routes = createRoutesFromModules(import.meta.glob<RouteModule>('../routes/**/*.tsx'))
```

- [ ] **Step 2: Run the focused test and verify GREEN**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- src/site/routes.test.ts`

Expected: PASS for route generation tests.

### Task 3: Add router dependency

**Files:**

- Modify: `apps/docs/package.json`
- Modify: lockfile

- [ ] **Step 1: Install dependency**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs add @solidjs/router`

Expected: package manifest and lockfile updated.

### Task 4: Wire app and layout to @solidjs/router

**Files:**

- Modify: `apps/docs/src/app.tsx`
- Modify: `apps/docs/src/site/layout.tsx`

- [ ] **Step 1: Replace App manual routing**

```tsx
import { Router } from '@solidjs/router'
import { Layout } from './site/layout'
import { routes } from './site/routes'

export function App() {
  return <Router root={Layout}>{routes}</Router>
}
```

- [ ] **Step 2: Replace layout anchors with router links**

```tsx
import { A } from '@solidjs/router'
import { For, type JSX } from 'solid-js'
import { navItems } from './nav'

export function Layout(props: { children?: JSX.Element }) {
  return (
    <div class="site-shell">
      <header class="site-header">
        <A class="site-logo" href="/">
          Ant Design Solid
        </A>
        <nav class="site-topnav">
          <A href="/docs/getting-started">Docs</A>
          <A href="/components/button">Components</A>
          <a href="https://github.com/ant-design-solid/ant-design-solid">GitHub</a>
        </nav>
      </header>
      <div class="site-body">
        <aside class="site-sidebar">
          <For each={navItems}>{(item) => <A href={item.path}>{item.label}</A>}</For>
        </aside>
        <main class="site-main">{props.children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Run typecheck for expected route-file failures**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck`

Expected: FAIL until `apps/docs/src/routes` files exist and dependency install has completed.

### Task 5: Move pages into convention route files

**Files:**

- Create/rename under `apps/docs/src/routes/**`
- Delete `apps/docs/src/pages/**`

- [ ] **Step 1: Move existing page modules**

Use `mkdir -p apps/docs/src/routes/docs apps/docs/src/routes/components` and `git mv` to move files:

```bash
git mv apps/docs/src/pages/home.tsx apps/docs/src/routes/index.tsx
git mv apps/docs/src/pages/getting-started.tsx apps/docs/src/routes/docs/getting-started.tsx
git mv apps/docs/src/pages/theming.tsx apps/docs/src/routes/docs/theming.tsx
git mv apps/docs/src/pages/button-page.tsx apps/docs/src/routes/components/button.tsx
git mv apps/docs/src/pages/input-page.tsx apps/docs/src/routes/components/input.tsx
git mv apps/docs/src/pages/form-page.tsx apps/docs/src/routes/components/form.tsx
git mv apps/docs/src/pages/select-page.tsx apps/docs/src/routes/components/select.tsx
git mv apps/docs/src/pages/checkbox-page.tsx apps/docs/src/routes/components/checkbox.tsx
git mv apps/docs/src/pages/radio-page.tsx apps/docs/src/routes/components/radio.tsx
git mv apps/docs/src/pages/switch-page.tsx apps/docs/src/routes/components/switch.tsx
git mv apps/docs/src/pages/alert-page.tsx apps/docs/src/routes/components/alert.tsx
git mv apps/docs/src/pages/message-page.tsx apps/docs/src/routes/components/message.tsx
git mv apps/docs/src/pages/notification-page.tsx apps/docs/src/routes/components/notification.tsx
git mv apps/docs/src/pages/modal-page.tsx apps/docs/src/routes/components/modal.tsx
git mv apps/docs/src/pages/popconfirm-page.tsx apps/docs/src/routes/components/popconfirm.tsx
git mv apps/docs/src/pages/space-page.tsx apps/docs/src/routes/components/space.tsx
git mv apps/docs/src/pages/typography-page.tsx apps/docs/src/routes/components/typography.tsx
git mv apps/docs/src/pages/grid-page.tsx apps/docs/src/routes/components/grid.tsx
git mv apps/docs/src/pages/config-provider-page.tsx apps/docs/src/routes/components/config-provider.tsx
```

- [ ] **Step 2: Ensure every route file has a default export**

Each moved file should export its page component as default, for example:

```tsx
export default function ButtonPage() {
  return <section>...</section>
}
```

If a file currently has `export function ButtonPage()`, change it to `export default function ButtonPage()`.

- [ ] **Step 3: Fix relative imports after moving**

Route files one directory deeper than `pages` must update imports like `../site/demo-block` to `../../site/demo-block`.

### Task 6: Verify repository requirements

**Files:**

- All modified docs route files and package manifests

- [ ] **Step 1: Run formatting fix if needed**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format`

Expected: files formatted.

- [ ] **Step 2: Run required checks**

Run these commands exactly:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: all commands exit 0. If a command fails, inspect output, fix the cause, and rerun the failed command.
