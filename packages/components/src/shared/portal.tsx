import { Portal } from 'solid-js/web'
import type { Accessor, JSX } from 'solid-js'

export interface InternalPortalProps {
  mount?: HTMLElement | Accessor<HTMLElement | undefined>
  children?: JSX.Element
}

export function canUseDom() {
  return typeof window !== 'undefined' && typeof document !== 'undefined' && Boolean(document.body)
}

export function resolvePortalMount(
  mount: InternalPortalProps['mount'] | undefined,
): HTMLElement | undefined {
  if (!canUseDom()) return undefined
  if (typeof mount === 'function') return mount()
  return mount ?? document.body
}

export function InternalPortal(props: InternalPortalProps) {
  if (!canUseDom()) return <>{props.children}</>
  return <Portal mount={resolvePortalMount(props.mount)}>{props.children}</Portal>
}
