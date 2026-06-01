import { createSignal, Show, splitProps } from 'solid-js'
import { CloseCircleIcon } from '@ant-design-solid/icons'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/classNames'
import { useInputStyle } from './input.style'
import type { JSX } from 'solid-js'
import type { InputProps } from './interface'
export function Input(props: InputProps) {
  const [local, rest] = splitProps(props, ['size', 'status', 'prefix', 'suffix', 'allowClear', 'class', 'disabled', 'value', 'defaultValue', 'onInput', 'onChange'])
  const config = useConfig(); const prefixCls = () => `${config.prefixCls()}-input`; const [, hashId] = useInputStyle(prefixCls()); const [innerValue, setInnerValue] = createSignal(String(local.defaultValue ?? '')); const value = () => String(local.value ?? innerValue()); const size = () => local.size ?? config.componentSize(); let inputRef: HTMLInputElement | undefined
  return <span class={classNames(`${prefixCls()}-affix-wrapper`, size() === 'small' && `${prefixCls()}-sm`, size() === 'large' && `${prefixCls()}-lg`, local.status && `${prefixCls()}-status-${local.status}`, local.disabled && `${prefixCls()}-disabled`, hashId(), local.class)}><Show when={local.prefix}><span class={`${prefixCls()}-prefix`}>{local.prefix}</span></Show><input {...rest} ref={inputRef} class={prefixCls()} disabled={local.disabled} value={value()} onInput={(event) => { setInnerValue(event.currentTarget.value); (local.onInput as JSX.EventHandler<HTMLInputElement, InputEvent> | undefined)?.(event) }} onChange={(event) => (local.onChange as JSX.EventHandler<HTMLInputElement, Event> | undefined)?.(event)} /><Show when={local.allowClear && value()}><button type="button" aria-label="clear input" class={`${prefixCls()}-clear`} onClick={() => { setInnerValue(''); if (inputRef) inputRef.value = ''; (local.onChange as JSX.EventHandler<HTMLInputElement, Event> | undefined)?.({ currentTarget: inputRef ?? ({} as HTMLInputElement), target: inputRef ?? ({} as HTMLInputElement) } as Event & { currentTarget: HTMLInputElement; target: HTMLInputElement }) }}><CloseCircleIcon /></button></Show><Show when={local.suffix}><span class={`${prefixCls()}-suffix`}>{local.suffix}</span></Show></span>
}
