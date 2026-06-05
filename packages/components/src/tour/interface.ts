import type { JSX } from 'solid-js'
import type { TooltipPlacement } from '../shared/placement'

export type TourPlacement = TooltipPlacement | 'center'
export type TourTarget = HTMLElement | null | (() => HTMLElement | null | undefined)

export interface TourStep {
  title?: JSX.Element
  description?: JSX.Element
  target?: TourTarget
  placement?: TourPlacement
  mask?: boolean
  arrow?: boolean
  nextButtonProps?: JSX.ButtonHTMLAttributes<HTMLButtonElement>
  prevButtonProps?: JSX.ButtonHTMLAttributes<HTMLButtonElement>
}

export interface TourProps {
  open?: boolean
  defaultOpen?: boolean
  current?: number
  defaultCurrent?: number
  steps?: TourStep[]
  placement?: TourPlacement
  mask?: boolean
  arrow?: boolean
  closeIcon?: JSX.Element
  indicatorsRender?: (current: number, total: number) => JSX.Element
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
  gap?: number
  nextText?: JSX.Element
  prevText?: JSX.Element
  finishText?: JSX.Element
  onClose?: (current: number) => void
  onChange?: (current: number) => void
  onFinish?: () => void
  class?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties
}
