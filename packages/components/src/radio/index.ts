import { RadioRoot } from './Radio'
import { RadioGroup } from './RadioGroup'

export const Radio = Object.assign(RadioRoot, { Group: RadioGroup })
export { RadioGroup, RadioRoot }
export type { RadioGroupProps, RadioProps } from './interface'
