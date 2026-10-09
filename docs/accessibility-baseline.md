# Accessibility Baseline

> Baseline date: 2026-10-08

The Playwright suite runs axe WCAG A/AA checks against the documentation home page, Button page,
and Listy page. All non-color rules are blocking.

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

### Form demo accessible names

The complete Form documentation page currently contains demo inputs, selects, spin buttons, and
switches without accessible names. The initial gate therefore does not scan the whole Form page.
Form, Select, InputNumber, and Switch need component and demo-level accessible-name audits before
that route can be added to the blocking suite.

## Exit criteria

- Re-enable axe `color-contrast`.
- Add the Form documentation route to the blocking scan.
- Add keyboard-flow tests for overlays, menus, trees, forms, and composite inputs.
