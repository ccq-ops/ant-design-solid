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
import { isServer } from 'solid-js/web'
import { useConfig } from '../config-provider'
import { addDocumentPointerDown, addPositionUpdateListeners } from '../shared/overlay'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useZIndex } from '../shared/z-index'
import {
  dayjs,
  isOutOfBounds,
  normalizeDateValue,
  pickerSelectionStart,
  pickerViewStart,
  samePickerValue,
} from './date-utils'
import { DatePanel } from './date-panel'
import { MonthPanel } from './month-panel'
import { YearPanel } from './year-panel'
import { useDatePickerStyle } from './date-picker.style'
import { formatDayjs, parseDayjs } from './format-utils'
import type {
  DatePickerMultipleProps,
  DatePickerProps,
  DatePickerSingleProps,
  DatePickerValue,
} from './interface'
import { mergeDatePickerLocale } from './locale'
import { PickerInput } from './picker-input'
import { PickerPanel } from './picker-panel'
import { TimePanel } from './time-panel'
import { RangePicker } from './range-picker'
import { semanticClass, semanticStyle } from './semantic'

function DatePickerBase(props: DatePickerProps) {
  const ariaLabel = () => props['aria-label'] as string | undefined
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
    'autoFocus',
    'inputReadOnly',
    'preserveInvalidOnBlur',
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
    'className',
    'style',
    'classNames',
    'styles',
    'popupClassName',
    'dropdownClassName',
    'popupStyle',
    'placement',
    'onChange',
    'onOpenChange',
    'onFocus',
    'onBlur',
    'onKeyDown',
    'onOk',
    'onPanelChange',
    'zIndex',
    'getPopupContainer',
    'id',
    'name',
    'prefix',
    'suffixIcon',
    'separator',
    'cellRender',
    'dateRender',
    'renderExtraFooter',
    'panelRender',
    'needConfirm',
    'multiple',
    'order',
    'tagRender',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-date-picker`
  const [, hashId] = useDatePickerStyle(prefixCls())
  const [dropdownZIndex] = useZIndex('DatePicker', local.zIndex)
  const picker = () => local.picker ?? 'date'
  const multiple = () => Boolean(local.multiple)
  const showTimeEnabled = () => !multiple() && Boolean(local.showTime)
  const effectiveFormat = () =>
    local.format ?? (showTimeEnabled() ? 'YYYY-MM-DD HH:mm:ss' : undefined)
  const locale = createMemo(() => mergeDatePickerLocale(local.locale))
  const defaultSelectedDate = Array.isArray(local.defaultValue)
    ? null
    : normalizeDateValue(local.defaultValue)
  const defaultSelectedDates = Array.isArray(local.defaultValue) ? local.defaultValue : []
  const defaultPickerDate = normalizeDateValue(local.defaultPickerValue)
  const controlledPickerDate = () => normalizeDateValue(local.pickerValue)
  const initialViewDate =
    defaultPickerDate ?? defaultSelectedDate ?? defaultSelectedDates[0] ?? dayjs()
  const [innerValue, setInnerValue] = createSignal<DatePickerValue>(defaultSelectedDate)
  const [innerMultipleValue, setInnerMultipleValue] =
    createSignal<dayjs.Dayjs[]>(defaultSelectedDates)
  const [inputValue, setInputValue] = createSignal(
    formatDayjs(defaultSelectedDate, effectiveFormat(), picker()),
  )
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [viewMonth, setViewMonth] = createSignal(pickerViewStart(initialViewDate, picker()))
  const [pendingValue, setPendingValue] = createSignal<DatePickerValue>(null)
  const [pendingMultipleValue, setPendingMultipleValue] = createSignal<dayjs.Dayjs[] | null>(null)
  const [dropdownPosition, setDropdownPosition] = createSignal<JSX.CSSProperties>({})
  let selectorRef: HTMLDivElement | undefined
  let inputRef: HTMLInputElement | undefined
  let dropdownRef: HTMLDivElement | undefined

  const isValueControlled = () => 'value' in props
  const isOpenControlled = () => 'open' in props
  const isPickerValueControlled = () => 'pickerValue' in props
  const disabled = () => Boolean(local.disabled)
  const selectedDate = createMemo(() =>
    isValueControlled() && !Array.isArray(local.value)
      ? normalizeDateValue(local.value)
      : innerValue(),
  )
  const selectedDates = createMemo(() =>
    isValueControlled() && Array.isArray(local.value) ? local.value : innerMultipleValue(),
  )
  const activeMultipleValue = createMemo(() => pendingMultipleValue() ?? selectedDates())
  const displayValue = createMemo(() =>
    multiple() ? '' : formatDayjs(selectedDate(), effectiveFormat(), picker()),
  )
  const open = () => (isOpenControlled() ? Boolean(local.open) : innerOpen())
  const panelViewDate = () => controlledPickerDate() ?? viewMonth()
  const placeholder = () => local.placeholder ?? locale().lang?.placeholder ?? 'Select date'

  createEffect(() => setInputValue(displayValue()))
  createEffect(() => {
    const selected = multiple() ? selectedDates()[0] : selectedDate()
    if (selected && !isPickerValueControlled()) setViewMonth(pickerViewStart(selected, picker()))
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
      'z-index': `${dropdownZIndex}`,
      ...local.popupStyle,
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
      local.disabledDate?.(date, { type: picker() }) ||
      isOutOfBounds(date, local.minDate, local.maxDate, picker()),
    )
  }

  function changeValue(nextDate: DatePickerValue): void {
    if (!isValueControlled()) setInnerValue(nextDate)
    const nextString = formatDayjs(nextDate, effectiveFormat(), picker())
    if (!isValueControlled()) setInputValue(nextString)
    ;(local.onChange as DatePickerSingleProps['onChange'] | undefined)?.(nextDate, nextString)
  }

  function formatMultipleValue(values: dayjs.Dayjs[]): string[] {
    return values.map((value) => formatDayjs(value, effectiveFormat(), picker()))
  }

  function normalizeMultipleValues(values: dayjs.Dayjs[]): dayjs.Dayjs[] {
    if (local.order === false) return values
    return [...values].sort((a, b) => a.valueOf() - b.valueOf())
  }

  function changeMultipleValue(nextDates: dayjs.Dayjs[]): void {
    const normalized = normalizeMultipleValues(nextDates)
    if (!isValueControlled()) setInnerMultipleValue(normalized)
    ;(local.onChange as DatePickerMultipleProps['onChange'] | undefined)?.(
      normalized,
      formatMultipleValue(normalized),
    )
  }

  function toggleMultipleDate(date: dayjs.Dayjs, source = activeMultipleValue()): dayjs.Dayjs[] {
    const exists = source.some((value) => samePickerValue(value, date, picker()))
    const next = exists
      ? source.filter((value) => !samePickerValue(value, date, picker()))
      : [...source, date]
    return normalizeMultipleValues(next)
  }

  function removeMultipleDate(date: dayjs.Dayjs): void {
    const source = activeMultipleValue()
    const next = source.filter((value) => !samePickerValue(value, date, picker()))
    if (local.needConfirm) {
      setPendingMultipleValue(next)
      return
    }
    changeMultipleValue(next)
  }

  function selectDate(date: dayjs.Dayjs): void {
    if (isDateDisabled(date)) return
    if (multiple()) {
      const next = toggleMultipleDate(date)
      if (local.needConfirm) {
        setPendingMultipleValue(next)
        return
      }
      changeMultipleValue(next)
      return
    }
    if (local.needConfirm || showTimeEnabled()) {
      setPendingValue(applyTimeSeed(date))
      return
    }
    changeValue(date)
    setOpen(false)
  }

  function confirmPendingValue(): void {
    if (multiple()) {
      const pending = pendingMultipleValue()
      const committed = pending ?? selectedDates()
      if (pending) {
        changeMultipleValue(pending)
        setPendingMultipleValue(null)
      }
      ;(local.onOk as DatePickerMultipleProps['onOk'] | undefined)?.(committed)
      setOpen(false)
      return
    }
    const pending = pendingValue()
    const committed = pending ?? selectedDate()
    if (pending) {
      changeValue(pending)
      setPendingValue(null)
    }
    ;(local.onOk as DatePickerSingleProps['onOk'] | undefined)?.(committed)
    setOpen(false)
  }

  function parseInput(closePopup: boolean): void {
    const rawValue = inputValue()
    const currentValue = selectedDate()
    if (!rawValue.trim()) {
      if (currentValue === null) {
        setInputValue('')
      } else {
        changeValue(null)
      }
      if (closePopup) setOpen(false)
      return
    }
    const parsed = parseDayjs(rawValue, effectiveFormat(), picker())
    if (!parsed || isDateDisabled(parsed)) {
      if (!local.preserveInvalidOnBlur) setInputValue(displayValue())
      return
    }
    if (samePickerValue(parsed, currentValue, picker())) {
      setInputValue(formatDayjs(parsed, effectiveFormat(), picker()))
    } else {
      changeValue(parsed)
    }
    if (!isPickerValueControlled()) setViewMonth(pickerViewStart(parsed, picker()))
    if (closePopup) setOpen(false)
  }

  function clearValue(event: MouseEvent): void {
    event.stopPropagation()
    if (multiple()) {
      if (local.needConfirm) setPendingMultipleValue([])
      else changeMultipleValue([])
      return
    }
    changeValue(null)
  }

  function changePanelView(nextViewDate: dayjs.Dayjs): void {
    const next = pickerViewStart(nextViewDate, picker())
    if (!isPickerValueControlled()) setViewMonth(next)
    local.onPanelChange?.(next, picker())
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

  function nextPanel(): void {
    const currentPicker = picker()
    const unit =
      currentPicker === 'year' || currentPicker === 'month' || currentPicker === 'quarter'
        ? 'year'
        : 'month'
    const amount = currentPicker === 'year' ? 12 : 1
    changePanelView(panelViewDate().add(amount, unit))
  }

  function timeSeed(): dayjs.Dayjs {
    if (pendingValue()) return pendingValue()!
    if (selectedDate()) return selectedDate()!
    const options = typeof local.showTime === 'object' ? local.showTime : undefined
    return options?.defaultOpenValue ?? options?.defaultValue ?? dayjs().startOf('day')
  }

  function applyTimeSeed(date: dayjs.Dayjs): dayjs.Dayjs {
    const seed = timeSeed()
    return date
      .hour(seed.hour())
      .minute(seed.minute())
      .second(seed.second())
      .millisecond(seed.millisecond())
  }

  function selectTime(unit: 'hour' | 'minute' | 'second', value: number): void {
    const base = pendingValue() ?? selectedDate() ?? applyTimeSeed(panelViewDate())
    setPendingValue(base.set(unit, value))
  }

  function selectNow(): void {
    const now = dayjs()
    setPendingValue(now)
    if (!isPickerValueControlled()) setViewMonth(pickerViewStart(now, picker()))
  }

  function selectPickerValue(date: dayjs.Dayjs): void {
    selectDate(pickerSelectionStart(date, picker()))
  }

  const panelNode = () => {
    if (picker() === 'month' || picker() === 'quarter') {
      return (
        <MonthPanel
          prefixCls={prefixCls()}
          viewDate={panelViewDate()}
          picker={picker() as 'month' | 'quarter'}
          selectedValue={multiple() ? activeMultipleValue() : (pendingValue() ?? selectedDate())}
          disabledDate={isDateDisabled}
          cellRender={local.cellRender}
          locale={locale()}
          classNames={local.classNames}
          styles={local.styles}
          onSelect={selectPickerValue}
        />
      )
    }
    if (picker() === 'year') {
      return (
        <YearPanel
          prefixCls={prefixCls()}
          viewDate={panelViewDate()}
          selectedValue={multiple() ? activeMultipleValue() : (pendingValue() ?? selectedDate())}
          disabledDate={isDateDisabled as (current: dayjs.Dayjs, info: { type: 'year' }) => boolean}
          cellRender={local.cellRender}
          locale={locale()}
          classNames={local.classNames}
          styles={local.styles}
          onSelect={selectPickerValue}
        />
      )
    }
    return (
      <DatePanel
        prefixCls={prefixCls()}
        viewDate={panelViewDate()}
        picker={picker()}
        selectedValue={multiple() ? activeMultipleValue() : (pendingValue() ?? selectedDate())}
        disabledDate={isDateDisabled}
        cellRender={local.cellRender}
        dateRender={local.dateRender}
        locale={locale()}
        classNames={local.classNames}
        styles={local.styles}
        onSelect={selectPickerValue}
      />
    )
  }

  return (
    <div
      {...rest}
      ref={(element) => {
        selectorRef = element
      }}
      class={semanticClass(
        'root',
        local.classNames,
        prefixCls(),
        disabled() && `${prefixCls()}-disabled`,
        open() && `${prefixCls()}-open`,
        multiple() && `${prefixCls()}-multiple`,
        hashId(),
        local.class,
        local.className,
      )}
      style={{
        ...semanticStyle('root', local.styles),
        ...(local.style as JSX.CSSProperties | undefined),
      }}
    >
      <div
        role="combobox"
        aria-expanded={open()}
        aria-disabled={disabled()}
        class={semanticClass('selector', local.classNames, `${prefixCls()}-selector`)}
        style={semanticStyle('selector', local.styles)}
        onClick={() => {
          inputRef?.focus()
          setOpen(true)
        }}
      >
        <PickerInput
          id={local.id}
          name={local.name}
          prefixCls={prefixCls()}
          value={inputValue()}
          multiple={multiple()}
          multipleValues={activeMultipleValue()}
          multipleFormat={effectiveFormat()}
          multiplePicker={picker()}
          tagRender={local.tagRender}
          placeholder={placeholder()}
          disabled={disabled()}
          readOnly={local.inputReadOnly}
          autoFocus={local.autoFocus}
          allowClear={Boolean(local.allowClear)}
          clearIcon={typeof local.allowClear === 'object' ? local.allowClear.clearIcon : undefined}
          prefix={local.prefix}
          suffixIcon={local.suffixIcon}
          ariaLabel={ariaLabel()}
          inputClass={semanticClass('input', local.classNames, `${prefixCls()}-input`)}
          inputStyle={semanticStyle('input', local.styles)}
          clearClass={semanticClass('clear', local.classNames, `${prefixCls()}-clear`)}
          clearStyle={semanticStyle('clear', local.styles)}
          inputRef={(element) => {
            inputRef = element
          }}
          onInput={(event) => setInputValue(event.currentTarget.value)}
          onFocus={(event) => {
            setOpen(true)
            ;(local.onFocus as JSX.EventHandler<HTMLInputElement, FocusEvent> | undefined)?.(event)
          }}
          onBlur={(event) => {
            parseInput(false)
            ;(local.onBlur as JSX.EventHandler<HTMLInputElement, FocusEvent> | undefined)?.(event)
          }}
          onKeyDown={(event) => {
            ;(local.onKeyDown as JSX.EventHandler<HTMLInputElement, KeyboardEvent> | undefined)?.(
              event,
            )
            if (event.key === 'Enter') {
              event.preventDefault()
              parseInput(true)
            }
            if (event.key === 'Escape') setOpen(false)
          }}
          onClear={clearValue}
          onRemoveTag={removeMultipleDate}
        />
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
            class={semanticClass('popup', undefined, local.popupClassName, local.dropdownClassName)}
            classNames={local.classNames}
            style={dropdownPosition()}
            mode={picker()}
            renderExtraFooter={local.renderExtraFooter}
            panelRender={local.panelRender}
            needConfirm={local.needConfirm}
            showTime={showTimeEnabled()}
            showNow={Boolean(local.showNow)}
            onNow={selectNow}
            onOk={confirmPendingValue}
            onPrevious={previousPanel}
            onNext={nextPanel}
          >
            {panelNode()}
            <Show when={showTimeEnabled()}>
              <TimePanel
                prefixCls={prefixCls()}
                value={pendingValue() ?? selectedDate()}
                showTime={local.showTime}
                disabledTime={local.disabledTime?.(pendingValue() ?? selectedDate())}
                onSelectTime={selectTime}
              />
            </Show>
          </PickerPanel>
        </InternalPortal>
      </Show>
    </div>
  )
}

export const DatePicker = Object.assign(DatePickerBase, { RangePicker })
export { RangePicker }
