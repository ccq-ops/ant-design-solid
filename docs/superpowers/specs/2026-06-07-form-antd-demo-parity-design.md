# Form Ant Design Demo Parity Design

## Goal

Expand the Form documentation page with Ant Design-inspired examples that demonstrate the common Form APIs already supported by `@ant-design-solid/core`.

## Scope

This work updates docs examples only unless a small bug or type issue is exposed while making the examples compile. It does not attempt to clone every Ant Design Form demo 1:1. It prioritizes cases that are valuable, runnable, and backed by current component capabilities.

## Examples to add

Add DemoBlock cases for:

1. Form layout: horizontal, vertical, and inline layout modes.
2. Required mark style: `requiredMark={false}` and `requiredMark="optional"`.
3. Validate trigger: item validation triggered on blur.
4. Validate only: call `validateFields(undefined, { validateOnly: true })` without mutating visible error state.
5. Warning only: use a `warningOnly` rule that does not block submit.
6. Dynamic rules: derive a field rule from watched form state.
7. Dependencies: password and confirm password revalidation.
8. shouldUpdate: render live form values or conditional content from form state.
9. noStyle nested control: combine an outer labeled item with an inner bound item.
10. Dynamic Form.Item: show or hide an additional field from another field value.
11. Advanced Form.List: add, remove, move, and display list errors.
12. Scroll to field: use `scrollToField` from a form instance.
13. getValueProps and normalize: demonstrate value mapping and normalization.
14. Form.Item.useStatus: custom input reads validation status.

## Out of scope

Do not add examples that depend on unsupported or unrelated APIs such as `Form.Provider`, global `validateMessages`, form-level `disabled`, `variant`, or component-heavy demos requiring Upload/Cascader/DatePicker behavior beyond this page's purpose. Do not add new docs routes.

## Implementation design

Keep all examples in `apps/docs/src/pages/components/form.tsx`, following the current DemoBlock pattern. Add small local helper components only when Solid hook rules require them, such as a `useWatch`/`useStatus` demo child. Prefer existing components already imported by the page: `Form`, `Input`, `Button`, `Space`, `Checkbox`, `Switch`, and `message`. Add minimal imports from `solid-js` only if required.

Each example should include a concise `code` string and a runnable rendered demo. Examples should avoid excessive layout complexity and use short labels/messages so the docs page remains readable.

## Testing and verification

Run the repository verification required by AGENTS.md after changes:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Also run a focused docs typecheck while iterating:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter docs typecheck
```

## Risks

Some examples may reveal incomplete implementation details in Form. If that happens, either adjust the example to a supported equivalent or make a minimal component fix with a focused regression test. Do not broaden this work into a full new Form feature project.
