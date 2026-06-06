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

function readChildValue(value: FieldValue, key: string): FieldValue {
  if (Array.isArray(value) && /^\d+$/.test(key)) return value[Number(key)]
  if (value && typeof value === 'object') return (value as Record<string, FieldValue>)[key]
  return undefined
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
): Promise<string[]> {
  const [value, baseError] = validateRuleBase(name, rawValue, rule)
  if (baseError) return [baseError]

  const nestedErrors: string[] = []
  if (rule.defaultField && Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      nestedErrors.push(
        ...(await validateRule(
          `${name}.${index}`,
          value[index],
          values,
          resolveRule(rule.defaultField),
        )),
      )
    }
  }
  if (rule.fields && value && typeof value === 'object') {
    for (const key of Object.keys(rule.fields)) {
      nestedErrors.push(
        ...(await validateRule(
          `${name}.${key}`,
          readChildValue(value, key),
          values,
          resolveRule(rule.fields[key]),
        )),
      )
    }
  }
  if (nestedErrors.length > 0) return nestedErrors

  if (rule.validator) {
    try {
      const result = await callValidator(rule, value, values)
      if (typeof result === 'string') return [result]
    } catch (error) {
      return [error instanceof Error ? error.message : String(error)]
    }
  }

  return []
}

async function callValidator(
  rule: RuleConfig,
  value: FieldValue,
  values: FormValues,
): Promise<string | void> {
  if (!rule.validator) return undefined
  const validatorResult = rule.validator.legacy
    ? await rule.validator(value as RuleConfig & FieldValue, values)
    : await rule.validator(rule, value, values)
  if (typeof validatorResult === 'string') return validatorResult
  return undefined
}

function appendResult(
  result: ValidateValueResult,
  rule: RuleConfig,
  errors: string | string[] | undefined,
): void {
  const messages = Array.isArray(errors) ? errors : errors ? [errors] : []
  if (messages.length === 0) return
  ;(rule.warningOnly ? result.warnings : result.errors).push(...messages)
}

function validateNestedRulesSync(name: string, value: FieldValue, rule: RuleConfig): string[] {
  const errors: string[] = []
  if (rule.defaultField && Array.isArray(value)) {
    const nestedRule = resolveRule(rule.defaultField)
    if (nestedRule.validator) return []
    for (let index = 0; index < value.length; index += 1) {
      const [, error] = validateRuleBase(`${name}.${index}`, value[index], nestedRule)
      if (error) errors.push(error)
      errors.push(...validateNestedRulesSync(`${name}.${index}`, value[index], nestedRule))
    }
  }
  if (rule.fields && value && typeof value === 'object') {
    for (const key of Object.keys(rule.fields)) {
      const nestedRule = resolveRule(rule.fields[key])
      if (nestedRule.validator) return []
      const childValue = readChildValue(value, key)
      const [, error] = validateRuleBase(`${name}.${key}`, childValue, nestedRule)
      if (error) errors.push(error)
      errors.push(...validateNestedRulesSync(`${name}.${key}`, childValue, nestedRule))
    }
  }
  return errors
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
    const nestedErrors = !error ? validateNestedRulesSync(name, value, rule) : []
    const messages = error ? [error] : nestedErrors
    appendResult(result, rule, messages)
    if (messages.length > 0 && validateFirst && !rule.warningOnly) break
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
      (errors, index) => errors.length > 0 && !resolvedRules[index].warningOnly,
    )
    if (firstErrorIndex >= 0) {
      result.errors.push(results[firstErrorIndex][0] as string)
      return result
    }
    const firstWarningIndex = results.findIndex((errors) => errors.length > 0)
    if (firstWarningIndex >= 0) result.warnings.push(results[firstWarningIndex][0] as string)
    return result
  }

  for (const rule of resolvedRules) {
    const errors = await validateRule(name, value, values, rule)
    appendResult(result, rule, errors)
    if (errors.length > 0 && validateFirst && !rule.warningOnly) break
  }

  return result
}
