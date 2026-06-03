import type { JSX } from 'solid-js'
import type { AffixTarget } from '../affix'

export interface AnchorItem {
  key?: string
  href: string
  title: JSX.Element
  children?: AnchorItem[]
}

export interface AnchorProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'onClick' | 'onChange'> {
  items?: AnchorItem[]
  affix?: boolean
  offsetTop?: number
  targetOffset?: number
  getContainer?: () => AffixTarget | undefined | null
  bounds?: number
  onClick?: (event: MouseEvent, link: AnchorItem) => void
  onChange?: (currentActiveLink: string) => void
}
