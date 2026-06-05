# Overlay Z-Index Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make popup layers escape ancestor stacking/overflow contexts by default and give nested overlays deterministic Ant Design style z-index ordering.

**Architecture:** Add shared popup-container and z-index primitives, expose `getPopupContainer` through `ConfigProvider`, and migrate existing overlay components to use `InternalPortal` plus `useZIndex`. Select-like inline dropdowns will become fixed-position portaled overlays, while container overlays will provide z-index context to descendants.

**Tech Stack:** SolidJS, TypeScript, Vitest, @solidjs/testing-library, existing cssinjs/theme packages.

---

## File Structure

- Modify `packages/components/src/shared/z-index.ts`: replace allocator-only behavior with `ZIndexContext`, overlay type maps, and `useZIndex`.
- Modify `packages/components/src/shared/portal.tsx`: support optional dynamic mount container.
- Modify `packages/components/src/config-provider/interface.ts`: add `getPopupContainer` to provider props/context.
- Modify `packages/components/src/config-provider/context.tsx`: merge and expose popup-container accessor.
- Modify `packages/components/src/config-provider/config-provider.tsx`: pass new prop into `createConfigValue`.
- Modify tests in `packages/components/src/config-provider/__tests__/config-provider.test.tsx`: verify context inheritance/override.
- Modify tests in `packages/components/src/shared/__tests__/overlay.test.tsx` or create `packages/components/src/shared/__tests__/portal.test.tsx`: verify custom portal mount.
- Modify `packages/components/src/tooltip/interface.ts`, `tooltip.tsx`, `tooltip.style.ts`, tests: add zIndex/getPopupContainer and contextual z-index.
- Modify `packages/components/src/popover/interface.ts`, `popover.tsx`, `popover.style.ts`, tests: add zIndex/getPopupContainer and contextual z-index.
- Modify `packages/components/src/popconfirm/interface.ts`, `popconfirm.tsx`, `popconfirm.style.ts`, tests: add zIndex/getPopupContainer and contextual z-index.
- Modify `packages/components/src/dropdown/interface.ts`, `dropdown.tsx`, `dropdown.style.ts`, tests: add zIndex/getPopupContainer as consumer overlay.
- Modify `packages/components/src/color-picker/interface.ts`, `color-picker.tsx`, `color-picker.style.ts`, tests: add zIndex/getPopupContainer and contextual z-index.
- Modify `packages/components/src/select/interface.ts`, `select.tsx`, `select.style.ts`, tests: portal dropdown with fixed positioning and z-index.
- Modify `packages/components/src/tree-select/interface.ts`, `tree-select.tsx`, `tree-select.style.ts`, tests: portal dropdown with fixed positioning and z-index.
- Modify `packages/components/src/time-picker/interface.ts`, `time-picker.tsx`, `time-picker.style.ts`, tests: portal dropdown with fixed positioning and z-index.

---

### Task 1: Shared z-index and popup container primitives

**Files:**
- Modify: `packages/components/src/shared/z-index.ts`
- Modify: `packages/components/src/shared/portal.tsx`
- Modify: `packages/components/src/config-provider/interface.ts`
- Modify: `packages/components/src/config-provider/context.tsx`
- Modify: `packages/components/src/config-provider/config-provider.tsx`
- Test: `packages/components/src/config-provider/__tests__/config-provider.test.tsx`
- Test: `packages/components/src/shared/__tests__/portal.test.tsx`

- [ ] **Step 1: Write failing ConfigProvider test**

Append to `packages/components/src/config-provider/__tests__/config-provider.test.tsx`:

