import { createSignal, onCleanup, untrack } from 'solid-js'
import { useFormInstance } from './context'
import { getValue } from './value-util'
import type { Accessor } from 'solid-js'
import type { FormInstance, FormValues, NamePath } from './interface'

export interface WatchOptions {
  form?: FormInstance
  preserve?: boolean
}

function isFormInstance(value: FormInstance | WatchOptions | undefined): value is FormInstance {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'getFieldsValue' in value &&
    'subscribe' in value &&
    typeof value.getFieldsValue === 'function' &&
    typeof value.subscribe === 'function',
  )
}

function resolveWatchedValue(
  form: FormInstance,
  namePathOrSelector: NamePath | ((values: FormValues) => unknown),
): unknown {
  const values = untrack(() => form.getFieldsValue(true))
  if (typeof namePathOrSelector === 'function') return namePathOrSelector(values)
  return getValue(values, namePathOrSelector)
}

export function useWatch(
  namePathOrSelector: NamePath | ((values: FormValues) => unknown),
  formOrOptions?: FormInstance | WatchOptions,
): Accessor<unknown> {
  const form = isFormInstance(formOrOptions)
    ? formOrOptions
    : (formOrOptions?.form ?? useFormInstance())
  const [value, setValue] = createSignal(resolveWatchedValue(form, namePathOrSelector), {
    equals: false,
  })

  const unsubscribe = form.subscribe(() => {
    setValue(() => resolveWatchedValue(form, namePathOrSelector))
  })
  onCleanup(unsubscribe)

  return value
}
