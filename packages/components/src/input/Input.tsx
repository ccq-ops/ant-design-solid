import { createSignal, Show, splitProps } from 'solid-js'
import { CloseCircleIcon } from '@ant-design-solid/icons'
import { useConfig } from '../config-provider'
import { useFormItemControl } from '../form/context'
import { classNames } from '../shared/classNames'
import { useInputStyle } from './input.style'
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
  let inputRef: HTMLInputElement | undefined

  function syncForm(
    event: Event & { currentTarget: HTMLInputElement; target: Element },
    handlerName: 'onInput' | 'onChange' | 'onBlur',
  ) {
    if (!formItem || formItem.valuePropName() !== 'value') return
    const trigger = formItem.trigger()
    if (trigger === handlerName || (trigger === 'onChange' && handlerName === 'onInput'))
      formItem.setFieldValueFromControl(event)
  }

  function clearValue() {
    setInnerValue('')
    if (inputRef) inputRef.value = ''
    const event = {
      currentTarget: inputRef ?? ({} as HTMLInputElement),
      target: inputRef ?? ({} as HTMLInputElement),
    } as Event & { currentTarget: HTMLInputElement; target: HTMLInputElement }
    ;(local.onChange as JSX.EventHandler<HTMLInputElement, Event> | undefined)?.(event)
    syncForm(event, 'onChange')
  }

  return (
    <span
      class={classNames(
        `${prefixCls()}-affix-wrapper`,
        size() === 'small' && `${prefixCls()}-sm`,
        size() === 'large' && `${prefixCls()}-lg`,
        local.status && `${prefixCls()}-status-${local.status}`,
        local.disabled && `${prefixCls()}-disabled`,
        hashId(),
        local.class,
      )}
    >
      <Show when={local.prefix}>
        <span class={`${prefixCls()}-prefix`}>{local.prefix}</span>
      </Show>
      <input
        {...rest}
        ref={(el) => {
          inputRef = el
        }}
        class={prefixCls()}
        disabled={local.disabled}
        value={value()}
        onInput={(event) => {
          setInnerValue(event.currentTarget.value)
          ;(local.onInput as JSX.EventHandler<HTMLInputElement, InputEvent> | undefined)?.(event)
          syncForm(event, 'onInput')
        }}
        onChange={(event) => {
          setInnerValue(event.currentTarget.value)
          ;(local.onChange as JSX.EventHandler<HTMLInputElement, Event> | undefined)?.(event)
          syncForm(event, 'onChange')
        }}
        onBlur={(event) => {
          ;(local.onBlur as JSX.EventHandler<HTMLInputElement, FocusEvent> | undefined)?.(event)
          syncForm(event, 'onBlur')
        }}
      />
      <Show when={local.allowClear && value()}>
        <button
          type="button"
          aria-label="clear input"
          class={`${prefixCls()}-clear`}
          onClick={clearValue}
        >
          <CloseCircleIcon />
        </button>
      </Show>
      <Show when={local.suffix}>
        <span class={`${prefixCls()}-suffix`}>{local.suffix}</span>
      </Show>
    </span>
  )
}