```tsx
it('inherits and overrides getPopupContainer', () => {
  const outerContainer = document.createElement('div')
  const innerContainer = document.createElement('div')
  let outerResolved: HTMLElement | undefined
  let innerResolved: HTMLElement | undefined

  function Reader(props: { onRead: (element: HTMLElement | undefined) => void }) {
    const config = useConfig()
    props.onRead(config.getPopupContainer?.(document.body))
    return null
  }

  render(() => (
    <ConfigProvider getPopupContainer={() => outerContainer}>
      <Reader onRead={(element) => (outerResolved = element)} />
      <ConfigProvider getPopupContainer={() => innerContainer}>
        <Reader onRead={(element) => (innerResolved = element)} />
      </ConfigProvider>
    </ConfigProvider>
  ))

  expect(outerResolved).toBe(outerContainer)
  expect(innerResolved).toBe(innerContainer)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- config-provider.test.tsx
```

Expected: FAIL because `getPopupContainer` is not on `ConfigProviderProps`/context.

- [ ] **Step 3: Write failing InternalPortal custom mount test**

Create `packages/components/src/shared/__tests__/portal.test.tsx`:

```tsx
import { render, screen } from '@solidjs/testing-library'
import { describe, expect, it } from 'vitest'
import { InternalPortal } from '../portal'

describe('InternalPortal', () => {
  it('mounts children into a custom container', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    render(() => (
      <InternalPortal mount={() => container}>
        <div>Portaled content</div>
      </InternalPortal>
    ))

    expect(container).toContainElement(screen.getByText('Portaled content'))
  })
})
```

- [ ] **Step 4: Run test to verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- portal.test.tsx
```

Expected: FAIL because `InternalPortalProps` does not accept `mount`.

- [ ] **Step 5: Implement shared primitives**

Replace `packages/components/src/shared/z-index.ts` with:

```ts
import { createContext, useContext } from 'solid-js'

const baseZIndex = 1000
const containerOffset = 100
const consumerOffset = 50
const zIndexStep = 10
let currentZIndex = baseZIndex - zIndexStep

export type ZIndexContainer =
  | 'Modal'
  | 'Drawer'
  | 'Popover'
  | 'Popconfirm'
  | 'Tooltip'
  | 'Tour'
  | 'FloatButton'
  | 'ColorPicker'

export type ZIndexConsumer = 'SelectLike' | 'Dropdown' | 'DatePicker' | 'Menu' | 'ImagePreview'
export type ZIndexComponentType = ZIndexContainer | ZIndexConsumer

export const containerBaseZIndexOffset: Record<ZIndexContainer, number> = {
  Modal: containerOffset,
  Drawer: containerOffset,
  Popover: containerOffset,
  Popconfirm: containerOffset,
  Tooltip: containerOffset,
  Tour: containerOffset,
  FloatButton: containerOffset,
  ColorPicker: containerOffset,
}

export const consumerBaseZIndexOffset: Record<ZIndexConsumer, number> = {
  SelectLike: consumerOffset,
  Dropdown: consumerOffset,
  DatePicker: consumerOffset,
  Menu: consumerOffset,
  ImagePreview: 1,
}

export const ZIndexContext = createContext<number | undefined>(undefined)

function isContainerType(type: ZIndexComponentType): type is ZIndexContainer {
  return type in containerBaseZIndexOffset
}

export function useZIndex(
  componentType: ZIndexComponentType,
  customZIndex?: number,
): [zIndex: number, contextZIndex: number] {
  const parentZIndex = useContext(ZIndexContext)

  if (customZIndex !== undefined) return [customZIndex, customZIndex]

  const offset = isContainerType(componentType)
    ? containerBaseZIndexOffset[componentType]
    : consumerBaseZIndexOffset[componentType]
  const zIndex = (parentZIndex ?? baseZIndex) + offset

  return [zIndex, zIndex]
}

export function allocateZIndex() {
  currentZIndex += zIndexStep
  return currentZIndex
}

export function resetZIndexForTests() {
  currentZIndex = baseZIndex - zIndexStep
}
```

Modify `packages/components/src/shared/portal.tsx`:

```tsx
import { Portal } from 'solid-js/web'
import type { Accessor, JSX } from 'solid-js'

