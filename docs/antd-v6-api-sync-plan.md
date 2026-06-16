# Antd v6 API Alignment Audit Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align every public `@solid-ant-design/core` component API with `antd@6.4.4`, excluding APIs marked deprecated in antd v6 and translating React naming to Solid naming.

**Architecture:** Treat `packages/components/src/*/interface.ts` plus each component implementation, docs MDX, and tests as the source of truth. For every component task, first remove or replace local deprecated/React-style compatibility props, then add missing non-deprecated antd v6 APIs with Solid equivalents, tests, and docs.

**Tech Stack:** SolidJS, TypeScript, Vitest, pnpm workspace, `antd@6.4.4` declaration files as the comparison baseline.

---

## Audit Rules

- Baseline: `antd@6.4.4` npm package, inspected from `es/*/*.d.ts` declarations on 2026-06-15.
- Do not sync antd props marked `@deprecated` in v6.
- Remove or replace local props that correspond to antd v6 deprecated APIs when practical. If compatibility must remain temporarily, keep the task unchecked and document the blocker in the same bullet.
- Translate React naming to Solid naming:
  - `className` -> `class`
  - `rootClassName` -> `rootClass`
  - `popupClassName` -> `popupClass`
  - `dropdownClassName` -> `dropdownClass`
  - `overlayClassName` -> `overlayClass`
  - semantic `classNames` should become `classes` only where this project decides to complete the Solid API rename. Current code still exposes many `classNames` props; those are listed below.
- Ignore `class` vs `className` and native JSX/HTML attribute differences when comparing component behavior, except where this plan explicitly flags React-style names still exposed by local component APIs.
- Files must keep kebab-case names under `apps/` and `packages/`.
- Existing uncommitted timeline changes were present during this audit; do not overwrite them while executing timeline tasks.

## Global Tracking Tasks

- [ ] Replace public semantic `classNames` props with Solid-style `classes` across components, config-provider component config types, docs, and tests. Components currently exposing `classNames`: Alert, Anchor, AutoComplete, Badge, Ribbon, Breadcrumb, Button, Calendar, Card, Card.Meta, Cascader, Checkbox, Collapse, ColorPicker, DatePicker, Descriptions, Divider, Drawer, Dropdown, Empty, FloatButton, Form, Image, Input, Input.Password, Input.Search, Input.TextArea, Input.OTP, InputNumber, Masonry, Mentions, Menu, Message, Modal, Notification, Pagination, Popconfirm, Popover, Progress, QRCode, Radio, Result, Segmented, Select, Skeleton, Slider, Space, Spin, Splitter, Statistic, Steps, Switch, Tabs, Tag, Timeline, Tooltip, Tour, Transfer, Tree, TreeSelect, Typography, Upload.
- [ ] For each renamed `classes` API, update config-provider mappings in `packages/components/src/config-provider/interface.ts` and `packages/components/src/config-provider/config-provider.tsx` so defaults still merge correctly.
- [ ] Add a public API type test that imports every exported component props type and asserts React-style aliases are absent after the relevant task is completed.
- [ ] Re-run a fresh `npm pack antd@latest` audit before starting a large batch, because v6 latest may change after this file was created.

## Component API Tasks

### Affix

No public API delta found after excluding JSX native attributes and deprecated antd APIs.

### Alert

- [ ] Remove local deprecated antd v6 props from `AlertProps`: `message`, `closeText`, `closeIcon`, `afterClose`, `onClose`.
- [ ] Keep/route replacements through current v6 APIs: `title`, `closable.closeIcon`, `closable.afterClose`, `closable.onClose`.
- [ ] Rename `classNames` to `classes` for `AlertProps` and config-provider `AlertConfig`.
- [ ] Rename `AlertErrorBoundaryProps` to exported `ErrorBoundaryProps`, or export an alias with that name, and keep only non-deprecated props `title`, `description`, `children`.
- [ ] Update tests and `apps/docs/src/routes/components/alert.mdx` examples/API tables.

### Anchor

