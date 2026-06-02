import { For, Show, createSignal, onCleanup, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useSliderStyle } from './slider.style'
import type { SliderMark, SliderMarkObject, SliderProps, SliderValue } from './interface'

const DEFAULT_MIN = 0
const DEFAULT_MAX = 100
const DEFAULT_STEP = 1
const DEFAULT_RANGE_VALUE: [number, number] = [25, 75]

type HandleIndex = 0 | 1

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function getPrecision(value: number): number {
  const text = String(value)
  if (text.includes('e-')) return Number(text.split('e-')[1]) || 0
  const decimal = text.split('.')[1]
  return decimal ? decimal.length : 0
}

function snapValue(value: number, min: number, max: number, step: number): number {
  const clamped = clamp(value, min, max)
  if (!(step > 0)) return clamped

  const steps = Math.round((clamped - min) / step)
  const precision = Math.max(getPrecision(step), getPrecision(min), getPrecision(max))
  return clamp(Number((min + steps * step).toFixed(precision)), min, max)
}

function normalizeSingle(
  value: SliderValue | undefined,
  min: number,
  max: number,
  step: number,
): number {
  const raw = Array.isArray(value) ? value[0] : value
  const numeric = Number(raw)
  return snapValue(Number.isFinite(numeric) ? numeric : min, min, max, step)
}

function normalizeRange(
  value: SliderValue | undefined,
  min: number,
  max: number,
  step: number,
): [number, number] {
  const raw = Array.isArray(value) ? value : DEFAULT_RANGE_VALUE
  const first = snapValue(Number.isFinite(Number(raw[0])) ? Number(raw[0]) : min, min, max, step)
  const second = snapValue(Number.isFinite(Number(raw[1])) ? Number(raw[1]) : max, min, max, step)
  return first <= second ? [first, second] : [second, first]
}

function percentOf(value: number, min: number, max: number): number {
  if (max <= min) return 0
  return ((value - min) / (max - min)) * 100
}

function isMarkObject(mark: SliderMark): mark is SliderMarkObject {
  return typeof mark === 'object' && mark !== null && 'label' in mark
}

function eventTargetElement(event: Pick<Event, 'currentTarget'>): HTMLElement | undefined {
  return event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined
}

