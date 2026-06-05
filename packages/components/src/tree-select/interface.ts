import type { JSX } from 'solid-js'
import type { OptionValue } from '../shared/options'

export interface TreeSelectNode {
  title: JSX.Element
  value: OptionValue
  disabled?: boolean
  children?: TreeSelectNode[]
}

export interface TreeSelectProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  treeData?: TreeSelectNode[]
  value?: OptionValue
  defaultValue?: OptionValue
  open?: boolean
  defaultOpen?: boolean
  placeholder?: JSX.Element
  disabled?: boolean
  allowClear?: boolean
  defaultExpandedKeys?: OptionValue[]
  prefixCls?: string
  zIndex?: number
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement
  onChange?: (value: OptionValue | undefined, node: TreeSelectNode | undefined) => void
  onOpenChange?: (open: boolean) => void
}
