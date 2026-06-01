import type { JSX } from 'solid-js'
import type { ComponentSize } from '@ant-design-solid/theme'
export interface InputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'value'> { size?: ComponentSize; status?: 'error' | 'warning'; prefix?: JSX.Element; suffix?: JSX.Element; allowClear?: boolean
  value?: string | number
  defaultValue?: string | number
}
