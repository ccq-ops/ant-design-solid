import { Show, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useTagStyle } from './tag.style'
import type { JSX } from 'solid-js'
import type { CheckableTagProps } from './interface'

export function CheckableTag(props: CheckableTagProps) {
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'checked',
    'icon',
    'disabled',
    'class',
    'children',
    'onChange',
    'onClick',
    'onKeyDown',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-tag`
  const [, hashId] = useTagStyle(prefixCls())

  function triggerChange(): void {
    if (local.disabled) return
    local.onChange?.(!local.checked)
  }

  function handleClick(event: MouseEvent): void {
    if (local.disabled) return
    triggerChange()
    ;(local.onClick as JSX.EventHandler<HTMLSpanElement, MouseEvent> | undefined)?.(event as never)
  }

  function handleKeyDown(event: KeyboardEvent): void {
    ;(local.onKeyDown as JSX.EventHandler<HTMLSpanElement, KeyboardEvent> | undefined)?.(
      event as never,
    )
    if (event.defaultPrevented || local.disabled || event.key !== ' ') return
    event.preventDefault()
    triggerChange()
  }

  return (
    <span
      {...rest}
      role="checkbox"
      aria-checked={local.checked}
      aria-disabled={local.disabled || undefined}
      tabIndex={local.disabled ? -1 : 0}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-checkable`,
        local.checked && `${prefixCls()}-checkable-checked`,
        local.disabled && `${prefixCls()}-checkable-disabled`,
        hashId(),
        local.class,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <Show when={local.icon}>{local.icon}</Show>
      <span>{local.children}</span>
    </span>
  )
}