export interface InternalPortalProps {
  mount?: HTMLElement | Accessor<HTMLElement | undefined>
  children: JSX.Element
}

export function canUseDom() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

export function resolvePortalMount(
  mount: InternalPortalProps['mount'] | undefined,
): HTMLElement | undefined {
  if (!canUseDom()) return undefined
  if (typeof mount === 'function') return mount()
  return mount ?? document.body
}

export function InternalPortal(props: InternalPortalProps) {
  if (!canUseDom()) return null
  return <Portal mount={resolvePortalMount(props.mount)}>{props.children}</Portal>
}
```

Modify `packages/components/src/config-provider/interface.ts`:

```ts
import type { Accessor, JSX } from 'solid-js'
import type { AliasToken, ComponentSize, ThemeConfig } from '@ant-design-solid/theme'
export interface ConfigProviderProps {
  prefixCls?: string
  componentSize?: ComponentSize
  direction?: 'ltr' | 'rtl'
  theme?: ThemeConfig
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
  children?: JSX.Element
}
export interface ConfigContextValue {
  prefixCls: Accessor<string>
  componentSize: Accessor<ComponentSize>
  direction: Accessor<'ltr' | 'rtl'>
  theme: Accessor<ThemeConfig>
  token: Accessor<AliasToken>
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
}
```

Modify the props type in `createConfigValue` in `packages/components/src/config-provider/context.tsx` to include `getPopupContainer`, and add it to returned context:

```ts
getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
```

Return field:

```ts
getPopupContainer: props.getPopupContainer ?? parent.getPopupContainer,
```

Modify `packages/components/src/config-provider/config-provider.tsx` so `getPopupContainer` is passed through to `createConfigValue`. If it currently passes `props` directly, no change is needed beyond type support.

- [ ] **Step 6: Run shared tests to verify they pass**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- config-provider.test.tsx portal.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit shared primitives**

```bash
git add packages/components/src/shared/z-index.ts packages/components/src/shared/portal.tsx packages/components/src/config-provider/interface.ts packages/components/src/config-provider/context.tsx packages/components/src/config-provider/config-provider.tsx packages/components/src/config-provider/__tests__/config-provider.test.tsx packages/components/src/shared/__tests__/portal.test.tsx
git commit -m "feat: add popup container and z-index primitives"
```

---

### Task 2: Container overlays use contextual z-index

**Files:**
- Modify: `packages/components/src/tooltip/interface.ts`
- Modify: `packages/components/src/tooltip/tooltip.tsx`
- Modify: `packages/components/src/tooltip/tooltip.style.ts`
- Test: `packages/components/src/tooltip/__tests__/tooltip.test.tsx`
- Modify: `packages/components/src/popover/interface.ts`
- Modify: `packages/components/src/popover/popover.tsx`
- Modify: `packages/components/src/popover/popover.style.ts`
- Test: `packages/components/src/popover/__tests__/popover.test.tsx`
- Modify: `packages/components/src/popconfirm/interface.ts`
- Modify: `packages/components/src/popconfirm/popconfirm.tsx`
- Modify: `packages/components/src/popconfirm/popconfirm.style.ts`
- Test: `packages/components/src/popconfirm/__tests__/popconfirm.test.tsx`
- Modify: `packages/components/src/color-picker/interface.ts`
- Modify: `packages/components/src/color-picker/color-picker.tsx`
- Modify: `packages/components/src/color-picker/color-picker.style.ts`
- Test: `packages/components/src/color-picker/__tests__/color-picker.test.tsx`

- [ ] **Step 1: Write failing Tooltip z-index test**

Append to `packages/components/src/tooltip/__tests__/tooltip.test.tsx`:

```tsx
it('uses explicit zIndex and custom popup container', () => {
  const popupContainer = document.createElement('div')
  document.body.appendChild(popupContainer)
  const result = render(() => (
    <Tooltip title="Layer" open zIndex={1234} getPopupContainer={() => popupContainer}>
      <button>trigger</button>
    </Tooltip>
  ))

  const overlay = popupContainer.querySelector<HTMLElement>('.ads-tooltip')!
  expect(overlay).toHaveTextContent('Layer')
  expect(overlay.style.zIndex).toBe('1234')
  expect(result.container.querySelector('.ads-tooltip')).toBeFalsy()
})
```

- [ ] **Step 2: Run Tooltip test to verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- tooltip.test.tsx
```

