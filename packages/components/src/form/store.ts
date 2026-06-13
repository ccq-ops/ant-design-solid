import { batch, createRoot, createSignal, untrack, type Accessor } from 'solid-js'
import { createFieldRecord, fieldRecordToData, getFieldKey, type FieldRecord } from './field-store'
import { getNamePath, matchNamePath } from './name-path'
import {
  cloneFormValues,
  deleteValue,
  getValue,
  mergeValues,
  pickValues,
  setValue,
} from './value-util'
import { validateValue, validateValueSync, type ValidateValueResult } from './validation'
import type {
  FieldData,
  FieldError,
  FieldName,
  FieldValue,
  FilterFunc,
  FormInstance,
  FormValues,
  GetFieldsValueConfig,
  InternalNamePath,
  ValidateConfig,
  ValidateErrorInfo,
} from './interface'

interface CreateFormOptions {
  initialValues?: FormValues
  clearOnDestroy?: boolean
  onFinish?: (values: FormValues) => void
  onFinishFailed?: (errorInfo: ValidateErrorInfo) => void
  onValuesChange?: (changedValues: FormValues, allValues: FormValues) => void
  onFieldsChange?: (changedFields: FieldData[], allFields: FieldData[]) => void
}

type FormCallbacks = Omit<CreateFormOptions, 'initialValues'>
type ProviderCallbacks = {
  name?: string
  onFieldsChange?: (changedFields: FieldData[]) => void
  onFinish?: (values: FormValues) => void
}

interface InternalFormInstance extends FormInstance {
  setInitialValues?: (values?: FormValues) => void
  setCallbacks?: (callbacks: FormCallbacks) => () => void
  setControlledFields?: (fields: FieldData[]) => void
  destroy?: (clearOnDestroy?: boolean) => void
  registerFormOwner?: () => () => void
  setProviderCallbacks?: (callbacks: ProviderCallbacks) => () => void
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
    const defaultCallbacks: FormCallbacks = {
      clearOnDestroy: options.clearOnDestroy,
      onFinish: options.onFinish,
      onFinishFailed: options.onFinishFailed,
      onValuesChange: options.onValuesChange,
      onFieldsChange: options.onFieldsChange,
    }
    let callbacks: FormCallbacks = defaultCallbacks
    let providerCallbacks: ProviderCallbacks = {}
    const callbackEntries: Array<{ id: symbol; callbacks: FormCallbacks }> = []
    const providerCallbackEntries: Array<{ id: symbol; callbacks: ProviderCallbacks }> = []
    const fields = new Map<string, FieldRecord>()
    const errorSignals = new Map<string, [Accessor<string[]>, (errors: string[]) => void]>()
    const warningSignals = new Map<string, [Accessor<string[]>, (warnings: string[]) => void]>()
    const validatingSignals = new Map<string, [Accessor<boolean>, (validating: boolean) => void]>()
    const validationSequences = new WeakMap<FieldRecord, number>()
    const subscribers = new Set<(previousValues?: FormValues) => void>()
    const fieldInstances = new Map<string, HTMLElement>()
    const registeredFieldKeys = new Set<string>()
    let ownerCount = 0

    function getFieldFilter(config?: GetFieldsValueConfig): FilterFunc | undefined {
      return config?.filter
    }

    function areStringArraysEqual(
      first: readonly string[] | undefined,
      second: readonly string[] | undefined,
    ): boolean {
      if (first === second) return true
      const left = first ?? []
      const right = second ?? []
      return left.length === right.length && left.every((value, index) => value === right[index])
    }

