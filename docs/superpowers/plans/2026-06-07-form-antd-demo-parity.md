# Form Ant Design Demo Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Ant Design-inspired Form examples to the docs page for common APIs supported by the Solid implementation.

**Architecture:** Keep the docs implementation localized to `apps/docs/src/pages/components/form.tsx`. Add small helper components near the existing `WatchedUsername` helper for hook-based examples, then add focused `DemoBlock` sections before the API tables. Only touch component source/tests if a docs example exposes a real compile/runtime gap.

**Tech Stack:** SolidJS, TypeScript, `@solid-ant-design/core`, existing docs `DemoBlock` and `ApiTable` components, pnpm workspace scripts.

---

## File Structure

- Modify: `apps/docs/src/pages/components/form.tsx`
  - Add helper components for dynamic rules, `shouldUpdate`, and `Form.Item.useStatus` examples.
  - Add DemoBlock examples for layout, required mark, validate trigger, validate only, warning only, dynamic rules, dependencies, shouldUpdate, noStyle, dynamic Form.Item, advanced Form.List, scrollToField, getValueProps/normalize, and useStatus.
- Optional Test Modify: `apps/docs/src/pages/components/__tests__/form-page.test.tsx` if a docs page test already exists and snapshots/query expectations need updating. If no focused form page test exists, rely on existing docs tests plus typecheck/build.
- Optional Component/Test Modify: only if an example reveals a concrete Form bug. Add a focused test under `packages/components/src/form/__tests__/` before the minimal fix.

---

### Task 1: Prepare docs helper components

**Files:**

- Modify: `apps/docs/src/pages/components/form.tsx`

- [ ] **Step 1: Inspect current imports and helper location**

Run:

```bash
sed -n '1,260p' apps/docs/src/pages/components/form.tsx
```

Expected: file imports `For` and `createSignal` from `solid-js`, imports Form-related components, and defines `WatchedUsername` before `FormPage`.

- [ ] **Step 2: Add helper components after `WatchedUsername`**

Insert these helpers after the existing `WatchedUsername` function:

```tsx
function DynamicRuleFields() {
  const requireNickname = Form.useWatch('requireNickname')

  return (
    <>
      <Form.Item name="requireNickname" valuePropName="checked">
        <Checkbox>Nickname is required</Checkbox>
      </Form.Item>
      <Form.Item
        label="Nickname"
        name="nickname"
        rules={[
          {
            required: Boolean(requireNickname()),
            message: 'Please input nickname',
          },
        ]}
      >
        <Input placeholder="Nickname" />
      </Form.Item>
    </>
  )
}

function ConditionalCompanyField() {
  const business = Form.useWatch('business')

  return (
    <>
      <Form.Item name="business" valuePropName="checked">
        <Checkbox>Business account</Checkbox>
      </Form.Item>
      {business() ? (
        <Form.Item label="Company" name="company" rules={[{ required: true }]}>
          <Input placeholder="Company name" />
        </Form.Item>
      ) : null}
    </>
  )
}

function StatusInput() {
  const status = Form.Item.useStatus()
  return <Input placeholder={`Status: ${status.status() ?? 'none'}`} />
}
```

- [ ] **Step 3: Run focused docs typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter docs typecheck
```

Expected: PASS. If `Form.Item.useStatus()` or `Form.useWatch()` types require a different accessor shape, adjust helpers to match the exported types and rerun.

- [ ] **Step 4: Commit helpers**

Run:

```bash
git add apps/docs/src/pages/components/form.tsx
git commit -m "docs(form): add demo helper components"
```

---

### Task 2: Add layout and required mark examples

**Files:**

- Modify: `apps/docs/src/pages/components/form.tsx`

- [ ] **Step 1: Add Form layout DemoBlock after "Labels and initial values"**

Insert this DemoBlock after the existing `Labels and initial values` DemoBlock:

```tsx
<DemoBlock
  title="Form layout"
  code={`<Form layout="vertical">
  <Form.Item label="Username" name="username"><Input /></Form.Item>
</Form>
<Form layout="inline">
  <Form.Item name="keyword"><Input placeholder="Search" /></Form.Item>
  <Button htmlType="submit">Search</Button>
</Form>`}
>
  <Space direction="vertical" class="w-100">
    <Form layout="vertical" initialValues={{ username: 'vertical-user' }}>
      <Form.Item label="Vertical username" name="username">
        <Input />
      </Form.Item>
    </Form>
    <Form layout="inline" onFinish={() => message.success('Search submitted')}>
      <Form.Item name="keyword">
        <Input placeholder="Search keyword" />
      </Form.Item>
      <Button htmlType="submit">Search</Button>
    </Form>
  </Space>
