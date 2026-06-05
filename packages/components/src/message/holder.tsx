import { For, Match, Switch } from 'solid-js'
import { render } from 'solid-js/web'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
  LoadingOutlined,
} from '@ant-design-solid/icons'
import { ConfigProvider, useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useMessageStyle } from './message.style'
import type { Accessor } from 'solid-js'
import type { MessageNotice, MessageType } from './interface'

export interface MessageHolderProps {
  notices: Accessor<MessageNotice[]>
}

function MessageIcon(props: { type: MessageType }) {
  return (
    <Switch>
      <Match when={props.type === 'success'}>
        <CheckCircleFilled />
      </Match>
      <Match when={props.type === 'info'}>
        <InfoCircleFilled />
      </Match>
      <Match when={props.type === 'error'}>
        <CloseCircleFilled />
      </Match>
      <Match when={props.type === 'warning'}>
        <ExclamationCircleFilled />
      </Match>
      <Match when={props.type === 'loading'}>
        <LoadingOutlined />
      </Match>
    </Switch>
  )
}

function MessageHolder(props: MessageHolderProps) {
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-message`
  const [, hashId] = useMessageStyle(prefixCls())
  return (
    <InternalPortal>
      <div class={classNames(prefixCls(), hashId())}>
        <For each={props.notices()}>
          {(notice) => (
            <div
              class={classNames(`${prefixCls()}-notice`, `${prefixCls()}-notice-${notice.type}`)}
            >
              <div class={`${prefixCls()}-notice-content`}>
                <span class={`${prefixCls()}-icon-${notice.type}`} aria-hidden="true">
                  <MessageIcon type={notice.type} />
                </span>
                <span>{notice.content}</span>
              </div>
            </div>
          )}
        </For>
      </div>
    </InternalPortal>
  )
}

export function mountMessageHolder(props: MessageHolderProps) {
  if (!canUseDom()) return () => undefined

  const container = document.createElement('div')
  document.body.appendChild(container)
  const dispose = render(
    () => (
      <ConfigProvider>
        <MessageHolder {...props} />
      </ConfigProvider>
    ),
    container,
  )
  return () => {
    dispose()
    container.remove()
  }
}
