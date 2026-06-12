import {
  For,
  Show,
  children,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  splitProps,
} from 'solid-js'
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
  SplitterCollapsibleIconMode,
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

function mergeStyles(
  ...styles: Array<JSX.CSSProperties | string | undefined>
): JSX.CSSProperties | undefined {
  const merged = Object.assign(
    {},
    ...styles.filter(
      (style): style is JSX.CSSProperties => Boolean(style) && typeof style === 'object',
    ),
  )
  return Object.keys(merged).length ? merged : undefined
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

function numberSizes(sizes: SplitterSize[]): number[] {
  return sizes.map((size) => numericSize(size) ?? 0)
}

function isCollapsed(size: SplitterSize | undefined) {
  return numericSize(size) === 0
}

function collapsibleMode(panel: SplitterPanelProps, edge: 'start' | 'end') {
  const config = panel.collapsible
  if (config === true) return true
  if (!config || typeof config === 'boolean') return false
  return config[edge] === true
}

function showCollapsibleIcon(panel: SplitterPanelProps): SplitterCollapsibleIconMode {
  const config = panel.collapsible
  if (!config || typeof config === 'boolean') return true
  return config.showCollapsibleIcon ?? true
}

function draggerClassName(value: SplitterProps['classNames'], active: boolean) {
  const dragger = value?.dragger
  if (typeof dragger === 'string') return dragger
  return classNames(dragger?.default, active && dragger?.active)
}

function draggerStyle(value: SplitterProps['styles'], active: boolean) {
  const dragger = value?.dragger
  return mergeStyles(dragger?.default, active ? dragger?.active : undefined)
}

export const SplitterPanel = ((props: SplitterPanelProps) =>
  ({ [PANEL_MARK]: true, props }) as unknown as JSX.Element) as SplitterPanelComponent

export function SplitterRoot(props: SplitterProps) {
  const [local, rest] = splitProps(props, [
    'layout',
    'orientation',
    'vertical',
    'classNames',
    'styles',
    'collapsible',
    'collapsibleIcon',
    'destroyOnHidden',
    'draggerIcon',
    'lazy',
    'onDraggerDoubleClick',
    'onResizeStart',
    'onResize',
    'onResizeEnd',
    'onCollapse',
    'children',
    'class',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-splitter`
  const [, hashId] = useSplitterStyle(prefixCls())
  const resolvedChildren = children(() => local.children)
  const layout = () =>
    local.orientation ?? local.layout ?? (local.vertical ? 'vertical' : 'horizontal')
  const panels = createMemo(() =>
    toArray<unknown>(resolvedChildren())
      .filter(isPanelElement)
      .map((item) => item.props),
  )
  const initialSizes = () => panels().map(panelBaseSize)
  const [innerSizes, setInnerSizes] = createSignal<SplitterSize[]>(initialSizes())
  const [activeBar, setActiveBar] = createSignal<number | undefined>()
  const [lazyOffset, setLazyOffset] = createSignal<{ index: number; offset: number }>()
  const [oldSizes, setOldSizes] = createSignal<Record<number, number>>({})
  const panelRefs: Array<HTMLDivElement | undefined> = []
  let cleanupDrag: (() => void) | undefined

  onCleanup(() => cleanupDrag?.())

  createEffect(() => {
    const next = initialSizes()
    setInnerSizes((current) => (current.length === next.length ? current : next))
  })

  const rootStyle = () => mergeStyles(local.styles?.root, local.style)
  const resolvedCollapsibleIcon = () => local.collapsible?.icon ?? local.collapsibleIcon
  const mergedSizes = () =>
    panels().map((panel, index) => panel.size ?? innerSizes()[index] ?? panel.defaultSize)
  const mergedNumberSizes = () => numberSizes(mergedSizes())

  const currentSizes = () =>
    panels().map((panel, index) => {
      const mergedSize = mergedSizes()[index]
      return typeof mergedSize === 'number'
        ? mergedSize
        : getPanelPixelSize(panelRefs[index], layout())
    })

  const commitPair = (barIndex: number, nextPreviousSize: number, nextNextSize: number) => {
    const nextSizes = [...mergedSizes()]
    nextSizes[barIndex] = nextPreviousSize
    nextSizes[barIndex + 1] = nextNextSize
    setInnerSizes(nextSizes)
    local.onResize?.(numberSizes(nextSizes))
    return nextSizes
  }

  const updatePair = (barIndex: number, nextPreviousSize: number, nextNextSize: number) => {
    if (local.lazy) {
      setLazyOffset({
        index: barIndex,
        offset: nextPreviousSize - currentSizes()[barIndex],
      })
      return mergedSizes()
    }
    return commitPair(barIndex, nextPreviousSize, nextNextSize)
  }

  const stopDrag = () => {
    cleanupDrag?.()
    cleanupDrag = undefined
    setActiveBar(undefined)
    setLazyOffset(undefined)
  }

  const startDrag = (event: PointerEvent, barIndex: number) => {
    if (!isResizable(panels()[barIndex], panels()[barIndex + 1])) return
    event.preventDefault()
    const startPosition = getPointerPosition(event, layout())
    const startSizes = currentSizes()
    setActiveBar(barIndex)
    setLazyOffset(undefined)
    local.onResizeStart?.(startSizes)
    let latestPair: [number, number] | undefined

    const onPointerMove = (moveEvent: PointerEvent) => {
      const delta = getPointerPosition(moveEvent, layout()) - startPosition
      const [nextPreviousSize, nextNextSize] = resizePair(
        startSizes[barIndex],
        startSizes[barIndex + 1],
        delta,
        panels()[barIndex],
        panels()[barIndex + 1],
      )
      latestPair = [nextPreviousSize, nextNextSize]
      updatePair(barIndex, nextPreviousSize, nextNextSize)
    }
    const onPointerUp = () => {
      if (local.lazy && latestPair) {
        commitPair(barIndex, latestPair[0], latestPair[1])
      }
      local.onResizeEnd?.(
        local.lazy && latestPair ? numberSizes(mergedSizes()) : mergedNumberSizes(),
      )
      stopDrag()
    }
    document.addEventListener('pointermove', onPointerMove)
    document.addEventListener('pointerup', onPointerUp)
    cleanupDrag = () => {
      document.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerup', onPointerUp)
    }
  }

  const collapsePair = (barIndex: number, targetIndex: number) => {
    const sizes = currentSizes()
    const current = sizes[targetIndex]
    const neighborIndex = targetIndex === barIndex ? barIndex + 1 : barIndex
    const nextSizes = [...mergedSizes()]
    const oldSize = oldSizes()[targetIndex] ?? current

    if (isCollapsed(nextSizes[targetIndex])) {
      nextSizes[targetIndex] = oldSize || 100
      nextSizes[neighborIndex] = Math.max(0, sizes[neighborIndex] - (oldSize || 100))
    } else {
      setOldSizes((value) => ({ ...value, [targetIndex]: current }))
      nextSizes[targetIndex] = 0
      nextSizes[neighborIndex] = sizes[neighborIndex] + current
    }

    setInnerSizes(nextSizes)
    local.onCollapse?.(nextSizes.map(isCollapsed), numberSizes(nextSizes))
  }

  const shouldDestroyPanel = (panel: SplitterPanelProps, index: number) =>
    isCollapsed(mergedSizes()[index]) && (panel.destroyOnHidden ?? local.destroyOnHidden) === true

  const shouldRenderCollapseButton = (
    panel: SplitterPanelProps,
    edge: 'start' | 'end',
    index: number,
  ) => {
    if (!collapsibleMode(panel, edge)) return false
    const mode = showCollapsibleIcon(panel)
    if (mode === false) return false
    if (mode === 'auto') return activeBar() === index || isCollapsed(mergedSizes()[index])
    return true
  }

  const panelStyle = (panel: SplitterPanelProps, index: number): JSX.CSSProperties => {
    const size = mergedSizes()[index]
    return {
      flex: size === undefined ? '1 1 0' : `0 0 ${formatSize(size)}`,
      'flex-basis': formatSize(size),
      ...local.styles?.panel,
      ...(typeof panel.style === 'object' ? panel.style : undefined),
    }
  }

  const draggerOffsetStyle = (index: number): JSX.CSSProperties | undefined => {
    const offset = lazyOffset()
    if (!offset || offset.index !== index) return undefined
    return layout() === 'vertical'
      ? { transform: `translateY(${offset.offset}px)` }
      : { transform: `translateX(${offset.offset}px)` }
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${layout()}`,
        local.collapsible?.motion && `${prefixCls()}-motion`,
        hashId(),
        local.classNames?.root,
        local.class,
      )}
      style={rootStyle()}
    >
      <For each={panels()}>
        {(panel, index) => (
          <>
            <div
              class={classNames(
                `${prefixCls()}-panel`,
                isCollapsed(mergedSizes()[index()]) && `${prefixCls()}-panel-hidden`,
                local.classNames?.panel,
                panel.class,
              )}
              classList={panel.classList}
              style={panelStyle(panel, index())}
              ref={(element) => {
                panelRefs[index()] = element
              }}
            >
              <Show when={!shouldDestroyPanel(panel, index())}>{panel.children}</Show>
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
                  draggerClassName(local.classNames, activeBar() === index()),
                )}
                style={mergeStyles(
                  draggerStyle(local.styles, activeBar() === index()),
                  draggerOffsetStyle(index()),
                )}
                onDblClick={() => local.onDraggerDoubleClick?.(index())}
                onPointerDown={withBarIndex(index(), startDrag)}
              >
                <span class={`${prefixCls()}-bar-icon`}>{local.draggerIcon}</span>
                <Show when={shouldRenderCollapseButton(panel, 'end', index())}>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={
                      isCollapsed(mergedSizes()[index()])
                        ? 'Expand previous panel'
                        : 'Collapse previous panel'
                    }
                    class={`${prefixCls()}-collapse ${prefixCls()}-collapse-start`}
                    onClick={(event) => {
                      event.stopPropagation()
                      collapsePair(index(), index())
                    }}
                  >
                    {resolvedCollapsibleIcon()?.start ??
                      (isCollapsed(mergedSizes()[index()]) ? '>' : '<')}
                  </span>
                </Show>
                <Show
                  when={shouldRenderCollapseButton(panels()[index() + 1], 'start', index() + 1)}
                >
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={
                      isCollapsed(mergedSizes()[index() + 1])
                        ? 'Expand next panel'
                        : 'Collapse next panel'
                    }
                    class={`${prefixCls()}-collapse ${prefixCls()}-collapse-end`}
                    onClick={(event) => {
                      event.stopPropagation()
                      collapsePair(index(), index() + 1)
                    }}
                  >
                    {resolvedCollapsibleIcon()?.end ??
                      (isCollapsed(mergedSizes()[index() + 1]) ? '<' : '>')}
                  </span>
                </Show>
              </button>
            )}
          </>
        )}
      </For>
    </div>
  )
}
