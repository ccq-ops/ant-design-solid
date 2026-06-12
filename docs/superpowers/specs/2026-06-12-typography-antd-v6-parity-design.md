# Typography Antd v6 Parity Design

## Goal

Bring `Typography` close to Ant Design v6.4.4 behavior while keeping Solid-first prop names and implementation patterns.

## Scope

- Add `Typography.Link`.
- Make `Typography` itself render a root typography container, defaulting to `article`.
- Support Solid-style `class` and `rootClass` as the primary styling props.
- Support semantic `classNames` and `styles` slots: `root`, `actions`, `action`, and `textarea`.
- Support shared block props: `actions`, `title`, `editable`, `copyable`, `type`, `disabled`, `ellipsis`, `code`, `mark`, `underline`, `delete`, `strong`, `keyboard`, and `italic`.
- Keep `Title.level` as `1 | 2 | 3 | 4 | 5`.
- Match antd v6 ellipsis restrictions:
  - `Text` accepts boolean or object ellipsis but ignores `rows`, `expandable`, and `onExpand`.
  - `Link` accepts boolean ellipsis only.
  - `Paragraph` and `Title` accept the full ellipsis object.

## Solid API Choices

The documented API uses `class`, `rootClass`, and Solid event types. Compatibility aliases such as `rootClassName` can be accepted internally where useful, but the docs should not promote React naming.

## Behavior

`copyable` renders an action button. It copies the configured text, async text, or rendered text content. `format` supports `text/plain` and `text/html`. If browser clipboard APIs are unavailable, the action still calls `onCopy` after resolving the copy text.

`editable` renders a textarea editing surface. It supports controlled `editing`, default uncontrolled editing, `onStart`, `onChange`, `onCancel`, `onEnd`, `maxLength`, `autoSize`, `triggerType`, `enterIcon`, and `tabIndex`.

`ellipsis` applies single-line or multi-line truncation classes and styles. Expand/collapse is stateful unless `expanded` is controlled. `onEllipsis` reports whether an ellipsis mode is active.

## Testing

Add focused tests for:

- root component and `Link`
- text decorations and disabled state
- copyable action
- editable lifecycle
- actions placement and semantic class/style slots
- ellipsis config rendering, expand/collapse, and component restrictions

## Documentation

Update the docs page with expanded examples and API tables using Solid prop names.
