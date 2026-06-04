import { For, children, createMemo, createSignal, onCleanup, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useSplitterStyle } from './splitter.style'
import type { JSX } from 'solid-js'
import type {
  SplitterLayout,
  SplitterPanelElement,
  SplitterPanelComponent,
  SplitterPanelProps,
  SplitterProps,
  SplitterSize,
} from './interface'

const PANEL_MARK = '__ANT_DESIGN_SOLID_SPLITTER_PANEL'

function isPanelElement(value: unknown): value is SplitterPanelElement {
  return Boolean(
    value && typeof value === 'object' && (value as Record<string, unknown>)[PANEL_MARK] === true,
  )
}

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return []
  return Array.isArray(value) ? value : [value]
}

function formatSize(size: SplitterSize | undefined) {
  if (size === undefined) return undefined
  return typeof size === 'number' ? `${size}px` : size
}

function numericSize(size: SplitterSize | undefined) {
  if (typeof size === 'number') return size
  if (typeof size === 'string') {
    const parsed = Number.parseFloat(size)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

function clamp(value: number, min?: SplitterSize, max?: SplitterSize) {
  const minValue = numericSize(min)
  const maxValue = numericSize(max)
  let nextValue = value
  if (minValue !== undefined) nextValue = Math.max(nextValue, minValue)
  if (maxValue !== undefined) nextValue = Math.min(nextValue, maxValue)
  return nextValue
}

function resizePair(
  previous: number,
  next: number,
  delta: number,
  previousPanel: SplitterPanelProps,
  nextPanel: SplitterPanelProps,
): [number, number] {
  const total = previous + next
  let previousSize = clamp(previous + delta, previousPanel.min, previousPanel.max)
  const nextMax = numericSize(nextPanel.max)
  if (nextMax !== undefined) {
    previousSize = clamp(previousSize, total - nextMax, previousPanel.max)
  }
  previousSize = clamp(previousSize, previousPanel.min, previousPanel.max)
  let nextSize = total - previousSize
  nextSize = clamp(nextSize, nextPanel.min, nextPanel.max)
  previousSize = total - nextSize
  previousSize = clamp(previousSize, previousPanel.min, previousPanel.max)
  nextSize = total - previousSize
  return [previousSize, nextSize]
}

function panelBaseSize(panel: SplitterPanelProps) {
  return panel.size ?? panel.defaultSize
}

function isResizable(previousPanel: SplitterPanelProps, nextPanel: SplitterPanelProps) {
  return previousPanel.resizable !== false && nextPanel.resizable !== false
}

function getPointerPosition(event: PointerEvent, layout: SplitterLayout) {
  return layout === 'vertical' ? event.clientY : event.clientX
}

function withBarIndex(index: number, handler: (event: PointerEvent, index: number) => void) {
  return (event: PointerEvent) => handler(event, index)
}

function getPanelPixelSize(element: HTMLElement | undefined, layout: SplitterLayout) {
  if (!element) return 0
  const rect = element.getBoundingClientRect()
  const size = layout === 'vertical' ? rect.height : rect.width
  return size || numericSize(element.style.flexBasis) || 0
}

export const SplitterPanel = ((props: SplitterPanelProps) =>
  ({ [PANEL_MARK]: true, props }) as unknown as JSX.Element) as SplitterPanelComponent

export function SplitterRoot(props: SplitterProps) {
  const [local, rest] = splitProps(props, [
    'layout',
    'onResizeStart',
    'onResize',
    'onResizeEnd',
    'children',
    'class',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-splitter`
  const [, hashId] = useSplitterStyle(prefixCls())
  const resolvedChildren = children(() => local.children)
  const layout = () => local.layout ?? 'horizontal'
  const panels = createMemo(() =>
    toArray<unknown>(resolvedChildren())
      .filter(isPanelElement)
      .map((item) => item.props),
  )
  const initialSizes = () => panels().map(panelBaseSize)
  const [innerSizes, setInnerSizes] = createSignal<SplitterSize[]>(initialSizes())
  const [activeBar, setActiveBar] = createSignal<number | undefined>()
  const panelRefs: Array<HTMLDivElement | undefined> = []
  let cleanupDrag: (() => void) | undefined

  onCleanup(() => cleanupDrag?.())

  const mergedSizes = () =>
    panels().map((panel, index) => panel.size ?? innerSizes()[index] ?? panel.defaultSize)

  const currentSizes = () =>
    panels().map((panel, index) => {
      const mergedSize = mergedSizes()[index]
      return typeof mergedSize === 'number'
        ? mergedSize
        : getPanelPixelSize(panelRefs[index], layout())
    })

  const updatePair = (barIndex: number, nextPreviousSize: number, nextNextSize: number) => {
    const nextSizes = [...mergedSizes()]
    nextSizes[barIndex] = nextPreviousSize
    nextSizes[barIndex + 1] = nextNextSize
    setInnerSizes(nextSizes)
    local.onResize?.(nextSizes)
    return nextSizes
  }

  const stopDrag = () => {
    cleanupDrag?.()
    cleanupDrag = undefined
    setActiveBar(undefined)
  }

  const startDrag = (event: PointerEvent, barIndex: number) => {
    if (!isResizable(panels()[barIndex], panels()[barIndex + 1])) return
    event.preventDefault()
    const startPosition = getPointerPosition(event, layout())
    const startSizes = currentSizes()
    setActiveBar(barIndex)
    local.onResizeStart?.(startSizes)

    const onPointerMove = (moveEvent: PointerEvent) => {
      const delta = getPointerPosition(moveEvent, layout()) - startPosition
      const [nextPreviousSize, nextNextSize] = resizePair(
        startSizes[barIndex],
        startSizes[barIndex + 1],
        delta,
        panels()[barIndex],
        panels()[barIndex + 1],
      )
      updatePair(barIndex, nextPreviousSize, nextNextSize)
    }
    const onPointerUp = () => {
      local.onResizeEnd?.(mergedSizes())
      stopDrag()
    }
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
    cleanupDrag = () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
    }
  }

  const panelStyle = (panel: SplitterPanelProps, index: number): JSX.CSSProperties => {
    const size = mergedSizes()[index]
    return {
      flex: size === undefined ? '1 1 0' : `0 0 ${formatSize(size)}`,
      'flex-basis': formatSize(size),
      ...(typeof panel.style === 'object' ? panel.style : undefined),
    }
  }

  return (
    <div
      {...rest}
      class={classNames(prefixCls(), `${prefixCls()}-${layout()}`, hashId(), local.class)}
      style={local.style}
    >
      <For each={panels()}>
        {(panel, index) => (
          <>
            <div
              class={classNames(`${prefixCls()}-panel`, panel.class)}
              classList={panel.classList}
              style={panelStyle(panel, index())}
              ref={(element) => {
                panelRefs[index()] = element
              }}
            >
              {panel.children}
            </div>
            {index() < panels().length - 1 && isResizable(panel, panels()[index() + 1]) && (
              <button
                type="button"
                role="separator"
                aria-orientation={layout()}
                aria-label="Resize panels"
                class={classNames(
                  `${prefixCls()}-bar`,
                  activeBar() === index() && `${prefixCls()}-bar-active`,
                )}
                onPointerDown={withBarIndex(index(), startDrag)}
              />
            )}
          </>
        )}
      </For>
    </div>
  )
}
