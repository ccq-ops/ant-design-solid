# Tabs Ink Bar Animation Design

## Problem

The Tabs selected indicator is currently rendered inside only the active tab button. When the active tab changes, Solid removes the old indicator node and creates a new one inside the new active tab. That structure cannot produce the expected smooth ink bar movement between tabs because there is no stable element whose position can transition from the previous tab to the next tab.

## Goals

- Render one stable ink bar element for the default line-style indicator.
- Move and resize the ink bar when the active tab changes.
- Enable ink bar animation by default.
- Disable ink bar animation when `animated={false}` or `animated={{ inkBar: false }}`.
- Preserve existing `indicator.size`, `indicator.align`, `classNames.indicator`, and `styles.indicator` behavior.
- Support horizontal (`top`, `bottom`) and vertical (`start`, `end`) tab placements.

## Non-Goals

- Do not animate tab pane content in this change.
- Do not change the public `animated` prop type.
- Do not redesign overflow, editable-card controls, or tab panel rendering.

## Design

`TabNavList` will render `.ads-tabs-indicator` once as a child of `.ads-tabs-nav-list`, not inside the active tab button. It will keep references to the nav list and tab buttons, then measure the active tab relative to the nav list.

For horizontal tabs, the computed style will set `transform: translateX(...)` and `width`. For vertical tabs, it will set `transform: translateY(...)` and `height`. The existing `indicator.size` option will override the measured tab width or height, and `indicator.align` will place the custom-sized indicator at the start, center, or end of the active tab.

The indicator receives a normal transition by default. When ink bar animation is disabled, `TabNavList` adds a no-motion class that sets `transition: none`.

## Animated Semantics

Ink bar animation is enabled when:

- `animated` is omitted.
- `animated` is `true`.
- `animated` is an object without `inkBar: false`.
- `animated` is `{ inkBar: true }`.

Ink bar animation is disabled when:

- `animated` is `false`.
- `animated` is `{ inkBar: false }`.

## Testing

Tests will be added before implementation:

- Default styles include a transition for the tabs indicator.
- Switching tabs keeps a single indicator element and updates its movement style.
- `animated={false}` disables indicator motion.
- `animated={{ inkBar: false }}` disables indicator motion.
- Existing `indicator.size` and `indicator.align` coverage remains valid with the new stable indicator.
