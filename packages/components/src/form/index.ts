import { FormRoot } from './form'
import { FormErrorList } from './form-error-list'
import { FormItem } from './form-item'
import { FormList } from './form-list'
import { useForm } from './store'
import { useFormInstance, useFormItemStatus } from './context'
import { useWatch } from './use-watch'

const Item = Object.assign(FormItem, { useStatus: useFormItemStatus })

export const Form = Object.assign(FormRoot, {
  Item,
  List: FormList,
  ErrorList: FormErrorList,
  useForm,
  useFormInstance,
  useWatch,
})
export { FormErrorList, FormList, Item as FormItem }
export { useForm, createFormInstance } from './store'
export { useFormItemControl, useFormInstance, useFormItemStatus } from './context'
export { useWatch }
export type { WatchOptions } from './use-watch'
export type {
  FieldData,
  FieldError,
  FieldMeta,
  FieldName,
  FieldValue,
  FormErrorListProps,
  FormInstance,
  FormItemControl,
  FormItemProps,
  FormListField,
  FormListMeta,
  FormListOperation,
  FormListProps,
  FormProps,
  FormValues,
  NamePath,
  Rule,
  ValidateConfig,
  ValidateErrorInfo,
  ValidateStatus,
} from './interface'
