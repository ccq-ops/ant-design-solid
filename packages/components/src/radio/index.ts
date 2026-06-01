import { RadioRoot } from './radio'
import { RadioGroup } from './radio-group'

export const Radio = Object.assign(RadioRoot, { Group: RadioGroup })
export { RadioGroup, RadioRoot }
export type { RadioGroupProps, RadioProps } from './interface'
