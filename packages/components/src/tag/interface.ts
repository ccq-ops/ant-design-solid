import type { JSX } from 'solid-js'

export interface TagProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'onClose'> {
  color?: string
  closable?: boolean
  onClose?: (event: MouseEvent) => void
  bordered?: boolean
}