Expected: FAIL because Tooltip props do not include `zIndex`/`getPopupContainer` and overlay does not use them.

- [ ] **Step 3: Implement Tooltip support**

In `packages/components/src/tooltip/interface.ts`, add:

```ts
zIndex?: number
getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
```

In `packages/components/src/tooltip/tooltip.tsx`:

- import `ZIndexContext, useZIndex` from `../shared/z-index`;
- include `'zIndex'` and `'getPopupContainer'` in `splitProps`;
- add `const [zIndex, contextZIndex] = useZIndex('Tooltip', local.zIndex)` after config/prefix setup;
- use `<InternalPortal mount={() => local.getPopupContainer?.(triggerRef) ?? config.getPopupContainer?.(triggerRef)}>`;
- wrap the overlay `div` with `<ZIndexContext.Provider value={contextZIndex}>`;
- set overlay style to `{ ...position(), 'z-index': zIndex, ...local.overlayStyle }`.

In `packages/components/src/tooltip/tooltip.style.ts`, remove the hardcoded `'z-index': 1070` entry from the root tooltip style.

- [ ] **Step 4: Run Tooltip test to verify it passes**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- tooltip.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Write failing Popover custom z-index/container test**

Append to `packages/components/src/popover/__tests__/popover.test.tsx`:

```tsx
it('uses explicit zIndex and custom popup container', () => {
  const popupContainer = document.createElement('div')
  document.body.appendChild(popupContainer)
  const result = render(() => (
    <Popover content="Layer" open zIndex={1235} getPopupContainer={() => popupContainer}>
      <button>trigger</button>
    </Popover>
  ))

  const overlay = popupContainer.querySelector<HTMLElement>('.ads-popover')!
  expect(overlay).toHaveTextContent('Layer')
  expect(overlay.style.zIndex).toBe('1235')
  expect(result.container.querySelector('.ads-popover')).toBeFalsy()
})
```

- [ ] **Step 6: Run Popover test to verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- popover.test.tsx
```

Expected: FAIL before implementation.

- [ ] **Step 7: Implement Popover support**

Mirror Tooltip changes in `packages/components/src/popover/interface.ts` and `packages/components/src/popover/popover.tsx`, using `useZIndex('Popover', local.zIndex)`, provider value `contextZIndex`, portal mount from local/config, and style `{ ...position(), 'z-index': zIndex, ...local.overlayStyle }`.

Remove hardcoded `'z-index': 1030` from `packages/components/src/popover/popover.style.ts`.

- [ ] **Step 8: Run Popover test to verify it passes**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- popover.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Write failing Popconfirm custom z-index/container test**

Append to `packages/components/src/popconfirm/__tests__/popconfirm.test.tsx`:

```tsx
it('uses explicit zIndex and custom popup container', () => {
  const popupContainer = document.createElement('div')
  document.body.appendChild(popupContainer)
  render(() => (
    <Popconfirm
      title="Delete?"
      open
      zIndex={1236}
      getPopupContainer={() => popupContainer}
    >
      <button>trigger</button>
    </Popconfirm>
  ))

  const overlay = popupContainer.querySelector<HTMLElement>('.ads-popconfirm')!
  expect(overlay).toHaveTextContent('Delete?')
  expect(overlay.style.zIndex).toBe('1236')
})
```

- [ ] **Step 10: Run Popconfirm test to verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- popconfirm.test.tsx
```

