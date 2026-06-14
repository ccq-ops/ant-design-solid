# Components Overview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/components` overview page that lists all documented components by category and supports searching components by name.

**Architecture:** Use a SolidBase MDX index route at `apps/docs/src/routes/components/index.mdx` for the static heading and intro copy. Put only interactive catalogue logic in `apps/docs/src/routes/components/components-overview.tsx`, sourcing component metadata from component MDX frontmatter via `import.meta.glob`.

**Tech Stack:** SolidBase docs app, MDX routes, SolidJS, Vitest, TypeScript theme config.

---

### Task 1: Navigation Tests

**Files:**

- Modify: `apps/docs/src/routes/index.test.tsx`
- Modify: `apps/docs/solidbase-theme-config.test.ts`

- [ ] **Step 1: Update the home frontmatter expectation**

Change the second hero action expectation in `apps/docs/src/routes/index.test.tsx` to:

```ts
{ theme: 'alt', text: 'View Components', link: '/components' },
```

- [ ] **Step 2: Add docs theme expectations**

In `apps/docs/solidbase-theme-config.test.ts`, assert:

```ts
expect(docsThemeConfig.nav).toEqual(
  expect.arrayContaining([{ text: 'Components', link: '/components' }]),
)
expect(componentSidebar?.[0]).toEqual({
  title: 'Overview',
  items: [{ title: 'Overview', link: '/' }],
})
```

Also keep the existing group title expectation by checking `componentSidebar?.slice(1).map((group) => group.title)`.

- [ ] **Step 3: Run tests and verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter docs test -- src/routes/index.test.tsx solidbase-theme-config.test.ts --run
```

Expected: FAIL because links and sidebar overview are not implemented yet.

### Task 2: Component Overview Tests

**Files:**

- Create: `apps/docs/src/routes/components/components-overview.test.tsx`

- [ ] **Step 1: Add grouped rendering and search tests**

Create tests that render `ComponentOverview`, assert the searchbox exists, assert grouped component links such as Button and Input exist, filter by `input`, and assert a no-match query shows `No components found.`.

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter docs test -- src/routes/components/components-overview.test.tsx --run
```

Expected: FAIL because `components-overview.tsx` does not exist yet.

### Task 3: Docs Routing, Sidebar, And Overview UI

**Files:**

- Modify: `apps/docs/src/routes/index.mdx`
- Modify: `apps/docs/solidbase-theme-config.ts`
- Create: `apps/docs/src/routes/components/index.mdx`
- Create: `apps/docs/src/routes/components/components-overview.tsx`

- [ ] **Step 1: Update home frontmatter**

Set the `View Components` action link in `apps/docs/src/routes/index.mdx` to:

```yaml
link: /components
```

- [ ] **Step 2: Update docs theme config**

In `apps/docs/solidbase-theme-config.ts`, exclude `index.mdx` from component page discovery, point top navigation to `/components`, and prepend a sidebar overview group:

```ts
.filter((fileName) => fileName.endsWith('.mdx') && fileName !== 'index.mdx')

const componentSidebar = [
  { title: 'Overview', items: [{ title: 'Overview', link: '/' }] },
  ...componentGroups.map((group) => ({
    title: group,
    items: componentDocs
      .filter((component) => component.group === group)
      .map(({ title, link }) => ({ title, link })),
  })),
]
```

- [ ] **Step 3: Create the overview route shell**

Create `apps/docs/src/routes/components/index.mdx`:

```mdx
---
title: Components
---

import { ComponentOverview } from './components-overview'

# Components

Browse components by category or search by component name. The list is generated from the component docs in this section, so it stays aligned with the available Ant Design Solid components.

<ComponentOverview />
```

- [ ] **Step 4: Implement `ComponentOverview`**

Create `apps/docs/src/routes/components/components-overview.tsx` with only the dynamic catalogue: a search input, grouped component sections, links derived from MDX slugs, and an empty state. Do not put the static `Components` heading or intro paragraph in this TSX component.

- [ ] **Step 5: Run target tests and verify pass**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter docs test -- src/routes/components/components-overview.test.tsx src/routes/index.test.tsx solidbase-theme-config.test.ts --run
```

Expected: PASS.

### Task 4: Verification

**Files:**

- Check changed docs files and repo conventions.

- [ ] **Step 1: Run targeted format check for changed files**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm exec oxfmt --check apps/docs/src/routes/components/components-overview.tsx apps/docs/src/routes/components/components-overview.test.tsx apps/docs/src/routes/components/index.mdx apps/docs/solidbase-theme-config.ts apps/docs/solidbase-theme-config.test.ts apps/docs/src/routes/index.mdx apps/docs/src/routes/index.test.tsx docs/superpowers/plans/2026-06-15-components-search-overview.md docs/superpowers/specs/2026-06-15-components-search-overview-design.md
```

Expected: PASS.

- [ ] **Step 2: Run target tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter docs test -- src/routes/components/components-overview.test.tsx src/routes/index.test.tsx solidbase-theme-config.test.ts --run
```

Expected: PASS.
