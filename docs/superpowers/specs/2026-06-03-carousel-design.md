# Carousel Design

## Scope

Implement a first-pass Ant Design compatible Carousel for Solid. This version supports slide rendering, dots, arrows, autoplay, scroll/fade effects, finite/infinite navigation, change callbacks, and imperative methods. It intentionally does not implement drag or touch gestures.

## API

`Carousel` lives in `packages/components/src/carousel` and is exported from `@solid-ant-design/core`. Props include `autoplay`, `autoplaySpeed`, `dots`, `dotPosition`, `arrows`, `effect`, `fade`, `infinite`, `initialSlide`, `speed`, `easing`, `beforeChange`, `afterChange`, `prefixCls`, `class`, `style`, and `ref` for `{ goTo, next, prev }`.

## Behavior

Slides are indexed from zero. Navigation normalizes indexes by wrapping when `infinite` is true and by clamping when false. `beforeChange(current, next)` runs before state updates; `afterChange(next)` runs after updates. Autoplay advances on an interval and pauses when there are fewer than two slides.

## Rendering and styling

The component uses native Solid rendering and CSS transforms for `scrollx`; `fade` overlays slides and toggles opacity. Dots are accessible buttons with `aria-current`; arrows are accessible buttons. Styles use existing theme tokens through cssinjs.

## Tests and docs

Tests cover rendering, dots, arrows, callbacks, finite navigation, imperative methods, autoplay, fade classes, custom prefix, and dot class names. Docs add a Carousel page with basic, autoplay, arrows, fade, and imperative examples.