Expected: FAIL before implementation.

- [ ] **Step 11: Implement Popconfirm support**

Add `zIndex` and `getPopupContainer` to `packages/components/src/popconfirm/interface.ts`. In `popconfirm.tsx`, import and use `useZIndex('Popconfirm', local.zIndex)`, pass the resolved mount to `InternalPortal`, wrap overlay in `ZIndexContext.Provider`, and merge style with `'z-index': zIndex`. Remove hardcoded `'z-index': 1030` from `popconfirm.style.ts`.

- [ ] **Step 12: Run Popconfirm test to verify it passes**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- popconfirm.test.tsx
```

Expected: PASS.

- [ ] **Step 13: Write failing ColorPicker custom z-index/container test**

Append to `packages/components/src/color-picker/__tests__/color-picker.test.tsx` in the popup describe block:

```tsx
it('uses explicit zIndex and custom popup container', () => {
  const popupContainer = document.createElement('div')
  document.body.appendChild(popupContainer)
  render(() => (
    <ColorPicker open zIndex={1237} getPopupContainer={() => popupContainer} />
  ))

  const popup = popupContainer.querySelector<HTMLElement>('.ads-color-picker-popup')!
  expect(popup).toBeTruthy()
  expect(popup.style.zIndex).toBe('1237')
})
```

- [ ] **Step 14: Run ColorPicker test to verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- color-picker.test.tsx
```

Expected: FAIL before implementation.

- [ ] **Step 15: Implement ColorPicker support**

Add `zIndex` and `getPopupContainer` to `packages/components/src/color-picker/interface.ts`. In `color-picker.tsx`, include them in split props, import `ZIndexContext/useZIndex`, compute `useZIndex('ColorPicker', local.zIndex)`, pass resolved mount to `InternalPortal`, wrap popup content in provider, and merge style with `'z-index': zIndex` before `local.popupStyle`. Remove hardcoded `'z-index': 1050` from `color-picker.style.ts`.

- [ ] **Step 16: Run container overlay tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- tooltip.test.tsx popover.test.tsx popconfirm.test.tsx color-picker.test.tsx
```

Expected: PASS.

- [ ] **Step 17: Commit container overlay support**

```bash
git add packages/components/src/tooltip packages/components/src/popover packages/components/src/popconfirm packages/components/src/color-picker
git commit -m "feat: apply contextual z-index to container overlays"
```

---

### Task 3: Dropdown uses consumer z-index and popup containers

**Files:**
- Modify: `packages/components/src/dropdown/interface.ts`
- Modify: `packages/components/src/dropdown/dropdown.tsx`
- Modify: `packages/components/src/dropdown/dropdown.style.ts`
- Test: `packages/components/src/dropdown/__tests__/dropdown.test.tsx`

- [ ] **Step 1: Write failing Dropdown z-index/container test**

Append to `packages/components/src/dropdown/__tests__/dropdown.test.tsx`:

```tsx
it('uses explicit zIndex and custom popup container', () => {
  const popupContainer = document.createElement('div')
  document.body.appendChild(popupContainer)
  render(() => (
    <Dropdown
      open
      zIndex={1240}
      getPopupContainer={() => popupContainer}
      menu={{ items: [{ key: 'one', label: 'One' }] }}
    >
      <button>trigger</button>
    </Dropdown>
  ))

  const overlay = popupContainer.querySelector<HTMLElement>('.ads-dropdown')!
  expect(overlay).toHaveTextContent('One')
  expect(overlay.style.zIndex).toBe('1240')
})
```

- [ ] **Step 2: Run Dropdown test to verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- dropdown.test.tsx
```

Expected: FAIL before implementation.

- [ ] **Step 3: Implement Dropdown support**

