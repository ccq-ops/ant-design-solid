import type { JSX } from 'solid-js'
import type { AffixTarget } from '../affix'

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
  items?: AnchorItem[]
  affix?: boolean
  offsetTop?: number
  targetOffset?: number
  getContainer?: () => AffixTarget | undefined | null
  bounds?: number
  getCurrentAnchor?: (activeLink: string) => string
  direction?: AnchorDirection
  replace?: boolean
  onClick?: (event: MouseEvent, link: AnchorItem) => void
  onChange?: (currentActiveLink: string) => void
}
