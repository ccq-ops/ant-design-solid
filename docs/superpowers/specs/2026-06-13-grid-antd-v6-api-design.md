# Grid Antd V6 API Design

## Goal

Bring `@solid-ant-design/core` Grid to parity with antd v6 Grid while keeping Solid conventions: `class` instead of `className`, Solid signals/effects for responsive state, and existing config/style registration patterns.

## Scope

- Add `Grid.useBreakpoint()`.
- Support antd v6 Row APIs: responsive/string gutter, responsive align/justify, `prefixCls`, `wrap`, RTL class.
- Support antd v6 Col APIs: `flex`, responsive `xs`/`sm`/`md`/`lg`/`xl`/`xxl`/`xxxl`, `prefixCls`, string or number span/order/offset/push/pull.
- Share Row gutter and wrap state with Col through Solid context.
- Update docs examples and API tables to match antd Grid examples using Solid syntax.
- Preserve existing `Row` and `Col` imports and existing numeric API behavior.

## Architecture

Grid will use a small shared responsive observer under `packages/components/src/shared` with antd-compatible breakpoint keys and min-width queries. `Grid.useBreakpoint()` will expose a Solid accessor returning a screen map.

`Row` will compute effective gutter, align, and justify from the active breakpoint map. It will apply antd-compatible classes for alignment and RTL and provide `[horizontal, vertical]` gutter plus `wrap` to `Col`.

`Col` will parse base props and responsive breakpoint props into antd-compatible class names. It will apply gutter padding from Row context and parse `flex` values using antd rules.

## Testing

Tests will cover current basic behavior, Row responsive gutter/align/justify, Col responsive classes and flex, custom prefixes, RTL classes, gutter context, and `Grid.useBreakpoint()`.
