import type { ComponentSize } from '@ant-design-solid/theme'
import type { JSX } from 'solid-js'

export type TabsType = 'line' | 'card'
export type TabsPosition = 'top' | 'bottom'

export interface TabsItem {
  key: string
  label: JSX.Element
  children?: JSX.Element
  disabled?: boolean
}

export interface TabsProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: TabsItem[]
  activeKey?: string
  defaultActiveKey?: string
  onChange?: (activeKey: string) => void
  type?: TabsType
  size?: ComponentSize
  tabPosition?: TabsPosition
  destroyInactiveTabPane?: boolean
}
