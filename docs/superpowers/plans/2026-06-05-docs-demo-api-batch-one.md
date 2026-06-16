# Docs Demo and API Batch One Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add richer examples and API tables for the first batch of ten under-documented component pages.

**Architecture:** Add one shared docs-only `ApiTable` component and use it across updated component pages. Each page imports local components from `@solid-ant-design/core`, defines example data and API rows, renders several `DemoBlock`s, then renders one or more API tables derived from the corresponding `packages/components/src/<component>/interface.ts` contracts.

**Tech Stack:** SolidJS, TypeScript, Vitest, `@solidjs/testing-library`, existing docs `DemoBlock`, Tailwind utility classes.

---

## File map

- Create `apps/docs/src/components/api-table.tsx`: shared API table renderer and `ApiTableRow` type.
- Create `apps/docs/src/components/api-table.test.tsx`: rendering tests for API table headers, row cells, and default placeholder behavior.
- Modify `apps/docs/src/pages/components/form.tsx`: add examples and API tables for Form, Form.Item, FormInstance, Rule.
- Modify `apps/docs/src/pages/components/grid.tsx`: add examples and API tables for Row and Col.
- Modify `apps/docs/src/pages/components/input.tsx`: add examples and API tables for Input and TextArea.
- Modify `apps/docs/src/pages/components/select.tsx`: add examples and API table for Select.
- Modify `apps/docs/src/pages/components/modal.tsx`: add examples and API tables for Modal and static methods.
- Modify `apps/docs/src/pages/components/message.tsx`: add examples and API tables for message API.
- Modify `apps/docs/src/pages/components/popconfirm.tsx`: add examples and API table for Popconfirm.
- Modify `apps/docs/src/pages/components/space.tsx`: add examples and API table for Space.
- Modify `apps/docs/src/pages/components/typography.tsx`: add examples and API tables for Typography subcomponents.
- Modify `apps/docs/src/pages/components/switch.tsx`: add examples and API table for Switch.
- Optionally add page smoke tests only if the new docs component is not sufficiently covered by build/typecheck.

---

### Task 1: Shared ApiTable component

**Files:**

- Create: `apps/docs/src/components/api-table.tsx`
- Create: `apps/docs/src/components/api-table.test.tsx`

- [ ] **Step 1: Write the failing ApiTable tests**

Create `apps/docs/src/components/api-table.test.tsx`:

```tsx
import { render } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { ApiTable } from './api-table'

const rows = [
  {
    property: 'disabled',
    description: 'Disables user interaction.',
    type: 'boolean',
    defaultValue: 'false',
  },
  {
    property: 'children',
    description: 'Content rendered inside the component.',
    type: 'JSX.Element',
  },
]

describe('ApiTable', () => {
  it('renders accessible table headers and row content', () => {
    const result = render(() => <ApiTable rows={rows} aria-label="Button API" />)

    expect(result.getByRole('table', { name: 'Button API' })).toBeInTheDocument()
    expect(result.getByRole('columnheader', { name: 'Property' })).toBeInTheDocument()
    expect(result.getByRole('columnheader', { name: 'Description' })).toBeInTheDocument()
    expect(result.getByRole('columnheader', { name: 'Type' })).toBeInTheDocument()
    expect(result.getByRole('columnheader', { name: 'Default' })).toBeInTheDocument()
    expect(result.getByText('disabled')).toBeInTheDocument()
    expect(result.getByText('Disables user interaction.')).toBeInTheDocument()
    expect(result.getByText('boolean')).toBeInTheDocument()
    expect(result.getByText('false')).toBeInTheDocument()
  })

  it('uses a dash when defaultValue is omitted', () => {
    const result = render(() => <ApiTable rows={rows} />)

    expect(result.getByText('children')).toBeInTheDocument()
    expect(result.getAllByText('-').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails because ApiTable does not exist**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- api-table.test.tsx --runInBand
```

Expected: FAIL with module resolution error for `./api-table`.

- [ ] **Step 3: Implement ApiTable**

Create `apps/docs/src/components/api-table.tsx`:

