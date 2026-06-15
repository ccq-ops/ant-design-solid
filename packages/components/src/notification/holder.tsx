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
  NotificationKey,
  NotificationNotice,
  NotificationPlacement,
  NotificationType,
} from './interface'

export interface NotificationHolderProps {
  notices: Accessor<NotificationNotice[]>
  close: (key: NotificationKey) => void
  pause: (key: NotificationKey) => void
  resume: (key: NotificationKey) => void
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
  if (
    notice.closable &&
    typeof notice.closable === 'object' &&
    notice.closable.closeIcon !== undefined
  ) {
    return notice.closable.closeIcon
  }
  if (notice.closeIcon !== undefined && notice.closeIcon !== true) return notice.closeIcon
  return <CloseOutlined />
}

function semanticClassNames(
  config: NotificationConfig,
  notice: NotificationNotice,
): Partial<Record<string, string>> {
  const info = { props: notice.props }
  const configClassNames =
    typeof config.classNames === 'function' ? config.classNames(info) : config.classNames
  const noticeClassNames =
    typeof notice.classNames === 'function' ? notice.classNames(info) : notice.classNames
  return { ...configClassNames, ...noticeClassNames }
}

function semanticStyles(
  config: NotificationConfig,
  notice: NotificationNotice,
): Partial<Record<string, import('solid-js').JSX.CSSProperties>> {
  const info = { props: notice.props }
  const configStyles = typeof config.styles === 'function' ? config.styles(info) : config.styles
  const noticeStyles = typeof notice.styles === 'function' ? notice.styles(info) : notice.styles
  return { ...configStyles, ...noticeStyles }
}

function configClassNames(config: NotificationConfig): Partial<Record<string, string>> {
  return typeof config.classNames === 'function'
    ? config.classNames({ props: undefined })
    : (config.classNames ?? {})
}

function configStyles(
  config: NotificationConfig,
): Partial<Record<string, import('solid-js').JSX.CSSProperties>> {
  return typeof config.styles === 'function'
    ? config.styles({ props: undefined })
    : (config.styles ?? {})
}

function stackThreshold(stack: NotificationConfig['stack']) {
  if (stack === false) return Number.POSITIVE_INFINITY
  if (typeof stack === 'object') return stack.threshold ?? 3
  return stack ? 3 : Number.POSITIVE_INFINITY
}

export function NotificationHolder(props: NotificationHolderProps) {
  const config = useConfig()
  const holderConfig = () => ({
    closeIcon: config.notification().closeIcon,
    classNames: config.notification().classNames,
    styles: config.notification().styles,
    ...props.config,
  })
  const prefixBase = () => holderConfig().prefixCls ?? config.prefixCls()
  const prefixCls = () => `${prefixBase()}-notification`
  const [, hashId] = useNotificationStyle(prefixCls())
  const byPlacement = (placement: NotificationPlacement) =>
    props.notices().filter((item) => item.placement === placement)

  return (
    <InternalPortal mount={holderConfig().getContainer?.()}>
      <For each={placements}>
        {(placement) => {
          const placementNotices = () => byPlacement(placement)
          const stacked = () => placementNotices().length > stackThreshold(holderConfig().stack)
          const placementClasses = () => configClassNames(holderConfig())
          const placementStyles = () => configStyles(holderConfig())
          return (
            <div
              class={classNames(
                `${prefixCls()}-${classByPlacement[placement]}`,
                stacked() && `${prefixCls()}-stack`,
                holderConfig().rtl && `${prefixCls()}-rtl`,
                hashId(),
              )}
              style={{
                top: placement.startsWith('top') ? `${holderConfig().top ?? 24}px` : undefined,
                bottom: placement.startsWith('bottom')
                  ? `${holderConfig().bottom ?? 24}px`
                  : undefined,
              }}
            >
              <div
                class={classNames(
                  `${prefixCls()}-list`,
                  stacked() && `${prefixCls()}-list-stacked`,
                  placementClasses().list,
                )}
                style={placementStyles().list}
              >
                <div
                  class={classNames(`${prefixCls()}-list-content`, placementClasses().listContent)}
                  style={placementStyles().listContent}
                >
                  <For each={placementNotices()}>
                    {(notice) => {
                      const classes = () => semanticClassNames(holderConfig(), notice)
                      const styles = () => semanticStyles(holderConfig(), notice)
                      return (
                        <div
                          class={classNames(`${prefixCls()}-notice-wrapper`, classes().wrapper)}
                          style={styles().wrapper}
                        >
                          <div
                            {...notice.props}
                            class={classNames(
                              `${prefixCls()}-notice`,
                              stacked() && `${prefixCls()}-notice-stacked`,
                              notice.type && `${prefixCls()}-notice-${notice.type}`,
                              shouldShowClose(notice) && `${prefixCls()}-notice-closable`,
                              notice.class,
                              classes().root,
                            )}
                            style={{ ...notice.style, ...styles().root }}
                            role={notice.props?.role ?? notice.role ?? 'alert'}
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
                                class={classNames(`${prefixCls()}-notice-close`, classes().close)}
                                style={styles().close}
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
                              class={classNames(`${prefixCls()}-notice-section`, classes().section)}
                              style={styles().section}
                            >
                              <div
                                class={classNames(`${prefixCls()}-notice-title`, classes().title)}
                                style={styles().title}
                              >
                                <Show when={notice.icon ?? notice.type}>
                                  <span
                                    class={classNames(
                                      `${prefixCls()}-notice-icon`,
                                      notice.type && `${prefixCls()}-notice-icon-${notice.type}`,
                                      classes().icon,
                                    )}
                                    style={styles().icon}
                                    aria-hidden="true"
                                  >
                                    {notice.icon ?? <NotificationIcon type={notice.type!} />}
                                  </span>
                                </Show>
                                {notice.title}
                              </div>
                              <Show when={notice.description}>
                                <div
                                  class={classNames(
                                    `${prefixCls()}-notice-description`,
                                    classes().description,
                                  )}
                                  style={styles().description}
                                >
                                  {notice.description}
                                </div>
                              </Show>
                              <Show when={notice.actions}>
                                <div
                                  class={classNames(
                                    `${prefixCls()}-notice-actions`,
                                    classes().actions,
                                  )}
                                  style={styles().actions}
                                >
                                  {notice.actions}
                                </div>
                              </Show>
                            </div>
                            <Show
                              when={notice.showProgress && notice.duration && notice.duration > 0}
                            >
                              <div
                                class={classNames(
                                  `${prefixCls()}-notice-progress`,
                                  classes().progress,
                                )}
                                style={{
                                  'animation-duration': `${notice.duration || 0}s`,
                                  ...styles().progress,
                                }}
                              />
                            </Show>
                          </div>
                        </div>
                      )
                    }}
                  </For>
                </div>
              </div>
            </div>
          )
        }}
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
      <ConfigProvider prefixCls={props.config.prefixCls}>
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