</DemoBlock>
```

- [ ] **Step 2: Add Required mark DemoBlock after layout**

Insert this DemoBlock immediately after the layout DemoBlock:

```tsx
<DemoBlock
  title="Required mark"
  code={`<Form requiredMark="optional">
  <Form.Item label="Name" name="name" rules={[{ required: true }]}><Input /></Form.Item>
  <Form.Item label="Bio" name="bio"><Input /></Form.Item>
</Form>
<Form requiredMark={false}>...</Form>`}
>
  <Space direction="vertical" class="w-100">
    <Form requiredMark="optional">
      <Form.Item label="Name" name="name" rules={[{ required: true }]}>
        <Input placeholder="Required" />
      </Form.Item>
      <Form.Item label="Bio" name="bio">
        <Input placeholder="Optional" />
      </Form.Item>
    </Form>
    <Form requiredMark={false}>
      <Form.Item label="Hidden mark" name="hiddenMark" rules={[{ required: true }]}>
        <Input placeholder="Required without mark" />
      </Form.Item>
    </Form>
  </Space>
</DemoBlock>
```

After insertion, remove accidental whitespace between `>` and newline in `<Form.Item ...>` if the formatter changes it.

- [ ] **Step 3: Run focused docs typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter docs typecheck
```

Expected: PASS.

- [ ] **Step 4: Commit layout examples**

Run:

```bash
git add apps/docs/src/pages/components/form.tsx
git commit -m "docs(form): add layout and required mark demos"
```

---

### Task 3: Add validation behavior examples

**Files:**

- Modify: `apps/docs/src/pages/components/form.tsx`

- [ ] **Step 1: Add local form instances in `FormPage`**

In `FormPage`, after:

```tsx
const [instanceForm] = useForm()
```

add:

```tsx
const [validateOnlyForm] = useForm()
const [scrollForm] = useForm()
```

- [ ] **Step 2: Add validate trigger DemoBlock after the existing "Validation" DemoBlock**

```tsx
<DemoBlock
  title="Validate trigger"
  code={`<Form.Item name="email" validateTrigger="onBlur" rules={[{ type: 'email' }]}>
  <Input placeholder="Validate on blur" />
</Form.Item>`}
>
  <Form onFinish={() => message.success('Blur validation passed')}>
    <Space direction="vertical" class="w-90">
      <Form.Item
        label="Email"
        name="email"
        validateTrigger="onBlur"
        rules={[{ type: 'email', message: 'Enter a valid email after blur' }]}
      >
        <Input placeholder="Blur after typing" />
      </Form.Item>
      <Button htmlType="submit">Submit</Button>
    </Space>
  </Form>
</DemoBlock>
```

- [ ] **Step 3: Add validate only DemoBlock after validate trigger**

```tsx
<DemoBlock
  title="Validate only"
  code={`const [form] = useForm()
form.validateFields(undefined, { validateOnly: true })`}
>
  <Space direction="vertical" class="w-90">
    <Form form={validateOnlyForm}>
      <Form.Item label="Username" name="username" rules={[{ required: true }]}>
        <Input placeholder="Required username" />
      </Form.Item>
    </Form>
    <Button
      onClick={async () => {
        try {
          await validateOnlyForm.validateFields(undefined, { validateOnly: true })
          message.success('Valid without showing errors')
        } catch {
          message.error('Invalid, but field UI is unchanged')
        }
      }}
    >
      Validate only
    </Button>
  </Space>
</DemoBlock>
```

