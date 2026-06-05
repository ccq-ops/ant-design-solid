import { CloseCircleFilled } from '@ant-design-solid/icons'
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
import { addDocumentPointerDown, addPositionUpdateListeners } from '../shared/overlay'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useZIndex } from '../shared/z-index'
import { dayjs, isOutOfBounds, monthStart, normalizeDateValue, samePickerValue } from './date-utils'
import { useDatePickerStyle } from './date-picker.style'
import { formatDayjs, parseDayjs } from './format-utils'
import type { DatePickerProps, DatePickerValue } from './interface'
import { mergeDatePickerLocale } from './locale'
import { semanticClass, semanticStyle } from './semantic'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function monthDates(value: dayjs.Dayjs): Array<dayjs.Dayjs | null> {
  const firstDate = monthStart(value)
  const dates: Array<dayjs.Dayjs | null> = Array.from({ length: firstDate.day() }, () => null)
  for (let day = 1; day <= firstDate.daysInMonth(); day += 1) dates.push(firstDate.date(day))
  return dates
}

export function DatePicker(props: DatePickerProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'format',
    'picker',
    'placeholder',
    'disabled',
    'allowClear',
    'autoFocus',
    'inputReadOnly',
    'open',
    'defaultOpen',
    'disabledDate',
    'minDate',
    'maxDate',
    'locale',
    'prefixCls',
    'class',
    'style',
    'classNames',
    'styles',
    'popupClassName',
    'dropdownClassName',
    'popupStyle',
    'onChange',
    'onOpenChange',
    'onKeyDown',
    'zIndex',
    'getPopupContainer',
    'id',
    'name',
    'prefix',
    'suffixIcon',
    'separator',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-date-picker`
  const [, hashId] = useDatePickerStyle(prefixCls())
  const [dropdownZIndex] = useZIndex('DatePicker', local.zIndex)
  const picker = () => local.picker ?? 'date'
  const locale = createMemo(() => mergeDatePickerLocale(local.locale))
  const defaultSelectedDate = normalizeDateValue(local.defaultValue)
  const initialViewDate = defaultSelectedDate ?? dayjs()
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
  const dates = createMemo(() => monthDates(viewMonth()))
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
      local.disabledDate?.(date) || isOutOfBounds(date, local.minDate, local.maxDate, picker()),
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
      setInputValue(displayValue())
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
        <input
          id={local.id}
          name={local.name}
          ref={(element) => {
            inputRef = element
          }}
          role="textbox"
          aria-label={rest['aria-label']}
          class={semanticClass('input', local.classNames, `${prefixCls()}-input`)}
          style={semanticStyle('input', local.styles)}
          value={inputValue()}
          placeholder={placeholder()}
          disabled={disabled()}
          readOnly={local.inputReadOnly}
          autofocus={local.autoFocus}
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
        />
        <Show when={local.allowClear && !disabled() && displayValue() !== ''}>
          <button
            type="button"
            aria-label="Clear date"
            class={semanticClass('clear', local.classNames, `${prefixCls()}-clear`)}
            style={semanticStyle('clear', local.styles)}
            onClick={clearValue}
          >
            {typeof local.allowClear === 'object' && local.allowClear.clearIcon ? (
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
            style={dropdownPosition()}
          >
            <div class={`${prefixCls()}-header`}>
              <button
                type="button"
                aria-label="Previous month"
                class={`${prefixCls()}-month-button`}
                onClick={() => setViewMonth(viewMonth().subtract(1, 'month'))}
              >
                ‹
              </button>
              <div class={`${prefixCls()}-month-label`}>{viewMonth().format('YYYY-MM')}</div>
              <button
                type="button"
                aria-label="Next month"
                class={`${prefixCls()}-month-button`}
                onClick={() => setViewMonth(viewMonth().add(1, 'month'))}
              >
                ›
              </button>
            </div>
            <div class={`${prefixCls()}-weekdays`}>
              <For each={WEEKDAYS}>
                {(weekday) => <div class={`${prefixCls()}-weekday`}>{weekday}</div>}
              </For>
            </div>
            <div class={`${prefixCls()}-grid`}>
              <For each={dates()}>
                {(date) => (
                  <Show when={date} fallback={<div class={`${prefixCls()}-empty-cell`} />}>
                    {(currentDate) => {
                      const cellDate = currentDate()
                      const dateString = () => cellDate.format('YYYY-MM-DD')
                      const cellDisabled = () => isDateDisabled(cellDate)
                      const selected = () => samePickerValue(selectedDate(), cellDate, picker())
                      return (
                        <button
                          type="button"
                          aria-label={dateString()}
                          aria-pressed={selected()}
                          aria-disabled={cellDisabled()}
                          class={semanticClass(
                            'cell',
                            local.classNames,
                            `${prefixCls()}-cell`,
                            samePickerValue(dayjs(), cellDate, 'date') &&
                              `${prefixCls()}-cell-today`,
                            selected() && `${prefixCls()}-cell-selected`,
                            cellDisabled() && `${prefixCls()}-cell-disabled`,
                          )}
                          style={semanticStyle('cell', local.styles)}
                          onClick={() => selectDate(cellDate)}
                        >
                          {cellDate.date()}
                        </button>
                      )
                    }}
                  </Show>
                )}
              </For>
            </div>
          </div>
        </InternalPortal>
      </Show>
    </div>
  )
}
