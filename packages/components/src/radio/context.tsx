import { createContext, useContext } from 'solid-js'
import type { OptionValue } from '../shared/options'

export interface RadioGroupContextValue {
  value: () => OptionValue | undefined
  disabled: () => boolean
  name: () => string
  isButton: () => boolean
  registerButton: () => void
  restoreTick: () => number
  updateValue: (
    nextValue: OptionValue,
    event?: Event & { currentTarget: HTMLInputElement; target: Element },
  ) => void
}

export const RadioGroupContext = createContext<RadioGroupContextValue>()

export function useRadioGroupContext() {
  return useContext(RadioGroupContext)
}

export function callRef<T>(ref: { current?: T } | ((ref: T) => void) | undefined, value: T) {
  if (!ref) return
  if (typeof ref === 'function') {
    ref(value)
    return
  }
  ref.current = value
}