Remove accidental whitespace in the `Form.Item` opening tag if present.

- [ ] **Step 4: Add warning only DemoBlock after validate only**

```tsx
<DemoBlock
  title="Warning only"
  code={`<Form.Item name="url" rules={[{ type: 'url', warningOnly: true }]}>
  <Input />
</Form.Item>`}
>
  <Form onFinish={() => message.success('Submitted even with warnings')}>
    <Space direction="vertical" class="w-90">
      <Form.Item
        label="Website"
        name="url"
        rules={[{ type: 'url', warningOnly: true, message: 'This looks unlike a URL' }]}
      >
        <Input placeholder="Optional website" />
      </Form.Item>
      <Button htmlType="submit">Submit with warning</Button>
    </Space>
  </Form>
</DemoBlock>
```

- [ ] **Step 5: Run focused docs typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter docs typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit validation examples**

Run:

```bash
git add apps/docs/src/pages/components/form.tsx
git commit -m "docs(form): add validation behavior demos"
```

---

### Task 4: Add dynamic rules, dependencies, shouldUpdate, noStyle, and dynamic item examples

**Files:**

- Modify: `apps/docs/src/pages/components/form.tsx`

- [ ] **Step 1: Add Dynamic rules DemoBlock after "Watch fields"**

```tsx
<DemoBlock
  title="Dynamic rules"
  code={`function DynamicRuleFields() {
  const required = Form.useWatch('requireNickname')
  return <Form.Item name="nickname" rules={[{ required: Boolean(required()) }]}><Input /></Form.Item>
}`}
>
  <Form onFinish={() => message.success('Dynamic rule passed')}>
    <Space direction="vertical" class="w-90">
      <DynamicRuleFields />
      <Button htmlType="submit">Submit</Button>
    </Space>
  </Form>
</DemoBlock>
```

- [ ] **Step 2: Add Dependencies DemoBlock after Dynamic rules**

```tsx
<DemoBlock
  title="Dependencies"
  code={`<Form.Item name="confirm" dependencies={['password']} rules={[{ validator: (_rule, value, values) => value === values.password ? undefined : 'Passwords do not match' }]}>
  <Input />
</Form.Item>`}
>
  <Form onFinish={() => message.success('Passwords match')}>
    <Space direction="vertical" class="w-90">
      <Form.Item label="Password" name="password" rules={[{ required: true }]}>
        <Input type="password" />
      </Form.Item>
      <Form.Item
        label="Confirm"
        name="confirm"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Please confirm password' },
          {
            validator: (_rule, value, values) =>
              value === values.password ? undefined : 'Passwords do not match',
          },
        ]}
      >
        <Input type="password" />
      </Form.Item>
      <Button htmlType="submit">Submit</Button>
    </Space>
  </Form>
</DemoBlock>
```

Remove accidental whitespace in the first `Form.Item` opening tag if present.

- [ ] **Step 3: Add shouldUpdate DemoBlock after Dependencies**

```tsx
<DemoBlock
  title="shouldUpdate"
  code={`<Form.Item shouldUpdate>
  {(form) => <pre>{JSON.stringify(form.getFieldsValue(true), null, 2)}</pre>}
</Form.Item>`}
>
  <Form initialValues={{ first: 'Ada' }}>
    <Space direction="vertical" class="w-90">
      <Form.Item label="First" name="first">
        <Input />
      </Form.Item>
      <Form.Item label="Last" name="last">
        <Input />
      </Form.Item>
      <Form.Item shouldUpdate>
        {(form) => <pre>{JSON.stringify(form.getFieldsValue(true), null, 2)}</pre>}
      </Form.Item>
    </Space>
  </Form>
</DemoBlock>
```