- [ ] Remove `rootClassName` from `AnchorProps`; use `rootClass`.
- [ ] Remove deprecated `children` usage from `AnchorProps`; use `items`.
- [ ] Remove `className` from `AnchorLinkProps`; use `class`.
- [ ] Rename `classNames` to `classes` for `AnchorProps` and `AnchorConfig`.
- [ ] Update tests and docs examples for `Anchor.Link`.

### App

- [ ] Add non-deprecated antd v6 props to `AppProps` with Solid names: `component`, `notification`, `class`, `rootClass`, `style`.
- [ ] Keep existing `message`; add notification config wiring in `packages/components/src/app/app.tsx` and context if missing.
- [ ] Update App docs/tests to cover `component={false}`, `class`, `rootClass`, and notification config.

### AutoComplete

- [ ] Remove local deprecated antd v6 props: `dataSource`, `dropdownClassName`, `dropdownClass`, `dropdownMatchSelectWidth`, `dropdownRender`, `dropdownStyle`, `onDropdownVisibleChange`, `popupClassName`, `popupClass` if it only aliases deprecated popup class behavior.
- [ ] Use v6 replacements: `options`, `popupMatchSelectWidth`, `popupRender`, `styles.popup.root`, `onOpenChange`, semantic `classes.popup.root`.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests for popup customization and open-change behavior.

### Avatar

- [ ] Remove deprecated `AvatarGroupProps` props: `maxCount`, `maxPopoverPlacement`, `maxPopoverTrigger`, `maxStyle`.
- [ ] Ensure `Avatar.Group` uses v6 `max={{ count, popover, style }}`.
- [ ] Add/adjust tests and docs for `max` object API.

### Badge

- [ ] Remove `rootClassName` from `BadgeProps` and `RibbonProps`; use `rootClass`.
- [ ] Rename `classNames` to `classes` for Badge/Ribbon APIs and config-provider `BadgeConfig`/`RibbonConfig`.
- [ ] Update docs/tests.

### BorderBeam

No public API delta found after excluding JSX native attributes.

### Breadcrumb

- [ ] Remove deprecated `routes` from `BreadcrumbProps`; use `items`.
- [ ] Rename `classNames` to `classes` for `BreadcrumbProps` and `BreadcrumbConfig`.
- [ ] Verify `BreadcrumbItemProps` remains aligned with v6 after the route removal.
- [ ] Update docs/tests.

### Button

- [ ] Remove deprecated `iconPosition` from `ButtonProps`; use `iconPlacement`.
- [ ] Add/confirm `ButtonShape` includes v6 value `square`.
- [ ] Decide whether to expose deprecated `Button.Group`. antd v6 marks `Button.Group` deprecated; do not add it if absent, and remove local exports if present.
- [ ] Rename `classNames` to `classes` for `ButtonProps` and `ButtonConfig`.
- [ ] Update docs/tests for `iconPlacement` and `shape="square"`.

### Calendar

- [ ] Remove `rootClassName`; use `rootClass`.
- [ ] Remove deprecated render props: `dateCellRender`, `dateFullCellRender`, `monthCellRender`, `monthFullCellRender`.
- [ ] Ensure replacements are covered: `cellRender` and `fullCellRender`.
- [ ] Rename `classNames` to `classes` for `CalendarProps` and `CalendarConfig`.
- [ ] Update docs/tests.

### Card

- [ ] Remove deprecated `bordered` from `CardProps`; use `variant`.
- [ ] Rename `classNames` to `classes` for `CardProps`, `CardMetaProps`, `CardConfig`, and `CardMetaConfig`.
- [ ] Update docs/tests for `variant="borderless"` / `variant="outlined"`.

### Carousel

- [ ] Remove deprecated `dotPosition`; use `dotPlacement`.
- [ ] Verify existing `dotPlacement` supports `top`, `bottom`, `start`, `end`.
- [ ] Update docs/tests.

