import type { FieldValue, FormValues, Rule } from './interface'

function isEmpty(value: FieldValue): boolean {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
}

function getLength(value: FieldValue): number | undefined {
  if (typeof value === 'string' || Array.isArray(value)) return value.length
  return undefined
}

export function validateValue(name: string, value: FieldValue, values: FormValues, rules: Rule[] = []): string[] {
  for (const rule of rules) {
    if (rule.required && isEmpty(value)) return [rule.message ?? `${name} is required`]
    if (isEmpty(value)) continue

    if (rule.type === 'array' && !Array.isArray(value)) return [rule.message ?? `${name} is not an array`]
    if (rule.type && rule.type !== 'array' && typeof value !== rule.type) return [rule.message ?? `${name} is not a valid ${rule.type}`]

    if (typeof value === 'number') {
      if (rule.len !== undefined && value !== rule.len) return [rule.message ?? `${name} must equal ${rule.len}`]
      if (rule.min !== undefined && value < rule.min) return [rule.message ?? `${name} must be at least ${rule.min}`]
      if (rule.max !== undefined && value > rule.max) return [rule.message ?? `${name} must be at most ${rule.max}`]
    }

    const length = getLength(value)
    if (length !== undefined) {
      if (rule.len !== undefined && length !== rule.len) return [rule.message ?? `${name} must be ${rule.len} characters`]
      if (rule.min !== undefined && length < rule.min) return [rule.message ?? `${name} must be at least ${rule.min} characters`]
      if (rule.max !== undefined && length > rule.max) return [rule.message ?? `${name} must be at most ${rule.max} characters`]
    }

    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) return [rule.message ?? `${name} format is invalid`]

    const customError = rule.validator?.(value, values)
    if (customError) return [customError]
  }

  return []
}
