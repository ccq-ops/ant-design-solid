import { FormRoot } from './form'
import { FormItem } from './form-item'
import { useFormItemStatus } from './context'

const Item = Object.assign(FormItem, { useStatus: useFormItemStatus })

export const Form = Object.assign(FormRoot, { Item })
export { Item as FormItem }
export { useForm, createFormInstance } from './store'
export { useFormItemControl, useFormItemStatus } from './context'
export type {
  FieldError,
  FieldMeta,
  FieldName,
  FieldValue,
  FormInstance,
  FormItemControl,
  FormItemProps,
  FormProps,
  FormValues,
  Rule,
  ValidateErrorInfo,
  ValidateStatus,
} from './interface'
