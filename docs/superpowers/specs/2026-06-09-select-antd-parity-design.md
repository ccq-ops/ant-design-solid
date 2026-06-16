# Select Antd Parity Design

## Goal

Bring `@solid-ant-design/core` Select close to Ant Design's public Select API while preserving the existing Solid implementation, existing single-select behavior, Form integration, and project conventions.

## Scope

The implementation will add the major Ant Design Select API families in one pass:

- Single, multiple, and tags modes.
- Raw value arrays and `labelInValue`.
- Search state and filtering.
- Field name mapping, grouped options, and static `Select.Option` / `Select.OptGroup` JSX markers.
- Custom rendering for options, selected labels, tags, and popup content.
- Size, status, variant, icon, loading, and semantic class/style props.
- Popup placement, width matching, popup styles/classes, and scroll callbacks.
- Selection, deselection, clear, input keydown, focus, blur, and open-change events.
- `focus()` and `blur()` through a Solid-style `ref` prop.

Deprecated antd aliases such as `dropdownRender`, `dropdownClassName`, `dropdownStyle`, `dropdownMatchSelectWidth`, and `onDropdownVisibleChange` will remain supported as aliases to the current names.

## Compatibility Notes

The existing library supports boolean option values. Ant Design's raw values are normally strings or numbers, but this implementation will keep boolean values to avoid breaking current users.

Virtual scrolling will be accepted through `virtual`, `listHeight`, and `listItemHeight`. The first implementation will render a bounded list with normal DOM scrolling and will not attempt to reproduce rc-select's exact windowing internals.

Solid JSX children cannot be inspected exactly like React children in every case. `Select.Option` and `Select.OptGroup` will be static marker components that work for normal local JSX usage, while `options` remains the preferred high-fidelity data API.

## Architecture

Select will be split into small local modules:

- `interface.ts` owns public types.
- `option-utils.ts` normalizes `options`, grouped options, JSX option markers, fields, filtering, sorting, and tags-created options.
- `value-utils.ts` converts between external values, internal selected entities, raw values, and `labelInValue` outputs.
- `select.tsx` owns Solid state, event flow, Form integration, popup rendering, keyboard handling, refs, and DOM.
- `select.style.ts` owns selectors for sizes, statuses, variants, tags, search input, and popup states.

The implementation should remain dependency-light and should not introduce React rc-select.

## Testing

Tests will be added before implementation changes for the main behavior clusters:

- Existing single-select behavior continues to pass.
- Search filters and controlled search call `onSearch`.
- Multiple and tags modes select, deselect, clear, and emit correct values.
- `labelInValue` changes emitted value shape.
- Grouped options and custom field names render correctly.
- Custom render props and popup aliases work.
- Size/status/variant/icon/class/style props produce expected DOM.
- Ref `focus()` and `blur()` call the interactive element.

Full verification target after implementation is:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```
