# TimePicker Default Clear Overlay Design

## Goal

Make single `TimePicker` clearable by default when it has a value, and stack the clear icon over the suffix icon so hovering the selector reveals clear without moving layout.

## Scope

- Applies to `TimePicker` single picker.
- `allowClear={false}` disables the clear affordance.
- `allowClear={{ clearIcon }}` still customizes the clear icon.
- Disabled pickers do not show clear.
- `TimePicker.RangePicker` keeps its current explicit `allowClear` behavior.

## Design

`TimePickerBase` treats `allowClear` as enabled unless it is exactly `false`. The selector renders a right-side icon stack that contains the suffix icon and, when the picker has a value, the clear button. The stack owns a stable width so adding or hiding clear does not shift text or suffix layout.

Styles position suffix and clear in the same stack. The clear button starts transparent and becomes visible on selector hover or focus-within. It remains keyboard and screen-reader discoverable while present because it is still a real button with the existing `aria-label="Clear time"`.

## Testing

Add focused TimePicker tests for:

- Default clear: a valued picker renders the clear button and clicking it clears the value.
- Opt-out: `allowClear={false}` suppresses the clear button.
- Overlay structure: suffix and clear render inside the icon stack.
