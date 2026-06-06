import { FormRoot } from './form'
import { FormItem } from './form-item'
import { useForm } from './store'
import { useFormInstance, useFormItemStatus } from './context'
import { useWatch } from './use-watch'

const Item = Object.assign(FormItem, { useStatus: useFormItemStatus })

export const Form = Object.assign(FormRoot, { Item, useForm, useFormInstance, useWatch })
export { Item as FormItem }
export { useForm, createFormInstance } from './store'
export { useFormItemControl, useFormInstance, useFormItemStatus } from './context'
export { useWatch }
export type { WatchOptions } from './use-watch'
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
  NamePath,
  Rule,
  ValidateErrorInfo,
  ValidateStatus,
} from './interface'
