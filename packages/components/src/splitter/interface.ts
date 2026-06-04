import type { JSX } from 'solid-js'

export type SplitterLayout = 'horizontal' | 'vertical'
export type SplitterSize = number | string | undefined

export interface SplitterPanelProps extends JSX.HTMLAttributes<HTMLDivElement> {
  size?: SplitterSize
  defaultSize?: SplitterSize
  min?: SplitterSize
  max?: SplitterSize
  resizable?: boolean
}

export interface SplitterProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onResize'> {
  layout?: SplitterLayout
  onResizeStart?: (sizes: SplitterSize[]) => void
  onResize?: (sizes: SplitterSize[]) => void
  onResizeEnd?: (sizes: SplitterSize[]) => void
}

export type SplitterPanelElement = {
  __ANT_DESIGN_SOLID_SPLITTER_PANEL: true
  props: SplitterPanelProps
}

export type SplitterPanelComponent = (props: SplitterPanelProps) => JSX.Element
