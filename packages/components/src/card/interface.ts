import type { JSX } from 'solid-js'
import type { TabsProps, TabsItem } from '../tabs'

export type CardSize = 'medium' | 'default' | 'small'
export type CardVariant = 'outlined' | 'borderless'
export type CardType = 'inner'
export type CardSemanticSlot = 'root' | 'header' | 'body' | 'extra' | 'title' | 'actions' | 'cover'
export type CardMetaSemanticSlot = 'root' | 'section' | 'avatar' | 'title' | 'description'

export interface CardTabListType extends Omit<TabsItem, 'label' | 'children'> {
  tab?: JSX.Element
  label?: JSX.Element
}

export type CardSemanticClassNamesMap = Partial<Record<CardSemanticSlot, string>>
export type CardSemanticStylesMap = Partial<Record<CardSemanticSlot, JSX.CSSProperties>>
export type CardSemanticInfo = { props: CardProps }
export type CardSemanticClassNames =
  | CardSemanticClassNamesMap
  | ((info: CardSemanticInfo) => CardSemanticClassNamesMap)
export type CardSemanticStyles =
  | CardSemanticStylesMap
  | ((info: CardSemanticInfo) => CardSemanticStylesMap)

export type CardMetaSemanticClassNamesMap = Partial<Record<CardMetaSemanticSlot, string>>
export type CardMetaSemanticStylesMap = Partial<Record<CardMetaSemanticSlot, JSX.CSSProperties>>
export type CardMetaSemanticInfo = { props: CardMetaProps }
export type CardMetaSemanticClassNames =
  | CardMetaSemanticClassNamesMap
  | ((info: CardMetaSemanticInfo) => CardMetaSemanticClassNamesMap)
export type CardMetaSemanticStyles =
  | CardMetaSemanticStylesMap
  | ((info: CardMetaSemanticInfo) => CardMetaSemanticStylesMap)

export interface CardProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'> {
  prefixCls?: string
  rootClass?: string
  title?: JSX.Element
  extra?: JSX.Element
  cover?: JSX.Element
  actions?: JSX.Element[]
  bordered?: boolean
  variant?: CardVariant
  loading?: boolean
  hoverable?: boolean
  size?: CardSize
  type?: CardType
  tabList?: CardTabListType[]
  tabBarExtraContent?: TabsProps['tabBarExtraContent']
  onTabChange?: (key: string) => void
  activeTabKey?: string
  defaultActiveTabKey?: string
  tabProps?: Partial<TabsProps>
  classNames?: CardSemanticClassNames
  styles?: CardSemanticStyles
  children?: JSX.Element
}

export interface CardGridProps extends JSX.HTMLAttributes<HTMLDivElement> {
  prefixCls?: string
  hoverable?: boolean
}

export interface CardMetaProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'title'> {
  prefixCls?: string
  avatar?: JSX.Element
  title?: JSX.Element
  description?: JSX.Element
  classNames?: CardMetaSemanticClassNames
  styles?: CardMetaSemanticStyles
}

export interface CardComponent {
  (props: CardProps): JSX.Element
  Grid: (props: CardGridProps) => JSX.Element
  Meta: (props: CardMetaProps) => JSX.Element
}
