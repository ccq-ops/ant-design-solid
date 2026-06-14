import {
  Show,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  onCleanup,
  splitProps,
} from 'solid-js'
import type { JSX } from 'solid-js'
import { Dynamic, isServer } from 'solid-js/web'
import { CalendarOutlined, CloseCircleFilled, SwapRightOutlined } from '@ant-design-solid/icons'
import { useConfig } from '../config-provider'
import { addDocumentPointerDown, addPositionUpdateListeners } from '../shared/overlay'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useZIndex } from '../shared/z-index'
import {
  dayjs,
  isOutOfBounds,
  normalizeRangeValue,
  pickerSelectionStart,
  pickerViewStart,
  rangeToNullable,
  sortRange,
} from './date-utils'
import { DatePanel } from './date-panel'
import { MonthPanel } from './month-panel'
import { YearPanel } from './year-panel'
import { useDatePickerStyle } from './date-picker.style'
import { formatDayjs } from './format-utils'
import type {
  DatePickerRef,
  PickerMode,
  RangePickerProps,
  RangePickerValue,
  RangeSide,
} from './interface'
import { mergeDatePickerLocale } from './locale'
import { PickerInput } from './picker-input'
import { PickerPanel } from './picker-panel'
import { TimePanel } from './time-panel'
import {
  resolveSemanticClassNames,
  resolveSemanticStyles,
  rootVariantClass,
  semanticClass,
  semanticStyle,
} from './semantic'

type RangeTuple = [dayjs.Dayjs | null, dayjs.Dayjs | null]
type RangeMetaHandler = (event: FocusEvent, info: { range: RangeSide }) => void

function normalizePickerValue(value: dayjs.Dayjs | [dayjs.Dayjs, dayjs.Dayjs] | undefined) {
  if (Array.isArray(value)) return value[0] ?? value[1] ?? null
  return value ?? null
}

function disabledForSide(
  disabled: boolean | [boolean, boolean] | undefined,
  side: RangeSide,
): boolean {
  if (Array.isArray(disabled)) return Boolean(disabled[side === 'start' ? 0 : 1])
  return Boolean(disabled)
}

function sideIndex(side: RangeSide): 0 | 1 {
  return side === 'start' ? 0 : 1
}

function rangeStrings(
  value: RangeTuple,
  format: RangePickerProps['format'],
  picker: RangePickerProps['picker'],
): [string, string] {
  return [formatDayjs(value[0], format, picker), formatDayjs(value[1], format, picker)]
}

function filledRange(value: RangeTuple): RangePickerValue {
  return rangeToNullable(value)
}

