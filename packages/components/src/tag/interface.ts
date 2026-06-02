import type { JSX } from 'solid-js'

export interface TagProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  color?: string
  closable?: boolean
  onClose?: (event: MouseEvent) => void
  bordered?: boolean
}
