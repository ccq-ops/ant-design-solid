# Docs Tailwind Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Tailwind CSS to the docs app and migrate the shared docs shell, demo block, and home hero styling from custom CSS selectors to Tailwind utility classes.

**Architecture:** Tailwind is configured only inside `apps/docs`, using the official Vite plugin and the existing `apps/docs/src/app.css` import as the stylesheet entry. Shared docs presentation styling moves from `app.css` selectors into JSX utility classes, while component demo inline styles remain unchanged for this pass.

**Tech Stack:** SolidJS, Vite 8, Tailwind CSS v4, `@tailwindcss/vite`, pnpm 11, Vitest, `@solidjs/testing-library`.

---

## File Structure

- Modify: `apps/docs/package.json`
  - Add docs-local dev dependencies: `tailwindcss` and `@tailwindcss/vite`.
- Modify: `pnpm-lock.yaml`
  - Updated by pnpm when adding Tailwind dependencies.
- Modify: `apps/docs/vite.config.ts`
  - Import `@tailwindcss/vite` and add it to the Vite plugins array after `solid()`.
- Modify: `apps/docs/src/app.css`
  - Replace custom selector stylesheet with Tailwind import plus minimal global document defaults.
- Modify: `apps/docs/src/site/layout.tsx`
  - Replace `site-*` classes with Tailwind utility classes and preserve Solid Router active link styling.
- Modify: `apps/docs/src/site/layout.test.tsx`
  - Update the current active-link test so it expects Tailwind selected-state utilities instead of the removed `site-sidebar-link-selected` selector.
- Modify: `apps/docs/src/site/demo-block.tsx`
  - Replace `demo-block` and `demo-preview` classes with Tailwind utility classes.
- Create: `apps/docs/src/site/demo-block.test.tsx`
  - Verify `DemoBlock` renders title, preview content, code, and expected Tailwind structural classes.
- Modify: `apps/docs/src/routes/index.tsx`
  - Replace `hero` selector with Tailwind utility classes.
- Create: `apps/docs/src/routes/index.test.tsx`
  - Verify the home hero renders the expected copy/actions and uses Tailwind classes.

## Tailwind Setup Reference

Use Tailwind CSS v4's Vite setup: install `tailwindcss` and `@tailwindcss/vite`, add the Vite plugin, and import Tailwind from CSS with `@import "tailwindcss"`.

---

### Task 1: Add Tests for Tailwind-Migrated Docs UI

**Files:**

- Modify: `apps/docs/src/site/layout.test.tsx`
- Create: `apps/docs/src/site/demo-block.test.tsx`
- Create: `apps/docs/src/routes/index.test.tsx`

- [ ] **Step 1: Replace the layout active-link test with Tailwind expectations**

Replace the full contents of `apps/docs/src/site/layout.test.tsx` with:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { MemoryRouter } from '@solidjs/router'
import { describe, expect, it } from 'vitest'
import { Layout } from './layout'

function renderLayout() {
  return render(() => (
    <MemoryRouter root={Layout}>{{ path: '*', component: () => <div>Page</div> }}</MemoryRouter>
  ))
}

describe('Layout', () => {
  it('marks the clicked sidebar menu item as selected with Tailwind utilities', async () => {
    const result = renderLayout()
    const menuLink = result.getByRole('link', { name: 'Menu' })

    fireEvent.click(menuLink)
    await Promise.resolve()

    expect(menuLink).toHaveAttribute('aria-current', 'page')
    expect(menuLink).toHaveClass('bg-blue-50')
    expect(menuLink).toHaveClass('text-blue-600')
    expect(menuLink).toHaveClass('font-medium')
    expect(menuLink).not.toHaveClass('site-sidebar-link-selected')
  })
})
```

- [ ] **Step 2: Add a DemoBlock rendering/class test**

Create `apps/docs/src/site/demo-block.test.tsx` with:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { DemoBlock } from './demo-block'

describe('DemoBlock', () => {
  it('renders title, preview, code, and Tailwind structural classes', () => {
    const result = render(() => (
      <DemoBlock title="Basic" code="<Button>Click</Button>">
        <button type="button">Click</button>
      </DemoBlock>
    ))

    const block = result.getByRole('region', { name: 'Basic' })
    const heading = result.getByRole('heading', { name: 'Basic', level: 3 })
    const button = result.getByRole('button', { name: 'Click' })
    const code = result.getByText('<Button>Click</Button>')

    expect(block).toHaveClass('my-6')
    expect(block).toHaveClass('overflow-hidden')
    expect(heading).toHaveClass('border-b')
    expect(button.parentElement).toHaveClass('p-6')
    expect(code.parentElement).toHaveClass('overflow-auto')
  })
})
```

- [ ] **Step 3: Add a home hero rendering/class test**

Create `apps/docs/src/routes/index.test.tsx` with:

