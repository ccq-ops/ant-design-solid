# Docs Demo and API Batch Five Design

## Goal

Continue component documentation completion for frequently used general, layout, and display components.

## Scope

Batch five covers `button`, `avatar`, `card`, `divider`, `flex`, `float-button`, `layout`, `list`, `statistic`, and `timeline`.

## Approach

Reuse `ApiTable` for all API sections. API rows must be derived from each component's local `interface.ts` and implementation defaults. Add examples only when an implemented behavior is not clearly represented by existing demos.

## Verification

Run focused docs typecheck/build while implementing, then full repo verification with lint, format check, recursive typecheck, tests, and build.
