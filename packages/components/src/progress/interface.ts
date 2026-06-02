import type { JSX } from 'solid-js'

export type ProgressType = 'line' | 'circle'
export type ProgressStatus = 'normal' | 'success' | 'exception' | 'active'

export interface ProgressProps extends JSX.HTMLAttributes<HTMLDivElement> {
  type?: ProgressType
  percent?: number
  status?: ProgressStatus
  showInfo?: boolean
  strokeWidth?: number
  strokeColor?: string
  trailColor?: string
  format?: (percent: number) => JSX.Element
}