### Cascader

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass` in `CascaderProps`.
- [ ] Rename `classNames` to `classes` for `CascaderProps` and `CascaderConfig`.
- [ ] Confirm `Cascader.Panel` public API. If local panel component is exported, add a `CascaderPanelProps` type aligned to v6 non-deprecated API; otherwise document that panel is intentionally unsupported and keep this item unchecked.
- [ ] Update docs/tests.

### Checkbox

- [ ] Add Solid equivalent for `rootClassName`: `rootClass` to `CheckboxProps` and `CheckboxGroupProps`.
- [ ] Add `autoFocus` to `CheckboxProps` if Solid input autofocus behavior is supported.
- [ ] Do not expose antd internal `type` unless the rendered input type needs public override; if omitted intentionally, document this as Solid implementation detail in tests.
- [ ] Rename `classNames` to `classes` for Checkbox APIs and `CheckboxConfig`.
- [ ] Update docs/tests.

### Collapse

- [ ] Remove deprecated props from `CollapseProps`: `children`, `destroyInactivePanel`, `expandIconPosition`.
- [ ] Use replacements: `items`, `destroyOnHidden`, `expandIconPlacement`.
- [ ] Add/export `CollapsePanelProps` only if `Collapse.Panel` remains public; otherwise do not add deprecated panel-style API.
- [ ] Rename `classNames` to `classes` for `CollapseProps`, item APIs, and `CollapseConfig`.
- [ ] Update docs/tests.

### ColorPicker

- [ ] Remove deprecated `destroyTooltipOnHide`; use `destroyOnHidden`.
- [ ] Export and support `ColorPickerPanelProps` if `ColorPicker.Panel` is public. Non-deprecated v6 panel props to cover: `activeIndex`, `allowClear`, `disabled`, `disabledAlpha`, `disabledFormat`, `format`, `gradientDragging`, `mode`, `modeOptions`, `onActive`, `onChange`, `onChangeComplete`, `onClear`, `onFormatChange`, `onGradientDragging`, `onModeChange`, `panelRender`, `presets`, `value`.
- [ ] Rename `classNames` to `classes` for ColorPicker APIs and config.
- [ ] Update docs/tests.

### ConfigProvider

- [ ] Add `list` to `ConfigProviderProps` and component config plumbing.
- [ ] Ensure `ThemeConfig` exported from `@solid-ant-design/theme` exposes v6 fields: `algorithm`, `components`, `cssVar`, `hashed`, `inherit`, `token`, `zeroRuntime`.
- [ ] Export/align `ComponentsConfig`; include component configs for all public components, including List when implemented.
- [ ] Rename all component-config `classNames` fields to `classes` after component-level rename tasks.
- [ ] Remove deprecated config fields if present: `autoInsertSpaceInButton`, `dropdownMatchSelectWidth`.
- [ ] Update config-provider tests and docs.

### DatePicker

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass` to `RangePickerProps`; check whether `DatePickerProps` already has it through shared picker props.
- [ ] Remove deprecated popup aliases if still public: `popupClassName`, `dropdownClassName`, `popupStyle`, `bordered`.
- [ ] Rename `classNames` to `classes` for DatePicker/RangePicker APIs and config.
- [ ] Update docs/tests.

### Descriptions

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass` to `DescriptionsProps`.
- [ ] Remove deprecated `children` item API from `DescriptionsProps`; use `items`.
- [ ] Do not sync deprecated `contentStyle` / `labelStyle`; use `styles`.
- [ ] Rename `classNames` to `classes` for Descriptions APIs and config.
- [ ] Update docs/tests.

### Divider

- [ ] Remove deprecated `orientationMargin`; use `styles.content.margin`.
- [ ] Rename `classNames` to `classes` for `DividerProps` and `DividerConfig`.
- [ ] Update docs/tests.

### Drawer

- [ ] Rename `classNames` to `classes` for `DrawerProps` and `DrawerConfig`.
- [ ] Recheck drawer after global rename; no missing non-deprecated v6 public props were found in this audit.

### Dropdown

- [ ] Add non-deprecated v6 props to `DropdownProps`: `openClassName`, `transitionName`.
- [ ] Add non-deprecated v6 props to `DropdownButtonProps`: `autoAdjustOverflow`, `classes`, `forceRender`, `openClassName`, `rootClass`, `size`, `styles`, `transitionName`.
- [ ] Remove deprecated props: `destroyPopupOnHide`, `dropdownRender`, `overlayClassName`, `overlayClass`, `overlayStyle`.
- [ ] Use replacements: `destroyOnHidden`, `popupRender`, `classes.root`, `styles.root`.
- [ ] Rename `classNames` to `classes` for Dropdown APIs and config.
- [ ] Update docs/tests.

### Empty

- [ ] Remove `rootClassName`; use `rootClass`.
- [ ] Rename `classNames` to `classes` for `EmptyProps` and `EmptyConfig`.
- [ ] Update docs/tests.

### Flex

- [ ] Remove `rootClassName`; use `rootClass`.
- [ ] Update docs/tests.

### FloatButton

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass` to `FloatButtonProps` and `FloatButtonGroupProps`.
- [ ] Add `href` and `target` to `FloatButtonGroupProps` if supported by v6 group rendering.
- [ ] Remove deprecated `description`; use `content`.
- [ ] Implement/export `BackTopProps` only if `FloatButton.BackTop` is public locally. Non-deprecated v6 props: `class`, `duration`, `onClick`, `rootClass`, `target`, `visibilityHeight`.
- [ ] Rename `classNames` to `classes` for FloatButton APIs and config.
- [ ] Update docs/tests.

