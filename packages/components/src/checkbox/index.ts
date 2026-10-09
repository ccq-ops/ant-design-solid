import { CheckboxRoot } from './checkbox'
import { CheckboxGroup } from './checkbox-group'

export const Checkbox = Object.assign(CheckboxRoot, { Group: CheckboxGroup })
export { CheckboxRoot, CheckboxGroup }
export type {
  CheckboxChangeEvent,
  CheckboxChangeEventTarget,
  CheckboxGroupProps,
  CheckboxGroupRef,
  CheckboxOptionType,
  CheckboxProps,
  CheckboxRef,
  CheckboxSemanticClassNames,
  CheckboxSemanticDOM,
  CheckboxSemanticStyles,
} from './interface'
