# Docs Examples Tailwind Dark Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert static component docs example styling to Tailwind while preserving intentional component API style examples and dark theme compatibility.

**Architecture:** Keep Tailwind scoped to docs examples by editing MDX demo markup directly. Add targeted source tests that detect representative static-style regressions without banning legitimate `style` and `styles` API examples. Avoid dirty user files (`masonry.mdx`, `masonry-runtime.test.tsx`, `time-picker.test.tsx`).

**Tech Stack:** SolidJS MDX docs, Tailwind CSS v4, Vitest source tests, oxlint, oxfmt, pnpm workspace scripts.

---

## File Map

- Modify: `apps/docs/src/routes/components/style-migration.test.tsx`
  - Add source-level guards for representative pages migrated in this pass.
- Modify: `apps/docs/src/routes/components/layout.mdx`
  - Convert static layout demo shell objects and wrapper styles to Tailwind class strings.
- Modify: `apps/docs/src/routes/components/float-button.mdx`
  - Replace repeated token-based demo box inline styles and static float positioning with Tailwind classes.
- Modify: `apps/docs/src/routes/components/flex.mdx`
  - Convert static demo blocks, boxes, image/card widths, and padding to Tailwind classes where not demonstrating component APIs.
- Modify: `apps/docs/src/routes/components/badge.mdx`
  - Convert Ribbon grid wrapper and static card width to Tailwind classes; preserve badge color props and semantic DOM `styles`.
- Modify: `apps/docs/src/routes/components/watermark.mdx`
  - Replace `docs-surface-solid` helper class with Tailwind arbitrary-value background and text-safe utility.
- Modify: `apps/docs/src/routes/components/auto-complete.mdx`
  - Convert simple flex wrappers and custom popup footer to Tailwind classes; preserve component width styles.
- Modify: `apps/docs/src/routes/components/button.mdx`
  - Convert the Ghost demo wrapper to Tailwind.
- Modify: `apps/docs/src/routes/components/spin.mdx`
  - Convert nested content panels to Tailwind classes.
- Modify: `apps/docs/src/routes/components/anchor.mdx`
  - Convert static demo containers, flex growth, and spacer divs to Tailwind classes.

## Task 1: Add Migration Guards

**Files:**

- Modify: `apps/docs/src/routes/components/style-migration.test.tsx`

- [ ] **Step 1: Extend source fixtures**

Add file reads near the existing constants:

```ts
const anchorSource = readPageSource('./anchor.mdx')
const autoCompleteSource = readPageSource('./auto-complete.mdx')
const badgeSource = readPageSource('./badge.mdx')
const buttonSource = readPageSource('./button.mdx')
const flexSource = readPageSource('./flex.mdx')
const floatButtonSource = readPageSource('./float-button.mdx')
const layoutSource = readPageSource('./layout.mdx')
const spinSource = readPageSource('./spin.mdx')
const watermarkSource = readPageSource('./watermark.mdx')
```

Keep existing `autoCompleteSource`, `cardSource`, `gridSource`, `menuSource`, and `tabsSource` behavior by replacing the duplicated `autoCompleteSource` declaration with the new grouped declarations.

- [ ] **Step 2: Add targeted tests**

Add these tests inside the existing `describe('component docs Tailwind migration', () => { ... })` block:

