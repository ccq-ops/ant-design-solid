import { Show, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { StatisticProps } from './interface'
import { useStatisticStyle } from './statistic.style'

function isNumericValue(value: unknown): value is number | string {
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value !== 'string' || value.trim() === '') return false
  return Number.isFinite(Number(value))
}

function formatValue(value: StatisticProps['value'], precision: number | undefined): string {
  if (value === undefined || value === null) return ''
  if (precision !== undefined && isNumericValue(value)) return Number(value).toFixed(precision)
  return String(value)
}

export function Statistic(props: StatisticProps) {
  const [local, rest] = splitProps(props, [
    'title',
    'value',
    'precision',
    'prefix',
    'suffix',
    'loading',
    'valueStyle',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-statistic`
  const [, hashId] = useStatisticStyle(prefixCls())
  const valueText = () => formatValue(local.value, local.precision)

  return (
    <div
      {...rest}
      class={classNames(prefixCls(), hashId(), local.class)}
      classList={local.classList}
      style={local.style}
    >
      <Show when={local.title !== undefined && local.title !== null}>
        <div class={`${prefixCls()}-title`}>{local.title}</div>
      </Show>
      <div class={`${prefixCls()}-content`}>
        <Show when={!local.loading && local.prefix !== undefined && local.prefix !== null}>
          <span class={`${prefixCls()}-content-prefix`}>{local.prefix}</span>
        </Show>
        <span class={`${prefixCls()}-content-value`} style={local.valueStyle}>
          <Show when={!local.loading} fallback={<span class={`${prefixCls()}-loading`} />}>
            {valueText()}
          </Show>
        </span>
        <Show when={!local.loading && local.suffix !== undefined && local.suffix !== null}>
          <span class={`${prefixCls()}-content-suffix`}>{local.suffix}</span>
        </Show>
      </div>
    </div>
  )
}
