import { batch, createRoot, createSignal, type Accessor } from 'solid-js'
import { createFieldRecord, fieldRecordToData, getFieldKey, type FieldRecord } from './field-store'
import { matchNamePath } from './name-path'
import { cloneFormValues, getValue, mergeValues, pickValues, setValue } from './value-util'
import { validateValue, validateValueSync, type ValidateValueResult } from './validation'
import type {
  FieldData,
  FieldError,
  FieldName,
  FieldValue,
  FormInstance,
  FormValues,
  InternalNamePath,
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

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function collectChangedValuePaths(
  value: unknown,
  prefix: InternalNamePath = [],
): InternalNamePath[] {
  if (Array.isArray(value)) {
    if (value.length === 0) return prefix.length > 0 ? [prefix] : []
    return value.flatMap((item, index) => collectChangedValuePaths(item, [...prefix, index]))
  }
  if (isPlainObject(value)) {
    const keys = Object.keys(value)
    if (keys.length === 0) return prefix.length > 0 ? [prefix] : []
    return keys.flatMap((key) => collectChangedValuePaths(value[key], [...prefix, key]))
  }
  return prefix.length > 0 ? [prefix] : []
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
    const errorSignals = new Map<string, [Accessor<string[]>, (errors: string[]) => void]>()
    const warningSignals = new Map<string, [Accessor<string[]>, (warnings: string[]) => void]>()
    const validatingSignals = new Map<string, [Accessor<boolean>, (validating: boolean) => void]>()
    const validationSequences = new WeakMap<FieldRecord, number>()

    function nextValidationSequence(record: FieldRecord): number {
      const sequence = (validationSequences.get(record) ?? 0) + 1
      validationSequences.set(record, sequence)
      return sequence
    }

    function invalidateValidation(record: FieldRecord): void {
      validationSequences.set(record, (validationSequences.get(record) ?? 0) + 1)
    }

    function isCurrentValidation(record: FieldRecord, sequence: number): boolean {
      return (
        validationSequences.get(record) === sequence &&
        fields.get(getFieldKey(record.state.name)) === record
      )
    }

    function ensureErrorSignal(name: FieldName): [Accessor<string[]>, (errors: string[]) => void] {
      const key = getFieldKey(name)
      let signal = errorSignals.get(key)
      if (!signal) {
        signal = createSignal<string[]>([])
        errorSignals.set(key, signal)
      }
      return signal
    }

    function ensureWarningSignal(
      name: FieldName,
    ): [Accessor<string[]>, (warnings: string[]) => void] {
      const key = getFieldKey(name)
      let signal = warningSignals.get(key)
      if (!signal) {
        signal = createSignal<string[]>([])
        warningSignals.set(key, signal)
      }
      return signal
    }

    function ensureValidatingSignal(
      name: FieldName,
    ): [Accessor<boolean>, (validating: boolean) => void] {
      const key = getFieldKey(name)
      let signal = validatingSignals.get(key)
      if (!signal) {
        signal = createSignal<boolean>(false)
        validatingSignals.set(key, signal)
      }
      return signal
    }

    function setRecordWarnings(record: FieldRecord, warnings: string[]): void {
      record.state.warnings = [...warnings]
      ensureWarningSignal(record.state.name)[1]([...warnings])
    }

    function setRecordValidating(record: FieldRecord, validating: boolean): void {
      record.state.validating = validating
      ensureValidatingSignal(record.state.name)[1](validating)
    }

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
      invalidateValidation(record)
      record.setErrors([])
      setRecordWarnings(record, [])
      setRecordValidating(record, false)
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

    function buildValidationResult(
      records: FieldRecord[],
      results: Map<FieldRecord, ValidateValueResult>,
      validateOnly?: boolean,
      outOfDate = false,
    ): ValidateErrorInfo {
      const errorFields: FieldError[] = []
      const changedRecords: FieldRecord[] = []
      for (const record of records) {
        const result = results.get(record)
        if (!result) continue
        if (result.errors.length > 0) {
          errorFields.push({
            name: [...record.state.name],
            errors: result.errors,
            warnings: result.warnings,
          })
        }
        if (!validateOnly) {
          record.state.validated = true
          record.setErrors(result.errors)
          setRecordWarnings(record, result.warnings)
          changedRecords.push(record)
        }
      }
      if (!validateOnly) notifyFieldsChange(changedRecords)
      return {
        values: cloneFormValues(values()),
        errorFields,
        outOfDate,
      }
    }

    async function validateFieldNames(
      names: FieldName[],
      config: ValidateConfig = {},
    ): Promise<ValidateErrorInfo> {
      const records = getRegisteredRecords(names, config.recursive)
      const results = new Map<FieldRecord, ValidateValueResult>()
      let outOfDate = false
      for (const record of records) {
        if (config.dirty && !record.state.dirty && !record.state.validated) continue
        const sequence = nextValidationSequence(record)
        if (!config.validateOnly) {
          setRecordValidating(record, true)
          notifyFieldsChange([record])
        }
        try {
          const result = await validateValue(
            record.state.name.join('.'),
            getValue(values(), record.state.name),
            values(),
            record.meta.rules,
            { form },
          )
          if (!isCurrentValidation(record, sequence)) {
            outOfDate = true
            continue
          }
          results.set(record, result)
        } catch (error) {
          if (!isCurrentValidation(record, sequence)) {
            outOfDate = true
            continue
          }
          results.set(record, {
            errors: [error instanceof Error ? error.message : String(error)],
            warnings: [],
          })
        } finally {
          if (!config.validateOnly && isCurrentValidation(record, sequence)) {
            setRecordValidating(record, false)
            notifyFieldsChange([record])
          }
        }
      }
      return buildValidationResult(records, results, config.validateOnly, outOfDate)
    }

    function validateFieldNamesSync(
      names: FieldName[],
      config: ValidateConfig = {},
    ): ValidateErrorInfo | undefined {
      const records = getRegisteredRecords(names, config.recursive)
      const results = new Map<FieldRecord, ValidateValueResult>()
      for (const record of records) {
        if (config.dirty && !record.state.dirty && !record.state.validated) continue
        const result = validateValueSync(
          record.state.name.join('.'),
          getValue(values(), record.state.name),
          values(),
          record.meta.rules,
          { form },
        )
        if (!result) return undefined
        results.set(record, result)
      }
      return buildValidationResult(records, results, config.validateOnly)
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
          const changedPaths = collectChangedValuePaths(nextValues)
          const changedRecords = Array.from(fields.values()).filter((record) =>
            changedPaths.some(
              (path) =>
                matchNamePath(path, record.state.name, true) ||
                matchNamePath(record.state.name, path, true),
            ),
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
              record = createFieldRecord(
                { name: field.name, rules: [] },
                ensureErrorSignal(field.name),
              )
              fields.set(key, record)
            }
            if ('value' in field) {
              setValues((currentValues) => setValue(currentValues, field.name, field.value))
            }
            if (field.errors) record.setErrors(field.errors)
            if (field.warnings) setRecordWarnings(record, field.warnings)
            if (field.touched !== undefined) record.state.touched = field.touched
            if (field.validating !== undefined) setRecordValidating(record, field.validating)
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
            invalidateValidation(record)
            setRecordValidating(record, false)
            record.state.validated = false
            record.state.dirty = false
            setRecordWarnings(record, [])
            record.setErrors([])
          }
          notifyFieldsChange(targetRecords)
        })
      },
      async validateFields(names, config) {
        const targetNames = names ?? Array.from(fields.values()).map((record) => record.state.name)
        const result = await validateFieldNames(targetNames, config)
        if (result.errorFields.length > 0 || result.outOfDate) throw result
        return result.values
      },
      submit() {
        const targetNames = Array.from(fields.values()).map((record) => record.state.name)
        const syncResult = validateFieldNamesSync(targetNames)
        if (syncResult) {
          if (syncResult.errorFields.length > 0) callbacks.onFinishFailed?.(syncResult)
          else callbacks.onFinish?.(syncResult.values)
          return
        }
        void validateFieldNames(targetNames)
          .then((result) => {
            if (result.errorFields.length > 0 || result.outOfDate)
              callbacks.onFinishFailed?.(result)
            else callbacks.onFinish?.(result.values)
          })
          .catch((error: unknown) => {
            callbacks.onFinishFailed?.({
              values: cloneFormValues(values()),
              errorFields: [],
              outOfDate: false,
              ...(typeof error === 'object' && error !== null ? error : {}),
            })
          })
      },
      registerField(meta) {
        const key = getFieldKey(meta.name)
        const existing = fields.get(key)
        const record = existing ?? createFieldRecord(meta, ensureErrorSignal(meta.name))
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
        const key = getFieldKey(name)
        return [...(fields.get(key)?.state.errors ?? errorSignals.get(key)?.[0]() ?? [])]
      },
      getFieldsError(nameList) {
        return getRegisteredRecords(nameList).map((record) => ({
          name: [...record.state.name],
          errors: [...record.state.errors],
          warnings: [...record.state.warnings],
        }))
      },
      getFieldErrorAccessor(name): Accessor<string[]> {
        return ensureErrorSignal(name)[0]
      },
      getFieldWarnings(name) {
        const key = getFieldKey(name)
        return [...(fields.get(key)?.state.warnings ?? warningSignals.get(key)?.[0]() ?? [])]
      },
      getFieldWarningAccessor(name): Accessor<string[]> {
        return ensureWarningSignal(name)[0]
      },
      getFieldValidatingAccessor(name): Accessor<boolean> {
        return ensureValidatingSignal(name)[0]
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
        return (
          fields.get(getFieldKey(name))?.state.validating ??
          validatingSignals.get(getFieldKey(name))?.[0]() ??
          false
        )
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
