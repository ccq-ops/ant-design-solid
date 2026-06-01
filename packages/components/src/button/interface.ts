import type { JSX } from 'solid-js'
import type { ComponentSize } from '@ant-design-solid/theme'
export type ButtonType = 'default' | 'primary' | 'dashed' | 'text' | 'link'
export type ButtonHTMLType = 'button' | 'submit' | 'reset'
export interface ButtonProps extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> { type?: ButtonType; size?: ComponentSize; htmlType?: ButtonHTMLType; loading?: boolean; danger?: boolean; block?: boolean }
