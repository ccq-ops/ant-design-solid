# Docs Demo and API Batch One Design

## Context

The documentation site has component pages under `apps/docs/src/pages/components`. Many pages already contain working `DemoBlock` examples, but most pages do not include API tables. Several common components also have only one or two examples. The component prop contracts are available in `packages/components/src/<component>/interface.ts`, so API docs should be derived from implemented props rather than from upstream Ant Design assumptions.

## Goal

Improve the first batch of high-impact component documentation by adding missing examples and API tables while preserving the current docs style and route structure.

## Scope

This batch covers ten commonly used or especially under-documented component pages:

1. `form`
2. `grid`
3. `input`
4. `select`
5. `modal`
6. `message`
7. `popconfirm`
8. `space`
9. `typography`
10. `switch`

For each page, the target is at least 4 examples where the component supports enough meaningful variants, plus API documentation based on the local `interface.ts` file. If a component is intentionally small, examples should remain concise and avoid invented functionality.

## Non-goals

- Do not change component runtime behavior unless a docs example exposes an existing compile/runtime issue that must be fixed to make documented behavior accurate.
- Do not copy Ant Design APIs that are not implemented in this repository.
- Do not redesign the documentation application or navigation.
- Do not touch generated build output under `apps/docs/dist`.

## Documentation architecture

Add a shared API table component at `apps/docs/src/components/api-table.tsx` with a small exported row type. Component pages will import this helper instead of embedding custom table markup. The table will render the standard columns:

- Property
- Description
- Type
- Default

The API table should accept a `rows` array and an optional accessible label. It should render code-styled cells for property, type, and default values, and it should keep styling consistent with existing Tailwind utility usage.

## Component page pattern

Each updated page should keep the current structure:

```tsx
export default function ComponentPage() {
  return (
    <>
      <h1>Component</h1>
      <p>Short component summary.</p>
      <DemoBlock ... />
      <h2>API</h2>
      <ApiTable rows={...} />
    </>
  )
}
```

Pages with multiple public APIs should use multiple tables with clear headings, for example `Form`, `Form.Item`, `FormInstance`, and `Rule`.

## Example design by component

### Form

Add examples for labelled fields, validation feedback, controlled form instance operations, and custom control binding. Document `FormProps`, `FormItemProps`, `FormInstance`, and `Rule`.

### Grid

Add examples for 24-column spans, gutter, offset/order/flex layout if implemented, and responsive-looking layouts using available props. Document `RowProps`, `ColProps`, and `Gutter`.

### Input

Add examples for sizes, prefix/suffix, allow clear, status, TextArea, and Form integration. Document `InputProps` and `TextAreaProps`.

### Select

Add examples for options, controlled value, clearable, disabled/options disabled, and open state if useful. Document `SelectProps` and option types used by the page.

### Modal

Add examples for controlled modal, custom footer, confirm loading, static confirm/info/success flows, and mask/keyboard behavior if supported. Document `ModalProps`, `ModalFuncProps`, and static methods.

### Message

Add examples for basic types, duration, keyed update/destroy, loading lifecycle, and explicit `message.open`. Document `MessageArgs`, `MessageHandle`, and `MessageInstance`.

### Popconfirm

Add examples for title/description, placements, custom text, disabled behavior if implemented, and async confirm if supported. Document `PopconfirmProps`.

### Space

Add examples for direction, size, wrap, alignment, and custom split if implemented. Document `SpaceProps` and `SpaceSize`.

### Typography

Add examples for title levels, text types, paragraph ellipsis/copyable if implemented, and code/keyboard/mark variants if supported. Document public Typography prop interfaces from `interface.ts`.

### Switch

Add examples for basic, controlled, disabled, loading if implemented, checked/unchecked children if implemented, and Form binding. Document `SwitchProps`.

## Testing and verification

Add focused tests for the new `ApiTable` component. Update or add docs page tests only where useful to verify that updated pages expose API sections and example titles. Run the repository verification commands required by `AGENTS.md` after the docs changes:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

## Risks and mitigations

- **Risk:** Documenting props that are declared but not actually wired in implementation. **Mitigation:** inspect implementation files while writing each page and avoid examples that cannot work.
- **Risk:** Very large page edits become hard to review. **Mitigation:** keep this to ten pages and reuse `ApiTable` to reduce repeated markup.
- **Risk:** Examples trigger browser APIs unavailable in tests. **Mitigation:** use smoke tests focused on static rendering unless interaction is already covered elsewhere.
- **Risk:** TypeScript filenames violate repo policy. **Mitigation:** any new TypeScript files use lowercase kebab-case names.