```ts
it('uses Tailwind for static layout demo wrappers', () => {
  expect(layoutSource).toContain('class="flex flex-wrap gap-4"')
  expect(layoutSource).toContain('class={layoutDemoClass}')
  expect(layoutSource).toContain('class={layoutHeaderClass}')
  expect(layoutSource).not.toContain(
    "style={{ display: 'flex', gap: '16px', 'flex-wrap': 'wrap' }}",
  )
  expect(layoutSource).not.toContain("background: 'var(--docs-surface-solid)'")
})

it('uses Tailwind for float button demo boxes and static positioning', () => {
  expect(floatButtonSource).toContain('const floatButtonBoxClass')
  expect(floatButtonSource).toContain('absolute right-6 bottom-6')
  expect(floatButtonSource).toContain('h-[220px] overflow-auto p-4')
  expect(floatButtonSource).not.toContain('floatButtonBoxStyle')
  expect(floatButtonSource).not.toContain(
    "style={{ position: 'absolute', right: '24px', bottom: '24px' }}",
  )
})

it('uses Tailwind for static flex demo presentation', () => {
  expect(flexSource).toContain(
    "class={index % 2 ? 'h-[54px] w-1/4 bg-blue-600' : 'h-[54px] w-1/4 bg-blue-500/75'}",
  )
  expect(flexSource).toContain('class="h-[120px] w-full rounded-md border border-blue-400"')
  expect(flexSource).toContain('class="block w-[273px]"')
  expect(flexSource).not.toContain("border: '1px solid #40a9ff'")
})

it('uses Tailwind for static docs helper surfaces', () => {
  expect(watermarkSource).not.toContain('docs-surface-solid')
  expect(watermarkSource).toContain(
    'class="h-[180px] bg-[var(--docs-surface-solid)] p-6 text-[var(--docs-text)]"',
  )
  expect(buttonSource).toContain('class="bg-[var(--docs-surface-subtle)] p-4"')
  expect(spinSource).toContain(
    'class="rounded-lg border border-[var(--docs-border)] bg-[var(--docs-surface-solid)] p-6"',
  )
})

it('uses Tailwind for simple static example wrappers', () => {
  expect(autoCompleteSource).toContain('class="flex flex-wrap gap-2"')
  expect(autoCompleteSource).toContain('class="px-2 py-2 text-[var(--docs-text-secondary)]"')
  expect(anchorSource).toContain('class="flex-1"')
  expect(anchorSource).toContain('class="h-6"')
  expect(anchorSource).toContain('class="flex h-60 gap-6 overflow-auto"')
  expect(badgeSource).toContain('class="grid w-full max-w-[520px] gap-4"')
})
```

- [ ] **Step 3: Run the targeted test and confirm it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- src/routes/components/style-migration.test.tsx
```

Expected: FAIL because the new Tailwind strings are not present yet.

## Task 2: Migrate Layout Examples

**Files:**

- Modify: `apps/docs/src/routes/components/layout.mdx`

- [ ] **Step 1: Replace static style objects**

In both preview code and displayed code for the Basic example, replace `headerStyle`, `contentStyle`, `siderStyle`, `footerStyle`, and `layoutStyle` with class constants:

```ts
const layoutDemoClass = 'min-w-[260px] flex-[1_1_calc(50%-8px)] overflow-hidden rounded-lg'
const layoutHeaderClass =
  'h-16 bg-[var(--docs-primary-soft-strong)] px-12 text-center leading-[64px] text-[var(--docs-text-strong)]'
const layoutContentClass =
  'min-h-[120px] bg-[color-mix(in_srgb,var(--docs-primary-soft-strong)_72%,var(--docs-surface-solid))] text-center leading-[120px] text-[var(--docs-text-strong)]'
const layoutSiderClass =
  'bg-[var(--docs-primary-soft)] text-center leading-[120px] text-[var(--docs-text-strong)]'
const layoutFooterClass =
  'bg-[var(--docs-primary-soft-strong)] text-center text-[var(--docs-text-strong)]'
```

Displayed code should use the same constants without semicolons if formatted that way by surrounding code.

- [ ] **Step 2: Replace Basic markup**

Change the Basic wrapper and component props in both preview and displayed code:

```tsx
<div class="flex flex-wrap gap-4">
  <Layout class={layoutDemoClass}>
    <Layout.Header class={layoutHeaderClass}>Header</Layout.Header>
    <Layout.Content class={layoutContentClass}>Content</Layout.Content>
    <Layout.Footer class={layoutFooterClass}>Footer</Layout.Footer>
  </Layout>
  ...