Add `zIndex?: number` and `getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement` to `packages/components/src/dropdown/interface.ts`. In `dropdown.tsx`, include props in split, import `useZIndex`, compute `const [zIndex] = useZIndex('Dropdown', local.zIndex)`, pass resolved mount to `InternalPortal`, and merge style as `{ ...position(), 'z-index': zIndex, ...local.overlayStyle }`. Remove any hardcoded dropdown z-index in `dropdown.style.ts` if present.

- [ ] **Step 4: Run Dropdown tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- dropdown.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit Dropdown support**

```bash
git add packages/components/src/dropdown
git commit -m "feat: apply contextual z-index to dropdown"
```

---

### Task 4: Select-like dropdowns portal to body with fixed positioning

**Files:**
- Modify: `packages/components/src/select/interface.ts`
- Modify: `packages/components/src/select/select.tsx`
- Modify: `packages/components/src/select/select.style.ts`
- Test: `packages/components/src/select/__tests__/select.test.tsx`
- Modify: `packages/components/src/tree-select/interface.ts`
- Modify: `packages/components/src/tree-select/tree-select.tsx`
- Modify: `packages/components/src/tree-select/tree-select.style.ts`
- Test: `packages/components/src/tree-select/__tests__/tree-select.test.tsx`
- Modify: `packages/components/src/time-picker/interface.ts`
- Modify: `packages/components/src/time-picker/time-picker.tsx`
- Modify: `packages/components/src/time-picker/time-picker.style.ts`
- Test: `packages/components/src/time-picker/__tests__/time-picker.test.tsx`

- [ ] **Step 1: Write failing Select portal/fixed-position test**

Append to `packages/components/src/select/__tests__/select.test.tsx`:

```tsx
it('renders dropdown in a portal with fixed positioning and explicit zIndex', () => {
  const result = render(() => (
    <Select
      open
      zIndex={1301}
      options={[{ value: 'one', label: 'One' }]}
      style={{ width: '200px' }}
    />
  ))
  const selector = result.container.querySelector('.ads-select-selector') as HTMLElement
  selector.getBoundingClientRect = () =>
    ({ top: 10, bottom: 42, left: 20, right: 220, width: 200, height: 32, x: 20, y: 10, toJSON: () => ({}) }) as DOMRect

  fireEvent.click(selector)

  const dropdown = document.body.querySelector<HTMLElement>('.ads-select-dropdown')!
  expect(dropdown).toBeTruthy()
  expect(result.container.querySelector('.ads-select-dropdown')).toBeFalsy()
  expect(dropdown.style.position).toBe('fixed')
  expect(dropdown.style.zIndex).toBe('1301')
})
```

Ensure the file imports `fireEvent` if it does not already:

```ts
import { fireEvent, render } from '@solidjs/testing-library'
```

- [ ] **Step 2: Run Select test to verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- select.test.tsx
```

Expected: FAIL because Select dropdown is inline and props are missing.

- [ ] **Step 3: Implement Select portal dropdown**

Add to `packages/components/src/select/interface.ts`:

```ts
zIndex?: number
getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
```

In `select.tsx`:

- import `createRenderEffect` if not present;
- import `InternalPortal, canUseDom` from `../shared/portal`;
- import `useZIndex` from `../shared/z-index`;
- add `zIndex` and `getPopupContainer` to split props;
- add `const [dropdownPosition, setDropdownPosition] = createSignal<JSX.CSSProperties>({})`;
- add `let selectorRef: HTMLDivElement | undefined`;
- set selector `ref={(element) => (selectorRef = element)}`;
- compute `const [dropdownZIndex] = useZIndex('SelectLike', local.zIndex)`;
- define:

```ts
function updateDropdownPosition(): void {
  if (!canUseDom() || !selectorRef) return
  const rect = selectorRef.getBoundingClientRect()
  setDropdownPosition({
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    'z-index': dropdownZIndex,
  })
}
```

- call `updateDropdownPosition()` before opening in `setOpen(true)`;
- add `createRenderEffect(() => { if (open()) updateDropdownPosition() })`;
- render dropdown inside:

```tsx
<Show when={open()}>
  <InternalPortal mount={() => local.getPopupContainer?.(selectorRef) ?? config.getPopupContainer?.(selectorRef)}>
    <div role="listbox" class={`${prefixCls()}-dropdown`} style={dropdownPosition()}>
      ...existing options...
    </div>
  </InternalPortal>
