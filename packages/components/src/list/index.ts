import { ListItem, ListItemMeta, ListRoot } from './list'

export const List = Object.assign(ListRoot, {
  Item: Object.assign(ListItem, { Meta: ListItemMeta }),
})
export { ListItem, ListItemMeta }
export type { ListItemMetaProps, ListItemProps, ListProps, ListSize } from './interface'
