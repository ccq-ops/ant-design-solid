# Shiki DemoBlock Highlighting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render `DemoBlock` code snippets with Shiki syntax highlighting while preserving the current docs demo layout.

**Architecture:** Add Shiki as an `apps/docs` runtime dependency and isolate highlighting setup in a small Solid resource component. `DemoBlock` remains the public docs API, now accepting an optional `language` prop and delegating code rendering to the highlighter.

**Tech Stack:** SolidJS, Vite, Vitest, Shiki, Tailwind CSS utility classes, pnpm workspace.

---

## File Structure

- Modify `apps/docs/package.json`: add `shiki` dependency for the docs app only.
- Modify `apps/docs/src/site/demo-block.tsx`: add a `HighlightedCode` helper using Shiki and update `DemoBlock` to render highlighted HTML.
- Modify `apps/docs/src/site/demo-block.test.tsx`: add tests for default TSX language, custom language, and fallback behavior.
- Modify `pnpm-lock.yaml`: update via `corepack pnpm install --filter @solid-ant-design/docs`.

## Implementation Tasks

### Task 1: Add failing tests for Shiki-highlighted DemoBlock code

**Files:**

- Modify: `apps/docs/src/site/demo-block.test.tsx`

- [ ] **Step 1: Replace the existing test file with tests that describe the Shiki behavior**

```tsx
import { render, waitFor } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { DemoBlock } from './demo-block'

describe('DemoBlock', () => {
  it('renders title, preview, code, and Tailwind structural classes', async () => {
    const result = render(() => (
      <DemoBlock title="Basic" code="<Button>Click</Button>">
        <button type="button">Click</button>
      </DemoBlock>
    ))

    const heading = result.getByRole('heading', { name: 'Basic', level: 3 })
    const block = heading.closest('section')
    const button = result.getByRole('button', { name: 'Click' })

    expect(block).toHaveClass('my-6')
    expect(block).toHaveClass('overflow-hidden')
    expect(heading).toHaveClass('border-b')
    expect(button.parentElement).toHaveClass('p-6')

    await waitFor(() => {
      const code = result.getByText('<Button>Click</Button>')
      expect(code.parentElement).toHaveClass('overflow-auto')
    })
  })

  it('highlights TSX code by default with Shiki markup', async () => {
    const result = render(() => (
      <DemoBlock title="Default language" code="<Button type=\"primary\">Click</Button>">
        <button type="button">Click</button>
      </DemoBlock>
    ))

    await waitFor(() => {
      const code = result.getByText('<Button type="primary">Click</Button>')
      const pre = code.parentElement

      expect(pre?.tagName).toBe('PRE')
      expect(pre).toHaveClass('shiki')
      expect(pre).toHaveAttribute('data-language', 'tsx')
      expect(pre?.querySelector('span')).not.toBeNull()
    })
  })

  it('uses the requested language for highlighting', async () => {
    const result = render(() => (
      <DemoBlock title="Shell" language="bash" code="pnpm build">
        <p>Build command</p>
      </DemoBlock>
    ))

    await waitFor(() => {
      const code = result.getByText('pnpm build')
      const pre = code.parentElement

      expect(pre).toHaveAttribute('data-language', 'bash')
      expect(pre).toHaveClass('shiki')
    })
  })

  it('falls back to plain escaped code when Shiki cannot load the language', async () => {
    const result = render(() => (
      <DemoBlock title="Unknown" language="not-a-real-language" code={'<x dangerously="true">'}>
        <p>Unknown language</p>
      </DemoBlock>
    ))

    await waitFor(() => {
      const code = result.getByText('<x dangerously="true">')
      const pre = code.parentElement

      expect(pre).toHaveAttribute('data-language', 'not-a-real-language')
      expect(pre).not.toHaveClass('shiki')
      expect(code.innerHTML).toBe('&lt;x dangerously="true"&gt;')
    })
  })
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- src/site/demo-block.test.tsx
```

Expected: FAIL because `DemoBlock` does not accept `language`, does not produce Shiki `shiki` class/`data-language`, and has no fallback highlighter path.

### Task 2: Install Shiki for the docs app

**Files:**

- Modify: `apps/docs/package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Add Shiki dependency**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs add shiki
```

