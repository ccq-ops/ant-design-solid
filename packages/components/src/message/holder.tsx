import { For, Match, Show, Switch, createMemo } from 'solid-js'
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
import { canUseDom } from '../shared/portal'
import { useMessageStyle } from './message.style'
import type { Accessor, JSX } from 'solid-js'
import type {
  MessageConfigOptions,
  MessageKey,
  MessageNotice,
  MessageSemanticClassNames,
  MessageSemanticStyles,
  MessageVisualType,
} from './interface'

export interface MessageHolderProps {
  notices: Accessor<MessageNotice[]>
  config?: Accessor<MessageConfigOptions>
  onMouseEnter?: (key: MessageKey) => void
  onMouseLeave?: (key: MessageKey) => void
}

function MessageIcon(props: { type: MessageVisualType }) {
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

function px(value: string | number | undefined) {
  if (typeof value === 'number') return `${value}px`
  return value
}

function normalizeStyle(style: JSX.CSSProperties | undefined): JSX.CSSProperties | undefined {
  if (!style) return undefined
  const result: Record<string, string | number | undefined> = {}
  Object.entries(style as Record<string, string | number | undefined>).forEach(([key, value]) => {
    result[key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)] = value
  })
  return result as JSX.CSSProperties
}

function resolveClassNames(
  value:
    | MessageSemanticClassNames
    | ((info: { props: MessageNotice }) => MessageSemanticClassNames)
    | undefined,
  notice: MessageNotice,
) {
  return typeof value === 'function' ? value({ props: notice }) : value
}

function resolveStyles(
  value:
    | MessageSemanticStyles
    | ((info: { props: MessageNotice }) => MessageSemanticStyles)
    | undefined,
  notice: MessageNotice,
) {
  return typeof value === 'function' ? value({ props: notice }) : value
}

function mergeClassNames(
  global:
    | MessageSemanticClassNames
    | ((info: { props: MessageNotice }) => MessageSemanticClassNames)
    | undefined,
  local:
    | MessageSemanticClassNames
    | ((info: { props: MessageNotice }) => MessageSemanticClassNames)
    | undefined,
  notice: MessageNotice,
): MessageSemanticClassNames {
  const g = resolveClassNames(global, notice)
  const l = resolveClassNames(local, notice)
  return {
    root: classNames(g?.root, g?.list, l?.root, l?.list),
    list: classNames(g?.list, l?.list),
    listContent: classNames(g?.listContent, l?.listContent),
    wrapper: classNames(g?.wrapper, l?.wrapper),
    icon: classNames(g?.icon, l?.icon),
    title: classNames(g?.title, l?.title),
  }
}

function mergeStyles(
  global:
    | MessageSemanticStyles
    | ((info: { props: MessageNotice }) => MessageSemanticStyles)
    | undefined,
  local:
    | MessageSemanticStyles
    | ((info: { props: MessageNotice }) => MessageSemanticStyles)
    | undefined,
  notice: MessageNotice,
): MessageSemanticStyles {
  const g = resolveStyles(global, notice)
  const l = resolveStyles(local, notice)
  return {
    root: { ...g?.root, ...g?.list, ...l?.root, ...l?.list },
    list: { ...g?.list, ...l?.list },
    listContent: { ...g?.listContent, ...l?.listContent },
    wrapper: { ...g?.wrapper, ...l?.wrapper },
    icon: { ...g?.icon, ...l?.icon },
    title: { ...g?.title, ...l?.title },
  }
}

export function MessageHolder(props: MessageHolderProps) {
  const context = useConfig()
  const cfg = () => props.config?.() ?? {}
  const prefixCls = () => cfg().prefixCls ?? `${context.prefixCls()}-message`
  const [, hashId] = useMessageStyle(prefixCls())
  const visibleNotices = createMemo(() => {
    const stack = cfg().stack
    if (!stack) return props.notices()
    const threshold = typeof stack === 'object' ? (stack.threshold ?? 3) : 3
    return props.notices().slice(-threshold)
  })
  const firstNotice = () => visibleNotices()[0] ?? ({ content: '' } as MessageNotice)
  const holderClassNames = () => mergeClassNames(cfg().classNames, firstNotice().classNames, firstNotice())
  const holderStyles = () => mergeStyles(cfg().styles, firstNotice().styles, firstNotice())

  return (
    <div
      class={classNames(
        prefixCls(),
        cfg().rtl ? `${prefixCls()}-rtl` : undefined,
        hashId(),
        holderClassNames().root,
      )}
      style={{ top: px(cfg().top ?? 8), ...normalizeStyle(holderStyles().root) }}
    >
      <For each={visibleNotices()}>
        {(notice) => {
          const semanticClassNames = () => mergeClassNames(cfg().classNames, notice.classNames, notice)
          const semanticStyles = () => mergeStyles(cfg().styles, notice.styles, notice)
          const pauseOnHover = () => notice.pauseOnHover ?? cfg().pauseOnHover ?? true
          return (
            <div
              class={classNames(
                `${prefixCls()}-notice`,
                `${prefixCls()}-notice-${notice.type}`,
                notice.className,
                semanticClassNames().wrapper,
              )}
              style={{ ...normalizeStyle(notice.style), ...normalizeStyle(semanticStyles().wrapper) }}
            >
              <div
                class={classNames(`${prefixCls()}-notice-content`, semanticClassNames().listContent)}
                style={normalizeStyle(semanticStyles().listContent)}
                onClick={(event) => notice.onClick?.(event)}
                onMouseEnter={() => pauseOnHover() && props.onMouseEnter?.(notice.key)}
                onMouseLeave={() => pauseOnHover() && props.onMouseLeave?.(notice.key)}
              >
                <span
                  class={classNames(`${prefixCls()}-icon-${notice.type}`, semanticClassNames().icon)}
                  style={normalizeStyle(semanticStyles().icon)}
                  aria-hidden="true"
                >
                  <Show when={notice.icon} fallback={<MessageIcon type={notice.type} />}>
                    {notice.icon}
                  </Show>
                </span>
                <span
                  class={classNames(`${prefixCls()}-title`, semanticClassNames().title)}
                  style={normalizeStyle(semanticStyles().title)}
                >
                  {notice.content}
                </span>
              </div>
            </div>
          )
        }}
      </For>
    </div>
  )
}

export function createMessageHolder(props: MessageHolderProps): JSX.Element {
  return <MessageHolder {...props} />
}

export function mountMessageHolder(props: MessageHolderProps) {
  if (!canUseDom()) return () => undefined

  const container = document.createElement('div')
  const parent = props.config?.().getContainer?.() ?? document.body
  parent.appendChild(container)
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
