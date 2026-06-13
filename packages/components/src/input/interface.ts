import type { JSX } from 'solid-js'
import type { ComponentSize } from '@ant-design-solid/theme'

export type InputVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'
export type InputSemanticKey =
  | 'root'
  | 'wrapper'
  | 'input'
  | 'prefix'
  | 'suffix'
  | 'clear'
  | 'count'
export type TextAreaSemanticKey = 'root' | 'wrapper' | 'textarea' | 'clear' | 'count'
export type SearchSemanticKey = InputSemanticKey | 'button'
export type OTPSemanticKey = 'root' | 'wrapper' | 'input' | 'separator'

export interface InputFocusOptions {
  preventScroll?: boolean
  cursor?: 'start' | 'end' | 'all'
}

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

export type InputSemanticClassNames = Partial<Record<InputSemanticKey, string>>
export type InputSemanticStyles = Partial<Record<InputSemanticKey, JSX.CSSProperties>>
export type TextAreaSemanticClassNames = Partial<Record<TextAreaSemanticKey, string>>
export type TextAreaSemanticStyles = Partial<Record<TextAreaSemanticKey, JSX.CSSProperties>>
export type SearchSemanticClassNames = Partial<Record<SearchSemanticKey, string>>
export type SearchSemanticStyles = Partial<Record<SearchSemanticKey, JSX.CSSProperties>>
export type OTPSemanticClassNames = Partial<Record<OTPSemanticKey, string>>
export type OTPSemanticStyles = Partial<Record<OTPSemanticKey, JSX.CSSProperties>>
export type SemanticInfo<P> = { props: P }
export type SemanticClassNamesConfig<P, T> = T | ((info: SemanticInfo<P>) => T)
export type SemanticStylesConfig<P, T> = T | ((info: SemanticInfo<P>) => T)

export interface InputRef {
  focus: (options?: InputFocusOptions) => void
  blur: () => void
  setSelectionRange: (
    start: number,
    end: number,
    direction?: 'forward' | 'backward' | 'none',
  ) => void
  select: () => void
  input?: HTMLInputElement | null
  nativeElement?: HTMLElement | null
}

export interface TextAreaRef {
  focus: (options?: InputFocusOptions) => void
  blur: () => void
  resizableTextArea?: { textArea?: HTMLTextAreaElement }
  nativeElement?: HTMLElement | null
}

export interface OTPRef {
  focus: () => void
  blur: () => void
  nativeElement?: HTMLDivElement
}

export interface InputProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'prefix' | 'value' | 'onInput' | 'onChange' | 'onBlur' | 'onKeyDown' | 'ref'
> {
  ref?: ((ref: InputRef) => void) | { current?: InputRef } | InputRef
  rootClassName?: string
  prefixCls?: string
  size?: ComponentSize
  status?: 'error' | 'warning'
  addonBefore?: JSX.Element
  addonAfter?: JSX.Element
  bordered?: boolean
  prefix?: JSX.Element
  suffix?: JSX.Element
  allowClear?: AllowClear
  value?: string | number
  defaultValue?: string | number
  variant?: InputVariant
  showCount?: ShowCount
  count?: CountConfig
  htmlSize?: number
  classNames?: SemanticClassNamesConfig<InputProps, InputSemanticClassNames>
  styles?: SemanticStylesConfig<InputProps, InputSemanticStyles>
  onInput?: JSX.EventHandler<HTMLInputElement, InputEvent>
  onChange?: JSX.EventHandler<HTMLInputElement, Event>
  onBlur?: JSX.EventHandler<HTMLInputElement, FocusEvent>
  onKeyDown?: JSX.EventHandler<HTMLInputElement, KeyboardEvent>
  onPressEnter?: JSX.EventHandler<HTMLInputElement, KeyboardEvent>
  onClear?: () => void
}

export interface AutoSizeConfig {
  minRows?: number
  maxRows?: number
}

export interface TextAreaProps extends Omit<
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'value' | 'onInput' | 'onChange' | 'onBlur' | 'onKeyDown' | 'onResize' | 'ref'
> {
  ref?: ((ref: TextAreaRef) => void) | { current?: TextAreaRef } | TextAreaRef
  rootClassName?: string
  prefixCls?: string
  value?: string | number
  defaultValue?: string | number
  showCount?: ShowCount
  size?: ComponentSize
  status?: 'error' | 'warning'
  bordered?: boolean
  allowClear?: AllowClear
  variant?: InputVariant
  count?: CountConfig
  autoSize?: boolean | AutoSizeConfig
  classNames?: SemanticClassNamesConfig<TextAreaProps, TextAreaSemanticClassNames>
  styles?: SemanticStylesConfig<TextAreaProps, TextAreaSemanticStyles>
  onInput?: JSX.EventHandler<HTMLTextAreaElement, InputEvent>
  onChange?: JSX.EventHandler<HTMLTextAreaElement, Event>
  onBlur?: JSX.EventHandler<HTMLTextAreaElement, FocusEvent>
  onKeyDown?: JSX.EventHandler<HTMLTextAreaElement, KeyboardEvent>
  onPressEnter?: JSX.EventHandler<HTMLTextAreaElement, KeyboardEvent>
  onResize?: (size: { width: number; height: number }) => void
  onClear?: () => void
}

export interface SearchProps extends Omit<InputProps, 'classNames' | 'styles'> {
  inputPrefixCls?: string
  enterButton?: JSX.Element | string | boolean
  loading?: boolean
  searchIcon?: JSX.Element
  classNames?: SemanticClassNamesConfig<SearchProps, SearchSemanticClassNames>
  styles?: SemanticStylesConfig<SearchProps, SearchSemanticStyles>
  onSearch?: (
    value: string,
    event?: MouseEvent | KeyboardEvent | Event,
    info?: { source?: 'input' | 'clear' },
  ) => void
}

export interface VisibilityToggle {
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
}

export interface PasswordProps extends Omit<InputProps, 'type'> {
  inputPrefixCls?: string
  action?: 'click' | 'hover'
  iconRender?: (visible: boolean) => JSX.Element
  visibilityToggle?: boolean | VisibilityToggle
}

export interface OTPProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  'onInput' | 'onChange' | 'defaultValue' | 'ref'
> {
  ref?: ((ref: OTPRef) => void) | { current?: OTPRef } | OTPRef
  prefixCls?: string
  rootClassName?: string
  autoComplete?: string
  classNames?: SemanticClassNamesConfig<OTPProps, OTPSemanticClassNames>
  styles?: SemanticStylesConfig<OTPProps, OTPSemanticStyles>
  defaultValue?: string
  disabled?: boolean
  formatter?: (value: string) => string
  separator?: JSX.Element | ((index: number) => JSX.Element)
  mask?: boolean | string
  length?: number
  type?: JSX.InputHTMLAttributes<HTMLInputElement>['type']
  status?: 'error' | 'warning'
  size?: ComponentSize
  variant?: InputVariant
  value?: string
  onChange?: (value: string) => void
  onInput?: (value: string[]) => void
}

export interface GroupProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  prefixCls?: string
  size?: ComponentSize | 'default'
  compact?: boolean
}
