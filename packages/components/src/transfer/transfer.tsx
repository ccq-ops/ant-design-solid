import { LeftOutlined, RightOutlined } from '@ant-design-solid/icons'
import { For, Show, createMemo, createSignal, splitProps } from 'solid-js'
import type { JSX } from 'solid-js'
import { useConfig } from '../config-provider'
import { classNames } from '../shared/class-names'
import type {
  TransferCustomListBodyProps,
  TransferDirection,
  TransferItem,
  TransferKey,
  TransferListProps,
  TransferOperationProps,
  TransferProps,
  TransferRenderResult,
  TransferSearchProps,
  TransferSemanticClassNames,
  TransferSemanticStyles,
} from './interface'
import { useTransferStyle } from './transfer.style'

const DEFAULT_PAGE_SIZE = 10

function includesKey(keys: TransferKey[], key: TransferKey): boolean {
  return keys.includes(key)
}

function textFromElement(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return ''
}

function defaultFilter(inputValue: string, item: TransferItem): boolean {
  const search = inputValue.toLowerCase()
  return (
    textFromElement(item.title).toLowerCase().includes(search) ||
    textFromElement(item.description).toLowerCase().includes(search)
  )
}

function isRenderObject(
  value: TransferRenderResult,
): value is { label: JSX.Element; value: string } {
  return Boolean(value && typeof value === 'object' && 'label' in value && 'value' in value)
}

function mergeStyles(
  ...styles: Array<JSX.CSSProperties | string | undefined>
): JSX.CSSProperties | undefined {
  const merged = Object.assign(
    {},
    ...styles.filter(
      (style): style is JSX.CSSProperties => Boolean(style) && typeof style === 'object',
    ),
  )
  return Object.keys(merged).length ? merged : undefined
}

function sectionKey(direction: TransferDirection): 'source' | 'target' {
  return direction === 'left' ? 'source' : 'target'
}

function sectionClass(
  classNamesMap: TransferSemanticClassNames | undefined,
  direction: TransferDirection,
  slot: keyof TransferSemanticClassNames,
): string | undefined {
  const scoped = classNamesMap?.[sectionKey(direction)]
  if (scoped && typeof scoped === 'object' && slot in scoped) {
    return scoped[slot as keyof typeof scoped]
  }
  const value = classNamesMap?.[slot]
  return typeof value === 'string' ? value : undefined
}

function sectionStyle(
  stylesMap: TransferSemanticStyles | undefined,
  direction: TransferDirection,
  slot: keyof TransferSemanticStyles,
): JSX.CSSProperties | undefined {
  const scoped = stylesMap?.[sectionKey(direction)]
  if (scoped && typeof scoped === 'object' && slot in scoped) {
    return scoped[slot as keyof typeof scoped]
  }
  const value = stylesMap?.[slot]
  return value && typeof value === 'object' ? value : undefined
}

function resolveItemKey<RecordType extends TransferItem>(
  item: RecordType,
  rowKey?: (record: RecordType) => TransferKey,
): TransferKey {
  const key = rowKey?.(item) ?? item.key
  return key ?? ''
}

function resolveRenderContent<RecordType extends TransferItem>(
  item: RecordType,
  render?: (item: RecordType) => TransferRenderResult,
): { label: JSX.Element; value: string } {
  const rendered = render?.(item)
  if (isRenderObject(rendered)) return rendered
  if (rendered !== undefined && rendered !== null) {
    return { label: rendered, value: textFromElement(rendered) }
  }
  return {
    label: item.title,
    value: textFromElement(item.title ?? item.description),
  }
}

function TransferSearch(props: TransferSearchProps) {
  const [local, rest] = splitProps(props, ['onChange'])
  return (
    <input
      {...rest}
      onInput={(event) => {
        local.onChange?.(event.currentTarget.value)
      }}
    />
  )
}

function TransferOperation(props: TransferOperationProps) {
  const [local, rest] = splitProps(props, ['direction', 'children', 'aria-label'])
  return (
    <button
      {...rest}
      type={rest.type ?? 'button'}
      aria-label={local['aria-label'] ?? textFromElement(local.children)}
    >
      {local.children}
    </button>
  )
}

