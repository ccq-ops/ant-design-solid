import { For, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useRateStyle } from './rate.style'
import type { RateCharacterRender, RateProps } from './interface'

const DEFAULT_CHARACTER = '★'

function isCharacterRender(character: RateProps['character']): character is RateCharacterRender {
  return typeof character === 'function'
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function Rate(props: RateProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'count',
    'allowHalf',
    'allowClear',
    'disabled',
    'character',
    'tooltips',
    'onChange',
    'onHoverChange',
    'class',
    'onKeyDown',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-rate`
  const [, hashId] = useRateStyle(prefixCls())
  const [innerValue, setInnerValue] = createSignal(local.defaultValue ?? 0)
  const [hoverValue, setHoverValue] = createSignal<number | undefined>()

  const count = () => Math.max(0, Math.floor(local.count ?? 5))
  const allowClear = () => local.allowClear ?? true
  const mergedValue = () => clamp(local.value ?? innerValue(), 0, count())
  const displayValue = () => hoverValue() ?? mergedValue()
  const indexes = () => Array.from({ length: count() }, (_, index) => index)

  function setValue(nextValue: number): void {
    const next = clamp(nextValue, 0, count())
    if (local.value === undefined) setInnerValue(next)
    local.onChange?.(next)
  }

  function getItemValue(index: number, event?: MouseEvent | PointerEvent): number {
    const fullValue = index + 1
    if (!local.allowHalf || !event) return fullValue

    const target = eventTargetElement(event)
    const rect = target?.getBoundingClientRect()
    if (!rect || rect.width <= 0) return fullValue

    return event.clientX - rect.left <= rect.width / 2 ? fullValue - 0.5 : fullValue
  }

  function eventTargetElement(event: Pick<Event, 'currentTarget'>): HTMLElement | undefined {
    return event.currentTarget instanceof HTMLElement ? event.currentTarget : undefined
  }

  function changeValue(nextValue: number): void {
    if (local.disabled) return
    const next = allowClear() && nextValue === mergedValue() ? 0 : nextValue
    setValue(next)
  }

  function handleKeyDown(event: KeyboardEvent): void {
    ;(local.onKeyDown as ((event: KeyboardEvent) => void) | undefined)?.(event)
    if (event.defaultPrevented || local.disabled) return

    const step = local.allowHalf ? 0.5 : 1
    let nextValue: number | undefined

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        nextValue = mergedValue() + step
        break
      case 'ArrowLeft':
      case 'ArrowDown':
        nextValue = mergedValue() - step
        break
      case 'Home':
        nextValue = count() > 0 ? step : 0
        break
      case 'End':
        nextValue = count()
        break
      default:
        return
    }

    event.preventDefault()
    setValue(clamp(nextValue, 0, count()))
  }

  function renderCharacter(index: number) {
    return isCharacterRender(local.character)
      ? local.character(index)
      : (local.character ?? DEFAULT_CHARACTER)
  }

  function itemState(index: number): 'zero' | 'half' | 'full' {
    const value = displayValue()
    const fullValue = index + 1
    if (value >= fullValue) return 'full'
    if (local.allowHalf && value + 0.5 === fullValue) return 'half'
    return 'zero'
  }

  function itemAriaLabel(index: number): string {
    const fullValue = index + 1
    const state = itemState(index)
    const value = state === 'half' ? fullValue - 0.5 : fullValue
    return `${value} of ${count()}`
  }

  return (
    <div
      {...rest}
      role="radiogroup"
      aria-disabled={local.disabled || undefined}
      tabIndex={local.disabled ? undefined : (rest.tabIndex ?? 0)}
      class={classNames(
        prefixCls(),
        local.disabled && `${prefixCls()}-disabled`,
        hashId(),
        local.class,
      )}
      onKeyDown={handleKeyDown}
      onPointerLeave={(event) => {
        ;(rest.onPointerLeave as ((event: PointerEvent) => void) | undefined)?.(event)
        if (local.disabled) return
        setHoverValue(undefined)
        local.onHoverChange?.(0)
      }}
    >
      <For each={indexes()}>
        {(index) => (
          <button
            type="button"
            role="radio"
            aria-checked={displayValue() > index && displayValue() <= index + 1}
            aria-label={itemAriaLabel(index)}
            title={local.tooltips?.[index]}
            disabled={local.disabled}
            class={classNames(`${prefixCls()}-item`, `${prefixCls()}-item-${itemState(index)}`)}
            onClick={(event) => changeValue(getItemValue(index, event))}
            onPointerMove={(event) => {
              if (local.disabled) return
              const next = getItemValue(index, event)
              setHoverValue(next)
              local.onHoverChange?.(next)
            }}
          >
            <span class={`${prefixCls()}-item-first`} aria-hidden="true">
              {renderCharacter(index)}
            </span>
            <span class={`${prefixCls()}-item-second`} aria-hidden="true">
              {renderCharacter(index)}
            </span>
          </button>
        )}
      </For>
    </div>
  )
}
