import type { JSX } from 'solid-js'

export type BadgeStatus = 'success' | 'processing' | 'default' | 'error' | 'warning'

export interface BadgeProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  count?: number | string
  dot?: boolean
  status?: BadgeStatus
  text?: JSX.Element
  overflowCount?: number
  showZero?: boolean
}
