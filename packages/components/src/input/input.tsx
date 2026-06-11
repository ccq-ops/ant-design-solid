import { createSignal, Show, splitProps } from 'solid-js'
import { CloseCircleFilled } from '@ant-design-solid/icons'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form/context'
import { classNames } from '../shared/class-names'
import { useInputStyle } from './input.style'
import {
  applyExceedFormatter,
  formatCount,
  getAllowClearConfig,
  getCount,
  getMaxLength,
  shouldShowCount,
} from './utils'
import type { JSX } from 'solid-js'
import type { InputProps } from './interface'

export function Input(props: InputProps) {
  const [local, rest] = splitProps(props, [
    'size',
    'status',
    'prefix',
    'suffix',
    'allowClear',
    'class',
    'disabled',
    'value',
    'defaultValue',
    'onInput',
    'onChange',
    'onBlur',
    'onKeyDown',
    'onPressEnter',
    'onClear',
    'variant',
    'showCount',
    'count',
    'classNames',
    'styles',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => `${config.prefixCls()}-input`
  const [, hashId] = useInputStyle(prefixCls())
  const [innerValue, setInnerValue] = createSignal(String(local.defaultValue ?? ''))
  const value = () => {
    if (formItem?.valuePropName() === 'value') {
      return String(formItem.value() ?? '')
    }
    return String(local.value ?? innerValue())
  }
  const size = () => local.size ?? config.componentSize()
  const variant = () => local.variant ?? 'outlined'
  const allowClearConfig = () => getAllowClearConfig(local.allowClear)
  const showClear = () => Boolean(allowClearConfig() && !allowClearConfig()?.disabled && value())
  const showSuffixWithClear = () => Boolean(local.suffix && showClear())
  const maxLength = () => getMaxLength(rest.maxLength, local.count)
  const characterCount = () => getCount(value(), local.count)
  const countInfo = () => ({ value: value(), count: characterCount(), maxLength: maxLength() })
  let inputRef: HTMLInputElement | undefined

  function syncForm(
    event: Event & { currentTarget: HTMLInputElement; target: Element },
    handlerName: 'onInput' | 'onChange' | 'onBlur',
  ) {
    if (!formItem || formItem.valuePropName() !== 'value') return
    const trigger = formItem.trigger()
    const validateTrigger = formItem.validateTrigger?.() ?? trigger
    const validateTriggers = Array.isArray(validateTrigger) ? validateTrigger : [validateTrigger]
    const matchesValueTrigger =
      trigger === handlerName || (trigger === 'onChange' && handlerName === 'onInput')
    const matchesValidateTrigger =
      validateTriggers.includes(handlerName) ||
      (validateTriggers.includes('onChange') && handlerName === 'onInput')
    if (matchesValueTrigger) {
      formItem.setFieldValueFromControl(event, trigger)
      return
    }
    if (matchesValidateTrigger) formItem.validate(handlerName)
  }

  function setNextValue(nextValue: string) {
    setInnerValue(applyExceedFormatter(nextValue, local.count))
  }

  function clearValue() {
    setInnerValue('')
    if (inputRef) inputRef.value = ''
    const event = {
      currentTarget: inputRef ?? ({} as HTMLInputElement),
      target: inputRef ?? ({} as HTMLInputElement),
    } as Event & { currentTarget: HTMLInputElement; target: HTMLInputElement }
    local.onClear?.()
    ;(local.onChange as JSX.EventHandler<HTMLInputElement, Event> | undefined)?.(event)
    syncForm(event, 'onChange')
  }

  function handleKeyDown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
    ;(local.onKeyDown as unknown as ((event: KeyboardEvent) => void) | undefined)?.(event)
    if (event.key === 'Enter') {
      ;(local.onPressEnter as unknown as ((event: KeyboardEvent) => void) | undefined)?.(event)
    }
  }

  return (
    <span
      class={classNames(
        `${prefixCls()}-affix-wrapper`,
        size() === 'small' && `${prefixCls()}-sm`,
        size() === 'large' && `${prefixCls()}-lg`,
        local.status && `${prefixCls()}-status-${local.status}`,
        local.disabled && `${prefixCls()}-disabled`,
        `${prefixCls()}-variant-${variant()}`,
        maxLength() !== undefined &&
          characterCount() > maxLength()! &&
          `${prefixCls()}-count-exceed`,
        hashId(),
        local.class,
        local.classNames?.wrapper,
      )}
      style={local.styles?.wrapper}
    >
      <Show when={local.prefix}>
        <span
          class={classNames(`${prefixCls()}-prefix`, local.classNames?.prefix)}
          style={local.styles?.prefix}
        >
          {local.prefix}
        </span>
      </Show>
      <input
        {...rest}
        ref={(el) => {
          inputRef = el
        }}
        class={classNames(prefixCls(), local.classNames?.input)}
        style={local.styles?.input}
        disabled={local.disabled}
        value={value()}
        onInput={(event) => {
          setNextValue(event.currentTarget.value)
          ;(local.onInput as JSX.EventHandler<HTMLInputElement, InputEvent> | undefined)?.(event)
          syncForm(event, 'onInput')
        }}
        onChange={(event) => {
          setNextValue(event.currentTarget.value)
          ;(local.onChange as JSX.EventHandler<HTMLInputElement, Event> | undefined)?.(event)
          syncForm(event, 'onChange')
        }}
        onBlur={(event) => {
          ;(local.onBlur as JSX.EventHandler<HTMLInputElement, FocusEvent> | undefined)?.(event)
          syncForm(event, 'onBlur')
        }}
        onKeyDown={handleKeyDown as JSX.EventHandler<HTMLInputElement, KeyboardEvent>}
      />
      <Show
        when={showSuffixWithClear()}
        fallback={
          <>
            <Show when={showClear()}>
              <button
                type="button"
                aria-label="clear input"
                class={classNames(`${prefixCls()}-clear`, local.classNames?.clear)}
                style={local.styles?.clear}
                onClick={clearValue}
              >
                {allowClearConfig()?.clearIcon ?? <CloseCircleFilled />}
              </button>
            </Show>
            <Show when={local.suffix}>
              <span
                class={classNames(`${prefixCls()}-suffix`, local.classNames?.suffix)}
                style={local.styles?.suffix}
              >
                {local.suffix}
              </span>
            </Show>
          </>
        }
      >
        <span class={`${prefixCls()}-suffix-wrapper`}>
          <span
            class={classNames(`${prefixCls()}-suffix`, local.classNames?.suffix)}
            style={local.styles?.suffix}
          >
            {local.suffix}
          </span>
          <button
            type="button"
            aria-label="clear input"
            class={classNames(`${prefixCls()}-clear`, local.classNames?.clear)}
            style={local.styles?.clear}
            onClick={clearValue}
          >
            {allowClearConfig()?.clearIcon ?? <CloseCircleFilled />}
          </button>
        </span>
      </Show>
      <Show when={shouldShowCount(local.showCount, local.count)}>
        <span
          class={classNames(`${prefixCls()}-count`, local.classNames?.count)}
          style={local.styles?.count}
        >
          {formatCount(local.showCount, local.count, countInfo())}
        </span>
      </Show>
    </span>
  )
}
