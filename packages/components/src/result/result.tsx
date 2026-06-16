import { Match, Show, Switch, createMemo, splitProps, type JSX } from 'solid-js'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  ExclamationCircleFilled,
  InfoCircleFilled,
} from '@solid-ant-design/icons'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { PresentedImage403, PresentedImage404, PresentedImage500 } from './exception-images'
import type {
  ResultComponent,
  ResultExceptionStatus,
  ResultProps,
  ResultSemanticClassNames,
  ResultSemanticStyles,
  ResultStatus,
} from './interface'
import { useResultStyle } from './result.style'

const exceptionStatus = ['403', '404', '500']

function normalizeStatus(status: ResultStatus | undefined): ResultStatus {
  return status ?? 'info'
}

function isExceptionStatus(status: ResultStatus): status is ResultExceptionStatus {
  return exceptionStatus.includes(String(status))
}

function isRenderable(node: JSX.Element) {
  return node !== undefined && node !== null && node !== false
}

function ResultStatusIcon(props: { status: ResultStatus }) {
  if (isExceptionStatus(props.status)) {
    return (
      <Switch>
        <Match when={String(props.status) === '403'}>
          <PresentedImage403 />
        </Match>
        <Match when={String(props.status) === '404'}>
          <PresentedImage404 />
        </Match>
        <Match when={String(props.status) === '500'}>
          <PresentedImage500 />
        </Match>
      </Switch>
    )
  }

  return (
    <Switch fallback={props.status}>
      <Match when={props.status === 'success'}>
        <CheckCircleFilled />
      </Match>
      <Match when={props.status === 'error'}>
        <CloseCircleFilled />
      </Match>
      <Match when={props.status === 'info'}>
        <InfoCircleFilled />
      </Match>
      <Match when={props.status === 'warning'}>
        <ExclamationCircleFilled />
      </Match>
    </Switch>
  )
}

function resolveSemanticClassNames(props: ResultProps): ResultSemanticClassNames {
  return typeof props.classNames === 'function'
    ? props.classNames({ props })
    : (props.classNames ?? {})
}

function resolveSemanticStyles(props: ResultProps): ResultSemanticStyles {
  return typeof props.styles === 'function' ? props.styles({ props }) : (props.styles ?? {})
}

function mergeStyle(
  ...styles: Array<string | JSX.CSSProperties | undefined>
): string | JSX.CSSProperties | undefined {
  const stringStyle = styles.find((style): style is string => typeof style === 'string')
  if (stringStyle) return stringStyle
  const objectStyles = styles.filter((style): style is JSX.CSSProperties => !!style)
  if (objectStyles.length === 0) return undefined
  return Object.assign({}, ...objectStyles)
}

function ResultRoot(props: ResultProps) {
  const [local, rest] = splitProps(props, [
    'status',
    'title',
    'subTitle',
    'icon',
    'extra',
    'children',
    'prefixCls',
    'classNames',
    'styles',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-result`
  const [, hashId] = useResultStyle(prefixCls())
  const status = () => normalizeStatus(local.status)
  const semanticProps = (): ResultProps => ({ ...props, status: status() })
  const semanticClassNames = createMemo(() => resolveSemanticClassNames(semanticProps()))
  const semanticStyles = createMemo(() => resolveSemanticStyles(semanticProps()))
  const mergedIcon = () => {
    if (local.icon === null || local.icon === false) return null
    return local.icon ?? <ResultStatusIcon status={status()} />
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${status()}`,
        hashId(),
        local.class,
        semanticClassNames().root,
      )}
      classList={local.classList}
      style={mergeStyle(semanticStyles().root, local.style)}
    >
      <Show when={isRenderable(mergedIcon())}>
        <div
          class={classNames(
            `${prefixCls()}-icon`,
            isExceptionStatus(status()) && `${prefixCls()}-image`,
            semanticClassNames().icon,
          )}
          style={semanticStyles().icon}
        >
          {mergedIcon()}
        </div>
      </Show>
      <Show when={isRenderable(local.title)}>
        <div
          class={classNames(`${prefixCls()}-title`, semanticClassNames().title)}
          style={semanticStyles().title}
        >
          {local.title}
        </div>
      </Show>
      <Show when={isRenderable(local.subTitle)}>
        <div
          class={classNames(`${prefixCls()}-subtitle`, semanticClassNames().subTitle)}
          style={semanticStyles().subTitle}
        >
          {local.subTitle}
        </div>
      </Show>
      <Show when={isRenderable(local.extra)}>
        <div
          class={classNames(`${prefixCls()}-extra`, semanticClassNames().extra)}
          style={semanticStyles().extra}
        >
          {local.extra}
        </div>
      </Show>
      <Show when={isRenderable(local.children)}>
        <div
          class={classNames(
            `${prefixCls()}-body`,
            `${prefixCls()}-content`,
            semanticClassNames().body,
          )}
          style={semanticStyles().body}
        >
          {local.children}
        </div>
      </Show>
    </div>
  )
}

export const Result = Object.assign(ResultRoot, {
  PRESENTED_IMAGE_403: PresentedImage403,
  PRESENTED_IMAGE_404: PresentedImage404,
  PRESENTED_IMAGE_500: PresentedImage500,
}) satisfies ResultComponent