### Form

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass` to `FormProps`.
- [ ] Export/support `ErrorListProps` if `Form.ErrorList` is public: `class`, `errors`, `fieldId`, `help`, `helpStatus`, `onVisibleChanged`, `warnings`.
- [ ] Rename `classNames` to `classes` for Form/Form.Item APIs and config.
- [ ] Update docs/tests.

### Grid

No public Row/Col API delta found after excluding JSX native attributes.

### Image

- [ ] Remove deprecated `wrapperStyle`; use `styles.root`.
- [ ] Export/support `PreviewGroupProps` if `Image.PreviewGroup` is public: `classes`, `preview`, `styles`.
- [ ] Rename `classNames` to `classes` for Image APIs and config.
- [ ] Update docs/tests.

### Input

- [ ] Remove `rootClassName` from `InputProps`, `PasswordProps`, `SearchProps`, `TextAreaProps`, and `OTPProps`; use `rootClass`.
- [ ] Remove deprecated `addonBefore` and `addonAfter` from Input, Password, and Search; use `Space.Compact`.
- [ ] Remove deprecated `bordered`; use `variant` / `variant="borderless"`.
- [ ] Do not add `Input.Group`; antd v6 marks `Input.Group` deprecated via compound API.
- [ ] Rename `classNames` to `classes` for all Input variants and config.
- [ ] Update docs/tests.

### InputNumber

- [ ] Remove `rootClassName`; use `rootClass`.
- [ ] Remove deprecated `addonBefore`, `addonAfter`, and `bordered`; use `Space.Compact` and `variant`.
- [ ] Rename `classNames` to `classes` for `InputNumberProps` and config.
- [ ] Update docs/tests.

### Layout

- [ ] Export `SiderProps` and ensure `Layout.Sider` public API covers v6 props: `breakpoint`, `collapsed`, `collapsedWidth`, `collapsible`, `defaultCollapsed`, `onBreakpoint`, `onCollapse`, `reverseArrow`, `theme`, `trigger`, `width`, `zeroWidthTriggerStyle`.
- [ ] Update layout docs/tests for Sider responsive and collapsed behavior.

### List

- [ ] Implement/export missing `List` component and `ListProps`.
- [ ] Cover non-deprecated v6 props: `bordered`, `class`, `dataSource`, `extra`, `footer`, `grid`, `header`, `itemLayout`, `loadMore`, `loading`, `locale`, `pagination`, `renderItem`, `rootClass`, `rowKey`, `size`, `split`, `style`.
- [ ] Add `List.Item` and nested item/meta APIs only after checking antd v6 declarations for non-deprecated public exports.
- [ ] Add docs route `apps/docs/src/routes/components/list.mdx` and tests.

### Masonry

- [ ] Remove `rootClassName`; use `rootClass`.
- [ ] Rename `classNames` to `classes` for `MasonryProps` and config.
- [ ] Update docs/tests.

### Mentions

- [ ] Export/support `MentionProps` if `Mentions.Option` or equivalent option component remains public. Non-deprecated props to cover: `classes`, `loading`, `options`, `popupClass` or `classes.popup.root`, `rootClass`, `size`, `status`, `styles`, `variant`.
- [ ] Rename `classNames` to `classes` for `MentionsProps` and config.
- [ ] Remove deprecated popup aliases if present.
- [ ] Update docs/tests.

### Menu

- [ ] Export/support `MenuItemProps` with non-deprecated v6 props `danger` and `icon` if `Menu.Item` is public.
- [ ] Export/support `SubMenuProps` if `Menu.SubMenu` is public; verify exact v6 non-deprecated props before implementation.
- [ ] Export/support `MenuDividerProps` with `class` and `dashed` if `Menu.Divider` is public.
- [ ] Rename `classNames` to `classes` for Menu APIs and config.
- [ ] Update docs/tests.

### Message

- [ ] Rename `classNames` to `classes` for `ArgsProps`, `MessageConfig`, and config-provider message defaults.
- [ ] Recheck message after global rename; no missing non-deprecated v6 public props were found in this audit.

### Modal

- [ ] Add `wrapClassName` as Solid `wrapClass` or intentionally keep exact antd prop if implementation needs it; document the naming decision in tests.
- [ ] Remove deprecated props from `ModalProps`: `bodyStyle`, `focusTriggerAfterClose`, `maskClosable`, `maskStyle`.
- [ ] Remove deprecated props from `ModalFuncProps`: `autoFocusButton`, `bodyStyle`, `focusTriggerAfterClose`, `maskClosable`, `maskStyle`.
- [ ] Use replacements: `styles.body`, `focusable.focusTriggerAfterClose`, `mask.closable`, `styles.mask`, `focusable.autoFocusButton`.
- [ ] Rename `classNames` to `classes` for Modal APIs and config.
- [ ] Update docs/tests.

### Notification

- [ ] Export/align notification `ArgsProps`; non-deprecated v6 props to cover: `actions`, `class`, `classes`, `closable`, `closeIcon`, `description`, `duration`, `icon`, `onClick`, `onClose`, `pauseOnHover`, `placement`, `props`, `showProgress`, `styles`, `type`.
- [ ] Rename `classNames` to `classes` for notification config and instance APIs.
- [ ] Update docs/tests.

### Pagination

- [ ] Rename `classNames` to `classes` for `PaginationProps` and `PaginationConfig`.
- [ ] Recheck pagination after global rename; no missing non-deprecated v6 public props were found in this audit.

### Popconfirm

- [ ] Add non-deprecated v6 prop `builtinPlacements` if tooltip placement customization is supported.
- [ ] Remove `rootClassName`; use `rootClass`.
- [ ] Remove deprecated props: `destroyTooltipOnHide`, `overlayClassName`, `overlayClass`, `overlayInnerStyle`, `overlayStyle`.
- [ ] Use replacements: `destroyOnHidden`, `classes.root`, `styles.container`, `styles.root`.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### Popover

- [ ] Add `openClassName` as Solid `openClass` or exact v6 prop after choosing naming convention.
- [ ] Remove deprecated props: `destroyTooltipOnHide`, `overlayClassName`, `overlayInnerStyle`, `overlayStyle`.
- [ ] Use replacements: `destroyOnHidden`, `classes.root`, `styles.container`, `styles.root`.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### Progress

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass`.
- [ ] Add v6 props: `rounding`, `classes`, `styles`.
- [ ] Remove deprecated props: `gapPosition`, `trailColor`, `width`.
- [ ] Use replacements: `gapPlacement`, `railColor`, `size`.
- [ ] Update docs/tests.

