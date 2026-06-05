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
import { dayjs, isOutOfBounds, monthStart, normalizeDateValue, samePickerValue } from './date-utils'
import { DatePanel } from './date-panel'
import { useDatePickerStyle } from './date-picker.style'
import { formatDayjs, parseDayjs } from './format-utils'
import type { DatePickerProps, DatePickerValue } from './interface'
import { mergeDatePickerLocale } from './locale'
import { PickerInput } from './picker-input'
import { PickerPanel } from './picker-panel'
import { semanticClass, semanticStyle } from './semantic'

export function DatePicker(props: DatePickerProps) {
  const ariaLabel = () => props['aria-label'] as string | undefined
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'defaultPickerValue',
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
    'onKeyDown',
    'onOk',
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
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-date-picker`
  const [, hashId] = useDatePickerStyle(prefixCls())
  const [dropdownZIndex] = useZIndex('DatePicker', local.zIndex)
  const picker = () => local.picker ?? 'date'
  const locale = createMemo(() => mergeDatePickerLocale(local.locale))
  const defaultSelectedDate = normalizeDateValue(local.defaultValue)
  const defaultPickerDate = normalizeDateValue(local.defaultPickerValue)
  const initialViewDate = defaultPickerDate ?? defaultSelectedDate ?? dayjs()
  const [innerValue, setInnerValue] = createSignal<DatePickerValue>(defaultSelectedDate)
  const [inputValue, setInputValue] = createSignal(
    formatDayjs(defaultSelectedDate, local.format, picker()),
  )
  const [innerOpen, setInnerOpen] = createSignal(Boolean(local.defaultOpen))
  const [viewMonth, setViewMonth] = createSignal(monthStart(initialViewDate))
  const [dropdownPosition, setDropdownPosition] = createSignal<JSX.CSSProperties>({})
  let selectorRef: HTMLDivElement | undefined
  let inputRef: HTMLInputElement | undefined
  let dropdownRef: HTMLDivElement | undefined

  const isValueControlled = () => 'value' in props
  const isOpenControlled = () => 'open' in props
  const disabled = () => Boolean(local.disabled)
  const selectedDate = createMemo(() =>
    isValueControlled() ? normalizeDateValue(local.value) : innerValue(),
  )
  const displayValue = createMemo(() => formatDayjs(selectedDate(), local.format, picker()))
  const open = () => (isOpenControlled() ? Boolean(local.open) : innerOpen())
  const placeholder = () => local.placeholder ?? locale().lang?.placeholder ?? 'Select date'

  createEffect(() => setInputValue(displayValue()))
  createEffect(() => {
    const selected = selectedDate()
    if (selected) setViewMonth(monthStart(selected))
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
    const nextString = formatDayjs(nextDate, local.format, picker())
    if (!isValueControlled()) setInputValue(nextString)
    local.onChange?.(nextDate, nextString)
  }

  function selectDate(date: dayjs.Dayjs): void {
    if (isDateDisabled(date)) return
    changeValue(date)
    if (local.needConfirm) return
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
    const parsed = parseDayjs(rawValue, local.format, picker())
    if (!parsed || isDateDisabled(parsed)) {
      if (!local.preserveInvalidOnBlur) setInputValue(displayValue())
      return
    }
    if (samePickerValue(parsed, currentValue, picker())) {
      setInputValue(formatDayjs(parsed, local.format, picker()))
    } else {
      changeValue(parsed)
    }
    setViewMonth(monthStart(parsed))
    if (closePopup) setOpen(false)
  }

  function clearValue(event: MouseEvent): void {
    event.stopPropagation()
    changeValue(null)
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
          onFocus={() => setOpen(true)}
          onBlur={() => parseInput(false)}
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
            viewDate={viewMonth()}
            placement={local.placement}
            class={semanticClass('popup', undefined, local.popupClassName, local.dropdownClassName)}
            classNames={local.classNames}
            style={dropdownPosition()}
            mode={picker()}
            renderExtraFooter={local.renderExtraFooter}
            panelRender={local.panelRender}
            needConfirm={local.needConfirm}
            onOk={() => local.onOk?.(selectedDate())}
            onPrevious={() => setViewMonth(viewMonth().subtract(1, 'month'))}
            onNext={() => setViewMonth(viewMonth().add(1, 'month'))}
          >
            <DatePanel
              prefixCls={prefixCls()}
              viewDate={viewMonth()}
              picker={picker()}
              selectedValue={selectedDate()}
              disabledDate={isDateDisabled}
              cellRender={local.cellRender}
              dateRender={local.dateRender}
              locale={locale()}
              classNames={local.classNames}
              styles={local.styles}
              onSelect={selectDate}
            />
          </PickerPanel>
        </InternalPortal>
      </Show>
    </div>
  )
}
