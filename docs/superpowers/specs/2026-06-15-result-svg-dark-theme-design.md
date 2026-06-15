# Result SVG Dark Theme Design

## Context

`Result` renders built-in exception SVGs for 403, 404, and 500 statuses from `packages/components/src/result/exception-images.tsx`. Those SVGs currently hard-code light colors for the browser frame, content surface, and strokes, so they do not adapt when the active theme uses dark tokens.

## Goal

Make the built-in Result exception SVGs inherit theme-aware colors from `Result` styles while preserving the existing public API and image structure.

## Design

The SVG markup will expose semantic classes for its background, surface, muted details, and accent details. `packages/components/src/result/result.style.ts` will style those classes under the existing `.ads-result-image svg` selector using the active theme tokens from `useToken()`.

The status-specific accent colors remain `props.accent` for 403, 404, and 500 so each image keeps its current status identity. Neutral SVG fills and strokes move from hard-coded hex values to `currentColor`-based classes supplied by theme-aware CSS. Direct uses of `Result.PRESENTED_IMAGE_403`, `Result.PRESENTED_IMAGE_404`, and `Result.PRESENTED_IMAGE_500` still render valid SVGs because the image elements include fallback SVG color attributes.

## Testing

Add a regression test in `packages/components/src/result/__tests__/result.test.tsx` that renders an exception result and asserts the generated SVG uses semantic image classes instead of fixed light color attributes. Run the targeted Result test before and after implementation, then run package-level checks for the touched component package.
