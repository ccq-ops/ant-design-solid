import { For, Show, createSignal, splitProps } from 'solid-js'
import { useConfig } from '../config-provider'
import { Pagination } from '../pagination'
import { classNames } from '../shared/class-names'
import { useTableStyle } from './table.style'
import type { JSX } from 'solid-js'
import type {
  TableChangeAction,
  TableChangePagination,
  TableColumn,
  TableDataIndex,
  TableFilterValue,
  TableKey,
  TableProps,
  TableSorterResult,
  TableSortOrder,
} from './interface'

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_SORT_DIRECTIONS: TableSortOrder[] = ['ascend', 'descend', null]

function getValue<T extends object>(record: T, dataIndex: TableDataIndex<T> | undefined) {
  if (!dataIndex) return undefined
  if (Array.isArray(dataIndex)) {
    return dataIndex.reduce<unknown>((value, key) => {
      if (value == null) return undefined
      return (value as Record<string, unknown>)[String(key)]
    }, record)
  }
  return (record as Record<string, unknown>)[String(dataIndex)]
}

function getColumnKey<T extends object>(column: TableColumn<T>, index: number) {
  if (column.key) return column.key
  if (Array.isArray(column.dataIndex)) return column.dataIndex.join('.')
  return String(column.dataIndex ?? index)
}

function getColumnKeyValue<T extends object>(column: TableColumn<T>, index: number): TableKey {
  return getColumnKey(column, index)
}

function getRowKey<T extends object>(record: T, index: number, rowKey: TableProps<T>['rowKey']) {
  if (typeof rowKey === 'function') return rowKey(record, index)
  if (rowKey) return String((record as Record<string, unknown>)[String(rowKey)])
  if ('key' in record && record.key != null) return String(record.key)
  return String(index)
}

function isLoading(loading: TableProps['loading']) {
  if (typeof loading === 'boolean') return loading
  return Boolean(loading?.spinning)
}

function getLoadingTip(loading: TableProps['loading']) {
  if (typeof loading === 'object') return loading.tip
  return undefined
}

function getEmptyText<T extends object>(props: Pick<TableProps<T>, 'emptyText' | 'locale'>) {
  const localeEmptyText = props.locale?.emptyText
  if (typeof localeEmptyText === 'function') return localeEmptyText()
  return props.emptyText ?? localeEmptyText ?? 'No data'
}

function getFilteredValues<T extends object>(
  columns: TableColumn<T>[],
  innerFilters: Record<string, TableFilterValue | null>,
) {
  return columns.reduce<Record<string, TableFilterValue | null>>((filters, column, index) => {
    if (!column.filters) return filters
    const key = getColumnKey(column, index)
    filters[key] = column.filteredValue ?? innerFilters[key] ?? column.defaultFilteredValue ?? null
    return filters
  }, {})
}

function getSorterCompare<T extends object>(column: TableColumn<T>) {
  if (!column.sorter) return undefined
  if (typeof column.sorter === 'function') return column.sorter
  if (typeof column.sorter === 'object') return column.sorter.compare
  return undefined
}

function nextSortOrder(current: TableSortOrder, directions: TableSortOrder[]) {
  const orderList = directions.length > 0 ? directions : DEFAULT_SORT_DIRECTIONS
  const currentIndex = orderList.indexOf(current)
  return orderList[(currentIndex + 1) % orderList.length] ?? null
}

function getAriaSort(order: TableSortOrder) {
  if (order === 'ascend') return 'ascending'
  if (order === 'descend') return 'descending'
  return 'none'
}

