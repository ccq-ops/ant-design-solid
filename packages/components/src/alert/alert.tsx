import { Match, Show, Switch, createMemo, createSignal, splitProps } from 'solid-js'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  CloseOutlined,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from '@ant-design-solid/icons'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useAlertStyle } from './alert.style'
import type { AlertClosableConfig, AlertProps } from './interface'

function isClosableConfig(closable: AlertProps['closable']): closable is AlertClosableConfig {
  return typeof closable === 'object' && closable !== null
}

function AlertIcon(props: { type: () => NonNullable<AlertProps['type']> }) {
  return (
    <Switch>
      <Match when={props.type() === 'success'}>
        <CheckCircleFilled />
      </Match>
      <Match when={props.type() === 'info'}>
        <InfoCircleFilled />
      </Match>
      <Match when={props.type() === 'warning'}>
        <ExclamationCircleFilled />
      </Match>
      <Match when={props.type() === 'error'}>
        <CloseCircleFilled />
      </Match>
    </Switch>
  )
}

export function Alert(props: AlertProps) {
  const [closed, setClosed] = createSignal(false)
  const [local, rest] = splitProps(props, [
    'type',
    'title',
    'message',
    'description',
    'closable',
    'showIcon',
    'icon',
    'action',
    'banner',
    'afterClose',
    'onClose',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-alert`
  const [, hashId] = useAlertStyle(prefixCls())
  const type = () => local.type ?? (local.banner ? 'warning' : 'info')
  const shouldShowIcon = () => local.showIcon ?? Boolean(local.banner)
  const closableConfig = createMemo(() =>
    isClosableConfig(local.closable) ? local.closable : undefined,
  )
  const isClosable = () => Boolean(local.closable)
  const messageNode = () => local.title ?? local.message
  const closeButtonProps = createMemo(() => {
    const closable = closableConfig()
    if (!closable) return {}
    const {
      closeIcon: _closeIcon,
      afterClose: _afterClose,
      onClose: _onClose,
      ...buttonProps
    } = closable
    return buttonProps
  })

  const close = (event: MouseEvent) => {
    local.onClose?.(event)
    closableConfig()?.onClose?.(event)
    setClosed(true)
    local.afterClose?.()
    closableConfig()?.afterClose?.()
  }

  return (
    <Show when={!closed()}>
      <div
        {...rest}
        role="alert"
        class={classNames(
          prefixCls(),
          `${prefixCls()}-${type()}`,
          local.banner && `${prefixCls()}-banner`,
          Boolean(local.description) && `${prefixCls()}-with-description`,
          hashId(),
          local.class,
        )}
        classList={local.classList}
        style={local.style}
      >
        <Show when={shouldShowIcon()}>
          <span class={`${prefixCls()}-icon`}>{local.icon ?? <AlertIcon type={type} />}</span>
        </Show>
        <div class={`${prefixCls()}-content`}>
          <div class={`${prefixCls()}-message`}>{messageNode()}</div>
          <Show when={local.description}>
            <div class={`${prefixCls()}-description`}>{local.description}</div>
          </Show>
        </div>
        <Show when={local.action}>
          <div class={`${prefixCls()}-action`}>{local.action}</div>
        </Show>
        <Show when={isClosable()}>
          <button
            {...closeButtonProps()}
            type="button"
            class={classNames(`${prefixCls()}-close`, closeButtonProps().class)}
            aria-label={closeButtonProps()['aria-label'] ?? 'close alert'}
            onClick={close}
          >
            {closableConfig()?.closeIcon ?? <CloseOutlined />}
          </button>
        </Show>
      </div>
    </Show>
  )
}
