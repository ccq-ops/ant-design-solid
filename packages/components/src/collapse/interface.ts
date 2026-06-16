import type { JSX } from 'solid-js'
import type { ComponentSize } from '@solid-ant-design/theme'

export type CollapseKey = string | number
export type CollapseActiveKey = CollapseKey | CollapseKey[]
export type CollapseCollapsible = 'header' | 'icon' | 'disabled'
export type CollapseExpandIconPlacement = 'start' | 'end'
export type CollapseSemanticSlot = 'root' | 'header' | 'title' | 'body' | 'icon'
export type CollapseItemSemanticSlot = 'header' | 'body'

export interface CollapseExpandIconProps {
  key: CollapseKey
  isActive: boolean
  label: JSX.Element
  children?: JSX.Element
  extra?: JSX.Element
  showArrow?: boolean
  forceRender?: boolean
  collapsible?: CollapseCollapsible
}

export type CollapseSemanticClassNamesMap = Partial<Record<CollapseSemanticSlot, string>>
export type CollapseSemanticStylesMap = Partial<Record<CollapseSemanticSlot, JSX.CSSProperties>>
export type CollapseSemanticInfo = { props: CollapseProps }
export type CollapseSemanticClassNames =
  | CollapseSemanticClassNamesMap
  | ((info: CollapseSemanticInfo) => CollapseSemanticClassNamesMap)
export type CollapseSemanticStyles =
  | CollapseSemanticStylesMap
  | ((info: CollapseSemanticInfo) => CollapseSemanticStylesMap)
export type CollapseItemSemanticClassNames = Partial<Record<CollapseItemSemanticSlot, string>>
export type CollapseItemSemanticStyles = Partial<
  Record<CollapseItemSemanticSlot, JSX.CSSProperties>
>

export interface CollapseItem {
  key: CollapseKey
  label: JSX.Element
  children?: JSX.Element
  extra?: JSX.Element
  disabled?: boolean
  collapsible?: CollapseCollapsible
  forceRender?: boolean
  showArrow?: boolean
  classNames?: CollapseItemSemanticClassNames
  styles?: CollapseItemSemanticStyles
  class?: string
  style?: JSX.CSSProperties
}

export interface CollapseProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: CollapseItem[]
  activeKey?: CollapseActiveKey
  defaultActiveKey?: CollapseActiveKey
  accordion?: boolean
  bordered?: boolean
  ghost?: boolean
  destroyInactivePanel?: boolean
  destroyOnHidden?: boolean
  size?: ComponentSize | 'medium'
  collapsible?: CollapseCollapsible
  expandIcon?: (panelProps: CollapseExpandIconProps) => JSX.Element
  expandIconPlacement?: CollapseExpandIconPlacement
  expandIconPosition?: CollapseExpandIconPlacement
  rootClass?: string
  classNames?: CollapseSemanticClassNames
  styles?: CollapseSemanticStyles
  onChange?: (activeKey: CollapseActiveKey | undefined) => void
}
