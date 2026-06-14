import type { JSX } from 'solid-js'

export type OptionValue = string | number | boolean
export type OptionSemanticDOM = 'root' | 'icon' | 'label' | 'wrapper' | 'input'
export type OptionSemanticClassNames =
  | Partial<Record<OptionSemanticDOM, string>>
  | ((info: { option: LabeledOption }) => Partial<Record<OptionSemanticDOM, string>>)
export type OptionSemanticStyles =
  | Partial<Record<OptionSemanticDOM, JSX.CSSProperties>>
  | ((info: { option: LabeledOption }) => Partial<Record<OptionSemanticDOM, JSX.CSSProperties>>)

export interface LabeledOption {
  label: JSX.Element
  value: OptionValue
  disabled?: boolean
  style?: JSX.CSSProperties
  class?: string
  rootClass?: string
  title?: string
  id?: string
  required?: boolean
  classNames?: OptionSemanticClassNames
  styles?: OptionSemanticStyles
  onChange?: JSX.EventHandler<HTMLInputElement, Event>
}

export type OptionInput = OptionValue | LabeledOption

export function normalizeOptions(options: OptionInput[] = []): LabeledOption[] {
  return options.map((option) => {
    if (typeof option === 'object') return option
    return { label: String(option), value: option }
  })
}
