import type { JSX } from 'solid-js'
import { createMemo } from 'solid-js'
import { TimeColumns, normalizeTimeStep } from '../time-picker/time-columns'
import type { TimeColumnParts } from '../time-picker/time-columns'
import type {
  DatePickerLocale,
  DisabledTimeConfig,
  RangeShowTimeOptions,
  ShowTimeOptions,
  CellRenderInfo,
} from './interface'
import type { dayjs } from './date-utils'

export interface TimePanelProps {
  prefixCls: string
  value: dayjs.Dayjs | null
  showTime?: boolean | ShowTimeOptions | RangeShowTimeOptions
  disabledTime?: DisabledTimeConfig
  locale?: DatePickerLocale
  cellRender?: (current: dayjs.Dayjs, info: CellRenderInfo) => JSX.Element
  onSelectTime?: (unit: 'hour' | 'minute' | 'second', value: number) => void
}

function showTimeOptions(
  showTime: boolean | ShowTimeOptions | RangeShowTimeOptions | undefined,
): ShowTimeOptions | RangeShowTimeOptions {
  return typeof showTime === 'object' ? showTime : {}
}

export function TimePanel(props: TimePanelProps) {
  const options = createMemo(() => showTimeOptions(props.showTime))
  const parts = (): TimeColumnParts => ({
    hour: props.value?.hour() ?? 0,
    minute: props.value?.minute() ?? 0,
    second: props.value?.second() ?? 0,
  })
  const disabledConfig = (): DisabledTimeConfig => ({
    ...options(),
    ...props.disabledTime,
    disabledHours: props.disabledTime?.disabledHours ?? options().disabledHours,
    disabledMinutes: props.disabledTime?.disabledMinutes ?? options().disabledMinutes,
    disabledSeconds: props.disabledTime?.disabledSeconds ?? options().disabledSeconds,
  })

  function timeCellRender(
    current: number,
    info: {
      originNode: JSX.Element
      today: dayjs.Dayjs
      range?: 'start' | 'end'
      subType: 'hour' | 'minute' | 'second' | 'meridiem'
    },
  ): JSX.Element {
    if (!props.cellRender) return info.originNode
    if (info.subType === 'meridiem') return info.originNode
    const base = props.value ?? options().defaultOpenValue ?? undefined
    if (!base || Array.isArray(base)) return info.originNode
    return props.cellRender(base.set(info.subType, current), {
      originNode: info.originNode,
      today: base,
      type: 'date',
      locale: props.locale,
      subType: info.subType,
    })
  }

  return (
    <div class={`${props.prefixCls}-time-panel`}>
      <TimeColumns
        prefixCls={`${props.prefixCls}-time`}
        parts={parts()}
        hourStep={normalizeTimeStep(options().hourStep)}
        minuteStep={normalizeTimeStep(options().minuteStep)}
        secondStep={normalizeTimeStep(options().secondStep)}
        showHour={options().showHour}
        showMinute={options().showMinute}
        showSecond={options().showSecond}
        hideDisabledOptions={options().hideDisabledOptions}
        hourLabel={props.locale?.lang?.hour ?? 'hours'}
        minuteLabel={props.locale?.lang?.minute ?? 'minutes'}
        secondLabel={props.locale?.lang?.second ?? 'seconds'}
        disabledConfig={disabledConfig()}
        cellRender={timeCellRender}
        onSelect={(unit, value) => props.onSelectTime?.(unit, value)}
      />
    </div>
  )
}
