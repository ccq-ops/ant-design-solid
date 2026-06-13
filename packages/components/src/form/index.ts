import { FormProvider, useFormInstance, useFormItemStatus } from './context'
import { FormRoot } from './form'
import { FormErrorList } from './form-error-list'
import { FormItem } from './form-item'
import { FormList } from './form-list'
import { useForm } from './store'
import { useWatch } from './use-watch'

const Item = Object.assign(FormItem, { useStatus: useFormItemStatus })

export const Form = Object.assign(FormRoot, {
  Item,
  List: FormList,
  ErrorList: FormErrorList,
  Provider: FormProvider,
  useForm,
  useFormInstance,
  useWatch,
})
export { FormErrorList, FormList, Item as FormItem }
export { useForm, createFormInstance } from './store'
export {
  FormProvider,
  useFormItemControl,
  useFormInstance,
  useFormItemStatus,
  useFormProviderContext,
} from './context'
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
  FormItemHasFeedback,
  FormItemProps,
  FormItemSemanticClassNames,
  FormItemSemanticSlot,
  FormItemSemanticStyles,
  FormListField,
  FormListMeta,
  FormListOperation,
  FormListProps,
  FormProviderProps,
  FormProps,
  FormValues,
  FormVariant,
  FormTooltipProps,
  FormTooltip,
  FormSemanticSlot,
  FormSemanticClassNames,
  FormSemanticStyles,
  FeedbackIcons,
  FilterFunc,
  GetFieldsValueConfig,
  NamePath,
  Rule,
  SemanticInfo,
  ValidateConfig,
  ValidateErrorInfo,
  ValidateMessages,
  ValidateStatus,
} from './interface'