```tsx
import { render } from '@solidjs/testing-library'
import { ConfigProvider } from '@solid-ant-design/core'
import { StyleProvider } from '@solid-ant-design/cssinjs'
import { describe, expect, it } from 'vitest'
import Home from './index'

function renderHome() {
  return render(() => (
    <StyleProvider>
      <ConfigProvider>
        <Home />
      </ConfigProvider>
    </StyleProvider>
  ))
}

describe('Home', () => {
  it('renders the hero with Tailwind utility classes', () => {
    const result = renderHome()
    const heading = result.getByRole('heading', { name: 'Ant Design Solid', level: 1 })
    const hero = heading.closest('section')

    expect(hero).toHaveClass('rounded-3xl')
    expect(hero).toHaveClass('bg-gradient-to-br')
    expect(hero).toHaveClass('p-14')
    expect(heading).toHaveClass('text-5xl')
    expect(result.getByText(/An Ant Design-inspired component system/)).toHaveClass('text-lg')
    expect(result.getByRole('button', { name: 'Get Started' })).toBeInTheDocument()
    expect(result.getByRole('button', { name: 'View Components' })).toBeInTheDocument()
  })
})
```

- [ ] **Step 4: Run docs tests and verify the new tests fail before implementation**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test
```

Expected: FAIL. The layout test should fail because `Layout` still uses `site-sidebar-link-selected`, the demo block test should fail because `DemoBlock` still uses `demo-block`/`demo-preview`, and the home test should fail because `Home` still uses `hero`.

- [ ] **Step 5: Commit the failing tests**

```bash
git add apps/docs/src/site/layout.test.tsx apps/docs/src/site/demo-block.test.tsx apps/docs/src/routes/index.test.tsx
git commit -m "test(docs): cover tailwind docs shell styling"
```

---

### Task 2: Install Tailwind and Configure Vite

**Files:**

- Modify: `apps/docs/package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `apps/docs/vite.config.ts`
- Modify: `apps/docs/src/app.css`

- [ ] **Step 1: Add Tailwind dependencies to the docs package**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs add -D tailwindcss @tailwindcss/vite
```

Expected: `apps/docs/package.json` contains `tailwindcss` and `@tailwindcss/vite` under `devDependencies`, and `pnpm-lock.yaml` is updated.

- [ ] **Step 2: Configure the Tailwind Vite plugin**

Replace the full contents of `apps/docs/vite.config.ts` with:

```ts
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solid(), tailwindcss()],
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
    },
  },
  server: { port: 5173 },
})
```

- [ ] **Step 3: Replace custom docs CSS with Tailwind import and minimal globals**

Replace the full contents of `apps/docs/src/app.css` with:

```css
@import 'tailwindcss';

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1f1f1f;
  background: #fff;
}

a {
  color: inherit;
  text-decoration: none;
}
```

- [ ] **Step 4: Run docs build to verify Tailwind config compiles**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs build
```

Expected: PASS. Vite should compile CSS through the Tailwind plugin and produce `apps/docs/dist` assets.

- [ ] **Step 5: Commit Tailwind setup**

```bash
git add apps/docs/package.json pnpm-lock.yaml apps/docs/vite.config.ts apps/docs/src/app.css
git commit -m "build(docs): add tailwind css"
```

---

### Task 3: Migrate Layout to Tailwind Utilities

**Files:**

- Modify: `apps/docs/src/site/layout.tsx`
- Test: `apps/docs/src/site/layout.test.tsx`

- [ ] **Step 1: Replace Layout classes with Tailwind utilities**

Replace the full contents of `apps/docs/src/site/layout.tsx` with:

```tsx
import { A } from '@solidjs/router'
import { For, type JSX } from 'solid-js'
import { navItems } from './routes'

const sidebarLinkClass =
  'rounded-lg px-3 py-2 transition-colors hover:bg-blue-50 hover:text-blue-600'
const sidebarActiveLinkClass = 'bg-blue-50 text-blue-600 font-medium'

export function Layout(props: { children?: JSX.Element }) {
  return (
    <div class="min-h-screen">
      <header class="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-8 backdrop-blur">
        <A class="text-lg font-bold text-blue-600" href="/">
          Ant Design Solid
        </A>
        <nav class="flex gap-6 text-black/65">
          <A class="transition-colors hover:text-blue-600" href="/docs/getting-started">
            Docs
          </A>
          <A class="transition-colors hover:text-blue-600" href="/components/button">
            Components
          </A>
          <a
            class="transition-colors hover:text-blue-600"
            href="https://github.com/ant-design-solid/ant-design-solid"
          >
            GitHub
          </a>
        </nav>
      </header>
      <div class="grid min-h-[calc(100vh-4rem)] grid-cols-[260px_minmax(0,1fr)]">
        <aside class="flex flex-col gap-2 border-r border-gray-200 p-6">
          <For each={navItems}>
            {(item) => (
              <A href={item.path} class={sidebarLinkClass} activeClass={sidebarActiveLinkClass} end>
                {item.label}
              </A>
            )}
          </For>
        </aside>
        <main class="max-w-[1100px] px-14 py-10">{props.children}</main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run the layout test**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- src/site/layout.test.tsx
```

