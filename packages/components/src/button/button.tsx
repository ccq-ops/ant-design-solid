import { Show, createEffect, createSignal, onCleanup, splitProps } from 'solid-js'
import { LoadingOutlined } from '@ant-design-solid/icons'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useButtonStyle } from './button.style'
import type { JSX } from 'solid-js'
import type {
  ButtonColor,
  ButtonLoading,
  ButtonLoadingConfig,
  ButtonProps,
  ButtonType,
  ButtonVariant,
} from './interface'

function isLoadingConfig(loading: ButtonLoading | undefined): loading is ButtonLoadingConfig {
  return typeof loading === 'object' && loading !== null
}

function getTypeColor(type?: ButtonType): ButtonColor {
  if (type === 'primary' || type === 'link') return 'primary'
  return 'default'
}

function getTypeVariant(type?: ButtonType): ButtonVariant {
  switch (type) {
    case 'primary':
      return 'solid'
    case 'dashed':
      return 'dashed'
    case 'text':
      return 'text'
    case 'link':
      return 'link'
    default:
      return 'outlined'
  }
}

function spaceChildren(children: JSX.Element, autoInsertSpace: boolean): JSX.Element {
  if (!autoInsertSpace || typeof children !== 'string') return children
  return /^[\u4e00-\u9fa5]{2}$/.test(children) ? `${children[0]} ${children[1]}` : children
}

export function Button(props: ButtonProps) {
  const [local, rest] = splitProps(props, [
    'type',
    'size',
    'htmlType',
    'loading',
    'danger',
    'block',
    'ghost',
    'href',
    'target',
    'shape',
    'color',
    'variant',
    'class',
    'children',
    'disabled',
    'onClick',
    'icon',
    'iconPosition',
    'iconPlacement',
    'autoInsertSpace',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-btn`
  const [, hashId] = useButtonStyle(prefixCls())
  const [delayedLoading, setDelayedLoading] = createSignal(false)
  const size = () => local.size ?? config.componentSize()
  const loadingActive = () =>
    isLoadingConfig(local.loading) ? delayedLoading() : Boolean(local.loading)
  const disabled = () => Boolean(local.disabled || loadingActive())
  const iconPlacement = () => local.iconPlacement ?? local.iconPosition ?? 'start'
  const mergedColor = () => local.color ?? (local.danger ? 'danger' : getTypeColor(local.type))
  const mergedVariant = () => local.variant ?? getTypeVariant(local.type)
  const loadingIcon = () => (isLoadingConfig(local.loading) ? local.loading.icon : undefined)
  const iconNode = () => (loadingActive() ? (loadingIcon() ?? <LoadingOutlined />) : local.icon)
  const autoInsertSpace = () => local.autoInsertSpace ?? true
  const children = () => spaceChildren(local.children, autoInsertSpace())

  createEffect(() => {
    const loading = local.loading
    if (!isLoadingConfig(loading)) {
      setDelayedLoading(Boolean(loading))
      return
    }
    if (!loading.delay) {
      setDelayedLoading(true)
      return
    }
    setDelayedLoading(false)
    const timer = window.setTimeout(() => setDelayedLoading(true), loading.delay)
    onCleanup(() => window.clearTimeout(timer))
  })

  const renderIcon = () => (
    <Show when={iconNode()}>
      {(icon) => (
        <span class={classNames(`${prefixCls()}-icon`, `${prefixCls()}-icon-${iconPlacement()}`)}>
          {icon()}
        </span>
      )}
    </Show>
  )
  const content = () => (
    <>
      <Show when={iconPlacement() === 'start'}>{renderIcon()}</Show>
      {children()}
      <Show when={iconPlacement() === 'end'}>{renderIcon()}</Show>
    </>
  )
  const buttonClass = () =>
    classNames(
      prefixCls(),
      `${prefixCls()}-${local.type ?? 'default'}`,
      `${prefixCls()}-color-${mergedColor()}`,
      `${prefixCls()}-variant-${mergedVariant()}`,
      size() === 'small' && `${prefixCls()}-sm`,
      size() === 'large' && `${prefixCls()}-lg`,
      local.danger && `${prefixCls()}-dangerous`,
      local.block && `${prefixCls()}-block`,
      loadingActive() && `${prefixCls()}-loading`,
      disabled() && `${prefixCls()}-disabled`,
      local.shape && local.shape !== 'default' && `${prefixCls()}-${local.shape}`,
      local.ghost && `${prefixCls()}-background-ghost`,
      hashId(),
      local.class,
    )
  const handleClick = (event: MouseEvent) => {
    if (disabled()) {
      event.preventDefault()
      return
    }
    ;(local.onClick as JSX.EventHandler<HTMLElement, MouseEvent> | undefined)?.(event as never)
  }

  return (
    <Show
      when={local.href}
      fallback={
        <button
          {...rest}
          type={local.htmlType ?? 'button'}
          disabled={disabled()}
          class={buttonClass()}
          onClick={handleClick as JSX.EventHandler<HTMLButtonElement, MouseEvent>}
        >
          {content()}
        </button>
      }
    >
      {(href) => (
        <a
          {...(rest as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
          href={href()}
          target={local.target}
          class={buttonClass()}
          role={disabled() ? 'link' : undefined}
          aria-disabled={disabled() || undefined}
          onClick={handleClick as JSX.EventHandler<HTMLAnchorElement, MouseEvent>}
        >
          {content()}
        </a>
      )}
    </Show>
  )
}
