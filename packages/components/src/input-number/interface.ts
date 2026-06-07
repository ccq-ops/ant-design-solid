import type { ComponentSize } from '@ant-design-solid/theme'
import type { JSX } from 'solid-js'

export type InputNumberValue = number | string
export type InputNumberChangeValue = InputNumberValue | undefined
export type InputNumberVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'
export type InputNumberMode = 'input' | 'spinner'
export type InputNumberStepEmitter = 'handler' | 'keydown' | 'wheel'
export type InputNumberStepType = 'up' | 'down'

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

export interface InputNumberSemanticClassNames {
  root?: string
  prefix?: string
  suffix?: string
  input?: string
  actions?: string
}

export interface InputNumberSemanticStyles {
  root?: JSX.CSSProperties
  prefix?: JSX.CSSProperties
  suffix?: JSX.CSSProperties
  input?: JSX.CSSProperties
  actions?: JSX.CSSProperties
}

export interface InputNumberProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'value' | 'defaultValue' | 'onChange' | 'prefix' | 'onKeyDown' | 'onWheel'
> {
  value?: InputNumberValue
  defaultValue?: InputNumberValue
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
  parser?: (displayValue: string) => InputNumberChangeValue
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
  classNames?: InputNumberSemanticClassNames
  styles?: InputNumberSemanticStyles
  rootClassName?: string
  prefixCls?: string
}
