import { For, Show, createEffect, createSignal, splitProps } from 'solid-js'
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
  TableRenderCellOutput,
  TableRenderCellProps,
  TableRowSelectionChangeType,
  TableRowSelectionPreset,
  TableRowSelectionSelection,
  TableSorterResult,
  TableSortOrder,
} from './interface'

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_SORT_DIRECTIONS: TableSortOrder[] = ['ascend', 'descend', null]
const DEFAULT_SELECTIONS: TableRowSelectionPreset[] = ['all', 'invert', 'none']

interface TableHeaderCell<T extends object> {
  column: TableColumn<T>
  colSpan: number
  rowSpan: number
  columnIndex: number
}

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

function isColumnVisible<T extends object>(column: TableColumn<T>) {
  return !column.hidden && (!column.responsive || column.responsive.includes('xs'))
}

function getVisibleColumns<T extends object>(columns: TableColumn<T>[]): TableColumn<T>[] {
  return columns
    .filter(isColumnVisible)
    .map((column) =>
      column.children
        ? {
            ...column,
            children: getVisibleColumns(column.children),
          }
        : column,
    )
    .filter((column) => !column.children || column.children.length > 0)
}

function getLeafColumns<T extends object>(columns: TableColumn<T>[]): TableColumn<T>[] {
  return columns.flatMap((column) =>
    column.children?.length ? getLeafColumns(column.children) : [column],
  )
}

function getColumnDepth<T extends object>(columns: TableColumn<T>[]): number {
  if (columns.length === 0) return 1
  return Math.max(
    ...columns.map((column) => (column.children?.length ? 1 + getColumnDepth(column.children) : 1)),
  )
}

function getLeafCount<T extends object>(column: TableColumn<T>) {
  return column.children?.length ? getLeafColumns(column.children).length : 1
}

function getHeaderRows<T extends object>(
  columns: TableColumn<T>[],
  depth: number,
): TableHeaderCell<T>[][] {
  let leafIndex = 0
  const rows: TableHeaderCell<T>[][] = Array.from({ length: depth }, () => [])
  const visit = (items: TableColumn<T>[], level: number) => {
    items.forEach((column) => {
      const hasChildren = Boolean(column.children?.length)
      const colSpan = hasChildren ? getLeafCount(column) : 1
      const columnIndex = hasChildren ? leafIndex : leafIndex++
      rows[level].push({
        column,
        colSpan,
        rowSpan: hasChildren ? 1 : depth - level,
        columnIndex,
      })
      if (column.children?.length) visit(column.children, level + 1)
    })
  }
  visit(columns, 0)
  return rows
}

function isRenderCellResult(value: TableRenderCellOutput): value is {
  children?: JSX.Element
  props?: TableRenderCellProps
} {
  return Boolean(value && typeof value === 'object' && 'props' in value)
}

