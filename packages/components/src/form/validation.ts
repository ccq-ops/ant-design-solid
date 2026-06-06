import type { FieldValue, FormInstance, FormValues, Rule, RuleConfig } from './interface'

export interface ValidateValueOptions {
  form?: FormInstance
  validateFirst?: boolean | 'parallel'
}

export interface ValidateValueResult {
  errors: string[]
  warnings: string[]
}

function isEmpty(value: FieldValue): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

function getLength(value: FieldValue): number | undefined {
  if (typeof value === 'string' || Array.isArray(value)) return value.length
  return undefined
}

function isObject(value: FieldValue): boolean {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isEmail(value: FieldValue): boolean {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isUrl(value: FieldValue): boolean {
  if (typeof value !== 'string') return false
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

function messageOf(name: string, rule: RuleConfig, fallback: string): string {
  if (typeof rule.message === 'string') return rule.message
  return fallback.replace('${name}', name)
}

function resolveRule(rule: Rule, form?: FormInstance): RuleConfig {
  return typeof rule === 'function' ? rule(form as FormInstance) : rule
}

function validateRuleBase(
  name: string,
  rawValue: FieldValue,
  rule: RuleConfig,
): [FieldValue, string | undefined] {
  const value = rule.transform ? rule.transform(rawValue) : rawValue

  if (rule.required && isEmpty(value)) return [value, messageOf(name, rule, `${name} is required`)]
  if (isEmpty(value)) return [value, undefined]

  if (rule.whitespace && typeof value === 'string' && value.trim() === '') {
    return [value, messageOf(name, rule, `${name} cannot be blank`)]
  }

  if (rule.type === 'array' && !Array.isArray(value)) {
    return [value, messageOf(name, rule, `${name} is not an array`)]
  }
  if (rule.type === 'object' && !isObject(value)) {
    return [value, messageOf(name, rule, `${name} is not an object`)]
  }
  if (rule.type === 'email' && !isEmail(value)) {
    return [value, messageOf(name, rule, `${name} is not a valid email`)]
  }
  if (rule.type === 'url' && !isUrl(value)) {
    return [value, messageOf(name, rule, `${name} is not a valid url`)]
  }
  if (rule.enum && !rule.enum.includes(value)) {
    return [value, messageOf(name, rule, `${name} is not in enum`)]
  }
  if (
    rule.type &&
    !['array', 'object', 'email', 'url', 'enum'].includes(rule.type) &&
    typeof value !== rule.type
  ) {
    return [value, messageOf(name, rule, `${name} is not a valid ${rule.type}`)]
  }

  if (typeof value === 'number') {
    if (rule.len !== undefined && value !== rule.len) {
      return [value, messageOf(name, rule, `${name} must equal ${rule.len}`)]
    }
    if (rule.min !== undefined && value < rule.min) {
      return [value, messageOf(name, rule, `${name} must be at least ${rule.min}`)]
    }
    if (rule.max !== undefined && value > rule.max) {
      return [value, messageOf(name, rule, `${name} must be at most ${rule.max}`)]
    }
  }

  const length = getLength(value)
  if (length !== undefined) {
    if (rule.len !== undefined && length !== rule.len) {
      return [value, messageOf(name, rule, `${name} must be ${rule.len} characters`)]
    }
    if (rule.min !== undefined && length < rule.min) {
      return [value, messageOf(name, rule, `${name} must be at least ${rule.min} characters`)]
    }
    if (rule.max !== undefined && length > rule.max) {
      return [value, messageOf(name, rule, `${name} must be at most ${rule.max} characters`)]
    }
  }

  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return [value, messageOf(name, rule, `${name} format is invalid`)]
  }

  return [value, undefined]
}

async function validateRule(
  name: string,
  rawValue: FieldValue,
  values: FormValues,
  rule: RuleConfig,
): Promise<string | undefined> {
  const [value, baseError] = validateRuleBase(name, rawValue, rule)
  if (baseError) return baseError

  if (rule.validator) {
    try {
      const result = await callValidator(rule, value)
      if (typeof result === 'string') return result
    } catch (error) {
      return error instanceof Error ? error.message : String(error)
    }
  }

  return undefined
}

async function callValidator(rule: RuleConfig, value: FieldValue): Promise<string | void> {
  if (!rule.validator) return undefined
  const validatorResult = await rule.validator(rule, value)
  if (typeof validatorResult === 'string') return validatorResult
  return undefined
}

function appendResult(
  result: ValidateValueResult,
  rule: RuleConfig,
  error: string | undefined,
): void {
  if (!error) return
  ;(rule.warningOnly ? result.warnings : result.errors).push(error)
}

export function validateValueSync(
  name: string,
  value: FieldValue,
  values: FormValues,
  rules: Rule[] = [],
  options: ValidateValueOptions = {},
): ValidateValueResult | undefined {
  const resolvedRules = rules.map((rule) => resolveRule(rule, options.form))
  if (options.validateFirst === 'parallel') return undefined
  if (resolvedRules.some((rule) => rule.validator)) return undefined

  const result: ValidateValueResult = { errors: [], warnings: [] }
  const validateFirst =
    options.validateFirst ?? resolvedRules.find((rule) => rule.validateFirst)?.validateFirst

  for (const rule of resolvedRules) {
    const [, error] = validateRuleBase(name, value, rule)
    appendResult(result, rule, error)
    if (error && validateFirst && !rule.warningOnly) break
  }

  return result
}

export async function validateValue(
  name: string,
  value: FieldValue,
  values: FormValues,
  rules: Rule[] = [],
  options: ValidateValueOptions = {},
): Promise<ValidateValueResult> {
  const resolvedRules = rules.map((rule) => resolveRule(rule, options.form))
  const result: ValidateValueResult = { errors: [], warnings: [] }
  const validateFirst =
    options.validateFirst ?? resolvedRules.find((rule) => rule.validateFirst)?.validateFirst

  if (validateFirst === 'parallel') {
    const results = await Promise.all(
      resolvedRules.map((rule) => validateRule(name, value, values, rule)),
    )
    const firstErrorIndex = results.findIndex(
      (error, index) => error && !resolvedRules[index].warningOnly,
    )
    if (firstErrorIndex >= 0) {
      result.errors.push(results[firstErrorIndex] as string)
      return result
    }
    const firstWarningIndex = results.findIndex(Boolean)
    if (firstWarningIndex >= 0) result.warnings.push(results[firstWarningIndex] as string)
    return result
  }

  for (const rule of resolvedRules) {
    const error = await validateRule(name, value, values, rule)
    appendResult(result, rule, error)
    if (error && validateFirst && !rule.warningOnly) break
  }

  return result
}