### QRCode

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass`.
- [ ] Rename `classNames` to `classes`.
- [ ] Check local `bgColor`, `color`, `boostLevel`, `marginSize`, `locale` against v6 declarations and keep only if still public/non-deprecated or intentionally Solid-specific.
- [ ] Update docs/tests.

### Radio

- [ ] Add `autoFocus` to `RadioProps` if Solid input autofocus behavior is supported.
- [ ] Do not expose antd internal `type` unless needed; document if intentionally omitted.
- [ ] Rename `classNames` to `classes` for `RadioProps`, `RadioGroupProps`, and config.
- [ ] Update docs/tests.

### Rate

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass`.
- [ ] Update docs/tests.

### Result

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass`.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### Segmented

- [ ] Rename `classNames` to `classes` for `SegmentedProps` and config.
- [ ] Recheck segmented after global rename; no missing non-deprecated v6 public props were found in this audit.

### Select

- [ ] Remove `rootClassName`; use `rootClass`.
- [ ] Remove deprecated popup/dropdown props: `popupClassName`, `dropdownClassName`, `dropdownMatchSelectWidth`, `dropdownRender`, `dropdownStyle`, `onDropdownVisibleChange`.
- [ ] Use replacements: `classes.popup.root`, `popupMatchSelectWidth`, `popupRender`, `styles.popup`, `onOpenChange`.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### Skeleton

- [ ] Remove `rootClassName`; use `rootClass` on Skeleton root and all element components.
- [ ] Add `classes` and `styles` to `SkeletonAvatarProps` if that component is public and v6 supports semantic styling.
- [ ] Add `class` to `SkeletonTitleProps` and `SkeletonParagraphProps` if those sub-props are public and render classable elements.
- [ ] Rename `classNames` to `classes` for all Skeleton APIs and config.
- [ ] Update docs/tests.

### Slider

- [ ] Export v6-compatible `SliderSingleProps` and `SliderRangeProps`, or document why the Solid component intentionally exposes one unified `SliderProps` while still supporting the same runtime API.
- [ ] Add Solid equivalents for v6 base props currently absent from local `SliderProps`: `rootClass`, `autoFocus`, `ariaLabelForHandle`, `ariaLabelledByForHandle`, `ariaRequired`, `ariaValueTextFormatterForHandle`, `onFocus`, `onBlur`.
- [ ] Remove deprecated `tooltipVisible` and `onAfterChange`; use `tooltip.open` and `onChangeComplete`.
- [ ] Do not add deprecated v6 style aliases `handleStyle`, `trackStyle`, `railStyle`; use `styles.handle`, `styles.track`, `styles.rail`.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### Space

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass` to `SpaceProps` and `SpaceCompactProps`.
- [ ] Remove deprecated `direction`; use `orientation`.
- [ ] Remove deprecated `split`; use `separator`.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### Spin

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass`.
- [ ] Remove deprecated `tip`; use `description`.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### Splitter

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass`.
- [ ] Remove deprecated `collapsibleIcon`; use `collapsible.icon`.
- [ ] Remove deprecated `layout`; use `orientation`.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### Statistic

