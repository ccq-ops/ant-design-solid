# Message API Compatibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Ant Design-compatible public message APIs to `@ant-design-solid/core`.

**Architecture:** Keep `message.ts` as lifecycle/API manager and `holder.tsx` as renderer. Add a reusable runtime factory for global and local `useMessage` instances. Close notices through one path so callbacks and thenables are consistent.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, existing CSS-in-JS style hooks.

---

- [x] Add failing tests for callable handles, thenables, overloads, global config, custom rendering, hover pause, and local instances.
- [x] Implement `MessageHandle` as callable thenable with retained `.close()`.
- [x] Normalize shortcut overload arguments.
- [x] Add global `message.config` support.
- [x] Add max-count eviction through the common close path.
- [x] Render top, prefix, container, RTL, icon, classes, styles, click handlers, semantic slots, and stack threshold.
- [x] Add timer pause/resume callbacks for hover.
- [x] Implement `message.useMessage(config?)` local runtime.
- [x] Update docs page API tables.
- [x] Run targeted tests and project typecheck/test/build verification.
