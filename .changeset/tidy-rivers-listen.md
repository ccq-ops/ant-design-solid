---
'@solid-ant-design/core': patch
'@solid-ant-design/cssinjs': patch
'@solid-ant-design/icons': patch
---

Align the reviewed API baseline with Ant Design 6.6.6.

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
