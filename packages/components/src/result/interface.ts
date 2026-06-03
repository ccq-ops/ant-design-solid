import type { JSX } from 'solid-js'

export type ResultStatus = 'success' | 'error' | 'info' | 'warning' | '404' | '403' | '500'

export interface ResultProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'> {
  status?: ResultStatus
  title?: JSX.Element
  subTitle?: JSX.Element
  icon?: JSX.Element
  extra?: JSX.Element
  prefixCls?: string
}
