import type { JSX } from 'solid-js'
import type { OptionInput, OptionValue } from '../shared/options'

export type CheckboxSemanticDOM = 'root' | 'icon' | 'label'

export type CheckboxSemanticClassNames =
  | Partial<Record<CheckboxSemanticDOM, string>>
  | ((info: { props: CheckboxProps }) => Partial<Record<CheckboxSemanticDOM, string>>)

export type CheckboxSemanticStyles =
  | Partial<Record<CheckboxSemanticDOM, JSX.CSSProperties>>
  | ((info: { props: CheckboxProps }) => Partial<Record<CheckboxSemanticDOM, JSX.CSSProperties>>)

export interface CheckboxRef {
  focus: () => void
  blur: () => void
  nativeElement?: HTMLInputElement
}

export interface CheckboxProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked' | 'defaultChecked' | 'disabled' | 'value' | 'style' | 'ref' | 'onChange'
> {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  indeterminate?: boolean
  skipGroup?: boolean
  value?: OptionValue
  prefixCls?: string
  children?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
  classNames?: CheckboxSemanticClassNames
  styles?: CheckboxSemanticStyles
  ref?: { current?: CheckboxRef } | ((ref: CheckboxRef) => void)
  onChange?: JSX.EventHandler<HTMLInputElement, Event>
}

export interface CheckboxGroupRef {
  nativeElement?: HTMLDivElement
}

export interface CheckboxGroupProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'ref'
> {
  value?: OptionValue[]
  defaultValue?: OptionValue[]
  options?: OptionInput[]
  disabled?: boolean
  name?: string
  prefixCls?: string
  children?: JSX.Element
  ref?: { current?: CheckboxGroupRef } | ((ref: CheckboxGroupRef) => void)
  onChange?: (checkedValue: OptionValue[]) => void
}