</div>
```

Use `class={layoutSiderClass}` on `Layout.Sider`.

- [ ] **Step 3: Replace dashboard shell objects**

For With Sider and repeated dashboard examples, replace static objects with class constants:

```ts
const layoutShellClass = 'min-h-[360px] bg-[var(--docs-surface-subtle)]'
const logoClass = 'm-4 h-8 rounded-md bg-[var(--docs-primary-soft-strong)]'
const headerClass = 'bg-[var(--docs-surface-solid)] p-0'
const contentShellClass = 'm-4'
const panelClass = 'min-h-[220px] rounded-lg bg-[var(--docs-surface-solid)] p-6'
const footerClass = 'text-center text-[var(--docs-text-tertiary)]'
```

Use these classes instead of `style={...}` and `style={{ 'min-height': '360px', background: ... }}`.

- [ ] **Step 4: Preserve behavior-specific styles**

Keep inline styles only where they represent component behavior or dynamic sizing that is not purely presentation, such as `Layout.Sider width="25%"`, collapsed state props, or any component API example that intentionally passes `style`.

- [ ] **Step 5: Run targeted test**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- src/routes/components/style-migration.test.tsx
```

Expected: Layout assertions pass; later page assertions may still fail.

## Task 3: Migrate FloatButton Examples

**Files:**

- Modify: `apps/docs/src/routes/components/float-button.mdx`

- [ ] **Step 1: Replace shared style helper**

Replace the exported `floatButtonBoxStyle` helper with class strings:

```ts
export const floatButtonBoxClass =
  'relative h-40 overflow-hidden rounded-lg border border-dashed border-[var(--docs-border)] bg-[var(--docs-surface-subtle)]'
export const floatButtonTallBoxClass = `${floatButtonBoxClass} h-[220px]`
export const floatButtonScrollBoxClass = `${floatButtonBoxClass} h-[220px] overflow-auto p-4`
export const floatButtonClass = 'absolute right-6 bottom-6'
export const floatButtonSecondClass = 'absolute right-[88px] bottom-6'
```

Do the same in each displayed code block that currently declares `floatButtonBoxStyle`.

- [ ] **Step 2: Replace demo containers and button positioning**

Use:

```tsx
<div class={floatButtonBoxClass}>
  <FloatButton icon={<QuestionCircleOutlined />} class={floatButtonClass} />
</div>
```

Use `class={floatButtonSecondClass}` for the second button in Type and Shape examples. Use `class={floatButtonTallBoxClass}` for Group and Menu Mode. Use `class={floatButtonScrollBoxClass}` for BackTop and convert the scroll filler to:

```tsx
<div class="h-[360px]" />
```

- [ ] **Step 3: Preserve semantic style API**

In the Semantic Styles example, keep:

```tsx
styles={{ content: { color: token().colorPrimary } }}
```

Only replace the outer demo box and static positioning with classes.

- [ ] **Step 4: Remove unused `useToken` imports**

Remove `useToken` from imports if no remaining example in the file uses it after migration.

