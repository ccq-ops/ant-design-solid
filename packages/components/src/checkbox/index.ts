import { CheckboxRoot } from './Checkbox'
import { CheckboxGroup } from './CheckboxGroup'

export const Checkbox = Object.assign(CheckboxRoot, { Group: CheckboxGroup })
export { CheckboxRoot, CheckboxGroup }
export type { CheckboxGroupProps, CheckboxProps } from './interface'
