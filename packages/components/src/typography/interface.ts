import type { JSX } from 'solid-js'
export type TextType = 'secondary' | 'success' | 'warning' | 'danger'
export type TitleLevel = 1 | 2 | 3 | 4 | 5
export type TypographyActionPlacement = 'start' | 'end'
export type TypographyComponent =
  | 'article'
  | 'section'
  | 'div'
  | 'span'
  | 'p'
  | 'a'
  | `h${TitleLevel}`

export interface TypographySemanticClassNames {
  root?: string
  actions?: string
  action?: string
  textarea?: string
}

export interface TypographySemanticStyles {
  root?: JSX.CSSProperties
  actions?: JSX.CSSProperties
  action?: JSX.CSSProperties
  textarea?: JSX.CSSProperties
}

export interface CopyConfig {
  text?: string | (() => string | Promise<string>)
  onCopy?: (event?: MouseEvent) => void
  icon?: JSX.Element
  tooltips?: JSX.Element | false
  format?: 'text/plain' | 'text/html'
  tabIndex?: number
}

export interface ActionsConfig {
  placement?: TypographyActionPlacement
}

export interface EditAutoSizeConfig {
  minRows?: number
  maxRows?: number
}

export interface EditConfig {
  text?: string
  editing?: boolean
  icon?: JSX.Element
  tooltip?: JSX.Element | false
  onStart?: () => void
  onChange?: (value: string) => void
  onCancel?: () => void
  onEnd?: () => void
  maxLength?: number
  autoSize?: boolean | EditAutoSizeConfig
  triggerType?: ('icon' | 'text')[]
  enterIcon?: JSX.Element
  tabIndex?: number
}

export interface EllipsisConfig {
  rows?: number
  expandable?: boolean | 'collapsible'
  suffix?: string
  symbol?: JSX.Element | ((expanded: boolean) => JSX.Element)
  defaultExpanded?: boolean
  expanded?: boolean
  onExpand?: (event: MouseEvent, info: { expanded: boolean }) => void
  onEllipsis?: (ellipsis: boolean) => void
  tooltip?: JSX.Element | false
}

export interface TypographyProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'ref'> {
  rootClass?: string
  /** @deprecated Use rootClass in Solid code. */
  rootClassName?: string
  component?: TypographyComponent
  classNames?: TypographySemanticClassNames
  styles?: TypographySemanticStyles
}

export interface TypographyBaseProps extends Omit<JSX.HTMLAttributes<HTMLElement>, 'ref'> {
  rootClass?: string
  /** @deprecated Use rootClass in Solid code. */
  rootClassName?: string
  classNames?: TypographySemanticClassNames
  styles?: TypographySemanticStyles
  actions?: ActionsConfig
  title?: string
  editable?: boolean | EditConfig
  copyable?: boolean | CopyConfig
  type?: TextType
  disabled?: boolean
  ellipsis?: boolean | EllipsisConfig
  code?: boolean
  mark?: boolean
  underline?: boolean
  delete?: boolean
  strong?: boolean
  keyboard?: boolean
  italic?: boolean
}

export interface TextProps extends TypographyBaseProps {
  ellipsis?: boolean | Omit<EllipsisConfig, 'expandable' | 'rows' | 'onExpand'>
}

export interface LinkProps
  extends
    Omit<TypographyBaseProps, keyof JSX.AnchorHTMLAttributes<HTMLAnchorElement>>,
    Omit<JSX.AnchorHTMLAttributes<HTMLAnchorElement>, 'type' | 'ref' | 'className'> {
  ellipsis?: boolean
}

export interface TitleProps extends Omit<TypographyBaseProps, 'strong'> {
  level?: TitleLevel
}

export interface ParagraphProps extends TypographyBaseProps {}
