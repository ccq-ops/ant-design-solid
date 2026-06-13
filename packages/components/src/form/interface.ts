import type { ComponentSize } from '@ant-design-solid/theme'
import type { Accessor, JSX } from 'solid-js'
import type { TooltipProps } from '../tooltip'

export type NamePath = string | number | Array<string | number>
export type InternalNamePath = Array<string | number>
export type FieldName = NamePath
export type FieldValue = unknown
export type FormValues = Record<string, FieldValue>
export type ValidateStatus = 'success' | 'warning' | 'error' | 'validating'
export type FormLayout = 'horizontal' | 'vertical' | 'inline'
export type RequiredMark = boolean | 'optional'
export type FormVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'
export type FormSemanticSlot = 'root'

export type FormSemanticClassNamesMap = Partial<Record<FormSemanticSlot, string>>
export type FormSemanticStylesMap = Partial<Record<FormSemanticSlot, JSX.CSSProperties>>
export interface SemanticInfo {
  props: FormProps
}
export type FormSemanticClassNames =
  | FormSemanticClassNamesMap
  | ((info: SemanticInfo) => FormSemanticClassNamesMap)
export type FormSemanticStyles =
  | FormSemanticStylesMap
  | ((info: SemanticInfo) => FormSemanticStylesMap)
export type FeedbackIconRender = (info: {
  status: ValidateStatus
  errors: JSX.Element[]
  warnings: JSX.Element[]
}) => Partial<Record<ValidateStatus, JSX.Element>>
export type FeedbackIcons = Partial<Record<ValidateStatus, JSX.Element>> | FeedbackIconRender
export interface FormTooltipConfig extends Omit<TooltipProps, 'children'> {
  icon?: JSX.Element
}
export type FormTooltipProps = JSX.Element | FormTooltipConfig
export type FilterFunc = (meta: { touched: boolean; validating: boolean }) => boolean

export interface GetFieldsValueConfig {
  strict?: boolean
  filter?: FilterFunc
}

export interface FormLayoutContextValue {
  layout: Accessor<FormLayout>
  requiredMark: Accessor<RequiredMark>
  colon: Accessor<boolean>
  labelAlign: Accessor<'left' | 'right'>
  labelCol: Accessor<unknown>
  wrapperCol: Accessor<unknown>
  validateTrigger: Accessor<string | string[] | undefined>
}

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
  message?: string
  warningOnly?: boolean
  validateTrigger?: string | string[]
  validateFirst?: boolean | 'parallel'
  fields?: Record<string, Rule>
  defaultField?: Rule
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
  getFieldsValue: (nameList?: true | FieldName[] | GetFieldsValueConfig) => FormValues
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
  scrollToField?: (name: NamePath, options?: ScrollIntoViewOptions | { focus?: boolean }) => void
  getFieldInstance?: (name: NamePath) => unknown
  registerFieldInstance?: (name: NamePath, element: HTMLElement) => () => void
  isFieldTouched: (name: FieldName) => boolean
  isFieldsTouched: {
    (allTouched?: boolean): boolean
    (nameList?: FieldName[], allTouched?: boolean): boolean
  }
  isFieldValidating: (name: FieldName) => boolean
  subscribe: (listener: (previousValues?: FormValues) => void) => () => void
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
  validate: (sourceTrigger?: string) => void
  errors: Accessor<string[]>
  status: Accessor<ValidateStatus | undefined>
}

export interface FormListField {
  key: number
  name: number
  fieldKey: number
}

export interface FormListOperation {
  add: (defaultValue?: FieldValue, insertIndex?: number) => void
  remove: (index: number | number[]) => void
  move: (from: number, to: number) => void
}

export interface FormListMeta {
  errors: JSX.Element[]
  warnings: JSX.Element[]
}

export interface FormListProps {
  name: NamePath
  initialValue?: FieldValue[]
  rules?: Rule[]
  children: (
    fields: Accessor<FormListField[]>,
    operation: FormListOperation,
    meta: FormListMeta,
  ) => JSX.Element
}

export interface FormErrorListProps {
  errors?: JSX.Element[]
  warnings?: JSX.Element[]
}

export interface FormProviderProps {
  children?: JSX.Element
  onFormChange?: (
    name: string,
    info: {
      changedFields: FieldData[]
      forms: Record<string, FormInstance>
    },
  ) => void
  onFormFinish?: (
    name: string,
    info: {
      values: FormValues
      forms: Record<string, FormInstance>
    },
  ) => void
}

export interface FormProps extends JSX.FormHTMLAttributes<HTMLFormElement> {
  form?: FormInstance
  component?:
    | false
    | keyof JSX.IntrinsicElements
    | ((props: JSX.HTMLAttributes<HTMLElement>) => JSX.Element)
  name?: string
  fields?: FieldData[]
  initialValues?: FormValues
  onFinish?: (values: FormValues) => void
  onFinishFailed?: (errorInfo: ValidateErrorInfo) => void
  onValuesChange?: (changedValues: FormValues, allValues: FormValues) => void
  onFieldsChange?: (changedFields: FieldData[], allFields: FieldData[]) => void
  layout?: FormLayout
  labelAlign?: 'left' | 'right'
  colon?: boolean
  requiredMark?: RequiredMark
  validateTrigger?: string | string[]
  labelCol?: unknown
  wrapperCol?: unknown
  classNames?: FormSemanticClassNames
  styles?: FormSemanticStyles
  clearOnDestroy?: boolean
  scrollToFirstError?: boolean | (ScrollIntoViewOptions & { focus?: boolean })
  disabled?: boolean
  size?: ComponentSize
  variant?: FormVariant
  feedbackIcons?: FeedbackIcons
  labelWrap?: boolean
  tooltip?: FormTooltipProps
  preserve?: boolean
  validateMessages?: Record<string, string>
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
  labelCol?: unknown
  wrapperCol?: unknown
  labelAlign?: 'left' | 'right'
  colon?: boolean
  tooltip?: JSX.Element
  shouldUpdate?: boolean | ((prevValues: FormValues, nextValues: FormValues) => boolean)
  children?: JSX.Element | ((control: FormItemControl) => JSX.Element)
}
