import { ClockCircleOutlined, CloseCircleFilled } from '@ant-design-solid/icons'
import dayjs from 'dayjs'
import {
  For,
  Show,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  onCleanup,
  splitProps,
} from 'solid-js'
import type { JSX } from 'solid-js'
import { isServer } from 'solid-js/web'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { addDocumentPointerDown, addPositionUpdateListeners } from '../shared/overlay'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useZIndex } from '../shared/z-index'
import type {
  DisabledTimeConfig,
  TimePickerAllowClear,
  TimePickerCellRenderInfo,
  TimePickerFormat,
  TimePickerProps,
  TimePickerRangeValue,
  TimePickerRef,
  TimePickerSemanticSlot,
  TimePickerValue,
  TimeRangePickerProps,
} from './interface'
import { useTimePickerStyle } from './time-picker.style'

type TimeParts = {
  hour: number
  minute: number
  second: number
}

type ColumnType = 'hour' | 'minute' | 'second'
type RangeSide = 'start' | 'end'
type NullableTimeParts = Partial<TimeParts>

const DEFAULT_FORMAT = 'HH:mm:ss'
const TIME_ANCHOR = '2026-01-01'
const TIME_CELL_HEIGHT = 32

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

function readSegment(segment: string | undefined, min: number, max: number): number {
  const parsed = Number.parseInt(segment ?? '', 10)
  return clamp(parsed, min, max)
}

function normalizeStep(step: number | undefined): number {
  const parsed = Math.floor(Number(step))
  if (!Number.isFinite(parsed) || parsed < 1) return 1
  return Math.min(60, parsed)
}

function parseStringTime(value: string | undefined): TimeParts | undefined {
  if (!value) return undefined
  const [hour, minute, second] = value.split(':')
  return {
    hour: readSegment(hour, 0, 23),
    minute: readSegment(minute, 0, 59),
    second: readSegment(second, 0, 59),
  }
}

function valueToParts(value: TimePickerValue): TimeParts | undefined {
  if (!value) return undefined
  if (dayjs.isDayjs(value)) {
    return {
      hour: value.hour(),
      minute: value.minute(),
      second: value.second(),
    }
  }
  return parseStringTime(value)
}

function partsToDayjs(parts: TimeParts) {
  return dayjs(TIME_ANCHOR)
    .hour(parts.hour)
    .minute(parts.minute)
    .second(parts.second)
    .millisecond(0)
}

function formatParts(parts: TimeParts | undefined, format: TimePickerFormat): string {
  if (!parts) return ''
  return partsToDayjs(parts).format(format)
}

function range(max: number, step = 1): number[] {
  const values: number[] = []
  for (let value = 0; value <= max; value += step) values.push(value)
  return values
}

function includes(values: number[], value: number): boolean {
  return values.includes(value)
}

function assignPickerRef(
  ref: TimePickerProps['ref'] | TimeRangePickerProps['ref'],
  pickerRef: TimePickerRef,
): void {
  if (!ref) return
  if (typeof ref === 'function') ref(pickerRef)
  else {
    Object.assign(ref as object, pickerRef)
    if ('current' in ref) ref.current = pickerRef
  }
}

function allowClearIcon(allowClear: TimePickerAllowClear | undefined): JSX.Element {
  return typeof allowClear === 'object' && allowClear.clearIcon ? (
    allowClear.clearIcon
  ) : (
    <CloseCircleFilled />
  )
}

function semanticClass(
  slot: TimePickerSemanticSlot,
  classes: Partial<Record<TimePickerSemanticSlot, string>> | undefined,
  ...values: Array<string | false | null | undefined>
): string {
  return classNames(...values, classes?.[slot])
}

function semanticStyle(
  slot: TimePickerSemanticSlot,
  styles: Partial<Record<TimePickerSemanticSlot, JSX.CSSProperties>> | undefined,
): JSX.CSSProperties | undefined {
  return styles?.[slot]
}

interface TimeColumnsProps {
  prefixCls: string
  format: TimePickerFormat
  parts: NullableTimeParts
  hourStep: number
  minuteStep: number
  secondStep: number
  hideDisabledOptions?: boolean
  changeOnScroll?: boolean
  classNames?: Partial<Record<TimePickerSemanticSlot, string>>
  styles?: Partial<Record<TimePickerSemanticSlot, JSX.CSSProperties>>
  cellRender?: (current: number, info: TimePickerCellRenderInfo) => JSX.Element
  range?: RangeSide
  disabledConfig?: DisabledTimeConfig
  onSelect: (type: ColumnType, optionValue: number) => void
}

