import { Input as InputRoot } from './input'
import { TextArea } from './text-area'

export const Input = Object.assign(InputRoot, { TextArea })
export { InputRoot, TextArea }
export type { InputProps, TextAreaProps } from './interface'
