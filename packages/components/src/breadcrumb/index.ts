import { Breadcrumb as InternalBreadcrumb, BreadcrumbItem } from './breadcrumb'
export type { BreadcrumbItemProps, BreadcrumbItemType, BreadcrumbProps } from './interface'

export const Breadcrumb = InternalBreadcrumb as typeof InternalBreadcrumb & {
  Item: typeof BreadcrumbItem
}

Breadcrumb.Item = BreadcrumbItem
