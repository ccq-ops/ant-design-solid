import { createMemo, createSignal, Show, splitProps } from 'solid-js'
import { CloseCircleFilled } from '@ant-design-solid/solid-icons'
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
import type { JSX } from 'solid-js'
import type {
  InputProps,
  InputRef,
  InputSemanticClassNames,
  InputSemanticStyles,
} from './interface'

export function Input(props: InputProps) {
  const [local, rest] = splitProps(props, [
    'ref',
    'rootClassName',
    'prefixCls',
    'size',
    'status',
    'addonBefore',
    'addonAfter',
    'bordered',
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
    'htmlSize',
    'classNames',
    'styles',
  ])
  const config = useConfig()
  const inputConfig = () => config.input()
  const formItem = useFormItemControl()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-input`
  const [, hashId] = useInputStyle(prefixCls())
  const [innerValue, setInnerValue] = createSignal(String(local.defaultValue ?? ''))
  const value = () => {
    if (formItem?.valuePropName() === 'value') {
      return String(formItem.value() ?? '')
    }
    return String(local.value ?? innerValue())
  }
  const disabled = () => local.disabled ?? formItem?.disabled?.() ?? config.componentDisabled()
  const size = () => local.size ?? formItem?.size?.() ?? config.componentSize()
  const variant = () =>
    local.variant ??
    inputConfig().variant ??
    (local.bordered === false ? 'borderless' : (formItem?.variant?.() ?? config.variant()))
  const allowClearConfig = () => getAllowClearConfig(local.allowClear ?? inputConfig().allowClear)
  const showClear = () => Boolean(allowClearConfig() && !allowClearConfig()?.disabled && value())
  const showSuffixWithClear = () => Boolean(local.suffix && showClear())
  const maxLength = () => getMaxLength(rest.maxLength, local.count)
  const characterCount = () => getCount(value(), local.count)
  const countInfo = () => ({ value: value(), count: characterCount(), maxLength: maxLength() })
  const semanticProps = (): InputProps => ({
    ...props,
    value: value(),
    size: size(),
    variant: variant(),
  })
  const semanticClassNames = createMemo<InputSemanticClassNames>(() =>
    resolveClassNames(local.classNames ?? inputConfig().classNames, semanticProps()),
  )
  const semanticStyles = createMemo<InputSemanticStyles>(() =>
    resolveStyles(local.styles ?? inputConfig().styles, semanticProps()),
  )
  let rootRef: HTMLSpanElement | undefined
  let inputRef: HTMLInputElement | undefined

  const inputApiRef: InputRef = {
    focus: (options) => focusInput(inputRef, options),
    blur: () => inputRef?.blur(),
    setSelectionRange: (start, end, direction) =>
      inputRef?.setSelectionRange(start, end, direction),
    select: () => inputRef?.select(),
    get input() {
      return inputRef
    },
    get nativeElement() {
      return rootRef
    },
  }
  assignRef(local.ref, inputApiRef)

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

  const inputNode = (includeRootProps = true) => (
    <span
      ref={(el) => {
        rootRef = el
      }}
      class={classNames(
        `${prefixCls()}-affix-wrapper`,
        size() === 'small' && `${prefixCls()}-sm`,
        size() === 'large' && `${prefixCls()}-lg`,
        local.status && `${prefixCls()}-status-${local.status}`,
        disabled() && `${prefixCls()}-disabled`,
        `${prefixCls()}-variant-${variant()}`,
        maxLength() !== undefined &&
          characterCount() > maxLength()! &&
          `${prefixCls()}-count-exceed`,
        hashId(),
        includeRootProps && local.rootClassName,
        includeRootProps && inputConfig().class,
        includeRootProps && local.class,
        includeRootProps && rootClass(semanticClassNames()),
      )}
      style={
        includeRootProps ? { ...inputConfig().style, ...rootStyle(semanticStyles()) } : undefined
      }
    >
      <Show when={local.prefix}>
        <span
          class={classNames(`${prefixCls()}-prefix`, semanticClassNames().prefix)}
          style={semanticStyles().prefix}
        >
          {local.prefix}
        </span>
      </Show>
      <input
        {...rest}
        ref={(el) => {
          inputRef = el
        }}
        class={classNames(
          prefixCls(),
          `${prefixCls()}-variant-${variant()}`,
          inputConfig().class,
          semanticClassNames().input,
        )}
        style={semanticStyles().input}
        disabled={disabled()}
        size={local.htmlSize}
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
                class={classNames(`${prefixCls()}-clear`, semanticClassNames().clear)}
                style={semanticStyles().clear}
                onClick={clearValue}
              >
                {allowClearConfig()?.clearIcon ?? <CloseCircleFilled />}
              </button>
            </Show>
            <Show when={local.suffix}>
              <span
                class={classNames(`${prefixCls()}-suffix`, semanticClassNames().suffix)}
                style={semanticStyles().suffix}
              >
                {local.suffix}
              </span>
            </Show>
          </>
        }
      >
        <span class={`${prefixCls()}-suffix-wrapper`}>
          <span
            class={classNames(`${prefixCls()}-suffix`, semanticClassNames().suffix)}
            style={semanticStyles().suffix}
          >
            {local.suffix}
          </span>
          <button
            type="button"
            aria-label="clear input"
            class={classNames(`${prefixCls()}-clear`, semanticClassNames().clear)}
            style={semanticStyles().clear}
            onClick={clearValue}
          >
            {allowClearConfig()?.clearIcon ?? <CloseCircleFilled />}
          </button>
        </span>
      </Show>
      <Show when={shouldShowCount(local.showCount, local.count)}>
        <span
          class={classNames(`${prefixCls()}-count`, semanticClassNames().count)}
          style={semanticStyles().count}
        >
          {formatCount(local.showCount, local.count, countInfo())}
        </span>
      </Show>
    </span>
  )

  if (!local.addonBefore && !local.addonAfter) return inputNode()

  return (
    <span
      class={classNames(
        `${prefixCls()}-group-wrapper`,
        hashId(),
        local.rootClassName,
        inputConfig().class,
        local.class,
        rootClass(semanticClassNames()),
      )}
      style={rootStyle(semanticStyles())}
    >
      <span class={`${prefixCls()}-wrapper`}>
        <Show when={local.addonBefore}>
          <span class={`${prefixCls()}-group-addon`}>{local.addonBefore}</span>
        </Show>
        {inputNode(false)}
        <Show when={local.addonAfter}>
          <span class={`${prefixCls()}-group-addon`}>{local.addonAfter}</span>
        </Show>
      </span>
    </span>
  )
}
