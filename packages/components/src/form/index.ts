import { FormRoot } from './form'
import { FormItem } from './form-item'

export const Form = Object.assign(FormRoot, { Item: FormItem })
export { FormItem }
export { useForm, createFormInstance } from './store'
export { useFormItemControl } from './context'
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
