import { CheckboxRoot } from './checkbox'
import { CheckboxGroup } from './checkbox-group'

export const Checkbox = Object.assign(CheckboxRoot, { Group: CheckboxGroup })
export { CheckboxRoot, CheckboxGroup }
export type {
  CheckboxGroupProps,
  CheckboxGroupRef,
  CheckboxProps,
  CheckboxRef,
  CheckboxSemanticClassNames,
  CheckboxSemanticDOM,
  CheckboxSemanticStyles,
} from './interface'
