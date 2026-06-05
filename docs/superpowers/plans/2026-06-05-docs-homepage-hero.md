# Docs Homepage Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the docs homepage as a centered, high-impact landing page using the provided blue-purple glassmorphism hero banner image.

**Architecture:** Keep the existing docs app shell and route discovery unchanged. Implement the new homepage in `apps/docs/src/pages/index.tsx`, import one local hero image asset from `apps/docs/src/assets/hero-banner.png`, and update the existing homepage test to lock down navigation and key landing-page content.

**Tech Stack:** SolidJS, `@solidjs/router`, Ant Design Solid core components, Tailwind utility classes, Vitest, Solid Testing Library, Vite asset imports.

---

## File Structure

- Create: `apps/docs/src/assets/hero-banner.png`
  - Stores the provided blue-purple glassmorphism image with a kebab-case filename.
  - If the image is not already available as a local file, ask the user for the original image file/path before this step.
- Modify: `apps/docs/src/pages/index.tsx`
  - Owns the homepage route component.
  - Imports the hero banner asset.
  - Renders the centered hero, feature cards, and component preview section.
  - Preserves both CTA navigation handlers.
- Modify: `apps/docs/src/pages/index.test.tsx`
  - Verifies the redesigned hero and new content.
  - Verifies CTA navigation still targets existing routes.

---

### Task 1: Add the Hero Banner Asset

**Files:**

- Create: `apps/docs/src/assets/hero-banner.png`

- [ ] **Step 1: Create the assets directory**

Run:

```bash
mkdir -p apps/docs/src/assets
```

Expected: command exits with status 0.

- [ ] **Step 2: Copy the provided image into the repo**

If the image file is available locally at `/path/to/provided-image.png`, run:

```bash
cp /path/to/provided-image.png apps/docs/src/assets/hero-banner.png
```

Expected: `apps/docs/src/assets/hero-banner.png` exists and contains the provided blue-purple glassmorphism image.

If `/path/to/provided-image.png` is not available, stop and ask the user for the original image file or local path. Do not substitute a different bitmap because the requirement is to place the provided image in the hero banner.

- [ ] **Step 3: Verify the asset exists**

Run:

```bash
test -s apps/docs/src/assets/hero-banner.png && file apps/docs/src/assets/hero-banner.png
```

Expected: output identifies a non-empty PNG image.

- [ ] **Step 4: Commit the asset**

Run:

```bash
git add apps/docs/src/assets/hero-banner.png
git commit -m "feat(docs): add homepage hero image"
```

Expected: commit succeeds and includes only `apps/docs/src/assets/hero-banner.png`.

---

### Task 2: Update Homepage Tests First

**Files:**

- Modify: `apps/docs/src/pages/index.test.tsx`

- [ ] **Step 1: Replace the homepage test with expectations for the redesigned page**

Write `apps/docs/src/pages/index.test.tsx` exactly as:

```tsx
import { fireEvent, render } from '@solidjs/testing-library'
import { ConfigProvider } from '@ant-design-solid/core'
import { StyleProvider } from '@ant-design-solid/cssinjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Home from './index'

const navigate = vi.hoisted(() => vi.fn())

vi.mock('@solidjs/router', () => ({
  useNavigate: () => navigate,
}))

vi.mock('../assets/hero-banner.png', () => ({
  default: '/hero-banner.png',
}))

beforeEach(() => {
  navigate.mockClear()
})

function renderHome() {
  return render(() => (
    <StyleProvider>
      <ConfigProvider>
        <Home />
      </ConfigProvider>
    </StyleProvider>
  ))
}

describe('Home', () => {
  it('renders the centered landing hero with the provided banner image', () => {
    const result = renderHome()
    const heading = result.getByRole('heading', { name: 'Ant Design Solid', level: 1 })
    const hero = heading.closest('section')

    expect(hero).toHaveClass('overflow-hidden')
    expect(hero).toHaveClass('text-center')
    expect(hero).toHaveClass(
      'bg-[radial-gradient(circle_at_top,_rgba(219,234,254,0.95),_rgba(255,255,255,0.98)_46%,_rgba(245,243,255,0.92))]',
    )
    expect(result.getByText('SolidJS · Design System · Token Driven')).toBeInTheDocument()
    expect(result.getByText(/Ant Design for the Solid era/)).toBeInTheDocument()
    expect(result.getByText(/Ant Design-inspired semantics/)).toBeInTheDocument()

    const image = result.getByRole('img', { name: 'Blue glassmorphism interface hero artwork' })
    expect(image).toHaveAttribute('src', '/hero-banner.png')
    expect(image).toHaveClass('w-full')
  })

  it('renders homepage feature cards and component preview copy', () => {
    const result = renderHome()

    expect(result.getByText('Component-rich')).toBeInTheDocument()
    expect(result.getByText('Token-driven theming')).toBeInTheDocument()
    expect(result.getByText('Solid-native runtime')).toBeInTheDocument()
    expect(result.getByText('Preview the building blocks')).toBeInTheDocument()
    expect(result.getByText('Ready for production docs')).toBeInTheDocument()
  })

  it('navigates to getting started when clicking Get Started', () => {
    const result = renderHome()

    fireEvent.click(result.getByRole('button', { name: 'Get Started' }))

    expect(navigate).toHaveBeenCalledWith('/docs/getting-started')
  })

  it('navigates to the first component page when clicking View Components', () => {
    const result = renderHome()

    fireEvent.click(result.getByRole('button', { name: 'View Components' }))

    expect(navigate).toHaveBeenCalledWith('/components/affix')
  })
})
```

