import { createContext, useContext } from 'solid-js'
import type { Accessor } from 'solid-js'
import type {
  FormInstance,
  FormItemControl,
  FormLayoutContextValue,
  NamePath,
  ValidateStatus,
} from './interface'

const defaultFormLayoutContext: FormLayoutContextValue = {
  layout: () => 'horizontal',
  requiredMark: () => true,
  colon: () => true,
  labelAlign: () => 'right',
  labelCol: () => undefined,
  wrapperCol: () => undefined,
  validateTrigger: () => undefined,
}

export const FormLayoutContext = createContext<FormLayoutContextValue>(defaultFormLayoutContext)
export function useFormLayoutContext(): FormLayoutContextValue {
  return useContext(FormLayoutContext) ?? defaultFormLayoutContext
}

export const FormContext = createContext<FormInstance>()
export function useFormContext(): FormInstance | undefined {
  return useContext(FormContext)
}

export function useFormInstance(): FormInstance {
  const form = useFormContext()
  if (!form) throw new Error('Form.useFormInstance must be used under a Form component')
  return form
}

export const FormItemContext = createContext<FormItemControl>()
export function useFormItemControl(): FormItemControl | undefined {
  return useContext(FormItemContext)
}

export interface FormItemStatusContextValue {
  status: Accessor<ValidateStatus | undefined>
  errors: Accessor<string[]>
  warnings: Accessor<string[]>
}

const emptyStatus: FormItemStatusContextValue = {
  status: () => undefined,
  errors: () => [],
  warnings: () => [],
}

export const FormItemStatusContext = createContext<FormItemStatusContextValue>(emptyStatus)
export function useFormItemStatus(): FormItemStatusContextValue {
  return useContext(FormItemStatusContext) ?? emptyStatus
}

export const FormListContext = createContext<NamePath>()
export function useFormListPrefix(): NamePath | undefined {
  return useContext(FormListContext)
}
