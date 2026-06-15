# Contributing

Thanks for taking the time to improve Ant Design Solid.

## Development

Use Node.js 22 or newer and pnpm 11 or newer.

```bash
corepack pnpm install
corepack pnpm dev
```

Before opening a pull request, run the same checks used by CI:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

## Changesets

This repository uses Changesets for package versions and changelogs.

For changes that affect published packages, add a changeset:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm changeset
```

For documentation, tests, CI, or other changes that should not publish a package, add an empty changeset:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm changeset add --empty
```

## Pull Requests

- Keep changes focused and scoped to one problem.
- Include tests or examples when behavior changes.
- Follow the existing file naming rules in `AGENTS.md`.
- Do not commit generated build output.
