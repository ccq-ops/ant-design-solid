# InputNumber Ant Design API Alignment Design

## Scope

Implement InputNumber priority groups 1-4 from the API comparison:

1. Base behavior: `keyboard`, `changeOnBlur`, `onPressEnter`, `onStep`, complete `readOnly` behavior.
2. Display features: `prefix`, `suffix`, custom `controls` icons, `variant`.
3. Numeric features: `step: number | string`, `stringMode`, `decimalSeparator`, upgraded `formatter` signature.
4. Styling extension: `classNames`, `styles`, `rootClassName`, `prefixCls`.

Deprecated antd compatibility props (`addonBefore`, `addonAfter`, `bordered`) are intentionally out of scope.

## Architecture

Keep the implementation inside the existing InputNumber component and style files to match current repository patterns. Extend `InputNumberProps` with Solid-friendly equivalents of antd types and add small helper functions in `input-number.tsx` for value conversion, decimal separator handling, step arithmetic, and semantic slot styling.

## Behavior Details

- Empty value remains `undefined` in normal mode for existing compatibility. In `stringMode`, non-empty committed values are strings and empty values remain `undefined`.
- `changeOnBlur` defaults to `true`. When `false`, input commits on each `input` event and blur only reformats the display.
- `keyboard` defaults to `true`. When `false`, ArrowUp/ArrowDown do not step.
- `readOnly` disables committing from typing, controls, keyboard, and wheel while keeping the native input read-only.
- `onPressEnter` fires after `onKeyDown` when Enter is pressed and the event is not prevented.
- `onStep` fires for handler, keydown, and wheel step commits with `{ offset, type, emitter }`.
- `changeOnWheel` enables wheel up/down stepping when the input is focused and not disabled/readOnly.
- `controls` can be `false`, `true`, or `{ upIcon, downIcon }`.
- `prefix` and `suffix` render semantic slots around the input.
- `variant` adds `ant-input-number-variant-*` classes and styles for `outlined`, `borderless`, `filled`, and `underlined`.
- `classNames` and `styles` support slots: `root`, `prefix`, `suffix`, `input`, `actions`.
- `prefixCls` overrides the component class prefix; otherwise it uses ConfigProvider.
- `rootClassName` is added to the root element.

## Testing

Add behavior-focused tests to `packages/components/src/input-number/__tests__/input-number.test.tsx`. Use TDD: write failing tests first, verify they fail, implement minimal code, then verify they pass.