function TimeColumns(props: TimeColumnsProps) {
  const listRefs: Partial<Record<ColumnType, HTMLDivElement>> = {}
  const programmaticScrollTypes = new Set<ColumnType>()

  function disabledValues(type: ColumnType, parts: NullableTimeParts): number[] {
    if (type === 'hour') return props.disabledConfig?.disabledHours?.() ?? []
    if (type === 'minute' && parts.hour !== undefined) {
      return props.disabledConfig?.disabledMinutes?.(parts.hour) ?? []
    }
    if (type === 'second' && parts.hour !== undefined && parts.minute !== undefined) {
      return props.disabledConfig?.disabledSeconds?.(parts.hour, parts.minute) ?? []
    }
    return []
  }

  function isDisabled(type: ColumnType, optionValue: number): boolean {
    return includes(disabledValues(type, props.parts), optionValue)
  }

  function options(type: ColumnType, max: number, step: number): number[] {
    const values = range(max, step)
    if (!props.hideDisabledOptions) return values
    return values.filter((value) => !isDisabled(type, value))
  }

  function handleScroll(type: ColumnType, event: Event): void {
    if (programmaticScrollTypes.has(type)) {
      programmaticScrollTypes.delete(type)
      return
    }
    if (!props.changeOnScroll) return
    const target = event.currentTarget as HTMLElement
    const optionValues =
      type === 'hour'
        ? options(type, 23, props.hourStep)
        : type === 'minute'
          ? options(type, 59, props.minuteStep)
          : options(type, 59, props.secondStep)
    const nextValue = optionValues[Math.max(0, Math.round(target.scrollTop / TIME_CELL_HEIGHT))]
    if (nextValue !== undefined) props.onSelect(type, nextValue)
  }

  function scrollSelectedToTop(type: ColumnType, max: number, step: number): void {
    const list = listRefs[type]
    const selected = props.parts[type]
    if (!list || selected === undefined) return
    const selectedIndex = options(type, max, step).indexOf(selected)
    if (selectedIndex === -1) return
    const selectedElement = list.children.item(selectedIndex) as HTMLElement | null
    const top =
      selectedElement !== null
        ? selectedElement.offsetTop - list.offsetTop
        : selectedIndex * TIME_CELL_HEIGHT
    programmaticScrollTypes.add(type)
    if (typeof list.scrollTo === 'function') {
      list.scrollTo({ top, behavior: 'smooth' })
    } else {
      list.scrollTop = top
      queueMicrotask(() => programmaticScrollTypes.delete(type))
    }
  }

  createEffect(() => scrollSelectedToTop('hour', 23, props.hourStep))
  createEffect(() => scrollSelectedToTop('minute', 59, props.minuteStep))
  createEffect(() => scrollSelectedToTop('second', 59, props.secondStep))

  function renderCell(type: ColumnType, optionValue: number, originNode: JSX.Element) {
    if (!props.cellRender) return originNode
    return props.cellRender(optionValue, {
      originNode,
      today: dayjs(),
      range: props.range,
      subType: type,
    })
  }

  function renderColumn(type: ColumnType, max: number, step = 1) {
    const label = type === 'hour' ? 'hours' : type === 'minute' ? 'minutes' : 'seconds'
    const selected = () => props.parts[type]

    return (
      <div class={semanticClass('column', props.classNames, `${props.prefixCls}-column`)}>
        <div class={`${props.prefixCls}-column-title`}>{label}</div>
        <div
          role="listbox"
          aria-label={label}
          ref={(element) => {
            listRefs[type] = element
          }}
          class={`${props.prefixCls}-column-list`}
          onScroll={(event) => handleScroll(type, event)}
        >
          <For each={options(type, max, step)}>
            {(optionValue) => {
              const optionDisabled = () => isDisabled(type, optionValue)
              const originNode = <span>{pad(optionValue)}</span>
              return (
                <div
                  role="option"
                  aria-label={`${pad(optionValue)} ${label}`}
                  aria-selected={selected() === optionValue}
                  aria-disabled={optionDisabled()}
                  class={semanticClass(
                    'cell',
                    props.classNames,
                    `${props.prefixCls}-cell`,
                    selected() === optionValue && `${props.prefixCls}-cell-selected`,
                    optionDisabled() && `${props.prefixCls}-cell-disabled`,
                  )}
                  style={semanticStyle('cell', props.styles)}
                  onClick={() => {
                    if (!optionDisabled()) props.onSelect(type, optionValue)
                  }}
                >
                  {renderCell(type, optionValue, originNode)}
                </div>
              )
            }}
          </For>
        </div>
      </div>
    )
  }

  return (
    <>
      {renderColumn('hour', 23, props.hourStep)}
      {renderColumn('minute', 59, props.minuteStep)}
      <Show when={props.format.includes('s')}>{renderColumn('second', 59, props.secondStep)}</Show>
    </>
  )
}

