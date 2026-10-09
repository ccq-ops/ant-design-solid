# ADR 0001: Ant Design API Compatibility and Solid Naming

- Status: Accepted
- Date: 2026-10-08
- Baseline: Ant Design 6.6.5

## Context

Ant Design Solid aims to preserve Ant Design's component concepts and behavior while exposing APIs
that feel natural in SolidJS. The current public API mixes exact Ant Design names, Solid-native
names, and legacy aliases. In particular, semantic styling uses `classNames` in many components
while root DOM props generally use Solid's `class`.

Removing every React-shaped name immediately would make upstream documentation and migration harder
to follow. Keeping every historical alias indefinitely would make the Solid API inconsistent and
prevent deprecated APIs from being removed.

## Decision

1. Ant Design's current, non-deprecated API is the behavioral baseline.
2. Native DOM-facing names use Solid conventions:
   - `className` becomes `class`.
   - `rootClassName` becomes `rootClass`.
   - equivalent popup/root aliases follow the same rule when they are not semantic slot maps.
3. Ant Design semantic slot maps retain the upstream names `classNames` and `styles`.
   They are configuration objects, not native JSX attributes.
4. Existing experimental `classes` aliases must not be expanded until their migration impact is
   audited. Where both names temporarily exist, `classNames` is canonical.
5. APIs deprecated by Ant Design v6 are not added to new components. Existing deprecated APIs may
   remain for one documented compatibility window and must:
   - emit a development warning;
   - be absent from primary documentation examples;
   - document their replacement;
   - have a planned removal release.
6. React-only implementation details are not copied. Their behavior contract is translated to
   Solid primitives.
7. Every upstream root export missing locally is classified before implementation as one of:
   `implement`, `rename`, `deprecated-compat`, `React-only`, or `intentionally-unsupported`.

## Consequences

- The earlier proposal to globally rename semantic `classNames` to `classes` is superseded.
- Documentation can stay structurally close to Ant Design while native props remain idiomatic
  SolidJS.
- API changes are reviewed through the generated `antd-api-baseline.json` inventory.
- Updating the baseline is an explicit review action:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm api:audit:refresh
```

- CI checks that public exports have not drifted without refreshing and reviewing the baseline.
