import { batch, createRoot, createSignal, type Accessor } from 'solid-js'
import { createFieldRecord, fieldRecordToData, getFieldKey, type FieldRecord } from './field-store'
import { matchNamePath } from './name-path'
import {
  cloneFormValues,
  flattenValuePaths,
  getValue,
  mergeValues,
  pickValues,
  setValue,
} from './value-util'
import { validateValue } from './validation'
import type {
  FieldData,
  FieldError,
  FieldName,
  FieldValue,
  FormInstance,
  FormValues,
  ValidateConfig,
  ValidateErrorInfo,
} from './interface'

interface CreateFormOptions {
  initialValues?: FormValues
  onFinish?: (values: FormValues) => void
  onFinishFailed?: (errorInfo: ValidateErrorInfo) => void
  onValuesChange?: (changedValues: FormValues, allValues: FormValues) => void
  onFieldsChange?: (changedFields: FieldData[], allFields: FieldData[]) => void
}

interface InternalFormInstance extends FormInstance {
  setInitialValues?: (values?: FormValues) => void
  setCallbacks?: (callbacks: Omit<CreateFormOptions, 'initialValues'>) => void
}

export function createFormInstance(options: CreateFormOptions = {}): FormInstance {
  return createRoot(() => {
    let sourceInitialValues = options.initialValues
    let formInitialValues = cloneFormValues(options.initialValues ?? {})
    const [values, setValues] = createSignal<FormValues>(cloneFormValues(formInitialValues))
    let callbacks: Omit<CreateFormOptions, 'initialValues'> = {
      onFinish: options.onFinish,
      onFinishFailed: options.onFinishFailed,
      onValuesChange: options.onValuesChange,
      onFieldsChange: options.onFieldsChange,
    }
    const fields = new Map<string, FieldRecord>()

    function getRegisteredRecords(nameList?: FieldName[], recursive = false): FieldRecord[] {
      const records = Array.from(fields.values())
      if (!nameList) return records
      return records.filter((record) =>
        nameList.some((name) => matchNamePath(name, record.state.name, recursive)),
      )
    }

    function getAllFieldData(): FieldData[] {
      return Array.from(fields.values()).map((record) => fieldRecordToData(record, values()))
    }

    function notifyFieldsChange(changedRecords: FieldRecord[]) {
      if (changedRecords.length === 0) return
      callbacks.onFieldsChange?.(
        changedRecords.map((record) => fieldRecordToData(record, values())),
        getAllFieldData(),
      )
    }

    function clearRecordValidation(record: FieldRecord) {
      record.setErrors([])
      record.state.warnings = []
      record.state.validating = false
    }

    function setFieldValueInternal(
      name: FieldName,
      value: FieldValue,
      touch: boolean,
    ): FieldRecord | undefined {
      setValues((currentValues) => setValue(currentValues, name, value))
      const record = fields.get(getFieldKey(name))
      if (record) {
        if (touch) record.state.touched = true
        record.state.dirty = true
        clearRecordValidation(record)
      }
      return record
    }

    function validateFieldNames(
      names: FieldName[],
      config: ValidateConfig = {},
    ): ValidateErrorInfo {
      const records = getRegisteredRecords(names, config.recursive)
      const errorFields: FieldError[] = []
      const changedRecords: FieldRecord[] = []
      for (const record of records) {
        if (config.dirty && !record.state.dirty && !record.state.validated) continue
        const errors = validateValue(
          record.state.name.join('.'),
          getValue(values(), record.state.name),
          values(),
          record.meta.rules,
        )
        if (errors.length > 0) {
          errorFields.push({
            name: [...record.state.name],
            errors,
            warnings: [...record.state.warnings],
          })
        }
        if (!config.validateOnly) {
          record.state.validated = true
          record.setErrors(errors)
          changedRecords.push(record)
        }
      }
      if (!config.validateOnly) notifyFieldsChange(changedRecords)
      return {
        values: cloneFormValues(values()),
        errorFields,
        outOfDate: false,
      }
    }

    const form: InternalFormInstance = {
      getFieldValue(name) {
        return getValue(values(), name)
      },
      setFieldValue(name, value) {
        batch(() => {
          const record = setFieldValueInternal(name, value, true)
          const changedValues = setValue({}, name, value)
          callbacks.onValuesChange?.(changedValues, cloneFormValues(values()))
          if (record) notifyFieldsChange([record])
        })
      },
      getFieldsValue(nameList) {
        if (nameList === true) return cloneFormValues(values())
        if (Array.isArray(nameList)) return pickValues(values(), nameList)
        return pickValues(
          values(),
          Array.from(fields.values()).map((record) => record.state.name),
        )
      },
      setFieldsValue(nextValues) {
        batch(() => {
          setValues((currentValues) => mergeValues(currentValues, nextValues))
          const changedPaths = flattenValuePaths(nextValues)
          const changedRecords = Array.from(fields.values()).filter((record) =>
            changedPaths.some((path) => matchNamePath(path, record.state.name, false)),
          )
          for (const record of changedRecords) {
            record.state.dirty = true
            clearRecordValidation(record)
          }
          callbacks.onValuesChange?.(cloneFormValues(nextValues), cloneFormValues(values()))
          notifyFieldsChange(changedRecords)
        })
      },
      setFields(nextFields) {
        batch(() => {
          const changedRecords: FieldRecord[] = []
          for (const field of nextFields) {
            const key = getFieldKey(field.name)
            let record = fields.get(key)
            if (!record) {
              record = createFieldRecord({ name: field.name, rules: [] })
              fields.set(key, record)
            }
            if ('value' in field) {
              setValues((currentValues) => setValue(currentValues, field.name, field.value))
            }
            if (field.errors) record.setErrors(field.errors)
            if (field.warnings) record.state.warnings = [...field.warnings]
            if (field.touched !== undefined) record.state.touched = field.touched
            if (field.validating !== undefined) record.state.validating = field.validating
            if ('value' in field) record.state.dirty = true
            changedRecords.push(record)
          }
          notifyFieldsChange(changedRecords)
        })
      },
      resetFields(names) {
        const targetRecords = getRegisteredRecords(names)
        batch(() => {
          for (const record of targetRecords) {
            const itemInitialValue = record.meta.initialValue
            const initialValue =
              itemInitialValue !== undefined
                ? itemInitialValue
                : getValue(formInitialValues, record.state.name)
            setValues((currentValues) => setValue(currentValues, record.state.name, initialValue))
            record.state.touched = false
            record.state.validating = false
            record.state.validated = false
            record.state.dirty = false
            record.state.warnings = []
            record.setErrors([])
          }
          notifyFieldsChange(targetRecords)
        })
      },
      async validateFields(names, config) {
        const targetNames = names ?? Array.from(fields.values()).map((record) => record.state.name)
        const result = validateFieldNames(targetNames, config)
        if (result.errorFields.length > 0) throw result
        return result.values
      },
      submit() {
        const targetNames = Array.from(fields.values()).map((record) => record.state.name)
        const result = validateFieldNames(targetNames)
        if (result.errorFields.length > 0) callbacks.onFinishFailed?.(result)
        else callbacks.onFinish?.(result.values)
      },
      registerField(meta) {
        const key = getFieldKey(meta.name)
        const existing = fields.get(key)
        const record = existing ?? createFieldRecord(meta)
        record.meta = meta
        fields.set(key, record)
        if (meta.initialValue !== undefined && getValue(values(), meta.name) === undefined) {
          setValues((currentValues) => setValue(currentValues, meta.name, meta.initialValue))
        }
        return () => {
          if (fields.get(key) === record) fields.delete(key)
        }
      },
      getFieldError(name) {
        return [...(fields.get(getFieldKey(name))?.state.errors ?? [])]
      },
      getFieldsError(nameList) {
        return getRegisteredRecords(nameList).map((record) => ({
          name: [...record.state.name],
          errors: [...record.state.errors],
          warnings: [...record.state.warnings],
        }))
      },
      getFieldErrorAccessor(name): Accessor<string[]> {
        const key = getFieldKey(name)
        let record = fields.get(key)
        if (!record) {
          record = createFieldRecord({ name, rules: [] })
          fields.set(key, record)
        }
        return record.errors
      },
      isFieldTouched(name) {
        return fields.get(getFieldKey(name))?.state.touched ?? false
      },
      isFieldsTouched(nameListOrAllTouched?: FieldName[] | boolean, allTouched = false) {
        const records = getRegisteredRecords(
          Array.isArray(nameListOrAllTouched) ? nameListOrAllTouched : undefined,
        )
        const requireAllTouched =
          typeof nameListOrAllTouched === 'boolean' ? nameListOrAllTouched : allTouched
        if (records.length === 0) return false
        return requireAllTouched
          ? records.every((record) => record.state.touched)
          : records.some((record) => record.state.touched)
      },
      isFieldValidating(name) {
        return fields.get(getFieldKey(name))?.state.validating ?? false
      },
      setInitialValues(nextInitialValues) {
        const nextInitialValuesClone = cloneFormValues(nextInitialValues ?? {})
        setValues((currentValues) =>
          sourceInitialValues === nextInitialValues
            ? currentValues
            : mergeValues(nextInitialValuesClone, currentValues),
        )
        sourceInitialValues = nextInitialValues
        formInitialValues = nextInitialValuesClone
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
