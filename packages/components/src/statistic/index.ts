import { StatisticCountdown } from './countdown'
import { Statistic as StatisticRoot } from './statistic'
import { StatisticTimer } from './timer'

export const Statistic = Object.assign(StatisticRoot, {
  Timer: StatisticTimer,
  Countdown: StatisticCountdown,
})

export { StatisticCountdown, StatisticRoot, StatisticTimer }
export * from './interface'