function getEllipsisTitle(value: JSX.Element, enabled: boolean) {
  if (!enabled) return undefined
  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined
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
    'rowSelection',
    'expandable',
    'scroll',
    'summary',
    'title',
    'footer',
    'tableLayout',
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
  const columns = () => getVisibleColumns(local.columns ?? [])
  const leafColumns = () => getLeafColumns(columns())
  const headerDepth = () => getColumnDepth(columns())
  const headerRows = () => getHeaderRows(columns(), headerDepth())
  const data = () => local.dataSource ?? []
  const size = () => local.size ?? 'middle'
  const initialPagination = local.pagination === false ? undefined : local.pagination
  const initialSelectedKeys =
    local.rowSelection?.selectedRowKeys ?? local.rowSelection?.defaultSelectedRowKeys ?? []
  const initialExpandedKeys = local.expandable?.defaultExpandAllRows
    ? data().map((record, index) => getRowKey(record, index, local.rowKey))
    : (local.expandable?.expandedRowKeys ?? local.expandable?.defaultExpandedRowKeys ?? [])
  const [innerCurrent, setInnerCurrent] = createSignal(initialPagination?.defaultCurrent ?? 1)
  const [innerPageSize, setInnerPageSize] = createSignal(
    initialPagination?.defaultPageSize ?? DEFAULT_PAGE_SIZE,
  )
  const [innerSelectedKeys, setInnerSelectedKeys] = createSignal<TableKey[]>(initialSelectedKeys)
  const [innerExpandedKeys, setInnerExpandedKeys] = createSignal<TableKey[]>(initialExpandedKeys)
  const [innerFilters, setInnerFilters] = createSignal<Record<string, TableFilterValue | null>>({})
  const [innerSorter, setInnerSorter] = createSignal<TableSorterResult<T>>({})
  const [openFilterKey, setOpenFilterKey] = createSignal<string>()
  const [selectionMenuOpen, setSelectionMenuOpen] = createSignal(false)
  const loading = () => isLoading(local.loading)

  const filteredValues = () => getFilteredValues(leafColumns(), innerFilters())
  const filteredData = () => {
    const filters = filteredValues()
    return data().filter((record) =>
      leafColumns().every((column, index) => {
        if (!column.filters || !column.onFilter) return true
        const values = filters[getColumnKey(column, index)]
        if (!values || values.length === 0) return true
        return values.some((value) => column.onFilter?.(value, record))
      }),
    )
  }
  const sorter = () => {
    const controlledColumn = leafColumns().find((column) => column.sortOrder !== undefined)
    if (controlledColumn) {
      const columnIndex = leafColumns().indexOf(controlledColumn)
      return {
        column: controlledColumn,
        order: controlledColumn.sortOrder,
        field: controlledColumn.dataIndex,
        columnKey: getColumnKeyValue(controlledColumn, columnIndex),
      } satisfies TableSorterResult<T>
    }
    const current = innerSorter()
    if (current.order) return current
    const defaultColumn = leafColumns().find((column) => column.defaultSortOrder)
    if (!defaultColumn) return current
    const columnIndex = leafColumns().indexOf(defaultColumn)
    return {
      column: defaultColumn,
      order: defaultColumn.defaultSortOrder,
      field: defaultColumn.dataIndex,
      columnKey: getColumnKeyValue(defaultColumn, columnIndex),
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
  const getRecordIndex = (record: T, fallbackIndex: number) => {
    const sourceIndex = data().indexOf(record)
    return sourceIndex >= 0 ? sourceIndex : fallbackIndex
  }
  const getRecordKey = (record: T, index: number) =>
    getRowKey(record, getRecordIndex(record, index), local.rowKey)
  const renderColumnCount = () =>
    leafColumns().length + (local.rowSelection ? 1 : 0) + (local.expandable ? 1 : 0)
  const selectedKeys = () => local.rowSelection?.selectedRowKeys ?? innerSelectedKeys()
  const selectedKeySet = () => new Set(selectedKeys())
  const allRecordKeys = () => data().map((record, index) => getRowKey(record, index, local.rowKey))
  const allRecordKeySet = () => new Set(allRecordKeys())
  const selectablePageRecords = () =>
    pageData().filter((record) => !local.rowSelection?.getCheckboxProps?.(record)?.disabled)
  const selectablePageKeys = () =>
    selectablePageRecords().map((record, index) => getRecordKey(record, index))
  const selectedRows = (keys = selectedKeys()) => {
    const keySet = new Set(keys)
    return data().filter((record, index) => keySet.has(getRowKey(record, index, local.rowKey)))
  }
  const allPageSelected = () => {
    const keys = selectablePageKeys()
    return keys.length > 0 && keys.every((key) => selectedKeySet().has(key))
  }
  const expandedKeys = () => local.expandable?.expandedRowKeys ?? innerExpandedKeys()
  const expandedKeySet = () => new Set(expandedKeys())

  createEffect(() => {
    const selection = local.rowSelection
    if (!selection || selection.selectedRowKeys || selection.preserveSelectedRowKeys) return
    const keySet = allRecordKeySet()
    const nextKeys = innerSelectedKeys().filter((key) => keySet.has(key))
    if (nextKeys.length !== innerSelectedKeys().length) setInnerSelectedKeys(nextKeys)
  })
  const controlledPaginationProps = () => {
    const config = paginationConfig()
    if (!config) return {}
    return {
      ...(config.current !== undefined ? { current: paginationState().current } : {}),
      ...(config.pageSize !== undefined ? { pageSize: paginationState().pageSize } : {}),
    }
  }
  const scrollContainerStyle = (): JSX.CSSProperties | undefined => {
    if (!local.scroll) return undefined
    return {
      'overflow-x': local.scroll.x ? 'auto' : undefined,
      'overflow-y': local.scroll.y ? 'auto' : undefined,
      'max-height':
        typeof local.scroll.y === 'number'
          ? `${local.scroll.y}px`
          : local.scroll.y == null
            ? undefined
            : String(local.scroll.y),
    }
  }
  const tableStyle = (): JSX.CSSProperties | undefined => {
    const layout =
      local.tableLayout ?? (leafColumns().some((column) => column.ellipsis) ? 'fixed' : undefined)
    if (!local.scroll?.x && !layout) return undefined
    return {
      'min-width':
        typeof local.scroll?.x === 'number'
          ? `${local.scroll.x}px`
          : local.scroll?.x === true
            ? 'max-content'
            : local.scroll?.x == null
              ? undefined
              : String(local.scroll.x),
      'table-layout': layout,
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

  function setSelectedKeys(keys: TableKey[], type: TableRowSelectionChangeType) {
    if (!local.rowSelection?.selectedRowKeys) setInnerSelectedKeys(keys)
    local.rowSelection?.onChange?.(keys, selectedRows(keys), { type })
  }

  function updateSelectAll(checked: boolean) {
    const pageKeys = selectablePageKeys()
    const current = selectedKeys()
    const pageKeySet = new Set(pageKeys)
    const nextKeys = checked
      ? [...current, ...pageKeys.filter((key) => !current.includes(key))]
      : current.filter((key) => !pageKeySet.has(key))
    setSelectedKeys(nextKeys, checked ? 'all' : 'none')
    local.rowSelection?.onSelectAll?.(checked, selectedRows(nextKeys), selectablePageRecords())
  }

  function toggleSelectAll(event: Event) {
    const checked = event.currentTarget instanceof HTMLInputElement && event.currentTarget.checked
    updateSelectAll(checked)
  }

  function toggleRowSelection(record: T, rowIndex: number, event: Event) {
    const key = getRecordKey(record, rowIndex)
    const checked = event.currentTarget instanceof HTMLInputElement && event.currentTarget.checked
    const nextKeys =
      local.rowSelection?.type === 'radio'
        ? checked
          ? [key]
          : []
        : checked
          ? [...selectedKeys(), key].filter((item, index, array) => array.indexOf(item) === index)
          : selectedKeys().filter((item) => item !== key)
    const nextRows = selectedRows(nextKeys)
    if (!local.rowSelection?.selectedRowKeys) setInnerSelectedKeys(nextKeys)
    local.rowSelection?.onSelect?.(record, checked, nextRows, event)
    local.rowSelection?.onChange?.(nextKeys, nextRows, { type: 'single' })
  }

  function invertSelection() {
    const pageKeys = selectablePageKeys()
    const current = selectedKeys()
    const currentSet = new Set(current)
    const pageKeySet = new Set(pageKeys)
    const withoutPageKeys = current.filter((key) => !pageKeySet.has(key))
    const invertedPageKeys = pageKeys.filter((key) => !currentSet.has(key))
    const nextKeys = [...withoutPageKeys, ...invertedPageKeys]
    setSelectedKeys(nextKeys, 'invert')
    local.rowSelection?.onSelectInvert?.(nextKeys)
  }

  function clearSelection() {
    setSelectedKeys([], 'none')
    local.rowSelection?.onSelectNone?.()
  }

  function selectionItems():
    | Array<TableRowSelectionPreset | TableRowSelectionSelection>
    | undefined {
    const selections = local.rowSelection?.selections
    if (!selections) return undefined
    return selections === true ? DEFAULT_SELECTIONS : selections
  }

  function selectionActionLabel(item: TableRowSelectionPreset | TableRowSelectionSelection) {
    if (typeof item !== 'string') return item.text
    if (item === 'all') return 'Select all'
    if (item === 'invert') return 'Invert selection'
    return 'Select none'
  }

  function triggerSelectionAction(item: TableRowSelectionPreset | TableRowSelectionSelection) {
    if (typeof item !== 'string') {
      item.onSelect?.(selectablePageKeys())
      setSelectionMenuOpen(false)
      return
    }
    if (item === 'all') updateSelectAll(true)
    if (item === 'invert') invertSelection()
    if (item === 'none') clearSelection()
    setSelectionMenuOpen(false)
  }

  function canExpand(record: T) {
    if (!local.expandable?.expandedRowRender) return false
    return local.expandable.rowExpandable ? local.expandable.rowExpandable(record) : true
  }

  function toggleExpanded(record: T, rowIndex: number) {
    if (!canExpand(record)) return
    const key = getRecordKey(record, rowIndex)
    const expanded = !expandedKeySet().has(key)
    const nextKeys = expanded
      ? [...expandedKeys(), key].filter((item, index, array) => array.indexOf(item) === index)
      : expandedKeys().filter((item) => item !== key)
    if (!local.expandable?.expandedRowKeys) setInnerExpandedKeys(nextKeys)
    local.expandable?.onExpand?.(expanded, record)
    local.expandable?.onExpandedRowsChange?.(nextKeys)
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

  function renderCellContent(column: TableColumn<T>, record: T, rowIndex: number) {
    const value = getValue(record, column.dataIndex)
    const output = column.render ? column.render(value, record, rowIndex) : (value as JSX.Element)
    if (isRenderCellResult(output)) {
      return {
        children: output.children,
        props: output.props ?? {},
      }
    }
    return {
      children: output,
      props: {},
    }
  }

  function getColumnSortOrder(column: TableColumn<T>, index: number) {
    const current = sorter()
    return current.column && getColumnKey(current.column, index) === getColumnKey(column, index)
      ? current.order
      : null
  }

  function renderSelectionHeader() {
    if (!local.rowSelection) return null
    if (local.rowSelection.columnTitle) return local.rowSelection.columnTitle
    if (local.rowSelection.type === 'radio') return local.rowSelection.columnTitle
    const checkboxProps = local.rowSelection.getTitleCheckboxProps?.() ?? {}
    return (
      <span class={`${prefixCls()}-selection-header`}>
        <Show when={!local.rowSelection.hideSelectAll}>
          <input
            {...checkboxProps}
            type="checkbox"
            aria-label={checkboxProps['aria-label'] ?? 'Select all rows'}
            checked={allPageSelected()}
            onChange={toggleSelectAll}
          />
        </Show>
        <Show when={selectionItems()}>
          <span class={`${prefixCls()}-selection-menu`}>
            <button
              type="button"
              class={`${prefixCls()}-selection-menu-trigger`}
              aria-label="Selection actions"
              aria-expanded={selectionMenuOpen()}
              onClick={() => setSelectionMenuOpen(!selectionMenuOpen())}
            >
              ▾
            </button>
            <Show when={selectionMenuOpen()}>
              <div class={`${prefixCls()}-selection-menu-dropdown`}>
                <For each={selectionItems()}>
                  {(item) => (
                    <button type="button" onClick={() => triggerSelectionAction(item)}>
                      {selectionActionLabel(item)}
                    </button>
                  )}
                </For>
              </div>
            </Show>
          </span>
        </Show>
      </span>
    )
  }

  function renderSelectionCell(record: T, rowIndex: number) {
    const selection = local.rowSelection
    if (!selection) return null
    const key = getRecordKey(record, rowIndex)
    const checkboxProps = selection.getCheckboxProps?.(record) ?? {}
    const checked = () => selectedKeySet().has(key)
    const originNode = () => (
      <input
        {...checkboxProps}
        type={selection.type === 'radio' ? 'radio' : 'checkbox'}
        aria-label={`Select row ${key}`}
        checked={checked()}
        onChange={(event) => toggleRowSelection(record, rowIndex, event)}
      />
    )
    return selection.renderCell
      ? selection.renderCell(checked(), record, rowIndex, originNode())
      : originNode()
  }

  function renderExpandHeader() {
    if (!local.expandable) return null
    return local.expandable.columnTitle
  }

  function renderExpandCell(record: T, rowIndex: number) {
    if (!local.expandable) return null
    const key = getRecordKey(record, rowIndex)
    const expanded = expandedKeySet().has(key)
    return (
      <Show when={canExpand(record)}>
        <button
          type="button"
          class={`${prefixCls()}-expand-icon`}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} row ${key}`}
          aria-expanded={expanded}
          onClick={(event) => {
            event.stopPropagation()
            toggleExpanded(record, rowIndex)
          }}
        >
          {expanded ? '−' : '+'}
        </button>
      </Show>
    )
  }

  function expandedRowClass(record: T, index: number) {
    const className = local.expandable?.expandedRowClassName
    return typeof className === 'function' ? className(record, index, 0) : className
  }

  function renderHeaderCell(cell: TableHeaderCell<T>) {
    const column = cell.column
    return (
      <th
        {...(column.onHeaderCell?.(column) ?? {})}
        class={classNames(
          column.align === 'center' && `${prefixCls()}-cell-center`,
          column.align === 'right' && `${prefixCls()}-cell-right`,
          column.ellipsis && `${prefixCls()}-cell-ellipsis`,
          column.class,
          column.className,
        )}
        classList={column.classList}
        colspan={column.children?.length ? cell.colSpan : undefined}
        rowspan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
        style={{
          width: typeof column.width === 'number' ? `${column.width}px` : column.width,
        }}
        data-column-key={getColumnKey(column, cell.columnIndex)}
      >
        <span class={`${prefixCls()}-column-title`}>{renderTitle(column)}</span>
        <span class={`${prefixCls()}-column-actions`}>
          <Show when={!column.children?.length && column.sorter}>
            <button
              type="button"
              class={classNames(
                `${prefixCls()}-column-action`,
                `${prefixCls()}-sorter`,
                getColumnSortOrder(column, cell.columnIndex) && `${prefixCls()}-sorter-active`,
              )}
              aria-label={`Sort by ${String(renderTitle(column))}`}
              aria-sort={getAriaSort(getColumnSortOrder(column, cell.columnIndex) ?? null)}
              onClick={() => toggleSort(column, cell.columnIndex)}
            >
              <span
                class={classNames(
                  `${prefixCls()}-sorter-icon`,
                  getColumnSortOrder(column, cell.columnIndex) === 'ascend' &&
                    `${prefixCls()}-sorter-icon-active`,
                )}
                aria-hidden="true"
              >
                ▲
              </span>
              <span
                class={classNames(
                  `${prefixCls()}-sorter-icon`,
                  getColumnSortOrder(column, cell.columnIndex) === 'descend' &&
                    `${prefixCls()}-sorter-icon-active`,
                )}
                aria-hidden="true"
              >
                ▼
              </span>
            </button>
          </Show>
          <Show when={!column.children?.length && column.filters}>
            <button
              type="button"
              class={classNames(
                `${prefixCls()}-column-action`,
                `${prefixCls()}-filter-trigger`,
                Boolean(filteredValues()[getColumnKey(column, cell.columnIndex)]?.length) &&
                  `${prefixCls()}-filter-trigger-active`,
              )}
              aria-label={`Filter ${String(renderTitle(column))}`}
              onClick={() =>
                setOpenFilterKey(
                  openFilterKey() === getColumnKey(column, cell.columnIndex)
                    ? undefined
                    : getColumnKey(column, cell.columnIndex),
                )
              }
            >
              {column.filterIcon
                ? typeof column.filterIcon === 'function'
                  ? column.filterIcon(
                      Boolean(filteredValues()[getColumnKey(column, cell.columnIndex)]?.length),
                    )
                  : column.filterIcon
                : 'Filter'}
            </button>
            <Show when={openFilterKey() === getColumnKey(column, cell.columnIndex)}>
              <div class={`${prefixCls()}-filter-dropdown`}>
                <For each={column.filters}>
                  {(filter) => {
                    const key = getColumnKey(column, cell.columnIndex)
                    const checked = () => Boolean(filteredValues()[key]?.includes(filter.value))
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
                              cell.columnIndex,
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
    )
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
      <Show when={local.title}>
        <div class={`${prefixCls()}-title`}>{local.title?.(pageData())}</div>
      </Show>
      <div class={`${prefixCls()}-container`} style={scrollContainerStyle()}>
        <table class={prefixCls()} style={tableStyle()}>
          <Show when={local.showHeader !== false}>
            <thead>
              <For each={headerRows()}>
                {(row, rowIndex) => (
                  <tr {...(local.onHeaderRow?.(leafColumns(), rowIndex()) ?? {})}>
                    <Show when={rowIndex() === 0 && local.expandable}>
                      <th
                        class={`${prefixCls()}-expand-column`}
                        rowspan={headerDepth() > 1 ? headerDepth() : undefined}
                        style={{
                          width:
                            typeof local.expandable?.columnWidth === 'number'
                              ? `${local.expandable.columnWidth}px`
                              : local.expandable?.columnWidth,
                        }}
                      >
                        {renderExpandHeader()}
                      </th>
                    </Show>
                    <Show when={rowIndex() === 0 && local.rowSelection}>
                      <th
                        class={`${prefixCls()}-selection-column`}
                        rowspan={headerDepth() > 1 ? headerDepth() : undefined}
                        style={{
                          width:
                            typeof local.rowSelection?.columnWidth === 'number'
                              ? `${local.rowSelection.columnWidth}px`
                              : local.rowSelection?.columnWidth,
                        }}
                      >
                        {renderSelectionHeader()}
                      </th>
                    </Show>
                    <For each={row}>{(cell) => renderHeaderCell(cell)}</For>
                  </tr>
                )}
              </For>
            </thead>
          </Show>
          <tbody>
            <Show
              when={pageData().length > 0}
              fallback={
                <tr>
                  <td class={`${prefixCls()}-empty`} colspan={Math.max(renderColumnCount(), 1)}>
                    {getEmptyText(local)}
                  </td>
                </tr>
              }
            >
              <For each={pageData()}>
                {(record, index) => {
                  const rowProps = () => local.onRow?.(record, index()) ?? {}
                  const key = () => getRecordKey(record, index())
                  const expanded = () => expandedKeySet().has(key())
                  return (
                    <>
                      <tr
                        {...rowProps()}
                        class={classNames(
                          rowProps().class,
                          typeof local.rowClassName === 'function'
                            ? local.rowClassName(record, index())
                            : local.rowClassName,
                        )}
                        data-row-key={key()}
                        onClick={(event) => {
                          const onClick = rowProps().onClick
                          if (typeof onClick === 'function') onClick(event)
                          if (local.expandable?.expandRowByClick) toggleExpanded(record, index())
                        }}
                      >
                        <Show when={local.expandable}>
                          <td class={`${prefixCls()}-expand-column`}>
                            {renderExpandCell(record, index())}
                          </td>
                        </Show>
                        <Show when={local.rowSelection}>
                          <td class={`${prefixCls()}-selection-column`}>
                            {renderSelectionCell(record, index())}
                          </td>
                        </Show>
                        <For each={leafColumns()}>
                          {(column) => {
                            const cellProps = () => column.onCell?.(record, index()) ?? {}
                            const rendered = () => renderCellContent(column, record, index())
                            const mergedCellProps = () => ({ ...cellProps(), ...rendered().props })
                            const skipCell = () =>
                              mergedCellProps().colSpan === 0 || mergedCellProps().rowSpan === 0
                            const ellipsisShowTitle = () =>
                              column.ellipsis === true ||
                              (typeof column.ellipsis === 'object' &&
                                column.ellipsis.showTitle !== false)
                            return (
                              <Show when={!skipCell()}>
                                <td
                                  {...mergedCellProps()}
                                  scope={column.rowScope}
                                  title={
                                    mergedCellProps().title ??
                                    getEllipsisTitle(rendered().children, ellipsisShowTitle())
                                  }
                                  class={classNames(
                                    column.align === 'center' && `${prefixCls()}-cell-center`,
                                    column.align === 'right' && `${prefixCls()}-cell-right`,
                                    column.ellipsis && `${prefixCls()}-cell-ellipsis`,
                                    column.class,
                                    column.className,
                                    cellProps().class,
                                    rendered().props.class,
                                  )}
                                  classList={column.classList}
                                >
                                  {rendered().children}
                                </td>
                              </Show>
                            )
                          }}
                        </For>
                      </tr>
                      <Show when={expanded()}>
                        <tr
                          class={classNames(
                            `${prefixCls()}-expanded-row`,
                            expandedRowClass(record, index()),
                          )}
                        >
                          <td colspan={Math.max(renderColumnCount(), 1)}>
                            {local.expandable?.expandedRowRender?.(record, index(), 0, true)}
                          </td>
                        </tr>
                      </Show>
                    </>
                  )
                }}
              </For>
            </Show>
          </tbody>
          <Show when={local.summary}>
            <tfoot>{local.summary?.(pageData())}</tfoot>
          </Show>
        </table>
      </div>
      <Show when={local.footer}>
        <div class={`${prefixCls()}-footer`}>{local.footer?.(pageData())}</div>
      </Show>
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
