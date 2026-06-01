# oxlint + oxfmt Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace ESLint + Prettier with oxlint + oxfmt without changing the existing Vite/Vitest/TypeScript workspace architecture.

**Architecture:** Keep linting and formatting centralized at the workspace root. Package-level `lint` scripts call `oxlint src`; root scripts call oxlint/oxfmt across the repo. TypeScript remains responsible for type checking.

**Tech Stack:** pnpm 11 workspace, Vite 8, Vitest, TypeScript, SolidJS, oxlint 1.67.0, oxfmt 0.52.0.

---

## File Map

- Delete: `eslint.config.js` — obsolete ESLint flat config.
- Delete: `prettier.config.js` — obsolete Prettier config.
- Modify: `package.json` — replace dependencies and root scripts.
- Modify: `apps/docs/package.json` — replace package lint script.
- Modify: `packages/components/package.json` — replace package lint script.
- Modify: `packages/cssinjs/package.json` — replace package lint script.
- Modify: `packages/icons/package.json` — replace package lint script.
- Modify: `packages/theme/package.json` — replace package lint script.
- Modify: `pnpm-lock.yaml` — regenerate after dependency changes.
- Optional create: `.oxlintrc.json` — only if default ignore behavior is insufficient.
- Optional create: `.oxfmtrc.json` — only if oxfmt supports a project config matching current style.

## Task 1: Replace Root Tooling

**Files:**
- Modify: `package.json`
- Delete: `eslint.config.js`
- Delete: `prettier.config.js`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Inspect package metadata for exact package names**

Run:
```bash
npm view oxlint version bin --json
npm view oxfmt version bin --json
```
Expected: both commands return a version and CLI binary name.

- [ ] **Step 2: Update root `package.json` scripts and devDependencies**

Set root scripts to:
```json
{
  "lint": "oxlint .",
  "lint:fix": "oxlint . --fix",
  "format": "oxfmt --write .",
  "format:check": "oxfmt --check ."
}
```

Remove root devDependencies:
```json
{
  "@eslint/js": "latest",
  "eslint": "latest",
  "eslint-plugin-solid": "latest",
  "prettier": "latest",
  "typescript-eslint": "latest"
}
```

Add root devDependencies:
```json
{
  "oxfmt": "^0.52.0",
  "oxlint": "^1.67.0"
}
```

- [ ] **Step 3: Remove obsolete configs**

Run:
```bash
rm eslint.config.js prettier.config.js
```
Expected: both files are removed from the working tree.

- [ ] **Step 4: Regenerate lockfile**

Run:
```bash
pnpm install
```
Expected: install exits with code 0 and `pnpm-lock.yaml` reflects oxlint/oxfmt instead of ESLint/Prettier packages.

## Task 2: Replace Workspace Package Lint Scripts

**Files:**
- Modify: `apps/docs/package.json`
- Modify: `packages/components/package.json`
- Modify: `packages/cssinjs/package.json`
- Modify: `packages/icons/package.json`
- Modify: `packages/theme/package.json`

- [ ] **Step 1: Replace ESLint package scripts**

For every package with:
```json
"lint": "eslint src"
```
replace with:
```json
"lint": "oxlint src"
```

- [ ] **Step 2: Verify no ESLint/Prettier references remain in project configs**

Run:
```bash
rg "eslint|prettier|@eslint|typescript-eslint" package.json apps packages pnpm-workspace.yaml tsconfig.base.json vitest.config.ts README.md
```
Expected: no config/script references to removed ESLint/Prettier tooling remain. README references are acceptable only if the development command list is still accurate.

## Task 3: Format Compatibility Pass

**Files:**
- Modify: files touched by oxfmt if formatting differs.

- [ ] **Step 1: Check formatter command behavior**

Run:
```bash
pnpm format:check
```
Expected: either exit 0, or formatter reports files that require formatting.

- [ ] **Step 2: Apply formatter only if needed**

If Step 1 reports formatting differences, run:
```bash
pnpm format
```
Expected: oxfmt rewrites files and exits with code 0.

- [ ] **Step 3: Re-run formatter check**

Run:
```bash
pnpm format:check
```
Expected: exit 0.

## Task 4: Verification

**Files:**
- No intended source modifications unless verification exposes a real issue.

- [ ] **Step 1: Run lint**

Run:
```bash
pnpm lint
```
Expected: exit 0. If oxlint reports valid issues introduced by stricter defaults, fix the smallest safe set of issues or add a narrow oxlint config ignore/rule override.

- [ ] **Step 2: Run typecheck**

Run:
```bash
pnpm typecheck
```
Expected: exit 0.

- [ ] **Step 3: Run tests**

Run:
```bash
pnpm test
```
Expected: exit 0.

- [ ] **Step 4: Run build**

Run:
```bash
pnpm build
```
Expected: exit 0.

- [ ] **Step 5: Inspect final diff**

Run:
```bash
git diff --stat
git diff -- package.json apps/docs/package.json packages/components/package.json packages/cssinjs/package.json packages/icons/package.json packages/theme/package.json
```
Expected: diff is limited to dependency/script/config migration and formatter output.
