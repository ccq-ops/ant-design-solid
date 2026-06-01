import { For, Show } from 'solid-js'
import { render } from 'solid-js/web'
import { ConfigProvider, useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { InternalPortal, canUseDom } from '../shared/portal'
import { useNotificationStyle } from './notification.style'
import type { Accessor } from 'solid-js'
import type { NotificationNotice, NotificationPlacement, NotificationType } from './interface'

export interface NotificationHolderProps {
  notices: Accessor<NotificationNotice[]>
  close: (key: string) => void
}

const placements: NotificationPlacement[] = ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']
const classByPlacement: Record<NotificationPlacement, string> = {
  topLeft: 'top-left',
  topRight: 'top-right',
  bottomLeft: 'bottom-left',
  bottomRight: 'bottom-right',
}
const iconMap: Record<NotificationType, string> = {
  success: '✓',
  info: 'ℹ',
  warning: '!',
  error: '×',
}

function NotificationHolder(props: NotificationHolderProps) {
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-notification`
  const [, hashId] = useNotificationStyle(prefixCls())
  const byPlacement = (placement: NotificationPlacement) =>
    props.notices().filter((item) => item.placement === placement)

  return (
    <InternalPortal>
      <For each={placements}>
        {(placement) => (
          <div class={classNames(`${prefixCls()}-${classByPlacement[placement]}`, hashId())}>
            <For each={byPlacement(placement)}>
              {(notice) => (
                <div
                  class={classNames(
                    `${prefixCls()}-notice`,
                    notice.type && `${prefixCls()}-notice-${notice.type}`,
                  )}
                >
                  <button
                    type="button"
                    class={`${prefixCls()}-notice-close`}
                    aria-label="close notification"
                    onClick={() => props.close(notice.key)}
                  >
                    ×
                  </button>
                  <div class={`${prefixCls()}-notice-message`}>
                    <Show when={notice.type}>
                      {(type) => (
                        <span class={`${prefixCls()}-icon-${type()}`} aria-hidden="true">
                          {iconMap[type()]}
                        </span>
                      )}
                    </Show>
                    {notice.message}
                  </div>
                  <Show when={notice.description}>
                    <div class={`${prefixCls()}-notice-description`}>{notice.description}</div>
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
  document.body.appendChild(container)
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
