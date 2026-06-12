import type { JSX } from 'solid-js'

export type QRCodeStatus = 'active' | 'expired' | 'loading' | 'scanned'
export type QRCodeRenderType = 'canvas' | 'svg'
export type QRCodeErrorLevel = 'L' | 'M' | 'Q' | 'H'
export type QRCodeIconSize = number | { width: number; height: number }
export type QRCodeSemanticSlot = 'root' | 'image' | 'cover'
export type QRCodeSemanticClassNames = Partial<Record<QRCodeSemanticSlot, string>>
export type QRCodeSemanticStyles = Partial<Record<QRCodeSemanticSlot, JSX.CSSProperties>>
export type QRCodeLocale = {
  expired: string
  loading: string
  scanned: string
  refresh: string
}
export type QRCodeStatusRenderInfo = {
  status: QRCodeStatus
  locale: QRCodeLocale
  onRefresh?: () => void
}

export interface QRCodeProps extends JSX.HTMLAttributes<HTMLDivElement> {
  value: string | string[]
  size?: number
  color?: string
  bgColor?: string
  bordered?: boolean
  type?: QRCodeRenderType
  icon?: string
  iconSize?: QRCodeIconSize
  errorLevel?: QRCodeErrorLevel
  boostLevel?: boolean
  marginSize?: number
  status?: QRCodeStatus
  statusRender?: (info: QRCodeStatusRenderInfo) => JSX.Element
  onRefresh?: () => void
  locale?: Partial<QRCodeLocale>
  classNames?: QRCodeSemanticClassNames
  classes?: QRCodeSemanticClassNames
  styles?: QRCodeSemanticStyles
  prefixCls?: string
}
