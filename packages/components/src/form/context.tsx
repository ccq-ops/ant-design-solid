import { createContext, useContext } from 'solid-js'
import type { Accessor } from 'solid-js'
import type { FormInstance, FormItemControl, ValidateStatus } from './interface'

export const FormContext = createContext<FormInstance>()
export function useFormContext(): FormInstance | undefined {
  return useContext(FormContext)
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