```tsx
import type { JSX } from 'solid-js'

export type ApiTableRow = {
  property: string
  description: JSX.Element
  type: string
  defaultValue?: string
}

export type ApiTableProps = {
  rows: ApiTableRow[]
  'aria-label'?: string
}

export function ApiTable(props: ApiTableProps) {
  return (
    <div class="my-4 overflow-x-auto rounded-lg border border-gray-200">
      <table class="w-full border-collapse text-left text-sm" aria-label={props['aria-label']}>
        <thead class="bg-slate-50 text-gray-600">
          <tr>
            <th class="border-b border-gray-200 px-4 py-3 font-semibold">Property</th>
            <th class="border-b border-gray-200 px-4 py-3 font-semibold">Description</th>
            <th class="border-b border-gray-200 px-4 py-3 font-semibold">Type</th>
            <th class="border-b border-gray-200 px-4 py-3 font-semibold">Default</th>
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row) => (
            <tr>
              <td class="border-b border-gray-100 px-4 py-3 align-top">
                <code>{row.property}</code>
              </td>
              <td class="border-b border-gray-100 px-4 py-3 align-top text-gray-700">
                {row.description}
              </td>
              <td class="border-b border-gray-100 px-4 py-3 align-top">
                <code>{row.type}</code>
              </td>
              <td class="border-b border-gray-100 px-4 py-3 align-top">
                <code>{row.defaultValue ?? '-'}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 4: Run the ApiTable test to verify it passes**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- api-table.test.tsx --runInBand
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/docs/src/components/api-table.tsx apps/docs/src/components/api-table.test.tsx
git commit -m "docs: add reusable api table"
```

---

### Task 2: Form, Grid, Input pages

**Files:**

- Modify: `apps/docs/src/pages/components/form.tsx`
- Modify: `apps/docs/src/pages/components/grid.tsx`
- Modify: `apps/docs/src/pages/components/input.tsx`

- [ ] **Step 1: Add/adjust tests for static docs rendering**

If no component-page smoke test exists, rely on typecheck/build for page rendering. Do not add brittle snapshot tests. The behavior requirement for this task is: each page exports a valid Solid component and includes API table rows typed as `ApiTableRow[]`.

- [ ] **Step 2: Update Form page**

Replace `apps/docs/src/pages/components/form.tsx` with an implementation that:

- imports `createSignal`, `Button`, `Checkbox`, `Form`, `Input`, `Space`, `Switch`, `message`, `ApiTable`, and `ApiTableRow`.
- defines row arrays for `formRows`, `formItemRows`, `formInstanceRows`, and `ruleRows`.
- renders examples titled `Basic form`, `Labels and initial values`, `Validation`, `Form instance`, and `Custom value binding`.
- renders API sections `Form`, `Form.Item`, `FormInstance`, and `Rule`.

Key code patterns to include:

```tsx
const [form] = createSignal(Form.useForm())

<Form form={form()} initialValues={{ username: 'solid-user' }}>
  <Form.Item label="Username" name="username">
    <Input />
  </Form.Item>
</Form>

<Form.Item name="agree" valuePropName="checked">
  <Checkbox>I agree</Checkbox>
</Form.Item>

<Button onClick={() => form().setFieldsValue({ username: 'updated' })}>Fill</Button>
```

Ensure code examples use actual implemented APIs from `packages/components/src/form/interface.ts`.

- [ ] **Step 3: Update Grid page**

Replace `apps/docs/src/pages/components/grid.tsx` with examples titled `24 columns`, `Gutter`, `Offset and order`, and `Flex alignment`. Use only implemented props from `packages/components/src/grid/interface.ts` after verifying `row.tsx` and `col.tsx`. Add `rowRows` and `colRows` API tables.

- [ ] **Step 4: Update Input page**

Replace `apps/docs/src/pages/components/input.tsx` with examples titled `Basic`, `Sizes`, `Prefix and suffix`, `Status and clear`, `TextArea`, and `In Form`. Add API tables for `Input` and `TextArea` based on `packages/components/src/input/interface.ts`.

