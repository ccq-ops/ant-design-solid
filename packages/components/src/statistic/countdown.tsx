import type { StatisticCountdownProps } from './interface'
import { StatisticTimer } from './timer'

export function StatisticCountdown(props: StatisticCountdownProps) {
  return <StatisticTimer {...props} type="countdown" />
}
