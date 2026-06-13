import type { JSX } from 'solid-js'
import type { ButtonProps } from '../button'
import type { TooltipPlacement } from '../shared/placement'

export type TourPlacement = TooltipPlacement | 'center'
export type TourTarget = HTMLElement | null | (() => HTMLElement | null | undefined)
export type TourType = 'default' | 'primary'
export type TourArrow = boolean | { pointAtCenter: boolean }
export type TourMask =
  | boolean
  | {
      style?: JSX.CSSProperties
      color?: string
    }
export type TourGap =
  | number
  | {
      offset?: number | [number, number]
      radius?: number
    }
export type TourSemanticName =
  | 'root'
  | 'mask'
  | 'section'
  | 'cover'
  | 'close'
  | 'header'
  | 'title'
  | 'description'
  | 'footer'
  | 'actions'
  | 'indicator'
  | 'indicators'
export type TourSemanticClassNames = Partial<Record<TourSemanticName, string>>
export type TourSemanticStyles = Partial<Record<TourSemanticName, JSX.CSSProperties>>
export type TourSemanticClassNamesConfig =
  | TourSemanticClassNames
  | ((info: { props: TourProps }) => TourSemanticClassNames)
export type TourSemanticStylesConfig =
  | TourSemanticStyles
  | ((info: { props: TourProps }) => TourSemanticStyles)
export type TourActionsRender = (
  originNode: JSX.Element,
  info: { current: number; total: number },
) => JSX.Element
export type TourScrollIntoViewOptions = boolean | ScrollIntoViewOptions

export interface TourStep {
  title?: JSX.Element
  description?: JSX.Element
  target?: TourTarget
  placement?: TourPlacement
  mask?: TourMask
  arrow?: TourArrow
  closeIcon?: JSX.Element
  cover?: JSX.Element
  type?: TourType
  scrollIntoViewOptions?: TourScrollIntoViewOptions
  indicatorsRender?: (current: number, total: number) => JSX.Element
  actionsRender?: TourActionsRender
  onClose?: () => void
  nextButtonProps?: ButtonProps
  prevButtonProps?: ButtonProps
  class?: string
  style?: JSX.CSSProperties
  classNames?: TourSemanticClassNames
  styles?: TourSemanticStyles
}

export interface TourProps {
  open?: boolean
  defaultOpen?: boolean
  current?: number
  defaultCurrent?: number
  steps?: TourStep[]
  placement?: TourPlacement
  mask?: TourMask
  arrow?: TourArrow
  closeIcon?: JSX.Element
  indicatorsRender?: (current: number, total: number) => JSX.Element
  actionsRender?: TourActionsRender
  disabledInteraction?: boolean
  keyboard?: boolean
  scrollIntoViewOptions?: TourScrollIntoViewOptions
  type?: TourType
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot
  gap?: TourGap
  nextText?: JSX.Element
  prevText?: JSX.Element
  finishText?: JSX.Element
  onClose?: (current: number) => void
  onChange?: (current: number) => void
  onFinish?: () => void
  class?: string
  classList?: Record<string, boolean | undefined>
  style?: JSX.CSSProperties
  classNames?: TourSemanticClassNamesConfig
  styles?: TourSemanticStylesConfig
}
