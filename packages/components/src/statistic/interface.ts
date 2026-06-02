import type { JSX } from 'solid-js'

export interface StatisticProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'title' | 'prefix'
> {
  title?: JSX.Element
  value?: string | number | null
  precision?: number
  prefix?: JSX.Element
  suffix?: JSX.Element
  loading?: boolean
  valueStyle?: JSX.CSSProperties | string
}
