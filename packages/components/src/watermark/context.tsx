import { createContext, onCleanup, useContext } from 'solid-js'

export interface WatermarkContextValue {
  add: (element: HTMLElement) => void
  remove: (element: HTMLElement) => void
}

const noop = () => {}

export const WatermarkContext = createContext<WatermarkContextValue>({
  add: noop,
  remove: noop,
})

export function useWatermarkPanelRef(selector?: string) {
  const watermark = useContext(WatermarkContext)
  let current: HTMLElement | undefined

  onCleanup(() => {
    if (current) watermark.remove(current)
  })

  return (element: HTMLElement) => {
    const target = selector ? (element.querySelector<HTMLElement>(selector) ?? undefined) : element
    if (!target || target === current) return
    if (current) watermark.remove(current)
    current = target
    watermark.add(target)
  }
}
