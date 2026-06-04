export interface BorderBeamGradientItem {
  color: string
  percent: number
}

export type BorderBeamGradient = BorderBeamGradientItem[]
export type BorderBeamColor = string | BorderBeamGradient

export const MAX_BEAM_COLOR_STOP_PERCENT = 70

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function getLinearGradient(...colorStops: string[]) {
  return `linear-gradient(to left, ${colorStops.join(', ')}, transparent)`
}

function normalizeBorderBeamColor(value?: BorderBeamColor): BorderBeamGradient {
  return isString(value) ? [{ color: value, percent: 0 }] : (value ?? [])
}

function fillGradientEnd(items: BorderBeamGradient): BorderBeamGradient {
  const lastItem = items[items.length - 1]
  if (!lastItem || lastItem.percent === 100) return items
  return [...items, { ...lastItem, percent: 100 }]
}

function getMappedBeamColorStopPercent(percent: number) {
  return Number(
    ((Math.min(Math.max(percent, 0), 100) / 100) * MAX_BEAM_COLOR_STOP_PERCENT).toFixed(2),
  )
}

function normalizeGradientItems(items: BorderBeamGradient): BorderBeamGradient {
  return fillGradientEnd(items).map((item) => ({
    ...item,
    percent: getMappedBeamColorStopPercent(item.percent),
  }))
}

export function getBorderBeamGradient(value?: BorderBeamColor) {
  const normalizedStops = normalizeGradientItems(normalizeBorderBeamColor(value))
  return normalizedStops.length
    ? getLinearGradient(...normalizedStops.map((item) => `${item.color} ${item.percent}%`))
    : undefined
}
