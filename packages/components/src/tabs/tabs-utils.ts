import type { JSX } from 'solid-js'
import type {
  TabsItem,
  TabsPlacement,
  TabsProps,
  TabsSemanticClassNames,
  TabsSemanticStyles,
} from './interface'

export function getDefaultActiveKey(items: TabsItem[], defaultActiveKey?: string) {
  if (
    defaultActiveKey !== undefined &&
    items.some((item) => item.key === defaultActiveKey && !item.disabled)
  ) {
    return defaultActiveKey
  }
  return items.find((item) => !item.disabled)?.key ?? items[0]?.key ?? ''
}

export function keyToId(key: string) {
  return key.replace(/[^a-zA-Z0-9_-]/g, '-')
}

export function resolvePlacement(
  props: Pick<TabsProps, 'tabPlacement' | 'tabPosition'>,
): TabsPlacement {
  return props.tabPlacement ?? props.tabPosition ?? 'top'
}

export function resolveDestroyOnHidden(
  props: Pick<TabsProps, 'destroyOnHidden' | 'destroyInactiveTabPane'>,
) {
  return Boolean(props.destroyOnHidden ?? props.destroyInactiveTabPane)
}

export function resolveSemanticClassNames(
  value: TabsSemanticClassNames | undefined,
  props: TabsProps,
) {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

export function resolveSemanticStyles(value: TabsSemanticStyles | undefined, props: TabsProps) {
  return typeof value === 'function' ? value({ props }) : (value ?? {})
}

export function mergeStyle(...values: Array<JSX.CSSProperties | undefined>) {
  return Object.assign({}, ...values.filter(Boolean))
}
