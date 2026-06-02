import { DescriptionsItem, DescriptionsRoot } from './descriptions'

export const Descriptions = Object.assign(DescriptionsRoot, { Item: DescriptionsItem })
export { DescriptionsItem }
export type {
  DescriptionsItemProps,
  DescriptionsItemType,
  DescriptionsLayout,
  DescriptionsProps,
  DescriptionsSize,
} from './interface'
