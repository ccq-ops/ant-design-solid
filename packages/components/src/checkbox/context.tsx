import { createContext, useContext } from 'solid-js'
import type { OptionValue } from '../shared/options'

export interface CheckboxGroupContextValue {
  value: () => OptionValue[]
  disabled: () => boolean
  name: () => string | undefined
  registerValue: (value: OptionValue) => void
  cancelValue: (value: OptionValue) => void
  updateValue: (
    nextValue: OptionValue,
    nextChecked: boolean,
    event?: Event & { currentTarget: HTMLInputElement; target: Element },
  ) => void
}

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue>()

export function useCheckboxGroupContext() {
  return useContext(CheckboxGroupContext)
}

export function callRef<T>(ref: { current?: T } | ((ref: T) => void) | undefined, value: T) {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(value)
    return
  }
  ref.current = value
}