export function RangePicker(props: RangePickerProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'defaultPickerValue',
    'pickerValue',
    'format',
    'picker',
    'placeholder',
    'disabled',
    'allowClear',
    'allowEmpty',
    'autoFocus',
    'inputReadOnly',
    'open',
    'defaultOpen',
    'disabledDate',
    'showTime',
    'showNow',
    'disabledTime',
    'minDate',
    'maxDate',
    'locale',
    'prefixCls',
    'class',
    'style',
    'classNames',
    'styles',
    'placement',
    'onChange',
    'onCalendarChange',
    'onOpenChange',
    'onKeyDown',
    'onPanelChange',
    'zIndex',
    'getPopupContainer',
    'id',
    'name',
    'prefix',
    'suffixIcon',
    'separator',
    'status',
    'variant',
    'size',
    'prevIcon',
    'nextIcon',
    'superPrevIcon',
    'superNextIcon',
    'components',
    'previewValue',
    'onSelect',
    'presets',
    'cellRender',
    'dateRender',
    'renderExtraFooter',
    'panelRender',
    'order',
    'onFocus',
    'onBlur',
    'onOk',
    'ref',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-date-picker`
  const [, hashId] = useDatePickerStyle(prefixCls())
  const [dropdownZIndex] = useZIndex('DatePicker', local.zIndex)
  const resolvedClassNames = createMemo(() => resolveSemanticClassNames(local.classNames, props))
  const resolvedStyles = createMemo(() => resolveSemanticStyles(local.styles, props))
  const picker = () => local.picker ?? 'date'
  const showTimeEnabled = () => Boolean(local.showTime)
  const effectiveFormat = () =>
    local.format ?? (showTimeEnabled() ? 'YYYY-MM-DD HH:mm:ss' : undefined)
  const locale = createMemo(() => mergeDatePickerLocale(local.locale))
  const defaultSelectedRange = normalizeRangeValue(local.defaultValue)
  const defaultPickerDate = normalizePickerValue(local.defaultPickerValue)
  const initialViewDate =
    defaultPickerDate ?? defaultSelectedRange[0] ?? defaultSelectedRange[1] ?? dayjs()
  const [innerValue, setInnerValue] = createSignal<RangeTuple>(defaultSelectedRange)
  const [inputValues, setInputValues] = createSignal<[string, string]>(
    rangeStrings(defaultSelectedRange, effectiveFormat(), picker()),
  )
  const [activeRange, setActiveRange] = createSignal<RangeSide>('start')
  const [selecting, setSelecting] = createSignal(false)
  const [hoverValue, setHoverValue] = createSignal<dayjs.Dayjs | null>(null)
  const [draftRange, setDraftRange] = createSignal<RangeTuple>([null, null])
  const [pendingRange, setPendingRange] = createSignal<RangeTuple>([null, null])
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [viewMonth, setViewMonth] = createSignal(pickerViewStart(initialViewDate, picker()))
  const [dropdownPosition, setDropdownPosition] = createSignal<JSX.CSSProperties>({})
  let selectorRef: HTMLDivElement | undefined
  let dropdownRef: HTMLDivElement | undefined
  let startInputRef: HTMLInputElement | undefined
  let endInputRef: HTMLInputElement | undefined

  const pickerRef: DatePickerRef = {
    focus: () => (activeRange() === 'end' ? endInputRef : startInputRef)?.focus(),
    blur: () => {
      startInputRef?.blur()
      endInputRef?.blur()
    },
    get nativeElement() {
      return selectorRef
    },
  }
  if (local.ref) {
    if (typeof local.ref === 'function') local.ref(pickerRef)
    else {
      Object.assign(local.ref as object, pickerRef)
      if ('current' in local.ref) local.ref.current = pickerRef
    }
  }

  const isValueControlled = () => 'value' in props
  const isOpenControlled = () => 'open' in props
  const isPickerValueControlled = () => 'pickerValue' in props
  const selectedRange = createMemo<RangeTuple>(() =>
    isValueControlled() ? normalizeRangeValue(local.value) : innerValue(),
  )
  const displayValues = createMemo(() => rangeStrings(selectedRange(), effectiveFormat(), picker()))
  const open = () => (isOpenControlled() ? Boolean(local.open) : innerOpen())
  const panelViewDate = () => normalizePickerValue(local.pickerValue) ?? viewMonth()
  const placeholder = createMemo<[string, string]>(
    () => local.placeholder ?? locale().lang?.rangePlaceholder ?? ['Start date', 'End date'],
  )
  const clearAriaLabel = (side: RangeSide): string => {
    const lang = local.locale?.lang
    if (side === 'start') {
      return lang?.clearStart ?? (lang?.clear ? `${lang.clear} start date` : 'Clear start date')
    }
    return lang?.clearEnd ?? (lang?.clear ? `${lang.clear} end date` : 'Clear end date')
  }
  const allDisabled = () =>
    disabledForSide(local.disabled, 'start') && disabledForSide(local.disabled, 'end')

  createEffect(() => {
    if (!showTimeEnabled() || !(pendingRange()[0] || pendingRange()[1])) {
      setInputValues(displayValues())
    }
  })
  createEffect(() => {
    const [start, end] = selectedRange()
    if ((start || end) && !isPickerValueControlled())
      setViewMonth(pickerViewStart(start ?? end!, picker()))
  })

  function updateDropdownPosition(): void {
    if (isServer) return
    if (!canUseDom() || !selectorRef) {
      setDropdownPosition({
        'z-index': `${dropdownZIndex}`,
        ...semanticStyle('popup', resolvedStyles()),
      })
      return
    }
    const rect = selectorRef.getBoundingClientRect()
    setDropdownPosition({
      position: 'fixed',
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
      'z-index': `${dropdownZIndex}`,
      ...semanticStyle('popup', resolvedStyles()),
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
    if (allDisabled() && nextOpen) return
    if (nextOpen) updateDropdownPosition()
    if (!isOpenControlled()) setInnerOpen(nextOpen)
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

  function isDateDisabled(date: dayjs.Dayjs): boolean {
    return Boolean(
      local.disabledDate?.(date, { type: picker(), from: fromForSide(activeRange()) }) ||
      isOutOfBounds(date, local.minDate, local.maxDate, picker()),
    )
  }

  function fromForSide(side: RangeSide): dayjs.Dayjs | undefined {
    const range = selectedOrPendingRange()
    return range[side === 'start' ? 1 : 0] ?? undefined
  }

  function commitValue(nextRange: RangeTuple): void {
    const normalized = filledRange(nextRange)
    if (!isValueControlled()) setInnerValue(nextRange)
    const nextStrings = rangeStrings(nextRange, effectiveFormat(), picker())
    if (!isValueControlled()) setInputValues(nextStrings)
    local.onChange?.(normalized, normalized ? nextStrings : null)
  }

  function emitCalendarChange(nextRange: RangeTuple, range: RangeSide): void {
    local.onCalendarChange?.(
      filledRange(nextRange),
      rangeStrings(nextRange, effectiveFormat(), picker()),
      {
        range,
      },
    )
  }

  function selectDate(date: dayjs.Dayjs): void {
    if (isDateDisabled(date)) return
    local.onSelect?.(date)
    if (!selecting() || activeRange() === 'start') {
      const nextDate = applyTimeSeed(pickerSelectionStart(date, picker()), 'start')
      const nextRange: RangeTuple = [nextDate, null]
      setDraftRange(nextRange)
      setPendingRange(nextRange)
      if (!showTimeEnabled() && !isValueControlled()) setInnerValue(nextRange)
      setInputValues(rangeStrings(nextRange, effectiveFormat(), picker()))
      emitCalendarChange(nextRange, 'start')
      setSelecting(true)
      setHoverValue(null)
      setActiveRange('end')
      endInputRef?.focus()
      return
    }

    const nextDate = applyTimeSeed(pickerSelectionStart(date, picker()), 'end')
    const currentDraft = draftRange()
    const draft: RangeTuple = [currentDraft[0] ?? selectedRange()[0], nextDate]
    const nextRange = local.order === false ? draft : sortRange(draft)
    if (showTimeEnabled()) {
      setPendingRange(nextRange)
      setInputValues(rangeStrings(nextRange, effectiveFormat(), picker()))
    } else {
      commitValue(nextRange)
    }
    emitCalendarChange(nextRange, 'end')
    setSelecting(false)
    setHoverValue(null)
    setDraftRange([null, null])
    setActiveRange('end')
    if (!showTimeEnabled()) {
      setActiveRange('start')
      setOpen(false)
    }
  }

  function selectedOrPendingRange(): RangeTuple {
    const pending = pendingRange()
    return pending[0] || pending[1] ? pending : selectedRange()
  }

  function timeSeed(side: RangeSide = activeRange()): dayjs.Dayjs {
    const range = selectedOrPendingRange()
    const active = range[sideIndex(side)]
    if (active) return active
    const options = typeof local.showTime === 'object' ? local.showTime : undefined
    const defaultTime = options?.defaultOpenValue
    return defaultTime?.[sideIndex(side)] ?? dayjs().startOf('day')
  }

  function applyTimeSeed(date: dayjs.Dayjs, side: RangeSide): dayjs.Dayjs {
    const seed = timeSeed(side)
    return date
      .hour(seed.hour())
      .minute(seed.minute())
      .second(seed.second())
      .millisecond(seed.millisecond())
  }

  function selectTime(unit: 'hour' | 'minute' | 'second', value: number): void {
    const current = selectedOrPendingRange()
    const index = sideIndex(activeRange())
    const next: RangeTuple = [...current] as RangeTuple
    next[index] = next[index]?.set(unit, value) ?? null
    setPendingRange(next)
    setInputValues(rangeStrings(next, effectiveFormat(), picker()))
  }

  function confirmPendingValue(): void {
    const pending = pendingRange()
    const nextRange = pending[0] || pending[1] ? pending : selectedRange()
    if (nextRange[0] && nextRange[1]) {
      commitValue(nextRange)
      local.onOk?.(filledRange(nextRange))
      setPendingRange([null, null])
      setOpen(false)
    }
  }

  function selectNow(): void {
    const now = dayjs()
    setPendingRange([now, now])
    setInputValues(rangeStrings([now, now], effectiveFormat(), picker()))
    if (!isPickerValueControlled()) setViewMonth(pickerViewStart(now, picker()))
  }

  function changeHoverValue(date: dayjs.Dayjs | null): void {
    setHoverValue(selecting() && local.previewValue !== false ? date : null)
  }

  function clearRange(event: MouseEvent): void {
    event.stopPropagation()
    const nextRange: RangeTuple = [null, null]
    if (!isValueControlled()) setInnerValue(nextRange)
    if (!isValueControlled()) setInputValues(['', ''])
    setPendingRange([null, null])
    setDraftRange([null, null])
    setHoverValue(null)
    setSelecting(false)
    local.onChange?.(null, null)
  }

  function clearSide(side: RangeSide, event: MouseEvent): void {
    event.stopPropagation()
    const index = sideIndex(side)
    if (!local.allowEmpty?.[index]) return
    const nextRange: RangeTuple = [...selectedRange()] as RangeTuple
    nextRange[index] = null
    commitValue(nextRange)
  }

  function changePanelView(nextViewDate: dayjs.Dayjs): void {
    const next = pickerViewStart(nextViewDate, picker())
    if (!isPickerValueControlled()) setViewMonth(next)
    local.onPanelChange?.(next, picker() as PickerMode)
  }

  function previousPanel(): void {
    const currentPicker = picker()
    const unit =
      currentPicker === 'year' || currentPicker === 'month' || currentPicker === 'quarter'
        ? 'year'
        : 'month'
    const amount = currentPicker === 'year' ? 12 : 1
    changePanelView(panelViewDate().subtract(amount, unit))
  }

  function superPanelAmount(): number {
    const currentPicker = picker()
    if (currentPicker === 'year') return 120
    if (currentPicker === 'month' || currentPicker === 'quarter') return 10
    return 12
  }

  function superPreviousPanel(): void {
    const currentPicker = picker()
    const unit =
      currentPicker === 'year' || currentPicker === 'month' || currentPicker === 'quarter'
        ? 'year'
        : 'month'
    changePanelView(panelViewDate().subtract(superPanelAmount(), unit))
  }

  function nextPanel(): void {
    const currentPicker = picker()
    const unit =
      currentPicker === 'year' || currentPicker === 'month' || currentPicker === 'quarter'
        ? 'year'
        : 'month'
    const amount = currentPicker === 'year' ? 12 : 1
    changePanelView(panelViewDate().add(amount, unit))
  }

  function superNextPanel(): void {
    const currentPicker = picker()
    const unit =
      currentPicker === 'year' || currentPicker === 'month' || currentPicker === 'quarter'
        ? 'year'
        : 'month'
    changePanelView(panelViewDate().add(superPanelAmount(), unit))
  }

  function focusSide(side: RangeSide, event: FocusEvent): void {
    setActiveRange(side)
    setOpen(true)
    ;(local.onFocus as RangeMetaHandler | undefined)?.(event, { range: side })
  }

  function blurSide(side: RangeSide, event: FocusEvent): void {
    ;(local.onBlur as RangeMetaHandler | undefined)?.(event, { range: side })
  }

  const InputComponent = () => local.components?.input ?? PickerInput

  function panelSelectedValue(): dayjs.Dayjs | dayjs.Dayjs[] | null {
    const range = selectedOrPendingRange()
    const values = range.filter((date): date is dayjs.Dayjs => Boolean(date))
    if (values.length > 0) return values
    return range[sideIndex(activeRange())]
  }

  const rangePanelNode = () => {
    if (picker() === 'month' || picker() === 'quarter') {
      return (
        <MonthPanel
          prefixCls={prefixCls()}
          viewDate={panelViewDate()}
          picker={picker() as 'month' | 'quarter'}
          selectedValue={panelSelectedValue()}
          disabledDate={isDateDisabled}
          cellRender={local.cellRender}
          locale={locale()}
          classNames={resolvedClassNames()}
          styles={resolvedStyles()}
          onSelect={selectDate}
        />
      )
    }
    if (picker() === 'year') {
      return (
        <YearPanel
          prefixCls={prefixCls()}
          viewDate={panelViewDate()}
          selectedValue={panelSelectedValue()}
          disabledDate={isDateDisabled as (current: dayjs.Dayjs, info: { type: 'year' }) => boolean}
          cellRender={local.cellRender}
          locale={locale()}
          classNames={resolvedClassNames()}
          styles={resolvedStyles()}
          onSelect={selectDate}
        />
      )
    }
    return (
      <DatePanel
        prefixCls={prefixCls()}
        viewDate={panelViewDate()}
        picker={picker()}
        selectedValue={panelSelectedValue()}
        rangeValue={selectedOrPendingRange()}
        activeRange={activeRange()}
        hoverValue={hoverValue()}
        disabledDate={isDateDisabled}
        cellRender={local.cellRender}
        dateRender={local.dateRender}
        locale={locale()}
        classNames={resolvedClassNames()}
        styles={resolvedStyles()}
        onSelect={selectDate}
        onHover={changeHoverValue}
      />
    )
  }

  function inputId(side: RangeSide): string | undefined {
    return local.id?.[side]
  }

  return (
    <div
      {...rest}
      ref={(element) => {
        selectorRef = element
      }}
      class={semanticClass(
        'root',
        resolvedClassNames(),
        prefixCls(),
        `${prefixCls()}-range`,
        showTimeEnabled() && `${prefixCls()}-range-with-time`,
        allDisabled() && `${prefixCls()}-disabled`,
        open() && `${prefixCls()}-open`,
        ...rootVariantClass(prefixCls(), local.status, local.variant, local.size),
        hashId(),
        local.class,
      )}
      style={{
        ...semanticStyle('root', resolvedStyles()),
        ...(local.style as JSX.CSSProperties | undefined),
      }}
    >
      <div
        role="combobox"
        aria-expanded={open()}
        aria-disabled={allDisabled()}
        class={semanticClass('selector', resolvedClassNames(), `${prefixCls()}-selector`)}
        style={semanticStyle('selector', resolvedStyles())}
        onClick={() => {
          const target = activeRange() === 'start' ? startInputRef : endInputRef
          target?.focus()
          setOpen(true)
        }}
      >
        <Show when={local.prefix}>
          <span class={`${prefixCls()}-prefix`}>{local.prefix}</span>
        </Show>
        <Dynamic
          component={InputComponent()}
          id={inputId('start')}
          name={local.name}
          prefixCls={prefixCls()}
          value={inputValues()[0]}
          placeholder={placeholder()[0]}
          disabled={disabledForSide(local.disabled, 'start')}
          readOnly={local.inputReadOnly}
          autoFocus={local.autoFocus}
          allowClear={local.allowClear !== false && Boolean(local.allowEmpty?.[0])}
          clearIcon={typeof local.allowClear === 'object' ? local.allowClear.clearIcon : undefined}
          clearAriaLabel={clearAriaLabel('start')}
          showSuffixIcon={false}
          inputClass={semanticClass(
            'input',
            resolvedClassNames(),
            `${prefixCls()}-input`,
            `${prefixCls()}-range-input`,
          )}
          inputStyle={semanticStyle('input', resolvedStyles())}
          clearClass={semanticClass('clear', resolvedClassNames(), `${prefixCls()}-clear`)}
          clearStyle={semanticStyle('clear', resolvedStyles())}
          inputRef={(element) => {
            startInputRef = element
          }}
          onInput={(event) => setInputValues([event.currentTarget.value, inputValues()[1]])}
          onFocus={(event) => focusSide('start', event)}
          onBlur={(event) => blurSide('start', event)}
          onKeyDown={(event) => {
            ;(local.onKeyDown as JSX.EventHandler<HTMLInputElement, KeyboardEvent> | undefined)?.(
              event,
            )
          }}
          onClear={(event) => clearSide('start', event)}
        />
        <span class={`${prefixCls()}-range-separator`}>
          {local.separator ?? <SwapRightOutlined />}
        </span>
        <Dynamic
          component={InputComponent()}
          id={inputId('end')}
          prefixCls={prefixCls()}
          value={inputValues()[1]}
          placeholder={placeholder()[1]}
          disabled={disabledForSide(local.disabled, 'end')}
          readOnly={local.inputReadOnly}
          allowClear={local.allowClear !== false && Boolean(local.allowEmpty?.[1])}
          clearIcon={typeof local.allowClear === 'object' ? local.allowClear.clearIcon : undefined}
          clearAriaLabel={clearAriaLabel('end')}
          showSuffixIcon={false}
          inputClass={semanticClass(
            'input',
            resolvedClassNames(),
            `${prefixCls()}-input`,
            `${prefixCls()}-range-input`,
          )}
          inputStyle={semanticStyle('input', resolvedStyles())}
          clearClass={semanticClass('clear', resolvedClassNames(), `${prefixCls()}-clear`)}
          clearStyle={semanticStyle('clear', resolvedStyles())}
          inputRef={(element) => {
            endInputRef = element
          }}
          onInput={(event) => setInputValues([inputValues()[0], event.currentTarget.value])}
          onFocus={(event) => focusSide('end', event)}
          onBlur={(event) => blurSide('end', event)}
          onKeyDown={(event) => {
            ;(local.onKeyDown as JSX.EventHandler<HTMLInputElement, KeyboardEvent> | undefined)?.(
              event,
            )
          }}
          onClear={(event) => clearSide('end', event)}
        />
        <span class={`${prefixCls()}-suffix`}>{local.suffixIcon ?? <CalendarOutlined />}</span>
        <Show when={local.allowClear !== false && (selectedRange()[0] || selectedRange()[1])}>
          <button
            type="button"
            class={semanticClass(
              'clear',
              resolvedClassNames(),
              `${prefixCls()}-clear`,
              `${prefixCls()}-clear-overlay`,
            )}
            style={semanticStyle('clear', resolvedStyles())}
            aria-label={local.locale?.lang?.clear ?? 'Clear date range'}
            onClick={clearRange}
          >
            {typeof local.allowClear === 'object' ? (
              local.allowClear.clearIcon
            ) : (
              <CloseCircleFilled />
            )}
          </button>
        </Show>
      </div>
      <Show when={open()}>
        <InternalPortal
          mount={() =>
            local.getPopupContainer?.(selectorRef) ?? config.getPopupContainer?.(selectorRef)
          }
        >
          <PickerPanel
            ref={(element) => {
              dropdownRef = element
            }}
            prefixCls={prefixCls()}
            viewDate={panelViewDate()}
            placement={local.placement}
            class={semanticClass('popup', resolvedClassNames())}
            classNames={resolvedClassNames()}
            styles={resolvedStyles()}
            style={dropdownPosition()}
            mode={picker()}
            presets={local.presets}
            renderExtraFooter={local.renderExtraFooter}
            panelRender={local.panelRender}
            locale={locale()}
            showTime={showTimeEnabled()}
            timePanel={
              <Show when={showTimeEnabled()}>
                <TimePanel
                  prefixCls={prefixCls()}
                  value={selectedOrPendingRange()[sideIndex(activeRange())]}
                  showTime={local.showTime}
                  disabledTime={local.disabledTime?.(
                    selectedOrPendingRange()[sideIndex(activeRange())],
                    activeRange(),
                    { from: fromForSide(activeRange()) },
                  )}
                  locale={locale()}
                  cellRender={local.cellRender}
                  onSelectTime={selectTime}
                />
              </Show>
            }
            prevIcon={local.prevIcon}
            superPreviousIcon={local.superPrevIcon}
            nextIcon={local.nextIcon}
            superNextIcon={local.superNextIcon}
            components={local.components}
            showNow={Boolean(local.showNow)}
            onNow={selectNow}
            onOk={confirmPendingValue}
            onPresetSelect={(value) => {
              if (!Array.isArray(value)) return
              commitValue([value[0], value[1]])
              if (value[0] && !isPickerValueControlled()) {
                setViewMonth(pickerViewStart(value[0], picker()))
              }
              setOpen(false)
            }}
            onPrevious={previousPanel}
            onSuperPrevious={superPreviousPanel}
            onNext={nextPanel}
            onSuperNext={superNextPanel}
          >
            {rangePanelNode()}
          </PickerPanel>
        </InternalPortal>
      </Show>
    </div>
  )
}