export function TimePickerBase(props: TimePickerProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'format',
    'placeholder',
    'disabled',
    'allowClear',
    'prefix',
    'open',
    'defaultOpen',
    'hourStep',
    'minuteStep',
    'secondStep',
    'hideDisabledOptions',
    'changeOnScroll',
    'disabledTime',
    'disabledHours',
    'disabledMinutes',
    'disabledSeconds',
    'placement',
    'inputReadOnly',
    'suffixIcon',
    'cellRender',
    'renderExtraFooter',
    'needConfirm',
    'showNow',
    'use12Hours',
    'size',
    'status',
    'variant',
    'prefixCls',
    'class',
    'style',
    'onChange',
    'onOpenChange',
    'classNames',
    'styles',
    'popupClassName',
    'dropdownClassName',
    'popupStyle',
    'onKeyDown',
    'ref',
    'zIndex',
    'getPopupContainer',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-time-picker`
  const [, hashId] = useTimePickerStyle(prefixCls())
  const [dropdownZIndex] = useZIndex('SelectLike', local.zIndex)
  const [innerValue, setInnerValue] = createSignal<TimeParts | undefined>(
    valueToParts(local.defaultValue),
  )
  const [pendingValue, setPendingValue] = createSignal<TimeParts | undefined>()
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [draftParts, setDraftParts] = createSignal<NullableTimeParts>({})
  const [dropdownPosition, setDropdownPosition] = createSignal<JSX.CSSProperties>({})
  let selectorRef: HTMLDivElement | undefined
  let dropdownRef: HTMLDivElement | undefined

  const pickerRef: TimePickerRef = {
    focus: () => selectorRef?.focus(),
    blur: () => selectorRef?.blur(),
    get nativeElement() {
      return selectorRef
    },
  }
  assignPickerRef(local.ref, pickerRef)

  const isValueControlled = () => 'value' in props
  const format = () => local.format ?? (local.use12Hours ? 'h:mm:ss a' : DEFAULT_FORMAT)
  const disabled = () => Boolean(local.disabled)
  const hourStep = () => normalizeStep(local.hourStep)
  const minuteStep = () => normalizeStep(local.minuteStep)
  const secondStep = () => normalizeStep(local.secondStep)
  const allowClearEnabled = () => local.allowClear !== false
  const selectedParts = createMemo(() =>
    isValueControlled() ? valueToParts(local.value) : innerValue(),
  )
  const showClear = () => allowClearEnabled() && !disabled() && Boolean(displayValue())
  const completeDraftParts = (): TimeParts | undefined => {
    const parts = draftParts()
    if (!isComplete(parts)) return undefined
    return {
      hour: parts.hour,
      minute: parts.minute,
      second: format().includes('s') ? parts.second : 0,
    }
  }
  const displayParts = () => (open() ? (completeDraftParts() ?? selectedParts()) : selectedParts())
  const displayValue = () => formatParts(displayParts(), format())
  const open = () => (local.open !== undefined ? Boolean(local.open) : innerOpen())
  const disabledConfig = () => {
    const disabledTimeConfig = local.disabledTime?.(
      selectedParts() ? partsToDayjs(selectedParts() as TimeParts) : dayjs(),
    )
    return {
      ...disabledTimeConfig,
      disabledHours: local.disabledHours ?? disabledTimeConfig?.disabledHours,
      disabledMinutes: local.disabledMinutes ?? disabledTimeConfig?.disabledMinutes,
      disabledSeconds: local.disabledSeconds ?? disabledTimeConfig?.disabledSeconds,
    }
  }

  createEffect(() => {
    const parts = pendingValue() ?? selectedParts()
    setDraftParts(parts ?? {})
  })

  function updateDropdownPosition(): void {
    if (isServer) return
    if (!canUseDom() || !selectorRef) {
      setDropdownPosition({ 'z-index': `${dropdownZIndex}` })
      return
    }
    const rect = selectorRef.getBoundingClientRect()
    const isTop = local.placement?.startsWith('top')
    const isRight = local.placement?.endsWith('Right')
    setDropdownPosition({
      position: 'fixed',
      top: `${isTop ? rect.top - 4 : rect.bottom + 4}px`,
      left: `${isRight ? rect.right : rect.left}px`,
      'min-width': `${rect.width}px`,
      'z-index': `${dropdownZIndex}`,
    })
  }

  function containsPopupTarget(target: EventTarget | null): boolean {
    return Boolean(
      target instanceof Node &&
      ((selectorRef && selectorRef.contains(target)) ||
        (dropdownRef && dropdownRef.contains(target))),
    )
  }

  function setOpen(nextOpen: boolean): void {
    if (disabled() && nextOpen) return
    if (nextOpen) updateDropdownPosition()
    else {
      setPendingValue(undefined)
      setDraftParts(selectedParts() ?? {})
    }
    if (local.open === undefined) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  createRenderEffect(() => {
    if (open()) updateDropdownPosition()
  })

  createEffect(() => {
    if (!open()) return
    const removeListeners = addPositionUpdateListeners(updateDropdownPosition)
    onCleanup(removeListeners)
  })

  createEffect(() => {
    if (!open()) return
    const removePointerDown = addDocumentPointerDown((event) => {
      if (!containsPopupTarget(event.target)) setOpen(false)
    })
    onCleanup(removePointerDown)
  })

  function isComplete(parts: NullableTimeParts): parts is TimeParts {
    return (
      parts.hour !== undefined &&
      parts.minute !== undefined &&
      (!format().includes('s') || parts.second !== undefined)
    )
  }

  function changeValue(nextParts: TimeParts | undefined): void {
    if (!isValueControlled()) setInnerValue(nextParts)
    const nextTime = nextParts ? partsToDayjs(nextParts) : null
    local.onChange?.(nextTime, nextParts ? formatParts(nextParts, format()) : '')
  }

  function selectValue(type: ColumnType, optionValue: number): void {
    const nextParts = { ...draftParts(), [type]: optionValue }
    setDraftParts(nextParts)
    if (!isComplete(nextParts)) return
    const completeParts = {
      hour: nextParts.hour,
      minute: nextParts.minute,
      second: format().includes('s') ? nextParts.second : 0,
    }
    setPendingValue(completeParts)
  }

  function confirmValue(): void {
    const nextParts = pendingValue() ?? draftParts()
    if (!isComplete(nextParts)) return
    const completeParts = {
      hour: nextParts.hour,
      minute: nextParts.minute,
      second: format().includes('s') ? nextParts.second : 0,
    }
    setPendingValue(undefined)
    changeValue(completeParts)
    setOpen(false)
  }

  function clearValue(event: MouseEvent): void {
    event.stopPropagation()
    setPendingValue(undefined)
    setDraftParts({})
    changeValue(undefined)
  }

  function selectNow(event: MouseEvent): void {
    event.stopPropagation()
    const now = dayjs(Date.now())
    const nextParts = { hour: now.hour(), minute: now.minute(), second: now.second() }
    setPendingValue(undefined)
    setDraftParts(nextParts)
    changeValue(nextParts)
    setOpen(false)
  }

  return (
    <div
      {...rest}
      class={semanticClass(
        'root',
        local.classNames,
        prefixCls(),
        local.size && `${prefixCls()}-${local.size}`,
        local.status && `${prefixCls()}-status-${local.status}`,
        local.variant && `${prefixCls()}-${local.variant}`,
        disabled() && `${prefixCls()}-disabled`,
        open() && `${prefixCls()}-open`,
        hashId(),
        local.class,
      )}
      style={{ ...semanticStyle('root', local.styles), ...(local.style as JSX.CSSProperties) }}
    >
      <input
        aria-hidden="true"
        tabindex={-1}
        readOnly={local.inputReadOnly}
        value={displayValue()}
        class={`${prefixCls()}-input`}
        style={semanticStyle('input', local.styles)}
      />
      <div
        role="combobox"
        tabindex={disabled() ? undefined : 0}
        aria-expanded={open()}
        aria-disabled={disabled()}
        ref={(element) => {
          selectorRef = element
        }}
        class={semanticClass('selector', local.classNames, `${prefixCls()}-selector`)}
        style={semanticStyle('selector', local.styles)}
        onClick={() => setOpen(!open())}
        onKeyDown={(event) => {
          ;(local.onKeyDown as JSX.EventHandler<HTMLDivElement, KeyboardEvent> | undefined)?.(event)
          if (event.key === 'Escape') setOpen(false)
        }}
      >
        <Show when={local.prefix}>
          <span class={`${prefixCls()}-prefix`}>{local.prefix}</span>
        </Show>
        <span
          class={displayValue() ? `${prefixCls()}-selection-item` : `${prefixCls()}-placeholder`}
        >
          {displayValue() || local.placeholder || 'Select time'}
        </span>
        <span
          class={classNames(
            `${prefixCls()}-icon-stack`,
            showClear() && `${prefixCls()}-icon-stack-has-clear`,
          )}
        >
          <span class={semanticClass('suffix', local.classNames, `${prefixCls()}-suffix`)}>
            {local.suffixIcon ?? <ClockCircleOutlined />}
          </span>
          <Show when={showClear()}>
            <button
              type="button"
              aria-label="Clear time"
              class={semanticClass('clear', local.classNames, `${prefixCls()}-clear`)}
              style={semanticStyle('clear', local.styles)}
              onClick={clearValue}
            >
              {allowClearIcon(local.allowClear)}
            </button>
          </Show>
        </span>
      </div>
      <Show when={open()}>
        <InternalPortal
          mount={() =>
            local.getPopupContainer?.(selectorRef) ?? config.getPopupContainer?.(selectorRef)
          }
        >
          <div
            ref={(element) => {
              dropdownRef = element
            }}
            class={semanticClass(
              'popup',
              local.classNames,
              `${prefixCls()}-dropdown`,
              local.popupClassName,
              local.dropdownClassName,
            )}
            style={{
              ...dropdownPosition(),
              ...semanticStyle('popup', local.styles),
              ...local.popupStyle,
            }}
          >
            <div
              role="group"
              aria-label="Time selection"
              class={semanticClass('panel', local.classNames, `${prefixCls()}-panel`)}
              style={semanticStyle('panel', local.styles)}
            >
              <TimeColumns
                prefixCls={prefixCls()}
                format={format()}
                parts={draftParts()}
                hourStep={hourStep()}
                minuteStep={minuteStep()}
                secondStep={secondStep()}
                hideDisabledOptions={local.hideDisabledOptions}
                changeOnScroll={local.changeOnScroll}
                classNames={local.classNames}
                styles={local.styles}
                cellRender={local.cellRender}
                disabledConfig={disabledConfig()}
                onSelect={selectValue}
              />
            </div>
            <div
              class={semanticClass('footer', local.classNames, `${prefixCls()}-footer`)}
              style={semanticStyle('footer', local.styles)}
            >
              <Show when={local.showNow !== false}>
                <button type="button" class={`${prefixCls()}-now-btn`} onClick={selectNow}>
                  Now
                </button>
              </Show>
              {local.renderExtraFooter?.()}
              <button type="button" class={`${prefixCls()}-ok-btn`} onClick={confirmValue}>
                OK
              </button>
            </div>
          </div>
        </InternalPortal>
      </Show>
    </div>
  )
}

function rangeValueToParts(
  value: TimePickerRangeValue | undefined,
): [TimeParts | undefined, TimeParts | undefined] {
  return [valueToParts(value?.[0]), valueToParts(value?.[1])]
}

function completeRange(
  parts: [TimeParts | undefined, TimeParts | undefined],
): TimePickerRangeValue {
  return [parts[0] ? partsToDayjs(parts[0]) : null, parts[1] ? partsToDayjs(parts[1]) : null]
}

function orderRange(parts: [TimeParts | undefined, TimeParts | undefined]) {
  if (!parts[0] || !parts[1]) return parts
  const first = partsToDayjs(parts[0])
  const second = partsToDayjs(parts[1])
  return (first.isAfter(second) ? [parts[1], parts[0]] : parts) as [
    TimeParts | undefined,
    TimeParts | undefined,
  ]
}

function completePartsFromDraft(
  parts: NullableTimeParts,
  format: TimePickerFormat,
): TimeParts | undefined {
  const needsSeconds = format.includes('s')
  if (
    parts.hour === undefined ||
    parts.minute === undefined ||
    (needsSeconds && parts.second === undefined)
  ) {
    return undefined
  }
  const second = needsSeconds ? parts.second : 0
  if (second === undefined) return undefined
  return {
    hour: parts.hour,
    minute: parts.minute,
    second,
  }
}

function TimeRangePicker(props: TimeRangePickerProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'format',
    'placeholder',
    'disabled',
    'allowClear',
    'prefix',
    'open',
    'defaultOpen',
    'hourStep',
    'minuteStep',
    'secondStep',
    'hideDisabledOptions',
    'changeOnScroll',
    'disabledTime',
    'order',
    'placement',
    'inputReadOnly',
    'suffixIcon',
    'cellRender',
    'renderExtraFooter',
    'needConfirm',
    'showNow',
    'use12Hours',
    'size',
    'status',
    'variant',
    'prefixCls',
    'class',
    'style',
    'onChange',
    'onOpenChange',
    'classNames',
    'styles',
    'popupClassName',
    'dropdownClassName',
    'popupStyle',
    'onKeyDown',
    'ref',
    'zIndex',
    'getPopupContainer',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-time-picker`
  const [, hashId] = useTimePickerStyle(prefixCls())
  const [dropdownZIndex] = useZIndex('SelectLike', local.zIndex)
  const [innerValue, setInnerValue] = createSignal<[TimeParts | undefined, TimeParts | undefined]>(
    rangeValueToParts(local.defaultValue),
  )
  const [draftRange, setDraftRange] = createSignal<[NullableTimeParts, NullableTimeParts]>([{}, {}])
  const [activeSide, setActiveSide] = createSignal<RangeSide>('start')
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [dropdownPosition, setDropdownPosition] = createSignal<JSX.CSSProperties>({})
  let selectorRef: HTMLDivElement | undefined
  let dropdownRef: HTMLDivElement | undefined

  const pickerRef: TimePickerRef = {
    focus: () => selectorRef?.focus(),
    blur: () => selectorRef?.blur(),
    get nativeElement() {
      return selectorRef
    },
  }
  assignPickerRef(local.ref, pickerRef)

  const isValueControlled = () => 'value' in props
  const format = () => local.format ?? DEFAULT_FORMAT
  const selectedRange = createMemo(() =>
    isValueControlled() ? rangeValueToParts(local.value) : innerValue(),
  )
  const open = () => (local.open !== undefined ? Boolean(local.open) : innerOpen())
  const displayRange = createMemo(() => {
    if (!open()) return selectedRange()
    const draft = draftRange()
    return [
      completePartsFromDraft(draft[0], format()) ?? selectedRange()[0],
      completePartsFromDraft(draft[1], format()) ?? selectedRange()[1],
    ] as [TimeParts | undefined, TimeParts | undefined]
  })
  const displayValues = () =>
    [formatParts(displayRange()[0], format()), formatParts(displayRange()[1], format())] as [
      string,
      string,
    ]
  const allowClearEnabled = () => local.allowClear !== false
  const showClear = () =>
    allowClearEnabled() && !local.disabled && Boolean(displayValues()[0] || displayValues()[1])

  createEffect(() => {
    const selected = selectedRange()
    setDraftRange([selected[0] ?? {}, selected[1] ?? {}])
  })

  function updateDropdownPosition(): void {
    if (isServer) return
    if (!canUseDom() || !selectorRef) {
      setDropdownPosition({ 'z-index': `${dropdownZIndex}` })
      return
    }
    const rect = selectorRef.getBoundingClientRect()
    setDropdownPosition({
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      'min-width': `${rect.width}px`,
      'z-index': `${dropdownZIndex}`,
    })
  }

  function containsPopupTarget(target: EventTarget | null): boolean {
    return Boolean(
      target instanceof Node &&
      ((selectorRef && selectorRef.contains(target)) ||
        (dropdownRef && dropdownRef.contains(target))),
    )
  }

  function setOpen(nextOpen: boolean): void {
    if (local.disabled && nextOpen) return
    if (nextOpen) {
      setActiveSide('start')
      updateDropdownPosition()
    } else {
      const selected = selectedRange()
      setDraftRange([selected[0] ?? {}, selected[1] ?? {}])
    }
    if (local.open === undefined) setInnerOpen(nextOpen)
    local.onOpenChange?.(nextOpen)
  }

  createRenderEffect(() => {
    if (open()) updateDropdownPosition()
  })

  createEffect(() => {
    if (!open()) return
    const removeListeners = addPositionUpdateListeners(updateDropdownPosition)
    const removePointerDown = addDocumentPointerDown((event) => {
      if (!containsPopupTarget(event.target)) setOpen(false)
    })
    onCleanup(() => {
      removeListeners()
      removePointerDown()
    })
  })

  function changeRange(nextRange: [TimeParts | undefined, TimeParts | undefined]): void {
    const orderedRange = local.order === false ? nextRange : orderRange(nextRange)
    if (!isValueControlled()) setInnerValue(orderedRange)
    local.onChange?.(completeRange(orderedRange), [
      formatParts(orderedRange[0], format()),
      formatParts(orderedRange[1], format()),
    ])
  }

  function selectValue(side: RangeSide, type: ColumnType, optionValue: number): void {
    const sideIndex = side === 'start' ? 0 : 1
    const nextDraft = [...draftRange()] as [NullableTimeParts, NullableTimeParts]
    nextDraft[sideIndex] = { ...nextDraft[sideIndex], [type]: optionValue }
    setDraftRange(nextDraft)
  }

  function confirmValue(): void {
    const side = activeSide()
    const sideIndex = side === 'start' ? 0 : 1
    const nextDraft = [...draftRange()] as [NullableTimeParts, NullableTimeParts]
    const completeParts = completePartsFromDraft(nextDraft[sideIndex], format())
    if (!completeParts) return

    nextDraft[sideIndex] = completeParts
    setDraftRange(nextDraft)

    if (side === 'start') {
      setActiveSide('end')
      return
    }

    changeRange([
      completePartsFromDraft(nextDraft[0], format()),
      completePartsFromDraft(nextDraft[1], format()),
    ])
    setOpen(false)
  }

  function selectNow(event: MouseEvent): void {
    event.stopPropagation()
    const now = dayjs(Date.now())
    const sideIndex = activeSide() === 'start' ? 0 : 1
    const nextDraft = [...draftRange()] as [NullableTimeParts, NullableTimeParts]
    nextDraft[sideIndex] = {
      hour: now.hour(),
      minute: now.minute(),
      second: now.second(),
    }
    setDraftRange(nextDraft)
  }

  function clearValue(event: MouseEvent): void {
    event.stopPropagation()
    setDraftRange([{}, {}])
    changeRange([undefined, undefined])
  }

  const startPlaceholder = () => local.placeholder?.[0] ?? 'Start time'
  const endPlaceholder = () => local.placeholder?.[1] ?? 'End time'

  return (
    <div
      {...rest}
      class={semanticClass(
        'root',
        local.classNames,
        prefixCls(),
        `${prefixCls()}-range`,
        local.disabled && `${prefixCls()}-disabled`,
        open() && `${prefixCls()}-open`,
        hashId(),
        local.class,
      )}
      style={{ ...semanticStyle('root', local.styles), ...(local.style as JSX.CSSProperties) }}
    >
      <input
        aria-hidden="true"
        tabindex={-1}
        readOnly={local.inputReadOnly}
        value={displayValues().join(' - ')}
        class={`${prefixCls()}-input`}
        style={semanticStyle('input', local.styles)}
      />
      <div
        role="combobox"
        tabindex={local.disabled ? undefined : 0}
        aria-expanded={open()}
        aria-disabled={Boolean(local.disabled)}
        ref={(element) => {
          selectorRef = element
        }}
        class={semanticClass('selector', local.classNames, `${prefixCls()}-selector`)}
        style={semanticStyle('selector', local.styles)}
        onClick={() => setOpen(!open())}
        onKeyDown={(event) => {
          ;(local.onKeyDown as JSX.EventHandler<HTMLDivElement, KeyboardEvent> | undefined)?.(event)
          if (event.key === 'Escape') setOpen(false)
        }}
      >
        <span
          class={
            displayValues()[0] ? `${prefixCls()}-selection-item` : `${prefixCls()}-placeholder`
          }
        >
          {displayValues()[0] || startPlaceholder()}
        </span>
        <span class={`${prefixCls()}-range-separator`}>-</span>
        <span
          class={
            displayValues()[1] ? `${prefixCls()}-selection-item` : `${prefixCls()}-placeholder`
          }
        >
          {displayValues()[1] || endPlaceholder()}
        </span>
        <span
          class={classNames(
            `${prefixCls()}-icon-stack`,
            showClear() && `${prefixCls()}-icon-stack-has-clear`,
          )}
        >
          <span class={semanticClass('suffix', local.classNames, `${prefixCls()}-suffix`)}>
            {local.suffixIcon ?? <ClockCircleOutlined />}
          </span>
          <Show when={showClear()}>
            <button
              type="button"
              aria-label="Clear time"
              class={semanticClass('clear', local.classNames, `${prefixCls()}-clear`)}
              style={semanticStyle('clear', local.styles)}
              onClick={clearValue}
            >
              {allowClearIcon(local.allowClear)}
            </button>
          </Show>
        </span>
      </div>
      <Show when={open()}>
        <InternalPortal
          mount={() =>
            local.getPopupContainer?.(selectorRef) ?? config.getPopupContainer?.(selectorRef)
          }
        >
          <div
            ref={(element) => {
              dropdownRef = element
            }}
            class={semanticClass(
              'popup',
              local.classNames,
              `${prefixCls()}-dropdown`,
              `${prefixCls()}-range-dropdown`,
              local.popupClassName,
              local.dropdownClassName,
            )}
            style={{
              ...dropdownPosition(),
              ...semanticStyle('popup', local.styles),
              ...local.popupStyle,
            }}
          >
            <div
              role="group"
              aria-label={`${activeSide()} time selection`}
              class={semanticClass(
                'panel',
                local.classNames,
                `${prefixCls()}-panel`,
                `${prefixCls()}-panel-active`,
              )}
              style={semanticStyle('panel', local.styles)}
            >
              <TimeColumns
                prefixCls={prefixCls()}
                format={format()}
                parts={draftRange()[activeSide() === 'start' ? 0 : 1]}
                hourStep={normalizeStep(local.hourStep)}
                minuteStep={normalizeStep(local.minuteStep)}
                secondStep={normalizeStep(local.secondStep)}
                hideDisabledOptions={local.hideDisabledOptions}
                changeOnScroll={local.changeOnScroll}
                classNames={local.classNames}
                styles={local.styles}
                cellRender={local.cellRender}
                range={activeSide()}
                disabledConfig={
                  local.disabledTime?.(
                    displayRange()[activeSide() === 'start' ? 0 : 1]
                      ? partsToDayjs(displayRange()[activeSide() === 'start' ? 0 : 1] as TimeParts)
                      : dayjs(),
                    activeSide(),
                  ) ?? {}
                }
                onSelect={(type, optionValue) => selectValue(activeSide(), type, optionValue)}
              />
            </div>
            <div
              class={semanticClass('footer', local.classNames, `${prefixCls()}-footer`)}
              style={semanticStyle('footer', local.styles)}
            >
              <Show when={local.showNow !== false}>
                <button type="button" class={`${prefixCls()}-now-btn`} onClick={selectNow}>
                  Now
                </button>
              </Show>
              {local.renderExtraFooter?.()}
              <button type="button" class={`${prefixCls()}-ok-btn`} onClick={confirmValue}>
                OK
              </button>
            </div>
          </div>
        </InternalPortal>
      </Show>
    </div>
  )
}

export const TimePicker = Object.assign(TimePickerBase, { RangePicker: TimeRangePicker })
export { TimeRangePicker as RangePicker }
