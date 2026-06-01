import type { JSX } from 'solid-js'

export function callHandler<TElement extends Element, TEvent extends Event>(
  handler: JSX.EventHandler<TElement, TEvent> | undefined,
  event: TEvent & { currentTarget: TElement; target: Element },
): void {
  if (typeof handler === 'function') {
    handler(event)
  }
}
