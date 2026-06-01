import { createContext, useContext } from 'solid-js'
import type { FormInstance, FormItemControl } from './interface'

export const FormContext = createContext<FormInstance>()
export function useFormContext(): FormInstance | undefined {
  return useContext(FormContext)
}

export const FormItemContext = createContext<FormItemControl>()
export function useFormItemControl(): FormItemControl | undefined {
  return useContext(FormItemContext)
}
