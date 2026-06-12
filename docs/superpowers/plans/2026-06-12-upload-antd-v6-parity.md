# Upload Ant Design v6 Parity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the Solid Upload component to cover the Ant Design v6 Upload API surface that fits Solid conventions.

**Architecture:** Public types live in `packages/components/src/upload/interface.ts`; behavior and rendering live in `packages/components/src/upload/upload.tsx`; styles live in `packages/components/src/upload/upload.style.ts`; demos and API docs live in `apps/docs/src/pages/components/upload.mdx`.

**Tech Stack:** Solid JSX, DOM File APIs, XMLHttpRequest, Vitest, Solid Testing Library, oxlint/oxfmt.

---

### Task 1: Public Types And Static API

**Files:**

- Modify: `packages/components/src/upload/interface.ts`
- Modify: `packages/components/src/upload/upload.tsx`
- Test: `packages/components/src/upload/__tests__/upload.test.tsx`

- [ ] Add failing tests for `Upload.LIST_IGNORE`, transformed `beforeUpload`, and richer request options.
- [ ] Expand types for `UploadFile`, `UploadChangeInfo`, `UploadRequestOptions`, `showUploadList`, list types, semantic slots, and request config props.
- [ ] Export `Upload.LIST_IGNORE` and attach `Upload.Dragger`.

### Task 2: Request And File Flow

**Files:**

- Modify: `packages/components/src/upload/upload.tsx`
- Test: `packages/components/src/upload/__tests__/upload.test.tsx`

- [ ] Implement `beforeUpload(file, fileList)` return handling.
- [ ] Implement default XMLHttpRequest upload for `action`, `data`, `headers`, `method`, `name`, and `withCredentials`.
- [ ] Pass `{ defaultRequest }` to `customRequest`.
- [ ] Include progress `event` in `onChange`.

### Task 3: Input Modes

**Files:**

- Modify: `packages/components/src/upload/upload.tsx`
- Test: `packages/components/src/upload/__tests__/upload.test.tsx`

- [ ] Add `directory`, `openFileDialogOnClick`, `capture`, `pastable`, `onDrop`, and drag state.
- [ ] Implement `Upload.Dragger` as a preset wrapper using `type="drag"`.

### Task 4: Upload List Customization

**Files:**

- Modify: `packages/components/src/upload/upload.tsx`
- Modify: `packages/components/src/upload/upload.style.ts`
- Test: `packages/components/src/upload/__tests__/upload.test.tsx`

- [ ] Implement `listType`, preview/download actions, custom icons, custom item rendering, `previewFile`, and `isImageUrl`.
- [ ] Implement semantic `classNames` and `styles`.
- [ ] Extend styles for drag and picture list variants.

### Task 5: Docs And Verification

**Files:**

- Modify: `apps/docs/src/pages/components/upload.mdx`

- [ ] Add demos for core new features.
- [ ] Update API tables.
- [ ] Run Upload tests, then repository lint, format check, typecheck, tests, and build.
