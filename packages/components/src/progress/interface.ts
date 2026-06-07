import type { JSX } from 'solid-js'

export type ProgressType = 'line' | 'circle' | 'dashboard'
export type ProgressStatus = 'normal' | 'success' | 'exception' | 'active'
export type ProgressStrokeLinecap = 'round' | 'butt' | 'square'
export type ProgressSize =
  | number
  | [number | string, number]
  | 'small'
  | 'medium'
  | 'default'
  | {
      width?: number
      height?: number
    }
export type ProgressGradient = { direction?: string } & (
  | { from: string; to: string }
  | Record<string, string>
)
export type PercentPosition = {
  align?: 'start' | 'center' | 'end'
  type?: 'inner' | 'outer'
}
export type ProgressSteps = number | { count: number; gap: number }
export type GapPlacement = 'top' | 'bottom' | 'start' | 'end'
export type GapPosition = 'top' | 'bottom' | 'left' | 'right'

export interface ProgressSuccessProps {
  percent?: number
  strokeColor?: string
}

export interface ProgressProps extends JSX.HTMLAttributes<HTMLDivElement> {
  type?: ProgressType
  percent?: number
  status?: ProgressStatus
  showInfo?: boolean
  strokeWidth?: number
  strokeLinecap?: ProgressStrokeLinecap
  strokeColor?: string | string[] | ProgressGradient
  trailColor?: string
  railColor?: string
  format?: (percent: number, successPercent?: number) => JSX.Element
  success?: ProgressSuccessProps
  size?: ProgressSize
  steps?: ProgressSteps
  percentPosition?: PercentPosition
  gapDegree?: number
  gapPlacement?: GapPlacement
  gapPosition?: GapPosition
  width?: number
}
