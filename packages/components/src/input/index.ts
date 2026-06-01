import { Input as InputRoot } from './Input'
import { TextArea } from './TextArea'

export const Input = Object.assign(InputRoot, { TextArea })
export { InputRoot, TextArea }
export type { InputProps, TextAreaProps } from './interface'
