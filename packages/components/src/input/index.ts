import { Group } from './group'
import { Input as InputRoot } from './input'
import { OTP } from './otp'
import { Password } from './password'
import { Search } from './search'
import { TextArea } from './text-area'

export const Input = Object.assign(InputRoot, { Group, TextArea, Search, Password, OTP })
export { Group, InputRoot, TextArea, Search, Password, OTP }
export type {
  AllowClear,
  AllowClearConfig,
  AutoSizeConfig,
  CountConfig,
  CountFormatterInfo,
  GroupProps,
  InputProps,
  InputFocusOptions,
  InputRef,
  InputSemanticClassNames,
  InputSemanticStyles,
  InputVariant,
  OTPRef,
  OTPProps,
  OTPSemanticClassNames,
  OTPSemanticStyles,
  PasswordProps,
  SearchSemanticClassNames,
  SearchSemanticStyles,
  SearchProps,
  ShowCount,
  TextAreaRef,
  TextAreaProps,
  TextAreaSemanticClassNames,
  TextAreaSemanticStyles,
  VisibilityToggle,
} from './interface'