function TransferList<RecordType extends TransferItem>(props: TransferListProps<RecordType>) {
  const prefixCls = () => props.prefixCls ?? 'ant-transfer'
  const items = () => props.filteredItems ?? props.items

  return (
    <ul
      role="listbox"
      class={classNames(
        `${prefixCls()}-list`,
        sectionClass(props.classNames, props.direction, 'list'),
      )}
      style={sectionStyle(props.styles, props.direction, 'list')}
      aria-label={props.direction === 'left' ? 'source' : 'target'}
      onScroll={(event) => props.onScroll?.(event)}
    >
      <For each={items()}>
        {(item) => {
          const key = () => resolveItemKey(item)
          const content = createMemo(() => resolveRenderContent(item, props.render))
          const selected = () => includesKey(props.selectedKeys, key())
          const itemDisabled = () => Boolean(props.disabled || item.disabled)

          return (
            <li
              role="option"
              data-direction={props.direction}
              aria-selected={selected()}
              aria-disabled={itemDisabled()}
              class={classNames(
                `${prefixCls()}-item`,
                selected() && `${prefixCls()}-item-selected`,
                itemDisabled() && `${prefixCls()}-item-disabled`,
                sectionClass(props.classNames, props.direction, 'item'),
              )}
              style={sectionStyle(props.styles, props.direction, 'item')}
              onClick={() => {
                if (itemDisabled()) return
                props.onItemSelect(key(), !selected())
              }}
            >
              <span
                class={classNames(
                  `${prefixCls()}-item-title`,
                  sectionClass(props.classNames, props.direction, 'itemContent'),
                )}
                style={sectionStyle(props.styles, props.direction, 'itemContent')}
              >
                {content().label}
              </span>
              {item.description && (
                <span class={`${prefixCls()}-item-description`}>{item.description}</span>
              )}
            </li>
          )
        }}
      </For>
    </ul>
  )
}

function getPaginationPageSize(pagination: TransferProps['pagination']): number {
  if (!pagination) return Number.POSITIVE_INFINITY
  if (typeof pagination === 'object' && pagination.pageSize) return pagination.pageSize
  return DEFAULT_PAGE_SIZE
}

