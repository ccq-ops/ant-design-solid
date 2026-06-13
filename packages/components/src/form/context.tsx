import { createContext, useContext } from 'solid-js'
import type { Accessor, JSX } from 'solid-js'
import type {
  FieldData,
  FormInstance,
  FormItemControl,
  FormLayoutContextValue,
  FormProviderProps,
  FormValues,
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

export interface FormProviderContextValue {
  registerForm: (name: string, form: FormInstance) => () => void
  triggerFormChange: (name: string, changedFields: FieldData[]) => void
  triggerFormFinish: (name: string, values: FormValues) => void
}

export const FormProviderContext = createContext<FormProviderContextValue>()
export function useFormProviderContext(): FormProviderContextValue | undefined {
  return useContext(FormProviderContext)
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

export function FormProvider(props: FormProviderProps): JSX.Element {
  let forms: Record<string, FormInstance> = {}

  const snapshotForms = () => ({ ...forms })

  const contextValue: FormProviderContextValue = {
    registerForm(name, form) {
      forms = { ...forms, [name]: form }
      return () => {
        if (forms[name] !== form) return
        const nextForms = { ...forms }
        delete nextForms[name]
        forms = nextForms
      }
    },
    triggerFormChange(name, changedFields) {
      props.onFormChange?.(name, {
        changedFields,
        forms: snapshotForms(),
      })
    },
    triggerFormFinish(name, values) {
      props.onFormFinish?.(name, {
        values,
        forms: snapshotForms(),
      })
    },
  }

  return (
    <FormProviderContext.Provider value={contextValue}>{props.children}</FormProviderContext.Provider>
  )
}
