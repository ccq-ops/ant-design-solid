import type { JSX } from 'solid-js'

export type StatisticValue = string | number | null
export type StatisticTimerType = 'countdown' | 'countup'
export type StatisticSemanticSlot =
  | 'root'
  | 'header'
  | 'title'
  | 'content'
  | 'value'
  | 'prefix'
  | 'suffix'
export type StatisticSemanticClassNamesMap = Partial<Record<StatisticSemanticSlot, string>>
export type StatisticSemanticStylesMap = Partial<Record<StatisticSemanticSlot, JSX.CSSProperties>>
export type StatisticSemanticInfo = { props: StatisticProps }
export type StatisticSemanticClassNames =
  | StatisticSemanticClassNamesMap
  | ((info: StatisticSemanticInfo) => StatisticSemanticClassNamesMap)
export type StatisticSemanticStyles =
  | StatisticSemanticStylesMap
  | ((info: StatisticSemanticInfo) => StatisticSemanticStylesMap)
export type StatisticFormatter =
  | false
  | 'number'
  | 'countdown'
  | ((value: Exclude<StatisticValue, null>, config?: StatisticFormatConfig) => JSX.Element)

export interface StatisticFormatConfig {
  formatter?: StatisticFormatter
  decimalSeparator?: string
  groupSeparator?: string
  precision?: number
  format?: string
}

export interface StatisticProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'title' | 'prefix'
> {
  title?: JSX.Element
  value?: StatisticValue
  precision?: number
  prefix?: JSX.Element
  suffix?: JSX.Element
  loading?: boolean
  formatter?: StatisticFormatter
  decimalSeparator?: string
  groupSeparator?: string
  classNames?: StatisticSemanticClassNames
  styles?: StatisticSemanticStyles
  /** @deprecated Please use `styles.content` instead. */
  valueStyle?: JSX.CSSProperties | string
}

export interface StatisticTimerProps extends Omit<StatisticProps, 'formatter' | 'onChange'> {
  type: StatisticTimerType
  format?: string
  onFinish?: () => void
  onChange?: (value: number) => void
}

export interface StatisticCountdownProps extends Omit<StatisticTimerProps, 'type'> {}
