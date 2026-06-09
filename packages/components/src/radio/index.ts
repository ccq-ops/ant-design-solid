import { RadioButton, RadioRoot } from './radio'
import { RadioGroup } from './radio-group'

export const Radio = Object.assign(RadioRoot, { Group: RadioGroup, Button: RadioButton })
export { RadioButton, RadioGroup, RadioRoot }
export type { RadioGroupProps, RadioProps, RadioRef } from './interface'
