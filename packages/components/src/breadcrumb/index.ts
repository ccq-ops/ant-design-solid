import { Breadcrumb as InternalBreadcrumb, BreadcrumbItem, BreadcrumbSeparator } from './breadcrumb'
export type {
  BreadcrumbItemProps,
  BreadcrumbItemRender,
  BreadcrumbItemType,
  BreadcrumbProps,
  BreadcrumbRouteType,
  BreadcrumbSeparatorProps,
  BreadcrumbSeparatorType,
} from './interface'

export const Breadcrumb = InternalBreadcrumb as typeof InternalBreadcrumb & {
  Item: typeof BreadcrumbItem
  Separator: typeof BreadcrumbSeparator
}

Breadcrumb.Item = BreadcrumbItem
Breadcrumb.Separator = BreadcrumbSeparator
