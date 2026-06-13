# Input Antd V6 API Design

## Goal

Bring the Solid Input family closer to antd v6 while keeping Solid-friendly public usage. Examples should use `class` for normal styling, and API docs should call out compatibility props that exist primarily for antd migration.

## Scope

Update `Input`, `Input.TextArea`, `Input.Search`, `Input.Password`, `Input.OTP`, and the Input component token surface. Add `Input.Group` as a deprecated compatibility component.

## API Design

- Keep Solid event and class conventions. `class` remains the primary styling prop.
- Support antd compatibility props already used elsewhere in this repo, including `rootClassName`, `prefixCls`, `addonBefore`, `addonAfter`, and `bordered`.
- Support semantic `classNames` and `styles` with antd v6 keys. `root` is the preferred key; existing `wrapper` remains a backward-compatible alias.
- Add function-valued semantic configs, matching the local `InputNumber` pattern.
- Add ref APIs through Solid's `ref` callback style:
  - `InputRef`: `focus(options)`, `blur()`, `select()`, `setSelectionRange()`, `input`, `nativeElement`.
  - `TextAreaRef`: `focus(options)`, `blur()`, `resizableTextArea`, `nativeElement`.
  - `OTPRef`: `focus()`, `blur()`, `nativeElement`.
- Add component-specific missing APIs:
  - `TextArea`: `size`, `onResize`.
  - `Search`: `inputPrefixCls`, semantic `button` classes/styles, wider `enterButton` content.
  - `Password`: `action`, `suffix`, `inputPrefixCls`.
  - `OTP`: `prefixCls`, `rootClassName`, `type`.

## Token Design

Expand `InputComponentToken` with padding, font size, active/hover backgrounds, active shadow, addon background, and clear button background fields. Input styles should consume component tokens where practical while preserving the existing visual defaults.

## Documentation

Extend the Input docs with examples for add-ons, group compatibility, semantic root/button styling, TextArea size/resize, Search button semantics, Password action/suffix, OTP type/ref, and updated API tables.

## Testing

Use the existing Vitest component tests. Add failing tests before implementation for each new behavior cluster: semantic root/function configs, add-ons/group/bordered, ref APIs, TextArea size/resize, Search button semantics, Password action/suffix, OTP type/ref, and token CSS output.
