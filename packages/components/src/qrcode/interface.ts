import type { JSX } from 'solid-js'

export type QRCodeStatus = 'active' | 'expired' | 'loading'

export interface QRCodeProps extends JSX.HTMLAttributes<HTMLDivElement> {
  value: string
  size?: number
  color?: string
  bgColor?: string
  bordered?: boolean
  icon?: string
  iconSize?: number
  status?: QRCodeStatus
  statusRender?: (info: { status: QRCodeStatus }) => JSX.Element
  prefixCls?: string
}