Expected: `apps/docs/package.json` includes `"shiki"` under `dependencies`, and `pnpm-lock.yaml` is updated.

- [ ] **Step 2: Run install consistency check**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm install --frozen-lockfile
```

Expected: command exits 0 and reports lockfile is up to date.

### Task 3: Implement Shiki rendering in DemoBlock

**Files:**

- Modify: `apps/docs/src/site/demo-block.tsx`

- [ ] **Step 1: Replace `demo-block.tsx` with Shiki-backed rendering**

```tsx
import { createResource, Show, type JSX } from 'solid-js'
import { codeToHtml } from 'shiki'

type DemoBlockProps = {
  title: string
  code: string
  language?: string
  children: JSX.Element
}

type HighlightedCodeProps = {
  code: string
  language: string
}

function escapeHtml(value: string) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

async function renderHighlightedCode(props: HighlightedCodeProps) {
  try {
    const html = await codeToHtml(props.code, {
      lang: props.language,
      theme: 'github-light',
    })

    return html.replace('<pre class="shiki', `<pre data-language="${props.language}" class="shiki`)
  } catch {
    return `<pre data-language="${props.language}" class="m-0 overflow-auto bg-gray-50 px-5 py-4 text-sm"><code>${escapeHtml(props.code)}</code></pre>`
  }
}

function HighlightedCode(props: HighlightedCodeProps) {
  const [html] = createResource(
    () => ({ code: props.code, language: props.language }),
    renderHighlightedCode,
  )

  return (
    <Show
      when={html()}
      fallback={
        <pre data-language={props.language} class="m-0 overflow-auto bg-gray-50 px-5 py-4 text-sm">
          <code>{props.code}</code>
        </pre>
      }
    >
      {(highlightedHtml) => <div innerHTML={highlightedHtml()} />}
    </Show>
  )
}

export function DemoBlock(props: DemoBlockProps) {
  const language = () => props.language ?? 'tsx'

  return (
    <section
      class="my-6 overflow-hidden rounded-xl border border-gray-200"
      aria-label={props.title}
    >
      <h3 class="m-0 border-b border-gray-200 px-5 py-4 text-lg font-semibold">{props.title}</h3>
      <div class="p-6">{props.children}</div>
      <HighlightedCode code={props.code} language={language()} />
    </section>
  )
}
```

- [ ] **Step 2: Run focused test and verify GREEN or capture implementation issues**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- src/site/demo-block.test.tsx
```

Expected: PASS. If the test fails due to exact Shiki HTML structure, inspect the rendered DOM and adjust assertions or wrapper markup without changing the user-visible API.

### Task 4: Refine generated markup for layout consistency

**Files:**

- Modify: `apps/docs/src/site/demo-block.tsx`
- Modify: `apps/docs/src/site/demo-block.test.tsx` only if tests need to match final intentional markup

- [ ] **Step 1: Ensure the Shiki `<pre>` receives the same spacing/scroll classes as the original code block**

Edit `renderHighlightedCode` in `apps/docs/src/site/demo-block.tsx` so the Shiki HTML gets both `data-language` and the existing Tailwind layout classes:

```tsx
return html.replace(
  '<pre class="shiki',
  `<pre data-language="${props.language}" class="shiki m-0 overflow-auto px-5 py-4 text-sm`,
)
```

- [ ] **Step 2: Run focused test after refactor**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs test -- src/site/demo-block.test.tsx
```

Expected: PASS.

### Task 5: Full verification

**Files:**

- No code edits expected unless verification finds issues.

- [ ] **Step 1: Run required repository checks**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: all commands exit 0.

- [ ] **Step 2: Inspect changed files**

Run:

```bash
git diff -- apps/docs/package.json apps/docs/src/site/demo-block.tsx apps/docs/src/site/demo-block.test.tsx pnpm-lock.yaml
```

Expected: diff shows only Shiki dependency/lockfile changes, DemoBlock highlighter implementation, and focused tests.

## Self-Review

- Spec coverage: The plan adds Shiki, keeps `DemoBlock` as the integration point, supports default `tsx`, custom `language`, fallback rendering, and verification.
- Placeholder scan: No placeholders remain; commands and code snippets are explicit.
- Type consistency: `DemoBlockProps.language`, `HighlightedCodeProps.language`, and `data-language` are consistently named.
