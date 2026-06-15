# Docs GitHub Pages Deployment Design

## Goal

Add an automated GitHub Pages deployment for the docs app without coupling it to npm package publishing.

## Scope

The docs app is `@ant-design-solid/docs` under `apps/docs`. It builds static output into `apps/docs/.output/public`. The npm release workflow remains focused on package releases and is not responsible for publishing docs.

## Approach

Create a dedicated GitHub Actions workflow at `.github/workflows/docs.yml`. The workflow runs on pushes to `main`, builds the docs app, uploads `apps/docs/.output/public` as a Pages artifact, and deploys it with GitHub's official Pages action.

The deployment target is the repository Pages URL:

```text
https://ccq-ops.github.io/ant-design-solid/
```

Because this is a project Pages URL, the docs build must support the `/ant-design-solid/` base path in CI while preserving `/` for local development.

## Workflow

The docs workflow:

- Checks out the repository.
- Installs pnpm and Node.js 22.
- Installs dependencies with the frozen lockfile.
- Runs docs typecheck, tests, and build.
- Uploads `apps/docs/.output/public`.
- Deploys with `actions/deploy-pages`.

The workflow permissions are limited to what Pages deployment needs:

- `contents: read`
- `pages: write`
- `id-token: write`

The workflow uses GitHub Environment `github-pages`.

## Validation

Local verification should run:

- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs test`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs build`
- `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check`

The implementation should also structurally verify the workflow contains the expected Pages actions and uploads the correct output directory.
