import type { JSX } from 'solid-js'

export type AffixTarget = Window | HTMLElement

export interface AffixRef {
  updatePosition: () => void
}

export interface AffixProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange' | 'ref'> {
  prefixCls?: string
  rootClass?: string
  offsetTop?: number
  offsetBottom?: number
  target?: () => AffixTarget | undefined | null
  onChange?: (affixed?: boolean) => void
  ref?: AffixRef | ((ref: AffixRef) => void)
  children?: JSX.Element
}
