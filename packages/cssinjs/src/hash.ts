export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(',')}]`
  const record = value as Record<string, unknown>
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(',')}}`
}

export function hashString(input: string): string {
  let hash = 5381
  for (let index = 0; index < input.length; index += 1) hash = (hash * 33) ^ input.charCodeAt(index)
  return `css-${(hash >>> 0).toString(36)}`
}
