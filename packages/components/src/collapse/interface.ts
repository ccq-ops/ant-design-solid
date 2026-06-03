import type { JSX } from 'solid-js'

export type CollapseKey = string
export type CollapseActiveKey = CollapseKey | CollapseKey[]
export type CollapseCollapsible = 'header' | 'icon' | 'disabled'
export type CollapseExpandIconPosition = 'start' | 'end'

export interface CollapseItem {
  key: CollapseKey
  label: JSX.Element
  children?: JSX.Element
  extra?: JSX.Element
  disabled?: boolean
  collapsible?: CollapseCollapsible
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
  collapsible?: CollapseCollapsible
  expandIconPosition?: CollapseExpandIconPosition
  onChange?: (activeKey: CollapseActiveKey | undefined) => void
}
