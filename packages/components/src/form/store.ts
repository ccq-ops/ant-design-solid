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
import { serializeNamePath } from './name-path'
import { validateValue } from './validation'

interface CreateFormOptions {
  initialValues?: FormValues
  onFinish?: (values: FormValues) => void
  onFinishFailed?: (errorInfo: ValidateErrorInfo) => void
  onValuesChange?: (changedValues: FormValues, allValues: FormValues) => void
}

type FieldKey = string

function getFieldKey(name: FieldName): FieldKey {
  return serializeNamePath(name)
}

function getValueKey(name: FieldName): string | number {
  return Array.isArray(name) ? serializeNamePath(name) : name
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
    const fields = new Map<FieldKey, FieldMeta>()
    const fieldInitialValues = new Map<FieldKey, FieldValue>()
    const errorSignals = new Map<FieldKey, [Accessor<string[]>, (errors: string[]) => void]>()

    function ensureErrorSignal(name: FieldName) {
      const key = getFieldKey(name)
      let pair = errorSignals.get(key)
      if (!pair) {
        pair = createSignal<string[]>([])
        errorSignals.set(key, pair)
      }
      return pair
    }

    function clearErrors(names: FieldName[]) {
      for (const name of names) ensureErrorSignal(name)[1]([])
    }

    function getInitialValue(name: FieldName): FieldValue {
      const fieldKey = getFieldKey(name)
      const valueKey = getValueKey(name)
      return fieldInitialValues.has(fieldKey)
        ? fieldInitialValues.get(fieldKey)
        : formInitialValues[valueKey]
    }

    function setFieldValue(name: FieldName, value: FieldValue): void {
      batch(() => {
        setValues((current) => {
          const valueKey = getValueKey(name)
          const next = { ...current, [valueKey]: value }
          callbacks.onValuesChange?.({ [valueKey]: value }, next)
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
        const meta = fields.get(getFieldKey(name))
        const valueKey = getValueKey(name)
        const errors = validateValue(
          String(valueKey),
          currentValues[valueKey],
          currentValues,
          meta?.rules ?? [],
        )
        ensureErrorSignal(name)[1](errors)
        if (errors.length > 0) errorFields.push({ name, errors })
      }
      return { values: currentValues, errorFields }
    }

    const form: InternalFormInstance = {
      getFieldValue(name) {
        return values()[getValueKey(name)]
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
        const targetNames = names ?? Array.from(fields.values()).map((field) => field.name)
        batch(() => {
          setValues((current) => {
            const next = { ...current }
            for (const name of targetNames) next[getValueKey(name)] = getInitialValue(name)
            return next
          })
          clearErrors(targetNames)
        })
      },
      async validateFields(names) {
        const targetNames = names ?? Array.from(fields.values()).map((field) => field.name)
        const result = validateFieldNames(targetNames)
        if (result.errorFields.length > 0) throw result
        return result.values
      },
      submit() {
        const result = validateFieldNames(Array.from(fields.values()).map((field) => field.name))
        if (result.errorFields.length > 0) callbacks.onFinishFailed?.(result)
        else callbacks.onFinish?.(result.values)
      },
      registerField(meta) {
        const fieldKey = getFieldKey(meta.name)
        const valueKey = getValueKey(meta.name)
        fields.set(fieldKey, meta)
        if (meta.initialValue !== undefined) fieldInitialValues.set(fieldKey, meta.initialValue)
        else fieldInitialValues.delete(fieldKey)
        if (meta.initialValue !== undefined && untrack(values)[valueKey] === undefined) {
          setValues((current) => ({ ...current, [valueKey]: meta.initialValue }))
        }
        ensureErrorSignal(meta.name)
        return () => {
          const fieldKey = getFieldKey(meta.name)
          if (fields.get(fieldKey) === meta) fields.delete(fieldKey)
          if (!fields.has(fieldKey)) {
            fieldInitialValues.delete(fieldKey)
            errorSignals.delete(fieldKey)
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
