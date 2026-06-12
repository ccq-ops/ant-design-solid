# InputNumber v6 Complete Alignment Design

## Scope

Complete the remaining Ant Design v6 InputNumber API alignment while preserving Solid conventions:

- Keep Solid's `class` prop as the primary root class API instead of adding React-style `className`.
- Add antd-compatible deprecated props that still exist in v6: `addonBefore`, `addonAfter`, and `bordered`.
- Add an InputNumber ref API with `focus(options)`, `blur()`, and `nativeElement`.
- Support function forms for semantic `classNames` and `styles`.
- Align `onInput` with antd/rc behavior by calling it with the current text.
- Align empty committed values with antd by using `null` instead of `undefined`.
- Add dedicated InputNumber component tokens and update styles to consume them.
- Expand docs examples and API tables.

## API Decisions

`value`, `defaultValue`, `onChange`, `parser`, `formatter`, and `onStep` will use `number | string | null` for empty values. `undefined` remains accepted by TypeScript where native optional props already allow omission, but committed empty values should be `null`.

`size` remains `'small' | 'middle' | 'large'` because that is the existing repository-wide `ComponentSize` contract.

`classNames` and `styles` accept either an object or a function receiving `{ props }`. The semantic slots remain `root`, `prefix`, `suffix`, `input`, and `actions`.

`addonBefore` and `addonAfter` render outside the InputNumber root in a compact wrapper, matching antd's compatibility behavior closely enough for layout and styling without adding a new Space.Compact dependency.

`bordered={false}` maps to `variant="borderless"` when `variant` is not explicitly provided. `bordered` is deprecated in docs.

## Token Design

Introduce `InputNumberComponentToken` in `packages/theme/src/types.ts` and defaults in `packages/theme/src/components.ts`. The style file reads these tokens with `getComponentToken('InputNumber', token)`.

Initial token surface:

- `activeBorderColor`
- `activeShadow`
- `addonBg`
- `filledHandleBg`
- `handleActiveBg`
- `handleBg`
- `handleBorderColor`
- `handleFontSize`
- `handleHoverColor`
- `handleVisible`
- `handleWidth`
- `hoverBorderColor`
- `inputFontSize`
- `inputFontSizeLG`
- `inputFontSizeSM`
- `paddingBlock`
- `paddingBlockLG`
- `paddingBlockSM`
- `paddingInline`
- `paddingInlineLG`
- `paddingInlineSM`

## Testing

Use TDD for behavior changes. Add failing tests first for null empty values, text `onInput`, ref methods, deprecated compatibility props, function semantic props, and token registration/usage. Then implement the minimal component and token changes.
