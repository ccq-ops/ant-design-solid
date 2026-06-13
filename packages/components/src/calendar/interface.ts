import type { JSX } from 'solid-js'

export type CalendarValue = Date | string
export type CalendarMode = 'month' | 'year'
export type CalendarCellType = 'date' | 'month'
export type CalendarSelectSource = 'year' | 'month' | 'date' | 'customize'
export type CalendarSemanticSlot = 'root' | 'header' | 'body' | 'content' | 'item' | 'itemContent'

export interface CalendarLocale {
  lang?: {
    locale?: string
    week?: string
    month?: string
    year?: string
    monthFormat?: string
    yearFormat?: string
    today?: string
  }
}

export interface CalendarCellRenderInfo {
  prefixCls: string
  originNode: JSX.Element
  today: Date
  type: CalendarCellType
  locale?: CalendarLocale
}

export interface CalendarSelectInfo {
  source: CalendarSelectSource
}

export type CalendarSemanticClassNames = Partial<Record<CalendarSemanticSlot, string>>
export type CalendarSemanticStyles = Partial<Record<CalendarSemanticSlot, JSX.CSSProperties>>
export type CalendarSemanticClassNamesConfig =
  | CalendarSemanticClassNames
  | ((info: { props: CalendarProps }) => CalendarSemanticClassNames)
export type CalendarSemanticStylesConfig =
  | CalendarSemanticStyles
  | ((info: { props: CalendarProps }) => CalendarSemanticStyles)

export interface CalendarHeaderRenderConfig {
  value: Date
  mode: CalendarMode
  type: CalendarMode
  onChange: (value: Date) => void
  onModeChange: (mode: CalendarMode) => void
  onTypeChange: (type: CalendarMode) => void
}

export interface CalendarProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onSelect' | 'className'
> {
  value?: CalendarValue
  defaultValue?: CalendarValue
  mode?: CalendarMode
  defaultMode?: CalendarMode
  fullscreen?: boolean
  showWeek?: boolean
  locale?: CalendarLocale
  validRange?: [CalendarValue, CalendarValue]
  disabledDate?: (date: Date) => boolean
  dateCellRender?: (date: Date) => JSX.Element
  dateFullCellRender?: (date: Date) => JSX.Element
  monthCellRender?: (date: Date) => JSX.Element
  monthFullCellRender?: (date: Date) => JSX.Element
  cellRender?: (date: Date, info: CalendarCellRenderInfo) => JSX.Element
  fullCellRender?: (date: Date, info: CalendarCellRenderInfo) => JSX.Element
  headerRender?: (config: CalendarHeaderRenderConfig) => JSX.Element
  onSelect?: (date: Date, info: CalendarSelectInfo) => void
  onChange?: (date: Date) => void
  onPanelChange?: (date: Date, mode: CalendarMode) => void
  prefixCls?: string
  rootClassName?: string
  classNames?: CalendarSemanticClassNamesConfig
  styles?: CalendarSemanticStylesConfig
}