    function notifySubscribers(previousValues?: FormValues): void {
      for (const listener of subscribers) listener(previousValues)
    }

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
      const records = Array.from(registeredFieldKeys, (key) => fields.get(key)).filter(
        (record): record is FieldRecord => record !== undefined,
      )
      if (!nameList) return records
      return records.filter((record) =>
        nameList.some((name) => matchNamePath(name, record.state.name, recursive)),
      )
    }

    function getFieldRecords(nameList?: FieldName[], recursive = false): FieldRecord[] {
      const records = Array.from(fields.values())
      if (!nameList) return records
      return records.filter((record) =>
        nameList.some((name) => matchNamePath(name, record.state.name, recursive)),
      )
    }

    function getRegisteredFieldData(nameList?: FieldName[], recursive = false): FieldData[] {
      const currentValues = untrack(() => values())
      return getRegisteredRecords(nameList, recursive).map((record) =>
        fieldRecordToData(record, currentValues),
      )
    }

    function getFilteredRegisteredNames(
      nameList?: FieldName[],
      filter?: FilterFunc,
    ): InternalNamePath[] {
      return getRegisteredFieldData(nameList)
        .filter((field) =>
          filter
            ? filter({
                touched: field.touched ?? false,
                validating: field.validating ?? false,
              })
            : true,
        )
        .map((field) => getNamePath(field.name))
    }

    function getAllFieldData(): FieldData[] {
      const currentValues = untrack(() => values())
      return getFieldRecords().map((record) => fieldRecordToData(record, currentValues))
    }

    function notifyFieldsChange(changedRecords: FieldRecord[]) {
      if (changedRecords.length === 0) return
      const changedFields = changedRecords.map((record) => fieldRecordToData(record, values()))
      callbacks.onFieldsChange?.(changedFields, getAllFieldData())
      if (providerCallbacks.name) providerCallbacks.onFieldsChange?.(changedFields)
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

    function getDependencyRecords(changedNames: FieldName[]): FieldRecord[] {
      return Array.from(fields.values()).filter((record) =>
        record.meta.dependencies?.some((dependency) =>
          changedNames.some(
            (changedName) =>
              matchNamePath(dependency, changedName, true) ||
              matchNamePath(changedName, dependency, true),
          ),
        ),
      )
    }

    function revalidateDependencies(changedNames: FieldName[]): void {
      const dependencyRecords = getDependencyRecords(changedNames)
      if (dependencyRecords.length === 0) return
      void form.validateFields(dependencyRecords.map((record) => record.state.name)).catch(() => {})
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
            {
              form,
              validateFirst: record.meta.validateFirst,
              validateMessages: record.meta.validateMessages,
              messageVariables: {
                label: String(record.meta.label ?? record.state.name.join('.')),
                name: record.state.name.join('.'),
                ...record.meta.messageVariables,
              },
            },
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
          {
            form,
            validateFirst: record.meta.validateFirst,
            validateMessages: record.meta.validateMessages,
            messageVariables: {
              label: String(record.meta.label ?? record.state.name.join('.')),
              name: record.state.name.join('.'),
              ...record.meta.messageVariables,
            },
          },
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
          const previousValues = cloneFormValues(values())
          const record = setFieldValueInternal(name, value, true)
          const changedValues = setValue({}, name, value)
          callbacks.onValuesChange?.(changedValues, cloneFormValues(values()))
          if (record) notifyFieldsChange([record])
          notifySubscribers(previousValues)
          revalidateDependencies([name])
        })
      },
      getFieldsValue(
        nameListOrConfig?: true | FieldName[] | GetFieldsValueConfig,
        filter?: FilterFunc,
      ) {
        const currentValues = untrack(() => values())
        if (nameListOrConfig === true) {
          if (!filter) return cloneFormValues(currentValues)
          return pickValues(currentValues, getFilteredRegisteredNames(undefined, filter))
        }
        if (Array.isArray(nameListOrConfig)) {
          if (!filter) return pickValues(currentValues, nameListOrConfig)
          return pickValues(currentValues, getFilteredRegisteredNames(nameListOrConfig, filter))
        }
        if (nameListOrConfig && typeof nameListOrConfig === 'object') {
          const fieldFilter = getFieldFilter(nameListOrConfig)
          if (!fieldFilter && !nameListOrConfig.strict) return cloneFormValues(currentValues)
          const matchingNames = getFilteredRegisteredNames(undefined, fieldFilter)
          if (nameListOrConfig.strict) return pickValues(currentValues, matchingNames)
          return pickValues(currentValues, matchingNames)
        }
        return pickValues(currentValues, getFilteredRegisteredNames())
      },
      setFieldsValue(nextValues) {
        batch(() => {
          const previousValues = cloneFormValues(values())
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
          notifySubscribers(previousValues)
          revalidateDependencies(changedPaths)
        })
      },
      setFields(nextFields) {
        batch(() => {
          const previousValues = cloneFormValues(values())
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
            if ('errors' in field) record.setErrors(field.errors ?? [])
            if ('warnings' in field) setRecordWarnings(record, field.warnings ?? [])
            if (field.touched !== undefined) record.state.touched = field.touched
            if (field.validating !== undefined) setRecordValidating(record, field.validating)
            if ('value' in field) record.state.dirty = true
            changedRecords.push(record)
          }
          notifyFieldsChange(changedRecords)
          if (nextFields.some((field) => 'value' in field)) notifySubscribers(previousValues)
        })
      },
      setControlledFields(nextFields) {
        batch(() => {
          const previousValues = untrack(() => cloneFormValues(values()))
          let nextValues = untrack(() => values())
          let hasValueChange = false
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
              const currentValue = getValue(nextValues, field.name)
              if (!Object.is(currentValue, field.value)) {
                nextValues = setValue(nextValues, field.name, field.value)
                record.state.dirty = true
                hasValueChange = true
              }
            }
            if ('errors' in field && !areStringArraysEqual(record.state.errors, field.errors)) {
              record.setErrors(field.errors ?? [])
            }
            if (
              'warnings' in field &&
              !areStringArraysEqual(record.state.warnings, field.warnings)
            ) {
              setRecordWarnings(record, field.warnings ?? [])
            }
            if (field.touched !== undefined && record.state.touched !== field.touched) {
              record.state.touched = field.touched
            }
            if (field.validating !== undefined && record.state.validating !== field.validating) {
              setRecordValidating(record, field.validating)
            }
          }
          if (hasValueChange) {
            setValues(nextValues)
            notifySubscribers(previousValues)
          }
        })
      },
      resetFields(names) {
        const targetRecords = getRegisteredRecords(names)
        batch(() => {
          const previousValues = cloneFormValues(values())
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
          notifySubscribers(previousValues)
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
          else {
            callbacks.onFinish?.(syncResult.values)
            providerCallbacks.onFinish?.(syncResult.values)
          }
          return
        }
        void validateFieldNames(targetNames)
          .then((result) => {
            if (result.errorFields.length > 0 || result.outOfDate)
              callbacks.onFinishFailed?.(result)
            else {
              callbacks.onFinish?.(result.values)
              providerCallbacks.onFinish?.(result.values)
            }
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
        registeredFieldKeys.add(key)
        if (meta.initialValue !== undefined && getValue(values(), meta.name) === undefined) {
          setValues((currentValues) => setValue(currentValues, meta.name, meta.initialValue))
          notifySubscribers()
        }
        return () => {
          if (fields.get(key) !== record) return
          registeredFieldKeys.delete(key)
          fields.delete(key)
          if (record.meta.preserve === false) {
            batch(() => {
              setValues((currentValues) => deleteValue(currentValues, record.state.name))
              clearRecordValidation(record)
              callbacks.onValuesChange?.(
                deleteValue({}, record.state.name),
                cloneFormValues(values()),
              )
              notifyFieldsChange([record])
              notifySubscribers()
              revalidateDependencies([record.state.name])
            })
          }
        }
      },
      getFieldError(name) {
        const key = getFieldKey(name)
        return [...(fields.get(key)?.state.errors ?? errorSignals.get(key)?.[0]() ?? [])]
      },
      getFieldsError(nameList) {
        return getFieldRecords(nameList).map((record) => ({
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
      scrollToField(name, options) {
        const element = fieldInstances.get(getFieldKey(name))
        if (!element) return
        const { focus, ...scrollOptions } = (options ?? {}) as ScrollIntoViewOptions & {
          focus?: boolean
        }
        element.scrollIntoView(Object.keys(scrollOptions).length > 0 ? scrollOptions : undefined)
        if (focus) {
          const focusTarget = element.matches('input,textarea,select,button,[tabindex]')
            ? element
            : element.querySelector<HTMLElement>('input,textarea,select,button,[tabindex]')
          focusTarget?.focus?.()
        }
      },
      getFieldInstance(name) {
        return fieldInstances.get(getFieldKey(name))
      },
      registerFieldInstance(name, element) {
        const key = getFieldKey(name)
        fieldInstances.set(key, element)
        return () => {
          if (fieldInstances.get(key) === element) fieldInstances.delete(key)
        }
      },
      isFieldTouched(name) {
        return fields.get(getFieldKey(name))?.state.touched ?? false
      },
      isFieldsTouched(nameListOrAllTouched?: FieldName[] | boolean, allTouched = false) {
        const records = getFieldRecords(
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
      subscribe(listener) {
        subscribers.add(listener)
        return () => subscribers.delete(listener)
      },
      setInitialValues(nextInitialValues) {
        const nextInitialValuesClone = cloneFormValues(nextInitialValues ?? {})
        if (sourceInitialValues !== nextInitialValues) {
          setValues((currentValues) => mergeValues(nextInitialValuesClone, currentValues))
          notifySubscribers()
        }
        sourceInitialValues = nextInitialValues
        formInitialValues = nextInitialValuesClone
      },
      setCallbacks(nextCallbacks) {
        const id = Symbol('form-callbacks')
        callbackEntries.push({ id, callbacks: nextCallbacks })
        callbacks = nextCallbacks
        return () => {
          const index = callbackEntries.findIndex((entry) => entry.id === id)
          if (index >= 0) callbackEntries.splice(index, 1)
          callbacks = callbackEntries[callbackEntries.length - 1]?.callbacks ?? defaultCallbacks
        }
      },
      registerFormOwner() {
        ownerCount += 1
        let active = true
        return () => {
          if (!active) return
          active = false
          ownerCount = Math.max(0, ownerCount - 1)
        }
      },
      destroy(clearOnDestroy = callbacks.clearOnDestroy) {
        if (ownerCount > 0 || !clearOnDestroy) return
        batch(() => {
          const nextValues = cloneFormValues(formInitialValues)
          for (const key of Object.keys(nextValues)) delete nextValues[key]
          setValues(nextValues)
          for (const record of fields.values()) {
            record.state.touched = false
            record.state.validated = false
            record.state.dirty = false
            clearRecordValidation(record)
          }
          notifySubscribers()
        })
      },
      setProviderCallbacks(nextProviderCallbacks) {
        const id = Symbol('form-provider-callbacks')
        providerCallbackEntries.push({ id, callbacks: nextProviderCallbacks })
        providerCallbacks = nextProviderCallbacks
        return () => {
          const index = providerCallbackEntries.findIndex((entry) => entry.id === id)
          if (index >= 0) providerCallbackEntries.splice(index, 1)
          providerCallbacks =
            providerCallbackEntries[providerCallbackEntries.length - 1]?.callbacks ?? {}
        }
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

export function setFormCallbacks(form: FormInstance, callbacks: FormCallbacks): () => void {
  return (form as InternalFormInstance).setCallbacks?.(callbacks) ?? (() => undefined)
}

export function setFormControlledFields(form: FormInstance, fields: FieldData[]): void {
  ;(form as InternalFormInstance).setControlledFields?.(fields)
}

export function destroyForm(form: FormInstance, clearOnDestroy?: boolean): void {
  ;(form as InternalFormInstance).destroy?.(clearOnDestroy)
}

export function registerFormOwner(form: FormInstance): () => void {
  return (form as InternalFormInstance).registerFormOwner?.() ?? (() => undefined)
}

export function setFormProviderCallbacks(
  form: FormInstance,
  callbacks: ProviderCallbacks,
): () => void {
  return (form as InternalFormInstance).setProviderCallbacks?.(callbacks) ?? (() => undefined)
}
