import type { ComponentSize } from '@ant-design-solid/theme'
import type { JSX } from 'solid-js'

export type InputNumberValue = number | string
export type InputNumberChangeValue = InputNumberValue | null
export type InputNumberVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'
export type InputNumberMode = 'input' | 'spinner'
export type InputNumberStepEmitter = 'handler' | 'keydown' | 'wheel'
export type InputNumberStepType = 'up' | 'down'
export type InputNumberSemanticKey = 'root' | 'prefix' | 'suffix' | 'input' | 'actions'

export interface InputNumberFormatterInfo {
  userTyping: boolean
  input: string
}

export interface InputNumberStepInfo {
  offset: number | string
  type: InputNumberStepType
  emitter: InputNumberStepEmitter
}

export interface InputNumberControlsConfig {
  upIcon?: JSX.Element
  downIcon?: JSX.Element
}

export type InputNumberSemanticClassNames = Partial<Record<InputNumberSemanticKey, string>>
export type InputNumberSemanticStyles = Partial<Record<InputNumberSemanticKey, JSX.CSSProperties>>
export type InputNumberSemanticInfo = { props: InputNumberProps }
export type InputNumberSemanticClassNamesConfig =
  | InputNumberSemanticClassNames
  | ((info: InputNumberSemanticInfo) => InputNumberSemanticClassNames)
export type InputNumberSemanticStylesConfig =
  | InputNumberSemanticStyles
  | ((info: InputNumberSemanticInfo) => InputNumberSemanticStyles)

export interface InputNumberFocusOptions {
  preventScroll?: boolean
  cursor?: 'start' | 'end' | 'all'
}

export interface InputNumberRef {
  focus: (options?: InputNumberFocusOptions) => void
  blur: () => void
  nativeElement?: HTMLElement
}

export interface InputNumberProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  | 'size'
  | 'value'
  | 'defaultValue'
  | 'onInput'
  | 'onChange'
  | 'prefix'
  | 'onKeyDown'
  | 'onWheel'
  | 'ref'
> {
  value?: InputNumberValue | null
  defaultValue?: InputNumberValue | null
  min?: number
  max?: number
  step?: number | string
  precision?: number
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  size?: ComponentSize
  status?: 'error' | 'warning'
  controls?: boolean | InputNumberControlsConfig
  formatter?: (value: InputNumberChangeValue, info: InputNumberFormatterInfo) => string
  parser?: (displayValue: string | undefined) => InputNumberChangeValue
  onInput?: (text: string) => void
  onChange?: (value: InputNumberChangeValue) => void
  keyboard?: boolean
  changeOnBlur?: boolean
  changeOnWheel?: boolean
  onPressEnter?: JSX.EventHandler<HTMLInputElement, KeyboardEvent>
  onKeyDown?: JSX.EventHandler<HTMLInputElement, KeyboardEvent>
  onWheel?: JSX.EventHandler<HTMLInputElement, WheelEvent>
  onStep?: (value: InputNumberChangeValue, info: InputNumberStepInfo) => void
  prefix?: JSX.Element
  suffix?: JSX.Element
  variant?: InputNumberVariant
  mode?: InputNumberMode
  stringMode?: boolean
  decimalSeparator?: string
  classNames?: InputNumberSemanticClassNamesConfig
  styles?: InputNumberSemanticStylesConfig
  rootClassName?: string
  prefixCls?: string
  addonBefore?: JSX.Element
  addonAfter?: JSX.Element
  /** @deprecated Please use `variant` instead. */
  bordered?: boolean
  ref?: InputNumberRef | { current?: InputNumberRef } | ((ref: InputNumberRef) => void)
}
