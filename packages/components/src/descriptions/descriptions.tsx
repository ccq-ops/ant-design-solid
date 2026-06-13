import { For, Show, children, createContext, createMemo, splitProps, useContext } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import { resolveResponsiveValue, useBreakpoint } from '../shared/responsive-observer'
import type {
  DescriptionsCellClassNames,
  DescriptionsCellStyles,
  DescriptionsClassNames,
  DescriptionsItemProps,
  DescriptionsItemSpan,
  DescriptionsItemType,
  DescriptionsProps,
  DescriptionsStyles,
} from './interface'
import { useDescriptionsStyle } from './descriptions.style'
import type { Accessor, JSX } from 'solid-js'
import type { ScreenMap } from '../shared/responsive-observer'

function isPresent(value: unknown): boolean {
  return value !== undefined && value !== null && value !== false
}

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  if (!Number.isFinite(value ?? fallback)) return fallback
  return Math.max(1, Math.floor(value ?? fallback))
}

function defaultColumnForScreens(screens: ScreenMap): number {
  return (
    resolveResponsiveValue({ xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3, xxxl: 4 }, screens) ?? 3
  )
}

function toStyleObject(style: JSX.CSSProperties | string | undefined): JSX.CSSProperties {
  return typeof style === 'object' && style !== null ? style : {}
}

function mergeStyles(
  ...styles: Array<JSX.CSSProperties | string | undefined>
): JSX.CSSProperties | string | undefined {
  const stringStyle = styles.find((style): style is string => typeof style === 'string')
  if (stringStyle) return stringStyle

  const merged = Object.assign({}, ...styles.map(toStyleObject))
  return Object.keys(merged).length > 0 ? merged : undefined
}

function devWarning(condition: boolean, message: string) {
  if (condition || typeof console === 'undefined') return
  console.warn(message)
}

interface DescriptionsItemContextValue {
  enabled: true
}

const DESCRIPTION_ITEM_MARK = Symbol('ant-design-solid-descriptions-item')
const DescriptionsItemContext = createContext<DescriptionsItemContextValue>()

type DescriptionsItemMarker = HTMLSpanElement & {
  [DESCRIPTION_ITEM_MARK]: Accessor<DescriptionsItemType>
}

function isDescriptionsItemMarker(node: unknown): node is DescriptionsItemMarker {
  return Boolean(node && typeof node === 'object' && DESCRIPTION_ITEM_MARK in node)
}

function getChildrenItems(childNodes: unknown[]): DescriptionsItemType[] {
  return childNodes.filter(isDescriptionsItemMarker).map((node) => node[DESCRIPTION_ITEM_MARK]())
}

export function DescriptionsItem(props: DescriptionsItemProps) {
  const context = useContext(DescriptionsItemContext)
  if (!context) return null

  const item = () => ({
    label: props.label,
    children: props.children,
    span: props.span,
    class: props.class,
    style: props.style,
    classNames: props.classNames,
    styles: props.styles,
  })

  return (
    <span
      ref={(node) => {
        ;(node as DescriptionsItemMarker)[DESCRIPTION_ITEM_MARK] = item
      }}
      style={{ display: 'none' }}
      aria-hidden="true"
    />
  )
}

interface InternalDescriptionsItemType extends Omit<DescriptionsItemType, 'span'> {
  span?: number
  filled?: boolean
}

function resolveItemSpan(
  span: DescriptionsItemSpan | undefined,
  screens: ScreenMap,
): Pick<InternalDescriptionsItemType, 'span' | 'filled'> {
  if (span === 'filled') return { filled: true }
  return { span: normalizePositiveInteger(resolveResponsiveValue(span, screens), 1) }
}

function normalizeItems(
  items: DescriptionsItemType[],
  screens: ScreenMap,
): InternalDescriptionsItemType[] {
  return items.filter(Boolean).map(({ span, ...rest }) => ({
    ...rest,
    ...resolveItemSpan(span, screens),
  }))
}