</Show>
```

In `select.style.ts`, change dropdown style from `position: 'absolute'`, `top`, `left`, `right`, and hardcoded z-index to styles compatible with fixed portal: keep padding, border, radius, background, shadow, and remove inline-layout positioning defaults that conflict.

- [ ] **Step 4: Run Select tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- select.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Write failing TreeSelect portal/fixed-position test**

Append to `packages/components/src/tree-select/__tests__/tree-select.test.tsx`:

```tsx
it('renders dropdown in a portal with fixed positioning and explicit zIndex', () => {
  const result = render(() => (
    <TreeSelect open zIndex={1302} treeData={[{ value: 'one', title: 'One' }]} />
  ))
  const selector = result.container.querySelector('.ads-tree-select-selector') as HTMLElement
  selector.getBoundingClientRect = () =>
    ({ top: 10, bottom: 42, left: 20, right: 220, width: 200, height: 32, x: 20, y: 10, toJSON: () => ({}) }) as DOMRect

  fireEvent.click(selector)

  const dropdown = document.body.querySelector<HTMLElement>('.ads-tree-select-dropdown')!
  expect(dropdown).toBeTruthy()
  expect(result.container.querySelector('.ads-tree-select-dropdown')).toBeFalsy()
  expect(dropdown.style.position).toBe('fixed')
  expect(dropdown.style.zIndex).toBe('1302')
})
```

Ensure `fireEvent` is imported.

- [ ] **Step 6: Run TreeSelect test to verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- tree-select.test.tsx
```

Expected: FAIL before implementation.

- [ ] **Step 7: Implement TreeSelect portal dropdown**

Mirror the Select implementation in `tree-select/interface.ts` and `tree-select.tsx`, using `useZIndex('SelectLike', local.zIndex)`, selector ref, fixed dropdown position, and `InternalPortal` mount. Remove `position: absolute`, hardcoded `z-index`, `top`, `left`, and `right` from `tree-select.style.ts` dropdown styles.

- [ ] **Step 8: Run TreeSelect tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- tree-select.test.tsx
```

Expected: PASS.

- [ ] **Step 9: Write failing TimePicker portal/fixed-position test**

Append to `packages/components/src/time-picker/__tests__/time-picker.test.tsx`:

```tsx
it('renders dropdown in a portal with fixed positioning and explicit zIndex', () => {
  const result = render(() => <TimePicker open zIndex={1303} />)
  const selector = result.container.querySelector('.ads-time-picker-selector') as HTMLElement
  selector.getBoundingClientRect = () =>
    ({ top: 10, bottom: 42, left: 20, right: 220, width: 200, height: 32, x: 20, y: 10, toJSON: () => ({}) }) as DOMRect

  fireEvent.click(selector)

  const dropdown = document.body.querySelector<HTMLElement>('.ads-time-picker-dropdown')!
  expect(dropdown).toBeTruthy()
  expect(result.container.querySelector('.ads-time-picker-dropdown')).toBeFalsy()
  expect(dropdown.style.position).toBe('fixed')
  expect(dropdown.style.zIndex).toBe('1303')
})
```

Ensure `fireEvent` is imported.

- [ ] **Step 10: Run TimePicker test to verify it fails**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- time-picker.test.tsx
```

Expected: FAIL before implementation.

- [ ] **Step 11: Implement TimePicker portal dropdown**

