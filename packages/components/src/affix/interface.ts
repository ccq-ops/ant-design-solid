import type { JSX } from 'solid-js'

export type AffixTarget = Window | HTMLElement

export interface AffixProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  offsetTop?: number
  offsetBottom?: number
  target?: () => AffixTarget | undefined | null
  onChange?: (affixed: boolean) => void
  children?: JSX.Element
}
