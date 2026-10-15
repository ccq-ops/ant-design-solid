# @solid-ant-design/icons

## 0.2.1

### Patch Changes

- fb18607: Align the reviewed API baseline with Ant Design 6.6.6.

  Fix disabled Alert close buttons, Card tab default selection, numeric zero content in Drawer
  sections, Upload file link click handlers, abortable Upload custom requests, and DirectoryTree Shift
  selection across disabled or non-selectable nodes.

  Align Carousel start/end dot placement with its vertical axis behavior, avoid RTL reversal for
  vertical carousels, remove the ignored `verticalSwiping` prop, and expose the native root ref.

  Fix Table tree-data selection actions, preserved row callbacks, filter popup rendering, and
  ConfigProvider scroll defaults. Fix Transfer numeric select-all labels and filtered Shift ranges.

  Merge ConfigProvider DatePicker and TimePicker locales into single and range picker placeholders
  and panel actions.

  Implement runtime CSS-variable themes with inherited key and prefix configuration, token variable
  registration, component declaration rewriting, and isolated nested theme caches.

  Add SSR style-tag extraction metadata, CSP nonce support, request-cache isolation coverage, and
  client rehydration that reuses server-rendered style elements.

  Publish Node-conditioned SSR builds for core and icons and verify server rendering through package
  exports.

  Add roving keyboard focus for Menu and Tree and blocking browser keyboard flows for Menu, Tree,
  Select, Modal, and DatePicker.

  Open Cascader and TreeSelect with Enter, Space, or ArrowDown, and extend blocking keyboard browser
  flows to Tabs, Slider, Cascader, TreeSelect, Transfer, and ColorPicker. Add roving focus and keyboard
  selection to Transfer listbox options, and preserve Slider handle focus across value updates.

  Associate Form.Item validation messages with Input, TextArea, and InputNumber through
  `aria-describedby`, expose invalid state with `aria-invalid`, announce errors, and verify first-error
  focus in a real browser.

  Defer Tabs overflow and indicator measurements from ResizeObserver callbacks to animation frames so
  layout writes no longer trigger observer-loop browser errors.

  Publish `en_US`, `zh_CN`, `zh_TW`, `ja_JP`, and `ko_KR` locale subpaths and apply ConfigProvider
  locale defaults across date/time pickers, calendar, pagination, table, modal, popconfirm, transfer,
  upload, empty state, QRCode, and form validation.

  Avoid ownerless Solid computations during docs bootstrap by lazily creating Breadcrumb's default
  dropdown icon and containing SolidBase's default-theme global mount in an explicit root.

## 0.2.0

### Minor Changes

- 8d86b88: release v0.2.0

## 0.1.0

### Minor Changes

- 8120148: Initial 0.1.0 release.