function TransferRoot<RecordType extends TransferItem = TransferItem>(
  props: TransferProps<RecordType>,
) {
  const [local, rest] = splitProps(props, [
    'dataSource',
    'targetKeys',
    'defaultTargetKeys',
    'selectedKeys',
    'defaultSelectedKeys',
    'disabled',
    'showSearch',
    'titles',
    'operations',
    'actions',
    'render',
    'filterOption',
    'prefixCls',
    'listStyle',
    'operationStyle',
    'classNames',
    'styles',
    'locale',
    'footer',
    'rowKey',
    'children',
    'showSelectAll',
    'selectAllLabels',
    'oneWay',
    'pagination',
    'status',
    'selectionsIcon',
    'class',
    'style',
    'onChange',
    'onSelectChange',
    'onSearch',
    'onScroll',
  ])
  const config = useConfig()
  const prefixCls = () => local.prefixCls ?? `${config.prefixCls()}-transfer`
  const [, hashId] = useTransferStyle(prefixCls())
  const [innerTargetKeys, setInnerTargetKeys] = createSignal<TransferKey[]>(
    local.defaultTargetKeys ?? [],
  )
  const [innerSelectedKeys, setInnerSelectedKeys] = createSignal<TransferKey[]>(
    local.defaultSelectedKeys ?? [],
  )
  const searchConfig = () => (typeof local.showSearch === 'object' ? local.showSearch : undefined)
  const [sourceSearch, setSourceSearch] = createSignal(searchConfig()?.defaultValue ?? '')
  const [targetSearch, setTargetSearch] = createSignal(searchConfig()?.defaultValue ?? '')

  const disabled = () => Boolean(local.disabled)
  const dataSource = () => local.dataSource ?? []
  const itemKey = (item: RecordType) => resolveItemKey(item, local.rowKey)
  const targetKeys = () => (local.targetKeys !== undefined ? local.targetKeys : innerTargetKeys())
  const selectedKeys = () =>
    local.selectedKeys !== undefined ? local.selectedKeys : innerSelectedKeys()
  const sourceItems = createMemo(() =>
    dataSource().filter((item) => !includesKey(targetKeys(), itemKey(item))),
  )
  const targetItems = createMemo(() =>
    dataSource().filter((item) => includesKey(targetKeys(), itemKey(item))),
  )
  const sourceSelectedKeys = () =>
    selectedKeys().filter((key) => sourceItems().some((item) => itemKey(item) === key))
  const targetSelectedKeys = () =>
    selectedKeys().filter((key) => targetItems().some((item) => itemKey(item) === key))
  const operationItems = () => local.actions ?? local.operations

  function filterItems(
    items: RecordType[],
    inputValue: string,
    direction: TransferDirection,
  ): RecordType[] {
    if (!inputValue) return items
    const filter = local.filterOption ?? defaultFilter
    return items.filter((item) => filter(inputValue, item, direction))
  }

  const filteredSourceItems = createMemo(() => filterItems(sourceItems(), sourceSearch(), 'left'))
  const filteredTargetItems = createMemo(() => filterItems(targetItems(), targetSearch(), 'right'))

  function setTargetKeys(
    nextTargetKeys: TransferKey[],
    direction: TransferDirection,
    moveKeys: TransferKey[],
  ) {
    if (local.targetKeys === undefined) setInnerTargetKeys(nextTargetKeys)
    local.onChange?.(nextTargetKeys, direction, moveKeys)
  }

  function setSelectedKeys(nextSelectedKeys: TransferKey[]) {
    if (local.selectedKeys === undefined) setInnerSelectedKeys(nextSelectedKeys)
    const source = nextSelectedKeys.filter((key) =>
      sourceItems().some((item) => itemKey(item) === key),
    )
    const target = nextSelectedKeys.filter((key) =>
      targetItems().some((item) => itemKey(item) === key),
    )
    local.onSelectChange?.(source, target)
  }

  function selectKey(key: TransferKey, selected: boolean): void {
    if (disabled()) return
    const current = selectedKeys()
    const next = selected
      ? includesKey(current, key)
        ? current
        : [...current, key]
      : current.filter((selectedKey) => selectedKey !== key)
    setSelectedKeys(next)
  }

  function selectAll(keys: TransferKey[], selected: boolean): void {
    if (disabled()) return
    const current = selectedKeys()
    const next = selected
      ? [...current, ...keys.filter((key) => !includesKey(current, key))]
      : current.filter((key) => !includesKey(keys, key))
    setSelectedKeys(next)
  }

  function move(direction: TransferDirection): void {
    if (disabled()) return
    const movingFromSource = direction === 'right'
    const availableItems = movingFromSource ? sourceItems() : targetItems()
    const moveKeys = (movingFromSource ? sourceSelectedKeys() : targetSelectedKeys()).filter(
      (key) => !availableItems.find((item) => itemKey(item) === key)?.disabled,
    )
    if (!moveKeys.length) return

    const nextTargetKeys = movingFromSource
      ? [...targetKeys(), ...moveKeys.filter((key) => !includesKey(targetKeys(), key))]
      : targetKeys().filter((key) => !includesKey(moveKeys, key))
    setTargetKeys(nextTargetKeys, direction, moveKeys)
    setSelectedKeys(selectedKeys().filter((key) => !includesKey(moveKeys, key)))
  }

  function renderSelectAll(
    direction: TransferDirection,
    items: RecordType[],
    pageItems: RecordType[],
  ) {
    const keys = () => pageItems.filter((item) => !item.disabled).map((item) => itemKey(item))
    const selectedCount = () => keys().filter((key) => includesKey(selectedKeys(), key)).length
    const allSelected = () => keys().length > 0 && selectedCount() === keys().length
    const label = () => {
      const configured = local.selectAllLabels?.[direction === 'left' ? 0 : 1]
      const info = { selectedCount: selectedCount(), totalCount: keys().length }
      if (typeof configured === 'function') return configured(info)
      return configured ?? `${selectedCount()}/${keys().length}`
    }

    return (
      <Show when={local.showSelectAll !== false}>
        <label class={`${prefixCls()}-select-all`}>
          <input
            type="checkbox"
            checked={allSelected()}
            disabled={disabled() || !keys().length}
            onChange={(event) => selectAll(keys(), event.currentTarget.checked)}
          />
          {local.selectionsIcon && (
            <span class={`${prefixCls()}-select-all-icon`}>{local.selectionsIcon}</span>
          )}
          <span>{label()}</span>
          <span class={`${prefixCls()}-select-all-total`}>
            {items.length}{' '}
            {items.length === 1
              ? (local.locale?.itemUnit ?? 'item')
              : (local.locale?.itemsUnit ?? 'items')}
          </span>
        </label>
      </Show>
    )
  }

  function renderPanel(direction: TransferDirection) {
    const isSource = direction === 'left'
    const allItems = () => (isSource ? filteredSourceItems() : filteredTargetItems())
    const pageSize = () => getPaginationPageSize(local.pagination)
    const items = () => allItems().slice(0, pageSize())
    const title = () =>
      local.titles?.[isSource ? 0 : 1] ??
      local.locale?.titles?.[isSource ? 0 : 1] ??
      (isSource ? 'Source' : 'Target')
    const search = () => (isSource ? sourceSearch() : targetSearch())
    const setSearch = (value: string) => {
      if (isSource) setSourceSearch(value)
      else setTargetSearch(value)
      local.onSearch?.(direction, value)
    }
    const listStyle =
      typeof local.listStyle === 'function' ? local.listStyle({ direction }) : local.listStyle
    const panelProps: TransferListProps<RecordType> = {
      direction,
      items: isSource ? sourceItems() : targetItems(),
      filteredItems: items(),
      selectedKeys: selectedKeys(),
      disabled: disabled(),
      prefixCls: prefixCls(),
      classNames: local.classNames,
      styles: local.styles,
      render: local.render,
      onItemSelect: selectKey,
      onScroll: (event) => local.onScroll?.(direction, event),
    }
    const customListProps: TransferCustomListBodyProps<RecordType> = {
      direction,
      items: isSource ? sourceItems() : targetItems(),
      filteredItems: items(),
      selectedKeys: selectedKeys(),
      disabled: disabled(),
      onItemSelect: selectKey,
      onItemSelectAll: selectAll,
    }

    return (
      <div
        class={classNames(
          `${prefixCls()}-panel`,
          sectionClass(local.classNames, direction, 'section'),
        )}
        data-direction={direction}
        style={mergeStyles(sectionStyle(local.styles, direction, 'section'), listStyle)}
      >
        <div
          class={classNames(
            `${prefixCls()}-header`,
            sectionClass(local.classNames, direction, 'header'),
          )}
          style={sectionStyle(local.styles, direction, 'header')}
        >
          <span
            class={classNames(
              `${prefixCls()}-title`,
              sectionClass(local.classNames, direction, 'title'),
            )}
            style={sectionStyle(local.styles, direction, 'title')}
          >
            {title()}
          </span>
        </div>
        {local.showSearch && (
          <TransferSearch
            class={classNames(
              `${prefixCls()}-search`,
              sectionClass(local.classNames, direction, 'body'),
            )}
            placeholder={
              searchConfig()?.placeholder ??
              local.locale?.searchPlaceholder ??
              `Search ${isSource ? 'source' : 'target'}`
            }
            disabled={disabled()}
            value={search()}
            onChange={setSearch}
          />
        )}
        {renderSelectAll(direction, allItems(), items())}
        {local.children ? local.children(customListProps) : <TransferList {...panelProps} />}
        <Show when={!items().length}>
          <div class={`${prefixCls()}-empty`}>
            {Array.isArray(local.locale?.notFoundContent)
              ? local.locale?.notFoundContent[isSource ? 0 : 1]
              : (local.locale?.notFoundContent ?? 'Not Found')}
          </div>
        </Show>
        {local.footer && (
          <div
            class={classNames(
              `${prefixCls()}-footer`,
              sectionClass(local.classNames, direction, 'footer'),
            )}
            style={sectionStyle(local.styles, direction, 'footer')}
          >
            {local.footer(panelProps, { direction })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      {...rest}
      class={classNames(
        prefixCls(),
        disabled() && `${prefixCls()}-disabled`,
        local.status && `${prefixCls()}-status-${local.status}`,
        hashId(),
        local.classNames?.root,
        local.class,
      )}
      style={mergeStyles(local.styles?.root, local.style)}
    >
      {renderPanel('left')}
      <div
        class={classNames(`${prefixCls()}-operations`, local.classNames?.actions)}
        style={mergeStyles(local.styles?.actions, local.operationStyle)}
      >
        <TransferOperation
          aria-label="move selected right"
          class={`${prefixCls()}-operation`}
          style={local.operationStyle}
          disabled={disabled() || !sourceSelectedKeys().length}
          onClick={() => move('right')}
          direction="right"
        >
          {operationItems()?.[0] ?? <RightOutlined />}
        </TransferOperation>
        <Show when={!local.oneWay}>
          <TransferOperation
            aria-label="move selected left"
            class={`${prefixCls()}-operation`}
            style={local.operationStyle}
            disabled={disabled() || !targetSelectedKeys().length}
            onClick={() => move('left')}
            direction="left"
          >
            {operationItems()?.[1] ?? <LeftOutlined />}
          </TransferOperation>
        </Show>
      </div>
      {renderPanel('right')}
    </div>
  )
}

export const Transfer = Object.assign(TransferRoot, {
  List: TransferList,
  Search: TransferSearch,
  Operation: TransferOperation,
})