- [ ] **Step 5: Run targeted test**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- src/routes/components/style-migration.test.tsx
```

Expected: FloatButton assertions pass; remaining page assertions may still fail.

## Task 4: Migrate Flex And Simple Wrappers

**Files:**

- Modify: `apps/docs/src/routes/components/flex.mdx`
- Modify: `apps/docs/src/routes/components/badge.mdx`
- Modify: `apps/docs/src/routes/components/watermark.mdx`
- Modify: `apps/docs/src/routes/components/auto-complete.mdx`
- Modify: `apps/docs/src/routes/components/button.mdx`
- Modify: `apps/docs/src/routes/components/spin.mdx`
- Modify: `apps/docs/src/routes/components/anchor.mdx`

- [ ] **Step 1: Convert Flex static boxes**

In `flex.mdx`, remove `baseStyle` and use:

```tsx
<div class={index % 2 ? 'h-[54px] w-1/4 bg-blue-600' : 'h-[54px] w-1/4 bg-blue-500/75'} />
```

Replace `boxStyle` usage with:

```tsx
<Flex class="h-[120px] w-full rounded-md border border-blue-400" justify={justify()} align={align()}>
```

For the Combination example, replace `cardStyle`, `imgStyle`, and content padding with:

```tsx
<Card hoverable class="w-[620px]" styles={{ body: { padding: 0, overflow: 'hidden' } }}>
...
<img ... class="block w-[273px]" />
<Flex vertical align="flex-end" justify="space-between" class="p-8">
```

- [ ] **Step 2: Convert Badge Ribbon wrapper**

In `badge.mdx`, replace:

```tsx
<div style={{ display: 'grid', gap: '16px', width: 'min(100%, 520px)' }}>
```

with:

```tsx
<div class="grid w-full max-w-[520px] gap-4">
```

Replace `style={{ width: '100%' }}` on the Ribbon cards with `class="w-full"`. Preserve `color` props and semantic DOM `styles`.

- [ ] **Step 3: Convert Watermark helper surfaces**

In `watermark.mdx`, replace every:

```tsx
class="h-[180px] docs-surface-solid p-6"
```

with:

```tsx
class="h-[180px] bg-[var(--docs-surface-solid)] p-6 text-[var(--docs-text)]"
```

Preserve the custom watermark `font={{ color: 'rgba(...)' }}`.

- [ ] **Step 4: Convert AutoComplete wrappers**

In `auto-complete.mdx`, replace status and variant wrappers:

```tsx
<div class="flex flex-wrap gap-2">
```

Replace the custom popup footer:

```tsx
<div class="px-2 py-2 text-[var(--docs-text-secondary)]">More results</div>
```

Preserve AutoComplete width inline styles, because they configure component width directly in API examples.

- [ ] **Step 5: Convert Button and Spin static panels**

In `button.mdx`, replace the Ghost wrapper with:

```tsx
<div class="bg-[var(--docs-surface-subtle)] p-4">
```

In `spin.mdx`, replace repeated nested content panel styles with:

```tsx
<div class="rounded-lg border border-[var(--docs-border)] bg-[var(--docs-surface-solid)] p-6">
```

Preserve semantic DOM `styles` examples later in the file.

- [ ] **Step 6: Convert Anchor containers and spacers**

In `anchor.mdx`, replace:

```tsx
<Space align="start" class="w-full">
<div class="flex-1">
<div class="h-6" />
<div ref={containerRef} class="flex h-60 gap-6 overflow-auto">
<div class="h-20" />
```

Use `class="w-full"` on `Space` instead of `style={{ width: '100%' }}` if the component forwards `class`. If typecheck shows `Space` does not accept `class`, use a native wrapper `<div class="w-full">` around `Space` and keep the inner layout classes.

- [ ] **Step 7: Run targeted test**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- src/routes/components/style-migration.test.tsx
```

Expected: all style migration tests pass.

## Task 5: Format And Verify

**Files:**

- All files modified in prior tasks.

- [ ] **Step 1: Run formatter check**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: PASS. If it fails only for files modified in this task, run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format
```

Then inspect `git diff` to ensure no unrelated user files were reformatted. If unrelated dirty files would be changed, do not run global write formatting; manually adjust touched files instead.

- [ ] **Step 2: Run docs typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck
```

Expected: PASS.

- [ ] **Step 3: Run docs tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test
```

Expected: PASS.

- [ ] **Step 4: Run docs build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs build
```

Expected: PASS.

- [ ] **Step 5: Run lint**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: PASS.

- [ ] **Step 6: Inspect final diff**

Run:

```bash
git diff -- apps/docs/src/routes/components/style-migration.test.tsx apps/docs/src/routes/components/layout.mdx apps/docs/src/routes/components/float-button.mdx apps/docs/src/routes/components/flex.mdx apps/docs/src/routes/components/badge.mdx apps/docs/src/routes/components/watermark.mdx apps/docs/src/routes/components/auto-complete.mdx apps/docs/src/routes/components/button.mdx apps/docs/src/routes/components/spin.mdx apps/docs/src/routes/components/anchor.mdx docs/superpowers/specs/2026-06-14-docs-examples-tailwind-dark-design.md docs/superpowers/plans/2026-06-14-docs-examples-tailwind-dark.md
```

Expected: only intended Tailwind migrations, tests, spec, and plan are present.