Mirror the Select implementation in `time-picker/interface.ts` and `time-picker.tsx`, using `useZIndex('SelectLike', local.zIndex)`, selector ref, fixed dropdown position, and `InternalPortal` mount. Remove `position: absolute`, hardcoded `z-index`, `top`, `left`, and `right` from `time-picker.style.ts` dropdown styles.

- [ ] **Step 12: Run select-like tests**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- select.test.tsx tree-select.test.tsx time-picker.test.tsx
```

Expected: PASS.

- [ ] **Step 13: Commit select-like portal support**

```bash
git add packages/components/src/select packages/components/src/tree-select packages/components/src/time-picker
git commit -m "feat: portal select-like dropdowns"
```

---

### Task 5: Nested overlay integration

**Files:**
- Test: `packages/components/src/popover/__tests__/popover.test.tsx`
- Possibly modify: `packages/components/src/shared/z-index.ts`

- [ ] **Step 1: Write failing nested Popover + Select z-index test**

Append to `packages/components/src/popover/__tests__/popover.test.tsx`:

```tsx
it('renders a nested select dropdown above the popover overlay', () => {
  render(() => (
    <Popover
      open
      content={
        <Select
          open
          options={[{ value: 'one', label: 'One' }]}
        />
      }
    >
      <button>trigger</button>
    </Popover>
  ))

  const popover = document.body.querySelector<HTMLElement>('.ads-popover')!
  const dropdown = document.body.querySelector<HTMLElement>('.ads-select-dropdown')!

  expect(Number(dropdown.style.zIndex)).toBeGreaterThan(Number(popover.style.zIndex))
})
```

Add `Select` import at the top:

```ts
import { Select } from '../../select'
```

- [ ] **Step 2: Run nested test to verify it fails if context is incorrect**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- popover.test.tsx
```

Expected: PASS if previous tasks correctly provided context through portaled content; FAIL if Select cannot consume `ZIndexContext` from Popover.

- [ ] **Step 3: Fix context flow only if the test fails**

If the test fails because Select gets standalone z-index rather than parent z-index, move `ZIndexContext.Provider` in `Popover` so it wraps both the overlay content and any descendants rendered by Solid context. The desired structure is:

```tsx
<ZIndexContext.Provider value={contextZIndex}>
  <div class={...} style={{ ...position(), 'z-index': zIndex, ...local.overlayStyle }}>
    ...
  </div>
</ZIndexContext.Provider>
```

Ensure the `Select` content is created inside this provider in the rendered JSX.

- [ ] **Step 4: Run nested test to verify it passes**

Run:

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm --filter @ant-design-solid/core test -- popover.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Commit nested overlay integration**

```bash
git add packages/components/src/popover/__tests__/popover.test.tsx packages/components/src/popover/popover.tsx packages/components/src/shared/z-index.ts
git commit -m "test: cover nested overlay z-index ordering"
```

---

### Task 6: Full verification and cleanup

**Files:**
- Review all changed files under `packages/components/src` and `docs/superpowers/plans/2026-06-05-overlay-z-index.md`.

- [ ] **Step 1: Run filename rule check**

Run:

```bash
find apps packages -type f \( -name '*.ts' -o -name '*.tsx' \) | awk -F/ '{name=$NF; if (name !~ /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+(-[a-z0-9]+)*)*\.tsx?$/) print}'
```

Expected: no output.

- [ ] **Step 2: Run lint**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm lint
```

Expected: exit 0.

- [ ] **Step 3: Run format check**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm format:check
```

Expected: exit 0.

- [ ] **Step 4: Run typecheck**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r typecheck
```

Expected: exit 0.

- [ ] **Step 5: Run tests**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r test
```

Expected: exit 0.

- [ ] **Step 6: Run build**

```bash
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm -r build
```

Expected: exit 0.

- [ ] **Step 7: Commit final cleanup if needed**

If any fixes were made during verification:

```bash
git add <fixed-files>
git commit -m "fix: finalize overlay z-index integration"
```

