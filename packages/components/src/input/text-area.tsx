import { createEffect, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
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
import type { AutoSizeConfig, TextAreaProps } from './interface'

function getAutoSizeConfig(
  autoSize: boolean | AutoSizeConfig | undefined,
): AutoSizeConfig | undefined {
  if (!autoSize) return undefined
  return typeof autoSize === 'object' ? autoSize : {}
}

export function TextArea(props: TextAreaProps) {
  const [local, rest] = splitProps(props, [
    'value',
    'defaultValue',
    'showCount',
    'status',
    'class',
    'disabled',
    'onInput',
    'onChange',
    'onBlur',
    'onKeyDown',
    'onPressEnter',
    'onClear',
    'allowClear',
    'variant',
    'count',
    'autoSize',
    'classNames',
    'styles',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => `${config.prefixCls()}-input`
  const [, hashId] = useInputStyle(prefixCls())
  const [innerValue, setInnerValue] = createSignal(String(local.defaultValue ?? ''))
  let textAreaRef: HTMLTextAreaElement | undefined

  const value = () => {
    if (formItem?.valuePropName() === 'value') return String(formItem.value() ?? '')
    return String(local.value ?? innerValue())
  }
  const disabled = () => local.disabled ?? formItem?.disabled?.() ?? false
  const variant = () => local.variant ?? formItem?.variant?.() ?? 'outlined'
  const allowClearConfig = () => getAllowClearConfig(local.allowClear)
  const showClear = () => Boolean(allowClearConfig() && !allowClearConfig()?.disabled && value())
  const maxLength = () => getMaxLength(rest.maxLength, local.count)
  const characterCount = () => getCount(value(), local.count)
  const countInfo = () => ({ value: value(), count: characterCount(), maxLength: maxLength() })
  const autoSizeConfig = () => getAutoSizeConfig(local.autoSize)
  const rows = () => autoSizeConfig()?.minRows ?? rest.rows
  const lineHeight = 24

  createEffect(() => {
    if (textAreaRef) textAreaRef.value = value()
  })

  function resetDisabledValue() {
    if (textAreaRef) textAreaRef.value = value()
  }

  function syncForm(
    event: Event & { currentTarget: HTMLTextAreaElement; target: Element },
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
    if (textAreaRef) textAreaRef.value = ''
    const event = {
      currentTarget: textAreaRef ?? ({} as HTMLTextAreaElement),
      target: textAreaRef ?? ({} as HTMLTextAreaElement),
    } as Event & { currentTarget: HTMLTextAreaElement; target: HTMLTextAreaElement }
    local.onClear?.()
    ;(local.onChange as JSX.EventHandler<HTMLTextAreaElement, Event> | undefined)?.(event)
    syncForm(event, 'onChange')
  }

  function handleKeyDown(event: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) {
    ;(local.onKeyDown as unknown as ((event: KeyboardEvent) => void) | undefined)?.(event)
    if (event.key === 'Enter') {
      ;(local.onPressEnter as unknown as ((event: KeyboardEvent) => void) | undefined)?.(event)
    }
  }

  return (
    <span
      class={classNames(
        `${prefixCls()}-textarea-wrapper`,
        local.status && `${prefixCls()}-status-${local.status}`,
        disabled() && `${prefixCls()}-disabled`,
        `${prefixCls()}-variant-${variant()}`,
        maxLength() !== undefined &&
          characterCount() > maxLength()! &&
          `${prefixCls()}-count-exceed`,
        hashId(),
        local.classNames?.wrapper,
      )}
      style={local.styles?.wrapper}
    >
      <textarea
        {...rest}
        ref={(el) => {
          textAreaRef = el
        }}
        rows={rows()}
        class={classNames(`${prefixCls()}-textarea`, local.class, local.classNames?.textarea)}
        style={{
          ...local.styles?.textarea,
          ...(autoSizeConfig()?.maxRows
            ? { 'max-height': `${autoSizeConfig()!.maxRows! * lineHeight}px`, 'overflow-y': 'auto' }
            : {}),
          ...(local.autoSize ? { resize: 'none' } : {}),
        }}
        disabled={disabled()}
        value={value()}
        onInput={(event) => {
          if (disabled()) {
            resetDisabledValue()
            return
          }
          setNextValue(event.currentTarget.value)
          ;(local.onInput as JSX.EventHandler<HTMLTextAreaElement, InputEvent> | undefined)?.(event)
          syncForm(event, 'onInput')
        }}
        onChange={(event) => {
          if (disabled()) {
            resetDisabledValue()
            return
          }
          setNextValue(event.currentTarget.value)
          ;(local.onChange as JSX.EventHandler<HTMLTextAreaElement, Event> | undefined)?.(event)
          syncForm(event, 'onChange')
        }}
        onBlur={(event) => {
          ;(local.onBlur as JSX.EventHandler<HTMLTextAreaElement, FocusEvent> | undefined)?.(event)
          syncForm(event, 'onBlur')
        }}
        onKeyDown={handleKeyDown as JSX.EventHandler<HTMLTextAreaElement, KeyboardEvent>}
      />
      {showClear() && (
        <button
          type="button"
          aria-label="clear textarea"
          class={classNames(`${prefixCls()}-clear`, local.classNames?.clear)}
          style={local.styles?.clear}
          onClick={clearValue}
        >
          {allowClearConfig()?.clearIcon ?? <CloseCircleFilled />}
        </button>
      )}
      {shouldShowCount(local.showCount, local.count) && (
        <span
          class={classNames(`${prefixCls()}-textarea-count`, local.classNames?.count)}
          style={local.styles?.count}
        >
          {formatCount(local.showCount, local.count, countInfo())}
        </span>
      )}
    </span>
  )
}
