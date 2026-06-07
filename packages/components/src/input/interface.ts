import type { JSX } from 'solid-js'
import type { ComponentSize } from '@ant-design-solid/theme'

export type InputVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'

export interface CountConfig {
  max?: number
  strategy?: (value: string) => number
  show?: boolean | ((info: CountFormatterInfo) => JSX.Element)
  exceedFormatter?: (value: string, config: { max: number }) => string
}

export interface CountFormatterInfo {
  value: string
  count: number
  maxLength?: number
}

export type ShowCount =
  | boolean
  | {
      formatter?: (info: CountFormatterInfo) => JSX.Element
    }

export interface AllowClearConfig {
  clearIcon?: JSX.Element
  disabled?: boolean
}

export type AllowClear = boolean | AllowClearConfig

export interface InputSemanticClassNames {
  wrapper?: string
  input?: string
  prefix?: string
  suffix?: string
  clear?: string
  count?: string
}

export interface InputSemanticStyles {
  wrapper?: JSX.CSSProperties
  input?: JSX.CSSProperties
  prefix?: JSX.CSSProperties
  suffix?: JSX.CSSProperties
  clear?: JSX.CSSProperties
  count?: JSX.CSSProperties
}

export interface InputProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'prefix' | 'value' | 'onInput' | 'onChange' | 'onBlur' | 'onKeyDown'
> {
  size?: ComponentSize
  status?: 'error' | 'warning'
  prefix?: JSX.Element
  suffix?: JSX.Element
  allowClear?: AllowClear
  value?: string | number
  defaultValue?: string | number
  variant?: InputVariant
  showCount?: ShowCount
  count?: CountConfig
  classNames?: InputSemanticClassNames
  styles?: InputSemanticStyles
  onInput?: JSX.EventHandler<HTMLInputElement, InputEvent>
  onChange?: JSX.EventHandler<HTMLInputElement, Event>
  onBlur?: JSX.EventHandler<HTMLInputElement, FocusEvent>
  onKeyDown?: JSX.EventHandler<HTMLInputElement, KeyboardEvent>
  onPressEnter?: JSX.EventHandler<HTMLInputElement, KeyboardEvent>
  onClear?: () => void
}

export interface TextAreaSemanticClassNames {
  wrapper?: string
  textarea?: string
  clear?: string
  count?: string
}

export interface TextAreaSemanticStyles {
  wrapper?: JSX.CSSProperties
  textarea?: JSX.CSSProperties
  clear?: JSX.CSSProperties
  count?: JSX.CSSProperties
}

export interface AutoSizeConfig {
  minRows?: number
  maxRows?: number
}

export interface TextAreaProps extends Omit<
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onInput' | 'onChange' | 'onBlur' | 'onKeyDown'
> {
  value?: string | number
  defaultValue?: string | number
  showCount?: ShowCount
  status?: 'error' | 'warning'
  allowClear?: AllowClear
  variant?: InputVariant
  count?: CountConfig
  autoSize?: boolean | AutoSizeConfig
  classNames?: TextAreaSemanticClassNames
  styles?: TextAreaSemanticStyles
  onInput?: JSX.EventHandler<HTMLTextAreaElement, InputEvent>
  onChange?: JSX.EventHandler<HTMLTextAreaElement, Event>
  onBlur?: JSX.EventHandler<HTMLTextAreaElement, FocusEvent>
  onKeyDown?: JSX.EventHandler<HTMLTextAreaElement, KeyboardEvent>
  onPressEnter?: JSX.EventHandler<HTMLTextAreaElement, KeyboardEvent>
  onClear?: () => void
}

export interface SearchProps extends InputProps {
  enterButton?: JSX.Element | boolean
  loading?: boolean
  searchIcon?: JSX.Element
  onSearch?: (
    value: string,
    event: MouseEvent | KeyboardEvent | Event,
    info: { source: 'input' | 'clear' },
  ) => void
}

export interface VisibilityToggle {
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
}

export interface PasswordProps extends Omit<InputProps, 'type' | 'suffix'> {
  iconRender?: (visible: boolean) => JSX.Element
  visibilityToggle?: boolean | VisibilityToggle
}

export interface OTPSemanticClassNames {
  wrapper?: string
  input?: string
  separator?: string
}

export interface OTPSemanticStyles {
  wrapper?: JSX.CSSProperties
  input?: JSX.CSSProperties
  separator?: JSX.CSSProperties
}

export interface OTPProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onInput' | 'onChange' | 'defaultValue'
> {
  autoComplete?: string
  classNames?: OTPSemanticClassNames
  styles?: OTPSemanticStyles
  defaultValue?: string
  disabled?: boolean
  formatter?: (value: string) => string
  separator?: JSX.Element | ((index: number) => JSX.Element)
  mask?: boolean | string
  length?: number
  status?: 'error' | 'warning'
  size?: ComponentSize
  variant?: InputVariant
  value?: string
  onChange?: (value: string) => void
  onInput?: (value: string[]) => void
}
