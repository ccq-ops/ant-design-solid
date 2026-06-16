# NPM Release and Changelog Design

## Goal

Add a reliable npm release flow for this pnpm monorepo that supports independent package versions, generated changelogs, GitHub release automation, and npm Trusted Publishing.

## Scope

The repository contains one private docs app and four publishable packages:

- `@solid-ant-design/core`
- `@solid-ant-design/cssinjs`
- `@solid-ant-design/icons`
- `@solid-ant-design/theme`

Only the publishable packages participate in npm releases. The docs app remains private and is not published.

## Approach

Use Changesets in independent-version mode. Contributors add a changeset file for PRs that affect published packages. After those PRs merge to `main`, GitHub Actions opens or updates a version PR that contains package version bumps, lockfile changes, and generated changelog updates. When the version PR merges, the same workflow publishes changed packages with `changeset publish`.

The workflow uses npm Trusted Publishing through GitHub Actions OIDC instead of a long-lived npm token. The GitHub workflow therefore needs `id-token: write` permission and should be registered as a trusted publisher for each npm package.

## Repository Changes

- Add `.changeset/config.json` with no fixed or linked package groups, preserving independent versions.
- Add `@changesets/cli` as a root dev dependency.
- Add root scripts:
  - `changeset` for creating changeset files.
  - `version-packages` for applying pending changesets to package versions and changelogs.
  - `release` for publishing changed packages.
- Add public npm publish metadata to the four publishable packages.
- Add `.github/workflows/release.yml` to run validation and then let `changesets/action` either create the version PR or publish packages.

## Validation

The release workflow runs the repository's existing checks before creating release artifacts or publishing:

- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build`

Local implementation verification should install dependencies, run formatting checks, and run the same validation commands when practical.

## Operational Notes

Each npm package must be configured on npmjs.com with a GitHub Actions trusted publisher that matches the release workflow filename and repository. The workflow should use the GitHub Environment named `npm` so the repository can add deployment protection rules before publication.

No initial changeset is added as part of this setup. The first real release should be driven by a future changeset describing the package changes and bump type.
