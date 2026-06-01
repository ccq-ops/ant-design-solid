# oxlint + oxfmt Migration Design

## Goal

Replace the current ESLint + Prettier tooling with oxlint + oxfmt while preserving the existing Vite, Vitest, TypeScript, SolidJS, and pnpm workspace setup.

## Scope

In scope:

- Remove ESLint and Prettier dependencies from the root workspace.
- Remove `eslint.config.js` and `prettier.config.js`.
- Add oxlint and oxfmt as root development dependencies.
- Add project-level configuration for oxlint/oxfmt only where needed.
- Replace root and workspace package lint/format scripts.
- Verify lint, format check, typecheck, tests, and build.

Out of scope:

- Refactoring Vite configuration.
- Replacing TypeScript, Vitest, or Vite.
- Broad source-code style refactors beyond formatter output.

## Architecture

The workspace will keep a single root-owned lint/format toolchain. Package-level `lint` scripts will invoke `oxlint src` for local package checks. The root `lint` script will invoke `oxlint .` for whole-repo checks, and root `format`/`format:check` scripts will invoke oxfmt over the repository.

## Compatibility Notes

Because this is a toolchain migration rather than a runtime feature, TypeScript remains the source of truth for type checking. oxlint is used for fast static linting and oxfmt for formatting; no type-aware ESLint rules are carried over.

## Verification

Run:

- `pnpm install`
- `pnpm lint`
- `pnpm format:check`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
