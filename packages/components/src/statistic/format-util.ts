import type {
  StatisticFormatConfig,
  StatisticFormatter,
  StatisticProps,
  StatisticSemanticClassNames,
  StatisticSemanticStyles,
  StatisticValue,
} from './interface'

export function isNumericValue(value: unknown): value is number | string {
  if (typeof value === 'number') return Number.isFinite(value)
  if (typeof value !== 'string' || value.trim() === '') return false
  return Number.isFinite(Number(value))
}

function splitNumber(value: string) {
  const [integer = '', decimal] = value.split('.')
  return { integer, decimal }
}

function addGroupSeparator(value: string, separator: string) {
  const sign = value.startsWith('-') ? '-' : ''
  const unsigned = sign ? value.slice(1) : value
  return `${sign}${unsigned.replace(/\B(?=(\d{3})+(?!\d))/g, separator)}`
}

export function formatStatisticValue(
  value: StatisticValue | undefined,
  config: StatisticFormatConfig = {},
) {
  if (value === undefined || value === null) return ''

  const formatter: StatisticFormatter = config.formatter ?? 'number'
  if (formatter === false) return String(value)
  if (typeof formatter === 'function') return formatter(value, config)

  if (formatter === 'countdown') {
    return formatTimeDuration(Number(value), config.format ?? 'HH:mm:ss')
  }

  if (!isNumericValue(value)) return String(value)

  const fixedValue =
    config.precision !== undefined ? Number(value).toFixed(config.precision) : String(value)
  const { integer, decimal } = splitNumber(fixedValue)
  const groupSeparator = config.groupSeparator ?? ','
  const decimalSeparator = config.decimalSeparator ?? '.'
  const groupedInteger = groupSeparator ? addGroupSeparator(integer, groupSeparator) : integer

  return decimal !== undefined ? `${groupedInteger}${decimalSeparator}${decimal}` : groupedInteger
}

export type TimeUnit = [token: string, size: number]

const timeUnits: TimeUnit[] = [
  ['Y', 1000 * 60 * 60 * 24 * 365],
  ['M', 1000 * 60 * 60 * 24 * 30],
  ['D', 1000 * 60 * 60 * 24],
  ['H', 1000 * 60 * 60],
  ['m', 1000 * 60],
  ['s', 1000],
  ['S', 1],
]

export function formatTimeDuration(duration: number, format: string) {
  let remaining = Math.max(duration, 0)
  const escapedPattern = /\[[^\]]*]/g
  const escapedTexts = (format.match(escapedPattern) ?? []).map((text) => text.slice(1, -1))
  const template = format.replace(escapedPattern, '[]')

  const formatted = timeUnits.reduce((current, [token, size]) => {
    if (!current.includes(token)) return current

    const unitValue = Math.floor(remaining / size)
    remaining -= unitValue * size

    return current.replace(new RegExp(`${token}+`, 'g'), (match) =>
      String(unitValue).padStart(match.length, '0'),
    )
  }, template)

  let escapedIndex = 0
  return formatted.replace(escapedPattern, () => {
    const text = escapedTexts[escapedIndex] ?? ''
    escapedIndex += 1
    return text
  })
}

export function resolveSemanticClassNames(
  value: StatisticSemanticClassNames | undefined,
  props: StatisticProps,
) {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

export function resolveSemanticStyles(
  value: StatisticSemanticStyles | undefined,
  props: StatisticProps,
) {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}
