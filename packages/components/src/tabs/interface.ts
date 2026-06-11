import type { ComponentSize } from '@ant-design-solid/theme'
import type { JSX } from 'solid-js'

export type TabsType = 'line' | 'card' | 'editable-card'
export type TabsPlacement = 'top' | 'bottom' | 'start' | 'end'
export type TabsPosition = 'top' | 'bottom'
export type TabsScrollDirection = 'left' | 'right' | 'top' | 'bottom'
export type TabsSemanticSlot =
  | 'root'
  | 'item'
  | 'remove'
  | 'indicator'
  | 'content'
  | 'header'
  | 'popup'

export interface TabsAnimatedConfig {
  inkBar?: boolean
  tabPane?: boolean
}

export interface TabsIndicatorConfig {
  size?: number | ((origin: number) => number)
  align?: 'start' | 'center' | 'end'
}

export interface TabsMoreConfig {
  icon?: JSX.Element
  trigger?: 'hover' | 'click'
}

export type TabsSemanticClassNames =
  | Partial<Record<TabsSemanticSlot, string>>
  | ((info: { props: TabsProps }) => Partial<Record<TabsSemanticSlot, string>>)

export type TabsSemanticStyles =
  | Partial<Record<TabsSemanticSlot, JSX.CSSProperties>>
  | ((info: { props: TabsProps }) => Partial<Record<TabsSemanticSlot, JSX.CSSProperties>>)

export interface TabsItem {
  key: string
  label: JSX.Element
  children?: JSX.Element
  disabled?: boolean
  icon?: JSX.Element
  forceRender?: boolean
  destroyOnHidden?: boolean
  closable?: boolean
  closeIcon?: JSX.Element | false | null
  class?: string
  style?: JSX.CSSProperties
}

export interface TabsProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: TabsItem[]
  activeKey?: string
  defaultActiveKey?: string
  onChange?: (activeKey: string) => void
  type?: TabsType
  size?: ComponentSize
  tabPlacement?: TabsPlacement
  tabPosition?: TabsPosition
  destroyOnHidden?: boolean
  destroyInactiveTabPane?: boolean
  animated?: boolean | TabsAnimatedConfig
  centered?: boolean
  indicator?: TabsIndicatorConfig
  more?: TabsMoreConfig
  renderTabBar?: (props: TabsProps, DefaultTabBar: (props: TabsProps) => JSX.Element) => JSX.Element
  tabBarExtraContent?: JSX.Element | { left?: JSX.Element; right?: JSX.Element }
  tabBarGutter?: number
  tabBarStyle?: JSX.CSSProperties
  onEdit?: (targetKey: string | MouseEvent, action: 'add' | 'remove') => void
  onTabClick?: (activeKey: string, event: MouseEvent) => void
  onTabScroll?: (info: { direction: TabsScrollDirection }) => void
  addIcon?: JSX.Element
  removeIcon?: JSX.Element
  hideAdd?: boolean
  classNames?: TabsSemanticClassNames
  styles?: TabsSemanticStyles
}
