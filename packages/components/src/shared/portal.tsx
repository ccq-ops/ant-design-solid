import { Portal } from 'solid-js/web'
import type { JSX } from 'solid-js'

export interface InternalPortalProps {
  children?: JSX.Element
}

export function canUseDom() {
  return typeof window !== 'undefined' && typeof document !== 'undefined' && Boolean(document.body)
}

export function InternalPortal(props: InternalPortalProps) {
  if (!canUseDom()) return <>{props.children}</>
  return <Portal mount={document.body}>{props.children}</Portal>
}
