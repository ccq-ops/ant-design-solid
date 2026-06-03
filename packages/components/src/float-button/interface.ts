import type { JSX } from 'solid-js'
import type { AffixTarget } from '../affix'

export type FloatButtonType = 'default' | 'primary'
export type FloatButtonShape = 'circle' | 'square'

export interface FloatButtonProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  'children' | 'target' | 'type'
> {
  type?: FloatButtonType
  shape?: FloatButtonShape
  icon?: JSX.Element
  description?: JSX.Element
  tooltip?: string
  href?: string
  target?: string
}

export interface FloatButtonGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  shape?: FloatButtonShape
  children?: JSX.Element
}

export interface FloatButtonBackTopProps extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  'children' | 'type'
> {
  visibilityHeight?: number
  target?: () => AffixTarget | undefined | null
  duration?: number
  children?: JSX.Element
}

export interface FloatButtonComponent {
  (props: FloatButtonProps): JSX.Element
  Group: (props: FloatButtonGroupProps) => JSX.Element
  BackTop: (props: FloatButtonBackTopProps) => JSX.Element
}
