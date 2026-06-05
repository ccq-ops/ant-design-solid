# Docs Demo and API Batch Three Design

## Goal

Continue documentation completion for navigation, overlay, and step/progress navigation components.

## Scope

Batch three covers `affix`, `anchor`, `breadcrumb`, `dropdown`, `menu`, `pagination`, `steps`, `tabs`, `tooltip`, and `popover`.

## Approach

Reuse `ApiTable` for API sections. API content must come from local `interface.ts` files and implementation checks where defaults or behavior are unclear. Add examples only where pages have fewer than four demos or a major implemented behavior is not shown.

## Verification

Run focused docs typecheck/build while implementing, then full repo verification with lint, format check, recursive typecheck, tests, and build.
