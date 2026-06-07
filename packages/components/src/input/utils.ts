import type { AllowClear, CountConfig, CountFormatterInfo, ShowCount } from './interface'

export function getAllowClearConfig(allowClear: AllowClear | undefined) {
  if (!allowClear) return undefined
  return typeof allowClear === 'object' ? allowClear : {}
}

export function getCount(value: string, count: CountConfig | undefined) {
  return count?.strategy ? count.strategy(value) : value.length
}

export function getMaxLength(
  maxLength: string | number | undefined,
  count: CountConfig | undefined,
) {
  if (count?.max !== undefined) return count.max
  if (maxLength === undefined) return undefined
  const parsed = Number(maxLength)
  return Number.isNaN(parsed) ? undefined : parsed
}

export function formatCount(
  showCount: ShowCount | undefined,
  countConfig: CountConfig | undefined,
  info: CountFormatterInfo,
) {
  if (typeof countConfig?.show === 'function') return countConfig.show(info)
  if (typeof showCount === 'object' && showCount.formatter) return showCount.formatter(info)
  return `${info.count}${info.maxLength !== undefined ? ` / ${info.maxLength}` : ''}`
}

export function shouldShowCount(
  showCount: ShowCount | undefined,
  countConfig: CountConfig | undefined,
) {
  if (countConfig?.show !== undefined) return Boolean(countConfig.show)
  return Boolean(showCount)
}

export function applyExceedFormatter(value: string, countConfig: CountConfig | undefined) {
  if (!countConfig?.max || !countConfig.exceedFormatter) return value
  if (getCount(value, countConfig) <= countConfig.max) return value
  return countConfig.exceedFormatter(value, { max: countConfig.max })
}
