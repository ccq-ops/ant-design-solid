import type { JSX } from 'solid-js'

export type SplitterLayout = 'horizontal' | 'vertical'
export type SplitterSize = number | string | undefined
export type SplitterCollapsibleIconMode = boolean | 'auto'
export type SplitterDraggerClassName = string | { default?: string; active?: string }
export type SplitterDraggerStyle = {
  default?: JSX.CSSProperties
  active?: JSX.CSSProperties
}

export interface SplitterSemanticClassNames {
  root?: string
  panel?: string
  dragger?: SplitterDraggerClassName
}

export interface SplitterSemanticStyles {
  root?: JSX.CSSProperties
  panel?: JSX.CSSProperties
  dragger?: SplitterDraggerStyle
}

export interface SplitterCollapsibleConfig {
  motion?: boolean
  icon?: {
    start?: JSX.Element
    end?: JSX.Element
  }
}

export interface SplitterPanelCollapsibleConfig {
  start?: boolean
  end?: boolean
  showCollapsibleIcon?: SplitterCollapsibleIconMode
}

export interface SplitterPanelProps extends JSX.HTMLAttributes<HTMLDivElement> {
  size?: SplitterSize
  defaultSize?: SplitterSize
  min?: SplitterSize
  max?: SplitterSize
  resizable?: boolean
  collapsible?: boolean | SplitterPanelCollapsibleConfig
  destroyOnHidden?: boolean
}

export interface SplitterProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onResize'> {
  layout?: SplitterLayout
  orientation?: SplitterLayout
  vertical?: boolean
  classNames?: SplitterSemanticClassNames
  styles?: SplitterSemanticStyles
  collapsible?: SplitterCollapsibleConfig
  collapsibleIcon?: SplitterCollapsibleConfig['icon']
  destroyOnHidden?: boolean
  draggerIcon?: JSX.Element
  lazy?: boolean
  onDraggerDoubleClick?: (index: number) => void
  onResizeStart?: (sizes: number[]) => void
  onResize?: (sizes: number[]) => void
  onResizeEnd?: (sizes: number[]) => void
  onCollapse?: (collapsed: boolean[], sizes: number[]) => void
}

export type SplitterPanelElement = {
  __ANT_DESIGN_SOLID_SPLITTER_PANEL: true
  props: SplitterPanelProps
}

export type SplitterPanelComponent = (props: SplitterPanelProps) => JSX.Element
