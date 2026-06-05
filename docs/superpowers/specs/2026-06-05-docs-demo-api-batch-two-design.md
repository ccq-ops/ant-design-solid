# Docs Demo and API Batch Two Design

## Goal

Continue improving component documentation by covering the second batch of data-entry components whose examples or API sections are missing.

## Scope

This batch covers:

1. `checkbox`
2. `radio`
3. `auto-complete`
4. `cascader`
5. `input-number`
6. `mentions`
7. `segmented`
8. `slider`
9. `rate`
10. `transfer`

## Approach

Use the existing `ApiTable` component from `apps/docs/src/components/api-table.tsx`. API row content must be based on local interface files under `packages/components/src/<component>/interface.ts` and, when necessary, the implementation file to avoid documenting unsupported behavior.

For pages with only two or three demos (`checkbox`, `radio`, `mentions`), add practical examples until each has at least four meaningful examples. For pages already rich in demos (`auto-complete`, `cascader`, `input-number`, `segmented`, `slider`, `rate`, `transfer`), keep existing demos and add API tables, only adjusting examples when they help illustrate documented props.

## Testing and verification

No runtime component behavior changes are planned. Verification is docs compile/build/test oriented:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/docs build
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```
