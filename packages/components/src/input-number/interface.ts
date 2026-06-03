import type { ComponentSize } from '@ant-design-solid/theme'
import type { JSX } from 'solid-js'

export interface InputNumberProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  'size' | 'value' | 'defaultValue' | 'onChange' | 'prefix'
> {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  precision?: number
  placeholder?: string
  disabled?: boolean
  size?: ComponentSize
  status?: 'error' | 'warning'
  controls?: boolean
  formatter?: (value: number | undefined) => string
  parser?: (displayValue: string) => number | undefined
  onChange?: (value: number | undefined) => void
}
