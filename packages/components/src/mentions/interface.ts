import type { JSX } from 'solid-js'
import type { ComponentSize } from '@ant-design-solid/theme'
import type { AllowClear, AutoSizeConfig, CountConfig, ShowCount } from '../input'

export type MentionsSize = ComponentSize
export type MentionsStatus = 'error' | 'warning'
export type MentionsVariant = 'outlined' | 'borderless' | 'filled' | 'underlined'
export type MentionsPlacement = 'top' | 'bottom'

export interface MentionsOption {
  label?: JSX.Element
  value: string
  disabled?: boolean
  class?: string
  style?: JSX.CSSProperties
  key?: string
  title?: string
}

export interface MentionsOptionProps extends MentionsOption {
  children?: JSX.Element
}

export interface MentionsSemanticClassNames {
  root?: string
  textarea?: string
  popup?: string
  suffix?: string
  clear?: string
  option?: string
  notFound?: string
  count?: string
}

export interface MentionsSemanticStyles {
  root?: JSX.CSSProperties
  textarea?: JSX.CSSProperties
  popup?: JSX.CSSProperties
  suffix?: JSX.CSSProperties
  clear?: JSX.CSSProperties
  option?: JSX.CSSProperties
  notFound?: JSX.CSSProperties
  count?: JSX.CSSProperties
}

export interface MentionsRef {
  focus: () => void
  blur: () => void
  textarea: HTMLTextAreaElement | undefined
  nativeElement: HTMLElement | undefined
}

export interface MentionsConfig {
  prefix?: string | string[]
  split?: string
}

export interface MentionsEntity {
  prefix: string
  value: string
}

export interface MentionsProps extends Omit<
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
  | 'value'
  | 'onChange'
  | 'onSelect'
  | 'prefix'
  | 'children'
  | 'onInput'
  | 'onKeyDown'
  | 'onResize'
  | 'ref'
> {
  value?: string
  defaultValue?: string
  open?: boolean
  defaultOpen?: boolean
  options?: MentionsOption[]
  children?: JSX.Element
  prefix?: string | string[]
  split?: string
  placeholder?: string
  disabled?: boolean
  size?: MentionsSize
  status?: MentionsStatus
  variant?: MentionsVariant
  allowClear?: AllowClear
  loading?: boolean
  notFoundContent?: JSX.Element
  placement?: MentionsPlacement
  rootClass?: string
  popupClass?: string
  showCount?: ShowCount
  count?: CountConfig
  autoSize?: boolean | AutoSizeConfig
  classNames?: MentionsSemanticClassNames
  styles?: MentionsSemanticStyles
  filterOption?: boolean | ((inputValue: string, option: MentionsOption) => boolean)
  validateSearch?: (text: string, props: MentionsProps) => boolean
  prefixCls?: string
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement | ShadowRoot
  ref?: MentionsRef | { current?: MentionsRef } | ((ref: MentionsRef) => void)
  onChange?: (value: string) => void
  onSelect?: (option: MentionsOption, prefix: string) => void
  onSearch?: (text: string, prefix: string) => void
  onOpenChange?: (open: boolean) => void
  onClear?: () => void
  onInput?: JSX.EventHandler<HTMLTextAreaElement, InputEvent>
  onKeyDown?: JSX.EventHandler<HTMLTextAreaElement, KeyboardEvent>
  onPressEnter?: JSX.EventHandler<HTMLTextAreaElement, KeyboardEvent>
  onResize?: (size: { width: number; height: number }) => void
  onPopupScroll?: (event: UIEvent) => void
}
