# Docs Demo and API Final Completion Design

## Goal

Finish component documentation coverage by adding missing API tables and any necessary examples for every remaining component page without `ApiTable`.

## Scope

Final scope covers `border-beam`, `calendar`, `carousel`, `collapse`, `color-picker`, `config-provider`, `date-picker`, `descriptions`, `image`, `masonry`, `qrcode`, `splitter`, `table`, `time-picker`, `tour`, `tree-select`, `tree`, `upload`, and `watermark`.

## Approach

Reuse the existing shared `ApiTable` component in each docs page. Derive rows from the component's local `interface.ts` and implementation defaults, and avoid documenting unsupported upstream Ant Design APIs. Add examples only when existing demos do not show implemented behavior clearly.

## Verification

Run focused docs typecheck/build during implementation, then the full repository verification suite: lint, format check, recursive typecheck, recursive tests, and recursive build.
