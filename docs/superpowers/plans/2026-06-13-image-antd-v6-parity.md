# Image Antd V6 Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the Solid `Image` component to match Ant Design v6 Image API and preview behavior with Solid-style naming.

**Architecture:** Split the current single Image implementation into focused modules for types, image rendering, preview overlay, preview group context, transform helpers, progress placeholder, and styles. Keep implementation Solid-native and portal-backed, with controlled/uncontrolled helpers in component code rather than external dependencies.

**Tech Stack:** SolidJS, Vitest, `@solidjs/testing-library`, existing `@solid-ant-design/cssinjs`, existing config provider tokens and z-index helpers.

---

## File Structure

- Modify `packages/components/src/image/interface.ts`: define complete Image, Preview, PreviewGroup, transform, icon, progress, and semantic slot types.
- Create `packages/components/src/image/transform.ts`: pure transform defaults and operations.
- Create `packages/components/src/image/progress.tsx`: progress placeholder component.
- Create `packages/components/src/image/preview.tsx`: preview overlay and toolbar.
- Create `packages/components/src/image/preview-group.tsx`: group context, registration, and compound PreviewGroup component.
- Modify `packages/components/src/image/image.tsx`: render image wrapper, fallback, placeholder, cover, semantics, and connect to preview/group.
- Modify `packages/components/src/image/image.style.ts`: token-aligned antd v6 Image styles.
- Modify `packages/components/src/image/index.ts`: export compound Image and types.
- Modify `packages/components/src/image/__tests__/image.test.tsx`: add behavior tests first, then keep them passing.
- Modify `apps/docs/src/pages/components/image.mdx`: align examples and API docs with antd v6 using Solid prop names.

## Tasks

### Task 1: Types And Existing Behavior Compatibility

**Files:**

- Modify: `packages/components/src/image/interface.ts`
- Modify: `packages/components/src/image/image.tsx`
- Test: `packages/components/src/image/__tests__/image.test.tsx`

- [ ] **Step 1: Write failing tests for Solid image attributes and semantic props**

Add tests showing `loading`, `srcSet`, `crossOrigin`, `class`, `rootClass`, `classNames.root`, `styles.root`, `classNames.image`, and `styles.image` are supported.

- [ ] **Step 2: Run focused Image tests and verify failure**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- image`

Expected: FAIL because semantic props and img attribute passthrough are missing.

- [ ] **Step 3: Implement expanded `ImageProps` and semantic root/image rendering**

Change `ImageProps` to omit image event conflicts from `JSX.ImgHTMLAttributes<HTMLImageElement>`, add semantic prop types, and update `image.tsx` to split image-specific props from wrapper-specific props. Root `style` should merge `styles.root`, `wrapperStyle`, and `style`; image `style` should merge width/height and `styles.image`.

- [ ] **Step 4: Run focused Image tests and verify pass**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- image`

Expected: PASS.

### Task 2: Preview Config And Controlled Open State

**Files:**

- Modify: `packages/components/src/image/interface.ts`
- Create: `packages/components/src/image/preview.tsx`
- Modify: `packages/components/src/image/image.tsx`
- Test: `packages/components/src/image/__tests__/image.test.tsx`

- [ ] **Step 1: Write failing tests for preview object config**

Add tests for `preview={{ open, src, alt, zIndex, getContainer, onOpenChange }}`, top-level `getPopupContainer` compatibility, top-level `zIndex` compatibility, and `preview={false}`.

- [ ] **Step 2: Run focused Image tests and verify failure**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- image`

Expected: FAIL because `preview` only accepts boolean and overlay is not controlled.

- [ ] **Step 3: Implement `preview.tsx` and preview config normalization**

Move overlay rendering to `preview.tsx`. Normalize `preview` into config, support controlled `open`, `defaultOpen`, deprecated `visible`, `onOpenChange`, deprecated `onVisibleChange`, `getContainer`, `zIndex`, `src`, `alt`, close button, Escape, and mask click.

- [ ] **Step 4: Run focused Image tests and verify pass**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- image`

Expected: PASS.

### Task 3: Transform Toolbar

**Files:**

- Create: `packages/components/src/image/transform.ts`
- Modify: `packages/components/src/image/preview.tsx`
- Modify: `packages/components/src/image/interface.ts`
- Test: `packages/components/src/image/__tests__/image.test.tsx`

- [ ] **Step 1: Write failing tests for transform operations**

Add tests that click toolbar buttons for zoom in, zoom out, rotate left, rotate right, flip X, flip Y, and reset; assert transform style and `onTransform` action values.

