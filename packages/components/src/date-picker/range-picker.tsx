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
  normalizeRangeValue,
  pickerSelectionStart,
  pickerViewStart,
  rangeToNullable,
  sortRange,
} from './date-utils'
import { DatePanel } from './date-panel'
import { useDatePickerStyle } from './date-picker.style'
import { formatDayjs } from './format-utils'
import type { PickerMode, RangePickerProps, RangePickerValue, RangeSide } from './interface'
import { mergeDatePickerLocale } from './locale'
import { PickerInput } from './picker-input'
import { PickerPanel } from './picker-panel'
import { semanticClass, semanticStyle } from './semantic'

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
    'cellRender',
    'dateRender',
    'renderExtraFooter',
    'panelRender',
    'order',
    'onFocus',
    'onBlur',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-date-picker`
  const [, hashId] = useDatePickerStyle(prefixCls())
  const [dropdownZIndex] = useZIndex('DatePicker', local.zIndex)
  const picker = () => local.picker ?? 'date'
  const locale = createMemo(() => mergeDatePickerLocale(local.locale))
  const defaultSelectedRange = normalizeRangeValue(local.defaultValue)
  const defaultPickerDate = normalizePickerValue(local.defaultPickerValue)
  const initialViewDate =
    defaultPickerDate ?? defaultSelectedRange[0] ?? defaultSelectedRange[1] ?? dayjs()
  const [innerValue, setInnerValue] = createSignal<RangeTuple>(defaultSelectedRange)
  const [inputValues, setInputValues] = createSignal<[string, string]>(
    rangeStrings(defaultSelectedRange, local.format, picker()),
  )
  const [activeRange, setActiveRange] = createSignal<RangeSide>('start')
  const [selecting, setSelecting] = createSignal(false)
  const [hoverValue, setHoverValue] = createSignal<dayjs.Dayjs | null>(null)
  const [draftRange, setDraftRange] = createSignal<RangeTuple>([null, null])
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [viewMonth, setViewMonth] = createSignal(pickerViewStart(initialViewDate, picker()))
  const [dropdownPosition, setDropdownPosition] = createSignal<JSX.CSSProperties>({})
  let selectorRef: HTMLDivElement | undefined
  let dropdownRef: HTMLDivElement | undefined
  let startInputRef: HTMLInputElement | undefined
  let endInputRef: HTMLInputElement | undefined

  const isValueControlled = () => 'value' in props
  const isOpenControlled = () => 'open' in props
  const isPickerValueControlled = () => 'pickerValue' in props
  const selectedRange = createMemo<RangeTuple>(() =>
    isValueControlled() ? normalizeRangeValue(local.value) : innerValue(),
  )
  const displayValues = createMemo(() => rangeStrings(selectedRange(), local.format, picker()))
  const open = () => (isOpenControlled() ? Boolean(local.open) : innerOpen())
  const panelViewDate = () => normalizePickerValue(local.pickerValue) ?? viewMonth()
  const placeholder = createMemo<[string, string]>(
    () => local.placeholder ?? locale().lang?.rangePlaceholder ?? ['Start date', 'End date'],
  )
  const allDisabled = () =>
    disabledForSide(local.disabled, 'start') && disabledForSide(local.disabled, 'end')

  createEffect(() => setInputValues(displayValues()))
  createEffect(() => {
    const [start, end] = selectedRange()
    if ((start || end) && !isPickerValueControlled())
      setViewMonth(pickerViewStart(start ?? end!, picker()))
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
      local.disabledDate?.(date, { type: picker() }) ||
      isOutOfBounds(date, local.minDate, local.maxDate, picker()),
    )
  }

  function commitValue(nextRange: RangeTuple): void {
    const normalized = filledRange(nextRange)
    if (!isValueControlled()) setInnerValue(nextRange)
    const nextStrings = rangeStrings(nextRange, local.format, picker())
    if (!isValueControlled()) setInputValues(nextStrings)
    local.onChange?.(normalized, nextStrings)
  }

  function emitCalendarChange(nextRange: RangeTuple, range: RangeSide): void {
    local.onCalendarChange?.(
      filledRange(nextRange),
      rangeStrings(nextRange, local.format, picker()),
      {
        range,
      },
    )
  }

  function selectDate(date: dayjs.Dayjs): void {
    if (isDateDisabled(date)) return
    const nextDate = pickerSelectionStart(date, picker())
    if (!selecting() || activeRange() === 'start') {
      const nextRange: RangeTuple = [nextDate, null]
      setDraftRange(nextRange)
      if (!isValueControlled()) setInnerValue(nextRange)
      setInputValues(rangeStrings(nextRange, local.format, picker()))
      emitCalendarChange(nextRange, 'start')
      setSelecting(true)
      setHoverValue(null)
      setActiveRange('end')
      endInputRef?.focus()
      return
    }

    const currentDraft = draftRange()
    const draft: RangeTuple = [currentDraft[0] ?? selectedRange()[0], nextDate]
    const nextRange = local.order === false ? draft : sortRange(draft)
    commitValue(nextRange)
    emitCalendarChange(nextRange, 'end')
    setSelecting(false)
    setHoverValue(null)
    setDraftRange([null, null])
    setActiveRange('start')
    setOpen(false)
  }

  function changeHoverValue(date: dayjs.Dayjs | null): void {
    setHoverValue(selecting() ? date : null)
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
    changePanelView(panelViewDate().subtract(1, 'month'))
  }

  function nextPanel(): void {
    changePanelView(panelViewDate().add(1, 'month'))
  }

  function focusSide(side: RangeSide, event: FocusEvent): void {
    setActiveRange(side)
    setOpen(true)
    ;(local.onFocus as RangeMetaHandler | undefined)?.(event, { range: side })
  }

  function blurSide(side: RangeSide, event: FocusEvent): void {
    ;(local.onBlur as RangeMetaHandler | undefined)?.(event, { range: side })
  }

  function inputId(side: RangeSide): string | undefined {
    if (Array.isArray(local.id)) return local.id[sideIndex(side)]
    return side === 'start' ? local.id : undefined
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
        `${prefixCls()}-range`,
        allDisabled() && `${prefixCls()}-disabled`,
        open() && `${prefixCls()}-open`,
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
        aria-disabled={allDisabled()}
        class={semanticClass('selector', local.classNames, `${prefixCls()}-selector`)}
        style={semanticStyle('selector', local.styles)}
        onClick={() => {
          const target = activeRange() === 'start' ? startInputRef : endInputRef
          target?.focus()
          setOpen(true)
        }}
      >
        <Show when={local.prefix}>
          <span class={`${prefixCls()}-prefix`}>{local.prefix}</span>
        </Show>
        <PickerInput
          id={inputId('start')}
          name={local.name}
          prefixCls={prefixCls()}
          value={inputValues()[0]}
          placeholder={placeholder()[0]}
          disabled={disabledForSide(local.disabled, 'start')}
          readOnly={local.inputReadOnly}
          autoFocus={local.autoFocus}
          allowClear={Boolean(local.allowClear) && Boolean(local.allowEmpty?.[0])}
          clearIcon={typeof local.allowClear === 'object' ? local.allowClear.clearIcon : undefined}
          clearAriaLabel="Clear start date"
          inputClass={semanticClass(
            'input',
            local.classNames,
            `${prefixCls()}-input`,
            `${prefixCls()}-range-input`,
          )}
          inputStyle={semanticStyle('input', local.styles)}
          clearClass={semanticClass('clear', local.classNames, `${prefixCls()}-clear`)}
          clearStyle={semanticStyle('clear', local.styles)}
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
        <span class={`${prefixCls()}-range-separator`}>{local.separator ?? '-'}</span>
        <PickerInput
          id={inputId('end')}
          prefixCls={prefixCls()}
          value={inputValues()[1]}
          placeholder={placeholder()[1]}
          disabled={disabledForSide(local.disabled, 'end')}
          readOnly={local.inputReadOnly}
          allowClear={Boolean(local.allowClear) && Boolean(local.allowEmpty?.[1])}
          clearIcon={typeof local.allowClear === 'object' ? local.allowClear.clearIcon : undefined}
          clearAriaLabel="Clear end date"
          inputClass={semanticClass(
            'input',
            local.classNames,
            `${prefixCls()}-input`,
            `${prefixCls()}-range-input`,
          )}
          inputStyle={semanticStyle('input', local.styles)}
          clearClass={semanticClass('clear', local.classNames, `${prefixCls()}-clear`)}
          clearStyle={semanticStyle('clear', local.styles)}
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
        <Show when={local.suffixIcon}>
          <span class={`${prefixCls()}-suffix`}>{local.suffixIcon}</span>
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
            class={semanticClass('popup', undefined, local.popupClassName, local.dropdownClassName)}
            classNames={local.classNames}
            style={dropdownPosition()}
            mode={picker()}
            renderExtraFooter={local.renderExtraFooter}
            panelRender={local.panelRender}
            onPrevious={previousPanel}
            onNext={nextPanel}
          >
            <DatePanel
              prefixCls={prefixCls()}
              viewDate={panelViewDate()}
              picker={picker()}
              selectedValue={activeRange() === 'start' ? selectedRange()[0] : selectedRange()[1]}
              rangeValue={selectedRange()}
              activeRange={activeRange()}
              hoverValue={hoverValue()}
              disabledDate={isDateDisabled}
              cellRender={local.cellRender}
              dateRender={local.dateRender}
              locale={locale()}
              classNames={local.classNames}
              styles={local.styles}
              onSelect={selectDate}
              onHover={changeHoverValue}
            />
          </PickerPanel>
        </InternalPortal>
      </Show>
    </div>
  )
}
