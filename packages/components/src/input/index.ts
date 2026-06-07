import { Input as InputRoot } from './input'
import { OTP } from './otp'
import { Password } from './password'
import { Search } from './search'
import { TextArea } from './text-area'

export const Input = Object.assign(InputRoot, { TextArea, Search, Password, OTP })
export { InputRoot, TextArea, Search, Password, OTP }
export type {
  AllowClear,
  AllowClearConfig,
  AutoSizeConfig,
  CountConfig,
  CountFormatterInfo,
  InputProps,
  InputSemanticClassNames,
  InputSemanticStyles,
  InputVariant,
  OTPProps,
  OTPSemanticClassNames,
  OTPSemanticStyles,
  PasswordProps,
  SearchProps,
  ShowCount,
  TextAreaProps,
  TextAreaSemanticClassNames,
  TextAreaSemanticStyles,
  VisibilityToggle,
} from './interface'