Expected: PASS. The clicked `Menu` sidebar link has `aria-current="page"`, `bg-blue-50`, `text-blue-600`, and `font-medium`.

- [ ] **Step 3: Run docs typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit the layout migration**

```bash
git add apps/docs/src/site/layout.tsx apps/docs/src/site/layout.test.tsx
git commit -m "refactor(docs): migrate layout styling to tailwind"
```

---

### Task 4: Migrate DemoBlock to Tailwind Utilities

**Files:**

- Modify: `apps/docs/src/site/demo-block.tsx`
- Test: `apps/docs/src/site/demo-block.test.tsx`

- [ ] **Step 1: Replace DemoBlock classes with Tailwind utilities**

Replace the full contents of `apps/docs/src/site/demo-block.tsx` with:

```tsx
import type { JSX } from 'solid-js'

export function DemoBlock(props: { title: string; code: string; children: JSX.Element }) {
  return (
    <section
      class="my-6 overflow-hidden rounded-xl border border-gray-200"
      aria-label={props.title}
    >
      <h3 class="m-0 border-b border-gray-200 px-5 py-4 text-lg font-semibold">{props.title}</h3>
      <div class="p-6">{props.children}</div>
      <pre class="m-0 overflow-auto bg-gray-50 px-5 py-4 text-sm">
        <code>{props.code}</code>
      </pre>
    </section>
  )
}
```

- [ ] **Step 2: Run the DemoBlock test**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- src/site/demo-block.test.tsx
```

Expected: PASS. The region, heading, preview content, code, and expected Tailwind classes are present.

- [ ] **Step 3: Commit the DemoBlock migration**

```bash
git add apps/docs/src/site/demo-block.tsx apps/docs/src/site/demo-block.test.tsx
git commit -m "refactor(docs): migrate demo block styling to tailwind"
```

---

### Task 5: Migrate Home Hero to Tailwind Utilities

**Files:**

- Modify: `apps/docs/src/routes/index.tsx`
- Test: `apps/docs/src/routes/index.test.tsx`

- [ ] **Step 1: Replace the home hero selector with Tailwind utilities**

Replace the full contents of `apps/docs/src/routes/index.tsx` with:

```tsx
import { Button, Space } from '@solid-ant-design/core'

export default function Home() {
  return (
    <section class="rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-700/10 p-14">
      <h1 class="mb-4 mt-0 text-5xl font-bold">Ant Design Solid</h1>
      <p class="max-w-[680px] text-lg leading-[1.7] text-black/65">
        An Ant Design-inspired component system built with SolidJS, Vite 8, pnpm 11, token-driven
        theming, and a Solid-native CSS-in-JS runtime.
      </p>
      <Space>
        <Button type="primary">Get Started</Button>
        <Button>View Components</Button>
      </Space>
    </section>
  )
}
```

- [ ] **Step 2: Run the home route test**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- src/routes/index.test.tsx
```

Expected: PASS. The hero has `rounded-3xl`, `bg-gradient-to-br`, and `p-14`; the heading has `text-5xl`.

- [ ] **Step 3: Commit the home migration**

```bash
git add apps/docs/src/routes/index.tsx apps/docs/src/routes/index.test.tsx
git commit -m "refactor(docs): migrate home hero styling to tailwind"
```

---

### Task 6: Full Verification and Cleanup

**Files:**

- Inspect: `apps/docs/src/app.css`
- Inspect: `apps/docs/src/site/layout.tsx`
- Inspect: `apps/docs/src/site/demo-block.tsx`
- Inspect: `apps/docs/src/routes/index.tsx`
- Inspect: `apps/docs/package.json`
- Inspect: `pnpm-lock.yaml`

- [ ] **Step 1: Confirm old shared docs selectors were removed**

Run:

```bash
rg -n "site-|demo-block|demo-preview|class=\"hero\"|\.hero|\.api-table" apps/docs/src apps/docs/package.json apps/docs/vite.config.ts
```

Expected: no matches for old shared docs style selectors. If this finds only test descriptions or unrelated text, remove or update those references so the command produces no output.

- [ ] **Step 2: Run docs typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
```

Expected: PASS.

- [ ] **Step 3: Run docs tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test
```

Expected: PASS.

- [ ] **Step 4: Run docs build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs build
```

Expected: PASS.

- [ ] **Step 5: Run root format check**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: PASS. If it fails only because files need formatting, run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format
```

Then re-run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected after formatting: PASS.

- [ ] **Step 6: Run root lint**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: PASS.

- [ ] **Step 7: Inspect git diff for scope control**

Run:

```bash
git diff --stat HEAD~4..HEAD
```

Expected: changes are limited to docs Tailwind dependencies/config, docs shared styling files, and tests from this plan.

- [ ] **Step 8: Commit any verification cleanup**

If formatting changed files or cleanup was needed, run:

```bash
git add apps/docs package.json pnpm-lock.yaml docs/superpowers/plans/2026-06-04-docs-tailwind-migration.md
git commit -m "chore(docs): verify tailwind migration"
```

If no files changed during verification, do not create an empty commit.
