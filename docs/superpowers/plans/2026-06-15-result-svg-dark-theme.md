# Result SVG Dark Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Result built-in exception SVGs adapt to dark theme tokens.

**Architecture:** Keep the existing Result API and SVG components. Move neutral SVG colors from fixed light hex attributes to semantic classes styled by `result.style.ts` with current theme tokens, while retaining status accent colors.

**Tech Stack:** SolidJS components, `@ant-design-solid/cssinjs`, Vitest with Testing Library.

---

## File Structure

- Modify `packages/components/src/result/__tests__/result.test.tsx`: add a regression test for semantic SVG color hooks.
- Modify `packages/components/src/result/exception-images.tsx`: replace hard-coded light neutral SVG colors with classed elements.
- Modify `packages/components/src/result/result.style.ts`: add token-based styles for the SVG classes.

### Task 1: Result Exception SVG Theme Colors

**Files:**

- Modify: `packages/components/src/result/__tests__/result.test.tsx`
- Modify: `packages/components/src/result/exception-images.tsx`
- Modify: `packages/components/src/result/result.style.ts`

- [ ] **Step 1: Write the failing test**

Add this test after `renders exception images for string and numeric statuses` in `packages/components/src/result/__tests__/result.test.tsx`:

```tsx
test('uses semantic classes for exception image neutral colors', () => {
  const result = render(() => <Result status="404" title="Missing" />)
  const svg = result.container.querySelector('.ads-result-image svg')

  expect(svg?.querySelector('.ads-result-image-bg')).toBeTruthy()
  expect(svg?.querySelector('.ads-result-image-surface')).toBeTruthy()
  expect(svg?.querySelectorAll('.ads-result-image-muted')).toHaveLength(4)
  expect(svg?.querySelector('.ads-result-image-accent')).toBeTruthy()
  expect(svg?.innerHTML).not.toContain('#f5f5f5')
  expect(svg?.innerHTML).not.toContain('#fff')
  expect(svg?.innerHTML).not.toContain('#d9d9d9')
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/result/__tests__/result.test.tsx
```

Expected: FAIL because `.ads-result-image-bg`, `.ads-result-image-surface`, and `.ads-result-image-muted` are not present, or because fixed light colors are still in the SVG.

- [ ] **Step 3: Update SVG markup**

In `packages/components/src/result/exception-images.tsx`, change the SVG to use classed semantic elements:

```tsx
function ExceptionImage(props: { title: string; code: string; accent: string }) {
  return (
    <svg
      viewBox="0 0 252 220"
      width="252"
      height="220"
      role="img"
      aria-label={props.title}
      color="currentColor"
    >
      <rect
        class="ads-result-image-bg"
        x="22"
        y="38"
        width="208"
        height="132"
        rx="16"
        fill="currentColor"
      />
      <rect
        class="ads-result-image-surface"
        x="42"
        y="58"
        width="168"
        height="92"
        rx="10"
        fill="currentColor"
      />
      <circle class="ads-result-image-accent" cx="62" cy="76" r="6" fill={props.accent} />
      <circle class="ads-result-image-muted" cx="82" cy="76" r="6" fill="currentColor" />
      <circle class="ads-result-image-muted" cx="102" cy="76" r="6" fill="currentColor" />
      <path
        class="ads-result-image-muted"
        d="M64 106h124M64 126h88"
        stroke="currentColor"
        stroke-width="8"
        stroke-linecap="round"
      />
      <text
        class="ads-result-image-accent"
        x="126"
        y="198"
        fill={props.accent}
        font-size="36"
        font-family="Arial, sans-serif"
        font-weight="700"
        text-anchor="middle"
      >
        {props.code}
      </text>
    </svg>
  )
}
```

- [ ] **Step 4: Add token-based image styles**

In `packages/components/src/result/result.style.ts`, extend the `.${prefixCls}-image svg` block and add class selectors:

```ts
      [`.${prefixCls}-image svg`]: {
        'max-width': '100%',
        height: 'auto',
        color: t.colorFillSecondary,
      },
      [`.${prefixCls}-image-bg`]: {
        color: t.colorFillTertiary,
      },
      [`.${prefixCls}-image-surface`]: {
        color: t.colorBgContainer,
      },
      [`.${prefixCls}-image-muted`]: {
        color: t.colorBorderSecondary,
      },
```

- [ ] **Step 5: Run the targeted test to verify it passes**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- packages/components/src/result/__tests__/result.test.tsx
```

Expected: PASS for all Result tests.

- [ ] **Step 6: Run focused package verification**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test
```

Expected: both commands pass.
