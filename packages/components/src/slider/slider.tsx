import { For, Show, createMemo, createSignal, onCleanup, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useSliderStyle } from './slider.style'
import type {
  SliderMark,
  SliderMarkObject,
  SliderProps,
  SliderRangeConfig,
  SliderRef,
  SliderSemanticClassNames,
  SliderSemanticStyles,
  SliderValue,
} from './interface'

const DEFAULT_MIN = 0
const DEFAULT_MAX = 100
const DEFAULT_STEP = 1
const DEFAULT_RANGE_VALUE = [0, 0]

type DragState =
  | { type: 'handle'; index: number }
  | { type: 'track'; startPointerValue: number; startValues: number[] }

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function getPrecision(value: number): number {
  const text = String(value)
  if (text.includes('e-')) return Number(text.split('e-')[1]) || 0
  const decimal = text.split('.')[1]
  return decimal ? decimal.length : 0
}

function isMarkObject(mark: SliderMark): mark is SliderMarkObject {
  return typeof mark === 'object' && mark !== null && 'label' in mark
}

function numeric(value: unknown, fallback: number): number {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

function sortedUnique(values: number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b)
}

function assignRef(ref: SliderProps['ref'], value: SliderRef) {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(value)
    return
  }
  if (!('focus' in ref)) ref.current = value
  Object.assign(ref as object, value)
}

function eventTargetElement(event: Pick<Event, 'currentTarget'>): HTMLElement | undefined {
  return event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined
}

function mergeStyles(...values: Array<JSX.CSSProperties | string | undefined>) {
  return Object.assign({}, ...values.filter((value) => value && typeof value !== 'string'))
}

