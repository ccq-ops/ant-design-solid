import { Match, Show, Switch, createSignal, splitProps } from 'solid-js'
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
import type { AlertProps } from './interface'

export function Alert(props: AlertProps) {
  const [closed, setClosed] = createSignal(false)
  const [local, rest] = splitProps(props, [
    'type',
    'message',
    'description',
    'closable',
    'showIcon',
    'action',
    'afterClose',
    'onClose',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-alert`
  const [, hashId] = useAlertStyle(prefixCls())
  const type = () => local.type ?? 'info'

  const close = (event: MouseEvent) => {
    local.onClose?.(event)
    setClosed(true)
    local.afterClose?.()
  }

  return (
    <Show when={!closed()}>
      <div
        {...rest}
        role="alert"
        class={classNames(
          prefixCls(),
          `${prefixCls()}-${type()}`,
          Boolean(local.description) && `${prefixCls()}-with-description`,
          hashId(),
          local.class,
        )}
        classList={local.classList}
        style={local.style}
      >
        <Show when={local.showIcon}>
          <span class={`${prefixCls()}-icon`}>
            <Switch>
              <Match when={type() === 'success'}>
                <CheckCircleFilled />
              </Match>
              <Match when={type() === 'info'}>
                <InfoCircleFilled />
              </Match>
              <Match when={type() === 'warning'}>
                <ExclamationCircleFilled />
              </Match>
              <Match when={type() === 'error'}>
                <CloseCircleFilled />
              </Match>
            </Switch>
          </span>
        </Show>
        <div class={`${prefixCls()}-content`}>
          <div class={`${prefixCls()}-message`}>{local.message}</div>
          <Show when={local.description}>
            <div class={`${prefixCls()}-description`}>{local.description}</div>
          </Show>
        </div>
        <Show when={local.action}>
          <div class={`${prefixCls()}-action`}>{local.action}</div>
        </Show>
        <Show when={local.closable}>
          <button
            type="button"
            class={`${prefixCls()}-close`}
            aria-label="close alert"
            onClick={close}
          >
            <CloseOutlined />
          </button>
        </Show>
      </div>
    </Show>
  )
}
