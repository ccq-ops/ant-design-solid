import {
  For,
  Show,
  createContext,
  createMemo,
  createSignal,
  onCleanup,
  splitProps,
  useContext,
} from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type { DescriptionsItemProps, DescriptionsItemType, DescriptionsProps } from './interface'
import { useDescriptionsStyle } from './descriptions.style'
import type { Accessor, JSX } from 'solid-js'

function isPresent(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false
}

function normalizeColumn(column: number | undefined): number {
  if (!Number.isFinite(column ?? 3)) return 3
  return Math.max(1, Math.floor(column ?? 3))
}

function clampSpan(span: number | undefined, column: number): number {
  if (!Number.isFinite(span ?? 1)) return 1
  return Math.min(Math.max(1, Math.floor(span ?? 1)), column)
}

interface DescriptionsItemContextValue {
  register: (item: Accessor<DescriptionsItemType>) => () => void
}

const DescriptionsItemContext = createContext<DescriptionsItemContextValue>()

export function DescriptionsItem(props: DescriptionsItemProps) {
  const context = useContext(DescriptionsItemContext)
  if (!context) return null

  const unregister = context.register(() => ({
    label: props.label,
    children: props.children,
    span: props.span,
    class: props.class,
    className: props.className,
    style: props.style,
  }))
  onCleanup(unregister)

  return null
}

function chunkItems(items: DescriptionsItemType[], column: number): DescriptionsItemType[][] {
  const rows: DescriptionsItemType[][] = []
  let current: DescriptionsItemType[] = []
  let filled = 0

  items.forEach((item) => {
    const span = clampSpan(item.span, column)
    if (current.length > 0 && filled + span > column) {
      rows.push(current)
      current = []
      filled = 0
    }
    current.push(item)
    filled += span
    if (filled >= column) {
      rows.push(current)
      current = []
      filled = 0
    }
  })

  if (current.length > 0) rows.push(current)
  return rows
}

export function DescriptionsRoot(props: DescriptionsProps) {
  const [local, rest] = splitProps(props, [
    'title',
    'extra',
    'bordered',
    'column',
    'size',
    'layout',
    'items',
    'children',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-descriptions`
  const [, hashId] = useDescriptionsStyle(prefixCls())
  const [childItems, setChildItems] = createSignal<Accessor<DescriptionsItemType>[]>([])
  const column = () => normalizeColumn(local.column)
  const layout = () => local.layout ?? 'horizontal'
  const size = () => local.size ?? 'default'
  const itemContext: DescriptionsItemContextValue = {
    register: (item) => {
      setChildItems((items) => [...items, item])
      return () => setChildItems((items) => items.filter((candidate) => candidate !== item))
    },
  }
  const normalizedItems = createMemo(() =>
    local.items ? local.items : childItems().map((item) => item()),
  )
  const rows = createMemo(() => chunkItems(normalizedItems(), column()))
  const hasHeader = () => isPresent(local.title) || isPresent(local.extra)
  const colSpan = (item: DescriptionsItemType, multiplier = 1) =>
    clampSpan(item.span, column()) * multiplier
  const itemClass = (item: DescriptionsItemType) =>
    classNames(`${prefixCls()}-item`, item.class, item.className)
  const labelCell = (
    item: DescriptionsItemType,
    extraProps: JSX.TdHTMLAttributes<HTMLTableCellElement> = {},
  ) => {
    const { class: cellClass, ...cellProps } = extraProps
    return (
      <td {...cellProps} class={classNames(`${prefixCls()}-item-label`, cellClass)}>
        {item.label}
      </td>
    )
  }
  const contentCell = (
    item: DescriptionsItemType,
    extraProps: JSX.TdHTMLAttributes<HTMLTableCellElement> = {},
  ) => {
    const { class: cellClass, ...cellProps } = extraProps
    return (
      <td {...cellProps} class={classNames(`${prefixCls()}-item-content`, cellClass)}>
        {item.children}
      </td>
    )
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        local.bordered && `${prefixCls()}-bordered`,
        layout() === 'vertical' && `${prefixCls()}-vertical`,
        size() !== 'default' && `${prefixCls()}-${size()}`,
        hashId(),
        local.class,
      )}
      classList={local.classList}
      style={local.style}
    >
      <Show when={hasHeader()}>
        <div class={`${prefixCls()}-header`}>
          <Show when={isPresent(local.title)}>
            <div class={`${prefixCls()}-title`}>{local.title}</div>
          </Show>
          <Show when={isPresent(local.extra)}>
            <div class={`${prefixCls()}-extra`}>{local.extra}</div>
          </Show>
        </div>
      </Show>
      <Show when={!local.items}>
        <DescriptionsItemContext.Provider value={itemContext}>
          {local.children}
        </DescriptionsItemContext.Provider>
      </Show>
      <div class={`${prefixCls()}-view`}>
        <table class={`${prefixCls()}-table`}>
          <tbody>
            <For each={rows()}>
              {(row) => (
                <Show
                  when={layout() === 'vertical'}
                  fallback={
                    <tr>
                      <For each={row}>
                        {(item) => (
                          <Show
                            when={local.bordered}
                            fallback={
                              <td
                                class={itemClass(item)}
                                style={item.style}
                                colspan={colSpan(item)}
                              >
                                <span class={`${prefixCls()}-item-label`}>{item.label}</span>
                                <span class={`${prefixCls()}-item-content`}>{item.children}</span>
                              </td>
                            }
                          >
                            {labelCell(item, {
                              class: itemClass(item),
                              style: item.style,
                            })}
                            {contentCell(item, {
                              class: itemClass(item),
                              style: item.style,
                              colspan: colSpan(item, 2) - 1,
                            })}
                          </Show>
                        )}
                      </For>
                    </tr>
                  }
                >
                  <tr>
                    <For each={row}>
                      {(item) =>
                        labelCell(item, {
                          class: classNames(`${prefixCls()}-item-label`, itemClass(item)),
                          style: item.style,
                          colspan: colSpan(item),
                        })
                      }
                    </For>
                  </tr>
                  <tr>
                    <For each={row}>
                      {(item) =>
                        contentCell(item, {
                          class: classNames(`${prefixCls()}-item-content`, itemClass(item)),
                          style: item.style,
                          colspan: colSpan(item),
                        })
                      }
                    </For>
                  </tr>
                </Show>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  )
}
