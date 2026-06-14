import type { JSX } from 'solid-js'
import type { OptionInput, OptionValue } from '../shared/options'

export type RadioSize = 'large' | 'medium' | 'small'
export type RadioButtonStyle = 'outline' | 'solid'
export type RadioOrientation = 'horizontal' | 'vertical'
export type RadioSemanticDOM = 'root' | 'icon' | 'label' | 'wrapper' | 'input'
export type RadioGroupSemanticDOM = 'root' | 'wrapper'

export type RadioSemanticClassNames =
  | Partial<Record<RadioSemanticDOM, string>>
  | ((info: { props: RadioProps }) => Partial<Record<RadioSemanticDOM, string>>)

export type RadioSemanticStyles =
  | Partial<Record<RadioSemanticDOM, JSX.CSSProperties>>
  | ((info: { props: RadioProps }) => Partial<Record<RadioSemanticDOM, JSX.CSSProperties>>)

export type RadioGroupSemanticClassNames =
  | Partial<Record<RadioGroupSemanticDOM, string>>
  | ((info: { props: RadioGroupProps }) => Partial<Record<RadioGroupSemanticDOM, string>>)

export type RadioGroupSemanticStyles =
  | Partial<Record<RadioGroupSemanticDOM, JSX.CSSProperties>>
  | ((info: {
      props: RadioGroupProps
    }) => Partial<Record<RadioGroupSemanticDOM, JSX.CSSProperties>>)

export interface RadioRef {
  focus: () => void
  blur: () => void
  nativeElement?: HTMLInputElement
}

export interface RadioProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked' | 'defaultChecked' | 'disabled' | 'value' | 'onChange' | 'style' | 'ref'
> {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  value?: OptionValue
  prefixCls?: string
  rootClass?: string
  children?: JSX.Element
  class?: string
  style?: JSX.CSSProperties
  classNames?: RadioSemanticClassNames
  styles?: RadioSemanticStyles
  ref?: { current?: RadioRef } | ((ref: RadioRef) => void)
  skipGroup?: boolean
  onChange?: JSX.EventHandler<HTMLInputElement, Event>
}

export interface RadioGroupProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value?: OptionValue
  defaultValue?: OptionValue
  options?: OptionInput[]
  disabled?: boolean
  optionType?: 'default' | 'button'
  buttonStyle?: RadioButtonStyle
  block?: boolean
  name?: string
  orientation?: RadioOrientation
  vertical?: boolean
  size?: RadioSize
  prefixCls?: string
  rootClass?: string
  children?: JSX.Element
  classNames?: RadioGroupSemanticClassNames
  styles?: RadioGroupSemanticStyles
  onChange?: (checkedValue: OptionValue) => void
}
