import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import { FormListContext, useFormContext, useFormListPrefix } from './context'
import { composeNamePath } from './name-path'
import type { FieldValue, FormListField, FormListOperation, FormListProps } from './interface'

let nextListKey = 0

function normalizeArray(value: FieldValue): FieldValue[] {
  return Array.isArray(value) ? value : []
}

function normalizeInsertIndex(insertIndex: number | undefined, length: number): number {
  if (insertIndex === undefined) return length
  if (!Number.isFinite(insertIndex)) return length
  return Math.max(0, Math.min(length, Math.trunc(insertIndex)))
}

function normalizeMoveIndex(index: number, length: number): number | undefined {
  if (!Number.isFinite(index)) return undefined
  const normalized = Math.trunc(index)
  return normalized >= 0 && normalized < length ? normalized : undefined
}

export function FormList(props: FormListProps) {
  const form = useFormContext()
  const parentPrefix = useFormListPrefix()
  const listName = createMemo(() => composeNamePath(parentPrefix, props.name))
  const currentValues = () => normalizeArray(form?.getFieldValue(listName()))
  const initialValues = () => {
    const formValue = form?.getFieldValue(listName())
    if (formValue !== undefined) return normalizeArray(formValue)
    return normalizeArray(props.initialValue)
  }
  const [keys, setKeys] = createSignal<number[]>(initialValues().map(() => nextListKey++))
  const unsubscribe = form?.subscribe(() => {
    const length = currentValues().length
    setKeys((current) => {
      if (current.length === length) return current
      if (current.length < length) {
        return [...current, ...Array.from({ length: length - current.length }, () => nextListKey++)]
      }
      return current.slice(0, length)
    })
  })

  onCleanup(() => unsubscribe?.())

  createEffect(() => {
    if (!form || props.initialValue === undefined || form.getFieldValue(listName()) !== undefined)
      return
    form.setFieldValue(listName(), props.initialValue)
  })

  const fields = createMemo<FormListField[]>(() =>
    keys().map((key, index) => ({ key, name: index, fieldKey: key })),
  )

  const operation: FormListOperation = {
    add(defaultValue, insertIndex) {
      if (!form) return
      const values = [...currentValues()]
      const index = normalizeInsertIndex(insertIndex, values.length)
      values.splice(index, 0, defaultValue)
      setKeys((current) => {
        const next = [...current]
        next.splice(index, 0, nextListKey++)
        return next
      })
      form.setFieldValue(listName(), values)
    },
    remove(index) {
      if (!form) return
      const values = [...currentValues()]
      const indexes = (Array.isArray(index) ? [...index] : [index])
        .filter((item) => Number.isFinite(item) && item >= 0 && item < values.length)
        .map((item) => Math.trunc(item))
        .filter((item, itemIndex, all) => all.indexOf(item) === itemIndex)
        .sort((a, b) => b - a)
      if (indexes.length === 0) return
      for (const item of indexes) values.splice(item, 1)
      setKeys((current) => {
        const next = [...current]
        for (const item of indexes) next.splice(item, 1)
        return next
      })
      form.setFieldValue(listName(), values)
    },
    move(from, to) {
      if (!form || from === to) return
      const values = [...currentValues()]
      const fromIndex = normalizeMoveIndex(from, values.length)
      const toIndex = normalizeMoveIndex(to, values.length)
      if (fromIndex === undefined || toIndex === undefined || fromIndex === toIndex) return
      const [value] = values.splice(fromIndex, 1)
      values.splice(toIndex, 0, value)
      setKeys((current) => {
        const next = [...current]
        const [key] = next.splice(fromIndex, 1)
        next.splice(toIndex, 0, key)
        return next
      })
      form.setFieldValue(listName(), values)
    },
  }

  return (
    <FormListContext.Provider value={listName()}>
      {props.children(fields, operation, { errors: [], warnings: [] })}
    </FormListContext.Provider>
  )
}
