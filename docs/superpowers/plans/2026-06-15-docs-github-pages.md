# Docs GitHub Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the docs app to GitHub Pages at `https://ccq-ops.github.io/ant-design-solid/`.

**Architecture:** The docs app receives a CI-only base path through Vite config, so local development stays rooted at `/` while GitHub Pages assets resolve under `/ant-design-solid/`. A dedicated GitHub Actions workflow builds only the docs app, uploads `apps/docs/.output/public`, and deploys it with official Pages actions.

**Tech Stack:** pnpm 11, Node.js 22, Vite, SolidStart/Nitro, GitHub Actions, GitHub Pages.

---

## File Structure

- Modify `apps/docs/vite.config.ts`: add a CI-controlled `base` value for the repository Pages path.
- Modify `apps/docs/src/app.tsx`: pass the repository base path to the client router in Pages builds.
- Modify `apps/docs/package.json`: add a `build:pages` script.
- Create `apps/docs/scripts/prepare-github-pages.mjs`: generate static Pages entry files from the Vite manifest.
- Create `.github/workflows/docs.yml`: dedicated docs build and Pages deploy workflow.
- Create `docs/superpowers/plans/2026-06-15-docs-github-pages.md`: implementation plan.

### Task 1: Add Docs Base Path Support

**Files:**

- Modify: `apps/docs/vite.config.ts`

- [ ] **Step 1: Add a GitHub Pages base constant**

Insert this near the existing `solidBase` constant:

```ts
const docsBase = process.env.GITHUB_PAGES === 'true' ? '/ant-design-solid/' : '/'
```

- [ ] **Step 2: Pass the base to Vite**

Add `base: docsBase` to the object returned by `defineConfig`:

```ts
export default defineConfig(({ command }) => ({
  base: docsBase,
  oxc: { jsx: 'preserve' },
  plugins: [
```

- [ ] **Step 3: Verify formatting**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm exec oxfmt --write apps/docs/vite.config.ts
```

Expected: exit code 0.

### Task 2: Add Docs Pages Workflow

**Files:**

- Create: `.github/workflows/docs.yml`

- [ ] **Step 1: Create docs workflow**

Create `.github/workflows/docs.yml`:

```yaml
name: Docs

on:
  push:
    branches:
      - main
  workflow_dispatch:

concurrency:
  group: pages
  cancel-in-progress: false

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    name: Deploy docs
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          run_install: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Install dependencies
        run: COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm install --frozen-lockfile

      - name: Typecheck docs
        run: COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck

      - name: Test docs
        run: COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs test

      - name: Build docs
        run: COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs build:pages

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v4
        with:
          path: apps/docs/.output/public

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Verify workflow references the expected Pages pieces**

Run:

```bash
node -e "const fs=require('fs'); const y=fs.readFileSync('.github/workflows/docs.yml','utf8'); for (const s of ['actions/configure-pages@v5','actions/upload-pages-artifact@v4','actions/deploy-pages@v4','path: apps/docs/.output/public','GITHUB_PAGES: true']) { if (!y.includes(s)) throw new Error('missing ' + s); }"
```

Expected: no output and exit code 0.

### Task 3: Verify Docs Deployment Setup

**Files:**

- Read: `.github/workflows/docs.yml`
- Read: `apps/docs/vite.config.ts`

- [ ] **Step 1: Run docs typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
```

Expected: exit code 0.

- [ ] **Step 2: Run docs tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs test
```

Expected: exit code 0.

- [ ] **Step 3: Run docs build with GitHub Pages base**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs build:pages
```

Expected: exit code 0 and generated files under `apps/docs/.output/public`.

- [ ] **Step 4: Check built assets use the repository base path**

Run:

```bash
node -e "const fs=require('fs'); const index=fs.readFileSync('apps/docs/.output/public/index.html','utf8'); const fallback=fs.readFileSync('apps/docs/.output/public/404.html','utf8'); if (!index.includes('/ant-design-solid/_build/assets/')) throw new Error('index.html is missing /ant-design-solid/ asset paths'); if (index !== fallback) throw new Error('404.html must match index.html for SPA fallback'); if (!fs.existsSync('apps/docs/.output/public/.nojekyll')) throw new Error('missing .nojekyll');"
```

Expected: no output and exit code 0.

- [ ] **Step 5: Clean generated docs output**

Run:

```bash
rm -rf apps/docs/.output
```

Expected: `git status --short` does not show `apps/docs/.output`.

- [ ] **Step 6: Run repository format check**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: exit code 0.