- [ ] **Step 2: Run the homepage test and confirm it fails for missing implementation**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter docs test -- --run src/pages/index.test.tsx
```

Expected: test fails because the current homepage does not import the image or render the new landing-page content.

- [ ] **Step 3: Commit the failing test**

Run:

```bash
git add apps/docs/src/pages/index.test.tsx
git commit -m "test(docs): cover redesigned homepage hero"
```

Expected: commit succeeds and includes only `apps/docs/src/pages/index.test.tsx`.

---

### Task 3: Implement the Redesigned Homepage

**Files:**

- Modify: `apps/docs/src/pages/index.tsx`

- [ ] **Step 1: Replace the homepage component**

Write `apps/docs/src/pages/index.tsx` exactly as:

```tsx
import { useNavigate } from '@solidjs/router'
import { Badge, Button, Card, Space, Tabs, Tag } from '@ant-design-solid/core'
import heroBanner from '../assets/hero-banner.png'

const features = [
  {
    title: 'Component-rich',
    description:
      'Explore Ant Design-inspired semantics across navigation, data entry, feedback, and display components.',
  },
  {
    title: 'Token-driven theming',
    description:
      'Tune the system from ConfigProvider with seed tokens, component tokens, and predictable visual results.',
  },
  {
    title: 'Solid-native runtime',
    description:
      'Use fine-grained reactivity with a Solid-first component model and CSS-in-JS runtime built for this stack.',
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div class="space-y-10 pb-8">
      <section class="relative overflow-hidden rounded-[36px] border border-blue-100 bg-[radial-gradient(circle_at_top,_rgba(219,234,254,0.95),_rgba(255,255,255,0.98)_46%,_rgba(245,243,255,0.92))] px-6 py-14 text-center shadow-[0_32px_120px_rgba(37,99,235,0.14)] sm:px-10 lg:px-14">
        <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_82%,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_82%_70%,rgba(124,58,237,0.14),transparent_26%)]" />
        <div class="pointer-events-none absolute left-1/2 top-28 h-64 w-[min(760px,86%)] -translate-x-1/2 rounded-full bg-blue-300/20 blur-3xl" />

        <div class="relative z-[1] mx-auto max-w-[860px]">
          <div class="mb-6 inline-flex rounded-full border border-blue-200/70 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600 shadow-sm backdrop-blur">
            SolidJS · Design System · Token Driven
          </div>
          <h1 class="mb-5 mt-0 text-5xl font-black tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl">
            Ant Design Solid
          </h1>
          <p class="mx-auto mb-2 max-w-[720px] text-2xl font-semibold tracking-[-0.025em] text-slate-900 sm:text-3xl">
            Ant Design for the Solid era
          </p>
          <p class="mx-auto max-w-[760px] text-base leading-[1.8] text-black/65 sm:text-lg">
            Build polished product interfaces with Ant Design-inspired semantics, Solid-native
            performance, token-driven theming, and a docs experience designed for fast discovery.
          </p>
          <Space class="mt-8 justify-center" size="middle">
            <Button type="primary" size="large" onClick={() => navigate('/docs/getting-started')}>
              Get Started
            </Button>
            <Button size="large" onClick={() => navigate('/components/affix')}>
              View Components
            </Button>
          </Space>
        </div>

        <div class="relative z-[1] mx-auto mt-12 max-w-[960px]">
          <div class="rounded-[32px] border border-white/80 bg-white/45 p-2 shadow-[0_36px_100px_rgba(37,99,235,0.22)] backdrop-blur-xl">
            <img
              alt="Blue glassmorphism interface hero artwork"
              class="w-full rounded-[26px] object-cover shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
              src={heroBanner}
            />
          </div>
        </div>
      </section>

      <section class="grid gap-5 lg:grid-cols-3">
        {features.map((feature) => (
          <Card class="h-full border-blue-100 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
            <div class="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-lg text-blue-600">
              ✦
            </div>
            <h2 class="mb-3 mt-0 text-xl font-bold text-slate-950">{feature.title}</h2>
            <p class="m-0 leading-[1.75] text-black/65">{feature.description}</p>
          </Card>
        ))}
      </section>

      <section class="grid gap-6 rounded-[32px] border border-blue-100 bg-white p-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)] lg:grid-cols-[1fr_1.25fr] lg:p-8">
        <div>
          <Tag color="blue">Components</Tag>
          <h2 class="mb-3 mt-4 text-3xl font-black tracking-[-0.035em] text-slate-950">
            Preview the building blocks
          </h2>
          <p class="mb-6 leading-[1.75] text-black/65">
            Ready for production docs, examples, and theme exploration without leaving the SolidJS
            workflow.
          </p>
          <Space wrap>
            <Badge count={32}>
              <Button>Components</Button>
            </Badge>
            <Button type="primary">Primary action</Button>
            <Button>Secondary</Button>
          </Space>
        </div>

        <Card class="border-slate-100 bg-slate-50/80">
          <Tabs
            defaultActiveKey="theme"
            items={[
              {
                key: 'theme',
                label: 'Theme',
                children: (
                  <div class="rounded-2xl bg-white p-5 shadow-sm">
                    <div class="mb-3 text-sm font-semibold text-slate-950">Token preview</div>
                    <div class="flex gap-3">
                      <span class="h-10 flex-1 rounded-xl bg-blue-500" />
                      <span class="h-10 flex-1 rounded-xl bg-indigo-500" />
                      <span class="h-10 flex-1 rounded-xl bg-violet-500" />
                    </div>
                  </div>
                ),
              },
              {
                key: 'runtime',
                label: 'Runtime',
                children: (
                  <div class="rounded-2xl bg-white p-5 text-sm leading-7 text-black/65 shadow-sm">
                    Fine-grained updates, component-level styles, and predictable composition for
                    Solid applications.
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Run the homepage test and confirm it passes**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter docs test -- --run src/pages/index.test.tsx
```

Expected: all tests in `src/pages/index.test.tsx` pass.

- [ ] **Step 3: Commit the implementation**

Run:

```bash
git add apps/docs/src/pages/index.tsx
git commit -m "feat(docs): redesign homepage hero"
```

Expected: commit succeeds and includes only `apps/docs/src/pages/index.tsx`.

---

### Task 4: Run Formatting, Tests, and Build Verification

**Files:**

- No source changes expected unless verification reveals a real issue in files touched by this plan.

- [ ] **Step 1: Run lint**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: command exits with status 0.

- [ ] **Step 2: Run format check**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: command exits with status 0.

- [ ] **Step 3: Run typecheck**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: command exits with status 0.

- [ ] **Step 4: Run tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: command exits with status 0.

- [ ] **Step 5: Run build**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: command exits with status 0.

- [ ] **Step 6: Commit verification fixes if needed**

If any verification command required a fix in files from this plan, run:

```bash
git add apps/docs/src/pages/index.tsx apps/docs/src/pages/index.test.tsx apps/docs/src/assets/hero-banner.png
git commit -m "fix(docs): polish homepage hero verification"
```

Expected: commit succeeds only if verification fixes were made. If no fixes were needed, skip this step.
