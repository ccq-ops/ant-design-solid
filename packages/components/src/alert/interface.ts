import type { JSX } from 'solid-js'

export type AlertType = 'success' | 'info' | 'warning' | 'error'
export type AlertVariant = 'outlined' | 'filled'
export type AlertSemanticSlot =
  | 'root'
  | 'icon'
  | 'section'
  | 'title'
  | 'description'
  | 'actions'
  | 'close'

export type AlertSemanticClassNamesMap = Partial<Record<AlertSemanticSlot, string>>
export type AlertSemanticStylesMap = Partial<Record<AlertSemanticSlot, JSX.CSSProperties>>
export type AlertSemanticInfo = { props: AlertProps }
export type AlertSemanticClassNames =
  | AlertSemanticClassNamesMap
  | ((info: AlertSemanticInfo) => AlertSemanticClassNamesMap)
export type AlertSemanticStyles =
  | AlertSemanticStylesMap
  | ((info: AlertSemanticInfo) => AlertSemanticStylesMap)

export interface AlertClosableConfig extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  'onClick' | 'onClose'
> {
  closeIcon?: JSX.Element
  afterClose?: () => void
  onClose?: (event: MouseEvent) => void
}

export interface AlertProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onClose' | 'title'> {
  prefixCls?: string
  rootClass?: string
  type?: AlertType
  variant?: AlertVariant
  title?: JSX.Element
  message?: JSX.Element
  description?: JSX.Element
  closable?: boolean | AlertClosableConfig
  closeText?: JSX.Element
  closeIcon?: JSX.Element | boolean | null
  showIcon?: boolean
  icon?: JSX.Element
  action?: JSX.Element
  banner?: boolean
  classNames?: AlertSemanticClassNames
  styles?: AlertSemanticStyles
  afterClose?: () => void
  onClose?: (event: MouseEvent) => void
}

export interface AlertErrorBoundaryProps {
  title?: JSX.Element
  message?: JSX.Element
  description?: JSX.Element
  children?: JSX.Element
}

export interface AlertComponent {
  (props: AlertProps): JSX.Element
  ErrorBoundary: (props: AlertErrorBoundaryProps) => JSX.Element
}
