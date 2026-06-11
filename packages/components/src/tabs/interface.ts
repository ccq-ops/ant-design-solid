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

export interface TabsSemanticClassNamesMap {
  root?: string
  item?: string
  remove?: string
  indicator?: string
  content?: string
  header?: string
  popup?: {
    root?: string
  }
}

export interface TabsSemanticStylesMap {
  root?: JSX.CSSProperties
  item?: JSX.CSSProperties
  remove?: JSX.CSSProperties
  indicator?: JSX.CSSProperties
  content?: JSX.CSSProperties
  header?: JSX.CSSProperties
  popup?: {
    root?: JSX.CSSProperties
  }
}

export type TabsSemanticClassNames =
  | TabsSemanticClassNamesMap
  | ((info: { props: TabsProps }) => TabsSemanticClassNamesMap)

export type TabsSemanticStyles =
  | TabsSemanticStylesMap
  | ((info: { props: TabsProps }) => TabsSemanticStylesMap)

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

export interface TabsDefaultTabBarProps {
  items: TabsItem[]
  activeKey: string
  prefixCls: string
  type: TabsType
  tabPlacement: TabsPlacement
  tabId: (key: string) => string
  panelId: (key: string) => string
  renderedPanelKeys: Set<string>
  classNames: TabsSemanticClassNamesMap
  styles: TabsSemanticStylesMap
  animated?: boolean | TabsAnimatedConfig
  centered?: boolean
  indicator?: TabsIndicatorConfig
  more?: TabsMoreConfig
  tabBarExtraContent?: JSX.Element | { left?: JSX.Element; right?: JSX.Element }
  tabBarGutter?: number
  tabBarStyle?: JSX.CSSProperties
  addIcon?: JSX.Element
  removeIcon?: JSX.Element
  hideAdd?: boolean
  onEdit?: (targetKey: string | MouseEvent, action: 'add' | 'remove') => void
  onTabScroll?: (info: { direction: TabsScrollDirection }) => void
  onTabActivate: (item: TabsItem, event: MouseEvent | KeyboardEvent) => void
}

export type TabsRenderTabBar = (
  props: TabsDefaultTabBarProps,
  DefaultTabBar: (props: TabsDefaultTabBarProps) => JSX.Element,
) => JSX.Element

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
  renderTabBar?: TabsRenderTabBar
  tabBarExtraContent?: JSX.Element | { left?: JSX.Element; right?: JSX.Element }
  tabBarGutter?: number
  tabBarStyle?: JSX.CSSProperties
  onEdit?: (targetKey: string | MouseEvent, action: 'add' | 'remove') => void
  onTabClick?: (activeKey: string, event: MouseEvent | KeyboardEvent) => void
  onTabScroll?: (info: { direction: TabsScrollDirection }) => void
  addIcon?: JSX.Element
  removeIcon?: JSX.Element
  hideAdd?: boolean
  classNames?: TabsSemanticClassNames
  styles?: TabsSemanticStyles
}
