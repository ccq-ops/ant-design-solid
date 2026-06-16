import {
  ErrorBoundary as SolidErrorBoundary,
  Match,
  Show,
  Switch,
  createMemo,
  createSignal,
  splitProps,
} from 'solid-js'
import type { JSX } from 'solid-js'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  CloseOutlined,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from '@ant-design-solid/solid-icons'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { useAlertStyle } from './alert.style'
import type {
  AlertClosableConfig,
  AlertComponent,
  AlertErrorBoundaryProps,
  AlertProps,
  AlertSemanticClassNames,
  AlertSemanticClassNamesMap,
  AlertSemanticStyles,
  AlertSemanticStylesMap,
} from './interface'

function isClosableConfig(closable: AlertProps['closable']): closable is AlertClosableConfig {
  return typeof closable === 'object' && closable !== null
}

function resolveSemanticClassNames(
  value: AlertSemanticClassNames | undefined,
  props: AlertProps,
): AlertSemanticClassNamesMap {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function resolveSemanticStyles(
  value: AlertSemanticStyles | undefined,
  props: AlertProps,
): AlertSemanticStylesMap {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

function mergeClassNameMaps(
  ...values: Array<AlertSemanticClassNamesMap | undefined>
): AlertSemanticClassNamesMap {
  return {
    root: classNames(...values.map((value) => value?.root)),
    icon: classNames(...values.map((value) => value?.icon)),
    section: classNames(...values.map((value) => value?.section)),
    title: classNames(...values.map((value) => value?.title)),
    description: classNames(...values.map((value) => value?.description)),
    actions: classNames(...values.map((value) => value?.actions)),
    close: classNames(...values.map((value) => value?.close)),
  }
}

function mergeStyles(
  ...values: Array<string | JSX.CSSProperties | undefined>
): string | JSX.CSSProperties | undefined {
  const stringStyle = values.find((value): value is string => typeof value === 'string')
  if (stringStyle) return stringStyle
  const merged = Object.assign({}, ...values.filter(Boolean)) as Record<string, unknown>
  for (const key of Object.keys(merged)) {
    if (!/[A-Z]/.test(key)) continue
    const kebabKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    if (merged[kebabKey] === undefined) merged[kebabKey] = merged[key]
    delete merged[key]
  }
  return merged as JSX.CSSProperties
}

function mergeStyleMaps(
  ...values: Array<AlertSemanticStylesMap | undefined>
): AlertSemanticStylesMap {
  return {
    root: mergeStyles(...values.map((value) => value?.root)) as JSX.CSSProperties | undefined,
    icon: mergeStyles(...values.map((value) => value?.icon)) as JSX.CSSProperties | undefined,
    section: mergeStyles(...values.map((value) => value?.section)) as JSX.CSSProperties | undefined,
    title: mergeStyles(...values.map((value) => value?.title)) as JSX.CSSProperties | undefined,
    description: mergeStyles(...values.map((value) => value?.description)) as
      | JSX.CSSProperties
      | undefined,
    actions: mergeStyles(...values.map((value) => value?.actions)) as JSX.CSSProperties | undefined,
    close: mergeStyles(...values.map((value) => value?.close)) as JSX.CSSProperties | undefined,
  }
}

function AlertIcon(props: {
  type: () => NonNullable<AlertProps['type']>
  icon?: () => JSX.Element
}) {
  return (
    <Switch>
      <Match when={props.type() === 'success'}>{props.icon?.() ?? <CheckCircleFilled />}</Match>
      <Match when={props.type() === 'info'}>{props.icon?.() ?? <InfoCircleFilled />}</Match>
      <Match when={props.type() === 'warning'}>
        {props.icon?.() ?? <ExclamationCircleFilled />}
      </Match>
      <Match when={props.type() === 'error'}>{props.icon?.() ?? <CloseCircleFilled />}</Match>
    </Switch>
  )
}

function InternalAlert(props: AlertProps) {
  const [closed, setClosed] = createSignal(false)
  const [local, rest] = splitProps(props, [
    'prefixCls',
    'rootClass',
    'type',
    'variant',
    'title',
    'message',
    'description',
    'closable',
    'closeText',
    'closeIcon',
    'showIcon',
    'icon',
    'action',
    'banner',
    'classNames',
    'styles',
    'afterClose',
    'onClose',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const alertConfig = () => config.alert()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-alert`
  const [, hashId] = useAlertStyle(prefixCls())
  const type = () => local.type ?? (local.banner ? 'warning' : 'info')
  const variant = () => local.variant ?? alertConfig().variant ?? 'outlined'
  const shouldShowIcon = () => local.showIcon ?? Boolean(local.banner)
  const mergedClosable = createMemo(() => local.closable ?? alertConfig().closable)
  const closableConfig = createMemo(() => {
    const closable = mergedClosable()
    return isClosableConfig(closable) ? closable : undefined
  })
  const isClosable = () => {
    const closable = mergedClosable()
    if (isClosableConfig(closable) && closable.closeIcon !== undefined) return true
    if (typeof closable === 'boolean') return closable
    if (local.closeText !== undefined) return true
    return local.closeIcon !== false && local.closeIcon !== null && local.closeIcon !== undefined
  }
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
  const mergedProps = createMemo<AlertProps>(() => ({
    ...props,
    type: type(),
    variant: variant(),
    showIcon: shouldShowIcon(),
    closable: isClosable(),
  }))
  const semanticClassNames = createMemo(() =>
    mergeClassNameMaps(
      resolveSemanticClassNames(alertConfig().classNames, mergedProps()),
      resolveSemanticClassNames(local.classNames, mergedProps()),
    ),
  )
  const semanticStyles = createMemo(() =>
    mergeStyleMaps(
      resolveSemanticStyles(alertConfig().styles, mergedProps()),
      resolveSemanticStyles(local.styles, mergedProps()),
    ),
  )
  const configuredIcon = () => {
    const cfg = alertConfig()
    switch (type()) {
      case 'success':
        return cfg.successIcon
      case 'info':
        return cfg.infoIcon
      case 'warning':
        return cfg.warningIcon
      case 'error':
        return cfg.errorIcon
    }
  }
  const mergedCloseIcon = () => {
    if (closableConfig()?.closeIcon !== undefined) return closableConfig()?.closeIcon
    if (local.closeText !== undefined)
      return <span class={`${prefixCls()}-close-text`}>{local.closeText}</span>
    if (local.closeIcon !== undefined && local.closeIcon !== true) return local.closeIcon
    const configClosable = alertConfig().closable
    if (isClosableConfig(configClosable) && configClosable.closeIcon !== undefined)
      return configClosable.closeIcon
    if (alertConfig().closeIcon !== undefined) return alertConfig().closeIcon
    return <CloseOutlined />
  }

  const close = (event: MouseEvent) => {
    const localClose = closableConfig()?.onClose
    ;(localClose ?? local.onClose)?.(event)
    setClosed(true)
    ;(closableConfig()?.afterClose ?? local.afterClose)?.()
  }

  return (
    <Show when={!closed()}>
      <div
        {...rest}
        role={rest.role ?? 'alert'}
        data-show={!closed()}
        class={classNames(
          prefixCls(),
          `${prefixCls()}-${type()}`,
          `${prefixCls()}-${variant()}`,
          local.banner && `${prefixCls()}-banner`,
          Boolean(local.description) && `${prefixCls()}-with-description`,
          !shouldShowIcon() && `${prefixCls()}-no-icon`,
          hashId(),
          alertConfig().class,
          semanticClassNames().root,
          local.class,
          local.rootClass,
        )}
        classList={local.classList}
        style={mergeStyles(semanticStyles().root, alertConfig().style, local.style)}
      >
        <Show when={shouldShowIcon()}>
          <span
            class={classNames(`${prefixCls()}-icon`, semanticClassNames().icon)}
            style={semanticStyles().icon}
          >
            {local.icon ?? <AlertIcon type={type} icon={configuredIcon} />}
          </span>
        </Show>
        <div
          class={classNames(
            `${prefixCls()}-section`,
            `${prefixCls()}-content`,
            semanticClassNames().section,
          )}
          style={semanticStyles().section}
        >
          <div
            class={classNames(
              `${prefixCls()}-title`,
              `${prefixCls()}-message`,
              semanticClassNames().title,
            )}
            style={semanticStyles().title}
          >
            {messageNode()}
          </div>
          <Show when={local.description}>
            <div
              class={classNames(`${prefixCls()}-description`, semanticClassNames().description)}
              style={semanticStyles().description}
            >
              {local.description}
            </div>
          </Show>
        </div>
        <Show when={local.action}>
          <div
            class={classNames(
              `${prefixCls()}-actions`,
              `${prefixCls()}-action`,
              semanticClassNames().actions,
            )}
            style={semanticStyles().actions}
          >
            {local.action}
          </div>
        </Show>
        <Show when={isClosable()}>
          <button
            {...closeButtonProps()}
            type="button"
            class={classNames(
              `${prefixCls()}-close-icon`,
              `${prefixCls()}-close`,
              semanticClassNames().close,
              closeButtonProps().class,
            )}
            style={mergeStyles(semanticStyles().close, closeButtonProps().style)}
            aria-label={closeButtonProps()['aria-label'] ?? 'close alert'}
            onClick={close}
          >
            {mergedCloseIcon()}
          </button>
        </Show>
      </div>
    </Show>
  )
}

function AlertErrorBoundary(props: AlertErrorBoundaryProps) {
  return (
    <SolidErrorBoundary
      fallback={(error) => (
        <InternalAlert
          type="error"
          title={props.title ?? props.message ?? String(error)}
          description={props.description ?? error?.stack}
        />
      )}
    >
      {props.children}
    </SolidErrorBoundary>
  )
}

export const Alert = InternalAlert as AlertComponent
Alert.ErrorBoundary = AlertErrorBoundary