- [ ] **Step 4: Add noStyle nested control DemoBlock after shouldUpdate**

```tsx
<DemoBlock
  title="noStyle nested control"
  code={`<Form.Item label="Address">
  <Form.Item name={['address', 'street']} noStyle><Input /></Form.Item>
</Form.Item>`}
>
  <Form onFinish={(values) => message.success(JSON.stringify(values))}>
    <Space direction="vertical" class="w-90">
      <Form.Item label="Address">
        <Form.Item name={['address', 'street']} noStyle rules={[{ required: true }]}>
          <Input placeholder="Street" />
        </Form.Item>
      </Form.Item>
      <Button htmlType="submit">Submit address</Button>
    </Space>
  </Form>
</DemoBlock>
```

Remove accidental whitespace in the nested `Form.Item` opening tag if present.

- [ ] **Step 5: Add Dynamic Form.Item DemoBlock after noStyle**

```tsx
<DemoBlock
  title="Dynamic Form.Item"
  code={`function ConditionalCompanyField() {
  const business = Form.useWatch('business')
  return business() ? <Form.Item name="company"><Input /></Form.Item> : null
}`}
>
  <Form onFinish={(values) => message.success(JSON.stringify(values))}>
    <Space direction="vertical" class="w-90">
      <ConditionalCompanyField />
      <Button htmlType="submit">Submit</Button>
    </Space>
  </Form>
</DemoBlock>
```

- [ ] **Step 6: Run focused docs typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter docs typecheck
```

Expected: PASS. If `values.password` errors because `values` is `unknown` or indexed differently, change validator body to:

```tsx
const allValues = values as { password?: unknown }
return value === allValues.password ? undefined : 'Passwords do not match'
```

- [ ] **Step 7: Commit dynamic examples**

Run:

```bash
git add apps/docs/src/pages/components/form.tsx
git commit -m "docs(form): add dynamic form demos"
```

---

### Task 5: Add advanced list, scroll, normalization, and useStatus examples

**Files:**

- Modify: `apps/docs/src/pages/components/form.tsx`

- [ ] **Step 1: Add Advanced Form.List DemoBlock after existing "Dynamic list"**

```tsx
<DemoBlock
  title="Advanced dynamic list"
  code={`<Form.List name="users" rules={[{ validator: (_rule, value) => Array.isArray(value) && value.length >= 2 ? undefined : 'Add at least 2 users' }]}>
  {(fields, operation, meta) => <Form.ErrorList errors={meta.errors} />}
</Form.List>`}
>
  <Form onFinish={(values) => message.success(JSON.stringify(values))}>
    <Form.List
      name="users"
      initialValue={[{ name: 'Ada' }, { name: 'Grace' }]}
      rules={[
        {
          validator: (_rule, value) =>
            Array.isArray(value) && value.length >= 2 ? undefined : 'Add at least 2 users',
        },
      ]}
    >
      {(fields, operation, meta) => (
        <Space direction="vertical" class="w-90">
          <For each={fields()}>
            {(field) => (
              <Space>
                <Form.Item name={[field.name, 'name']} noStyle>
                  <Input placeholder="User name" />
                </Form.Item>
                <Button onClick={() => operation.move(field.name, 0)}>Move top</Button>
                <Button onClick={() => operation.remove(field.name)}>Remove</Button>
              </Space>
            )}
          </For>
          <Form.ErrorList errors={meta.errors} />
          <Space>
            <Button onClick={() => operation.add({ name: '' })}>Add user</Button>
            <Button htmlType="submit">Submit users</Button>
          </Space>
        </Space>
      )}
    </Form.List>
  </Form>
