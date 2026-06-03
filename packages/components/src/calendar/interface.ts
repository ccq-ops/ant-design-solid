import type { JSX } from 'solid-js'

export type CalendarValue = Date | string
export type CalendarMode = 'month' | 'year'

export interface CalendarHeaderRenderConfig {
  value: Date
  mode: CalendarMode
  onChange: (value: Date) => void
  onModeChange: (mode: CalendarMode) => void
}

export interface CalendarProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'onSelect'
> {
  value?: CalendarValue
  defaultValue?: CalendarValue
  mode?: CalendarMode
  defaultMode?: CalendarMode
  fullscreen?: boolean
  disabledDate?: (date: Date) => boolean
  dateCellRender?: (date: Date) => JSX.Element
  dateFullCellRender?: (date: Date) => JSX.Element
  monthCellRender?: (date: Date) => JSX.Element
  monthFullCellRender?: (date: Date) => JSX.Element
  headerRender?: (config: CalendarHeaderRenderConfig) => JSX.Element
  onSelect?: (date: Date) => void
  onChange?: (date: Date) => void
  onPanelChange?: (date: Date, mode: CalendarMode) => void
  prefixCls?: string
}
