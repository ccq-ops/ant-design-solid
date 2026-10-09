# ADR 0002: Prefer Listy Over the Deprecated List API

- Status: Accepted
- Date: 2026-10-08
- Baseline: Ant Design 6.6.5

## Context

Ant Design 6.6 introduced `Listy` as the high-performance list API with virtualization, grouping,
sticky headers, and imperative scrolling. The older `List` component is deprecated upstream and its
documentation directs users toward Listy.

The repository previously contained an empty `packages/components/src/list/` directory and an old
plan to implement the legacy List API. Implementing that API first would add a new compatibility
surface that upstream is already retiring.

## Decision

1. `Listy` is the supported list primitive for new Ant Design Solid applications.
2. The deprecated Ant Design `List` API is classified as `deprecated-compat` in the API gap, not as
   a missing core feature.
3. Ant Design Solid will not publish a new legacy `List` implementation during the 0.x line unless
   concrete migration demand justifies a separate compatibility package or adapter.
4. Listy must cover:
   - raw and virtual rendering;
   - stable row keys;
   - grouping and sticky group headers;
   - semantic `classNames` and `styles`;
   - ConfigProvider defaults;
   - RTL;
   - imperative scrolling by offset, item key, and group key;
   - keyboard access to scrollable regions.

## Consequences

- The empty `list/` placeholder is not a roadmap commitment.
- Documentation directs all new usage to Listy.
- API audits will continue to report upstream `List` exports until the audit supports explicit
  per-export classifications.
- A future compatibility adapter must be independently justified, documented as deprecated from
  its first release, and must not block Listy evolution.
