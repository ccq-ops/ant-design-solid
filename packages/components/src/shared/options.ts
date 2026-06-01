import type { JSX } from 'solid-js'

export type OptionValue = string | number | boolean

export interface LabeledOption {
  label: JSX.Element
  value: OptionValue
  disabled?: boolean
}

export type OptionInput = OptionValue | LabeledOption

export function normalizeOptions(options: OptionInput[] = []): LabeledOption[] {
  return options.map((option) => {
    if (typeof option === 'object') return option
    return { label: String(option), value: option }
  })
}
