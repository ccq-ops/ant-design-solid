import type { JSX } from 'solid-js'

export type StepsStatus = 'wait' | 'process' | 'finish' | 'error'
export type StepsDirection = 'horizontal' | 'vertical'
export type StepsSize = 'default' | 'small'
export type StepsType = 'default' | 'navigation'

export interface StepItem {
  title?: JSX.Element
  description?: JSX.Element
  status?: StepsStatus
  icon?: JSX.Element
  disabled?: boolean
}

export interface StepsProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items?: StepItem[]
  current?: number
  status?: StepsStatus
  direction?: StepsDirection
  size?: StepsSize
  type?: StepsType
  onChange?: (current: number) => void
}
