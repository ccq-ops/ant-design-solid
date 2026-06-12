import type { Component, JSX } from 'solid-js'

export type ResultExceptionStatus = 403 | 404 | 500 | '403' | '404' | '500'
export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | ResultExceptionStatus
export type ResultSemanticDOM = 'root' | 'title' | 'subTitle' | 'body' | 'extra' | 'icon'
export type ResultSemanticClassNames = Partial<Record<ResultSemanticDOM, string>>
export type ResultSemanticStyles = Partial<Record<ResultSemanticDOM, JSX.CSSProperties>>
export type ResultSemanticInfo = { props: ResultProps }
export type ResultSemanticClassNamesConfig =
  | ResultSemanticClassNames
  | ((info: ResultSemanticInfo) => ResultSemanticClassNames)
export type ResultSemanticStylesConfig =
  | ResultSemanticStyles
  | ((info: ResultSemanticInfo) => ResultSemanticStyles)

export interface ResultProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'> {
  status?: ResultStatus
  title?: JSX.Element
  subTitle?: JSX.Element
  icon?: JSX.Element
  extra?: JSX.Element
  prefixCls?: string
  classNames?: ResultSemanticClassNamesConfig
  styles?: ResultSemanticStylesConfig
}

export type ResultComponent = Component<ResultProps> & {
  PRESENTED_IMAGE_403: Component
  PRESENTED_IMAGE_404: Component
  PRESENTED_IMAGE_500: Component
}
