import { createSignal, type Accessor } from 'solid-js'
import { getNamePath, serializeNamePath } from './name-path'
import { getValue } from './value-util'
import type { FieldData, FieldMeta, FieldName, FormValues, InternalNamePath } from './interface'

export interface FieldState {
  name: InternalNamePath
  touched: boolean
  validating: boolean
  validated: boolean
  dirty: boolean
  errors: string[]
  warnings: string[]
}

export interface FieldRecord {
  meta: FieldMeta
  state: FieldState
  errors: Accessor<string[]>
  setErrors: (errors: string[]) => void
}

export function createFieldState(name: FieldName): FieldState {
  return {
    name: getNamePath(name),
    touched: false,
    validating: false,
    validated: false,
    dirty: false,
    errors: [],
    warnings: [],
  }
}

export function createFieldRecord(meta: FieldMeta): FieldRecord {
  const [errors, setErrorsSignal] = createSignal<string[]>([])
  const state = createFieldState(meta.name)
  const setErrors = (nextErrors: string[]) => {
    state.errors = [...nextErrors]
    setErrorsSignal([...nextErrors])
  }
  return { meta, state, errors, setErrors }
}

export function fieldRecordToData(record: FieldRecord, values: FormValues): FieldData {
  return {
    name: [...record.state.name],
    value: getValue(values, record.state.name),
    errors: [...record.state.errors],
    warnings: [...record.state.warnings],
    touched: record.state.touched,
    validating: record.state.validating,
  }
}

export function getFieldKey(name: FieldName): string {
  return serializeNamePath(name)
}
