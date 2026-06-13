import type { JSX } from 'solid-js'
import type { AffixProps, AffixTarget } from '../affix'

export type AnchorSemanticSlot = 'root' | 'item' | 'itemTitle' | 'indicator'
export type AnchorSemanticClassNames = Partial<Record<AnchorSemanticSlot, string>>
export type AnchorSemanticStyles = Partial<Record<AnchorSemanticSlot, JSX.CSSProperties>>
export type AnchorSemanticInfo = { props: AnchorProps }
export type AnchorSemanticClassNamesConfig =
  | AnchorSemanticClassNames
  | ((info: AnchorSemanticInfo) => AnchorSemanticClassNames)
export type AnchorSemanticStylesConfig =
  | AnchorSemanticStyles
  | ((info: AnchorSemanticInfo) => AnchorSemanticStyles)

export interface AnchorItem {
  key?: string | number
  href: string
  target?: string
  title: JSX.Element
  replace?: boolean
  targetOffset?: number
  children?: AnchorItem[]
}

export type AnchorDirection = 'vertical' | 'horizontal'

export interface AnchorProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'onClick' | 'onChange'> {
  prefixCls?: string
  rootClass?: string
  /** @deprecated Use rootClass in Solid code. */
  rootClassName?: string
  items?: AnchorItem[]
  affix?: boolean | Omit<AffixProps, 'offsetTop' | 'target' | 'children'>
  offsetTop?: number
  targetOffset?: number
  getContainer?: () => AffixTarget | undefined | null
  bounds?: number
  getCurrentAnchor?: (activeLink: string) => string
  direction?: AnchorDirection
  replace?: boolean
  showInkInFixed?: boolean
  classNames?: AnchorSemanticClassNamesConfig
  styles?: AnchorSemanticStylesConfig
  onClick?: (event: MouseEvent, link: AnchorItem) => void
  onChange?: (currentActiveLink: string) => void
  children?: JSX.Element
}

export interface AnchorLinkProps extends Omit<
  JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'target' | 'title' | 'children'
> {
  href: string
  target?: string
  title: JSX.Element
  replace?: boolean
  targetOffset?: number
  children?: JSX.Element
  class?: string
  className?: string
  style?: JSX.CSSProperties
}

export interface AnchorComponent {
  (props: AnchorProps): JSX.Element
  Link: (props: AnchorLinkProps) => JSX.Element
}
