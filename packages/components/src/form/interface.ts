import type { Accessor, JSX } from 'solid-js'

export type NamePath = string | number | Array<string | number>
export type InternalNamePath = Array<string | number>
export type FieldName = NamePath
export type FieldValue = unknown
export type FormValues = Record<string, FieldValue>
export type ValidateStatus = 'success' | 'warning' | 'error' | 'validating'

export interface ValidateConfig {
  validateOnly?: boolean
  recursive?: boolean
  dirty?: boolean
}

export interface RuleConfig {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'email' | 'url' | 'enum'
  enum?: FieldValue[]
  min?: number
  max?: number
  len?: number
  pattern?: RegExp
  whitespace?: boolean
  transform?: (value: FieldValue) => FieldValue
  message?: JSX.Element
  warningOnly?: boolean
  validateTrigger?: string | string[]
  validateFirst?: boolean | 'parallel'
  validator?: ((
    rule: RuleConfig,
    value: FieldValue,
    values?: FormValues,
  ) => string | void | Promise<void>) & {
    legacy?: boolean
  }
}

export type Rule = RuleConfig | ((form: FormInstance) => RuleConfig)

export interface FieldError {
  name: InternalNamePath
  errors: string[]
  warnings?: string[]
}

export interface FieldData {
  name: NamePath
  value?: FieldValue
  errors?: string[]
  warnings?: string[]
  touched?: boolean
  validating?: boolean
}

export interface ValidateErrorInfo {
  values: FormValues
  errorFields: FieldError[]
  outOfDate: boolean
}

export interface FieldMeta {
  name: FieldName
  rules: Rule[]
  initialValue?: FieldValue
  preserve?: boolean
  dependencies?: NamePath[]
  validateTrigger?: string | string[]
  validateFirst?: boolean | 'parallel'
}

export interface FormInstance {
  getFieldValue: (name: FieldName) => FieldValue
  setFieldValue: (name: FieldName, value: FieldValue) => void
  getFieldsValue: (nameList?: true | FieldName[]) => FormValues
  setFieldsValue: (values: FormValues) => void
  setFields: (fields: FieldData[]) => void
  resetFields: (names?: FieldName[]) => void
  validateFields: (names?: FieldName[], config?: ValidateConfig) => Promise<FormValues>
  submit: () => void
  registerField: (meta: FieldMeta) => () => void
  getFieldError: (name: FieldName) => string[]
  getFieldsError: (nameList?: FieldName[]) => FieldError[]
  getFieldErrorAccessor: (name: FieldName) => Accessor<string[]>
  getFieldWarnings?: (name: FieldName) => string[]
  getFieldWarningAccessor?: (name: FieldName) => Accessor<string[]>
  getFieldValidatingAccessor?: (name: FieldName) => Accessor<boolean>
  isFieldTouched: (name: FieldName) => boolean
  isFieldsTouched: {
    (allTouched?: boolean): boolean
    (nameList?: FieldName[], allTouched?: boolean): boolean
  }
  isFieldValidating: (name: FieldName) => boolean
}

export interface FormItemControl {
  name: FieldName
  value: Accessor<FieldValue>
  valueProps: Accessor<Record<string, unknown>>
  valuePropName: Accessor<string>
  trigger: Accessor<string>
  validateTrigger: Accessor<string | string[]>
  onChange: (nextOrEvent: FieldValue) => void
  setFieldValueFromControl: (nextOrEvent: FieldValue, sourceTrigger?: string) => void
  errors: Accessor<string[]>
  status: Accessor<ValidateStatus | undefined>
}

export interface FormProps extends JSX.FormHTMLAttributes<HTMLFormElement> {
  form?: FormInstance
  initialValues?: FormValues
  onFinish?: (values: FormValues) => void
  onFinishFailed?: (errorInfo: ValidateErrorInfo) => void
  onValuesChange?: (changedValues: FormValues, allValues: FormValues) => void
  onFieldsChange?: (changedFields: FieldData[], allFields: FieldData[]) => void
  children?: JSX.Element
}

export interface FormItemProps {
  label?: JSX.Element
  name?: FieldName
  dependencies?: NamePath[]
  rules?: Rule[]
  required?: boolean
  help?: JSX.Element
  validateStatus?: ValidateStatus
  valuePropName?: string
  trigger?: string
  getValueFromEvent?: (...args: unknown[]) => FieldValue
  getValueProps?: (value: FieldValue) => Record<string, unknown>
  normalize?: (value: FieldValue, prevValue: FieldValue, allValues: FormValues) => FieldValue
  validateTrigger?: string | string[]
  validateFirst?: boolean | 'parallel'
  validateDebounce?: number
  preserve?: boolean
  noStyle?: boolean
  hidden?: boolean
  extra?: JSX.Element
  initialValue?: FieldValue
  children?: JSX.Element | ((control: FormItemControl) => JSX.Element)
}
