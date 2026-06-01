import type { Accessor, JSX } from 'solid-js'

export type FieldName = string
export type FieldValue = unknown
export type FormValues = Record<string, FieldValue>
export type ValidateStatus = 'success' | 'warning' | 'error' | 'validating'

export interface Rule {
  required?: boolean
  type?: 'string' | 'number' | 'boolean' | 'array'
  min?: number
  max?: number
  len?: number
  pattern?: RegExp
  message?: string
  validator?: (value: FieldValue, values: FormValues) => string | void
}

export interface FieldError {
  name: FieldName
  errors: string[]
}

export interface ValidateErrorInfo {
  values: FormValues
  errorFields: FieldError[]
}

export interface FieldMeta {
  name: FieldName
  rules: Rule[]
  initialValue?: FieldValue
}

export interface FormInstance {
  getFieldValue: (name: FieldName) => FieldValue
  setFieldValue: (name: FieldName, value: FieldValue) => void
  getFieldsValue: () => FormValues
  setFieldsValue: (values: FormValues) => void
  resetFields: (names?: FieldName[]) => void
  validateFields: (names?: FieldName[]) => Promise<FormValues>
  submit: () => void
  registerField: (meta: FieldMeta) => () => void
  getFieldError: (name: FieldName) => Accessor<string[]>
}

export interface FormItemControl {
  name: FieldName
  value: Accessor<FieldValue>
  valuePropName: Accessor<string>
  trigger: Accessor<string>
  onChange: (nextOrEvent: FieldValue) => void
  setFieldValueFromControl: (nextOrEvent: FieldValue) => void
  errors: Accessor<string[]>
  status: Accessor<ValidateStatus | undefined>
}

export interface FormProps extends JSX.FormHTMLAttributes<HTMLFormElement> {
  form?: FormInstance
  initialValues?: FormValues
  onFinish?: (values: FormValues) => void
  onFinishFailed?: (errorInfo: ValidateErrorInfo) => void
  onValuesChange?: (changedValues: FormValues, allValues: FormValues) => void
  children?: JSX.Element
}

export interface FormItemProps {
  label?: JSX.Element
  name?: FieldName
  rules?: Rule[]
  required?: boolean
  help?: JSX.Element
  validateStatus?: ValidateStatus
  valuePropName?: string
  trigger?: string
  initialValue?: FieldValue
  children?: JSX.Element | ((control: FormItemControl) => JSX.Element)
}