- [ ] Export/support `CountdownProps` if `Statistic.Countdown` is public. Non-deprecated v6 props to cover: `format`, `onChange`, `onFinish`.
- [ ] Add `formatter` to `StatisticTimerProps`.
- [ ] Rename `classNames` to `classes` for Statistic APIs and config.
- [ ] Update docs/tests.

### Steps

- [ ] Remove `className` from `StepProps`; use `class`.
- [ ] Remove `rootClassName` from `StepsProps`; use `rootClass`.
- [ ] Remove deprecated props: `direction`, `labelPlacement`, `progressDot`.
- [ ] Use replacements: `orientation`, `titlePlacement`, `type` plus `iconRender`.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### Switch

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass`.
- [ ] Add `autoFocus` if Solid button/input focus behavior supports it.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### Table

- [ ] Remove `className` from `TableProps` and config; use `class`.
- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass`.
- [ ] Add v6 props: `classes`, `styles`, `column`, `dropdownPrefixCls`, `getPopupContainer`, `showSorterTooltip`, `sortDirections`.
- [ ] Update `ColumnType` / `ColumnGroupType` exports if needed for `column` support.
- [ ] Update docs/tests.

### Tabs

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass`.
- [ ] Add `moreIcon` to `TabsProps`.
- [ ] Remove deprecated props: `destroyInactiveTabPane`, `tabPosition`.
- [ ] Use replacements: `destroyOnHidden`, `tabPlacement`.
- [ ] Do not add deprecated `TabPane` children API unless already public; if public, mark migration to `items`.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### Tag

- [ ] Remove `rootClassName`; use `rootClass` on `TagProps` and `CheckableTagGroupProps`.
- [ ] Remove deprecated `bordered`; use `variant="filled"` or other v6 variants.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### TimePicker

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass`.
- [ ] Add non-deprecated `addon` to `TimePickerProps` if panel footer addon is supported in v6.
- [ ] Remove deprecated popup aliases: `popupClassName`, `dropdownClassName`, `popupStyle`.
- [ ] Use replacements: `classes.popup`, `styles.popup`.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### Timeline

