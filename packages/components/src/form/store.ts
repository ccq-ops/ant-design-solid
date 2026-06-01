import { batch, createRoot, createSignal, untrack, type Accessor } from 'solid-js'
import type {
  FieldError,
  FieldMeta,
  FieldName,
  FieldValue,
  FormInstance,
  FormValues,
  ValidateErrorInfo,
} from './interface'
import { validateValue } from './validation'

interface CreateFormOptions {
  initialValues?: FormValues
  onFinish?: (values: FormValues) => void
  onFinishFailed?: (errorInfo: ValidateErrorInfo) => void
  onValuesChange?: (changedValues: FormValues, allValues: FormValues) => void
}

interface InternalFormInstance extends FormInstance {
  setInitialValues?: (values?: FormValues) => void
  setCallbacks?: (callbacks: Omit<CreateFormOptions, 'initialValues'>) => void
}

export function createFormInstance(options: CreateFormOptions = {}): FormInstance {
  return createRoot(() => {
    let formInitialValues = { ...options.initialValues }
    let callbacks: Omit<CreateFormOptions, 'initialValues'> = {
      onFinish: options.onFinish,
      onFinishFailed: options.onFinishFailed,
      onValuesChange: options.onValuesChange,
    }
    const [values, setValues] = createSignal<FormValues>({ ...formInitialValues })
    const fields = new Map<FieldName, FieldMeta>()
    const fieldInitialValues = new Map<FieldName, FieldValue>()
    const errorSignals = new Map<FieldName, [Accessor<string[]>, (errors: string[]) => void]>()

    function ensureErrorSignal(name: FieldName) {
      let pair = errorSignals.get(name)
      if (!pair) {
        pair = createSignal<string[]>([])
        errorSignals.set(name, pair)
      }
      return pair
    }

    function clearErrors(names: FieldName[]) {
      for (const name of names) ensureErrorSignal(name)[1]([])
    }

    function getInitialValue(name: FieldName): FieldValue {
      return fieldInitialValues.has(name) ? fieldInitialValues.get(name) : formInitialValues[name]
    }

    function setFieldValue(name: FieldName, value: FieldValue): void {
      batch(() => {
        setValues((current) => {
          const next = { ...current, [name]: value }
          callbacks.onValuesChange?.({ [name]: value }, next)
          return next
        })
        clearErrors([name])
      })
    }

    function validateFieldNames(names: FieldName[]): {
      values: FormValues
      errorFields: FieldError[]
    } {
      const currentValues = values()
      const errorFields: FieldError[] = []
      for (const name of names) {
        const meta = fields.get(name)
        const errors = validateValue(name, currentValues[name], currentValues, meta?.rules ?? [])
        ensureErrorSignal(name)[1](errors)
        if (errors.length > 0) errorFields.push({ name, errors })
      }
      return { values: currentValues, errorFields }
    }

    const form: InternalFormInstance = {
      getFieldValue(name) {
        return values()[name]
      },
      setFieldValue,
      getFieldsValue() {
        return { ...values() }
      },
      setFieldsValue(nextValues) {
        batch(() => {
          setValues((current) => {
            const next = { ...current, ...nextValues }
            callbacks.onValuesChange?.(nextValues, next)
            return next
          })
          clearErrors(Object.keys(nextValues))
        })
      },
      resetFields(names) {
        const targetNames = names ?? Array.from(fields.keys())
        batch(() => {
          setValues((current) => {
            const next = { ...current }
            for (const name of targetNames) next[name] = getInitialValue(name)
            return next
          })
          clearErrors(targetNames)
        })
      },
      async validateFields(names) {
        const targetNames = names ?? Array.from(fields.keys())
        const result = validateFieldNames(targetNames)
        if (result.errorFields.length > 0) throw result
        return result.values
      },
      submit() {
        const result = validateFieldNames(Array.from(fields.keys()))
        if (result.errorFields.length > 0) callbacks.onFinishFailed?.(result)
        else callbacks.onFinish?.(result.values)
      },
      registerField(meta) {
        fields.set(meta.name, meta)
        if (meta.initialValue !== undefined) fieldInitialValues.set(meta.name, meta.initialValue)
        else fieldInitialValues.delete(meta.name)
        if (meta.initialValue !== undefined && untrack(values)[meta.name] === undefined) {
          setValues((current) => ({ ...current, [meta.name]: meta.initialValue }))
        }
        ensureErrorSignal(meta.name)
        return () => {
          if (fields.get(meta.name) === meta) fields.delete(meta.name)
          if (!fields.has(meta.name)) {
            fieldInitialValues.delete(meta.name)
            errorSignals.delete(meta.name)
          }
        }
      },
      getFieldError(name) {
        return ensureErrorSignal(name)[0]
      },
      setInitialValues(nextInitialValues) {
        formInitialValues = { ...nextInitialValues }
        setValues((current) => ({ ...formInitialValues, ...current }))
      },
      setCallbacks(nextCallbacks) {
        callbacks = nextCallbacks
      },
    }

    return form
  })
}

export function useForm(form?: FormInstance): [FormInstance] {
  return [form ?? createFormInstance()]
}

export function setFormInitialValues(form: FormInstance, initialValues?: FormValues): void {
  ;(form as InternalFormInstance).setInitialValues?.(initialValues)
}

export function setFormCallbacks(
  form: FormInstance,
  callbacks: Omit<CreateFormOptions, 'initialValues'>,
): void {
  ;(form as InternalFormInstance).setCallbacks?.(callbacks)
}
