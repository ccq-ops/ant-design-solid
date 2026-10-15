# Accessibility Baseline

> Baseline date: 2026-10-14

The Playwright suite runs axe WCAG A/AA checks against the documentation home page, Button, Form,
and Listy pages. All non-color rules are blocking.

## Known debt

### Color contrast

The current Ant Design-compatible palette produces `color-contrast` findings in the docs shell and
several component states, including primary buttons. The automated gate temporarily disables only
this axe rule while the token-level remediation is designed and reviewed.

Contrast must not be fixed with isolated demo overrides. The remediation needs to cover:

- light and dark themes;
- default, hover, active, disabled, and danger states;
- semantic status colors;
- text sizes and font weights;
- component tokens and global aliases;
- compatibility with the intended Ant Design visual baseline.

### Keyboard flows

Blocking Playwright keyboard flows now cover Menu roving focus, Tree expansion/navigation,
Select choice, Modal focus restoration, and DatePicker popup dismissal. Remaining composite
controls should be added incrementally as their keyboard contracts stabilize.

## Exit criteria

- Re-enable axe `color-contrast`.
- Expand keyboard-flow coverage to Tabs, Cascader, TreeSelect, Transfer, Slider, ColorPicker, and
  complex Form submission/error navigation.