function chunkItems(
  items: InternalDescriptionsItemType[],
  column: number,
): InternalDescriptionsItemType[][] {
  const rows: InternalDescriptionsItemType[][] = []
  let current: InternalDescriptionsItemType[] = []
  let filled = 0
  let exceeded = false

  items.forEach((item) => {
    if (item.filled) {
      current.push({ ...item, span: column - filled })
      rows.push(current)
      current = []
      filled = 0
      return
    }

    const restSpan = column - filled
    const rawSpan = normalizePositiveInteger(item.span, 1)
    const span = Math.min(rawSpan, column)
    if (current.length > 0 && filled + span > column) {
      exceeded = true
      current.push({ ...item, span: restSpan })
      rows.push(current)
      current = []
      filled = 0
      return
    }
    current.push({ ...item, span })
    filled += span
    if (filled >= column) {
      rows.push(current)
      current = []
      filled = 0
    }
  })

  if (current.length > 0) rows.push(current)
  rows.forEach((row) => {
    const rowSpan = row.reduce((sum, item) => sum + (item.span ?? 1), 0)
    if (rowSpan >= column) return
    const lastItem = row[row.length - 1]
    if (lastItem) lastItem.span = column - (rowSpan - (lastItem.span ?? 1))
  })
  devWarning(
    !exceeded,
    'Warning: [ant-design-solid: Descriptions] Sum of column `span` in a line not match `column` of Descriptions.',
  )
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
    'colon',
    'classNames',
    'styles',
    'class',
    'classList',
    'style',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-descriptions`
  const [, hashId] = useDescriptionsStyle(prefixCls())
  const screens = useBreakpoint()
  const column = () =>
    normalizePositiveInteger(
      resolveResponsiveValue(local.column, screens()),
      defaultColumnForScreens(screens()),
    )
  const layout = () => local.layout ?? 'horizontal'
  const size = () => local.size ?? 'large'
  const colon = () => local.colon ?? true
  const itemContext: DescriptionsItemContextValue = { enabled: true }
  const resolvedChildren = children(() => (
    <Show when={local.items === undefined}>
      <DescriptionsItemContext.Provider value={itemContext}>
        {local.children}
      </DescriptionsItemContext.Provider>
    </Show>
  ))
  const normalizedItems = createMemo(() =>
    normalizeItems(
      local.items !== undefined ? local.items : getChildrenItems(resolvedChildren.toArray()),
      screens(),
    ),
  )
  const semanticInfo = createMemo(() => ({
    props: {
      ...props,
      column: column(),
      size: size(),
      layout: layout(),
      colon: colon(),
      items: normalizedItems(),
    },
  }))
  const mergedClassNames = createMemo<DescriptionsClassNames>(() =>
    typeof local.classNames === 'function'
      ? local.classNames(semanticInfo())
      : (local.classNames ?? {}),
  )
  const mergedStyles = createMemo<DescriptionsStyles>(() =>
    typeof local.styles === 'function' ? local.styles(semanticInfo()) : (local.styles ?? {}),
  )
  const rows = createMemo(() => chunkItems(normalizedItems(), column()))
  const hasHeader = () => isPresent(local.title) || isPresent(local.extra)
  const colSpan = (item: InternalDescriptionsItemType, multiplier = 1) =>
    normalizePositiveInteger(item.span, 1) * multiplier
  const itemClass = (item: InternalDescriptionsItemType) =>
    classNames(`${prefixCls()}-item`, item.class)
  const cellClassNames = (
    item: InternalDescriptionsItemType,
    slot: keyof DescriptionsCellClassNames,
    extra?: string,
  ) => classNames(mergedClassNames()[slot], item.classNames?.[slot], extra)
  const cellStyle = (
    item: InternalDescriptionsItemType,
    slot: keyof DescriptionsCellStyles,
    extra?: JSX.CSSProperties | string,
  ) => mergeStyles(mergedStyles()[slot], item.styles?.[slot], extra)
  const labelCell = (
    item: InternalDescriptionsItemType,
    extraProps: JSX.TdHTMLAttributes<HTMLTableCellElement> = {},
  ) => {
    const { class: cellClass, style, ...cellProps } = extraProps
    return (
      <td {...cellProps} class={classNames(`${prefixCls()}-item-label`, cellClass)} style={style}>
        {item.label}
      </td>
    )
  }
  const contentCell = (
    item: InternalDescriptionsItemType,
    extraProps: JSX.TdHTMLAttributes<HTMLTableCellElement> = {},
  ) => {
    const { class: cellClass, style, ...cellProps } = extraProps
    return (
      <td {...cellProps} class={classNames(`${prefixCls()}-item-content`, cellClass)} style={style}>
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
        size() !== 'large' && `${prefixCls()}-${size()}`,
        mergedClassNames().root,
        hashId(),
        local.class,
      )}
      classList={local.classList}
      style={mergeStyles(mergedStyles().root, local.style)}
    >
      <Show when={hasHeader()}>
        <div
          class={classNames(`${prefixCls()}-header`, mergedClassNames().header)}
          style={mergedStyles().header}
        >
          <Show when={isPresent(local.title)}>
            <div
              class={classNames(`${prefixCls()}-title`, mergedClassNames().title)}
              style={mergedStyles().title}
            >
              {local.title}
            </div>
          </Show>
          <Show when={isPresent(local.extra)}>
            <div
              class={classNames(`${prefixCls()}-extra`, mergedClassNames().extra)}
              style={mergedStyles().extra}
            >
              {local.extra}
            </div>
          </Show>
        </div>
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
                                <span
                                  class={classNames(
                                    `${prefixCls()}-item-label`,
                                    !colon() && `${prefixCls()}-item-no-colon`,
                                    cellClassNames(item, 'label'),
                                  )}
                                  style={cellStyle(item, 'label')}
                                >
                                  {item.label}
                                </span>
                                <span
                                  class={classNames(
                                    `${prefixCls()}-item-content`,
                                    cellClassNames(item, 'content'),
                                  )}
                                  style={cellStyle(item, 'content')}
                                >
                                  {item.children}
                                </span>
                              </td>
                            }
                          >
                            {labelCell(item, {
                              class: classNames(itemClass(item), cellClassNames(item, 'label')),
                              style: cellStyle(item, 'label', item.style),
                            })}
                            {contentCell(item, {
                              class: classNames(itemClass(item), cellClassNames(item, 'content')),
                              style: cellStyle(item, 'content', item.style),
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
                          class: classNames(
                            `${prefixCls()}-item-label`,
                            itemClass(item),
                            cellClassNames(item, 'label'),
                          ),
                          style: cellStyle(item, 'label', item.style),
                          colspan: colSpan(item),
                        })
                      }
                    </For>
                  </tr>
                  <tr>
                    <For each={row}>
                      {(item) =>
                        contentCell(item, {
                          class: classNames(
                            `${prefixCls()}-item-content`,
                            itemClass(item),
                            cellClassNames(item, 'content'),
                          ),
                          style: cellStyle(item, 'content', item.style),
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
