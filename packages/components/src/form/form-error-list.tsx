import { For, Show } from 'solid-js'
import { useConfig } from '../config-provider'
import type { FormErrorListProps } from './interface'

export function FormErrorList(props: FormErrorListProps) {
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-form`
  const errors = () => props.errors ?? []
  const warnings = () => props.warnings ?? []

  return (
    <Show when={errors().length > 0 || warnings().length > 0}>
      <div class={`${prefixCls()}-item-explain`}>
        <For each={errors()}>
          {(error) => <div class={`${prefixCls()}-item-explain-error`}>{error}</div>}
        </For>
        <For each={warnings()}>
          {(warning) => <div class={`${prefixCls()}-item-explain-warning`}>{warning}</div>}
        </For>
      </div>
    </Show>
  )
}