export function Slider(props: SliderProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'min',
    'max',
    'step',
    'disabled',
    'range',
    'marks',
    'vertical',
    'tooltipVisible',
    'onChange',
    'onAfterChange',
    'class',
    'onKeyDown',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-slider`
  const [, hashId] = useSliderStyle(prefixCls())
  const [innerValue, setInnerValue] = createSignal<SliderValue>(
    local.defaultValue ?? (local.range ? DEFAULT_RANGE_VALUE : DEFAULT_MIN),
  )
  const [draggingHandle, setDraggingHandle] = createSignal<HandleIndex | undefined>()
  let railRef: HTMLDivElement | undefined
  let activePointerId: number | undefined

  const min = () => (Number.isFinite(Number(local.min)) ? Number(local.min) : DEFAULT_MIN)
  const max = () => {
    const next = Number.isFinite(Number(local.max)) ? Number(local.max) : DEFAULT_MAX
    return next > min() ? next : min()
  }
  const step = () => (Number.isFinite(Number(local.step)) ? Number(local.step) : DEFAULT_STEP)
  const disabled = () => Boolean(local.disabled)
  const isRange = () => Boolean(local.range)
  const mergedValue = (): SliderValue =>
    isRange()
      ? normalizeRange(local.value ?? innerValue(), min(), max(), step())
      : normalizeSingle(local.value ?? innerValue(), min(), max(), step())
  const values = (): [number, number] => {
    const value = mergedValue()
    return Array.isArray(value) ? value : [min(), value]
  }
  const marks = () => {
    const entries = Object.entries(local.marks ?? {})
      .map(([key, mark]) => ({ value: Number(key), mark }))
      .filter(({ value }) => Number.isFinite(value))
      .map(({ value, mark }) => ({ value: snapValue(value, min(), max(), step()), mark }))
      .sort((a, b) => a.value - b.value)
    return entries
  }

  function emitValue(nextValue: SliderValue, commit = false): void {
    const normalized = isRange()
      ? normalizeRange(nextValue, min(), max(), step())
      : normalizeSingle(nextValue, min(), max(), step())

    if (local.value === undefined) setInnerValue(normalized)
    local.onChange?.(normalized)
    if (commit) local.onAfterChange?.(normalized)
  }

  function updateHandle(handle: HandleIndex, next: number, commit = false): void {
    if (disabled()) return
    if (!isRange()) {
      emitValue(next, commit)
      return
    }

    const current = normalizeRange(mergedValue(), min(), max(), step())
    current[handle] = snapValue(next, min(), max(), step())
    emitValue(current[0] <= current[1] ? current : [current[1], current[0]], commit)
  }

  function valueFromPointer(event: PointerEvent): number {
    const rect = railRef?.getBoundingClientRect()
    if (!rect) return min()

    const ratio = local.vertical
      ? 1 - (event.clientY - rect.top) / (rect.height || 1)
      : (event.clientX - rect.left) / (rect.width || 1)
    return snapValue(min() + clamp(ratio, 0, 1) * (max() - min()), min(), max(), step())
  }

  function nearestHandle(next: number): HandleIndex {
    if (!isRange()) return 0
    const [start, end] = normalizeRange(mergedValue(), min(), max(), step())
    return Math.abs(next - start) <= Math.abs(next - end) ? 0 : 1
  }

  function removeDocumentListeners(): void {
    document.removeEventListener('pointermove', handleDocumentPointerMove)
    document.removeEventListener('pointerup', handleDocumentPointerUp)
    document.removeEventListener('pointercancel', handleDocumentPointerUp)
  }

  function handleDocumentPointerMove(event: PointerEvent): void {
    if (activePointerId !== undefined && event.pointerId !== activePointerId) return
    const handle = draggingHandle()
    if (handle === undefined) return
    updateHandle(handle, valueFromPointer(event))
  }

  function handleDocumentPointerUp(event: PointerEvent): void {
    if (activePointerId !== undefined && event.pointerId !== activePointerId) return
    const handle = draggingHandle()
    if (handle !== undefined) updateHandle(handle, valueFromPointer(event), true)
    setDraggingHandle(undefined)
    activePointerId = undefined
    removeDocumentListeners()
  }

  function startDrag(handle: HandleIndex, event: PointerEvent): void {
    if (disabled()) return
    event.preventDefault()
    activePointerId = event.pointerId
    setDraggingHandle(handle)
    const target = eventTargetElement(event)
    target?.setPointerCapture?.(event.pointerId)
    document.addEventListener('pointermove', handleDocumentPointerMove)
    document.addEventListener('pointerup', handleDocumentPointerUp)
    document.addEventListener('pointercancel', handleDocumentPointerUp)
  }

  function handleRailPointerDown(event: PointerEvent): void {
    if (disabled()) return
    const next = valueFromPointer(event)
    const handle = nearestHandle(next)
    updateHandle(handle, next)
    startDrag(handle, event)
  }

  function handleHandlePointerDown(handle: HandleIndex, event: PointerEvent): void {
    if (disabled()) return
    event.stopPropagation()
    startDrag(handle, event)
  }

  function keyboardNextValue(handle: HandleIndex, key: string): number | undefined {
    const current = isRange()
      ? normalizeRange(mergedValue(), min(), max(), step())[handle]
      : (mergedValue() as number)
    const smallStep = step() > 0 ? step() : 1
    const largeStep = smallStep * 10
    switch (key) {
      case 'ArrowRight':
      case 'ArrowUp':
        return current + smallStep
      case 'ArrowLeft':
      case 'ArrowDown':
        return current - smallStep
      case 'PageUp':
        return current + largeStep
      case 'PageDown':
        return current - largeStep
      case 'Home':
        return min()
      case 'End':
        return max()
      default:
        return undefined
    }
  }

  function handleKeyDown(handle: HandleIndex, event: KeyboardEvent): void {
    ;(local.onKeyDown as ((event: KeyboardEvent) => void) | undefined)?.(event)
    if (event.defaultPrevented || disabled()) return

    const next = keyboardNextValue(handle, event.key)
    if (next === undefined) return

    event.preventDefault()
    updateHandle(handle, next, true)
  }

  function renderTooltip(value: number) {
    return (
      <Show when={local.tooltipVisible}>
        <span class={`${prefixCls()}-tooltip`}>{value}</span>
      </Show>
    )
  }

  function handleStyle(value: number): JSX.CSSProperties {
    const percent = `${percentOf(value, min(), max())}%`
    return local.vertical ? { bottom: percent } : { left: percent }
  }

  function trackStyle(): JSX.CSSProperties {
    const [start, end] = values()
    const startPercent = percentOf(start, min(), max())
    const endPercent = percentOf(end, min(), max())
    return local.vertical
      ? { bottom: `${startPercent}%`, height: `${endPercent - startPercent}%` }
      : { left: `${startPercent}%`, width: `${endPercent - startPercent}%` }
  }

  function renderHandle(handle: HandleIndex, value: number, label: string) {
    return (
      <button
        type="button"
        role="slider"
        aria-label={label}
        aria-valuemin={min()}
        aria-valuemax={max()}
        aria-valuenow={value}
        aria-orientation={local.vertical ? 'vertical' : undefined}
        disabled={disabled()}
        class={classNames(
          `${prefixCls()}-handle`,
          draggingHandle() === handle && `${prefixCls()}-handle-dragging`,
        )}
        style={handleStyle(value)}
        onPointerDown={(event) => handleHandlePointerDown(handle, event)}
        onKeyDown={(event) => handleKeyDown(handle, event)}
      >
        {renderTooltip(value)}
      </button>
    )
  }

  onCleanup(removeDocumentListeners)

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        local.vertical && `${prefixCls()}-vertical`,
        disabled() && `${prefixCls()}-disabled`,
        hashId(),
        local.class,
      )}
      aria-disabled={disabled() || undefined}
    >
      <div
        ref={railRef}
        class={`${prefixCls()}-rail`}
        onPointerDown={handleRailPointerDown}
        aria-hidden="true"
      />
      <div class={`${prefixCls()}-track`} style={trackStyle()} aria-hidden="true" />
      <Show
        when={isRange()}
        fallback={renderHandle(0, normalizeSingle(mergedValue(), min(), max(), step()), 'Value')}
      >
        {renderHandle(0, values()[0], 'Minimum value')}
        {renderHandle(1, values()[1], 'Maximum value')}
      </Show>
      <Show when={marks().length > 0}>
        <div class={`${prefixCls()}-marks`} aria-hidden="true">
          <For each={marks()}>
            {({ value, mark }) => {
              const markStyle = () => {
                const percent = `${percentOf(value, min(), max())}%`
                const position = local.vertical ? { bottom: percent } : { left: percent }
                return { ...position, ...(isMarkObject(mark) ? mark.style : undefined) }
              }
              return (
                <span class={`${prefixCls()}-mark-text`} style={markStyle()}>
                  {isMarkObject(mark) ? mark.label : mark}
                </span>
              )
            }}
          </For>
        </div>
      </Show>
    </div>
  )
}
