import type { JSX } from 'solid-js'

export type TagVariant = 'filled' | 'solid' | 'outlined'
export type TagSemanticSlot = 'root' | 'icon' | 'content' | 'close'
export type CheckableTagGroupSemanticSlot = 'root' | 'item'
export type CheckableTagValue = string | number
export type TagClosable = boolean | { closeIcon?: JSX.Element }

export interface TagProps extends Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  'onClose' | 'className'
> {
  prefixCls?: string
  rootClassName?: string
  color?: string
  variant?: TagVariant
  icon?: JSX.Element
  closable?: TagClosable
  closeIcon?: JSX.Element | false | null
  onClose?: (event: MouseEvent) => void
  bordered?: boolean
  href?: string
  target?: string
  disabled?: boolean
  classNames?: Partial<Record<TagSemanticSlot, string>>
  styles?: Partial<Record<TagSemanticSlot, JSX.CSSProperties>>
}

export interface CheckableTagProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, 'onChange'> {
  prefixCls?: string
  checked: boolean
  icon?: JSX.Element
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

export interface CheckableTagOption {
  value: CheckableTagValue
  label: JSX.Element
  className?: string
  class?: string
  style?: JSX.CSSProperties
}

export type CheckableTagOptionInput = CheckableTagOption | CheckableTagValue

export interface CheckableTagGroupBaseProps extends Pick<
  JSX.HTMLAttributes<HTMLDivElement>,
  'id' | 'class' | 'style' | 'role'
> {
  prefixCls?: string
  rootClassName?: string
  options?: CheckableTagOptionInput[]
  disabled?: boolean
  classNames?: Partial<Record<CheckableTagGroupSemanticSlot, string>>
  styles?: Partial<Record<CheckableTagGroupSemanticSlot, JSX.CSSProperties>>
}

export interface CheckableTagGroupSingleProps extends CheckableTagGroupBaseProps {
  multiple?: false
  value?: CheckableTagValue | null
  defaultValue?: CheckableTagValue | null
  onChange?: (value: CheckableTagValue | null) => void
}

export interface CheckableTagGroupMultipleProps extends CheckableTagGroupBaseProps {
  multiple: true
  value?: CheckableTagValue[]
  defaultValue?: CheckableTagValue[]
  onChange?: (value: CheckableTagValue[]) => void
}

export type CheckableTagGroupProps = CheckableTagGroupSingleProps | CheckableTagGroupMultipleProps