- [ ] **Step 2: Run focused Image tests and verify failure**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- image`

Expected: FAIL because toolbar buttons and transform state are missing.

- [ ] **Step 3: Implement transform helpers and toolbar actions**

Add transform state with `x`, `y`, `rotate`, `scale`, `flipX`, and `flipY`. Implement actions `zoomIn`, `zoomOut`, `rotateLeft`, `rotateRight`, `flipX`, `flipY`, `reset`, `wheel`, `doubleClick`, `move`, and call `onTransform` after each action.

- [ ] **Step 4: Run focused Image tests and verify pass**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- image`

Expected: PASS.

### Task 4: Custom Preview Rendering, Mask, Cover, And Progress Placeholder

**Files:**

- Create: `packages/components/src/image/progress.tsx`
- Modify: `packages/components/src/image/preview.tsx`
- Modify: `packages/components/src/image/image.tsx`
- Modify: `packages/components/src/image/interface.ts`
- Test: `packages/components/src/image/__tests__/image.test.tsx`

- [ ] **Step 1: Write failing tests for customization**

Add tests for `placeholder={{ progress: { percent } }}`, custom progress render, `preview.mask={false}`, custom mask node, `closeIcon`, `cover`, `imageRender`, `actionsRender`, and deprecated `toolbarRender`.

- [ ] **Step 2: Run focused Image tests and verify failure**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- image`

Expected: FAIL because these customization hooks are missing.

- [ ] **Step 3: Implement progress placeholder and customization hooks**

Add progress placeholder rendering with ARIA attributes, cover rendering over the image, mask rendering, close icon override, image render wrapper, and action toolbar render customization.

- [ ] **Step 4: Run focused Image tests and verify pass**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- image`

Expected: PASS.

### Task 5: PreviewGroup

**Files:**

- Create: `packages/components/src/image/preview-group.tsx`
- Modify: `packages/components/src/image/image.tsx`
- Modify: `packages/components/src/image/index.ts`
- Modify: `packages/components/src/image/interface.ts`
- Test: `packages/components/src/image/__tests__/image.test.tsx`

- [ ] **Step 1: Write failing tests for grouped preview**

Add tests for `Image.PreviewGroup` child registration, opening the clicked image, prev/next switching, `current/defaultCurrent/onChange`, `items`, `fallback`, `countRender`, and group `onOpenChange`.

- [ ] **Step 2: Run focused Image tests and verify failure**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- image`

Expected: FAIL because `Image.PreviewGroup` does not exist.

- [ ] **Step 3: Implement group context and compound export**

Create group context that registers image metadata, opens shared preview by id, merges `items`, supports controlled/uncontrolled current index, and renders one shared `ImagePreview`.

- [ ] **Step 4: Run focused Image tests and verify pass**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- image`

Expected: PASS.

### Task 6: Antd V6 Token-Aligned Styles

**Files:**

- Modify: `packages/components/src/image/image.style.ts`
- Test: `packages/components/src/image/__tests__/image.test.tsx`

- [ ] **Step 1: Write failing tests for class structure and semantic slots**

Add tests asserting classes for `ads-image-cover`, `ads-image-preview-mask`, `ads-image-preview-body`, `ads-image-preview-footer`, `ads-image-preview-actions`, and `ads-image-progress-wrapper`.

- [ ] **Step 2: Run focused Image tests and verify failure**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- image`

Expected: FAIL because class structure and progress classes are not complete.

- [ ] **Step 3: Replace Image styles with v6-aligned token styles**

Implement image, cover, progress, preview, switch, footer, actions, movable, moving, and hidden-mask styles. Use existing token fields and computed component token values.

- [ ] **Step 4: Run focused Image tests and verify pass**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core test -- image`

Expected: PASS.

### Task 7: Docs And Exports

**Files:**

- Modify: `packages/components/src/image/index.ts`
- Modify: `apps/docs/src/pages/components/image.mdx`
- Test: docs build/typecheck through package commands.

- [ ] **Step 1: Update docs examples and API tables**

Rewrite the Image docs with antd-aligned examples in Solid syntax and API tables for Image, PreviewType, PreviewGroup, GroupPreviewType, progress config, and semantic DOM.

- [ ] **Step 2: Run docs and core typechecks**

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/core typecheck`

Expected: PASS.

Run: `COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @solid-ant-design/docs typecheck`

Expected: PASS.

### Task 8: Full Verification

**Files:**

- All Image implementation and docs files.

- [ ] **Step 1: Run required verification commands**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: PASS for all commands.

- [ ] **Step 2: Review git diff**

Run: `git diff --stat && git diff -- packages/components/src/image apps/docs/src/pages/components/image.mdx`

Expected: Diff is scoped to Image implementation, Image docs, and the plan/spec files.
