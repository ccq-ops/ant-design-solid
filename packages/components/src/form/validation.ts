import type {
  FieldValue,
  FormInstance,
  FormValues,
  Rule,
  RuleConfig,
  ValidateMessages,
} from './interface'

export interface ValidateValueOptions {
  form?: FormInstance
  validateFirst?: boolean | 'parallel'
  validateMessages?: ValidateMessages
  messageVariables?: Record<string, string>
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

const defaultValidateMessages: ValidateMessages = {
  required: '${name} is required',
  whitespace: '${name} cannot be blank',
  enum: '${name} is not in enum',
  pattern: '${name} format is invalid',
  string: '${name} is not a valid string',
  number: '${name} is not a valid number',
  boolean: '${name} is not a valid boolean',
  array: '${name} is not an array',
  object: '${name} is not an object',
  email: '${name} is not a valid email',
  url: '${name} is not a valid url',
  len: '${name} must be ${len} characters',
  min: '${name} must be at least ${min} characters',
  max: '${name} must be at most ${max} characters',
}

export function formatValidateMessage(
  template: string,
  variables: Record<string, string | number | undefined>,
): string {
  const escapedToken = '\u0000ADS_FORM_ESCAPED_PLACEHOLDER\u0000'
  return template
    .replace(/\\\$\{/g, escapedToken)
    .replace(/\$\{([^}]+)\}/g, (match, key: string) => {
      const value = variables[key]
      return value === undefined ? match : String(value)
    })
    .replace(new RegExp(escapedToken, 'g'), '${')
}

function getValidateMessage(
  messageKey: string,
  fallback: string,
  options: ValidateValueOptions,
): string {
  return options.validateMessages?.[messageKey] ?? defaultValidateMessages[messageKey] ?? fallback
}

function messageOf(
  name: string,
  rule: RuleConfig,
  messageKey: string,
  fallback: string,
  options: ValidateValueOptions,
): string {
  if (typeof rule.message === 'string') return rule.message
  const template = getValidateMessage(messageKey, fallback, options)
  const variables = {
    name,
    label: name,
    min: rule.min,
    max: rule.max,
    len: rule.len,
    enum: rule.enum?.join(', '),
    pattern: rule.pattern?.toString(),
    ...options.messageVariables,
  }
  return formatValidateMessage(template, variables)
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
  options: ValidateValueOptions,
): [FieldValue, string | undefined] {
  const value = rule.transform ? rule.transform(rawValue) : rawValue

  if (rule.required && isEmpty(value))
    return [value, messageOf(name, rule, 'required', `${name} is required`, options)]
  if (isEmpty(value)) return [value, undefined]

  if (rule.whitespace && typeof value === 'string' && value.trim() === '') {
    return [value, messageOf(name, rule, 'whitespace', `${name} cannot be blank`, options)]
  }

  if (rule.type === 'array' && !Array.isArray(value)) {
    return [value, messageOf(name, rule, 'array', `${name} is not an array`, options)]
  }
  if (rule.type === 'object' && !isObject(value)) {
    return [value, messageOf(name, rule, 'object', `${name} is not an object`, options)]
  }
  if (rule.type === 'email' && !isEmail(value)) {
    return [value, messageOf(name, rule, 'email', `${name} is not a valid email`, options)]
  }
  if (rule.type === 'url' && !isUrl(value)) {
    return [value, messageOf(name, rule, 'url', `${name} is not a valid url`, options)]
  }
  if (rule.enum && !rule.enum.includes(value)) {
    return [value, messageOf(name, rule, 'enum', `${name} is not in enum`, options)]
  }
  if (
    rule.type &&
    !['array', 'object', 'email', 'url', 'enum'].includes(rule.type) &&
    typeof value !== rule.type
  ) {
    return [value, messageOf(name, rule, rule.type, `${name} is not a valid ${rule.type}`, options)]
  }

  if (typeof value === 'number') {
    if (rule.len !== undefined && value !== rule.len) {
      return [value, messageOf(name, rule, 'len', `${name} must equal ${rule.len}`, options)]
    }
    if (rule.min !== undefined && value < rule.min) {
      return [value, messageOf(name, rule, 'min', `${name} must be at least ${rule.min}`, options)]
    }
    if (rule.max !== undefined && value > rule.max) {
      return [value, messageOf(name, rule, 'max', `${name} must be at most ${rule.max}`, options)]
    }
  }

  const length = getLength(value)
  if (length !== undefined) {
    if (rule.len !== undefined && length !== rule.len) {
      return [
        value,
        messageOf(name, rule, 'len', `${name} must be ${rule.len} characters`, options),
      ]
    }
    if (rule.min !== undefined && length < rule.min) {
      return [
        value,
        messageOf(name, rule, 'min', `${name} must be at least ${rule.min} characters`, options),
      ]
    }
    if (rule.max !== undefined && length > rule.max) {
      return [
        value,
        messageOf(name, rule, 'max', `${name} must be at most ${rule.max} characters`, options),
      ]
    }
  }

  if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
    return [value, messageOf(name, rule, 'pattern', `${name} format is invalid`, options)]
  }

  return [value, undefined]
}

async function validateRule(
  name: string,
  rawValue: FieldValue,
  values: FormValues,
  rule: RuleConfig,
  options: ValidateValueOptions,
): Promise<string[]> {
  const [value, baseError] = validateRuleBase(name, rawValue, rule, options)
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
          options,
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
          options,
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

function validateNestedRulesSync(
  name: string,
  value: FieldValue,
  rule: RuleConfig,
  options: ValidateValueOptions,
): string[] {
  const errors: string[] = []
  if (rule.defaultField && Array.isArray(value)) {
    const nestedRule = resolveRule(rule.defaultField)
    if (nestedRule.validator) return []
    for (let index = 0; index < value.length; index += 1) {
      const [, error] = validateRuleBase(`${name}.${index}`, value[index], nestedRule, options)
      if (error) errors.push(error)
      errors.push(...validateNestedRulesSync(`${name}.${index}`, value[index], nestedRule, options))
    }
  }
  if (rule.fields && value && typeof value === 'object') {
    for (const key of Object.keys(rule.fields)) {
      const nestedRule = resolveRule(rule.fields[key])
      if (nestedRule.validator) return []
      const childValue = readChildValue(value, key)
      const [, error] = validateRuleBase(`${name}.${key}`, childValue, nestedRule, options)
      if (error) errors.push(error)
      errors.push(...validateNestedRulesSync(`${name}.${key}`, childValue, nestedRule, options))
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
    const [, error] = validateRuleBase(name, value, rule, options)
    const nestedErrors = !error ? validateNestedRulesSync(name, value, rule, options) : []
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
      resolvedRules.map((rule) => validateRule(name, value, values, rule, options)),
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
    const errors = await validateRule(name, value, values, rule, options)
    appendResult(result, rule, errors)
    if (errors.length > 0 && validateFirst && !rule.warningOnly) break
  }

  return result
}