- [ ] **Step 5: Run focused typecheck/build for docs**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/docs/src/pages/components/form.tsx apps/docs/src/pages/components/grid.tsx apps/docs/src/pages/components/input.tsx
git commit -m "docs: expand form grid input documentation"
```

---

### Task 3: Select, Switch, Space pages

**Files:**

- Modify: `apps/docs/src/pages/components/select.tsx`
- Modify: `apps/docs/src/pages/components/switch.tsx`
- Modify: `apps/docs/src/pages/components/space.tsx`

- [ ] **Step 1: Update Select page**

Replace `apps/docs/src/pages/components/select.tsx` with examples titled `Basic`, `Controlled`, `Clearable`, `Disabled options`, and `Open state`. Add API table for `SelectProps`. Verify option shape with `packages/components/src/shared/options.ts` and `packages/components/src/select/select.tsx`.

- [ ] **Step 2: Update Switch page**

Replace `apps/docs/src/pages/components/switch.tsx` with examples titled `Basic`, `Controlled`, `Disabled`, `Loading`, and `In Form` if corresponding props are implemented in `packages/components/src/switch/interface.ts` and `switch.tsx`. Add API table for `SwitchProps`.

- [ ] **Step 3: Update Space page**

Replace `apps/docs/src/pages/components/space.tsx` with examples titled `Basic`, `Direction`, `Size`, `Wrap`, and `Alignment`. If `split` is implemented in `packages/components/src/space/interface.ts`, include a `Split` example; otherwise omit it. Add API table for `SpaceProps`.

- [ ] **Step 4: Run focused verification**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/docs/src/pages/components/select.tsx apps/docs/src/pages/components/switch.tsx apps/docs/src/pages/components/space.tsx
git commit -m "docs: expand select switch space documentation"
```

---

### Task 4: Modal, Message, Popconfirm pages

**Files:**

- Modify: `apps/docs/src/pages/components/modal.tsx`
- Modify: `apps/docs/src/pages/components/message.tsx`
- Modify: `apps/docs/src/pages/components/popconfirm.tsx`

- [ ] **Step 1: Update Modal page**

Replace `apps/docs/src/pages/components/modal.tsx` with examples titled `Basic`, `Custom footer`, `Confirm loading`, `Static confirm`, and `Information methods`. Use `createSignal` for controlled open/loading states. Add API tables for `ModalProps`, `ModalFuncProps`, and `Modal static methods` based on `packages/components/src/modal/interface.ts`.

- [ ] **Step 2: Update Message page**

Replace `apps/docs/src/pages/components/message.tsx` with examples titled `Basic`, `Types`, `Duration`, `Loading`, and `Keyed update`. Add API tables for `MessageArgs`, `MessageHandle`, and `MessageInstance` from `packages/components/src/message/interface.ts`.

- [ ] **Step 3: Update Popconfirm page**

Replace `apps/docs/src/pages/components/popconfirm.tsx` with examples titled `Basic`, `Placement`, `Custom text`, `Controlled`, and `Async confirm` if async `onConfirm` is handled by implementation. Add API table for `PopconfirmProps` from `packages/components/src/popconfirm/interface.ts`.

- [ ] **Step 4: Run focused verification**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/docs/src/pages/components/modal.tsx apps/docs/src/pages/components/message.tsx apps/docs/src/pages/components/popconfirm.tsx
git commit -m "docs: expand feedback component documentation"
```

---

### Task 5: Typography page

**Files:**

- Modify: `apps/docs/src/pages/components/typography.tsx`

- [ ] **Step 1: Update Typography page**

Replace `apps/docs/src/pages/components/typography.tsx` with examples titled `Title`, `Text types`, `Paragraph`, and `Ellipsis` using only implemented props from `packages/components/src/typography/interface.ts` and `typography.tsx`. Add API tables for `Typography.Title`, `Typography.Text`, and `Typography.Paragraph` as appropriate.

- [ ] **Step 2: Run focused verification**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs build
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add apps/docs/src/pages/components/typography.tsx
git commit -m "docs: expand typography documentation"
```

---

### Task 6: Full repository verification

**Files:**

- No planned file changes unless verification exposes issues.

- [ ] **Step 1: Run lint**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: PASS.

- [ ] **Step 2: Run format check**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: PASS.

- [ ] **Step 3: Run recursive typecheck**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: PASS.

- [ ] **Step 4: Run recursive tests**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: PASS.

- [ ] **Step 5: Run recursive build**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: PASS.

- [ ] **Step 6: Commit any verification fixes**

If any verification-only fixes were needed:

```bash
git add <fixed-files>
git commit -m "docs: fix batch one verification issues"
```

Expected: clean working tree except unrelated pre-existing files.
