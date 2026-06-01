import type { JSX } from 'solid-js'
export type TextType = 'secondary' | 'success' | 'warning' | 'danger'
export type TitleLevel = 1 | 2 | 3 | 4 | 5
export interface TypographyBaseProps extends JSX.HTMLAttributes<HTMLElement> { type?: TextType; ellipsis?: boolean }
export interface TitleProps extends TypographyBaseProps { level?: TitleLevel }
