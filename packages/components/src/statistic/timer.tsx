import { createEffect, createMemo, createSignal, onCleanup, splitProps } from 'solid-js'
import type { StatisticTimerProps } from './interface'
import { formatTimeDuration } from './format-util'
import { Statistic } from './statistic'

const updateInterval = 1000

function getTimestamp(value: StatisticTimerProps['value']) {
  return new Date(value ?? 0).getTime()
}

export function StatisticTimer(props: StatisticTimerProps) {
  const [local, rest] = splitProps(props, ['value', 'type', 'format', 'onChange', 'onFinish'])
  const [now, setNow] = createSignal(Date.now())
  let finished = false

  const countdown = () => local.type === 'countdown'
  const timestamp = () => getTimestamp(local.value)
  const diff = createMemo(() => {
    const nextDiff = countdown() ? timestamp() - now() : now() - timestamp()
    return Math.max(nextDiff, 0)
  })
  const displayValue = createMemo(() => formatTimeDuration(diff(), local.format ?? 'HH:mm:ss'))

  createEffect(() => {
    timestamp()
    countdown()
    finished = false
    setNow(Date.now())
  })

  createEffect(() => {
    const nextDiff = diff()
    local.onChange?.(nextDiff)
    if (countdown() && nextDiff <= 0 && !finished) {
      finished = true
      local.onFinish?.()
    }
  })

  createEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
      if (countdown() && finished) window.clearInterval(timer)
    }, updateInterval)
    onCleanup(() => window.clearInterval(timer))
  })

  return <Statistic {...rest} value={displayValue()} formatter={false} />
}
