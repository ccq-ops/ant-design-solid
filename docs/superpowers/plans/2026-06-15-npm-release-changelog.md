# NPM Release and Changelog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Changesets-based independent package versioning, generated changelogs, and a GitHub Actions npm release workflow using Trusted Publishing.

**Architecture:** Changesets owns package versioning, changelog generation, and publish selection for the monorepo. A single GitHub Actions workflow validates the repository and then delegates either version PR creation or package publishing to `changesets/action`.

**Tech Stack:** pnpm 11, Node.js 22, Changesets, GitHub Actions, npm Trusted Publishing/OIDC.

---

## File Structure

- Create `.changeset/config.json`: Changesets configuration for independent package releases.
- Modify `package.json`: add Changesets scripts and dev dependency.
- Modify `pnpm-lock.yaml`: lock `@changesets/cli`.
- Modify `packages/components/package.json`: add public npm publish metadata.
- Modify `packages/cssinjs/package.json`: add public npm publish metadata.
- Modify `packages/icons/package.json`: add public npm publish metadata.
- Modify `packages/theme/package.json`: add public npm publish metadata.
- Create `.github/workflows/release.yml`: validate and release packages from `main`.

### Task 1: Install and Configure Changesets

**Files:**

- Create: `.changeset/config.json`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Add Changesets dependency**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm add -Dw @changesets/cli
```

Expected: `package.json` gains `@changesets/cli` in `devDependencies`, and `pnpm-lock.yaml` is updated.

- [ ] **Step 2: Add root package scripts**

Modify `package.json` scripts to include:

```json
{
  "changeset": "changeset",
  "version-packages": "changeset version",
  "release": "changeset publish"
}
```

Keep existing scripts unchanged.

- [ ] **Step 3: Add Changesets config**

Create `.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@ant-design-solid/docs"]
}
```

- [ ] **Step 4: Verify Changesets sees the workspace**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm changeset status --since=main
```

Expected: command exits successfully. It may report no unreleased changes.

### Task 2: Mark Publishable Packages Public

**Files:**

- Modify: `packages/components/package.json`
- Modify: `packages/cssinjs/package.json`
- Modify: `packages/icons/package.json`
- Modify: `packages/theme/package.json`

- [ ] **Step 1: Add public publish metadata to each publishable package**

Each package should include this top-level property:

```json
{
  "publishConfig": {
    "access": "public"
  }
}
```

Place it near the existing package entry metadata, after `"files"` or before `"type"`.

- [ ] **Step 2: Confirm docs package remains private**

Run:

```bash
node -e "const fs=require('fs'); const pkgs=['packages/components','packages/cssinjs','packages/icons','packages/theme']; for (const p of pkgs) { const json=JSON.parse(fs.readFileSync(p + '/package.json','utf8')); if (json.publishConfig?.access !== 'public') throw new Error(p + ' missing public publishConfig'); } const docs=JSON.parse(fs.readFileSync('apps/docs/package.json','utf8')); if (docs.private !== true) throw new Error('docs app must remain private');"
```

Expected: no output and exit code 0.

### Task 3: Add Release Workflow

**Files:**

- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Create release workflow**

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches:
      - main

concurrency: ${{ github.workflow }}-${{ github.ref }}

permissions:
  contents: write
  pull-requests: write
  id-token: write

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    environment: npm
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

      - name: Install dependencies
        run: COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm install --frozen-lockfile

      - name: Lint
        run: COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint

      - name: Check formatting
        run: COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check

      - name: Typecheck
        run: COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck

      - name: Test
        run: COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test

      - name: Build
        run: COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build

      - name: Create release PR or publish
        uses: changesets/action@v1
        with:
          version: COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm version-packages
          publish: COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **Step 2: Validate workflow YAML syntax structurally**

Run:

```bash
node -e "const fs=require('fs'); const y=fs.readFileSync('.github/workflows/release.yml','utf8'); for (const s of ['id-token: write','environment: npm','changesets/action@v1','corepack pnpm release']) { if (!y.includes(s)) throw new Error('missing ' + s); }"
```

Expected: no output and exit code 0.

### Task 4: Repository Verification

**Files:**

- Read: changed files

- [ ] **Step 1: Check formatting**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: exit code 0.

- [ ] **Step 2: Run lint**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: exit code 0.

- [ ] **Step 3: Run typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: exit code 0.

- [ ] **Step 4: Run tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: exit code 0.

- [ ] **Step 5: Run build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: exit code 0.

- [ ] **Step 6: Review git diff**

Run:

```bash
git diff -- .changeset/config.json package.json pnpm-lock.yaml packages/components/package.json packages/cssinjs/package.json packages/icons/package.json packages/theme/package.json .github/workflows/release.yml
```

Expected: diff contains only the release/changelog setup described in the design.
