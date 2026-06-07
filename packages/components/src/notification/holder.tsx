import { For, Match, Show, Switch } from 'solid-js'
import { render } from 'solid-js/web'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  CloseOutlined,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from '@ant-design-solid/icons'
import { ConfigProvider, useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useNotificationStyle } from './notification.style'
import type { Accessor } from 'solid-js'
import type {
  NotificationConfig,
  NotificationNotice,
  NotificationPlacement,
  NotificationType,
} from './interface'

export interface NotificationHolderProps {
  notices: Accessor<NotificationNotice[]>
  close: (key: string) => void
  pause: (key: string) => void
  resume: (key: string) => void
  config: NotificationConfig
}

const placements: NotificationPlacement[] = [
  'top',
  'topLeft',
  'topRight',
  'bottom',
  'bottomLeft',
  'bottomRight',
]
const classByPlacement: Record<NotificationPlacement, string> = {
  top: 'top',
  topLeft: 'top-left',
  topRight: 'top-right',
  bottom: 'bottom',
  bottomLeft: 'bottom-left',
  bottomRight: 'bottom-right',
}
function NotificationIcon(props: { type: NotificationType }) {
  return (
    <Switch>
      <Match when={props.type === 'success'}>
        <CheckCircleFilled />
      </Match>
      <Match when={props.type === 'info'}>
        <InfoCircleFilled />
      </Match>
      <Match when={props.type === 'warning'}>
        <ExclamationCircleFilled />
      </Match>
      <Match when={props.type === 'error'}>
        <CloseCircleFilled />
      </Match>
    </Switch>
  )
}

function shouldShowClose(notice: NotificationNotice) {
  if (notice.closable === false) return false
  if (notice.closeIcon === false || notice.closeIcon === null) return false
  return true
}

function closeIcon(notice: NotificationNotice) {
  if (typeof notice.closable === 'object' && notice.closable.closeIcon !== undefined) {
    return notice.closable.closeIcon
  }
  if (notice.closeIcon !== undefined && notice.closeIcon !== true) return notice.closeIcon
  return <CloseOutlined />
}

function NotificationHolder(props: NotificationHolderProps) {
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-notification`
  const [, hashId] = useNotificationStyle(prefixCls())
  const byPlacement = (placement: NotificationPlacement) =>
    props.notices().filter((item) => item.placement === placement)

  return (
    <InternalPortal mount={props.config.getContainer?.()}>
      <For each={placements}>
        {(placement) => (
          <div
            class={classNames(
              `${prefixCls()}-${classByPlacement[placement]}`,
              props.config.rtl && `${prefixCls()}-rtl`,
              hashId(),
            )}
            style={{
              top: placement.startsWith('top') ? `${props.config.top ?? 24}px` : undefined,
              bottom: placement.startsWith('bottom') ? `${props.config.bottom ?? 24}px` : undefined,
            }}
          >
            <For each={byPlacement(placement)}>
              {(notice) => (
                <div
                  {...notice.props}
                  class={classNames(
                    `${prefixCls()}-notice`,
                    notice.type && `${prefixCls()}-notice-${notice.type}`,
                    notice.className,
                    notice.classNames?.notice,
                  )}
                  style={{ ...notice.style, ...notice.styles?.notice }}
                  role={notice.role ?? 'alert'}
                  onClick={notice.onClick}
                  onMouseEnter={() => {
                    if (notice.pauseOnHover !== false) props.pause(notice.key)
                  }}
                  onMouseLeave={() => {
                    if (notice.pauseOnHover !== false) props.resume(notice.key)
                  }}
                >
                  <Show when={shouldShowClose(notice)}>
                    <button
                      type="button"
                      class={classNames(`${prefixCls()}-notice-close`, notice.classNames?.close)}
                      style={notice.styles?.close}
                      aria-label="close notification"
                      onClick={(event) => {
                        event.stopPropagation()
                        props.close(notice.key)
                      }}
                    >
                      {closeIcon(notice)}
                    </button>
                  </Show>
                  <div
                    class={classNames(`${prefixCls()}-notice-message`, notice.classNames?.message)}
                    style={notice.styles?.message}
                  >
                    <Show when={notice.icon ?? notice.type}>
                      <span
                        class={classNames(
                          `${prefixCls()}-icon`,
                          notice.type && `${prefixCls()}-icon-${notice.type}`,
                          notice.classNames?.icon,
                        )}
                        style={notice.styles?.icon}
                        aria-hidden="true"
                      >
                        {notice.icon ?? <NotificationIcon type={notice.type!} />}
                      </span>
                    </Show>
                    {notice.title ?? notice.message}
                  </div>
                  <Show when={notice.description}>
                    <div
                      class={classNames(
                        `${prefixCls()}-notice-description`,
                        notice.classNames?.description,
                      )}
                      style={notice.styles?.description}
                    >
                      {notice.description}
                    </div>
                  </Show>
                  <Show when={notice.actions ?? notice.btn}>
                    <div
                      class={classNames(
                        `${prefixCls()}-notice-actions`,
                        notice.classNames?.actions,
                      )}
                      style={notice.styles?.actions}
                    >
                      {notice.actions ?? notice.btn}
                    </div>
                  </Show>
                  <Show when={notice.showProgress && notice.duration && notice.duration > 0}>
                    <div
                      class={classNames(
                        `${prefixCls()}-notice-progress`,
                        notice.classNames?.progress,
                      )}
                      style={{
                        'animation-duration': `${notice.duration || 0}s`,
                        ...notice.styles?.progress,
                      }}
                    />
                  </Show>
                </div>
              )}
            </For>
          </div>
        )}
      </For>
    </InternalPortal>
  )
}

export function mountNotificationHolder(props: NotificationHolderProps) {
  if (!canUseDom()) return () => undefined

  const container = document.createElement('div')
  ;(props.config.getContainer?.() ?? document.body).appendChild(container)
  const dispose = render(
    () => (
      <ConfigProvider>
        <NotificationHolder {...props} />
      </ConfigProvider>
    ),
    container,
  )
  return () => {
    dispose()
    container.remove()
  }
}
