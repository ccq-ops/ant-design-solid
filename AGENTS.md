# AGENTS.md

## File Naming Rules

- All TypeScript source files under `apps/` and `packages/` must use kebab-case file names.
- Use lowercase words separated by hyphens, for example:
  - `button.tsx`
  - `button-page.tsx`
  - `config-provider.tsx`
  - `form-item.tsx`
  - `style-provider.tsx`
  - `default-seed-token.ts`
- Preserve conventional dot-separated suffixes, but each segment must still be lowercase kebab-case:
  - `button.test.tsx`
  - `style-register.test.tsx`
  - `vite.config.ts`
  - `vite-env.d.ts`
- Do not introduce PascalCase, camelCase, snake_case, or uppercase letters in `.ts` / `.tsx` file names.

## Git Rename Safety

This repository may be edited on case-insensitive file systems such as macOS. When renaming files only by case, or when changing case as part of a rename, always use a temporary intermediate path so Git records the rename reliably:

```bash
git mv path/OldName.tsx path/.__tmp-old-name.tsx
git mv path/.__tmp-old-name.tsx path/old-name.tsx
```

Do not rely on direct case-only renames such as `git mv OldName.tsx oldname.tsx`.

## Verification

After renaming TypeScript files, update all relative imports and run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```
