import { Show, createMemo, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { ProgressProps, ProgressStatus } from './interface'
import { useProgressStyle } from './progress.style'

const CIRCLE_SIZE = 120
const CIRCLE_CENTER = CIRCLE_SIZE / 2
const CIRCLE_RADIUS = 50

function clampPercent(percent: ProgressProps['percent']): number {
  const value = Number(percent ?? 0)
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

function px(value: number): string {
  return `${value}px`
}

export function Progress(props: ProgressProps) {
  const [local, rest] = splitProps(props, [
    'type',
    'percent',
    'status',
    'showInfo',
    'strokeWidth',
    'strokeColor',
    'trailColor',
    'format',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-progress`
  const [, hashId] = useProgressStyle(prefixCls())

  const type = () => local.type ?? 'line'
  const percent = createMemo(() => clampPercent(local.percent))
  const status = createMemo<ProgressStatus>(
    () => local.status ?? (percent() === 100 ? 'success' : 'normal'),
  )
  const showInfo = () => local.showInfo !== false
  const strokeWidth = () => {
    const value = Number(local.strokeWidth)
    return Number.isFinite(value) && value > 0 ? value : type() === 'circle' ? 6 : 8
  }
  const strokeColor = () => local.strokeColor
  const trailColor = () => local.trailColor
  const circumference = 2 * Math.PI * CIRCLE_RADIUS
  const dashOffset = () => ((100 - percent()) / 100) * circumference
  const info = () => {
    if (local.format) return local.format(percent())
    if (status() === 'success') return '✓'
    if (status() === 'exception') return '✕'
    return `${percent()}%`
  }

  const line = () => (
    <div class={`${prefixCls()}-outer`}>
      <div
        class={`${prefixCls()}-inner`}
        style={{
          height: px(strokeWidth()),
          background: trailColor(),
        }}
      >
        <div
          class={`${prefixCls()}-bg`}
          style={{
            width: `${percent()}%`,
            height: px(strokeWidth()),
            background: strokeColor(),
          }}
        />
      </div>
    </div>
  )

  const circle = () => (
    <div class={`${prefixCls()}-circle-outer`}>
      <svg viewBox={`0 0 ${CIRCLE_SIZE} ${CIRCLE_SIZE}`} width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
        <circle
          class={`${prefixCls()}-circle-trail`}
          cx={CIRCLE_CENTER}
          cy={CIRCLE_CENTER}
          r={CIRCLE_RADIUS}
          fill="none"
          stroke={trailColor()}
          stroke-width={strokeWidth()}
        />
        <circle
          class={`${prefixCls()}-circle-path`}
          cx={CIRCLE_CENTER}
          cy={CIRCLE_CENTER}
          r={CIRCLE_RADIUS}
          fill="none"
          stroke={strokeColor()}
          stroke-width={strokeWidth()}
          stroke-linecap="round"
          stroke-dasharray={`${circumference}`}
          stroke-dashoffset={dashOffset()}
          transform={`rotate(-90 ${CIRCLE_CENTER} ${CIRCLE_CENTER})`}
        />
      </svg>
    </div>
  )

  return (
    <div
      {...rest}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent()}
      class={classNames(
        prefixCls(),
        `${prefixCls()}-${type()}`,
        `${prefixCls()}-status-${status()}`,
        hashId(),
        local.class,
      )}
      classList={local.classList}
      style={local.style}
    >
      <Show when={type() === 'circle'} fallback={line()}>
        {circle()}
      </Show>
      <Show when={showInfo()}>
        <span class={`${prefixCls()}-text`}>{info()}</span>
      </Show>
    </div>
  )
}