</DemoBlock>
```

- [ ] **Step 2: Add Scroll to field DemoBlock after Advanced Form.List**

```tsx
<DemoBlock
  title="Scroll to field"
  code={`const [form] = useForm()
form.scrollToField?.('target', { focus: true })`}
>
  <Space direction="vertical" class="w-90">
    <Form form={scrollForm}>
      <Form.Item label="First" name="first">
        <Input />
      </Form.Item>
      <div style={{ height: '120px' }} />
      <Form.Item label="Target" name="target" rules={[{ required: true }]}>
        <Input placeholder="Scroll target" />
      </Form.Item>
    </Form>
    <Button onClick={() => scrollForm.scrollToField?.('target', { focus: true })}>
      Scroll to target
    </Button>
  </Space>
</DemoBlock>
```

Remove accidental whitespace in the target `Form.Item` opening tag if present.

- [ ] **Step 3: Add Normalize DemoBlock after Scroll to field**

```tsx
<DemoBlock
  title="getValueProps and normalize"
  code={`<Form.Item
  name="code"
  normalize={(value) => String(value ?? '').trim().toUpperCase()}
  getValueProps={(value) => ({ value: String(value ?? '') })}
>
  <Input />
</Form.Item>`}
>
  <Form onFinish={(values) => message.success(JSON.stringify(values))}>
    <Space direction="vertical" class="w-90">
      <Form.Item
        label="Code"
        name="code"
        normalize={(value) =>
          String(value ?? '')
            .trim()
            .toUpperCase()
        }
        getValueProps={(value) => ({ value: String(value ?? '') })}
      >
        <Input placeholder="Type lowercase code" />
      </Form.Item>
      <Button htmlType="submit">Submit normalized</Button>
    </Space>
  </Form>
</DemoBlock>
```

- [ ] **Step 4: Add useStatus DemoBlock after Normalize**

```tsx
<DemoBlock
  title="Form.Item.useStatus"
  code={`function StatusInput() {
  const status = Form.Item.useStatus()
  return <Input placeholder={status.status() ?? 'none'} />
}`}
>
  <Form>
    <Space direction="vertical" class="w-90">
      <Form.Item label="Required" name="required" rules={[{ required: true }]}>
        <StatusInput />
      </Form.Item>
    </Space>
  </Form>
</DemoBlock>
```

Remove accidental whitespace in the `Form.Item` opening tag if present.

- [ ] **Step 5: Run focused docs typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter docs typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit advanced examples**

Run:

```bash
git add apps/docs/src/pages/components/form.tsx
git commit -m "docs(form): add advanced antd-style demos"
```

---

### Task 6: Polish code strings, formatting, and full verification

**Files:**

- Modify: `apps/docs/src/pages/components/form.tsx`

- [ ] **Step 1: Format and inspect the docs page**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format
sed -n '1,760p' apps/docs/src/pages/components/form.tsx
```

Expected: no malformed JSX, no stray spaces in `Form.Item` tags, demos appear before API tables, helper components are above `FormPage`.

- [ ] **Step 2: Run AGENTS.md verification**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: all commands exit 0. Docs build may print existing Vite chunk-size warnings; those warnings are acceptable if the command exits 0.

- [ ] **Step 3: Check repository state**

Run:

```bash
git status --short
git diff --check
```

Expected: only intentional docs changes are present before final commit, and `git diff --check` exits 0.

- [ ] **Step 4: Commit polish**

If Step 1 or Step 2 changed formatting, commit it:

```bash
git add apps/docs/src/pages/components/form.tsx
git commit -m "docs(form): polish antd-style demos"
```

If there are no changes, do not create an empty commit.

---

## Self-Review

- Spec coverage: every requested demo category maps to Tasks 2 through 5.
- Placeholder scan: no TBD/TODO/fill-later placeholders remain; optional component fixes are explicitly constrained and not required for normal execution.
- Type consistency: all examples use documented APIs from the recent Form parity work: `useForm`, `Form.useWatch`, `Form.Item.useStatus`, `dependencies`, `shouldUpdate`, `noStyle`, `Form.List`, `Form.ErrorList`, `scrollToField`, `normalize`, and `getValueProps`.