export function Table<T extends object = object>(props: TableProps<T>) {
  const [local, rest] = splitProps(props, [
    'columns',
    'dataSource',
    'rowKey',
    'loading',
    'emptyText',
    'locale',
    'size',
    'bordered',
    'showHeader',
    'pagination',
    'className',
    'onRow',
    'rowClassName',
    'onHeaderRow',
    'onChange',
    'class',
  ])
  const config = useConfig()
  const prefixCls = () => `${config.prefixCls()}-table`
  const [, hashId] = useTableStyle(prefixCls())
  const columns = () => local.columns ?? []
  const data = () => local.dataSource ?? []
  const size = () => local.size ?? 'middle'
  const initialPagination = local.pagination === false ? undefined : local.pagination
  const [innerCurrent, setInnerCurrent] = createSignal(initialPagination?.defaultCurrent ?? 1)
  const [innerPageSize, setInnerPageSize] = createSignal(
    initialPagination?.defaultPageSize ?? DEFAULT_PAGE_SIZE,
  )
  const [innerFilters, setInnerFilters] = createSignal<Record<string, TableFilterValue | null>>({})
  const [innerSorter, setInnerSorter] = createSignal<TableSorterResult<T>>({})
  const [openFilterKey, setOpenFilterKey] = createSignal<string>()
  const loading = () => isLoading(local.loading)

  const filteredValues = () => getFilteredValues(columns(), innerFilters())
  const filteredData = () => {
    const filters = filteredValues()
    return data().filter((record) =>
      columns().every((column, index) => {
        if (!column.filters || !column.onFilter) return true
        const values = filters[getColumnKey(column, index)]
        if (!values || values.length === 0) return true
        return values.some((value) => column.onFilter?.(value, record))
      }),
    )
  }
  const sorter = () => {
    const controlledColumn = columns().find((column) => column.sortOrder !== undefined)
    if (controlledColumn) {
      return {
        column: controlledColumn,
        order: controlledColumn.sortOrder,
        field: controlledColumn.dataIndex,
        columnKey: getColumnKeyValue(controlledColumn, columns().indexOf(controlledColumn)),
      } satisfies TableSorterResult<T>
    }
    const current = innerSorter()
    if (current.order) return current
    const defaultColumn = columns().find((column) => column.defaultSortOrder)
    if (!defaultColumn) return current
    return {
      column: defaultColumn,
      order: defaultColumn.defaultSortOrder,
      field: defaultColumn.dataIndex,
      columnKey: getColumnKeyValue(defaultColumn, columns().indexOf(defaultColumn)),
    } satisfies TableSorterResult<T>
  }
  const processedData = () => {
    const nextData = [...filteredData()]
    const activeSorter = sorter()
    if (!activeSorter.column || !activeSorter.order) return nextData
    const compare = getSorterCompare(activeSorter.column)
    if (!compare) return nextData
    return nextData.sort((a, b) => {
      const result = compare(a, b, activeSorter.order)
      return activeSorter.order === 'descend' ? -result : result
    })
  }
  const paginationConfig = () => (local.pagination === false ? undefined : (local.pagination ?? {}))
  const paginationState = (): TableChangePagination => {
    const config = paginationConfig()
    const pageSize = config?.pageSize ?? innerPageSize()
    const current = config?.current ?? innerCurrent()
    return {
      current,
      pageSize,
      total: config?.total ?? processedData().length,
    }
  }
  const pageData = () => {
    if (local.pagination === false) return processedData()
    const state = paginationState()
    const start = (state.current - 1) * state.pageSize
    return processedData().slice(start, start + state.pageSize)
  }
  const controlledPaginationProps = () => {
    const config = paginationConfig()
    if (!config) return {}
    return {
      ...(config.current !== undefined ? { current: paginationState().current } : {}),
      ...(config.pageSize !== undefined ? { pageSize: paginationState().pageSize } : {}),
    }
  }

  function emitChange(action: TableChangeAction, pagination = paginationState()) {
    local.onChange?.(pagination, filteredValues(), sorter(), {
      action,
      currentDataSource: processedData(),
    })
  }

  function changePage(page: number, pageSize: number) {
    const pagination = { current: page, pageSize, total: paginationState().total }
    if (!paginationConfig()?.current) setInnerCurrent(page)
    if (!paginationConfig()?.pageSize) setInnerPageSize(pageSize)
    paginationConfig()?.onChange?.(page, pageSize)
    emitChange('paginate', pagination)
  }

  function toggleSort(column: TableColumn<T>, index: number) {
    if (!column.sorter) return
    const key = getColumnKey(column, index)
    const current = sorter()
    const currentOrder =
      current.column && getColumnKey(current.column, index) === key ? current.order : null
    const order = nextSortOrder(
      currentOrder ?? null,
      column.sortDirections ?? DEFAULT_SORT_DIRECTIONS,
    )
    setInnerSorter(order ? { column, order, field: column.dataIndex, columnKey: key } : {})
    setInnerCurrent(1)
    emitChange('sort', { ...paginationState(), current: 1 })
  }

  function updateFilter(
    column: TableColumn<T>,
    index: number,
    value: TableKey | boolean,
    checked: boolean,
  ) {
    const key = getColumnKey(column, index)
    const currentValues = filteredValues()[key] ?? []
    const nextValues =
      column.filterMultiple === false
        ? checked
          ? [value]
          : []
        : checked
          ? [...currentValues, value]
          : currentValues.filter((item) => item !== value)
    setInnerFilters({ ...innerFilters(), [key]: nextValues.length > 0 ? nextValues : null })
    setInnerCurrent(1)
    emitChange('filter', { ...paginationState(), current: 1 })
  }

  function renderTitle(column: TableColumn<T>) {
    if (typeof column.title === 'function') return column.title({ sortOrder: sorter().order })
    return column.title
  }

  function getColumnSortOrder(column: TableColumn<T>, index: number) {
    const current = sorter()
    return current.column && getColumnKey(current.column, index) === getColumnKey(column, index)
      ? current.order
      : null
  }

  return (
    <div
      {...rest}
      class={classNames(
        `${prefixCls()}-wrapper`,
        `${prefixCls()}-${size()}`,
        local.bordered && `${prefixCls()}-bordered`,
        loading() && `${prefixCls()}-loading`,
        hashId(),
        local.class,
        local.className,
      )}
    >
      <table class={prefixCls()}>
        <Show when={local.showHeader !== false}>
          <thead>
            <tr {...(local.onHeaderRow?.(columns(), 0) ?? {})}>
              <For each={columns()}>
                {(column, index) => (
                  <th
                    {...(column.onHeaderCell?.(column) ?? {})}
                    class={classNames(
                      column.align === 'center' && `${prefixCls()}-cell-center`,
                      column.align === 'right' && `${prefixCls()}-cell-right`,
                      column.class,
                      column.className,
                    )}
                    classList={column.classList}
                    style={{
                      width: typeof column.width === 'number' ? `${column.width}px` : column.width,
                    }}
                    data-column-key={getColumnKey(column, index())}
                  >
                    <span class={`${prefixCls()}-column-title`}>{renderTitle(column)}</span>
                    <span class={`${prefixCls()}-column-actions`}>
                      <Show when={column.sorter}>
                        <button
                          type="button"
                          class={classNames(
                            `${prefixCls()}-column-action`,
                            `${prefixCls()}-sorter`,
                            getColumnSortOrder(column, index()) && `${prefixCls()}-sorter-active`,
                          )}
                          aria-label={`Sort by ${String(renderTitle(column))}`}
                          aria-sort={getAriaSort(getColumnSortOrder(column, index()) ?? null)}
                          onClick={() => toggleSort(column, index())}
                        >
                          <span
                            class={classNames(
                              `${prefixCls()}-sorter-icon`,
                              getColumnSortOrder(column, index()) === 'ascend' &&
                                `${prefixCls()}-sorter-icon-active`,
                            )}
                            aria-hidden="true"
                          >
                            ▲
                          </span>
                          <span
                            class={classNames(
                              `${prefixCls()}-sorter-icon`,
                              getColumnSortOrder(column, index()) === 'descend' &&
                                `${prefixCls()}-sorter-icon-active`,
                            )}
                            aria-hidden="true"
                          >
                            ▼
                          </span>
                        </button>
                      </Show>
                      <Show when={column.filters}>
                        <button
                          type="button"
                          class={classNames(
                            `${prefixCls()}-column-action`,
                            `${prefixCls()}-filter-trigger`,
                            Boolean(filteredValues()[getColumnKey(column, index())]?.length) &&
                              `${prefixCls()}-filter-trigger-active`,
                          )}
                          aria-label={`Filter ${String(renderTitle(column))}`}
                          onClick={() =>
                            setOpenFilterKey(
                              openFilterKey() === getColumnKey(column, index())
                                ? undefined
                                : getColumnKey(column, index()),
                            )
                          }
                        >
                          {column.filterIcon
                            ? typeof column.filterIcon === 'function'
                              ? column.filterIcon(
                                  Boolean(filteredValues()[getColumnKey(column, index())]?.length),
                                )
                              : column.filterIcon
                            : 'Filter'}
                        </button>
                        <Show when={openFilterKey() === getColumnKey(column, index())}>
                          <div class={`${prefixCls()}-filter-dropdown`}>
                            <For each={column.filters}>
                              {(filter) => {
                                const key = getColumnKey(column, index())
                                const checked = () =>
                                  Boolean(filteredValues()[key]?.includes(filter.value))
                                return (
                                  <label>
                                    <input
                                      type={column.filterMultiple === false ? 'radio' : 'checkbox'}
                                      name={`${prefixCls()}-${key}-filter`}
                                      checked={checked()}
                                      aria-label={String(filter.text)}
                                      onChange={(event) =>
                                        updateFilter(
                                          column,
                                          index(),
                                          filter.value,
                                          event.currentTarget.checked,
                                        )
                                      }
                                    />
                                    {filter.text}
                                  </label>
                                )
                              }}
                            </For>
                          </div>
                        </Show>
                      </Show>
                    </span>
                  </th>
                )}
              </For>
            </tr>
          </thead>
        </Show>
        <tbody>
          <Show
            when={pageData().length > 0}
            fallback={
              <tr>
                <td class={`${prefixCls()}-empty`} colspan={Math.max(columns().length, 1)}>
                  {getEmptyText(local)}
                </td>
              </tr>
            }
          >
            <For each={pageData()}>
              {(record, index) => {
                const rowProps = () => local.onRow?.(record, index()) ?? {}
                return (
                  <tr
                    {...rowProps()}
                    class={classNames(
                      rowProps().class,
                      typeof local.rowClassName === 'function'
                        ? local.rowClassName(record, index())
                        : local.rowClassName,
                    )}
                    data-row-key={getRowKey(record, index(), local.rowKey)}
                  >
                    <For each={columns()}>
                      {(column) => {
                        const value = () => getValue(record, column.dataIndex)
                        const cellProps = () => column.onCell?.(record, index()) ?? {}
                        return (
                          <td
                            {...cellProps()}
                            class={classNames(
                              column.align === 'center' && `${prefixCls()}-cell-center`,
                              column.align === 'right' && `${prefixCls()}-cell-right`,
                              column.class,
                              column.className,
                              cellProps().class,
                            )}
                            classList={column.classList}
                          >
                            {column.render
                              ? column.render(value(), record, index())
                              : (value() as JSX.Element)}
                          </td>
                        )
                      }}
                    </For>
                  </tr>
                )
              }}
            </For>
          </Show>
        </tbody>
      </table>
      <Show when={paginationConfig() && processedData().length > 0}>
        <div class={`${prefixCls()}-pagination`}>
          <Pagination
            {...paginationConfig()}
            {...controlledPaginationProps()}
            total={paginationState().total}
            onChange={changePage}
          />
        </div>
      </Show>
      <Show when={loading()}>
        <div class={`${prefixCls()}-loading-indicator`}>
          {getLoadingTip(local.loading) ?? 'Loading...'}
        </div>
      </Show>
    </div>
  )
}