export function Slider(props: SliderProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'min',
    'max',
    'step',
    'disabled',
    'keyboard',
    'dots',
    'included',
    'range',
    'marks',
    'orientation',
    'vertical',
    'reverse',
    'tooltip',
    'tooltipVisible',
    'classNames',
    'styles',
    'ref',
    'class',
    'style',
    'onChange',
    'onChangeComplete',
    'onAfterChange',
    'onKeyDown',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-slider`
  const [, hashId] = useSliderStyle(prefixCls())
  const [innerValue, setInnerValue] = createSignal<SliderValue>(
    local.defaultValue ?? (local.range ? DEFAULT_RANGE_VALUE : DEFAULT_MIN),
  )
  const [dragState, setDragState] = createSignal<DragState>()
  let railRef: HTMLDivElement | undefined
  let rootRef: HTMLDivElement | undefined
  let activePointerId: number | undefined
  const handleRefs: Array<HTMLButtonElement | undefined> = []

  const min = () => numeric(local.min, DEFAULT_MIN)
  const max = () => {
    const next = numeric(local.max, DEFAULT_MAX)
    return next > min() ? next : min()
  }
  const rangeConfig = (): SliderRangeConfig =>
    typeof local.range === 'object' && local.range !== null ? local.range : {}
  const isRange = () => Boolean(local.range)
  const isEditable = () => Boolean(isRange() && rangeConfig().editable)
  const orientation = () => local.orientation ?? (local.vertical ? 'vertical' : 'horizontal')
  const isVertical = () => orientation() === 'vertical'
  const isReverse = () => Boolean(local.reverse)
  const disabled = () => Boolean(local.disabled)
  const keyboard = () => local.keyboard !== false
  const included = () => local.included !== false
  const semanticProps = (): SliderProps => ({
    ...props,
    orientation: orientation(),
    vertical: isVertical(),
  })
  const semanticClassNames = createMemo<SliderSemanticClassNames>(() =>
    typeof local.classNames === 'function'
      ? local.classNames({ props: semanticProps() })
      : (local.classNames ?? {}),
  )
  const semanticStyles = createMemo<SliderSemanticStyles>(() =>
    typeof local.styles === 'function'
      ? local.styles({ props: semanticProps() })
      : (local.styles ?? {}),
  )
  const markPoints = createMemo(() =>
    sortedUnique(
      Object.entries(local.marks ?? {})
        .map(([key]) => Number(key))
        .filter((value) => Number.isFinite(value) && value >= min() && value <= max()),
    ),
  )
  const stepValue = () => (Number.isFinite(Number(local.step)) ? Number(local.step) : DEFAULT_STEP)
  const snapPoints = () => {
    const points = markPoints()
    return sortedUnique([min(), max(), ...points])
  }

  function snapValue(value: number): number {
    const clamped = clamp(value, min(), max())
    const points = local.step === null || local.dots ? snapPoints() : []
    if (points.length > 0) {
      return points.reduce((nearest, point) =>
        Math.abs(point - clamped) < Math.abs(nearest - clamped) ? point : nearest,
      )
    }

    const step = stepValue()
    if (!(step > 0)) return clamped
    const steps = Math.round((clamped - min()) / step)
    const precision = Math.max(getPrecision(step), getPrecision(min()), getPrecision(max()))
    return clamp(Number((min() + steps * step).toFixed(precision)), min(), max())
  }

  function normalizeValues(value: SliderValue | undefined): number[] {
    const raw = value ?? (isRange() ? DEFAULT_RANGE_VALUE : DEFAULT_MIN)
    const values = Array.isArray(raw) ? raw : [raw]
    const normalized = values.map((item) => snapValue(numeric(item, min())))
    if (!isRange()) return [normalized[0] ?? min()]
    return sortedUnique(normalized.length > 0 ? normalized : DEFAULT_RANGE_VALUE.map(snapValue))
  }

  const values = () => normalizeValues(local.value ?? innerValue())
  const rangeValue = () => {
    const current = values()
    return current.length > 0 ? current : DEFAULT_RANGE_VALUE.map(snapValue)
  }

  function percentOf(value: number): number {
    if (max() <= min()) return 0
    return ((value - min()) / (max() - min())) * 100
  }

  function positionPercent(value: number): number {
    const percent = percentOf(value)
    return isReverse() ? 100 - percent : percent
  }

  function emitValue(nextValues: number[], commit = false): void {
    const normalizedValues = isRange()
      ? sortedUnique(nextValues.map(snapValue))
      : [snapValue(nextValues[0])]
    const normalized = isRange() ? normalizedValues : normalizedValues[0]
    if (local.value === undefined) setInnerValue(normalized)
    local.onChange?.(normalized)
    if (commit) {
      local.onChangeComplete?.(normalized)
      local.onAfterChange?.(normalized)
    }
  }

  function updateHandle(index: number, next: number, commit = false): void {
    if (disabled()) return
    if (!isRange()) {
      emitValue([next], commit)
      return
    }

    const current = rangeValue()
    current[index] = snapValue(next)
    emitValue(current, commit)
  }

  function valueFromPointer(event: PointerEvent): number {
    const rect = railRef?.getBoundingClientRect()
    if (!rect) return min()

    const rawRatio = isVertical()
      ? 1 - (event.clientY - rect.top) / (rect.height || 1)
      : (event.clientX - rect.left) / (rect.width || 1)
    const ratio = isReverse() ? 1 - rawRatio : rawRatio
    return snapValue(min() + clamp(ratio, 0, 1) * (max() - min()))
  }

  function nearestHandle(next: number): number {
    const current = values()
    let nearest = 0
    current.forEach((value, index) => {
      if (Math.abs(value - next) < Math.abs(current[nearest] - next)) nearest = index
    })
    return nearest
  }

  function removeDocumentListeners(): void {
    document.removeEventListener('pointermove', handleDocumentPointerMove)
    document.removeEventListener('pointerup', handleDocumentPointerUp)
    document.removeEventListener('pointercancel', handleDocumentPointerUp)
  }

  function handleDocumentPointerMove(event: PointerEvent): void {
    if (activePointerId !== undefined && event.pointerId !== activePointerId) return
    const state = dragState()
    if (!state) return
    if (state.type === 'handle') {
      updateHandle(state.index, valueFromPointer(event))
      return
    }

    const delta = valueFromPointer(event) - state.startPointerValue
    const start = state.startValues[0]
    const end = state.startValues[state.startValues.length - 1]
    const safeDelta = clamp(delta, min() - start, max() - end)
    emitValue(state.startValues.map((value) => value + safeDelta))
  }

  function handleDocumentPointerUp(event: PointerEvent): void {
    if (activePointerId !== undefined && event.pointerId !== activePointerId) return
    const state = dragState()
    if (state?.type === 'handle') updateHandle(state.index, valueFromPointer(event), true)
    if (state?.type === 'track') {
      const delta = valueFromPointer(event) - state.startPointerValue
      const start = state.startValues[0]
      const end = state.startValues[state.startValues.length - 1]
      const safeDelta = clamp(delta, min() - start, max() - end)
      emitValue(
        state.startValues.map((value) => value + safeDelta),
        true,
      )
    }
    setDragState(undefined)
    activePointerId = undefined
    removeDocumentListeners()
  }

  function startDrag(state: DragState, event: PointerEvent): void {
    if (disabled()) return
    event.preventDefault()
    activePointerId = event.pointerId
    setDragState(state)
    const target = eventTargetElement(event)
    target?.setPointerCapture?.(event.pointerId)
    document.addEventListener('pointermove', handleDocumentPointerMove)
    document.addEventListener('pointerup', handleDocumentPointerUp)
    document.addEventListener('pointercancel', handleDocumentPointerUp)
  }

  function handleRootPointerDown(event: PointerEvent): void {
    if (disabled()) return
    const next = valueFromPointer(event)
    if (
      isEditable() &&
      rangeValue().length < (rangeConfig().maxCount ?? Number.POSITIVE_INFINITY)
    ) {
      emitValue([...rangeValue(), next])
      startDrag({ type: 'handle', index: nearestHandle(next) }, event)
      return
    }

    const index = nearestHandle(next)
    updateHandle(index, next)
    startDrag({ type: 'handle', index }, event)
  }

  function handleTrackPointerDown(event: PointerEvent): void {
    if (!isRange() || !rangeConfig().draggableTrack || disabled()) return
    event.stopPropagation()
    startDrag(
      { type: 'track', startPointerValue: valueFromPointer(event), startValues: rangeValue() },
      event,
    )
  }

  function handleHandlePointerDown(index: number, event: PointerEvent): void {
    if (disabled()) return
    event.stopPropagation()
    startDrag({ type: 'handle', index }, event)
  }

  function handleHandleDoubleClick(index: number): void {
    if (!isEditable() || disabled()) return
    const current = rangeValue()
    const minCount = rangeConfig().minCount ?? 0
    if (current.length <= minCount) return
    emitValue(
      current.filter((_, itemIndex) => itemIndex !== index),
      true,
    )
  }

  function keyboardNextValue(index: number, key: string): number | undefined {
    const current = values()[index] ?? min()
    const smallStep =
      local.step === null || local.dots ? undefined : stepValue() > 0 ? stepValue() : 1
    const orderedPoints = snapPoints()
    const pointIndex = orderedPoints.findIndex((point) => point === current)

    switch (key) {
      case 'ArrowRight':
      case 'ArrowUp':
        if (smallStep === undefined)
          return orderedPoints[Math.min(orderedPoints.length - 1, Math.max(0, pointIndex) + 1)]
        return current + (isReverse() ? -smallStep : smallStep)
      case 'ArrowLeft':
      case 'ArrowDown':
        if (smallStep === undefined) return orderedPoints[Math.max(0, pointIndex - 1)]
        return current + (isReverse() ? smallStep : -smallStep)
      case 'PageUp':
        return current + (isReverse() ? -1 : 1) * (smallStep ?? stepValue()) * 10
      case 'PageDown':
        return current - (isReverse() ? -1 : 1) * (smallStep ?? stepValue()) * 10
      case 'Home':
        return isReverse() ? max() : min()
      case 'End':
        return isReverse() ? min() : max()
      default:
        return undefined
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent): void {
    ;(local.onKeyDown as ((event: KeyboardEvent) => void) | undefined)?.(event)
    if (event.defaultPrevented || disabled() || !keyboard()) return

    const next = keyboardNextValue(index, event.key)
    if (next === undefined) return

    event.preventDefault()
    updateHandle(index, next, true)
  }

  function tooltipOpen(): boolean {
    return Boolean(local.tooltip?.open ?? local.tooltipVisible)
  }

  function renderTooltip(value: number) {
    const content = () => local.tooltip?.formatter?.(value) ?? value
    return (
      <Show when={tooltipOpen() && content() !== null}>
        <span
          class={classNames(
            `${prefixCls()}-tooltip`,
            local.tooltip?.placement && `${prefixCls()}-tooltip-${local.tooltip.placement}`,
            semanticClassNames().tooltip,
            local.tooltip?.class,
          )}
          style={mergeStyles(semanticStyles().tooltip, local.tooltip?.style)}
        >
          {content()}
        </span>
      </Show>
    )
  }

  function handleStyle(value: number): JSX.CSSProperties {
    const percent = `${positionPercent(value)}%`
    return isVertical() ? { bottom: percent } : { left: percent }
  }

  function activeSegments(): Array<[number, number]> {
    const current = values()
    if (!included()) return [[current[0] ?? min(), current[0] ?? min()]]
    if (!isRange()) return [[min(), current[0]]]
    if (current.length < 2) return []
    const segments: Array<[number, number]> = []
    for (let index = 0; index < current.length - 1; index += 1) {
      segments.push([current[index], current[index + 1]])
    }
    return segments
  }

  function segmentStyle(start: number, end: number): JSX.CSSProperties {
    const startPercent = positionPercent(start)
    const endPercent = positionPercent(end)
    const low = Math.min(startPercent, endPercent)
    const high = Math.max(startPercent, endPercent)
    return isVertical()
      ? { bottom: `${low}%`, height: `${high - low}%` }
      : { left: `${low}%`, width: `${high - low}%` }
  }

  function renderHandle(value: number, index: number) {
    const dragging = () => {
      const state = dragState()
      return state?.type === 'handle' && state.index === index
    }
    const label = () =>
      isRange()
        ? isEditable()
          ? `Value ${index + 1}`
          : values().length === 2
            ? index === 0
              ? 'Minimum value'
              : 'Maximum value'
            : `Value ${index + 1}`
        : 'Value'
    return (
      <button
        ref={(el) => {
          handleRefs[index] = el
        }}
        type="button"
        role="slider"
        aria-label={label()}
        aria-valuemin={min()}
        aria-valuemax={max()}
        aria-valuenow={value}
        aria-orientation={orientation()}
        aria-disabled={disabled() ? 'true' : 'false'}
        disabled={disabled()}
        class={classNames(
          `${prefixCls()}-handle`,
          `${prefixCls()}-handle-${index + 1}`,
          dragging() && `${prefixCls()}-handle-dragging`,
          semanticClassNames().handle,
        )}
        style={mergeStyles(handleStyle(value), semanticStyles().handle)}
        onPointerDown={(event) => handleHandlePointerDown(index, event)}
        onDblClick={() => handleHandleDoubleClick(index)}
        onKeyDown={(event) => handleKeyDown(index, event)}
      >
        {renderTooltip(value)}
      </button>
    )
  }

  const sliderRef: SliderRef = {
    focus: () => handleRefs[0]?.focus(),
    blur: () => handleRefs.find((handle) => handle === document.activeElement)?.blur(),
    get nativeElement() {
      return rootRef
    },
  }
  assignRef(local.ref, sliderRef)
  onCleanup(removeDocumentListeners)

  return (
    <div
      {...rest}
      ref={(el) => {
        rootRef = el
      }}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${orientation()}`,
        isVertical() && `${prefixCls()}-vertical`,
        isReverse() && `${prefixCls()}-reverse`,
        disabled() && `${prefixCls()}-disabled`,
        hashId(),
        local.class,
        semanticClassNames().root,
      )}
      style={mergeStyles(semanticStyles().root, local.style)}
      aria-disabled={disabled() || undefined}
      onPointerDown={handleRootPointerDown}
    >
      <div
        ref={(el) => {
          railRef = el
        }}
        class={classNames(`${prefixCls()}-rail`, semanticClassNames().rail)}
        style={semanticStyles().rail}
        aria-hidden="true"
      />
      <div
        class={classNames(`${prefixCls()}-tracks`, semanticClassNames().tracks)}
        style={semanticStyles().tracks}
        aria-hidden="true"
      >
        <For each={activeSegments()}>
          {([start, end], index) => (
            <div
              class={classNames(
                `${prefixCls()}-track`,
                `${prefixCls()}-track-${index() + 1}`,
                semanticClassNames().track,
              )}
              style={mergeStyles(segmentStyle(start, end), semanticStyles().track)}
              onPointerDown={handleTrackPointerDown}
            />
          )}
        </For>
      </div>
      <Show when={markPoints().length > 0 || local.dots}>
        <div
          class={classNames(`${prefixCls()}-step`, semanticClassNames().step)}
          style={semanticStyles().step}
          aria-hidden="true"
        >
          <For each={snapPoints()}>
            {(point) => (
              <span
                class={classNames(`${prefixCls()}-dot`, semanticClassNames().dot)}
                style={mergeStyles(handleStyle(point), semanticStyles().dot)}
              />
            )}
          </For>
        </div>
      </Show>
      <For each={values().map((value, index) => ({ value, index }))}>
        {({ value, index }) => renderHandle(value, index)}
      </For>
      <Show when={markPoints().length > 0}>
        <div
          class={classNames(`${prefixCls()}-marks`, semanticClassNames().mark)}
          style={semanticStyles().mark}
          aria-hidden="true"
        >
          <For
            each={Object.entries(local.marks ?? {})
              .map(([key, mark]) => ({ value: Number(key), mark }))
              .filter(({ value }) => Number.isFinite(value) && value >= min() && value <= max())
              .sort((a, b) => a.value - b.value)}
          >
            {({ value, mark }) => (
              <span
                class={classNames(`${prefixCls()}-mark-text`, semanticClassNames().markText)}
                style={mergeStyles(
                  handleStyle(value),
                  isMarkObject(mark) ? mark.style : undefined,
                  semanticStyles().markText,
                )}
              >
                {isMarkObject(mark) ? mark.label : mark}
              </span>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}
