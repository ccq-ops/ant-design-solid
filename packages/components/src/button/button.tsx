import { Show, splitProps } from 'solid-js'
import { LoadingOutlined } from '@ant-design-solid/icons'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useButtonStyle } from './button.style'
import type { JSX } from 'solid-js'
import type { ButtonProps } from './interface'
export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, [
    'type',
    'size',
    'htmlType',
    'loading',
    'danger',
    'block',
    'class',
    'children',
    'disabled',
    'onClick',
    'icon',
    'iconPosition',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-btn`
  const [, hashId] = useButtonStyle(prefixCls())
  const size = () => local.size ?? config.componentSize()
  const disabled = () => Boolean(local.disabled || local.loading)
  const iconPosition = () => local.iconPosition ?? 'start'
  const iconNode = () => (local.loading ? <LoadingOutlined /> : local.icon)
  const renderIcon = () => (
    <Show when={iconNode()}>
      {(icon) => (
        <span class={classNames(`${prefixCls()}-icon`, `${prefixCls()}-icon-${iconPosition()}`)}>
          {icon()}
        </span>
      )}
    </Show>
  )
  return (
    <button
      {...rest}
      type={local.htmlType ?? 'button'}
      disabled={disabled()}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${local.type ?? 'default'}`,
        size() === 'small' && `${prefixCls()}-sm`,
        size() === 'large' && `${prefixCls()}-lg`,
        local.danger && `${prefixCls()}-dangerous`,
        local.block && `${prefixCls()}-block`,
        local.loading && `${prefixCls()}-loading`,
        hashId(),
        local.class,
      )}
      onClick={(event) => {
        if (disabled()) return
        ;(local.onClick as JSX.EventHandler<HTMLButtonElement, MouseEvent> | undefined)?.(event)
      }}
    >
      <Show when={iconPosition() === 'start'}>{renderIcon()}</Show>
      {local.children}
      <Show when={iconPosition() === 'end'}>{renderIcon()}</Show>
    </button>
  )
}