- [ ] Remove `className` from `TimelineItemProps`; use `class`.
- [ ] Remove `rootClassName` and `className` from `TimelineProps`; use `rootClass` and `class`.
- [ ] Rename `classNames` to `classes` for Timeline APIs and config.
- [ ] Coordinate with existing uncommitted timeline changes before editing files.
- [ ] Update docs/tests.

### Tooltip

- [ ] Remove `rootClassName`; use `rootClass`.
- [ ] Remove deprecated props: `destroyTooltipOnHide`, `overlayClassName`, `overlayClass`, `overlayInnerStyle`, `overlayStyle`.
- [ ] Use replacements: `destroyOnHidden`, `classes.root`, `styles.container`, `styles.root`.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### Tour

- [ ] Export/align `TourStepProps` with local `TourStep`, or rename local type to match v6 export.
- [ ] Ensure step props cover non-deprecated v6 fields: `actionsRender`, `classes`, `cover`, `indicatorsRender`, `nextButtonProps`, `prevButtonProps`, `styles`, `type`.
- [ ] Rename `classNames` to `classes` for Tour APIs and config.
- [ ] Update docs/tests.

### Transfer

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass`.
- [ ] Remove deprecated props: `listStyle`, `operationStyle`, `operations`.
- [ ] Use replacements: `styles.section`, `styles.actions`, `actions`.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### Tree

- [ ] Add `filterAntTreeNode` to `TreeProps` and `DirectoryTreeProps`, or document an intentional Solid-compatible name if different.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### TreeSelect

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass`.
- [ ] Remove deprecated props: `bordered`, `dropdownClassName`, `dropdownMatchSelectWidth`, `dropdownRender`, `dropdownStyle`, `onDropdownVisibleChange`, `popupClassName`, `showArrow`.
- [ ] Use replacements: `variant`, `classes.popup.root`, `popupMatchSelectWidth`, `popupRender`, `styles.popup.root`, `onOpenChange`, `suffixIcon={null}` for hiding arrow.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### Typography

- [ ] Add `direction` to `TypographyProps`, `TitleProps`, `TextProps`, `ParagraphProps`, and `LinkProps`.
- [ ] Add `component` to `TitleProps`, `TextProps`, `ParagraphProps`, and `LinkProps` where v6 allows overriding rendered element.
- [ ] Add `type` to `LinkProps` if v6 supports it for link typography.
- [ ] Remove `rootClassName`; use `rootClass`.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### Upload

- [ ] Add Solid equivalent for antd `rootClassName`: `rootClass`.
- [ ] Add v6 props: `hasControlInside`, `locale`, `supportServerRender`.
- [ ] Export `DraggerProps` as a specific type for `Upload.Dragger`; it can extend `UploadProps` but must expose v6 props including `height` and `type`.
- [ ] Rename `classNames` to `classes`.
- [ ] Update docs/tests.

### Watermark

- [ ] Remove `className`; use `class`.
- [ ] Remove `rootClassName`; use `rootClass`.
- [ ] Update docs/tests.

## Verification Checklist

Run these after each completed component batch:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

For file renames, also follow the repository case-only rename safety rule from `AGENTS.md`.

## Audit Artifacts

Temporary scripts/results used for this audit were created under `tmp-api-audit/` and should not be treated as product source. They can be deleted after this plan is reviewed, or promoted into a checked-in API audit tool in a separate task.
