import { createEffect, createMemo, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { CloseCircleFilled } from '@ant-design-solid/icons'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form/context'
import { classNames } from '../shared/class-names'
import { useInputStyle } from './input.style'
import {
  applyExceedFormatter,
  assignRef,
  formatCount,
  focusInput,
  getAllowClearConfig,
  getCount,
  getMaxLength,
  resolveClassNames,
  resolveStyles,
  rootClass,
  rootStyle,
  shouldShowCount,
} from './utils'
import type {
  AutoSizeConfig,
  TextAreaProps,
  TextAreaRef,
  TextAreaSemanticClassNames,
  TextAreaSemanticStyles,
} from './interface'

function getAutoSizeConfig(
  autoSize: boolean | AutoSizeConfig | undefined,
): AutoSizeConfig | undefined {
  if (!autoSize) return undefined
  return typeof autoSize === 'object' ? autoSize : {}
}

export function TextArea(props: TextAreaProps) {
  const [local, rest] = splitProps(props, [
    'ref',
    'rootClassName',
    'prefixCls',
    'value',
    'defaultValue',
    'showCount',
    'size',
    'status',
    'bordered',
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
    'onResize',
  ])
  const config = useConfig()
  const formItem = useFormItemControl()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-input`
  const [, hashId] = useInputStyle(prefixCls())
  const [innerValue, setInnerValue] = createSignal(String(local.defaultValue ?? ''))
  let rootRef: HTMLSpanElement | undefined
  let textAreaRef: HTMLTextAreaElement | undefined

  const value = () => {
    if (formItem?.valuePropName() === 'value') return String(formItem.value() ?? '')
    return String(local.value ?? innerValue())
  }
  const size = () => local.size ?? config.componentSize()
  const variant = () => local.variant ?? (local.bordered === false ? 'borderless' : 'outlined')
  const allowClearConfig = () => getAllowClearConfig(local.allowClear)
  const showClear = () => Boolean(allowClearConfig() && !allowClearConfig()?.disabled && value())
  const maxLength = () => getMaxLength(rest.maxLength, local.count)
  const characterCount = () => getCount(value(), local.count)
  const countInfo = () => ({ value: value(), count: characterCount(), maxLength: maxLength() })
  const autoSizeConfig = () => getAutoSizeConfig(local.autoSize)
  const rows = () => autoSizeConfig()?.minRows ?? rest.rows
  const lineHeight = 24
  const semanticProps = (): TextAreaProps => ({
    ...props,
    value: value(),
    size: size(),
    variant: variant(),
  })
  const semanticClassNames = createMemo<TextAreaSemanticClassNames>(() =>
    resolveClassNames(local.classNames, semanticProps()),
  )
  const semanticStyles = createMemo<TextAreaSemanticStyles>(() =>
    resolveStyles(local.styles, semanticProps()),
  )

  const textAreaApiRef: TextAreaRef = {
    focus: (options) => focusInput(textAreaRef, options),
    blur: () => textAreaRef?.blur(),
    get resizableTextArea() {
      return { textArea: textAreaRef }
    },
    get nativeElement() {
      return rootRef
    },
  }
  assignRef(local.ref, textAreaApiRef)

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
      ref={(el) => {
        rootRef = el
      }}
      class={classNames(
        `${prefixCls()}-textarea-wrapper`,
        size() === 'small' && `${prefixCls()}-textarea-wrapper-sm`,
        size() === 'large' && `${prefixCls()}-textarea-wrapper-lg`,
        local.status && `${prefixCls()}-status-${local.status}`,
        local.disabled && `${prefixCls()}-disabled`,
        `${prefixCls()}-variant-${variant()}`,
        maxLength() !== undefined &&
          characterCount() > maxLength()! &&
          `${prefixCls()}-count-exceed`,
        hashId(),
        local.rootClassName,
        rootClass(semanticClassNames()),
      )}
      style={rootStyle(semanticStyles())}
    >
      <textarea
        {...rest}
        ref={(el) => {
          textAreaRef = el
        }}
        rows={rows()}
        class={classNames(`${prefixCls()}-textarea`, local.class, semanticClassNames().textarea)}
        style={{
          ...semanticStyles().textarea,
          ...(autoSizeConfig()?.maxRows
            ? { 'max-height': `${autoSizeConfig()!.maxRows! * lineHeight}px`, 'overflow-y': 'auto' }
            : {}),
          ...(local.autoSize ? { resize: 'none' } : {}),
        }}
        disabled={local.disabled}
        value={value()}
        onInput={(event) => {
          if (local.disabled) {
            resetDisabledValue()
            return
          }
          setNextValue(event.currentTarget.value)
          ;(local.onInput as JSX.EventHandler<HTMLTextAreaElement, InputEvent> | undefined)?.(event)
          syncForm(event, 'onInput')
        }}
        onChange={(event) => {
          if (local.disabled) {
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
        onResize={() =>
          local.onResize?.({
            width: textAreaRef?.offsetWidth ?? 0,
            height: textAreaRef?.offsetHeight ?? 0,
          })
        }
      />
      {showClear() && (
        <button
          type="button"
          aria-label="clear textarea"
          class={classNames(`${prefixCls()}-clear`, semanticClassNames().clear)}
          style={semanticStyles().clear}
          onClick={clearValue}
        >
          {allowClearConfig()?.clearIcon ?? <CloseCircleFilled />}
        </button>
      )}
      {shouldShowCount(local.showCount, local.count) && (
        <span
          class={classNames(`${prefixCls()}-textarea-count`, semanticClassNames().count)}
          style={semanticStyles().count}
        >
          {formatCount(local.showCount, local.count, countInfo())}
        </span>
      )}
    </span>
  )
}
